"""The front end of D-041: upper and lower A-arms each side, the knuckle between their ends, one
coil-over from each lower arm to the upper rails, and tie rods from a plate on the steering stem.

Geometry and kinematics in 3D, shared by calc/design.py (layout, values, frame analysis) and
calc/clash.py (the interference sweep). Axes as in design.json: x forward, y left, z up, metres,
origin on the ground under the rear axle's centre. Points are given for the left side; the right is
the mirror image (y -> -y).

A corner moves in two ways. In heave, the lower arm turns about its pivot axis (parallel to x), the
upper arm about its own, and the knuckle follows its two joints. In steering, the stem turns the
plate, the plate's end pulls the tie rod, and the knuckle turns about its kingpin (the line
through the two joints) until the tie rod has its length again. Both are solved exactly here, so the
camber, toe, and caster changes, the wheels' angles at lock, and the shock's length come from the
same points that are drawn and analysed.

    import front
    g = front.geometry(v)                  # v: the record's values {key: value}
    c = front.Corner(g, side=1)            # +1 left, -1 right
    pose = c.pose(rise=0.02, bar=0.0)      # rise of the wheel's centre, bar angle in radians
    pose["knuckle"](p), pose["lower"](p)   # move a point of the knuckle, of the lower arm
"""
import math

import numpy as np

X = np.array([1.0, 0.0, 0.0])


def rot(axis, a):
    """Rotation matrix about a unit axis by a radians."""
    u = np.asarray(axis, float) / np.linalg.norm(axis)
    k = np.array([[0, -u[2], u[1]], [u[2], 0, -u[0]], [-u[1], u[0], 0]])
    return np.eye(3) + math.sin(a) * k + (1 - math.cos(a)) * (k @ k)


def align(a, b):
    """The smallest rotation taking direction a to direction b."""
    a, b = a / np.linalg.norm(a), b / np.linalg.norm(b)
    c = np.cross(a, b)
    s = np.linalg.norm(c)
    if s < 1e-12:
        return np.eye(3)
    return rot(c, math.atan2(s, float(a @ b)))


class Move:
    """A rigid motion p -> R (p - c) + c + d."""
    def __init__(self, R=None, c=None, d=None):
        self.R = np.eye(3) if R is None else R
        self.c = np.zeros(3) if c is None else np.asarray(c, float)
        self.d = np.zeros(3) if d is None else np.asarray(d, float)

    def __call__(self, p):
        return self.R @ (np.asarray(p, float) - self.c) + self.c + self.d

    def vec(self, v):
        return self.R @ np.asarray(v, float)


def geometry(v):
    """Hard points of the front end from the record's values, left side, as numpy arrays."""
    mm = lambda k: v[k] / 1000.0
    wb, r = mm("lay.wheelbase_mm"), mm("yr.tyre_dia_mm") / 2
    yk = mm("lay.kingpin_y_mm")                      # the kingpin at the spindle's height
    kpi, cas = math.radians(v["lay.kpi_deg"]), math.radians(v["lay.caster_deg"])
    zl, zu = mm("lay.fa_lower_joint_z_mm"), mm("lay.fa_upper_joint_z_mm")
    on_kp = lambda z: np.array([wb - (z - r) * math.tan(cas), yk - (z - r) * math.tan(kpi), z])
    g = dict(wb=wb, r=r, track=mm("lay.track_front_mm"))
    g["lbj"], g["ubj"] = on_kp(zl), on_kp(zu)
    g["hub"] = on_kp(r)                              # where the spindle leaves the knuckle
    g["wheel"] = np.array([wb, g["track"] / 2, r])   # the wheel's centre
    g["contact"] = np.array([wb, g["track"] / 2, 0.0])
    xf, xr = wb + mm("lay.fa_pivot_front_x_mm"), wb - mm("lay.fa_pivot_rear_x_mm")
    yl, zlp = mm("lay.fa_lower_pivot_y_mm"), mm("lay.fa_lower_pivot_z_mm")
    yu, zup = mm("lay.fa_upper_pivot_y_mm"), mm("lay.fa_upper_pivot_z_mm")
    g["lo_f"], g["lo_r"] = np.array([xf, yl, zlp]), np.array([xr, yl, zlp])
    g["up_f"], g["up_r"] = np.array([xf, yu, zup]), np.array([xr, yu, zup])
    # the steering arm points back and in by lay.steer_arm_angle_deg in plan (Ackermann), its tip zt
    # above the ground
    la, zt = mm("lay.steer_arm_mm"), mm("lay.steer_arm_z_mm")
    kt = on_kp(zt)
    beta = math.radians(v["lay.steer_arm_angle_deg"])
    g["tip"] = kt + la * np.array([-math.cos(beta), -math.sin(beta), 0.0])
    g["arm_len"] = la
    # the shock: lower eye on a lug on a plate across the lower arm, upper eye beside a node of the upper rails
    xs = wb + mm("lay.front_shock_x_mm")
    ys = mm("lay.front_shock_y_mm")
    t = (ys - yl) / (g["lbj"][1] - yl)
    g["sh_lo"] = np.array([xs, ys, zlp + t * (g["lbj"][2] - zlp) + 0.025])    # on a lug above the plate
    g["sh_top_y"], g["shock_x"] = mm("lay.front_shock_top_y_mm"), xs
    # the plate on the stem: its arm, as long as the knuckles', reaches back to the tie rods' inner ends
    g["plate_arm"], g["tie_y"] = la, mm("lay.tie_inner_y_mm")
    g["bar"] = np.array([mm("lay.bar_x_mm"), 0.0, mm("lay.bar_z_mm")])
    return g


def place_shock(g, length):
    """Upper eye on the line x = shock_x, y = sh_top_y, at the height giving the shock this length at rest."""
    lo = g["sh_lo"]
    dy = g["sh_top_y"] - lo[1]
    g["sh_top"] = np.array([g["shock_x"], g["sh_top_y"], lo[2] + math.sqrt(max(length ** 2 - dy ** 2, 0.0))])


def place_steering(g, z_tie):
    """The tie rods' inner ends at height z_tie, on the plate's cross bar; the stem from the bar passes
    the plate's arm length ahead of them, the arm square to the stem."""
    tip = g["tip"]
    wx, wz = tip[0] - g["bar"][0], z_tie - g["bar"][2]
    phi = math.asin(g["plate_arm"] / math.hypot(wx, wz))
    ang = math.atan2(wz, wx) + phi                      # the stem axis passes ahead of the tie rods
    u = np.array([math.cos(ang), 0.0, math.sin(ang)])
    along = math.hypot(wx, wz) * math.cos(phi)
    g["stem_foot"] = g["bar"] + along * u                # where the plate's arm leaves the stem
    g["stem_axis"] = -u                                  # pointing up, from the foot to the bar
    g["tie_in"] = np.array([tip[0], g["tie_y"], z_tie])
    g["z_tie"] = z_tie


class Corner:
    def __init__(self, g, side=1):
        self.g, self.s = g, side
        m = np.array([1.0, side, 1.0])
        self.p = {k: g[k] * m for k in ("lbj", "ubj", "hub", "wheel", "contact", "lo_f", "lo_r", "up_f", "up_r", "tip",
                                        "sh_lo", "sh_top", "tie_in", "stem_foot") if k in g}
        self.lu = np.linalg.norm(self.p["ubj"] - self.p["lbj"])
        self.tie_len = np.linalg.norm(self.p["tip"] - self.p["tie_in"])

    def arms(self, th):
        """Lower arm turned th about its axis (positive lifts its outer end), and the upper arm angle
        that keeps the knuckle's joints their distance apart."""
        p, s = self.p, self.s
        lo = Move(rot(X, s * th), p["lo_f"])
        l2 = lo(p["lbj"])
        # the upper joint stays in its plane x = const on a circle about the upper axis; it must also
        # lie on the sphere of radius lu about the lower joint: two circles in that plane
        u = p["ubj"]
        c = np.array([p["up_f"][1], p["up_f"][2]])
        rho = math.hypot(u[1] - c[0], u[2] - c[1])
        c2 = np.array([l2[1], l2[2]])
        r2 = math.sqrt(max(self.lu ** 2 - (u[0] - l2[0]) ** 2, 0.0))
        d = np.linalg.norm(c2 - c)
        a = (rho ** 2 - r2 ** 2 + d ** 2) / (2 * d)
        h = math.sqrt(max(rho ** 2 - a ** 2, 0.0))
        m = c + a * (c2 - c) / d
        n = np.array([-(c2 - c)[1], (c2 - c)[0]]) / d
        guess = Move(rot(X, s * th), p["up_f"])(u)[1:]
        w = min((m + h * n, m - h * n), key=lambda q: np.linalg.norm(q - guess))
        v0 = np.array([u[1], u[2]]) - c
        w = w - c
        up = Move(rot(X, math.atan2(v0[0] * w[1] - v0[1] * w[0], v0 @ w)), p["up_f"])
        return lo, up

    def knuckle(self, lo, up, psi):
        """The knuckle's motion: its joints follow the arms, then it turns psi about the kingpin."""
        p = self.p
        l2, u2 = lo(p["lbj"]), up(p["ubj"])
        R0 = align(p["ubj"] - p["lbj"], u2 - l2)
        R = rot(u2 - l2, psi) @ R0
        return Move(R, p["lbj"], l2 - p["lbj"])

    def tie_inner(self, bar):
        """The tie rod's inner end with the bar turned (positive turns left)."""
        g = self.g
        return Move(rot(g["stem_axis"], bar), g["stem_foot"])(self.p["tie_in"])

    def solve(self, th, bar):
        lo, up = self.arms(th)
        ti = self.tie_inner(bar)
        # the tip turns on a circle about the kingpin: |a + h k + w cos psi + (k x w) sin psi - ti| = L
        k0 = self.knuckle(lo, up, 0.0)
        a = k0(self.p["lbj"])
        k = k0(self.p["ubj"]) - a
        k = k / np.linalg.norm(k)
        t0 = k0(self.p["tip"]) - a
        hk = (t0 @ k) * k
        w = t0 - hk
        q = a + hk - ti
        P, Q = 2 * (q @ w), 2 * (q @ np.cross(k, w))
        S = self.tie_len ** 2 - q @ q - w @ w
        base = math.atan2(Q, P)
        off = math.acos(max(-1.0, min(1.0, S / math.hypot(P, Q))))
        psi = min((base + off, base - off), key=lambda x: abs(math.remainder(x, 2 * math.pi)))
        return lo, up, self.knuckle(lo, up, math.remainder(psi, 2 * math.pi))

    def pose(self, rise=0.0, bar=0.0):
        """Arms and knuckle with the wheel's centre risen `rise` (m) against the frame and the bar turned."""
        w = self.p["wheel"]
        a0, a1 = -0.7, 0.7
        for _ in range(50):
            am = (a0 + a1) / 2
            if self.solve(am, bar)[2](w)[2] - w[2] < rise:
                a0 = am
            else:
                a1 = am
        lo, up, kn = self.solve((a0 + a1) / 2, bar)
        return {"lower": lo, "upper": up, "knuckle": kn, "angle": (a0 + a1) / 2}

    def report(self, pose):
        """Steer (deg, positive left), camber (deg, positive top out), caster (deg), the shock's length."""
        kn, s = pose["knuckle"], self.s
        ax = kn.vec([0.0, s, 0.0])                       # the spindle's direction, outward
        steer = math.degrees(math.atan2(-ax[0] * s, ax[1] * s))
        camber = -math.degrees(math.asin(ax[2]))
        kp = kn(self.p["ubj"]) - kn(self.p["lbj"])
        caster = math.degrees(math.atan2(-kp[0], kp[2]))
        out = {"steer": steer, "camber": camber, "caster": caster,
               "track": (kn(self.p["contact"])[1] - self.p["contact"][1]) * s}
        if "sh_top" in self.p:
            out["shock"] = float(np.linalg.norm(pose["lower"](self.p["sh_lo"]) - self.p["sh_top"]))
        return out


def best_tie_height(g, bump, droop, lo=0.18, hi=0.36):
    """The tie rods' inner ends' height that keeps the toe change over the travel least (straight ahead)."""
    best = None
    for k in range(int((hi - lo) / 0.002) + 1):
        z = lo + 0.002 * k
        place_steering(g, z)
        c = Corner(g, 1)
        toes = [c.report(c.pose(u))["steer"] for u in (-droop, -droop / 2, 0.0, bump / 2, bump)]
        m = max(abs(t - toes[2]) for t in toes)
        if best is None or m < best[0]:
            best = (m, z)
    place_steering(g, best[1])
    return best[1]


def sweep(g, bump, droop, n=8):
    """Each quantity over the travel, straight ahead: rows of (rise, report)."""
    c = Corner(g, 1)
    return [(u, c.report(c.pose(u))) for u in np.linspace(-droop, bump, n)]


def lock(g, inner_deg):
    """The bar angle that turns the inner wheel (the left, turning left) to inner_deg, and both wheels' angles."""
    cl, cr = Corner(g, 1), Corner(g, -1)
    a0, a1 = 0.0, 1.2
    for _ in range(50):
        am = (a0 + a1) / 2
        if cl.report(cl.pose(0.0, am))["steer"] < inner_deg:
            a0 = am
        else:
            a1 = am
    bar = (a0 + a1) / 2
    return bar, cl.report(cl.pose(0.0, bar))["steer"], cr.report(cr.pose(0.0, bar))["steer"]


KEYS = ("lbj", "ubj", "hub", "wheel", "contact", "lo_f", "lo_r", "up_f", "up_r", "tip", "sh_lo", "sh_top", "tie_in",
        "stem_foot", "stem_axis", "bar")


def to_json(g):
    """The hard points for design.json (left side), rounded."""
    d = {k: [round(float(x), 5) for x in g[k]] for k in KEYS}
    d.update({k: round(float(g[k]), 5) for k in ("wb", "r", "track", "arm_len", "plate_arm", "tie_y", "z_tie", "shock_x",
                                                "sh_top_y")})
    return d


def from_json(d):
    g = {k: (np.asarray(x, float) if isinstance(x, list) else x) for k, x in d.items()}
    return g
