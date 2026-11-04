"""Static analysis of the kart's frame as a space frame of steel tubes (step 1.3, Q-035).

Each tube is a straight Euler-Bernoulli beam with six degrees of freedom at each end; a shock
absorber is a pin-ended link that carries only its axial force; a pivot couples two nodes in
every direction but one rotation. calc/design.py builds the nodes, tubes, loads, and supports
and reads back the stresses.

    from frame import solve
    res = solve(nodes, members, loads, supports, hinges=[], links=[])

nodes    {name: (x, y, z)} in metres
members  [{"a": name, "b": name, "od": m, "t": m, "tag": str}] tubes
loads    {name: (Fx, Fy, Fz)} in newtons
supports {name: "xyz"} the translations held at that node
hinges   [(name_a, name_b, "y")] two coincident nodes joined except for rotation about that axis
links    [(name_a, name_b)] pin-ended axial links (a shock taken as rigid)
returns  {"stress": [MPa per member, von Mises at the worse end], "axial": [N per member],
          "link_force": [N per link, tension positive], "disp": {name: (dx, dy, dz)}}
"""
import numpy as np

E = 205e9          # steel, Pa
G_SHEAR = 79e9
STIFF = 1e12       # penalty stiffness for the pivots


def section(od, t):
    di = od - 2 * t
    a = np.pi * (od ** 2 - di ** 2) / 4
    i = np.pi * (od ** 4 - di ** 4) / 64
    return a, i, 2 * i, i / (od / 2)       # area, second moment, polar moment, section modulus


def frame_axes(pa, pb):
    ex = pb - pa
    length = np.linalg.norm(ex)
    ex = ex / length
    ref = np.array([0.0, 0.0, 1.0]) if abs(ex[2]) < 0.95 else np.array([1.0, 0.0, 0.0])
    ey = np.cross(ref, ex)
    ey /= np.linalg.norm(ey)
    ez = np.cross(ex, ey)
    return length, np.vstack([ex, ey, ez])


def beam_k(length, a, i, j):
    """Local stiffness of a 3D beam (x along the beam), dofs u v w rx ry rz at each end."""
    k = np.zeros((12, 12))
    ea, gj = E * a / length, G_SHEAR * j / length
    b12, b6, b4, b2 = 12 * E * i / length ** 3, 6 * E * i / length ** 2, 4 * E * i / length, 2 * E * i / length
    k[0, 0] = k[6, 6] = ea
    k[0, 6] = k[6, 0] = -ea
    k[3, 3] = k[9, 9] = gj
    k[3, 9] = k[9, 3] = -gj
    for v, r, s in ((1, 5, 1), (2, 4, -1)):          # bending in the local xy plane, then xz
        k[v, v] = k[v + 6, v + 6] = b12
        k[v, v + 6] = k[v + 6, v] = -b12
        k[v, r] = k[r, v] = s * b6
        k[v, r + 6] = k[r + 6, v] = s * b6
        k[v + 6, r] = k[r, v + 6] = -s * b6
        k[v + 6, r + 6] = k[r + 6, v + 6] = -s * b6
        k[r, r] = k[r + 6, r + 6] = b4
        k[r, r + 6] = k[r + 6, r] = b2
    return k


def solve(nodes, members, loads, supports, hinges=(), links=()):
    names = list(nodes)
    idx = {n: i for i, n in enumerate(names)}
    ndof = 6 * len(names)
    K = np.zeros((ndof, ndof))
    P = np.array([np.asarray(nodes[n], float) for n in names])
    elems = []
    for m in members:
        ia, ib = idx[m["a"]], idx[m["b"]]
        length, R3 = frame_axes(P[ia], P[ib])
        a, i, j, z = section(m["od"], m["t"])
        T = np.zeros((12, 12))
        for q in range(4):
            T[3 * q:3 * q + 3, 3 * q:3 * q + 3] = R3
        kl = beam_k(length, a, i, j)
        dofs = list(range(6 * ia, 6 * ia + 6)) + list(range(6 * ib, 6 * ib + 6))
        K[np.ix_(dofs, dofs)] += T.T @ kl @ T
        elems.append((dofs, T, kl, a, z))
    link_axes = []
    for na, nb in links:
        ia, ib = idx[na], idx[nb]
        e = P[ib] - P[ia]
        length = np.linalg.norm(e)
        e = e / length
        ka = STIFF / 1e3
        ke = ka * np.outer(e, e)
        da, db = list(range(6 * ia, 6 * ia + 3)), list(range(6 * ib, 6 * ib + 3))
        K[np.ix_(da, da)] += ke
        K[np.ix_(db, db)] += ke
        K[np.ix_(da, db)] -= ke
        K[np.ix_(db, da)] -= ke
        link_axes.append((da, db, e, ka))
    for na, nb, free in hinges:
        ia, ib = idx[na], idx[nb]
        free_r = 3 + "xyz".index(free)
        for d in range(6):
            if d == free_r:
                continue
            p, q = 6 * ia + d, 6 * ib + d
            K[p, p] += STIFF
            K[q, q] += STIFF
            K[p, q] -= STIFF
            K[q, p] -= STIFF
    F = np.zeros(ndof)
    for n, f in loads.items():
        F[6 * idx[n]:6 * idx[n] + 3] += f
    fixed = [6 * idx[n] + "xyz".index(c) for n, cs in supports.items() for c in cs]
    free = np.setdiff1d(np.arange(ndof), fixed)
    # rotations of nodes that only links reach would be singular; a tiny spring holds them
    K[np.arange(ndof), np.arange(ndof)] += 1e-3
    U = np.zeros(ndof)
    U[free] = np.linalg.solve(K[np.ix_(free, free)], F[free])
    stress, axial = [], []
    for dofs, T, kl, a, z in elems:
        f = kl @ (T @ U[dofs])             # end forces in local axes
        worst = 0.0
        for e0 in (0, 6):
            n_, t_ = f[e0], f[e0 + 3]
            mb = np.hypot(f[e0 + 4], f[e0 + 5])
            sig = abs(n_) / a + mb / z
            tau = abs(t_) / (2 * z)
            worst = max(worst, np.sqrt(sig ** 2 + 3 * tau ** 2))
        stress.append(worst / 1e6)
        axial.append(-f[0])               # tension positive
    link_force = [float(ka * e @ (U[db] - U[da])) for da, db, e, ka in link_axes]
    disp = {n: tuple(U[6 * idx[n]:6 * idx[n] + 3]) for n in names}
    return {"stress": stress, "axial": axial, "link_force": link_force, "disp": disp}
