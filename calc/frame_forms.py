"""Where the frame's welds are, and what forms A and B of docs/02-form.md 1.2.21 change: the frame as
designed, from the side and from above, every tube as it is cut (a straight run of one size through
the nodes) with a dot at each of its welded ends, and the tubes the forms take out or straighten.
Drawn from docs/data/design.json, so the figure is the design itself.

    python calc/frame_forms.py   # writes docs/figures/frame-welds.svg (run calc/design.py --write first)
"""
import json
import math
from collections import defaultdict
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
SRC, OUT = ROOT / "docs" / "data" / "design.json", ROOT / "docs" / "figures" / "frame-welds.svg"
W, H = 1320, 1080
KEEP, OUT_A, OUT_B, STRAIGHT, MOVING = "#34495e", "#c0392b", "#e67e22", "#2471a3", "#aab0b6"

# the forms' changes, by the line model's tube names (both sides where l and r)
SIDES = lambda names: [n.replace("{c}", c) for n in names for c in "lr"] if any("{c}" in n for n in names) else names
OUT_BOTH = SIDES(["n0{c}-t0{c}", "sf{c}-r{c}4"]) + ["t0l-t0r", "ufl-ufr"]          # idle in every case (1.3.21, 1.2.21)
OUT_B_ONLY = SIDES(["ts{c}-n2{c}", "n1{c}-ts{c}"]) + ["n2l-n2c", "n2c-n2r"]          # form B: the box's sides as frames
JOG = SIDES(["r{c}4-n0{c}"])                                                         # gone where the spine runs on
STRAIGHTENED = (SIDES(["r{c}0-r{c}1", "r{c}1-r{c}2", "r{c}2-r{c}3", "r{c}3-r{c}4", "n0{c}-n1{c}", "n1{c}-n3{c}", "n3{c}-n2{c}",
                       "uf{c}-sm{c}", "sm{c}-sf{c}", "ts{c}-t3{c}", "t3{c}-t2{c}"])
                + ["bel-bpl", "bpl-bpc", "bpc-bpr", "bpr-ber"])


def cut_tubes(mem):
    """Groups of member indices that are one tube as cut: collinear runs of one size and part."""
    key = lambda p: tuple(round(v, 4) for v in p)
    at = defaultdict(list)
    for i, m in enumerate(mem):
        at[key(m["a"])].append(i)
        at[key(m["b"])].append(i)
    par = list(range(len(mem)))

    def root(i):
        while par[i] != i:
            par[i] = par[par[i]]
            i = par[i]
        return i

    def away(i, q):
        m = mem[i]
        a, b = (m["a"], m["b"]) if key(m["a"]) == q else (m["b"], m["a"])
        d = [b[k] - a[k] for k in range(3)]
        n = math.sqrt(sum(c * c for c in d))
        return [c / n for c in d]
    for q, es in at.items():
        best = None
        for x in range(len(es)):
            for y in range(x + 1, len(es)):
                i, j = es[x], es[y]
                if (mem[i]["od"], mem[i]["t"], mem[i]["part"]) != (mem[j]["od"], mem[j]["t"], mem[j]["part"]):
                    continue
                if sum(u * w for u, w in zip(away(i, q), away(j, q))) < -math.cos(math.radians(3)):
                    if best is None or mem[i]["od"] > best[2]:
                        best = (i, j, mem[i]["od"])
        if best:
            par[root(best[0])] = root(best[1])
    groups = defaultdict(list)
    for i in range(len(mem)):
        groups[root(i)].append(i)
    return list(groups.values()), key


def ends_of(group, mem, key):
    """The two end points of a cut tube: the nodes used by only one of its members."""
    seen = defaultdict(int)
    pts = {}
    for i in group:
        for p in (mem[i]["a"], mem[i]["b"]):
            seen[key(p)] += 1
            pts[key(p)] = p
    return [pts[k] for k, n in seen.items() if n == 1]


class Panel:
    """A view: u to the right, v up, in metres, scale s px/m, origin at (x0, y0) px."""
    def __init__(self, out, x0, y0, s, title, ty):
        self.o, self.x0, self.y0, self.s = out, x0, y0, s
        out.append(f'<text x="40" y="{ty}" font-weight="bold">{title}</text>')

    def p(self, u, v):
        return self.x0 + u * self.s, self.y0 - v * self.s

    def line(self, a, b, color, w=3, dash=""):
        (x1, y1), (x2, y2) = self.p(*a), self.p(*b)
        d = f' stroke-dasharray="{dash}"' if dash else ""
        self.o.append(f'<line x1="{x1:.1f}" y1="{y1:.1f}" x2="{x2:.1f}" y2="{y2:.1f}" stroke="{color}" stroke-width="{w}" '
                      f'stroke-linecap="round"{d}/>')

    def dot(self, a, color, r=3.2):
        x, y = self.p(*a)
        self.o.append(f'<circle cx="{x:.1f}" cy="{y:.1f}" r="{r}" fill="#fff" stroke="{color}" stroke-width="1.6"/>')


def main():
    d = json.loads(SRC.read_text(encoding="utf-8"))
    mem = d["members"]
    groups, key = cut_tubes(mem)
    out = []
    welded = sum(2 for _ in groups) - 2
    side = Panel(out, 330, 620, 580, f"Side view, front to the right: {len(groups)} tubes as cut, {welded} welded ends (dots)", 34)
    top = Panel(out, 330, 860, 580, "From above, front to the right, the left side up", 660)
    side.line((-0.5, 0.0), (1.45, 0.0), "#ccc", 1, "4 4")     # the ground

    def colour(m):
        n = m.get("name", "")
        if m["part"] in ("swing_arm", "front_arms"):
            return MOVING, "", 2
        if n in OUT_BOTH or n in JOG:
            return OUT_A, "7 5", 3
        if n in OUT_B_ONLY:
            return OUT_B, "7 5", 3
        if n in STRAIGHTENED:
            return STRAIGHT, "", 4
        return KEEP, "", 2.5 if m["od"] < 0.04 else 3.5
    for m in sorted(mem, key=lambda m: m["a"][1] + m["b"][1]):              # the far side first
        c, dash, w = colour(m)
        side.line((m["a"][0], m["a"][2]), (m["b"][0], m["b"][2]), c, w, dash)
    for m in mem:
        c, dash, w = colour(m)
        top.line((m["a"][0], m["a"][1]), (m["b"][0], m["b"][1]), c, w, dash)
    free = {key(m["a"]) for m in mem if m.get("name", "").startswith("be")} | {key(m["b"]) for m in mem if m.get("name", "").endswith(("bel", "ber"))}
    for g in groups:
        col = MOVING if mem[g[0]]["part"] in ("swing_arm", "front_arms") else KEEP
        for p in ends_of(g, mem, key):
            if key(p) in free:
                continue
            side.dot((p[0], p[2]), col)
            top.dot((p[0], p[1]), col)
    legend = [(KEEP, "", "kept"), (OUT_A, "7 5", "out in forms A and B"), (OUT_B, "7 5", "out in form B only"),
              (STRAIGHT, "", "straightened in A and B"), (MOVING, "", "swing arm and A-arms, unchanged")]
    for i, (c, dash, t) in enumerate(legend):
        x = 40 + 255 * i
        d_ = f' stroke-dasharray="{dash}"' if dash else ""
        out.append(f'<line x1="{x}" y1="{H - 20}" x2="{x + 30}" y2="{H - 20}" stroke="{c}" stroke-width="4"{d_}/>'
                   f'<text x="{x + 36}" y="{H - 15}" font-size="12">{t}</text>')
    svg = (f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 {W} {H}" font-family="sans-serif" font-size="13">'
           f'<rect width="{W}" height="{H}" fill="#fff"/>' + "".join(out) + "</svg>\n")
    OUT.write_text(svg, encoding="utf-8", newline="\n")
    print("wrote", OUT.relative_to(ROOT), len(groups), "tubes", welded, "welded ends")


if __name__ == "__main__":
    main()
