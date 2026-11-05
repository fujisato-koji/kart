// Where the moving parts go when the springs work and the bar turns, for the 3D view's animation.
// The kinematics are calc/front.py's: design.json front_suspension.motion holds the front corners' poses
// on a grid of the wheel's rise and the bar's angle, interpolated here; the rear swing arm turns about
// the y axis through rear_suspension.pivot. Which part follows which motion is the interference search's
// rule (calc/clash.py). Plain arrays and no three.js, so that tools/test_motion.mjs can check it.
// A motion is { R: 3x3 rows, t: [3] }, p -> R p + t, in the kart's axes (x forward, y left, z up).

export const MOTIONS = [
  ['rear', '後ろのばね'], ['front', '前のばね（左右とも）'], ['roll', '前のばね（左右交互）'],
  ['steer', 'ハンドル'], ['bump', '段差を越える'],
];
export const MOTION_VIEW = { rear: 'side', front: 'front', roll: 'front', steer: 'top', bump: 'side' };
export const PERIOD_S = { rear: 4, front: 4, roll: 4, steer: 5, bump: 5 };

const I3 = [[1, 0, 0], [0, 1, 0], [0, 0, 1]];
export const IDENT = { R: I3, t: [0, 0, 0] };
const mulV = (R, p) => [0, 1, 2].map((i) => R[i][0] * p[0] + R[i][1] * p[1] + R[i][2] * p[2]);
export const apply = (m, p) => { const q = mulV(m.R, p); return [q[0] + m.t[0], q[1] + m.t[1], q[2] + m.t[2]]; };
export const applyVec = (m, v) => mulV(m.R, v);
export const dist = (a, b) => Math.hypot(a[0] - b[0], a[1] - b[1], a[2] - b[2]);
// the turn by a (rad) about the axis u (unit) through c
export function turn(u, a, c) {
  const [x, y, z] = u, co = Math.cos(a), si = Math.sin(a), k = 1 - co;
  const R = [[co + x * x * k, x * y * k - z * si, x * z * k + y * si],
    [y * x * k + z * si, co + y * y * k, y * z * k - x * si],
    [z * x * k - y * si, z * y * k + x * si, co + z * z * k]];
  const Rc = mulV(R, c);
  return { R, t: [c[0] - Rc[0], c[1] - Rc[1], c[2] - Rc[2]] };
}
function fromQuat([x, y, z, w]) {
  return [[1 - 2 * (y * y + z * z), 2 * (x * y - z * w), 2 * (x * z + y * w)],
    [2 * (x * y + z * w), 1 - 2 * (x * x + z * z), 2 * (y * z - x * w)],
    [2 * (x * z - y * w), 2 * (y * z + x * w), 1 - 2 * (x * x + y * y)]];
}
const unit = (v) => { const n = Math.hypot(...v); return v.map((c) => c / n); };

// ---- the state of each motion at a phase in [0, 1): rear arm (deg, + lifts the wheel), front wheels'
// rise (m), bar (deg, + turns left)
const swing = (u, up, down) => (u >= 0 ? u * up : u * down);
export function stateAt(design, key, phase) {
  const fs = design.front_suspension, rs = design.rear_suspension;
  const s = { rear: 0, l: 0, r: 0, bar: 0 };
  const u = Math.sin(2 * Math.PI * phase);
  const front = (v) => swing(v, fs.bump, fs.droop), rear = (v) => swing(v, rs.bump_deg, rs.droop_deg);
  const pulse = (a) => { const x = (phase - a) / 0.35; return x >= 0 && x < 1 ? Math.sin(2 * Math.PI * x) : 0; };
  if (key === 'rear') s.rear = rear(u);
  else if (key === 'front') s.l = s.r = front(u);
  else if (key === 'roll') { s.l = front(u); s.r = front(-u); }
  else if (key === 'steer') s.bar = fs.lock_bar_deg * u;
  else if (key === 'bump') { s.l = s.r = front(pulse(0.05)); s.rear = rear(pulse(0.5)); }   // the front wheels meet it first
  return s;
}

// ---- the motions of a state
function corner(m, side, rise, bar) {
  const S = m[side], ri = m.rise, bi = m.bar_deg;
  const at = (arr, v) => { const f = Math.min(Math.max((v - arr[0]) / (arr[1] - arr[0]), 0), arr.length - 1); const i = Math.min(Math.floor(f), arr.length - 2); return [i, f - i]; };
  const [i, fi] = at(ri, rise), [j, fj] = at(bi, bar);
  const w = [[i, j, (1 - fi) * (1 - fj)], [i + 1, j, fi * (1 - fj)], [i, j + 1, (1 - fi) * fj], [i + 1, j + 1, fi * fj]];
  const mix = (get) => w.reduce((a, [p, q, k]) => a + k * get(p, q), 0);
  const lo = mix((p, q) => S.lower[p][q]), up = mix((p, q) => S.upper[p][q]);
  const q0 = S.knuckle[i][j];
  const quat = unit([0, 1, 2, 3].map((n) => w.reduce((a, [p, q, k]) => {
    const e = S.knuckle[p][q], sg = e[0] * q0[0] + e[1] * q0[1] + e[2] * q0[2] + e[3] * q0[3] < 0 ? -1 : 1;
    return a + k * sg * e[n];
  }, 0)));
  const d = [4, 5, 6].map((n) => mix((p, q) => S.knuckle[p][q][n]));
  const R = fromQuat(quat), Rc = mulV(R, S.c);
  return {
    lower: turn([1, 0, 0], lo, S.lo), upper: turn([1, 0, 0], up, S.up),
    knuckle: { R, t: [0, 1, 2].map((n) => S.c[n] - Rc[n] + d[n]) },
  };
}
export function motionsOf(design, s) {
  const fs = design.front_suspension, rs = design.rear_suspension, P = fs.points;
  const out = { rear: IDENT, stem: IDENT };
  if (rs) out.rear = turn([0, 1, 0], s.rear * Math.PI / 180, [rs.pivot[0], 0, rs.pivot[1]]);
  out.stem = turn(unit(P.stem_axis), s.bar * Math.PI / 180, P.stem_foot);
  for (const side of ['l', 'r']) {
    const c = corner(fs.motion, side, s[side], s.bar);
    for (const k of ['lower', 'upper', 'knuckle']) out[side + '.' + k] = c[k];
  }
  return out;
}

// ---- which motion a part follows (calc/clash.py's rule): a key of motionsOf, or a part rebuilt between
// two moving ends ('shock', 'chain', 'tie'), or null for the frame and what is fixed to it
const STEM_TYPES = new Set(['handlebar', 'mirror', 'gauge', 'lever']);
export function moverOfMember(mb) {
  if (mb.arm === true) return 'rear';
  if (mb.front_arm) return mb.front_arm + '.' + (mb.front_link || 'knuckle');
  return null;
}
export function moverOfItem(it) {
  if (it.type === 'chain') return 'chain';
  if (it.type === 'shock') return 'shock';
  if (it.part === 'tie_rods') return 'tie';
  if (it.arm === true) return 'rear';
  if (it.front_arm) return it.front_arm + '.' + (it.front_link || 'knuckle');
  if (it.steers) return (it.pos[1] > 0 ? 'l' : 'r') + '.knuckle';
  if (STEM_TYPES.has(it.type) || (it.part === 'handlebar' && (it.type === 'rod' || it.type === 'arm')) || (it.type === 'lamp' && it.role === 'head')) return 'stem';
  return null;
}
// the ends of a part rebuilt between moving ends: a shock's lower eye (pos) follows its lower arm or the
// swing arm, a chain's rear sprocket (to) the swing arm, a tie rod's inner end the stem and its outer end
// its knuckle
export function endsOf(it, mv) {
  if (it.type === 'shock') return { pos: apply(it.front_arm ? mv[it.front_arm + '.lower'] : mv.rear, it.pos), to: it.to };
  if (it.type === 'chain') return { pos: it.pos, to: apply(mv.rear, it.to) };
  if (it.part === 'tie_rods') return { pos: apply(mv.stem, it.pos), to: apply(mv[(it.to[1] > 0 ? 'l' : 'r') + '.knuckle'], it.to) };
  return { pos: it.pos, to: it.to };
}

// ---- what the panel says: the wheels' travel, the shocks' lengths, the wheels' steer
export function readout(design, s, mv) {
  const items = design.items, out = { rear: null, front: {}, steer: null };
  const axle = items.find((it) => it.type === 'cyl' && it.part === 'axle_shaft');
  const rshock = items.find((it) => it.type === 'shock' && !it.front_arm);
  if (axle && rshock) {
    out.rear = { deg: s.rear, rise: apply(mv.rear, axle.pos)[2] - axle.pos[2],
      len: dist(endsOf(rshock, mv).pos, rshock.to), len0: dist(rshock.pos, rshock.to), free: rshock.eye };
  }
  for (const side of ['l', 'r']) {
    const sh = items.find((it) => it.type === 'shock' && it.front_arm === side);
    const sg = side === 'l' ? 1 : -1, ax = applyVec(mv[side + '.knuckle'], [0, sg, 0]);
    out.front[side] = { rise: s[side], steer: Math.atan2(-ax[0] * sg, ax[1] * sg) * 180 / Math.PI,
      len: sh ? dist(endsOf(sh, mv).pos, sh.to) : null, len0: sh ? dist(sh.pos, sh.to) : null, free: sh ? sh.eye : null };
  }
  out.steer = s.bar;
  return out;
}
