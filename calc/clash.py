"""Collision (interference) search over the kart's design geometry.

Reads docs/data/design.json (written by calc/design.py), turns every frame tube and item into the
same solid the 3D viewer draws (docs/viewer/model.js, buildRider in the same file), and reports
every pair of bodies that comes closer than a limit, for each configuration and for the front
wheels at straight ahead and at +- the full steering lock.

    python calc/clash.py                       # report, limit 5 mm, lock 30 degrees
    python calc/clash.py --limit 0.005 --steer 30
    python calc/clash.py --configs summer      # one configuration

    from clash import find, summary
    clashes = find(design, configs=("summer", "winter"), limit=0.005, steer_deg=30.0)

Axes: x forward, y left, z up, in metres; origin on the ground under the rear axle centre.
The exit status is always 0: this is a report.

Method. A body is a cloud of points on its surface (about 6 mm apart) or, for tubes, rods and
limbs, points on its axis with a radius (a capsule; exact and cheap). The gap of two bodies is the
smallest point-to-point distance (scipy cKDTree) minus the radii; where a body is made of convex
solids (box, cylinder, capsule, tyre) the other body's points are also tested against them, so a
negative gap is the depth of the deepest sample point inside the solid (interpenetration).
Expect the gap to be right to a few mm; thin shells (sheets, fenders, skis) carry no inside test.

Steering. The front wheels, the front brake drums, the spindles and the skis turn about the vertical
kingpin axis of their side; the handlebar, stem arm, lever, mirrors, gauge and head lamp turn with the
stem about its raked axis by the same angle; each tie rod runs from the stem foot (turned with the
stem) to the spindle's steering arm (turned with the spindle). The fenders stay fixed.

Front suspension (D-041). design.json's front_suspension holds the hard points of the double A-arms;
calc/front.py moves them. Items and members marked front_arm "l" or "r" move with that side's knuckle,
or with its lower or upper arm when marked front_link; one side at a time and both together, at +bump
and -droop, straight and at +-lock. The bar turns the stem by the lock angle;
each knuckle then turns about its own kingpin as far as its tie rod makes it (so the wheels' angles
differ, as built). Tie rods run from the stem's plate to the knuckles' arms; front shocks move their
lower eye (pos) with the lower arm.
"""
import argparse
import json
import math
import sys
import time
from pathlib import Path

import numpy as np
from scipy.spatial import cKDTree

sys.path.insert(0, str(Path(__file__).resolve().parent))
import front as FRONT_KIN   # noqa: E402

ROOT = Path(__file__).resolve().parents[1]
SRC = ROOT / "docs" / "data" / "design.json"

SPACING = 0.006        # surface sample spacing (m)
AXIS_STEP = 0.004      # sample spacing along an axis (capsules)
JOINT_TOL = 0.002      # two tube ends this close share a joint
MOUNT_RANGE = 0.05     # a bolted-on part must lie within this of its mount

# Drawing constants of the viewer (ILLUSTRATIVE in docs/viewer/model.js)
LUG_HEIGHT, LUG_FRAC = 0.011, 0.4            # tyre lugs stand 0.4 * 0.011 above the carcass radius, half a lug high
MANNEQUIN = dict(trunk=0.30, foot=0.152, upperArm=0.186, foreArm=0.146, hand=0.05, hipHalf=0.05,
                 shoulderHalf=0.115, lean=10.0, leg=0.245)
RIDER_R = dict(thigh=0.06, shin=0.045, foot=0.04, torso=0.14, arm=0.04)   # radii given for the check

# ---------------------------------------------------------------- the allowance table
# Every pair of bodies in contact that is not a clash. Printed by the CLI so it can be reviewed.
# Wheel/tyre pairs are NOT allowed with anything but hub, chains, brake drum and the stub axle that
# replaces the front hub; a wheel and its own fender are deliberately still checked (see A15).
ALLOWANCES = [
    ("A1 tube joint", "frame tubes that share an end (2 mm), or whose end lies inside the other tube (weld joint)"),
    ("A2 plate on frame", "plates and sheets of parts frame and sled_pan on any frame tube; footrests plates on footrests tubes; sled_pan parts among themselves"),
    ("A3 bearing", "axle_bearings (pillow blocks) with the axle and with their frame plate"),
    ("A4 on the axle", "axle_shaft with the rear hubs, with the sprockets on it, with the brake disc, and through the hub with the rear wheel"),
    ("A5 hub in wheel", "a hub with the wheel on the same side"),
    ("A6 snow chains", "snow_chains with the wheel on the same side"),
    ("A7 brake", "the caliper with the brake disc"),
    ("A8 engine unit", "scooter_unit with its frame plate, with the sprocket on its output, with the saddle on top"),
    ("A9 final chain", "the chain with its own two sprockets (and nothing else)"),
    ("A10 footboards", "footrests plates with footrests tubes; the child steps with the footboards"),
    ("A11 bolted on", "lamp, mirror, plate_number, box (horn, battery), gauge, lever, caliper, guard and the kingpin: contact with the one body nearest to them (frame tube, plate, bar, stem, saddle, engine unit, axle) is allowed if within 50 mm; the mount is printed"),
    ("A12 ski", "a ski with the spindle on the same side"),
    ("A13 front drum and stub", "front brake drum with the front wheel and the spindle stub axle on its side; the stub axle (and web) with the front wheel"),
    ("A14 fender", "fenders with any frame tube (fixed to the frame)"),
    ("A15 NOT allowed", "wheel with its own fender is still checked (a fender must clear the tyre; a front fender marked steers turns with the knuckle)"),
    ("A16 steering", "handlebar with the stem tube; stem tube with its flange bearings; flange bearings with frame tubes; the pitman arm (items of type arm, part handlebar) with the stem tube and with each other (bolted, welded); tie rods with the pitman arm near their inner end (50 mm) and with the spindle steering arm on their side, and with each other where both start at the same point on the drop arm"),
    ("A22 seat", "the saddle with the frame tubes it rests on (the upper and seat rails)"),
    ("A17 rider", "any rider part with the saddle, or with anything under the saddle's footprint, which the saddle covers; foot and shin with footrests plates and tubes; arms with the handlebar (grips) and the brake levers (fingers rest on them)"),
    ("A19 joints", "any contact whose two closest points both lie in one design.json joint sphere (pivot sleeves, posts through the tube, welded clusters), between bodies that move together, or where one is a pivot (the swing arm's sleeves, the kingpin); a joint with arm:true turns with the swing arm (K-020: a sphere had hidden the arm's brace meeting a rising tube)"),
    ("A20 axle covers", "guards items of type cyl with the axle_shaft (they are covers round it)"),
    ("A21 kingpin", "a kingpin with every frame tube that has an end within 30 mm of the kingpin axis (beam and brace end at the boss)"),
    ("A18 shock eyes", "a rear shock eye with the one member or item nearest to it (within 30 mm, straight ahead)"),
]

MOUNTED = {"lamp", "mirror", "plate_number", "box", "gauge", "lever", "caliper", "guard"}
# bodies a bolted-on part may be mounted on
MOUNT_TYPES = {"plate", "sheet", "handlebar", "saddle", "scooter_unit", "cyl"}


# ---------------------------------------------------------------- small geometry
def unit(v):
    v = np.asarray(v, float)
    return v / np.linalg.norm(v)


def frame(axis):
    """Rotation matrix whose third column is the given axis (the local z of a cylinder or capsule)."""
    z = unit(axis)
    t = np.array([1.0, 0, 0]) if abs(z[0]) < 0.9 else np.array([0, 1.0, 0])
    x = unit(np.cross(t, z))
    return np.column_stack([x, np.cross(z, x), z])


def rot_z(a):
    c, s = math.cos(a), math.sin(a)
    return np.array([[c, -s, 0], [s, c, 0], [0, 0, 1.0]])


def rot_axis(u, a):
    u = unit(u)
    K = np.array([[0, -u[2], u[1]], [u[2], 0, -u[0]], [-u[1], u[0], 0]])
    return np.eye(3) * math.cos(a) + math.sin(a) * K + (1 - math.cos(a)) * np.outer(u, u)


def seg_dist(P, A, B):
    """Distance from points P (n,2) to the segments A[i]-B[i]; returns (n,) minimum."""
    best = np.full(len(P), np.inf)
    for a, b in zip(A, B):
        ab = b - a
        t = np.clip(((P - a) @ ab) / (ab @ ab + 1e-18), 0, 1)
        best = np.minimum(best, np.linalg.norm(P - (a + t[:, None] * ab), axis=1))
    return best


# ---------------------------------------------------------------- solids with a signed distance
class Prim:
    """A convex solid: box (h = half sizes), cyl (r, h = half length), cap (capsule), tyre.
    The local frame is c + R @ local; a cylinder or capsule runs along local z."""

    def __init__(self, kind, c, R, h=None, r=0.0, tyre=None):
        self.kind, self.c, self.R, self.h, self.r, self.tyre = kind, np.asarray(c, float), R, h, r, tyre

    def moved(self, Rt, piv, d=0.0):
        return Prim(self.kind, Rt @ (self.c - piv) + piv + d, Rt @ self.R, self.h, self.r, self.tyre)

    def sdf(self, P):
        q = (P - self.c) @ self.R
        if self.kind == "box":
            d = np.abs(q) - self.h
            return np.linalg.norm(np.maximum(d, 0), axis=1) + np.minimum(d.max(axis=1), 0)
        if self.kind == "cyl":
            dr = np.hypot(q[:, 0], q[:, 1]) - self.r
            dz = np.abs(q[:, 2]) - self.h
            return np.hypot(np.maximum(dr, 0), np.maximum(dz, 0)) + np.minimum(np.maximum(dr, dz), 0)
        if self.kind == "cap":
            qz = np.clip(q[:, 2], -self.h, self.h)
            return np.sqrt(q[:, 0] ** 2 + q[:, 1] ** 2 + (q[:, 2] - qz) ** 2) - self.r
        t = self.tyre   # revolved section (rho, |z|) with a polyline boundary
        rho, z = np.hypot(q[:, 0], q[:, 1]), np.abs(q[:, 2])
        inside = (rho >= t["rin"]) & (rho <= t["rout"]) & (z <= np.interp(rho, t["rho"], t["z"]))
        d = seg_dist(np.column_stack([rho, z]), t["A"], t["B"])
        return np.where(inside, -d, d)


class Body:
    def __init__(self, kind, part, typ, idx, sub="", rider=None, item=None, side=0):
        self.kind, self.part, self.typ, self.idx, self.sub, self.rider, self.item, self.side = kind, part, typ, idx, sub, rider, item, side
        self.parts = []      # [(radius, points)]
        self.prims = []
        self.steer = None    # None, ("king", side) or ("stem",)
        self.arm = False     # turns with the swing arm
        self.farm = None     # "l" or "r": moves with that front corner
        self.flink = None    # None (the knuckle), "lower" or "upper": which part of the corner
        self.ends = None     # tie rod: (inner end, outer end)
        self.member = None
        self._trees = None
        self._bb = None

    # -- build
    def surface(self, pts):
        self.parts.append((0.0, np.asarray(pts, float).reshape(-1, 3)))

    def axis(self, pts, r):
        self.parts.append((round(float(r), 6), np.asarray(pts, float).reshape(-1, 3)))

    def box(self, c, size, R=None):
        R = np.eye(3) if R is None else R
        h = np.asarray(size, float) / 2
        pts = []
        for i in range(3):
            j, k = [a for a in range(3) if a != i]
            u, v = np.meshgrid(np.linspace(-h[j], h[j], max(2, math.ceil(2 * h[j] / SPACING) + 1)),
                               np.linspace(-h[k], h[k], max(2, math.ceil(2 * h[k] / SPACING) + 1)))
            for s in (-1, 1):
                loc = np.zeros((u.size, 3))
                loc[:, i], loc[:, j], loc[:, k] = s * h[i], u.ravel(), v.ravel()
                pts.append(loc)
        self.surface(np.asarray(c, float) + np.vstack(pts) @ R.T)
        self.prims.append(Prim("box", c, R, h))

    def lathe(self, c, R, segs):
        """Surface of revolution about local z: segs are ((rho0, z0), (rho1, z1)) pairs."""
        out = []
        for (r0, z0), (r1, z1) in segs:
            n = max(1, math.ceil(math.hypot(r1 - r0, z1 - z0) / SPACING))
            for t in np.linspace(0, 1, n + 1):
                rho, z = r0 + (r1 - r0) * t, z0 + (z1 - z0) * t
                m = 1 if rho < 1e-9 else max(8, math.ceil(2 * math.pi * rho / SPACING))
                a = np.arange(m) * 2 * math.pi / m
                out.append(np.column_stack([rho * np.cos(a), rho * np.sin(a), np.full(m, z)]))
        self.surface(np.asarray(c, float) + np.vstack(out) @ R.T)

    def cyl(self, a, b, r):
        a, b = np.asarray(a, float), np.asarray(b, float)
        c, hl, R = (a + b) / 2, np.linalg.norm(b - a) / 2, frame(b - a)
        self.lathe(c, R, [((r, -hl), (r, hl)), ((0, hl), (r, hl)), ((0, -hl), (r, -hl))])
        self.prims.append(Prim("cyl", c, R, hl, r))

    def cyl_c(self, c, axis, r, length):
        c, ax = np.asarray(c, float), unit(axis)
        self.cyl(c - ax * length / 2, c + ax * length / 2, r)

    def cap(self, a, b, r):
        a, b = np.asarray(a, float), np.asarray(b, float)
        n = max(1, math.ceil(np.linalg.norm(b - a) / AXIS_STEP))
        self.axis(a + np.outer(np.linspace(0, 1, n + 1), b - a), r)
        d = np.linalg.norm(b - a)
        self.prims.append(Prim("cap", (a + b) / 2, frame(b - a if d > 1e-12 else [0, 0, 1]), d / 2, r))

    def finish(self):
        merged = {}
        for r, p in self.parts:
            merged.setdefault(r, []).append(p)
        self.parts = [(r, np.vstack(v)) for r, v in merged.items()]
        self._bb = None
        self._trees = None
        return self

    # -- use
    def moved(self, Rt, piv, d=0.0):
        """Rigid motion p -> Rt (p - piv) + piv + d."""
        b = Body(self.kind, self.part, self.typ, self.idx, self.sub, self.rider, self.item, self.side)
        b.parts = [(r, (p - piv) @ Rt.T + piv + d) for r, p in self.parts]
        b.prims = [p.moved(Rt, piv, d) for p in self.prims]
        b.steer, b.member, b.arm, b.farm, b.flink, b.ends = self.steer, self.member, self.arm, self.farm, self.flink, self.ends
        if b.member is not None:
            b.member = tuple((Rt @ (np.asarray(e) - piv) + piv + d) for e in b.member)
        return b

    def move(self, mv):
        return self.moved(mv.R, mv.c, mv.d)

    def trees(self):
        if self._trees is None:
            self._trees = [(r, p, cKDTree(p)) for r, p in self.parts]
        return self._trees

    def bbox(self):
        if self._bb is None:
            lo = np.min([p.min(axis=0) - r for r, p in self.parts], axis=0)
            hi = np.max([p.max(axis=0) + r for r, p in self.parts], axis=0)
            self._bb = (lo, hi)
        return self._bb

    def sdf(self, P):
        return np.min([p.sdf(P) for p in self.prims], axis=0)

    def key(self):
        return (self.kind, self.idx, self.sub)

    def label(self):
        s = f"{self.part}/{self.typ}"
        if self.kind != "rider":
            s += f"#{self.idx}"
        if self.sub:
            s += f".{self.sub}"
        if self.rider and self.kind != "rider":
            s += f"[{self.rider}]"
        return s

    def info(self):
        return {"part": self.part, "type": self.typ, "index": self.idx, "kind": self.kind,
                "sub": self.sub, "rider": self.rider, "label": self.label()}


# ---------------------------------------------------------------- item -> body (as model.js builds them)
def dir_of(facing):
    s = -1.0 if facing[0] == "-" else 1.0
    return np.array([s if facing[1] == "x" else 0, s if facing[1] == "y" else 0, s if facing[1] == "z" else 0], float)


Y_AX = np.array([0, 1.0, 0])
SIDE = lambda p: 1 if p[1] >= 0 else -1


def add_tyre(b, it, hub_d):
    """Tyre, rim and centre disc of a wheel (wheelItem): lathe about the y axis through pos."""
    R, W, Rr = it["od"] / 2, it["width"], it["rim"] / 2
    h, s = W / 2, SIDE(it["pos"])
    Rl = R + LUG_FRAC * LUG_HEIGHT          # lugs raise the tread
    up = [(Rr - 0.002, 0.9 * h), (Rr + 0.008, 0.9 * h), (Rr + 0.012, 0.93 * h), (Rr + (R - Rr) * 0.22, h),
          (Rr + (R - Rr) * 0.55, 0.98 * h), (R - 0.026, 0.9 * h), (R - 0.012, 0.83 * h), (Rl, 0.83 * h)]
    segs = list(zip(up[:-1], up[1:]))
    segs += [(up[-1], (Rl, -up[-1][1]))]
    segs += [((r0, -z0), (r1, -z1)) for (r0, z0), (r1, z1) in segs[:len(up) - 1]]
    segs += [((Rr - 0.002, 0.9 * h), (Rr - 0.002, -0.9 * h))]
    c, Rm = np.asarray(it["pos"], float), frame(Y_AX)
    b.lathe(c, Rm, segs)
    bnd = list(zip(up[:-1], up[1:])) + [(up[-1], (Rl, 0.0)), ((Rr - 0.002, 0.0), up[0])]
    tyre = dict(rho=np.array([p[0] for p in up]), z=np.array([p[1] for p in up]), rin=Rr - 0.002, rout=Rl,
                A=np.array([a for a, _ in bnd]), B=np.array([e for _, e in bnd]))
    b.prims.append(Prim("tyre", c, Rm, tyre=tyre))
    b.cyl_c(c, Y_AX, Rr - 0.004, 0.006)                                  # centre disc
    b.cyl_c(c + [0, s * 0.007, 0], Y_AX, hub_d * 0.42, 0.016)             # boss


def add_chain_loop(b, it, items):
    """Roller chain (chainItem): closed path round the two sprocket pitch circles, three rows across."""
    c1, c2, r1, r2, y = np.array([it["pos"][0], it["pos"][2]]), np.array([it["to"][0], it["to"][2]]), it["r1"], it["r2"], it["pos"][1]
    L = np.linalg.norm(c2 - c1)
    ang, phi = math.atan2(c2[1] - c1[1], c2[0] - c1[0]), math.acos((r1 - r2) / L)
    a1, a2 = ang + phi, ang - phi
    P = lambda c, r, a: c + r * np.array([np.cos(a), np.sin(a)])
    pts = []

    def seg(p, q):
        n = max(1, math.ceil(np.linalg.norm(q - p) / AXIS_STEP))
        pts.extend(p + (q - p) * i / n for i in range(n))

    def arc(c, r, t0, t1):
        n = max(6, math.ceil(abs(t1 - t0) * r / AXIS_STEP))
        pts.extend(P(c, r, t0 + (t1 - t0) * i / n) for i in range(n))
    seg(P(c1, r1, a2), P(c2, r2, a2)); arc(c2, r2, a2, a1); seg(P(c2, r2, a1), P(c1, r1, a1)); arc(c1, r1, a1, a2 + 2 * math.pi)
    xz = np.array(pts)
    for dy in (-0.0015, 0.0, 0.0015):
        b.axis(np.column_stack([xz[:, 0], np.full(len(xz), y + dy), xz[:, 1]]), 0.004)   # roller radius ~0.31 pitch


def scooter_body(b, it, items):
    """Scooter engine unit (scooterItem), local to pos."""
    pos = np.asarray(it["pos"], float)
    L, W, H = it["length"], it["width"], it["height"]
    out = np.asarray(it["out"], float) - pos
    front = -1 if it["cylinder"].startswith("-") else 1
    xf = front * L / 2
    xr = -xf
    A = lambda x, y, z: pos + np.array([x, y, z])
    b.box(A(0, -W * 0.06, 0.006), [L * 0.92, W * 0.78, 0.012])
    gy = -W / 2 + W * 0.25
    b.cyl_c(A(out[0], gy, out[2]), Y_AX, 0.075, W * 0.5)
    b.box(A(out[0], gy, out[2] - 0.05), [0.1, W * 0.5, 0.14])
    b.cyl_c(A(out[0], -W / 2 + 0.006, out[2]), Y_AX, 0.045, 0.012)
    sp = next((o for o in items if o["type"] == "sprocket" and abs(o["pos"][0] - it["out"][0]) < 0.002 and abs(o["pos"][2] - it["out"][2]) < 0.002), None)
    y_end = sp["pos"][1] - pos[1] - sp["t"] if sp else out[1] - 0.02
    b.cyl_c(A(out[0], (y_end + out[1]) / 2, out[2]), Y_AX, 0.0095, abs(y_end - out[1]) + 0.01)
    cvt_y, x0, x1 = W / 2 - 0.045, out[0], front * L * 0.12
    xa, xb, r1, r2 = min(x0, x1), max(x0, x1), 0.07, 0.088
    b.box(A((xa + xb) / 2, cvt_y, out[2] - 0.01), [xb - xa, 0.09, 0.13])
    b.cyl_c(A(x0, cvt_y, out[2]), Y_AX, r1 + 0.01, 0.09)
    b.cyl_c(A(x1, cvt_y, out[2] + 0.005), Y_AX, r2, 0.09)
    b.box(A(front * L * 0.06, -W * 0.05, 0.115), [L * 0.3, W * 0.5, 0.2])
    cz, cy0, cx0, cyl_end = 0.11, -W * 0.05, front * L * 0.2, xf - front * 0.045
    b.cyl(A(cx0, cy0, cz), A(cyl_end, cy0, cz), 0.034)
    for i in range(9):
        b.cyl_c(A(cx0 + (cyl_end - cx0) * (i + 0.5) / 9, cy0, cz), [1, 0, 0], 0.056, 0.0045)
    b.box(A(xf - front * 0.03, cy0, cz), [0.06, 0.1, 0.11])
    b.box(A(xf - front * 0.01, cy0, cz + 0.005), [0.04, 0.09, 0.09])
    b.box(A(cx0 + (cyl_end - cx0) * 0.36, cy0, cz + 0.005), [abs(cyl_end - cx0) * 0.72, 0.14, 0.15])
    b.box(A(-front * L * 0.05, -W * 0.02, H - 0.05), [L * 0.3, W * 0.4, 0.1])
    b.cyl(A(front * L * 0.07, -W * 0.02, H - 0.06), A(xf - front * 0.04, cy0, cz + 0.06), 0.017)
    mz, my, mx0, mx1 = 0.052, -W * 0.28, xr + front * 0.03, front * L * 0.22
    b.cyl(A(xf - front * 0.02, cy0 - 0.03, cz - 0.045), A(mx1, my, mz), 0.012)
    b.cyl(A(mx1, my, mz), A(mx0, my, mz), 0.04)
    b.cyl(A(mx0, my, mz), A(mx0 - front * 0.03, my, mz), 0.017)
    for x in (mx1, mx0):
        b.cap(A(x, my, mz), A(x, my, mz), 0.04)
    b.cyl_c(A((mx0 + mx1) / 2, my, mz), [1, 0, 0], 0.046, abs(mx1 - mx0) * 0.6)   # heat shield (the viewer draws part of the arc)
    b.cyl_c(A(0, -W / 2 + 0.02, 0.09), Y_AX, 0.008, 0.03)


def build_item(i, it, items):
    """The bodies of one design item, mirroring buildItem in docs/viewer/model.js."""
    t, part = it["type"], it["part"]
    pos = np.asarray(it.get("pos", [0, 0, 0]), float)
    mk = lambda sub="", steer=None: _mk(i, it, sub, steer)
    bodies = []
    if t == "plate" or t == "caliper" or t == "plate_number":
        b = mk(); b.box(pos, it["size"]); bodies.append(b)
    elif t == "box":
        b = mk(); sx, sy, sz = it["size"]; b.box(pos, it["size"])
        if part == "horn":
            b.cyl_c(pos + [sx * 0.55, 0, 0], [1, 0, 0], sz * 0.5, sx * 0.9)   # the bell flares from 0.2 to 0.5 sz
        bodies.append(b)
    elif t == "cyl":
        b = mk(); b.cyl_c(pos, Y_AX, it["d"] / 2, it["l"]); bodies.append(b)
    elif t == "pillow":
        b = mk()
        M = np.diag([1.0, -1, -1]) if it.get("inverted") else np.eye(3)    # hung under a plate: base on top
        w, tb, Rd = it["bore"] * 1.55, it["h"] * 0.42, it["h2"] - it["h"]
        b.box(pos + M @ [0, 0, tb / 2], [it["l"], w, tb], M)
        b.box(pos + M @ [0, 0, tb * 0.5 + (it["h"] - tb * 0.5) / 2], [Rd * 2 * 0.95, w, it["h"] - tb * 0.5], M)
        b.cyl_c(pos + M @ [0, 0, it["h"]], Y_AX, Rd, w)
        bodies.append(b)
    elif t == "hub":
        b = mk(); s, r = SIDE(pos), it["d"] / 2
        b.cyl_c(pos, Y_AX, r, it["l"])
        b.cyl_c(pos + [0, s * (it["l"] / 2 - 0.004), 0], Y_AX, r * 1.55, 0.008)
        bodies.append(b)
    elif t == "wheel":
        b = mk(steer=("king", SIDE(pos)) if part == "front_wheels" else None)
        hub = next((o for o in items if o["type"] == "hub"), {"d": 0.07})
        add_tyre(b, it, hub["d"]); bodies.append(b)
    elif t == "chains":
        b = mk(); R, W = it["od"] / 2, it["width"]
        pts = []
        for k in range(15):                              # 15 rungs across the tread
            a = k / 15 * 2 * math.pi
            c = pos + [math.cos(a) * (R + 0.003), 0, math.sin(a) * (R + 0.003)]
            pts.append(c + np.outer(np.linspace(-W * 0.45, W * 0.45, math.ceil(W * 0.9 / AXIS_STEP) + 1), Y_AX))
        for sg in (-1, 1):                               # a side chain ring on each flank
            n = math.ceil(2 * math.pi * (R - 0.012) / AXIS_STEP)
            a = np.arange(n) * 2 * math.pi / n
            pts.append(pos + np.column_stack([(R - 0.012) * np.cos(a), np.full(n, sg * W * 0.46), (R - 0.012) * np.sin(a)]))
        b.axis(np.vstack(pts), 0.003); bodies.append(b)
    elif t == "disc":
        b = mk(steer=("king", SIDE(pos)) if part == "hand_brake" else None)
        b.cyl_c(pos, Y_AX, it["d"] / 2, it["t"]); b.cyl_c(pos + [0, -0.006, 0], Y_AX, it["d"] / 2 * 0.4, 0.014)
        bodies.append(b)
    elif t == "scooter_unit":
        b = mk(); scooter_body(b, it, items); bodies.append(b)
    elif t == "sprocket":
        b = mk(); pitch = it["pd"] * math.sin(math.pi / it["teeth"]); root = it["pd"] / 2 - 0.625 * pitch / 2
        b.cyl_c(pos, Y_AX, it["od"] / 2, it["t"]); b.cyl_c(pos, Y_AX, root * (0.26 if it["teeth"] >= 30 else 0.55), it["t"] * 2.2)
        bodies.append(b)
    elif t == "chain":
        b = mk(); add_chain_loop(b, it, items); bodies.append(b)
    elif t == "guard":
        b = mk(); sx, sy, sz = it["size"]; b.box(pos, it["size"])
        for sg in (-1, 1):
            b.box(pos + [0, 0, sg * sz / 2], [sx, 0.012, 0.012]); b.box(pos + [sg * sx / 2, 0, 0], [0.012, 0.012, sz])
        bodies.append(b)
    elif t == "spindle":
        s = it["side"]; k, w = pos, np.asarray(it["to"], float)
        rod = next((o for o in items if o["part"] == "tie_rods" and np.sign(o["to"][1]) == s), None)
        end = np.asarray(rod["to"], float) if rod else np.array([k[0] - it["arm"], k[1] - s * 0.02, k[2]])
        st = ("king", s)
        b = mk("kingpin", st)
        if "kp_lo" in it:                                # the kingpin between the arms' joints (D-041)
            lo_, hi_ = np.asarray(it["kp_lo"], float), np.asarray(it["kp_hi"], float)
            b.cyl(lo_ + 0.012 * unit(hi_ - lo_), hi_ - 0.012 * unit(hi_ - lo_), 0.0125)
            on_kp = lambda z: lo_ + (hi_ - lo_) * (z - lo_[2]) / (hi_[2] - lo_[2])
        else:
            b.cyl([k[0], k[1], w[2] - 0.032], [k[0], k[1], k[2] + 0.025], 0.0125)
            b.cyl([k[0], k[1], k[2] + 0.02], [k[0], k[1], k[2] + 0.045], 0.0065)
            b.cyl_c([k[0], k[1], k[2] + 0.045], [0, 0, 1], 0.01, 0.01)
            on_kp = lambda z: np.array([k[0], k[1], z])
        bodies.append(b)
        b = mk("stub", st)
        b.cyl([k[0], k[1], w[2]], w, 0.0125)
        b.box([k[0], k[1] + s * abs(w[1] - k[1]) * 0.3, w[2]], [0.04, abs(w[1] - k[1]) * 0.6, 0.02])
        bodies.append(b)
        b = mk("arm", st)
        root = on_kp(end[2])
        b.cyl(root, end, 0.0075)
        b.box(root - [0.015, 0, 0], [0.04, 0.035, 0.012])
        bodies.append(b)
    elif t == "rod":
        a, e = pos, np.asarray(it["to"], float)
        if part == "tie_rods":
            pass                                         # built for each steering angle (tie_rod_body)
        else:
            d = unit(e - a)
            b = mk("tube"); b.cyl(a, e, it["d"] / 2); bodies.append(b)
            b = mk("flange")
            spots = [np.asarray(q, float) for q in it["bearings"]] if "bearings" in it else \
                [a + (e - a) * (1 - tt) for tt in (0.12, 0.62)]
            for p in spots:                              # flange bearings on the frame
                b.box(p, [0.07, 0.07, 0.012], frame(d)); b.cyl_c(p, d, 0.02, 0.026)
            bodies.append(b)
    elif t == "arm":                                     # flat bar, width kept horizontal (as armItem in model.js)
        b = mk(steer=("stem",) if part == "handlebar" else None); e = np.asarray(it["to"], float)
        L = np.linalg.norm(e - pos); u = (e - pos) / L
        w = np.cross([0, 0, 1.0], u)
        if np.linalg.norm(w) < 0.2:
            w = Y_AX - (Y_AX @ u) * u
        w = unit(w)
        b.box((pos + e) / 2, [L, it["w"], it["t"]], np.column_stack([u, w, np.cross(u, w)]))
        bodies.append(b)
    elif t == "saddle":
        b = mk(); l, w, h = it["l"], it["w"], it["h"]
        b.box(pos + [-l * 0.35 / 2, 0, h / 2], [l * 0.65, w, h])
        b.box(pos + [l / 2 - l * 0.35 * 0.8, 0, h * 0.85 / 2], [l * 0.35 * 1.6, w * 0.55, h * 0.85])
        b.box(pos + [0, 0, 0.004], [l * 0.9, w * 0.8, 0.012])
        bodies.append(b)
    elif t == "handlebar":
        b = mk(steer=("stem",)); r, half = it["d"] / 2, it["width"] / 2
        b.cyl_c(pos, Y_AX, r, it["width"])
        for s in (-1, 1):
            b.cyl_c(pos + [0, s * (half - it["grips"] / 2), 0], Y_AX, r * 1.45, it["grips"])
            b.cap(pos + [0, s * half, 0], pos + [0, s * half, 0], r * 1.45)
        b.box(pos, [0.07, 0.07, it["d"] * 1.6])
        bodies.append(b)
    elif t == "fender":
        b = mk(); R, W = it["od"] / 2, it["width"]
        a = np.radians(np.linspace(-60, 60, math.ceil(math.radians(120) * R / SPACING) + 1))
        ys = np.linspace(-W / 2, W / 2, math.ceil(W / SPACING) + 1)
        th, yy = np.meshgrid(a, ys)
        pts = pos + np.column_stack([R * np.sin(th.ravel()), yy.ravel(), R * np.cos(th.ravel())])
        b.axis(pts, 0.003)                               # thin shell with its rolled edge, 3 mm
        bodies.append(b)
    elif t == "lamp":
        b = mk(steer=("stem",) if it.get("role") == "head" else None); d = dir_of(it["facing"])
        if it.get("d"):
            r, depth = it["d"] / 2, it["d"] * 0.7
            b.cyl(pos - d * depth, pos, r)
            b.cyl(pos, pos + d * 0.45 * r * 0.95, r * 0.95)              # lens dome, a flat puck
        else:
            b.box(pos, it["size"])
        bodies.append(b)
    elif t == "mirror":
        b = mk(steer=("stem",)); d = dir_of(it["facing"]); st = np.asarray(it["stem"], float)
        b.cap(st, pos, 0.008); b.cap(st, st, 0.014)
        b.cyl_c(pos, d, it["d"] / 2 * 1.05, 0.02)
        bodies.append(b)
    elif t == "gauge":
        b = mk(steer=("stem",)); d = dir_of(it["facing"]); r = it["d"] / 2
        b.cyl(pos - d * r * 0.9, pos, r)
        bodies.append(b)
    elif t == "lever":
        b = mk(steer=("stem",)); e = np.asarray(it["to"], float); dd = e - pos; d = unit(dd)
        b.cap(pos, e, 0.008); b.cap(e - d * min(0.12, np.linalg.norm(dd) * 0.4), e, 0.0155); b.cap(e, e, 0.016)
        b.cyl_c(pos, Y_AX, 0.014, 0.03)
        bodies.append(b)
    elif t == "sheet":
        b = mk(); c = np.asarray(it["corners"], float); u, v = c[1] - c[0], c[3] - c[0]
        nu, nv = math.ceil(np.linalg.norm(u) / SPACING) + 1, math.ceil(np.linalg.norm(v) / SPACING) + 1
        s, tt = np.meshgrid(np.linspace(0, 1, nu), np.linspace(0, 1, nv))
        # bilinear through the four corners (they are co-planar to a few mm)
        pts = ((1 - s) * (1 - tt))[..., None] * c[0] + (s * (1 - tt))[..., None] * c[1] + (s * tt)[..., None] * c[2] + ((1 - s) * tt)[..., None] * c[3]
        b.axis(pts.reshape(-1, 3), it["t"] / 2)
        bodies.append(b)
    elif t == "ski":
        l, w = it["l"], it["w"]; th, tip, kick = 0.022, l * 0.22, l * 0.08
        top = it.get("stub_z", 0.235)
        x0, x1 = -l / 2, l / 2
        xs1 = x0 + np.linspace(0, kick, 12); zs1 = 0.035 * (1 - (xs1 - x0) / kick) ** 2
        xs2 = x1 - tip + np.linspace(0, tip, 40); zs2 = 0.1 * ((xs2 - (x1 - tip)) / tip) ** 2
        xs, zs = np.concatenate([xs1, [x0 + kick, x1 - tip], xs2]), np.concatenate([zs1, [0, 0], zs2])
        # resample the mid line of the ski (between its sole and its top) at the spacing
        mid = np.column_stack([xs, zs + th / 2])
        seglen = np.r_[0, np.cumsum(np.linalg.norm(np.diff(mid, axis=0), axis=1))]
        sv = np.linspace(0, seglen[-1], math.ceil(seglen[-1] / SPACING) + 1)
        mx, mz = np.interp(sv, seglen, mid[:, 0]), np.interp(sv, seglen, mid[:, 1])
        ys = np.linspace(-w / 2, w / 2, math.ceil(w / SPACING) + 1)
        b = mk(steer=("king", SIDE(pos)))
        b.axis(pos + np.column_stack([np.repeat(mx, len(ys)), np.tile(ys, len(mx)), np.repeat(mz, len(ys))]), th / 2)
        for sg in (-1, 1):
            b.box(pos + [0, sg * 0.016, th + (top - th) / 2], [0.07, 0.006, top - th])
        b.cyl_c(pos + [0, 0, top], Y_AX, 0.007, 0.05)
        bodies.append(b)
    elif t == "shock":
        b = mk(); up = np.asarray(it["to"], float); mid = (pos + up) / 2
        b.cap(up, mid, max(it["d"], it["rod_d"]) / 2)      # body half at the fixed eye (the viewer's body cylinder)
        b.cap(mid, pos, it["spring_d"] / 2)               # spring over the half at the moving eye (rod is inside it)
        bodies.append(b)
    elif t == "float":
        b = mk(); b.cyl_c(pos, [1, 0, 0], it["d"] / 2, it["l"]); bodies.append(b)
    elif t == "outboard":
        b = mk(); tl = math.radians(it["tilt_deg"])
        b.box(pos, [0.25, 0.15, 0.30])
        a = pos + [0, 0, -0.1]; d = np.array([-math.sin(tl), 0, -math.cos(tl)])
        b.cap(a, a + d * it["shaft"], 0.035); b.cap(a + d * (it["shaft"] - 0.04), a + d * (it["shaft"] + 0.1), 0.045)
        bodies.append(b)
    else:
        raise ValueError(f"clash.py: no solid defined for item type {t!r} (item {i}, part {part!r}); add it to build_item")
    return [b.finish() for b in bodies]


def _mk(i, it, sub, steer):
    b = Body("item", it["part"], it["type"], i, sub, it.get("rider"), it, side=SIDE(it["pos"]) if "pos" in it else 0)
    b.steer = steer or (("king", SIDE(it["pos"])) if it.get("steers") else None)   # "steers": turns with its front wheel
    b.arm = it.get("arm") is True and it["type"] not in ("chain", "shock")            # chain and shock are rebuilt, not rotated
    b.farm = it.get("front_arm")
    b.flink = it.get("front_link")
    return b


def tie_rod_body(i, it, a, e):
    """A tie rod between stem foot a and spindle arm end e (shank, rod ends, balls)."""
    b = _mk(i, it, "", ("tie",))
    r, d = it["d"] / 2, unit(e - a)
    b.cap(a, e, r); b.cap(a, a + d * 0.032, r * 1.25); b.cap(e - d * 0.032, e, r * 1.25)
    b.cap(a, a, 0.0075); b.cap(e, e, 0.0075)
    b.ends = (np.asarray(a, float), np.asarray(e, float))
    return b.finish()


def member_body(i, m):
    b = Body("member", m["part"], "member", i)
    a, e = np.asarray(m["a"], float), np.asarray(m["b"], float)
    b.cap(a, e, m["od"] / 2)
    b.member = (a, e)
    b.arm = m.get("arm") is True
    b.farm = m.get("front_arm")
    b.flink = m.get("front_link")
    return b.finish()


# ---------------------------------------------------------------- riders (buildRider)
def ik(S, T, l1, l2, pole):
    d0 = T - S
    dist = min(max(np.linalg.norm(d0), abs(l1 - l2) + 1e-4), l1 + l2 - 1e-4)
    d = unit(d0)
    a = (l1 * l1 - l2 * l2 + dist * dist) / (2 * dist)
    hh = math.sqrt(max(0.0, l1 * l1 - a * a))
    perp = unit(pole - d * (pole @ d))
    return S + d * a + perp * hh, S + d * dist


def rider_bodies(design, kind, turn=None):
    """turn = (rotation matrix, centre): the hands follow the grips when the bar turns."""
    r, K = design["riders"][kind], MANNEQUIN
    H = r["stature"]
    hip = np.asarray(r["hip"], float)
    lean = math.radians(K["lean"])
    shoulder = hip + np.array([math.sin(lean), 0, math.cos(lean)]) * K["trunk"] * H
    out = []

    def body(typ, sub):
        b = Body("rider", "rider", typ, None, sub, kind)
        out.append(b)
        return b
    # the torso capsule starts one radius above the hip so that its bottom sphere rests on the seat top
    body("torso", "").cap(hip + unit(shoulder - hip) * RIDER_R["torso"], shoulder, RIDER_R["torso"])
    for sy, name in ((1, "left"), (-1, "right")):
        hp = hip + [0, sy * K["hipHalf"] * H, 0]
        heel = np.array([r["heel"][0], sy * r["foot_y"], r["heel"][2]])
        ankle = heel + [0.012, 0, 0.04 * H]
        knee, end = ik(hp, ankle, K["leg"] * H, K["leg"] * H, np.array([1, sy * 0.5, 0.25]))
        body("thigh", name).cap(hp, knee, RIDER_R["thigh"])
        s = body("shin", name); s.cap(knee, end, RIDER_R["shin"]); s.cap(end, heel, RIDER_R["shin"])
        body("foot", name).cap(heel, heel + [K["foot"] * H, 0, 0], RIDER_R["foot"])
        sp = shoulder + [0, sy * K["shoulderHalf"] * H, -0.01]
        hand = np.array([r["hand"][0], sy * r["hand"][1], r["hand"][2]])
        if turn is not None:
            hand = turn[0] @ (hand - turn[1]) + turn[1]
        elbow, wrist = ik(sp, hand, K["upperArm"] * H, (K["foreArm"] + K["hand"]) * H, np.array([-0.3, sy * 0.9, -0.6]))
        a = body("arm", name); a.cap(sp, elbow, RIDER_R["arm"]); a.cap(elbow, wrist, RIDER_R["arm"])
    return [b.finish() for b in out]


# ---------------------------------------------------------------- pair distance
def pair_gap(A, B, limit):
    """(gap, point on A, point on B), or None if the two are farther apart than limit + slack."""
    pad = limit + 0.012
    (alo, ahi), (blo, bhi) = A.bbox(), B.bbox()
    if np.any(alo > bhi + pad) or np.any(blo > ahi + pad):
        return None
    best = (np.inf, None, None)
    for ra, pa, ta in A.trees():
        for rb, pb, tb in B.trees():
            d, k = ta.query(pb, distance_upper_bound=pad + ra + rb)
            j = int(np.argmin(d))
            if np.isfinite(d[j]) and d[j] - ra - rb < best[0]:
                best = (d[j] - ra - rb, pa[k[j]], pb[j])
    # inside tests against convex solids: exact distance for the sample points, negative when inside
    for X, Y, swap in ((A, B, False), (B, A, True)):
        if not X.prims:
            continue
        lo, hi = X.bbox()
        for ry, py, _ in Y.trees():
            m = np.all((py >= lo - pad) & (py <= hi + pad), axis=1)
            if not m.any():
                continue
            sub = py[m]
            s = X.sdf(sub) - ry
            j = int(np.argmin(s))
            if s[j] < best[0]:
                nearest = min(((t.query(sub[j])[0], p[t.query(sub[j])[1]]) for _, p, t in X.trees()), key=lambda z: z[0])[1]
                best = (s[j], sub[j], nearest) if swap else (s[j], nearest, sub[j])
    if best[1] is None or best[0] > limit:
        return None
    return best


# ---------------------------------------------------------------- allowances
def _cap(b):
    return b.part, b.typ, b.sub


def _pos_close(p, q, tol=0.002):
    return abs(p[0] - q[0]) < tol and abs(p[2] - q[2]) < tol


def _joint(a, b):
    (a0, a1), (b0, b1) = a.member, b.member
    ra, rb = a.parts[0][0], b.parts[0][0]

    def d2seg(p, s0, s1):
        v = s1 - s0
        t = np.clip((p - s0) @ v / (v @ v), 0, 1)
        return np.linalg.norm(p - (s0 + t * v))
    if any(np.linalg.norm(p - q) < JOINT_TOL for p in (a0, a1) for q in (b0, b1)):
        return True
    return (min(d2seg(p, b0, b1) for p in (a0, a1)) <= rb + JOINT_TOL) or (min(d2seg(p, a0, a1) for p in (b0, b1)) <= ra + JOINT_TOL)


def allowed(a, b, ctx):
    """The reason a contact of a and b is allowed (a string), or None if it is a clash."""
    for x, y in ((a, b), (b, a)):
        r = _allowed_ordered(x, y, ctx)
        if r:
            return r
    return None


def _allowed_ordered(a, b, ctx):
    ai, bi = a.item, b.item
    if a.kind == "member" and b.kind == "member":
        return "A1 tube joint" if _joint(a, b) else None
    if a.kind == "rider":
        if b.kind == "item" and b.typ == "saddle":
            return "A17 rider"
        pb = ctx.get("pt", {}).get(id(b))
        for s in ctx.get("saddles", ()):
            if pb is not None and abs(pb[0] - s["pos"][0]) <= s["l"] / 2 and abs(pb[1] - s["pos"][1]) <= s["w"] / 2                     and pb[2] <= s["pos"][2] + 0.005:
                return "A17 rider (under the saddle)"
        if a.typ in ("foot", "shin") and b.part == "footrests":
            return "A17 rider"
        if a.typ == "arm" and (b.typ == "handlebar" or (b.part == "hand_brake" and b.typ == "lever")):
            return "A17 rider"
        return None
    if a.kind == "item" and a.typ == "spindle" and a.sub == "kingpin" and b.kind == "member":
        k = np.asarray(a.item["pos"], float)[:2]
        if any(np.linalg.norm(np.asarray(e)[:2] - k) <= 0.03 for e in b.member):
            return "A21 kingpin"
    if a.kind == "item" and a.part == "guards" and a.typ == "cyl" and b.kind == "item" and b.part == "axle_shaft":
        return "A20 axle covers"
    if a.kind == "item" and a.typ == "saddle" and b.kind == "member" and b.part == "frame":
        return "A22 seat on its rails"
    if a.kind == "item" and a.typ == "shock" and b.key() in ctx["eyes"].get(a.key(), ()):
        return "A18 shock eyes"
    if a.kind == "item" and ctx["mount"].get(a.key()) == b.key():
        return "A11 bolted on"
    if a.kind == "item" and a.typ in ("plate", "sheet") and a.part in ("frame", "sled_pan") and b.kind == "member":
        return "A2 plate on frame"
    if a.kind == "item" and a.part == "footrests" and a.typ == "plate" and b.kind == "member" and b.part == "footrests":
        return "A10 footboards"
    if a.kind == "item" and a.part == "footrests" and a.typ == "plate" and b.kind == "item" and b.part == "footrests" and b.typ == "plate":
        return "A10 footboards"
    if a.kind == "item" and a.part == "sled_pan" and b.kind == "item" and b.part == "sled_pan":
        return "A2 plate on frame"
    if a.kind == "item" and a.typ == "fender" and b.kind == "member":
        return "A14 fender"
    if a.kind != "item" or b.kind != "item":
        return None
    # --- item with item
    same_side = a.side == b.side
    if a.typ == "pillow" and ((b.typ == "cyl" and b.part == "axle_shaft") or (b.typ == "plate" and b.part == "frame" and abs(a.item["pos"][1] - b.item["pos"][1]) < 0.01)):
        return "A3 bearing"
    if a.part == "axle_shaft":
        if b.typ == "hub" and b.part == "rear_hubs":
            return "A4 on the axle"
        if b.typ == "sprocket" and _pos_close(b.item["pos"], a.item["pos"]):
            return "A4 on the axle"
        if b.typ == "disc" and b.part == "brake":
            return "A4 on the axle"
        if b.typ == "wheel" and b.part == "rear_wheels":
            return "A4 on the axle"
    if a.typ == "hub" and b.typ == "wheel" and same_side and abs(a.item["pos"][0] - b.item["pos"][0]) < 0.05:
        return "A5 hub in wheel"
    if a.typ == "chains" and b.typ == "wheel" and same_side and _pos_close(a.item["pos"], b.item["pos"]):
        return "A6 snow chains"
    if a.typ == "caliper" and b.typ == "disc" and b.part == "brake":
        return "A7 brake"
    if a.typ == "scooter_unit":
        if b.typ == "plate" and b.part == "frame":
            return "A8 engine unit"
        if b.typ == "sprocket" and _pos_close(b.item["pos"], a.item["out"]):
            return "A8 engine unit"
        if b.typ == "saddle":
            return "A8 engine unit"
    if a.typ == "chain" and b.typ == "sprocket" and (_pos_close(b.item["pos"], a.item["pos"]) or _pos_close(b.item["pos"], a.item["to"])):
        return "A9 final chain"
    if a.typ == "ski" and b.typ == "spindle" and same_side:
        return "A12 ski"
    if a.part == "hand_brake" and a.typ == "disc":
        if (b.typ == "wheel" and b.part == "front_wheels" and same_side) or (b.typ == "spindle" and b.sub == "stub" and same_side):
            return "A13 front drum and stub"
    if a.typ == "spindle" and a.sub == "stub" and b.typ == "wheel" and b.part == "front_wheels" and same_side:
        return "A13 front drum and stub"
    if a.part == "handlebar" and a.typ == "handlebar" and b.part == "handlebar" and b.sub == "tube":
        return "A16 steering"
    if a.part == "handlebar" and a.typ == "rod":
        if a.sub == "tube" and b.part == "handlebar" and b.typ == "rod" and b.sub == "flange":
            return "A16 steering"
    if a.part == "handlebar" and a.typ == "arm":
        if b.part == "handlebar" and ((b.typ == "rod" and b.sub == "tube") or b.typ == "arm"):
            return "A16 steering"
    if a.part == "handlebar" and a.sub == "flange" and b.kind == "member":
        return "A16 steering"
    if a.part == "tie_rods" and b.part == "tie_rods" and np.linalg.norm(np.asarray(a.item["pos"]) - np.asarray(b.item["pos"])) < JOINT_TOL:
        return "A16 steering"          # two rods on the one drop arm at the stem foot
    if a.part == "tie_rods" and b.typ == "spindle" and b.sub == "arm" and b.side == a.side:
        return "A16 steering"
    if a.part == "tie_rods" and b.part == "handlebar" and b.typ == "arm":
        pt = ctx.get("pt", {}).get(id(a))              # the contact must lie at the tie rod's inner end (pinned there)
        if pt is None or (a.ends is not None and np.linalg.norm(pt - a.ends[0]) <= 0.05):
            return "A16 steering"
    return None


def infer_mounts(bodies):
    """For each bolted-on part: the nearest mount body within MOUNT_RANGE (at straight ahead)."""
    cand = [b for b in bodies if b.kind == "member" or (b.kind == "item" and (b.typ in MOUNT_TYPES or (b.typ == "rod" and b.sub in ("tube", "flange"))))]
    mount, notes = {}, []
    for b in bodies:
        if b.kind != "item" or not (b.typ in MOUNTED or (b.typ == "spindle" and b.sub == "kingpin")):
            continue
        best = (np.inf, None)
        for c in cand:
            if c is b:
                continue
            r = pair_gap(b, c, 1.0)
            if r and r[0] < best[0]:
                best = (r[0], c)
        if best[1] is not None and best[0] <= MOUNT_RANGE:
            mount[b.key()] = best[1].key()
            notes.append((b.label(), best[1].label(), best[0]))
        else:
            notes.append((b.label(), None, best[0]))
    return mount, notes


# ---------------------------------------------------------------- the search
LAST_NOTES = []


def _steer_setup(design):
    items = design["items"]
    spindles = {it["side"]: it for it in items if it["type"] == "spindle"}
    stem = next((it for it in items if it["type"] == "rod" and it["part"] == "handlebar"), None)
    foot = np.asarray(stem["to"], float) if stem else np.zeros(3)
    axis = unit(np.asarray(stem["pos"], float) - foot) if stem else np.array([0, 0, 1.0])
    return spindles, foot, axis


def _front(design):
    """The front's hard points (calc/front.py), its bump and droop (m), and the bar's lock (deg), or None."""
    fs = design.get("front_suspension")
    if not fs or fs.get("type") != "wishbones":
        return None
    return FRONT_KIN.from_json(fs["points"]), fs["bump"], -fs["droop"], fs["lock_bar_deg"]


def _poses(fr, fsd, bar_deg):
    """{"l"/"r": the corner's moves} for a state: the sides in fsd risen by their value, both knuckles
    turned by the bar; sides that do not move are left out."""
    out = {}
    for L, s in (("l", 1), ("r", -1)):
        if L in fsd or bar_deg:
            out[L] = FRONT_KIN.Corner(fr[0], s).pose(fsd.get(L, 0.0), math.radians(bar_deg))
    return out


def _tie_ends(it, bar_deg, poses, foot, axis):
    """Inner end (turned with the stem) and outer end (moved with its knuckle) of a tie rod."""
    a, e = np.asarray(it["pos"], float), np.asarray(it["to"], float)
    L = "l" if e[1] > 0 else "r"
    if bar_deg:
        a = rot_axis(axis, math.radians(bar_deg)) @ (a - foot) + foot
    if L in poses:
        e = poses[L]["knuckle"](e)
    return a, e


def steering_report(design, steer_deg=30.0):
    """The front's lock and bump steer, from calc/front.py: {"bar_deg", "inner", "outer", "rods": [...],
    "max_change_heave"} - the last is how far a tie rod would have to stretch over the travel (m) if the
    knuckle did not steer, which is the bump steer times the steering arm."""
    fr = _front(design)
    if not fr:
        return {"rods": [], "max_change_heave": 0.0}
    g = fr[0]
    bar, inner, outer = FRONT_KIN.lock(g, steer_deg)
    rods = []
    for L, s in (("l", 1), ("r", -1)):
        c = FRONT_KIN.Corner(g, s)
        lo0, up0 = c.arms(0.0)
        k0 = c.knuckle(lo0, up0, 0.0)
        tip0 = k0(c.p["tip"])
        ch = 0.0
        for u in (fr[1], fr[2]):
            pose = c.pose(u)
            lo, up = pose["lower"], pose["upper"]
            # the knuckle carried by the arms alone, its steer as at rest
            kn = c.knuckle(lo, up, 0.0)
            ch = max(ch, abs(np.linalg.norm(kn(c.p["tip"]) - c.p["tie_in"]) - np.linalg.norm(tip0 - c.p["tie_in"])))
        rods.append({"side": L, "length": float(np.linalg.norm(c.p["tip"] - c.p["tie_in"])), "change_heave": float(ch)})
    return {"bar_deg": math.degrees(bar), "inner": inner, "outer": outer, "rods": rods,
            "max_change_heave": max(r["change_heave"] for r in rods), "bump": fr[1], "droop": fr[2]}


def _susp_angles(design):
    rs = design.get("rear_suspension")
    if not rs:
        return None, []
    return np.array([rs["pivot"][0], 0.0, rs["pivot"][1]]), [abs(rs["bump_deg"]), -abs(rs["droop_deg"])]


def _dyn(it, Ry, piv):
    """A chain or shock whose arm-side end follows the swing arm (chain: `to`, shock: `pos`)."""
    key = "to" if it["type"] == "chain" else "pos"
    p = Ry @ (np.asarray(it[key], float) - piv) + piv
    return dict(it, **{key: [float(v) for v in p]})


def find(design, configs=("summer", "winter"), limit=0.005, steer_deg=30.0):
    """All clashes (gap <= limit) per configuration, for the front steered 0 and +-steer_deg and, if the
    design has rear_suspension, the rear at 0, +bump and -droop (straight steering). Each entry: config,
    steer_deg, susp_deg, a and b (part, type, index, kind, sub, rider, label), gap (m, negative =
    interpenetration), point_a, point_b, overlap."""
    LAST_NOTES.clear()
    items, members = design["items"], design["members"]
    present = {c: [i for i, it in enumerate(items) if c in it["configs"] and not it.get("future")] for c in configs}
    need = sorted({i for v in present.values() for i in v})
    base = {i: build_item(i, items[i], items) for i in need}
    mem = [member_body(i, m) for i, m in enumerate(members)]
    rider_cache = {}
    spindles, foot, stem_axis = _steer_setup(design)
    ties = [i for i in need if items[i]["part"] == "tie_rods"]
    piv, susp = _susp_angles(design)
    fr = _front(design)
    lock = fr[3] if fr else steer_deg    # the bar's angle at the lock
    states = [(a, 0.0, {}) for a in (0.0, lock, -lock)] + [(0.0, u, {}) for u in susp]
    if fr:                               # one side at a time and both together, at +bump and -droop, straight and at +-lock (K-017)
        for fsd in [{L: u} for L in ("l", "r") for u in (fr[1], fr[2])] + [{"l": u, "r": u} for u in (fr[1], fr[2])]:
            states += [(a, 0.0, fsd) for a in (0.0, lock, -lock)]
    for i in need:                       # shock length at each front position
        if items[i]["type"] == "shock" and items[i].get("front_arm") and fr:
            ls = []
            for u in [0.0, fr[1], fr[2]]:
                it = items[i]
                if u:
                    pose = _poses(fr, {it["front_arm"]: u}, 0.0)[it["front_arm"]]
                    it = dict(it, pos=[float(x) for x in pose["lower"](it["pos"])])
                ls.append(f"{np.linalg.norm(np.asarray(it['to']) - np.asarray(it['pos'])) * 1000:.0f} mm at {u * 1000:+.0f} mm")
            free = items[i].get("eye")
            LAST_NOTES.append(("shock", f"front shock #{i} ({items[i]['front_arm']}) length " + ", ".join(ls) + (f" (free length {free * 1000:.0f} mm)" if free else ""), None, 0.0))
    for i in need:                       # shock length at each rear angle
        if items[i]["type"] == "shock" and not items[i].get("front_arm"):
            ls = []
            for u in [0.0] + susp:
                it = _dyn(items[i], rot_axis([0, 1, 0], math.radians(u)), piv) if u else items[i]
                ls.append(f"{np.linalg.norm(np.asarray(it['to']) - np.asarray(it['pos'])) * 1000:.0f} mm at {u:+g} deg")
            free = items[i].get("eye")
            LAST_NOTES.append(("shock", f"shock #{i} length " + ", ".join(ls) + (f" (free length {free * 1000:.0f} mm)" if free else ""), None, 0.0))
    out = []
    for cfg in configs:
        idx = present[cfg]
        fixed0 = [b for i in idx for b in base.get(i, [])] + mem
        tie0 = [tie_rod_body(i, items[i], np.asarray(items[i]["pos"], float), np.asarray(items[i]["to"], float)) for i in ties if i in idx]
        mount, notes = infer_mounts(fixed0 + tie0)
        LAST_NOTES.extend((cfg,) + n for n in notes)
        eyes = {}
        cand = [c for c in fixed0 if c.kind == "member" or (c.kind == "item" and c.typ not in ("wheel", "chains", "chain", "shock"))]
        for sh in [b for b in fixed0 if b.kind == "item" and b.typ == "shock"]:
            for p in (np.asarray(sh.item["pos"], float), np.asarray(sh.item["to"], float)):
                pt = Body("item", "", "point", -1)
                pt.cap(p, p, 0.0)
                pt.finish()
                best = min(((pair_gap(pt, c, 1.0) or (np.inf,))[0], k) for k, c in enumerate(cand))
                if best[0] <= 0.03:
                    eyes.setdefault(sh.key(), set()).add(cand[best[1]].key())
                    LAST_NOTES.append((cfg, sh.label() + " eye", cand[best[1]].label(), best[0]))
                else:
                    LAST_NOTES.append((cfg, sh.label() + " eye", None, best[0]))
        # the saddle's footprint: what lies under it is covered by it, so a rider resting on the
        # saddle cannot touch it (A17)
        saddles = [it for it in design["items"] if it.get("type") == "saddle" and cfg in it.get("configs", [cfg])]
        ctx = {"mount": mount, "eyes": eyes, "saddles": saddles}
        for ang, sus, fsd in states:
            th = math.radians(ang)
            FR = _poses(fr, fsd, ang) if fr else {}
            part_of = lambda pose, link: pose[link or "knuckle"]
            if ang not in rider_cache:
                turn = (rot_axis(stem_axis, th), foot) if ang else None
                rider_cache[ang] = {k: rider_bodies(design, k, turn) for k in design["riders"]}
            riders = rider_cache[ang]
            def jat(j):
                at = np.asarray(j["at"], float)
                if sus and j.get("arm") is True:
                    return rot_axis([0, 1, 0], math.radians(sus)) @ (at - piv) + piv
                if j.get("front_arm") in FR:
                    return part_of(FR[j["front_arm"]], j.get("front_link"))(at)
                return at
            ctx["joints"] = [(jat(j), j["r"]) for j in design.get("joints", [])]
            Ry = rot_axis([0, 1, 0], math.radians(sus))
            moved, changed = [], set()
            for b in fixed0:
                if b.kind == "item" and b.typ in ("chain", "shock"):
                    fa = b.item.get("front_arm")
                    if (sus and not fa) or (fa in FR):
                        continue                                 # rebuilt below
                fa = b.farm or (("l" if b.steer[1] > 0 else "r") if b.steer and b.steer[0] == "king" else None)
                if sus and b.arm:
                    nb = b.moved(Ry, piv)
                    changed.add(id(nb))
                elif fa in FR:                                   # the corner's arms and knuckle, steered as the tie rod makes it
                    nb = b.move(part_of(FR[fa], b.flink))
                    changed.add(id(nb))
                elif ang and b.steer is not None and b.steer[0] != "king":
                    nb = b.moved(rot_axis(stem_axis, th), foot)
                else:
                    nb = b
                moved.append(nb)
            for i in idx:
                if items[i]["type"] in ("chain", "shock"):
                    fa = items[i].get("front_arm")
                    dyn = None
                    if fa in FR:
                        dyn = dict(items[i], pos=[float(x) for x in FR[fa]["lower"](items[i]["pos"])])
                    elif sus and not fa:
                        dyn = _dyn(items[i], Ry, piv)
                    if dyn is not None:
                        for nb in build_item(i, dyn, items):
                            nb.item = items[i]
                            moved.append(nb)
                            changed.add(id(nb))
            for i in ties:
                if i in idx:
                    a, e = _tie_ends(items[i], ang, FR, foot, stem_axis)
                    nb = tie_rod_body(i, items[i], a, e)
                    moved.append(nb)
                    if fsd:
                        changed.add(id(nb))
            if not ang and not sus and not fsd:
                todo_ids = {id(b) for b in moved}
            elif sus or fsd:
                todo_ids = changed | ({id(b) for b in moved if b.steer is not None} if ang else set())
            else:
                todo_ids = {id(b) for b in moved if b.steer is not None}
            checks = []
            for i, x in enumerate(moved):                      # by position in the list, not by id(), so that the
                if id(x) not in todo_ids:                       # pairs and their order are the same on every run
                    continue
                for j, y in enumerate(moved):
                    if x is y or (x.kind == y.kind and x.idx == y.idx and x.kind != "rider"):
                        continue
                    if id(y) in todo_ids and j < i:
                        continue
                    checks.append((x, y))
            for who, rb in riders.items():
                vis = [b for b in moved if b.kind != "item" or b.rider in (None, who)]
                for r in rb:
                    for y in vis:
                        if id(y) in todo_ids or (ang and r.typ == "arm"):
                            checks.append((r, y))
            for x, y in checks:
                if x.kind == "item" and x.rider and y.kind == "item" and y.rider and x.rider != y.rider:
                    continue
                res = pair_gap(x, y, limit)
                if res is None:
                    continue
                ctx["pt"] = {id(x): res[1], id(y): res[2]}
                if allowed(x, y, ctx):
                    continue
                gap, pa, pb = res
                if ((group(x) == group(y) or pivot(x) or pivot(y))
                        and any(np.linalg.norm(pa - c) <= r and np.linalg.norm(pb - c) <= r for c, r in ctx["joints"])):
                    continue                                   # A19 joints
                out.append({"config": cfg, "steer_deg": ang, "susp_deg": sus, "front": ({"side": next(iter(fsd)), "deg": next(iter(fsd.values()))} if fsd else None), "a": x.info(), "b": y.info(), "gap": float(gap),
                            "point_a": [round(float(v), 4) for v in pa], "point_b": [round(float(v), 4) for v in pb],
                            "overlap": bool(gap < 0)})
    return out


def group(b):
    """The rigid group a body moves with: the frame, the swing arm, a front corner's arm or knuckle, or the stem."""
    if b.arm:
        return "arm"
    if b.farm:
        return f"{b.farm}.{b.flink or 'knuckle'}"
    if b.steer:
        return "stem" if b.steer[0] == "stem" else f"{'l' if b.steer[1] > 0 else 'r'}.knuckle"
    return "frame"


def pivot(b):
    """A body that turns in or on a body of another group at a joint: the swing arm's sleeves on the pivot tube,
    the kingpin in the A-arms' joints."""
    return (b.kind == "item" and b.typ == "cyl" and b.part == "swing_arm") or (b.typ == "spindle" and b.sub == "kingpin")


def summary(clashes):
    """Count of clashes per configuration."""
    out = {}
    for c in clashes:
        out[c["config"]] = out.get(c["config"], 0) + 1
    return out


# ---------------------------------------------------------------- report
def report(clashes, configs, limit, steer, secs, design):
    print("Allowed contacts (everything else is a clash):")
    for n, t in ALLOWANCES:
        print(f"  {n}: {t}")
    for cfg in configs:
        print(f"\n== {cfg}: gap <= {limit * 1000:g} mm, front steered 0 and +-{steer:g} deg, rear suspension if the design has it")
        notes = [n for n in LAST_NOTES if n[0] == cfg]
        for _, a, b, g in notes:
            print(f"  mount {a} -> {b if b else 'NONE within %d mm (nearest %.0f mm)' % (MOUNT_RANGE * 1000, g * 1000)}")
        groups = {}
        for c in clashes:
            if c["config"] != cfg:
                continue
            key = (c["a"]["label"], c["b"]["label"], c["a"]["rider"] if c["a"]["kind"] == "rider" else c["b"]["rider"] if c["b"]["kind"] == "rider" else None)
            g = groups.setdefault(key, {"gap": 1e9, "angles": []})
            fnt = c.get("front")
            g["angles"].append((f"front {fnt['side']}{fnt['deg']:+g}" + (f" steer {c['steer_deg']:+g}" if c["steer_deg"] else "")) if fnt
                               else f"rear {c['susp_deg']:+g}" if c.get("susp_deg") else f"{c['steer_deg']:+g}")
            if c["gap"] < g["gap"]:
                g["gap"], g["pt"] = c["gap"], c["point_a"]
        print(f"  {len(groups)} pairs ({sum(1 for c in clashes if c['config'] == cfg)} entries)")
        for (a, b, r), g in sorted(groups.items(), key=lambda kv: kv[1]["gap"]):
            ang = ",".join(sorted(set(g["angles"])))
            print(f"  {g['gap'] * 1000:7.1f} mm  {a} | {b}" + (f"  [{r}]" if r else "") + f"  at {ang} deg  near {g['pt']}")
    for n in LAST_NOTES:
        if n[0] == "shock":
            print(f"\nnote: {n[1]}")
    sr = steering_report(design, steer)
    if sr["rods"]:
        print(f"\nnote: lock: bar {sr['bar_deg']:.1f} deg, inner wheel {sr['inner']:.1f} deg, outer {sr['outer']:.1f} deg")
        for r in sr["rods"]:
            print(f"note: tie rod ({r['side']}) {r['length'] * 1000:.0f} mm; it would have to stretch "
                  f"{r['change_heave'] * 1000:.1f} mm over the travel for the wheel not to steer")
    print(f"\nsummary: {summary(clashes)}   ({secs:.1f} s)")


def main(argv=None):
    ap = argparse.ArgumentParser(description=__doc__.split("\n")[0])
    ap.add_argument("--limit", type=float, default=0.005, help="report gaps up to this many metres")
    ap.add_argument("--steer", type=float, default=30.0, help="steering lock in degrees")
    ap.add_argument("--configs", nargs="+", default=["summer", "winter"])
    ap.add_argument("--design", default=str(SRC))
    a = ap.parse_args(argv)
    design = json.loads(Path(a.design).read_text(encoding="utf-8"))
    t0 = time.time()
    clashes = find(design, tuple(a.configs), a.limit, a.steer)
    report(clashes, a.configs, a.limit, a.steer, time.time() - t0, design)
    return 0


if __name__ == "__main__":
    sys.exit(main())
