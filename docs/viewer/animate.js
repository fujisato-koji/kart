// The 3D view's animation: moves the kart's groups (model.js) by the motions of motion.js, rebuilds the
// shocks, the chain and the tie rods between their moving ends, turns the rider's hands with the bar,
// and marks the axes the parts turn about. The frame is held still; on the ground it is the frame that
// rises and falls over the wheels.
import * as THREE from 'three';
import { buildItem, riderArms, makeLabel } from './model.js';
import { stateAt, motionsOf, moverOfItem, moverOfMember, endsOf, readout, apply } from './motion.js';

const toM4 = (m) => new THREE.Matrix4().set(
  m.R[0][0], m.R[0][1], m.R[0][2], m.t[0], m.R[1][0], m.R[1][1], m.R[1][2], m.t[1], m.R[2][0], m.R[2][1], m.R[2][2], m.t[2], 0, 0, 0, 1);
const V = (a) => new THREE.Vector3(a[0], a[1], a[2]);
const REST = { rear: 0, l: 0, r: 0, bar: 0 };
const AXIS = new THREE.MeshBasicMaterial({ color: 0xff7a00, depthTest: false, transparent: true, opacity: 0.9 });

function dispose(o) { o.traverse((c) => { if (c.geometry) c.geometry.dispose(); if (c.isInstancedMesh) c.dispose(); }); }

// opts: onRebuild(object) after a part is rebuilt (to give it the view's materials), rider() -> { obj, kind } or null
export function makeAnimator(design, kart, groups, opts = {}) {
  const ctx = { design }, moving = [], dynamic = [];
  for (const g of groups) {
    const u = g.userData;
    let key = u.src ? moverOfItem(u.src) : u.mb ? moverOfMember(u.mb) : null;
    if (u.mbs) { const ks = new Set(u.mbs.map(moverOfMember)); key = ks.size === 1 ? [...ks][0] : null; }   // a weld at a pivot stays
    if (!key) continue;
    g.updateMatrix();
    if (key === 'shock' || key === 'chain' || key === 'tie') { dynamic.push({ g, it: u.src, z0: g.position.z, last: '' }); continue; }
    const stay = [];
    g.traverse((o) => { if (o.userData.stay) { o.updateMatrix(); stay.push({ o, m0: o.matrix.clone() }); } });
    moving.push({ g, key, m0: g.matrix.clone(), stay });
  }

  // ---- the axes: the swing arm's pivot, the A-arms' pivots, the kingpins (turning with the knuckles), the stem
  const P = design.front_suspension.points, rs = design.rear_suspension;
  const markers = new THREE.Group(); markers.name = 'axes'; markers.visible = false; kart.add(markers);
  const sets = {};
  const line = (a, b, set, mover) => {
    const A = V(a), B = V(b), d = B.clone().sub(A), m = new THREE.Mesh(new THREE.CylinderGeometry(0.004, 0.004, d.length(), 8), AXIS);
    m.position.copy(A).lerp(B, 0.5); m.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), d.normalize()); m.renderOrder = 999;
    m.userData.mover = mover; (sets[set] = sets[set] || []).push(m); markers.add(m);
    for (const p of [A, B]) {   // a ring at each end, seen end-on when the axis points at the eye
      const ring = new THREE.Mesh(new THREE.TorusGeometry(0.022, 0.004, 8, 24), AXIS);
      ring.position.copy(p); ring.quaternion.setFromUnitVectors(new THREE.Vector3(0, 0, 1), d); ring.renderOrder = 999;
      ring.userData.mover = mover; sets[set].push(ring); markers.add(ring);
    }
    return m;
  };
  const label = (text, at, set, mover) => {
    const s = makeLabel(text, 0.016, '#8a3c00', 'rgba(255,248,238,0.95)'); s.position.copy(V(at)); s.userData.mover = mover;
    s.material.sizeAttenuation = false;   // the same size on the screen, near or far
    (sets[set] = sets[set] || []).push(s); markers.add(s); return s;
  };
  const sleeves = design.items.filter((it) => it.part === 'swing_arm' && it.type === 'cyl');
  const yp = Math.max(0.1, ...sleeves.map((it) => Math.abs(it.pos[1]))) + 0.06;
  if (rs) {
    line([rs.pivot[0], -yp, rs.pivot[1]], [rs.pivot[0], yp, rs.pivot[1]], 'pivot');
    label('スイングアームの支点（ここで回る）', [rs.pivot[0], yp + 0.02, rs.pivot[1] + 0.06], 'pivot');
  }
  const rshock = design.items.find((it) => it.type === 'shock' && !it.front_arm);
  if (rshock) label('ばねと緩衝器（ここが縮む）', [rshock.to[0] - 0.05, 0.12, rshock.to[2] + 0.04], 'pivot');
  for (const sg of [1, -1]) {
    const m = (p) => [p[0], sg * p[1], p[2]], side = sg > 0 ? 'l' : 'r';
    for (const [f, r] of [['lo_f', 'lo_r'], ['up_f', 'up_r']]) line(m([P[f][0] + 0.03, P[f][1], P[f][2]]), m([P[r][0] - 0.03, P[r][1], P[r][2]]), 'arms');
    const lo = m(P.lbj), up = m(P.ubj), d = [up[0] - lo[0], up[1] - lo[1], up[2] - lo[2]];
    line(lo.map((c, i) => c - d[i] * 0.2), up.map((c, i) => c + d[i] * 0.2), 'kingpin', side + '.knuckle');
  }
  label('A アームの支点', [P.lo_f[0] + 0.06, P.lo_f[1] + 0.05, P.lo_f[2] - 0.04], 'arms');
  const fshock = design.items.find((it) => it.type === 'shock' && it.front_arm === 'l');
  if (fshock) label('ばねと緩衝器', [fshock.to[0] + 0.04, fshock.to[1] + 0.12, fshock.to[2] + 0.03], 'arms');
  label('キングピン（前輪が向きを変える軸）', [P.ubj[0] + 0.04, P.ubj[1] + 0.12, P.ubj[2] + 0.08], 'kingpinLabel', 'l.knuckle');
  const ax = P.stem_axis, n = Math.hypot(...ax), top = (P.bar[2] - P.stem_foot[2]) / (ax[2] / n);
  line(P.stem_foot.map((c, i) => c - ax[i] / n * 0.05), P.stem_foot.map((c, i) => c + ax[i] / n * top), 'stem');
  label('ハンドルの軸', P.stem_foot.map((c, i) => c + ax[i] / n * top * 0.55).map((c, i) => c + [0, 0.1, 0][i]), 'stem');
  for (const o of markers.children) { o.updateMatrix(); o.userData.m0 = o.matrix.clone(); }
  const SHOW = { rear: ['pivot'], front: ['arms', 'kingpin'], roll: ['arms', 'kingpin'], steer: ['stem', 'kingpin', 'kingpinLabel'], bump: ['pivot', 'arms'] };

  function rebuild(d, ends) {
    const nb = buildItem({ ...d.it, pos: ends.pos, to: ends.to }, ctx);
    for (const c of [...d.g.children]) { d.g.remove(c); dispose(c); }
    for (const c of [...nb.children]) { c.traverse((o) => { o.userData.part = d.g.userData.part; }); d.g.add(c); }
    d.z0 = nb.position.z; d.g.position.x = nb.position.x; d.g.position.y = nb.position.y;
    if (opts.onRebuild) opts.onRebuild(d.g);
  }
  let lastBar = null, lastRider = null;

  // pose the kart for motion key at phase (key '' = at rest); returns the panel's numbers
  function pose(key, phase, lift) {
    const s = key ? stateAt(design, key, phase) : REST, mv = motionsOf(design, s);
    const L = new THREE.Matrix4();
    for (const e of moving) {
      const M = toM4(mv[e.key]);
      L.makeTranslation(0, 0, e.g.userData.ground ? 0 : lift).multiply(M).multiply(e.m0).decompose(e.g.position, e.g.quaternion, e.g.scale);
      if (e.stay.length) {   // what is drawn with the part but sits on the frame turns back
        const U = e.m0.clone().invert().multiply(M.clone().invert()).multiply(e.m0);
        for (const st of e.stay) U.clone().multiply(st.m0).decompose(st.o.position, st.o.quaternion, st.o.scale);
      }
    }
    for (const d of dynamic) {
      const ends = endsOf(d.it, mv), sig = ends.pos.concat(ends.to).map((v) => v.toFixed(5)).join();
      if (sig !== d.last) { rebuild(d, ends); d.last = sig; }
      d.g.position.z = d.z0 + lift;
    }
    const rd = opts.rider && opts.rider();
    if (rd && (rd.obj !== lastRider || s.bar !== lastBar)) {   // the hands stay on the grips
      const inner = rd.obj.getObjectByName('rider'), old = inner && inner.getObjectByName('arms');
      if (old) { inner.remove(old); dispose(old); }
      if (inner) { const a = riderArms(design, rd.kind, s.bar ? (p) => apply(mv.stem, p) : null); inner.add(a); if (opts.onRebuild) opts.onRebuild(a); }
      lastRider = rd.obj; lastBar = s.bar;
    }
    const on = new Set(SHOW[key] || []);
    markers.visible = on.size > 0; markers.position.z = lift;
    for (const [set, list] of Object.entries(sets)) for (const o of list) {
      o.visible = on.has(set);
      if (o.userData.mover) toM4(mv[o.userData.mover]).multiply(o.userData.m0).decompose(o.position, o.quaternion, o.scale);
    }
    return readout(design, s, mv);
  }
  return { pose };
}

// ---- the panel's words
const mm = (m) => `${m >= 0 ? '+' : '−'}${Math.abs(Math.round(m * 1000))} mm`;
const deg = (d) => `${d >= 0 ? '+' : '−'}${Math.abs(d).toFixed(1)}°`;
const len = (l) => `${Math.round(l * 1000)} mm`;
export const MOTION_TEXT = {
  rear: 'スイングアームは、エンジンの後ろの立ち上がりの管に渡した支点の管に、ボルトとブッシュで留まる。腕はそこを軸に上下に回り、腕と保護枠の横管のあいだの緩衝器（ばね）が縮んで後輪の上下を受ける。腕に付いた車軸、後輪、スプロケット、ブレーキ、ナンバーもいっしょに動く。',
  front: '前輪は左右それぞれ、上下 2 本の A アームでノーズの箱に留まる。A アームは箱の側の支点を軸に回り、ナックルは上下のボールジョイントで A アームの先につながる。各輪の緩衝器は、下の A アームと箱の上の横管のあいだで縮む。',
  roll: '左右の前輪は、それぞれの A アームと緩衝器で別々に動く。片方が上がるとき、もう片方は下がってもよい。',
  steer: 'ハンドルの軸が回ると、その下の板からタイロッドがナックルの腕を押し引きする。前輪はキングピン（上下のボールジョイントを結ぶ線）を軸に向きを変え、内側の輪ほど大きく切れる。',
  bump: '段差を前輪が先に越え、少しおくれて後輪が越える。どの輪の上下もばねが受ける。',
};
export function describeNumbers(key, ro) {
  const fr = (sd, name) => `${name} ${mm(ro.front[sd].rise)}、緩衝器 ${len(ro.front[sd].len)}`;
  const rear = () => `後輪 ${mm(ro.rear.rise)}（腕 ${deg(ro.rear.deg)}）、緩衝器 ${len(ro.rear.len)}（乗った静止で ${len(ro.rear.len0)}、自由長 ${len(ro.rear.free)}）`;
  if (key === 'rear') return rear();
  if (key === 'front' || key === 'roll') return `${fr('l', '左前輪')} ／ ${fr('r', '右前輪')}（乗った静止で ${len(ro.front.l.len0)}）`;
  if (key === 'steer') return `ハンドル ${deg(ro.steer)} ／ 左前輪 ${deg(ro.front.l.steer)} ／ 右前輪 ${deg(ro.front.r.steer)}（＋は左向き）`;
  if (key === 'bump') return `${fr('l', '前輪')} ／ ${rear()}`;
  return '';
}
