"""Line diagram of the front end as designed (D-041, docs/03-design.md 1.3.20): the left corner in front
view at full droop, at rest, and at full bump; both corners from above at the lock; and the nose box
from the side. Everything is drawn from docs/data/design.json, so the figure is the design itself.

    python calc/front_lines.py   # writes docs/figures/front-lines.svg (run calc/design.py --write first)
"""
import json
import math
from pathlib import Path

import numpy as np

import front

ROOT = Path(__file__).resolve().parents[1]
SRC, OUT = ROOT / "docs" / "data" / "design.json", ROOT / "docs" / "figures" / "front-lines.svg"
W, H = 1320, 700
FRAME, ARM, SHOCK, STEER, GREY = "#c0392b", "#2c3e50", "#d4a017", "#1e8449", "#888"


class Panel:
    """A view: horizontal coordinate u to the right, v up, in metres, scale s px/m, origin at (x0, y0) px."""
    def __init__(self, out, x0, y0, s, title):
        self.o, self.x0, self.y0, self.s = out, x0, y0, s
        out.append(f'<text x="{x0}" y="40" font-weight="bold">{title}</text>')

    def p(self, u, v):
        return self.x0 + u * self.s, self.y0 - v * self.s

    def line(self, a, b, color, w=3, dash="", op=1.0):
        (x1, y1), (x2, y2) = self.p(*a), self.p(*b)
        d = f' stroke-dasharray="{dash}"' if dash else ""
        self.o.append(f'<line x1="{x1:.1f}" y1="{y1:.1f}" x2="{x2:.1f}" y2="{y2:.1f}" stroke="{color}" stroke-width="{w}" '
                      f'stroke-linecap="round" opacity="{op}"{d}/>')

    def poly(self, pts, color, w=2, dash="", fill="none", op=1.0):
        d = f' stroke-dasharray="{dash}"' if dash else ""
        q = " ".join(f"{x:.1f},{y:.1f}" for x, y in (self.p(*a) for a in pts))
        self.o.append(f'<polygon points="{q}" fill="{fill}" stroke="{color}" stroke-width="{w}" opacity="{op}"{d}/>')

    def dot(self, a, color, r=4, fill="#fff"):
        x, y = self.p(*a)
        self.o.append(f'<circle cx="{x:.1f}" cy="{y:.1f}" r="{r}" fill="{fill}" stroke="{color}" stroke-width="2"/>')

    def text(self, a, t, dx=6, dy=-6, color="#222", size=13):
        x, y = self.p(*a)
        self.o.append(f'<text x="{x + dx:.1f}" y="{y + dy:.1f}" fill="{color}" font-size="{size}">{t}</text>')


def main():
    d = json.loads(SRC.read_text(encoding="utf-8"))
    fs = d["front_suspension"]
    g = front.from_json(fs["points"])
    bump, droop, bar = fs["bump"], fs["droop"], math.radians(fs["lock_bar_deg"])
    cl, cr = front.Corner(g, 1), front.Corner(g, -1)
    out = []

    # ---- front view of the left corner (y across, z up)
    f = Panel(out, 90, 560, 900, "Front view, left corner, against the frame: full droop (dashed), at rest, full bump (light)")
    f.line((-0.02, 0.0), (0.56, 0.0), GREY, 1, "4 4")
    f.line((-0.02, 0.15), (0.56, 0.15), "#bbb", 1, "2 6")
    f.text((0.47, 0.15), "150 mm", 0, -4, GREY, 11)
    yz = lambda p: (float(p[1]), float(p[2]))
    rows = []
    for rise, style, op in ((-droop, "6 4", 0.9), (bump, "", 0.35), (0.0, "", 1.0)):
        pose = cl.pose(rise)
        lo, up, kn = pose["lower"], pose["upper"], pose["knuckle"]
        p = cl.p
        w = 3 if rise == 0 else 2
        f.line(yz(p["lo_f"]), yz(lo(p["lbj"])), ARM, w, style, op)
        f.line(yz(p["up_f"]), yz(up(p["ubj"])), ARM, w, style, op)
        f.line(yz(kn(p["lbj"])), yz(kn(p["ubj"])), ARM, w + 2, style, op)
        f.line(yz(kn(p["hub"])), yz(kn(p["wheel"])), ARM, w, style, op)
        f.line(yz(lo(p["sh_lo"])), yz(p["sh_top"]), SHOCK, w + 1, style, op)
        f.line(yz(p["tie_in"]), yz(kn(p["tip"])), STEER, w - 1, style, op)
        wc, ax = kn(p["wheel"]), kn.vec([0.0, 1.0, 0.0])
        up_ = np.cross([1.0, 0.0, 0.0], ax)
        hw, R = 0.089, g["r"]
        corners = [wc + sa * hw * ax + sb * R * up_ for sa, sb in ((-1, -1), (1, -1), (1, 1), (-1, 1))]
        f.poly([yz(c) for c in corners], GREY, 1.5, style, op=op)
        rows.append((rise, cl.report(pose)))
    for q in ("lo_f", "up_f"):
        f.dot(yz(cl.p[q]), ARM)
    f.dot(yz(cl.p["sh_top"]), SHOCK)
    f.dot(yz(cl.p["tie_in"]), STEER)
    f.text(yz(cl.p["lo_f"]), "lower pivot", -40, 30)
    f.text(yz(cl.p["up_f"]), "upper pivot", -40, -12)
    f.text(yz(cl.p["sh_top"]), "shock top", 8, -8)
    f.text(yz(cl.p["tie_in"]), "tie rod's inner end", 4, 26, STEER)
    rest = dict(rows)[0.0]
    r0, r1 = dict(rows)[-droop], dict(rows)[bump]
    lines = [f"camber {r0['camber'] - rest['camber']:+.2f} / {r1['camber'] - rest['camber']:+.2f} deg at droop / bump",
             f"toe {r0['steer']:+.2f} / {r1['steer']:+.2f} deg, track {r0['track'] * 1000:+.1f} / {r1['track'] * 1000:+.1f} mm",
             f"shock {r0['shock'] * 1000:.0f} / {rest['shock'] * 1000:.0f} / {r1['shock'] * 1000:.0f} mm"]
    for i, t in enumerate(lines):
        out.append(f'<text x="90" y="{600 + 20 * i}" font-size="13">{t}</text>')

    # ---- plan view at the lock (x up the page, y to the left)
    pl = Panel(out, 980, 290, 330, "")
    out.append('<text x="760" y="40" font-weight="bold">From above at the lock (bar turned left)</text>')
    xy = lambda p: (-float(p[1]), float(p[0]) - 0.95)
    pl.line(xy((g["wb"], -0.5, 0)), xy((g["wb"], 0.5, 0)), GREY, 1, "4 4")
    ti_l, ti_r = cl.tie_inner(bar), cr.tie_inner(bar)
    pl.line(xy(ti_l), xy(ti_r), STEER, 5)
    pl.dot(xy(g["stem_foot"]), STEER, 5)
    for c in (cl, cr):
        pose = c.pose(0.0, bar)
        kn, rep = pose["knuckle"], c.report(pose)
        p = c.p
        for q in ("lo_f", "lo_r"):
            pl.line(xy(p[q]), xy(pose["lower"](p["lbj"])), ARM, 2)
        pl.line(xy(c.tie_inner(bar)), xy(kn(p["tip"])), STEER, 2.5)
        pl.line(xy(kn(p["hub"])), xy(kn(p["tip"])), STEER, 2.5)
        wc, ax = kn(p["wheel"]), kn.vec([0.0, 1.0, 0.0])
        fwd = np.cross(ax, [0.0, 0.0, 1.0])
        fwd = fwd / np.linalg.norm(fwd)
        hw, R = 0.089, g["r"]
        pl.poly([xy(wc + sa * hw * ax + sb * R * fwd) for sa, sb in ((-1, -1), (1, -1), (1, 1), (-1, 1))], GREY, 2)
        pl.line(xy(wc - 0.5 * fwd), xy(wc + 0.5 * fwd), GREY, 1, "3 5")
        side = "inner" if c.s > 0 else "outer"
        pl.text(xy(wc + R * fwd), f"{side} {rep['steer']:.1f} deg", -40, -10)
    wb, tk = g["wb"], 2 * (g["hub"][1] + g["r"] * math.tan(math.atan((cl.p["lbj"][1] - cl.p["ubj"][1]) / (cl.p["ubj"][2] - cl.p["lbj"][2]))))
    inner = cl.report(cl.pose(0.0, bar))["steer"]
    ideal = math.degrees(math.atan(wb / (wb / math.tan(math.radians(inner)) + tk)))
    out.append(f'<text x="760" y="62" font-size="12" fill="#444">bar {math.degrees(bar):.1f} deg; the outer wheel would turn '
               f'{ideal:.1f} deg for one turning centre</text>')

    # ---- side view of the nose box (x to the right, z up)
    sd = Panel(out, 800, 680, 420, "")
    out.append('<text x="760" y="425" font-weight="bold">The nose box from the left</text>')
    for m in d["members"]:
        a, b = m["a"], m["b"]
        if min(a[0], b[0]) < 0.6 or a[1] < -0.01 or b[1] < -0.01 or max(a[2], b[2]) > 0.62:
            continue
        col = ARM if m.get("front_arm") else FRAME
        sd.line((a[0] - 0.62, a[2]), (b[0] - 0.62, b[2]), col, 2 if m["od"] < 0.03 else 3)
    top = g["stem_foot"] + (0.62 - g["stem_foot"][2]) / g["stem_axis"][2] * g["stem_axis"]
    sd.line((g["stem_foot"][0] - 0.62, g["stem_foot"][2]), (top[0] - 0.62, top[2]), STEER, 3)
    sd.line((g["sh_lo"][0] - 0.62, g["sh_lo"][2]), (g["sh_top"][0] - 0.62, g["sh_top"][2]), SHOCK, 3)
    cx, cz = g["wheel"][0] - 0.62, g["wheel"][2]
    out.append(f'<circle cx="{sd.p(cx, cz)[0]:.1f}" cy="{sd.p(cx, cz)[1]:.1f}" r="{g["r"] * 420:.1f}" fill="none" stroke="{GREY}" stroke-width="1.5"/>')

    legend = [(FRAME, "frame"), (ARM, "arm, knuckle"), (SHOCK, "shock"), (STEER, "stem, plate, tie rod")]
    for i, (c, t) in enumerate(legend):
        x = 90 + 170 * i
        out.append(f'<line x1="{x}" y1="{H - 18}" x2="{x + 26}" y2="{H - 18}" stroke="{c}" stroke-width="4"/>'
                   f'<text x="{x + 32}" y="{H - 13}" font-size="12">{t}</text>')
    svg = (f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 {W} {H}" font-family="sans-serif" font-size="13">'
           f'<rect width="{W}" height="{H}" fill="#fff"/>' + "".join(out) + "</svg>\n")
    OUT.write_text(svg, encoding="utf-8", newline="\n")
    print("wrote", OUT.relative_to(ROOT))


if __name__ == "__main__":
    main()
