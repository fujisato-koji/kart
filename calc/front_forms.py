"""Load-path sketches and kinematics of the front-end forms compared in docs/02-form.md 1.2.20 (Q-043).

Each form is drawn in front view (the left half, y-z, from the front) and side view (x-z, from the
left) as lines and points: frame tubes, arms, the knuckle with its kingpin and steering arm, the
shock, the steering chain from the stem to the knuckle, and arrows for where the wheel's loads go.
Rails that run fore and aft show as dots in front view, cross tubes as dots in side view.

The same points move: the wheel goes from sus.droop_mm down to sus.bump_mm up, and the script
prints, for each form, the camber change, the toe change (bump steer, from how far the tie rod
would have to stretch, over a steering arm of A), the caster change, and the shock's length
between the eyes at full droop, at rest, and at full bump. Sizes are those of 1.3, rounded; the
sketches settle form, not the final geometry.

    python calc/front_forms.py   # writes docs/figures/front-s1.svg to front-s4.svg and prints the table
"""
import math
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
OUT = ROOT / "docs" / "figures"
S = 620            # px per metre
W, H = 1260, 640
FRAME, ARM, SHOCK, STEER, LOAD, BRAKE = "#c0392b", "#2c3e50", "#d4a017", "#1e8449", "#e67e22", "#2471a3"
R, TY, WB, ZR = 0.235, 0.40, 1.08, 0.18      # tyre radius, half track, front axle x, lower rails' centre
BUMP, DROOP = 0.040, 0.030                   # sus.bump_mm, sus.droop_mm
A = 0.09                                     # steering arm, kingpin to tie-rod end (assumed; M92 does not say)
BAR = (0.84, 0.86)                           # handlebar clamp, x and z
CLEAR = 0.15                                 # ground clearance (D-038)


# ---------- kinematics: points in a plane turned about a pivot ----------

def rot(p, c, a):
    s, k = math.sin(a), math.cos(a)
    return (c[0] + k * (p[0] - c[0]) - s * (p[1] - c[1]), c[1] + s * (p[0] - c[0]) + k * (p[1] - c[1]))


def circles(c1, r1, c2, r2, near):
    d = math.dist(c1, c2)
    a = (r1 * r1 - r2 * r2 + d * d) / (2 * d)
    h = math.sqrt(max(r1 * r1 - a * a, 0.0))
    m = (c1[0] + a * (c2[0] - c1[0]) / d, c1[1] + a * (c2[1] - c1[1]) / d)
    ps = [(m[0] + s * h * (c2[1] - c1[1]) / d, m[1] - s * h * (c2[0] - c1[0]) / d) for s in (1, -1)]
    return min(ps, key=lambda p: math.dist(p, near))


def bisect(f, target, lo=-0.7, hi=0.7):
    """The angle at which f (rising with the angle) reaches target."""
    for _ in range(60):
        m = (lo + hi) / 2
        lo, hi = (m, hi) if f(m) < target else (lo, m)
    return (lo + hi) / 2


def travel():
    n = 14
    return [-DROOP + i * (BUMP + DROOP) / n for i in range(n + 1)]


def wishbones(g):
    """S1: the knuckle hinged on two arms that turn about fore-and-aft axes; all in the y-z plane."""
    def pose(th):
        l2 = rot(g["lbj"], g["lo_in"], th)
        u2 = circles(g["up_in"], math.dist(g["up_in"], g["ubj"]), l2, math.dist(g["lbj"], g["ubj"]), g["ubj"])
        phi = (math.atan2(u2[1] - l2[1], u2[0] - l2[0])
               - math.atan2(g["ubj"][1] - g["lbj"][1], g["ubj"][0] - g["lbj"][0]))
        return lambda p: rot((p[0] - g["lbj"][0] + l2[0], p[1] - g["lbj"][1] + l2[1]), l2, phi), phi
    rows = []
    for dz in travel():
        th = bisect(lambda t: pose(t)[0]((TY, 0.0))[1], dz)
        k, phi = pose(th)
        sm = rot(g["sm"], g["lo_in"], th)
        rows.append(dict(dz=dz, camber=math.degrees(phi), caster=0.0,
                         toe=math.degrees((math.dist(k(g["T"]), g["I"]) - math.dist(g["T"], g["I"])) / A),
                         shock=math.dist(sm, g["st"]), track=k((TY, 0.0))[0] - TY))
    return rows


def one_arm(g, plane):
    """S2 (plane 'yz', the arm turns about a fore-and-aft axis) and S3 (plane 'xz', about a cross
    axis): the kingpin is fixed in the arm, so the whole corner turns about the pivot."""
    i = (1, 2) if plane == "yz" else (0, 2)
    c = (g["piv"][i[0]], g["piv"][i[1]])
    contact = (TY, 0.0) if plane == "yz" else (WB, 0.0)

    def move(p, a):
        q = list(p)
        q[i[0]], q[i[1]] = rot((p[i[0]], p[i[1]]), c, a)
        return q
    rows = []
    for dz in travel():
        a = bisect(lambda t: rot(contact, c, t)[1], dz)
        rows.append(dict(dz=dz, camber=math.degrees(a) if plane == "yz" else 0.0,
                         caster=math.degrees(a) if plane == "xz" else 0.0,
                         toe=math.degrees((math.dist(move(g["T"], a), g["I"]) - math.dist(g["T"], g["I"])) / A),
                         shock=math.dist(move(g["sm"], a), g["st"]),
                         track=rot(contact, c, a)[0] - contact[0] if plane == "yz" else 0.0))
    return rows


def rigid():
    return [dict(dz=dz, camber=0.0, caster=0.0, toe=0.0, shock=0.0, track=0.0) for dz in travel()]


# ---------- drawing ----------

class Svg:
    def __init__(self):
        self.parts = []

    def add(self, s):
        self.parts.append(s)

    def text(self):
        defs = ('<defs>' + "".join(
            f'<marker id="a{c[1:]}" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse">'
            f'<path d="M0,0 L10,5 L0,10 z" fill="{c}"/></marker>' for c in (LOAD, BRAKE)) + '</defs>')
        return (f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 {W} {H}" font-family="sans-serif" font-size="13">'
                f'<rect width="{W}" height="{H}" fill="#ffffff"/>{defs}' + "".join(self.parts) + "</svg>\n")


class View:
    """A view with its own origin: u to the right, v up, in metres."""
    def __init__(self, svg, x0, y0, title):
        self.s, self.x0, self.y0 = svg, x0, y0
        svg.add(f'<text x="{x0 - 60}" y="28" font-weight="bold">{title}</text>')
        svg.add(f'<line x1="{x0 - 60}" y1="{y0}" x2="{x0 + 450}" y2="{y0}" stroke="#999" stroke-dasharray="4 4"/>')
        svg.add(f'<line x1="{x0 - 60}" y1="{y0 - CLEAR * S:.1f}" x2="{x0 + 450}" y2="{y0 - CLEAR * S:.1f}" stroke="#bbb" stroke-dasharray="2 6"/>')
        svg.add(f'<text x="{x0 + 360}" y="{y0 - CLEAR * S - 4:.1f}" fill="#999" font-size="11">150 mm clear</text>')

    def p(self, u, v):
        return self.x0 + u * S, self.y0 - v * S

    def line(self, a, b, color, w=4, dash=""):
        (x1, y1), (x2, y2) = self.p(*a), self.p(*b)
        d = f' stroke-dasharray="{dash}"' if dash else ""
        self.s.add(f'<line x1="{x1:.1f}" y1="{y1:.1f}" x2="{x2:.1f}" y2="{y2:.1f}" stroke="{color}" stroke-width="{w}" stroke-linecap="round"{d}/>')

    def poly(self, pts, color, w=4):
        for a, b in zip(pts, pts[1:]):
            self.line(a, b, color, w)

    def dot(self, a, color="#000", r=5, fill="#fff"):
        x, y = self.p(*a)
        self.s.add(f'<circle cx="{x:.1f}" cy="{y:.1f}" r="{r}" fill="{fill}" stroke="{color}" stroke-width="2"/>')

    def tube(self, a):
        """A tube seen end-on: a fore-and-aft rail in front view, a cross tube in side view."""
        self.dot(a, FRAME, 6, FRAME)

    def bearing(self, a):
        self.tube(a)
        self.dot(a, STEER, 10, "none")

    def wheel(self, c, side=False):
        x, y = self.p(*c)
        if side:
            self.s.add(f'<circle cx="{x:.1f}" cy="{y:.1f}" r="{R * S:.1f}" fill="none" stroke="#888" stroke-width="2"/>')
        else:
            w = 0.178
            self.s.add(f'<rect x="{x - w * S / 2:.1f}" y="{y - R * S:.1f}" width="{w * S:.1f}" height="{2 * R * S:.1f}" rx="12" fill="none" stroke="#888" stroke-width="2"/>')

    def shock(self, a, b):
        (x1, y1), (x2, y2) = self.p(*a), self.p(*b)
        n, L = 9, math.hypot(x2 - x1, y2 - y1)
        ux, uy = (x2 - x1) / L, (y2 - y1) / L
        pts = [(x1, y1)] + [(x1 + ux * L * i / n - uy * (6 if i % 2 else -6), y1 + uy * L * i / n + ux * (6 if i % 2 else -6))
                            for i in range(1, n)] + [(x2, y2)]
        self.s.add('<polyline points="' + " ".join(f"{x:.1f},{y:.1f}" for x, y in pts) + f'" fill="none" stroke="{SHOCK}" stroke-width="3"/>')
        self.dot(a, SHOCK, 4)
        self.dot(b, SHOCK, 4)

    def arrow(self, a, b, color):
        (x1, y1), (x2, y2) = self.p(*a), self.p(*b)
        self.s.add(f'<line x1="{x1:.1f}" y1="{y1:.1f}" x2="{x2:.1f}" y2="{y2:.1f}" stroke="{color}" stroke-width="2.5" marker-end="url(#a{color[1:]})"/>')

    def label(self, a, txt, dx=6, dy=-6, color="#222"):
        """Text at (dx, dy) px from point a, with a thin leader when it stands off."""
        x, y = self.p(*a)
        if abs(dy) > 24 or abs(dx) > 60:
            ty = y + dy + 4 if dy > 0 else y + dy - 4
            ty = y + dy - 14 if dy > 0 else ty
            self.s.add(f'<line x1="{x:.1f}" y1="{y:.1f}" x2="{x + dx + 4:.1f}" y2="{ty:.1f}" stroke="#999" stroke-width="1"/>')
        self.s.add(f'<text x="{x + dx:.1f}" y="{y + dy:.1f}" fill="{color}">{txt}</text>')


def legend(svg, note):
    items = [(FRAME, "frame tube (dot: end-on)"), (ARM, "arm, knuckle"), (SHOCK, "shock"),
             (STEER, "stem, plate, tie rod"), (LOAD, "vertical load"), (BRAKE, "braking load")]
    for i, (c, t) in enumerate(items):
        x = 20 + i * 205
        svg.add(f'<line x1="{x}" y1="{H - 18}" x2="{x + 26}" y2="{H - 18}" stroke="{c}" stroke-width="4"/>'
                f'<text x="{x + 32}" y="{H - 13}" font-size="12">{t}</text>')
    svg.add(f'<text x="20" y="{H - 42}" font-size="12" fill="#444">{note}</text>')


def stem_x(foot, z):
    """x of the stem at height z, on the line from the bar clamp through foot (x, z)."""
    return BAR[0] + (foot[0] - BAR[0]) * (BAR[1] - z) / (BAR[1] - foot[1])


def yz(p):
    return (p[1], p[2]) if len(p) == 3 else p


def front_common(f, g, kp_lo, kp_hi):
    """Wheel, kingpin, spindle, steering arm, tie rod, plate, and stem in front view."""
    f.wheel((TY, R))
    f.line(kp_lo, kp_hi, ARM, 6)
    at = lambda z: (kp_lo[0] + (z - kp_lo[1]) / (kp_hi[1] - kp_lo[1]) * (kp_hi[0] - kp_lo[0]), z)
    f.line(at(R), (TY, R), ARM, 5)
    T, I = yz(g["T"]), yz(g["I"])
    f.line(at(T[1]), T, STEER, 3)
    f.line(I, T, STEER, 3)
    f.line((0.0, I[1]), I, STEER, 5)
    f.line((0.0, I[1] - 0.03), (0.0, 0.80), STEER, 3, "8 5")
    f.dot(I, STEER, 5)
    f.dot(T, STEER, 5)
    f.label((0.0, 0.80), "stem (behind)", 6, 4, STEER)


# ---------- the forms ----------

S1 = dict(lo_in=(0.07, 0.19), lbj=(0.305, 0.15), up_in=(0.10, 0.39), ubj=(0.27, 0.35),
          T=(0.283, 0.25), I=(0.085, 0.29), sm=(0.21, 0.17), st=(0.10, 0.42))
S2 = dict(piv=(WB, 0.05, 0.235), T=(WB - A, 0.275, 0.235), I=(WB - A, 0.05, 0.235),
          sm=(WB, 0.20, 0.215), st=(WB + 0.02, 0.17, 0.465))
S3 = dict(piv=(0.78, 0.10, 0.21), T=(WB - A, 0.275, 0.24), I=(WB - A, 0.05, 0.24),
          sm=(1.03, 0.25, 0.205), st=(1.05, 0.20, 0.455))


def draw_s1():
    g, sv = S1, Svg()
    f = View(sv, 160, 560, "S1 double A-arms - front view, left half")
    front_common(f, g, g["lbj"], g["ubj"])
    f.line(g["lo_in"], g["lbj"], ARM)
    f.line(g["up_in"], g["ubj"], ARM)
    for q in (g["lo_in"], g["up_in"], g["lbj"], g["ubj"]):
        f.dot(q)
    lo_r, up_r = (0.07, ZR), (0.10, 0.42)
    f.poly([(0.0, ZR), lo_r, up_r, (0.0, 0.42)], FRAME, 3)            # front panel: posts and cross members
    f.line((0.0, ZR), up_r, FRAME, 3)                                  # its V brace
    f.tube(lo_r)
    f.tube(up_r)
    f.shock(g["sm"], g["st"])
    f.arrow((TY, -0.03), (TY, 0.06), LOAD)
    f.arrow((0.26, 0.155), (0.22, 0.165), LOAD)
    f.arrow((0.19, 0.22), (0.12, 0.38), LOAD)
    f.label(g["st"], "shock top on the upper rail", -60, -110)
    f.label(g["lo_in"], "arms' pivots on the rails", -10, 50)
    f.label(g["ubj"], "kingpin hinged in the arms' ends", 20, -150, ARM)
    f.label(g["I"], "tie rod's inner end on the pivots' line", -20, -260, STEER)
    s = View(sv, 760, 560, "S1 - side view, from the left")
    P = lambda x, z: (x - 0.60, z)
    foot = (WB - A, g["I"][1])
    x_up, x_lo, x_sh = stem_x(foot, 0.42), stem_x(foot, ZR), WB + 0.03
    b0, b1, b2 = P(x_up, ZR), P(x_lo, ZR), P(WB + 0.10, ZR)
    t0, t1, t2 = P(x_up, 0.42), P(x_sh, 0.42), P(WB + 0.10, 0.42)
    s.wheel(P(WB, R), side=True)
    s.poly([P(0.70, ZR), b0, b1, b2], FRAME)
    s.poly([P(0.70, 0.50), t0, t1, t2], FRAME)
    s.line(P(0.70, ZR), P(0.70, 0.50), FRAME, 3)
    s.line(P(0.70, ZR), t0, FRAME, 3)
    for a, b in ((b0, t0), (b2, t2), (b1, t0), (b1, t1), (t1, b2)):   # the side panel in triangles
        s.line(a, b, FRAME, 3)
    s.tube(t1)
    s.poly([P(WB + 0.10, 0.19), P(WB, 0.15), P(x_up, 0.19)], ARM)
    s.poly([P(WB + 0.10, 0.39), P(WB, 0.35), P(x_up, 0.39)], ARM)
    for q in (P(WB + 0.10, 0.19), P(x_up, 0.19), P(WB + 0.10, 0.39), P(x_up, 0.39)):
        s.dot(q)
    s.line(P(WB, 0.15), P(WB, 0.35), ARM, 6)
    s.line(P(WB, 0.25), P(WB - A, 0.25), STEER, 3)
    s.line(P(WB - A, 0.25), P(WB - A, g["I"][1]), STEER, 3)
    s.dot(P(WB - A, 0.25), STEER, 4)
    s.dot(P(WB - A, g["I"][1]), STEER, 5)
    s.line(P(*BAR), b1, STEER, 4)
    s.bearing(t0)
    s.bearing(b1)
    s.shock(P(x_sh, 0.17), t1)
    s.label(t0, "upper bearing: cross tube at a node", -260, -90, STEER)
    s.label(b1, "lower bearing: cross tube at a node", -300, 40, STEER)
    s.label(t1, "shock tops: cross tube at a node", -70, -140)
    s.arrow(P(WB - 0.10, -0.03), P(WB, -0.03), BRAKE)
    s.arrow(P(WB, 0.15), P(x_up + 0.015, 0.185), BRAKE)
    s.arrow(P(WB, 0.35), P(x_up + 0.015, 0.385), BRAKE)
    legend(sv, "Every member ends at a node and every panel is a triangle; the arms work in tension and compression, "
               "and the lower arm's outer part bends where the shock comes in.")
    return sv


def draw_s2():
    g, sv = S2, Svg()
    f = View(sv, 160, 560, "S2 one arm a side (swing axle) - front view, left half")
    kb = (0.29, 0.205)
    front_common(f, g, kb, (0.29, 0.31))
    piv = yz(g["piv"])
    f.line(piv, kb, ARM, 7)
    f.dot(piv, ARM, 7)
    f.line((0.0, ZR), (0.07, ZR), FRAME, 3)
    f.line((piv[0], ZR), piv, FRAME, 3)                                # pin block
    f.tube((0.07, ZR))
    f.poly([(0.07, ZR), (0.17, 0.47), (0.0, 0.47)], FRAME, 3)          # front hoop, ahead of the pins
    f.line((0.0, ZR), (0.17, 0.47), FRAME, 3)                          # its V brace
    f.shock(yz(g["sm"]), yz(g["st"]))
    f.arrow((TY, -0.03), (TY, 0.06), LOAD)
    f.arrow((0.21, 0.24), (0.18, 0.44), LOAD)
    f.arrow((0.14, 0.205), (0.07, 0.215), LOAD)
    f.label((0.20, 0.215), "half-axle in bending", 0, 70, ARM)
    f.label(yz(g["st"]), "shock top on the front hoop, which stands ahead of the pins", 20, -80)
    f.label(piv, "pins, fore and aft", -60, 70)
    f.label(yz(g["I"]), "tie rod's inner end on the pins' axis", -10, -260, STEER)
    s = View(sv, 760, 560, "S2 - side view, from the left")
    P = lambda x, z: (x - 0.60, z)
    foot = (WB - A, g["I"][2])
    xb, xt = stem_x(foot, ZR), stem_x(foot, 0.48)
    s.wheel(P(WB, R), side=True)
    s.line(P(0.70, ZR), P(WB + 0.10, ZR), FRAME)
    s.poly([P(WB - 0.06, ZR), P(WB - 0.06, 0.235), P(WB + 0.06, 0.235), P(WB + 0.06, ZR)], FRAME, 3)   # pin block
    s.line(P(WB - 0.06, ZR), P(WB + 0.06, 0.235), FRAME, 2)
    s.line(P(WB + 0.10, ZR), P(WB + 0.02, 0.47), FRAME)                # hoop
    s.line(P(WB - 0.06, 0.235), P(WB + 0.02, 0.47), FRAME, 3)          # its brace
    s.tube(P(WB + 0.02, 0.47))
    s.dot(P(WB - 0.06, 0.235))
    s.dot(P(WB + 0.06, 0.235))
    s.line(P(WB, 0.235), P(WB - A, 0.235), STEER, 3)
    s.dot(P(WB - A, 0.235), STEER, 5)
    s.line(P(xt - 0.07, ZR), P(xt, 0.48), FRAME, 3)                    # stem tower, a triangle
    s.line(P(xb, ZR), P(xt, 0.48), FRAME, 3)
    s.line(P(*BAR), P(xb, ZR), STEER, 4)
    s.bearing(P(xt, 0.48))
    s.bearing(P(xb, ZR))
    s.shock(P(g["sm"][0], g["sm"][2]), P(g["st"][0], g["st"][2]))
    s.label(P(xt, 0.48), "stem on a tower of its own", -260, -60, STEER)
    s.label(P(WB + 0.02, 0.47), "shock tops on the hoop", -60, -110)
    s.arrow(P(WB - 0.10, -0.03), P(WB, -0.03), BRAKE)
    s.arrow(P(WB, 0.215), P(WB - 0.055, 0.232), BRAKE)
    legend(sv, "The half-axles bend and the pins carry the whole front; the shocks need a hoop and the stem a tower. "
               "A single A-arm (P84) moves the same way, its pins out at the rails.")
    return sv


def draw_s3():
    g, sv = S3, Svg()
    f = View(sv, 160, 560, "S3 a leading arm a side - front view, left half")
    kb = (0.29, 0.17)
    front_common(f, g, kb, (0.29, 0.31))
    f.line((0.10, 0.21), (0.29, 0.20), ARM, 7)
    f.dot((0.10, 0.21), ARM, 5)
    top = yz(g["st"])
    f.poly([(0.0, ZR), (0.07, ZR), top, (0.0, top[1])], FRAME, 3)      # front hoop
    f.line((0.0, ZR), top, FRAME, 3)
    f.tube((0.07, ZR))
    f.shock(yz(g["sm"]), yz(g["st"]))
    f.arrow((TY, -0.03), (TY, 0.06), LOAD)
    f.arrow((0.25, 0.23), (0.225, 0.42), LOAD)
    f.label((0.20, 0.205), "arm, turning about a cross axis behind", -60, 70, ARM)
    f.label(yz(g["st"]), "shock top on the front hoop", 20, -80)
    s = View(sv, 760, 560, "S3 - side view, from the left")
    P = lambda x, z: (x - 0.60, z)
    piv = (g["piv"][0], g["piv"][2])
    foot = (WB - A, g["I"][2])
    xb, xt = stem_x(foot, ZR), stem_x(foot, 0.48)
    s.wheel(P(WB, R), side=True)
    s.line(P(0.66, ZR), P(WB + 0.10, ZR), FRAME)
    s.line(P(WB + 0.10, ZR), P(g["st"][0], 0.46), FRAME)               # hoop
    s.line(P(0.92, ZR), P(g["st"][0], 0.46), FRAME, 3)                 # its brace
    s.tube(P(g["st"][0], 0.46))
    s.line(P(*piv), P(WB, 0.20), ARM, 7)
    s.tube(P(*piv))
    s.line(P(WB, 0.17), P(WB, 0.31), ARM, 6)
    s.line(P(WB, 0.24), P(WB - A, 0.24), STEER, 3)
    s.dot(P(WB - A, 0.24), STEER, 5)
    s.line(P(xt - 0.07, ZR), P(xt, 0.48), FRAME, 3)                    # stem tower
    s.line(P(xb, ZR), P(xt, 0.48), FRAME, 3)
    s.line(P(*BAR), P(xb, ZR), STEER, 4)
    s.bearing(P(xt, 0.48))
    s.bearing(P(xb, ZR))
    s.shock(P(g["sm"][0], g["sm"][2]), P(g["st"][0], g["st"][2]))
    s.label(P(*piv), "arms' cross pivot, on brackets on the lower rails", -60, 50, ARM)
    s.label(P(g["st"][0], 0.46), "shock tops on the hoop", -60, -110)
    s.label(P(xt, 0.48), "stem on a tower of its own", -260, -60, STEER)
    s.arrow(P(WB - 0.10, -0.03), P(WB, -0.03), BRAKE)
    s.arrow(P(WB, 0.20), P(piv[0] + 0.03, 0.208), BRAKE)
    legend(sv, "The arm bends under the wheel load and twists under side loads; the wheel stays upright "
               "and the caster swings as the arm turns (P81, P86).")
    return sv


def draw_s4():
    sv = Svg()
    g = dict(T=(0.275, 0.235), I=(0.03, 0.235))
    f = View(sv, 160, 560, "S4 rigid beam - front view, left half")
    front_common(f, g, (0.29, 0.20), (0.29, 0.31))
    f.poly([(0.0, ZR), (0.07, ZR), (0.29, 0.20)], FRAME)
    f.tube((0.07, ZR))
    f.arrow((TY, -0.03), (TY, 0.06), LOAD)
    f.arrow((0.26, 0.19), (0.12, 0.18), LOAD)
    f.label((0.0, 0.09), "the tyre is the only spring", 0, 0, LOAD)
    s = View(sv, 760, 560, "S4 - side view, from the left")
    P = lambda x, z: (x - 0.60, z)
    foot = (WB - A, 0.235)
    xb, xt = stem_x(foot, ZR), stem_x(foot, 0.48)
    s.wheel(P(WB, R), side=True)
    s.line(P(0.70, ZR), P(WB + 0.10, ZR), FRAME)
    s.tube(P(WB, ZR))
    s.line(P(WB, 0.20), P(WB, 0.31), ARM, 6)
    s.line(P(WB, 0.235), P(WB - A, 0.235), STEER, 3)
    s.dot(P(WB - A, 0.235), STEER, 5)
    s.line(P(xt - 0.07, ZR), P(xt, 0.48), FRAME, 3)
    s.line(P(xb, ZR), P(xt, 0.48), FRAME, 3)
    s.line(P(*BAR), P(xb, ZR), STEER, 4)
    s.bearing(P(xt, 0.48))
    s.bearing(P(xb, ZR))
    s.label(P(xt, 0.48), "stem on a tower of its own", -260, -60, STEER)
    s.arrow(P(WB - 0.10, -0.03), P(WB, -0.03), BRAKE)
    s.arrow(P(WB, ZR), P(0.86, ZR + 0.01), BRAKE)
    legend(sv, "The beam is a frame member and bends; a landing reaches the frame through the tyres alone.")
    return sv


FORMS = (("S1", "front-s1", draw_s1, lambda: wishbones(S1)),
         ("S2", "front-s2", draw_s2, lambda: one_arm(S2, "yz")),
         ("S3", "front-s3", draw_s3, lambda: one_arm(S3, "xz")),
         ("S4", "front-s4", draw_s4, rigid))


def summary(rows):
    rest = min(rows, key=lambda r: abs(r["dz"]))
    span = lambda k: max(r[k] for r in rows) - min(r[k] for r in rows)
    return dict(camber=span("camber"), toe=max(abs(r["toe"]) for r in rows), caster=span("caster"),
                shock=(rows[0]["shock"], rest["shock"], rows[-1]["shock"]), track=span("track"))


def main():
    OUT.mkdir(parents=True, exist_ok=True)
    print(f"travel {DROOP * 1000:.0f} mm down to {BUMP * 1000:.0f} mm up; toe over a {A * 1000:.0f} mm steering arm")
    print("form  camber deg  toe deg  caster deg  shock droop/rest/bump mm  stroke mm  track change mm")
    for name, fig, draw, kin in FORMS:
        (OUT / f"{fig}.svg").write_text(draw().text(), encoding="utf-8", newline="\n")
        s = summary(kin())
        d, r, b = (round(v * 1000) for v in s["shock"])
        print(f"{name:5} {s['camber']:10.1f} {s['toe']:8.2f} {s['caster']:11.1f}   {d:4} / {r:3} / {b:3}"
              f"            {d - b:4}    {s['track'] * 1000:6.1f}")
    alt = dict(S3, I=(S3["piv"][0], 0.05, S3["piv"][2]))
    toe = summary(one_arm(alt, "xz"))["toe"]
    print(f"S3 with the stem's plate on the arms' pivot axis instead of beside the knuckle arms: toe {toe:.2f} deg")
    print("wrote docs/figures/front-s1.svg to front-s4.svg")


if __name__ == "__main__":
    main()
