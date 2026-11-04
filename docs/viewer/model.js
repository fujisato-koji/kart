// Builds the 3D shapes of the kart from docs/data/design.json only.
// Kart axes: x forward, y left, z up (metres). Everything is built in these axes inside one
// group that is turned to three.js's y-up (see KART_TO_WORLD). Every number about the kart
// comes from design.json; shapes that need a drawing-only constant take it from ILLUSTRATIVE.
import * as THREE from 'three';
import { RoundedBoxGeometry } from 'three/addons/geometries/RoundedBoxGeometry.js';

export const ILLUSTRATIVE = {
  colours: {
    paint: 0xc8372d, paintDark: 0x7d1f18, bumper: 0xe8a317, bumperDark: 0x8a6008, steel: 0x9aa3ad,
    darkSteel: 0x4c535b, cast: 0x2f343a, rubber: 0x1a1b1d, rim: 0xaab2ba, plastic: 0x23262a,
    engineRed: 0xc3262c, alu: 0xb9bfc6, aluDark: 0x848c94, seat: 0x23272d, floor: 0x8d949b,
    ski: 0xdcd6c0, chain: 0x3b3f44, brass: 0xc9a14a, adult: 0x7f95ad, child: 0xe0a35e, skin: 0xe8c3a0,
  },
  tubeSegments: 18, weldBead: 0.1, nodeScale: 1.0,
  lugs: 26, lugHeight: 0.011, lugChevron: 0.32,
  studs: 4, studRadius: 0.004, studLength: 0.03, studPcdFrac: 0.76,
  rollerFrac: 0.625, chainWidthFrac: 0.62, chainPlateFrac: 0.12,
  pillowWidthPerBore: 1.55, pillowBoltHole: 0.0125,
  perfPitch: 0.016, perfHole: 0.0055,
  engine: {
    cylTiltDeg: 24, crankcaseWidthFrac: 0.45, finRadius: 0.066, finCount: 8, finThickness: 0.0055,
    cylBodyRadius: 0.043, headLength: 0.075, shaftRadius: 0.0095, recoilRadius: 0.095, recoilDepth: 0.042,
    mufflerRadius: 0.04, mufflerLength: 0.15, tankWidth: 0.17,
  },
  saddle: { cornerFrac: 0.42, noseFrac: 0.55, noseLenFrac: 0.35 },
  handlebar: { clampLen: 0.07, clampFactor: 1.6 },
  fender: { halfAngleDeg: 60, shellMargin: 0.004 },
  ski: { thickness: 0.022, tipRise: 0.1, tipFrac: 0.22, kickRise: 0.035, kickFrac: 0.08 },
  mannequin: {
    // body proportions as fractions of the stature
    trunk: 0.30, thigh: 0.53, shin: 0.47, foot: 0.152, upperArm: 0.186, foreArm: 0.146, hand: 0.05,
    hipHalfWidth: 0.05, shoulderHalfWidth: 0.115, head: 0.048, limb: 0.017, trunkLean: 10, // trunk leans forward (deg)
    legFrac: 0.245, // thigh and shin each, as a fraction of the stature
  },
  dim: { colour: 0x0b4f9c, label: 0.07, tick: 0.035 },
  delica: { colour: 0x4a90d9, opacity: 0.1, rampLength: 1.2 },
};

const C = ILLUSTRATIVE.colours;
export const KART_TO_WORLD = new THREE.Matrix4().makeRotationX(-Math.PI / 2); // (x,y,z) -> (x,z,-y)
export const k2w = (x, y, z) => new THREE.Vector3(x, z, -y);

const Y = new THREE.Vector3(0, 1, 0);
const V = (a) => new THREE.Vector3(a[0], a[1], a[2]);
const std = (color, rough = 0.5, metal = 0.1, extra = {}) =>
  new THREE.MeshStandardMaterial({ color, roughness: rough, metalness: metal, ...extra });

let _M = null;
function mats() {
  if (_M) return _M;
  _M = {
    paint: std(C.paint, 0.38, 0.15), paintDark: std(C.paintDark, 0.5, 0.2),
    bumper: std(C.bumper, 0.4, 0.1), bumperDark: std(C.bumperDark, 0.5, 0.2),
    steel: std(C.steel, 0.35, 0.85), darkSteel: std(C.darkSteel, 0.5, 0.7), cast: std(C.cast, 0.6, 0.5),
    rubber: std(C.rubber, 0.95, 0.0), rim: std(C.rim, 0.3, 0.85), plastic: std(C.plastic, 0.6, 0.05),
    engineRed: std(C.engineRed, 0.45, 0.1), alu: std(C.alu, 0.45, 0.7), aluDark: std(C.aluDark, 0.5, 0.65),
    seat: std(C.seat, 0.8, 0.0, { side: THREE.DoubleSide }), floor: std(C.floor, 0.6, 0.4),
    ski: std(C.ski, 0.5, 0.05), chain: std(C.chain, 0.4, 0.8), brass: std(C.brass, 0.4, 0.8),
    pan: std(0xeeeadf, 0.55, 0.0, { side: THREE.DoubleSide }), track: std(0x2b2d30, 0.95, 0.0), lug: std(0x1c1d20, 0.95, 0.0),
    float: std(0xff7a1a, 0.45, 0.0, { transparent: true, opacity: 0.85 }), motor: std(0x30353b, 0.45, 0.3), motorCowl: std(0xd8dde2, 0.4, 0.2),
    black: std(0x0e0f10, 0.7, 0.2), finDark: std(0x4d545b, 0.5, 0.7), key: std(0x1a1c1e, 0.9, 0.2),
  };
  return _M;
}

function shade(m) { m.castShadow = true; m.receiveShadow = true; return m; }
function mesh(geo, mat) { return shade(new THREE.Mesh(geo, mat)); }

function cylBetween(a, b, r, mat, seg = 20, r2) {
  const d = b.clone().sub(a);
  const m = mesh(new THREE.CylinderGeometry(r2 ?? r, r, d.length(), seg, 1), mat);
  m.position.copy(a).addScaledVector(d, 0.5);
  m.quaternion.setFromUnitVectors(Y, d.clone().normalize());
  return m;
}
// cylinder along y (the kart's lateral axis) centred at the local origin
function cylY(r, len, mat, seg = 28) { return mesh(new THREE.CylinderGeometry(r, r, len, seg, 1), mat); }
function sphere(r, mat, seg = 16) { return mesh(new THREE.SphereGeometry(r, seg, seg / 2 | 0 || 8), mat); }
function box(sx, sy, sz, mat, radius = 0) {
  return mesh(radius > 0 ? new RoundedBoxGeometry(sx, sy, sz, 3, Math.min(radius, sx / 2.1, sy / 2.1, sz / 2.1)) : new THREE.BoxGeometry(sx, sy, sz), mat);
}
function hexBolt(r, h, mat) { return mesh(new THREE.CylinderGeometry(r, r, h, 6), mat); }
// a hex bolt head standing on z=0 pointing up (kart frame)
function boltUp(r, h, mat) { const m = hexBolt(r, h, mat); m.rotation.x = Math.PI / 2; m.position.z = h / 2; return m; }

function perfTexture() {
  const c = document.createElement('canvas'); c.width = c.height = 128;
  const x = c.getContext('2d');
  x.fillStyle = '#fff'; x.fillRect(0, 0, 128, 128);
  x.fillStyle = '#000';
  const hr = ILLUSTRATIVE.perfHole / ILLUSTRATIVE.perfPitch / 4 * 128; // hole radius in px
  for (let j = 0; j < 4; j++) for (let i = 0; i < 4; i++) {
    for (const o of [0, 0.5]) { // staggered rows
      const px = ((i + 0.25 + (j % 2) * 0.5) * 32 + o * 0) % 128, py = (j + 0.5) * 32;
      x.beginPath(); x.arc(px, py, hr, 0, 7); x.fill();
      break;
    }
  }
  const t = new THREE.CanvasTexture(c); t.wrapS = t.wrapT = THREE.RepeatWrapping; return t;
}
let _perf = null;
function perfSheet(sx, sz, mat) { // a perforated sheet in the x-z plane, centred
  _perf = _perf || perfTexture();
  const t = _perf.clone(); t.needsUpdate = true;
  const rep = (len) => Math.max(1, len / (ILLUSTRATIVE.perfPitch * 4));
  t.repeat.set(rep(sx), rep(sz));
  const m = new THREE.MeshStandardMaterial({ color: C.steel, roughness: 0.4, metalness: 0.8, alphaMap: t, alphaTest: 0.5, side: THREE.DoubleSide });
  const g = new THREE.PlaneGeometry(sx, sz);
  g.rotateX(Math.PI / 2); // x-z plane
  return mesh(g, m);
}

// ---------------------------------------------------------------- tubes
function buildMembers(design) {
  const M = mats(); const out = []; const nodes = new Map();
  const key = (p) => p.map((v) => Math.round(v * 1000)).join(',');
  for (const mb of design.members) {
    const a = V(mb.a), b = V(mb.b), r = mb.od / 2;
    const bump = mb.part === 'bumpers';
    const g = new THREE.Group(); g.userData = { part: mb.part, configs: design.configs, member: true };
    g.add(cylBetween(a, b, r, bump ? M.bumper : M.paint, ILLUSTRATIVE.tubeSegments));
    // weld beads: a dark ring near each end of the tube
    const dir = b.clone().sub(a).normalize();
    for (const [p, s] of [[a, 1], [b, -1]]) {
      const bead = mesh(new THREE.TorusGeometry(r * 1.02, r * ILLUSTRATIVE.weldBead * 2.2, 8, 20), bump ? M.bumperDark : M.paintDark);
      bead.position.copy(p).addScaledVector(dir, s * Math.max(0.012, r * 0.9));
      bead.quaternion.setFromUnitVectors(new THREE.Vector3(0, 0, 1), dir);
      g.add(bead);
      const k = key([p.x, p.y, p.z]);
      const n = nodes.get(k) || { p, r: 0, part: mb.part, bump };
      n.r = Math.max(n.r, r); nodes.set(k, n);
    }
    out.push(g);
  }
  for (const n of nodes.values()) { // a round weld blob at each node closes the mitre gap
    const g = new THREE.Group(); g.userData = { part: n.part, configs: design.configs, member: true };
    const s = sphere(n.r * ILLUSTRATIVE.nodeScale * 1.02, n.bump ? M.bumper : M.paint, 14);
    s.position.copy(n.p); g.add(s); out.push(g);
  }
  return out;
}

// ---------------------------------------------------------------- items
function plateFor(it) {
  const M = mats(); const [sx, sy, sz] = it.size;
  const g = new THREE.Group();
  g.add(box(sx, sy, sz, M.darkSteel));
  if (it.part === 'footrests') { // anti-slip ribs across the board
    const n = Math.max(2, Math.floor(sx / 0.03));
    for (let i = 0; i < n; i++) { const r = box(0.008, sy * 0.9, 0.0016, M.steel); r.position.set(-sx / 2 + (i + 0.5) * (sx / n), 0, sz / 2 + 0.0006); g.add(r); }
  } else if (sx > 0.09 && sy > 0.05) { // corner bolts
    for (const sxn of [-1, 1]) for (const syn of [-1, 1]) {
      const b = boltUp(0.0045, 0.004, M.steel); b.position.set(sxn * (sx / 2 - 0.014), syn * (sy / 2 - 0.012), sz / 2); g.add(b);
    }
  }
  g.position.set(...it.pos);
  return g;
}

function addKeyway(g, cx, y, z, r, len, M) { // a dark key slot on the top of a shaft
  const k = box(0.006, len, 0.0014, M.key);
  k.position.set(cx, y, z + r - 0.0003); g.add(k);
  const key = box(0.0055, len * 0.7, 0.0025, M.brass);
  key.position.set(cx, y, z + r + 0.0004); g.add(key);
}

function cylItem(it, ctx) {
  const M = mats(); const g = new THREE.Group();
  const r = it.d / 2;
  g.add(cylY(r, it.l, M.steel, 28));
  // end chamfers
  for (const s of [-1, 1]) { const c = cylY(r * 0.82, 0.004, M.steel, 20); c.position.y = s * (it.l / 2 + 0.002); g.add(c); }
  g.position.set(...it.pos);
  // keyways at the sprockets and along the range where the hubs slide
  const near = (p) => Math.abs(p[0] - it.pos[0]) < 0.002 && Math.abs(p[2] - it.pos[2]) < 0.002;
  for (const o of ctx.design.items) {
    if (o.type === 'sprocket' && near(o.pos) && Math.abs(o.pos[1] - it.pos[1]) < it.l / 2) addKeyway(g, 0, o.pos[1] - it.pos[1], 0, r, o.t * 1.6, M);
  }
  if (it.part === 'axle_shaft') {
    const hubs = ctx.design.items.filter((o) => o.type === 'hub' && near(o.pos));
    for (const s of [-1, 1]) {
      const ys = hubs.map((h) => Math.abs(h.pos[1])); if (!ys.length) continue;
      const lo = Math.min(...ys), hi = Math.max(...ys), hl = hubs[0].l;
      addKeyway(g, 0, s * (lo + hi) / 2, 0, r, hi - lo + hl * 0.9, M);
    }
  }
  return g;
}

function pillowItem(it) {
  const M = mats(); const g = new THREE.Group();
  const w = it.bore * ILLUSTRATIVE.pillowWidthPerBore, tb = it.h * 0.42;
  const R = it.h2 - it.h;
  // base with two bolt holes
  const sh = new THREE.Shape();
  const hx = it.l / 2, hy = w / 2, rr = 0.012;
  sh.moveTo(-hx + rr, -hy); sh.lineTo(hx - rr, -hy); sh.quadraticCurveTo(hx, -hy, hx, -hy + rr);
  sh.lineTo(hx, hy - rr); sh.quadraticCurveTo(hx, hy, hx - rr, hy); sh.lineTo(-hx + rr, hy);
  sh.quadraticCurveTo(-hx, hy, -hx, hy - rr); sh.lineTo(-hx, -hy + rr); sh.quadraticCurveTo(-hx, -hy, -hx + rr, -hy);
  for (const s of [-1, 1]) { const h = new THREE.Path(); h.absarc(s * it.l * 0.375, 0, ILLUSTRATIVE.pillowBoltHole / 2, 0, Math.PI * 2, true); sh.holes.push(h); }
  const base = mesh(new THREE.ExtrudeGeometry(sh, { depth: tb, bevelEnabled: false, curveSegments: 10 }), M.cast);
  g.add(base);
  const neck = box(R * 2 * 0.95, w, it.h - tb * 0.5, M.cast, 0.004); neck.position.set(0, 0, tb * 0.5 + (it.h - tb * 0.5) / 2); g.add(neck);
  const dome = cylY(R, w, M.cast, 32); dome.rotation.z = 0; dome.position.set(0, 0, it.h); g.add(dome);
  // bearing inner ring, set screws, grease nipple, bolts
  for (const s of [-1, 1]) {
    const ring = cylY(it.bore * 0.78, 0.007, M.steel, 28); ring.position.set(0, s * (w / 2 + 0.0015), it.h); g.add(ring);
    const bolt = boltUp(0.0065, 0.007, M.steel); bolt.position.set(s * it.l * 0.375, 0, tb); g.add(bolt);
  }
  const ss = cylY(0.0035, 0.01, M.steel, 8); ss.rotation.x = Math.PI / 2; ss.position.set(0, w / 2 * 0.0, it.h + R - 0.004); ss.rotation.set(0, 0, 0); g.add(ss);
  const gr = mesh(new THREE.CylinderGeometry(0.0028, 0.0028, 0.012, 8), M.brass); gr.rotation.x = Math.PI / 2; gr.position.set(0, 0, it.h + R + 0.004); g.add(gr);
  g.position.set(...it.pos);
  if (it.inverted) g.rotation.x = Math.PI; // hung under a plate: base on top, shaft h below
  return g;
}

function hubItem(it, ctx) {
  const M = mats(); const g = new THREE.Group();
  const s = Math.sign(it.pos[1]) || 1, r = it.d / 2;
  g.add(cylY(r, it.l, M.darkSteel, 28));
  const fl = cylY(r * 1.55, 0.008, M.darkSteel, 32); fl.position.y = s * (it.l / 2 - 0.004); g.add(fl);
  const pcd = r * 2 * ILLUSTRATIVE.studPcdFrac * 0.5 * 1.0 + r * 0.25;
  for (let i = 0; i < ILLUSTRATIVE.studs; i++) {
    const a = (i / ILLUSTRATIVE.studs) * Math.PI * 2 + Math.PI / 4;
    const st = cylY(ILLUSTRATIVE.studRadius, ILLUSTRATIVE.studLength, M.steel, 10);
    st.position.set(Math.cos(a) * pcd, s * (it.l / 2 + ILLUSTRATIVE.studLength / 2 - 0.004), Math.sin(a) * pcd); g.add(st);
  }
  const grub = cylY(0.004, 0.02, M.steel, 8); grub.rotation.x = Math.PI / 2; grub.position.set(0, -s * 0.0, r); g.add(grub);
  g.position.set(...it.pos); g.userData.studPcd = pcd;
  return g;
}

// ---- tyre, rim, hub
function wheelItem(it, ctx) {
  const M = mats(); const g = new THREE.Group();
  const R = it.od / 2, W = it.width, Rr = it.rim / 2, h = W / 2, s = Math.sign(it.pos[1]) || 1;
  // carcass: a lathe profile (radius, along y)
  const half = [
    [Rr + 0.004, 0.78], [Rr + 0.012, 0.93], [Rr + (R - Rr) * 0.22, 1.0], [Rr + (R - Rr) * 0.55, 0.98],
    [R - 0.026, 0.9], [R - 0.012, 0.76], [R - 0.003, 0.55], [R, 0.3], [R, 0],
  ];
  const pts = [];
  for (const [r, f] of half) pts.push(new THREE.Vector2(r, -f * h));
  for (let i = half.length - 2; i >= 0; i--) pts.push(new THREE.Vector2(half[i][0], half[i][1] * h));
  const tyre = mesh(new THREE.LatheGeometry(pts, 72), M.rubber); g.add(tyre);
  // knobby tread: two staggered rows of angled lugs
  const lug = new THREE.BoxGeometry(ILLUSTRATIVE.lugHeight, W * 0.4, R * 2 * Math.PI / ILLUSTRATIVE.lugs * 0.42);
  const inst = new THREE.InstancedMesh(lug, M.rubber, ILLUSTRATIVE.lugs * 2);
  inst.castShadow = true; inst.receiveShadow = true;
  const d = new THREE.Object3D(); let n = 0;
  for (const row of [-1, 1]) for (let i = 0; i < ILLUSTRATIVE.lugs; i++) {
    const a = (i + (row > 0 ? 0.5 : 0)) / ILLUSTRATIVE.lugs * Math.PI * 2;
    d.position.set(Math.cos(a) * (R + ILLUSTRATIVE.lugHeight * 0.4), row * W * 0.215, Math.sin(a) * (R + ILLUSTRATIVE.lugHeight * 0.4));
    const qy = new THREE.Quaternion().setFromAxisAngle(Y, -a);
    const qx = new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(1, 0, 0), -row * ILLUSTRATIVE.lugChevron);
    d.quaternion.copy(qy).multiply(qx); d.updateMatrix(); inst.setMatrixAt(n++, d.matrix);
  }
  g.add(inst);
  // rim barrel and centre disc
  const hr = h * 0.9;
  const barrel = new THREE.LatheGeometry([new THREE.Vector2(Rr + 0.008, -hr), new THREE.Vector2(Rr + 0.001, -hr + 0.006), new THREE.Vector2(Rr - 0.002, -hr + 0.012),
    new THREE.Vector2(Rr - 0.002, hr - 0.012), new THREE.Vector2(Rr + 0.001, hr - 0.006), new THREE.Vector2(Rr + 0.008, hr)], 48);
  const rimM = new THREE.MeshStandardMaterial({ color: C.rim, roughness: 0.3, metalness: 0.85, side: THREE.DoubleSide });
  g.add(shade(new THREE.Mesh(barrel, rimM)));
  const disc = cylY(Rr - 0.004, 0.006, M.rim, 40); g.add(disc);
  const hubD = (ctx.design.items.find((o) => o.type === 'hub') || { d: 0.07 }).d;
  const pcd = hubD / 2 * 2 * ILLUSTRATIVE.studPcdFrac * 0.5 + hubD / 2 * 0.25;
  const boss = cylY(hubD * 0.42, 0.016, M.rim, 28); boss.position.y = s * 0.007; g.add(boss);
  for (let i = 0; i < ILLUSTRATIVE.studs; i++) {
    const a = (i / ILLUSTRATIVE.studs) * Math.PI * 2 + Math.PI / 4;
    const nut = mesh(new THREE.CylinderGeometry(0.0075, 0.0075, 0.012, 6), M.steel);
    nut.position.set(Math.cos(a) * pcd, s * 0.012, Math.sin(a) * pcd); g.add(nut);
  }
  const cap = mesh(new THREE.SphereGeometry(hubD * 0.2, 20, 8, 0, Math.PI * 2, 0, Math.PI / 2), M.darkSteel);
  cap.position.y = s * 0.014; cap.rotation.z = s > 0 ? 0 : Math.PI; g.add(cap);
  g.position.set(...it.pos);
  return g;
}

function chainsItem(it) { // ladder chains on a tyre
  const M = mats(); const g = new THREE.Group();
  const R = it.od / 2, W = it.width, n = 15;
  for (let i = 0; i < n; i++) {
    const a = i / n * Math.PI * 2;
    const rung = cylY(0.0028, W * 0.9, M.chain, 8);
    rung.position.set(Math.cos(a) * (R + 0.003), 0, Math.sin(a) * (R + 0.003)); g.add(rung);
    // rung links at both ends, drawn as small flat rings
    for (const sgn of [-1, 1]) {
      const link = mesh(new THREE.TorusGeometry(0.006, 0.0018, 6, 10), M.chain);
      link.position.set(Math.cos(a) * (R + 0.002), sgn * W * 0.46, Math.sin(a) * (R + 0.002));
      link.lookAt(link.position.clone().multiplyScalar(2)); g.add(link);
    }
  }
  for (const sgn of [-1, 1]) { // side chains
    const ring = mesh(new THREE.TorusGeometry(R - 0.012, 0.003, 6, 80), M.chain);
    ring.rotation.x = Math.PI / 2; ring.position.y = sgn * W * 0.46; g.add(ring);
  }
  g.position.set(...it.pos);
  return g;
}

function discItem(it) {
  const M = mats(); const g = new THREE.Group();
  const R = it.d / 2;
  const sh = new THREE.Shape(); sh.absarc(0, 0, R, 0, Math.PI * 2, false);
  for (let i = 0; i < 10; i++) { const a = i / 10 * Math.PI * 2; const h = new THREE.Path(); h.absarc(Math.cos(a) * R * 0.72, Math.sin(a) * R * 0.72, R * 0.07, 0, Math.PI * 2, true); sh.holes.push(h); }
  const hole = new THREE.Path(); hole.absarc(0, 0, R * 0.34, 0, Math.PI * 2, true); sh.holes.push(hole);
  const geo = new THREE.ExtrudeGeometry(sh, { depth: it.t, bevelEnabled: false, curveSegments: 40 });
  geo.translate(0, 0, -it.t / 2); geo.rotateX(Math.PI / 2);
  g.add(mesh(geo, M.steel));
  const hat = cylY(R * 0.4, 0.014, M.darkSteel, 32); hat.position.y = -0.006; g.add(hat);
  g.position.set(...it.pos);
  return g;
}

function caliperItem(it) {
  const M = mats(); const g = new THREE.Group(); const [sx, sy, sz] = it.size;
  const body = box(sx, sy, sz, std(0xd8a21a, 0.4, 0.4), 0.008); g.add(body);
  for (const s of [-1, 1]) { const b = boltUp(0.0055, 0.01, M.steel); b.position.set(s * sx * 0.32, 0, sz / 2); g.add(b); }
  const bleed = mesh(new THREE.CylinderGeometry(0.003, 0.003, 0.014, 8), M.brass); bleed.rotation.x = Math.PI / 2; bleed.position.set(sx * 0.1, 0, sz / 2 + 0.01); g.add(bleed);
  const hose = cylBetween(new THREE.Vector3(sx * 0.1, 0, sz / 2), new THREE.Vector3(sx * 0.1, 0.08, sz / 2 + 0.07), 0.004, M.black, 8); g.add(hose);
  g.position.set(...it.pos);
  return g;
}

// ---- sprocket with real teeth
function sprocketShape(teeth, pd, od) {
  const pitch = pd * Math.sin(Math.PI / teeth);
  const rootR = pd / 2 - ILLUSTRATIVE.rollerFrac * pitch / 2, tipR = od / 2;
  const sh = new THREE.Shape(); const step = Math.PI * 2 / teeth;
  const tipHW = step * 0.2, rootHW = step * 0.34;
  let first = true;
  const P = (r, a) => [Math.cos(a) * r, Math.sin(a) * r];
  for (let i = 0; i < teeth; i++) {
    const a0 = i * step;
    const seq = [P(rootR, a0 - rootHW), P(tipR, a0 - tipHW), P(tipR, a0 + tipHW), P(rootR, a0 + rootHW), P(rootR, a0 + step / 2)];
    for (const [x, y] of seq) { if (first) { sh.moveTo(x, y); first = false; } else sh.lineTo(x, y); }
  }
  sh.closePath();
  return { shape: sh, rootR };
}
function sprocketItem(it) {
  const M = mats(); const g = new THREE.Group();
  const { shape, rootR } = sprocketShape(it.teeth, it.pd, it.od);
  if (it.teeth >= 30) { // lightening holes in the web
    for (let i = 0; i < 6; i++) { const a = i / 6 * Math.PI * 2; const h = new THREE.Path(); h.absarc(Math.cos(a) * rootR * 0.62, Math.sin(a) * rootR * 0.62, rootR * 0.17, 0, Math.PI * 2, true); shape.holes.push(h); }
  }
  const geo = new THREE.ExtrudeGeometry(shape, { depth: it.t, bevelEnabled: false });
  geo.translate(0, 0, -it.t / 2); geo.rotateX(Math.PI / 2);
  g.add(mesh(geo, M.steel));
  const boss = cylY(rootR * (it.teeth >= 30 ? 0.26 : 0.55), it.t * 2.2, M.darkSteel, 24); boss.position.y = 0; g.add(boss);
  const ss = cylY(0.0035, 0.012, M.steel, 8); ss.rotation.x = Math.PI / 2; ss.position.set(0, 0, rootR * 0.3); g.add(ss);
  g.position.set(...it.pos);
  return g;
}

// ---- roller chain as a loop of links
function chainItem(it, ctx) {
  const M = mats(); const g = new THREE.Group();
  const c1 = [it.pos[0], it.pos[2]], c2 = [it.to[0], it.to[2]], r1 = it.r1, r2 = it.r2, y = it.pos[1];
  const sp = ctx.design.items.find((o) => o.type === 'sprocket' && Math.abs(o.pos[0] - it.pos[0]) < 0.002 && Math.abs(o.pos[2] - it.pos[2]) < 0.002 && Math.abs(o.pos[1] - y) < 0.01);
  const pitch = sp ? sp.pd * Math.sin(Math.PI / sp.teeth) : 0.0127;
  // closed path around two circles (external tangents), counter-clockwise in (x,z)
  const dx = c2[0] - c1[0], dz = c2[1] - c1[1], L = Math.hypot(dx, dz), ang = Math.atan2(dz, dx);
  const phi = Math.acos((r1 - r2) / L); // tangent angle
  const pts = [];
  const arc = (c, r, a0, a1) => { const n = Math.max(6, Math.ceil(Math.abs(a1 - a0) * r / 0.003)); for (let i = 0; i < n; i++) { const a = a0 + (a1 - a0) * i / n; pts.push([c[0] + r * Math.cos(a), c[1] + r * Math.sin(a)]); } };
  const seg = (p, q) => { const n = Math.ceil(Math.hypot(q[0] - p[0], q[1] - p[1]) / 0.003); for (let i = 0; i < n; i++) pts.push([p[0] + (q[0] - p[0]) * i / n, p[1] + (q[1] - p[1]) * i / n]); };
  const a1s = ang + phi, a2s = ang - phi; // upper tangent at angle ang+phi, lower at ang-phi
  const t1u = [c1[0] + r1 * Math.cos(a1s), c1[1] + r1 * Math.sin(a1s)], t2u = [c2[0] + r2 * Math.cos(a1s), c2[1] + r2 * Math.sin(a1s)];
  const t1l = [c1[0] + r1 * Math.cos(a2s), c1[1] + r1 * Math.sin(a2s)], t2l = [c2[0] + r2 * Math.cos(a2s), c2[1] + r2 * Math.sin(a2s)];
  // go: lower tangent from c1 to c2, around c2 (a2s -> a1s), upper tangent back, around c1 (a1s -> a2s+2pi)
  seg(t1l, t2l); arc(c2, r2, a2s, a1s); seg(t2u, t1u); arc(c1, r1, a1s, a2s + Math.PI * 2);
  pts.push(pts[0]);
  // resample at the pitch
  const cum = [0]; for (let i = 1; i < pts.length; i++) cum.push(cum[i - 1] + Math.hypot(pts[i][0] - pts[i - 1][0], pts[i][1] - pts[i - 1][1]));
  const total = cum[cum.length - 1], N = Math.max(8, 2 * Math.round(total / pitch / 2)), step = total / N;
  const at = (s) => { let i = 1; while (i < cum.length - 1 && cum[i] < s) i++; const f = (s - cum[i - 1]) / (cum[i] - cum[i - 1] || 1); return [pts[i - 1][0] + (pts[i][0] - pts[i - 1][0]) * f, pts[i - 1][1] + (pts[i][1] - pts[i - 1][1]) * f]; };
  const rw = pitch * ILLUSTRATIVE.chainWidthFrac, pt = pitch * ILLUSTRATIVE.chainPlateFrac;
  const plates = new THREE.InstancedMesh(new THREE.BoxGeometry(step * 0.92, pt, pitch * 0.34), M.chain, N * 2);
  const rollers = new THREE.InstancedMesh(new THREE.CylinderGeometry(pitch * 0.31, pitch * 0.31, rw, 10), M.steel, N);
  const d = new THREE.Object3D(); let np = 0;
  const pos = []; for (let i = 0; i <= N; i++) pos.push(at(i * step % total));
  for (let i = 0; i < N; i++) {
    const p = pos[i], q = pos[i + 1], mx = (p[0] + q[0]) / 2, mz = (p[1] + q[1]) / 2, th = Math.atan2(-(q[1] - p[1]), q[0] - p[0]);
    const wide = i % 2 === 0; // alternate outer and inner plates
    for (const s of [-1, 1]) {
      d.position.set(mx, s * (rw / 2 + pt / 2) * (wide ? 1.0 : 0.82), mz); d.rotation.set(0, th, 0); d.scale.set(1, 1, 1); d.updateMatrix(); plates.setMatrixAt(np++, d.matrix);
    }
    d.position.set(p[0], 0, p[1]); d.rotation.set(0, 0, 0); d.updateMatrix(); rollers.setMatrixAt(i, d.matrix);
  }
  plates.castShadow = rollers.castShadow = true;
  g.add(plates, rollers);
  g.position.set(0, y, 0);
  return g;
}

function guardItem(it) {
  const M = mats(); const [sx, sy, sz] = it.size; const g = new THREE.Group();
  g.add(perfSheet(sx, sz, null));
  const frame = M.darkSteel;
  for (const sg of [-1, 1]) {
    const h = box(sx, 0.012, 0.012, frame); h.position.set(0, 0, sg * (sz / 2)); g.add(h);
    const v = box(0.012, 0.012, sz, frame); v.position.set(sg * (sx / 2), 0, 0); g.add(v);
  }
  g.position.set(...it.pos);
  return g;
}

// ---- engine, GX200 class, inside its envelope
function engineItem(it, ctx) {
  const M = mats(); const E = ILLUSTRATIVE.engine; const g = new THREE.Group();
  const W = it.width, L = it.length, H = it.height, sh = it.shaft_h;
  const s = it.pto.startsWith('-') ? -1 : 1; // side of the output shaft
  const clutch = ctx.design.items.find((o) => o.type === 'clutch');
  let yPto = s * L / 2;
  if (clutch) { const inner = s < 0 ? clutch.pos[1] + clutch.l / 2 - it.pos[1] : clutch.pos[1] - clutch.l / 2 - it.pos[1]; yPto = s < 0 ? Math.max(yPto, inner) : Math.min(yPto, inner); }
  const yBack = -s * L / 2; // flywheel and recoil side
  const yLo = Math.min(yPto, yBack), yHi = Math.max(yPto, yBack), bodyLen = yHi - yLo, yMid = (yLo + yHi) / 2;
  const cw = W * E.crankcaseWidthFrac, ccH = sh + 0.075;
  // mounting feet
  const foot = box(W * 0.9, bodyLen * 0.92, 0.012, M.darkSteel, 0.003); foot.position.set(0, yMid, 0.006); g.add(foot);
  // crankcase and sump
  const cc = box(cw, bodyLen - E.recoilDepth, ccH - 0.01, M.alu, 0.02); cc.position.set(0, yMid + s * E.recoilDepth / 2, 0.012 + (ccH - 0.01) / 2); g.add(cc);
  const sump = box(cw * 0.9, bodyLen * 0.5, 0.05, M.aluDark, 0.012); sump.position.set(0, yMid + s * bodyLen * 0.15, 0.03); g.add(sump);
  // PTO side cover and the output shaft
  const cover = cylY(sh * 0.62, 0.012, M.aluDark, 28); cover.position.set(0, yPto - s * 0.004, sh); g.add(cover);
  const shaft = cylY(E.shaftRadius, Math.abs(yPto - ((clutch ? clutch.pos[1] : yPto + s * 0.05) - it.pos[1])) + 0.02, M.steel, 20);
  const shaftTo = clutch ? clutch.pos[1] - it.pos[1] : yPto + s * 0.05;
  shaft.scale.y = 1; shaft.position.set(0, (yPto + shaftTo) / 2, sh); g.add(shaft);
  const oil = cylY(0.014, 0.018, M.black, 14); oil.rotation.x = 0; oil.position.set(0.045, yPto + s * 0.0, 0.07); oil.rotation.set(0, 0, 0); g.add(oil);
  // recoil starter housing on the side opposite the output shaft
  const rec = cylY(E.recoilRadius, E.recoilDepth, M.engineRed, 40); rec.position.set(0, yBack - (-s) * 0 + (-s) * -E.recoilDepth / 2 * 0 + (-s) * (-E.recoilDepth / 2) * -1, sh);
  rec.position.y = yBack + s * E.recoilDepth / 2; g.add(rec);
  for (let i = 0; i < 12; i++) { // cooling-air slots
    const a = i / 12 * Math.PI * 2;
    const sl = box(0.026, 0.002, 0.008, M.black); sl.position.set(Math.cos(a) * E.recoilRadius * 0.62, yBack - (-s) * 0.001 * -1 - (-s) * 0 + (-s) * 0.001, sh + Math.sin(a) * E.recoilRadius * 0.62);
    sl.position.y = yBack + 0.0005 * (-s); sl.rotation.y = -a; g.add(sl);
  }
  const hub = cylY(0.022, 0.008, M.black, 20); hub.position.set(0, yBack + (-s) * 0.004, sh); g.add(hub);
  const handle = mesh(new THREE.TorusGeometry(0.014, 0.004, 8, 16), M.black); handle.rotation.x = Math.PI / 2; handle.position.set(-E.recoilRadius * 0.55, yBack + (-s) * 0.014, sh - E.recoilRadius * 0.75); g.add(handle);
  // inclined finned cylinder toward +x
  const phi = E.cylTiltDeg * Math.PI / 180, dirv = new THREE.Vector3(Math.cos(phi), 0, Math.sin(phi));
  const start = new THREE.Vector3(cw / 2 - 0.02, yMid, sh + 0.012);
  const along = (t) => start.clone().addScaledVector(dirv, t);
  const endX = W / 2 - E.headLength * Math.cos(phi) - 0.02;
  const cylLen = Math.max(0.05, (endX - start.x) / Math.cos(phi));
  const cylBody = cylBetween(start, along(cylLen), E.cylBodyRadius, M.cast, 24); g.add(cylBody);
  for (let i = 0; i < E.finCount; i++) {
    const t = 0.012 + (cylLen - 0.02) * i / (E.finCount - 1);
    const fin = mesh(new THREE.CylinderGeometry(E.finRadius, E.finRadius, E.finThickness, 28), M.finDark);
    fin.quaternion.setFromUnitVectors(Y, dirv); fin.position.copy(along(t)); g.add(fin);
  }
  const head = box(E.headLength, E.finRadius * 1.55, E.finRadius * 1.7, M.cast, 0.01);
  head.quaternion.setFromUnitVectors(new THREE.Vector3(1, 0, 0), dirv); head.position.copy(along(cylLen + E.headLength / 2 - 0.004)); g.add(head);
  const cov = box(E.headLength * 0.5, E.finRadius * 1.2, E.finRadius * 1.1, M.black, 0.008);
  cov.quaternion.copy(head.quaternion); cov.position.copy(along(cylLen + E.headLength * 0.85)).add(new THREE.Vector3(0, 0, E.finRadius * 0.7)); g.add(cov);
  const plug = cylBetween(along(cylLen + 0.02).add(new THREE.Vector3(0, s * 0.0, E.finRadius * 0.7)), along(cylLen + 0.02).add(new THREE.Vector3(0.0, 0.0, E.finRadius * 0.7 + 0.035)), 0.008, M.steel, 10); g.add(plug);
  // fuel tank on top (its top is the envelope height)
  const tankH = H - ccH - 0.015, tankL = bodyLen * 0.66;
  const tank = box(E.tankWidth, tankL, tankH, M.engineRed, 0.03); tank.position.set(-W / 2 + E.tankWidth / 2 + 0.005, yMid + (-s) * 0.01, H - tankH / 2); g.add(tank);
  const cap = cylBetween(new THREE.Vector3(tank.position.x, tank.position.y, H - 0.002), new THREE.Vector3(tank.position.x, tank.position.y, H + 0.0 - 0.012), 0.024, M.black, 18);
  cap.position.z += 0; g.add(cap);
  const capTop = mesh(new THREE.CylinderGeometry(0.026, 0.026, 0.012, 20), M.black); capTop.rotation.x = Math.PI / 2; capTop.position.set(tank.position.x, tank.position.y, H - 0.009); g.add(capTop);
  // air cleaner
  const air = cylY(0.05, 0.065, M.plastic, 28); air.rotation.set(0, 0, 0);
  air.position.set(0.075, yPto - s * 0.055, sh + 0.115); g.add(air);
  const airCap = cylY(0.043, 0.012, M.black, 28); airCap.position.set(0.075, yPto - s * 0.092, sh + 0.115); g.add(airCap);
  const elbow = cylBetween(new THREE.Vector3(0.08, yPto - s * 0.04, sh + 0.115), new THREE.Vector3(0.115, yMid, sh + 0.075), 0.018, M.plastic, 12); g.add(elbow);
  // muffler with a guard on the exhaust side
  const mx = W / 2 - E.mufflerRadius - 0.012, mz = E.mufflerRadius + 0.016;
  const muff = cylY(E.mufflerRadius, E.mufflerLength, M.darkSteel, 28); muff.position.set(mx, yMid, mz); g.add(muff);
  const cap1 = mesh(new THREE.SphereGeometry(E.mufflerRadius, 20, 8, 0, Math.PI * 2, 0, Math.PI / 2), M.darkSteel); cap1.rotation.x = -Math.PI / 2 * s; cap1.position.set(mx, yMid + s * E.mufflerLength / 2, mz); g.add(cap1);
  const pg = new THREE.CylinderGeometry(E.mufflerRadius + 0.009, E.mufflerRadius + 0.009, E.mufflerLength * 0.85, 28, 1, true, -Math.PI * 0.1, Math.PI * 1.2);
  _perf = _perf || perfTexture();
  const pt = _perf.clone(); pt.needsUpdate = true; pt.repeat.set(5, 3);
  const gm = new THREE.MeshStandardMaterial({ color: C.steel, metalness: 0.8, roughness: 0.4, alphaMap: pt, alphaTest: 0.5, side: THREE.DoubleSide });
  const mg = mesh(pg, gm); mg.position.set(mx, yMid, mz); mg.rotation.z = Math.PI * 0.45; g.add(mg);
  const pipe = cylBetween(along(cylLen + 0.02).add(new THREE.Vector3(0, 0, -E.finRadius * 0.4)), new THREE.Vector3(mx, yMid, mz + 0.03), 0.013, M.darkSteel, 12); g.add(pipe);
  g.position.set(...it.pos);
  return g;
}

function clutchItem(it) {
  const M = mats(); const g = new THREE.Group();
  const R = it.od / 2;
  g.add(cylY(R, it.l, M.darkSteel, 40));
  for (const f of [-0.3, 0.1, 0.33]) { const ring = cylY(R * 1.025, it.l * 0.07, M.steel, 40); ring.position.y = f * it.l; g.add(ring); }
  const nut = hexBolt(R * 0.2, 0.01, M.steel); nut.position.y = -it.l / 2 - 0.004; g.add(nut);
  g.position.set(...it.pos);
  return g;
}

// ---- spindle: kingpin, stub axle and steering arm
function spindleItem(it, ctx) {
  const M = mats(); const g = new THREE.Group(); const s = it.side;
  const k = V(it.pos), w = V(it.to);
  // kingpin tube and bolt
  const kp = cylBetween(new THREE.Vector3(k.x, k.y, w.z - 0.032), new THREE.Vector3(k.x, k.y, k.z + 0.025), 0.0125, M.darkSteel, 18); g.add(kp);
  const bolt = cylBetween(new THREE.Vector3(k.x, k.y, k.z + 0.02), new THREE.Vector3(k.x, k.y, k.z + 0.045), 0.0065, M.steel, 6); g.add(bolt);
  const nut = boltUp(0.01, 0.01, M.steel); nut.position.set(k.x, k.y, k.z + 0.045); g.add(nut);
  // stub axle toward the wheel centre, with a web
  const stub = cylBetween(new THREE.Vector3(k.x, k.y, w.z), w, 0.0125, M.steel, 16); g.add(stub);
  const web = box(0.04, Math.abs(w.y - k.y) * 0.6, 0.02, M.darkSteel, 0.004); web.position.set(k.x, k.y + s * Math.abs(w.y - k.y) * 0.3, w.z); g.add(web);
  // steering arm to the inner end of the tie rod
  const rod = ctx.design.items.find((o) => o.part === 'tie_rods' && Math.sign(o.to[1]) === s);
  const end = rod ? V(rod.to) : new THREE.Vector3(k.x - it.arm, k.y - s * 0.02, k.z);
  const a0 = new THREE.Vector3(k.x, k.y, end.z), arm = cylBetween(a0, end, 0.0075, M.darkSteel, 10); g.add(arm);
  const arm2 = box(0.04, 0.035, 0.012, M.darkSteel, 0.004); arm2.position.set(k.x - 0.015, k.y, end.z); g.add(arm2);
  g.userData.armEnd = end;
  return g;
}

function skiItem(it) {
  const M = mats(); const K = ILLUSTRATIVE.ski; const g = new THREE.Group();
  const l = it.l, th = K.thickness, tip = l * K.tipFrac, kick = l * K.kickFrac;
  const x0 = -l / 2, x1 = l / 2, bottom = [];
  const N = 24;
  for (let i = 0; i <= N; i++) { // kick-up at the tail
    const t = i / N; bottom.push([x0 + t * kick, K.kickRise * (1 - t) * (1 - t)]);
  }
  for (let i = 1; i <= N; i++) { // upturned tip
    const t = i / N; bottom.push([x1 - tip + t * tip, K.tipRise * t * t]);
  }
  bottom.splice(N + 1, 0); // keep order
  const sh = new THREE.Shape();
  sh.moveTo(bottom[0][0], bottom[0][1]);
  for (const p of bottom) sh.lineTo(p[0], p[1]);
  for (let i = bottom.length - 1; i >= 0; i--) sh.lineTo(bottom[i][0], bottom[i][1] + th);
  const geo = new THREE.ExtrudeGeometry(sh, { depth: it.w, bevelEnabled: true, bevelSize: 0.004, bevelThickness: 0.004, bevelSegments: 2 });
  geo.translate(0, 0, -it.w / 2); geo.rotateX(Math.PI / 2);
  g.add(mesh(geo, M.ski));
  // steel runner strip under the ski and the binding bracket to the spindle
  const run = box(l * 0.55, 0.012, 0.004, M.steel); run.position.set(0, 0, 0.002); g.add(run);
  const top = it.stubZ ?? 0.1625;
  for (const sg of [-1, 1]) { const pl = box(0.07, 0.006, top - th - 0.0, M.darkSteel); pl.position.set(0, sg * 0.016, th + (top - th) / 2); g.add(pl); }
  const pin = cylY(0.007, 0.05, M.steel, 12); pin.position.set(0, 0, top); g.add(pin);
  g.position.set(...it.pos);
  return g;
}

function rodItem(it) {
  const M = mats(); const g = new THREE.Group(); const a = V(it.pos), b = V(it.to), r = it.d / 2;
  const dir = b.clone().sub(a).normalize(), len = a.distanceTo(b);
  if (it.part === 'tie_rods') {
    const e = 0.032;
    g.add(cylBetween(a.clone().addScaledVector(dir, e), b.clone().addScaledVector(dir, -e), r, M.steel, 14));
    for (const [p, sgn] of [[a, 1], [b, -1]]) { // rod ends: shank, eye, ball
      const q = p.clone().addScaledVector(dir, sgn * e);
      g.add(cylBetween(p.clone().addScaledVector(dir, sgn * 0.012), q, r * 1.25, M.darkSteel, 10));
      const eye = mesh(new THREE.TorusGeometry(0.0115, 0.0045, 8, 18), M.darkSteel); eye.position.copy(p).addScaledVector(dir, sgn * 0.0); eye.rotation.set(Math.PI / 2, 0, 0); g.add(eye);
      const ball = sphere(0.0075, M.steel, 12); ball.position.copy(p); g.add(ball);
      const jam = hexBolt(r * 1.9, 0.007, M.steel); jam.position.copy(q); jam.quaternion.setFromUnitVectors(Y, dir); g.add(jam);
    }
  } else {
    g.add(cylBetween(a, b, r, M.steel, 14));
    for (const t of [0.12, 0.62]) { // flange bearings on the frame
      const p = a.clone().lerp(b, 1 - t);
      const fl = box(0.07, 0.07, 0.012, M.cast, 0.004); fl.position.copy(p); fl.quaternion.setFromUnitVectors(new THREE.Vector3(0, 0, 1), dir);
      g.add(fl);
      const hs = mesh(new THREE.CylinderGeometry(0.02, 0.02, 0.026, 20), M.cast); hs.position.copy(p); hs.quaternion.setFromUnitVectors(Y, dir); g.add(hs);
    }
    const arm = box(0.028, 0.12, 0.01, M.darkSteel, 0.003); arm.position.copy(b); g.add(arm); // pitman arm
  }
  return g;
}

// ---- 50 cc scooter engine with its CVT case and final gear housing
function scooterItem(it, ctx) {
  const M = mats(); const g = new THREE.Group();
  const L = it.length, W = it.width, H = it.height;
  const out = [it.out[0] - it.pos[0], it.out[1] - it.pos[1], it.out[2] - it.pos[2]];
  const front = it.cylinder.startsWith('-') ? -1 : 1;
  const xr = -front * L / 2, xf = front * L / 2; // rear and front ends along x
  const plastic = M.plastic, gear = std(0x6b727a, 0.5, 0.7);
  const at = (m, x, y, z) => { m.position.set(x, y, z); g.add(m); return m; };
  at(box(L * 0.92, W * 0.78, 0.012, M.darkSteel, 0.003), 0, -W * 0.06, 0.006);
  // final gear housing at the rear, on the output side (-y)
  at(cylY(0.075, W * 0.5, gear, 36), out[0], -W / 2 + W * 0.25, out[2]);
  at(box(0.1, W * 0.5, 0.14, gear, 0.03), out[0], -W / 2 + W * 0.25, out[2] - 0.05);
  at(cylY(0.045, 0.012, M.alu, 28), out[0], -W / 2 + 0.006, out[2]);
  for (let i = 0; i < 5; i++) { const a = i / 5 * Math.PI * 2; at(hexBolt(0.006, 0.01, M.steel), out[0] + Math.cos(a) * 0.058, -W / 2 + 0.003, out[2] + Math.sin(a) * 0.058); }
  // output shaft to the sprocket
  const sp = ctx.design.items.find((o) => o.type === 'sprocket' && Math.abs(o.pos[0] - it.out[0]) < 0.002 && Math.abs(o.pos[2] - it.out[2]) < 0.002);
  const yEnd = sp ? sp.pos[1] - it.pos[1] - sp.t : out[1] - 0.02;
  at(cylY(0.0095, Math.abs(yEnd - out[1]) + 0.01, M.steel, 20), out[0], (yEnd + out[1]) / 2, out[2]);
  // CVT case on the +y side from the engine to the final gear housing
  const cvtY = W / 2 - 0.045, cvtX0 = out[0], cvtX1 = front * (L * 0.12);
  const xa = Math.min(cvtX0, cvtX1), xb = Math.max(cvtX0, cvtX1), r1 = 0.07, r2 = 0.088;
  at(box(xb - xa, 0.09, 0.13, plastic, 0.03), (xa + xb) / 2, cvtY, out[2] - 0.01);
  at(cylY(r1 + 0.01, 0.09, plastic, 36), cvtX0, cvtY, out[2]);
  at(cylY(r2, 0.09, plastic, 36), cvtX1, cvtY, out[2] + 0.005);
  for (const [cx, rr] of [[cvtX0, r1], [cvtX1, r2]]) at(cylY(rr * 0.5, 0.006, M.black, 24), cx, W / 2 + 0.001, out[2]);
  for (let i = 0; i < 9; i++) at(box(0.01, 0.003, 0.1, M.black), xa + 0.04 + i * (xb - xa - 0.08) / 8, W / 2 + 0.0005, out[2] - 0.01);
  // crankcase
  at(box(L * 0.3, W * 0.5, 0.2, M.alu, 0.025), front * L * 0.06, -W * 0.05, 0.115);
  // horizontal finned cylinder pointing forward, with a cooling shroud
  const cz = 0.11, cy0 = -W * 0.05, cx0 = front * (L * 0.2), nFin = 9, cylEnd = xf - front * 0.045;
  g.add(cylBetween(new THREE.Vector3(cx0, cy0, cz), new THREE.Vector3(cylEnd, cy0, cz), 0.034, M.cast, 20));
  for (let i = 0; i < nFin; i++) {
    const fin = mesh(new THREE.CylinderGeometry(0.056, 0.056, 0.0045, 24), M.finDark); fin.rotation.z = Math.PI / 2;
    at(fin, cx0 + (cylEnd - cx0) * (i + 0.5) / nFin, cy0, cz);
  }
  at(box(0.06, 0.1, 0.11, M.cast, 0.01), xf - front * 0.03, cy0, cz);
  at(box(0.04, 0.09, 0.09, M.black, 0.008), xf - front * 0.01, cy0, cz + 0.005);
  g.add(cylBetween(new THREE.Vector3(xf - front * 0.04, cy0, cz + 0.05), new THREE.Vector3(xf - front * 0.04, cy0, cz + 0.095), 0.007, M.steel, 8));
  at(box((cylEnd - cx0) * 0.72, 0.14, 0.15, plastic, 0.03), cx0 + (cylEnd - cx0) * 0.36, cy0, cz + 0.005);
  for (let i = 0; i < 4; i++) at(box(0.018, 0.1, 0.002, M.black), cx0 + 0.02 + i * 0.03, cy0, cz + 0.082);
  // air box and intake
  at(box(L * 0.3, W * 0.4, 0.1, plastic, 0.03), -front * L * 0.05, -W * 0.02, H - 0.05);
  for (let i = 0; i < 5; i++) at(box(0.003, W * 0.3, 0.008, M.black), -front * L * 0.05 + (i - 2) * 0.03, -W * 0.02, H + 0.0005);
  g.add(cylBetween(new THREE.Vector3(front * L * 0.07, -W * 0.02, H - 0.06), new THREE.Vector3(xf - front * 0.04, cy0, cz + 0.06), 0.017, M.black, 12));
  // muffler running back under the unit
  const mz = 0.052, my = -W * 0.28, mx0 = xr + front * 0.03, mx1 = front * L * 0.22;
  g.add(cylBetween(new THREE.Vector3(xf - front * 0.02, cy0 - 0.03, cz - 0.045), new THREE.Vector3(mx1, my, mz), 0.012, M.darkSteel, 10));
  g.add(cylBetween(new THREE.Vector3(mx1, my, mz), new THREE.Vector3(mx0, my, mz), 0.04, M.darkSteel, 24));
  g.add(cylBetween(new THREE.Vector3(mx0, my, mz), new THREE.Vector3(mx0 - front * 0.03, my, mz), 0.017, M.steel, 12));
  for (const x of [mx1, mx0]) at(sphere(0.04, M.darkSteel, 14), x, my, mz);
  const shield = new THREE.Mesh(new THREE.CylinderGeometry(0.046, 0.046, Math.abs(mx1 - mx0) * 0.6, 24, 1, true, Math.PI * 0.2, Math.PI * 0.8), new THREE.MeshStandardMaterial({ color: C.steel, metalness: 0.8, roughness: 0.4, side: THREE.DoubleSide }));
  shield.rotation.z = Math.PI / 2; shade(shield); at(shield, (mx0 + mx1) / 2, my, mz);
  at(cylY(0.008, 0.03, M.steel, 10), 0, -W / 2 + 0.02, 0.09);
  g.position.set(...it.pos);
  return g;
}

// ---- road equipment
const LENS = { white: [0xfff6d8, 0xfff0b0], amber: [0xffa31a, 0xff8a00], red: [0xd01414, 0xff1010] };
function dirOf(facing) { const s = facing[0] === '-' ? -1 : 1, a = facing.slice(1); return new THREE.Vector3(a === 'x' ? s : 0, a === 'y' ? s : 0, a === 'z' ? s : 0); }
function lampItem(it) {
  const M = mats(); const g = new THREE.Group(); const dir = dirOf(it.facing);
  const [col, em] = LENS[it.color] || LENS.white;
  const lens = new THREE.MeshStandardMaterial({ color: col, emissive: em, emissiveIntensity: 0.55, roughness: 0.2, metalness: 0.0 });
  if (it.d) {
    const depth = it.d * 0.7;
    const hs = mesh(new THREE.CylinderGeometry(it.d / 2, it.d / 2 * 0.85, depth, 28), it.role === 'head' ? M.rim : M.darkSteel); hs.position.y = -depth / 2; g.add(hs);
    const rim = mesh(new THREE.TorusGeometry(it.d / 2 * 0.98, it.d * 0.035, 8, 28), M.steel); rim.rotation.x = Math.PI / 2; g.add(rim);
    const ln = mesh(new THREE.SphereGeometry(it.d / 2 * 0.95, 24, 8, 0, Math.PI * 2, 0, Math.PI / 2), lens); ln.scale.y = 0.45; g.add(ln);
    g.quaternion.setFromUnitVectors(Y, dir);
  } else {
    const [sx, sy, sz] = it.size;
    g.add(box(sx, sy, sz, M.black, 0.004));
    const l = box(Math.abs(dir.x) ? sx + 0.004 : sx * 0.9, sy * 0.92, sz * 0.8, lens, 0.003); l.position.copy(dir.clone().multiplyScalar(0.004)); g.add(l);
  }
  g.position.set(...it.pos); return g;
}
function mirrorItem(it) {
  const M = mats(); const g = new THREE.Group(); const dir = dirOf(it.facing);
  const p = V(it.pos), st = V(it.stem).sub(p);
  g.add(cylBetween(st, new THREE.Vector3(0, 0, 0), 0.008, M.black, 10));
  const base = sphere(0.014, M.black, 10); base.position.copy(st); g.add(base);
  const m = new THREE.Group();
  m.add(mesh(new THREE.CylinderGeometry(it.d / 2 * 1.05, it.d / 2, 0.02, 32), M.black));
  const glass = mesh(new THREE.CylinderGeometry(it.d / 2 * 0.92, it.d / 2 * 0.92, 0.003, 32), std(0xcfe4f2, 0.05, 1.0)); glass.position.y = 0.0105; m.add(glass);
  m.quaternion.setFromUnitVectors(Y, dir); g.add(m);
  g.position.copy(p); return g;
}
function plateNumberItem(it) {
  const M = mats(); const g = new THREE.Group(); const [sx, sy, sz] = it.size;
  g.add(box(sx, sy, sz, std(0x1d2a22, 0.5, 0.2), 0.001));
  const c = document.createElement('canvas'); c.width = 512; c.height = 300; const x = c.getContext('2d');
  x.fillStyle = '#f4f4ee'; x.fillRect(0, 0, 512, 300); x.strokeStyle = '#1d2a22'; x.lineWidth = 8; x.strokeRect(10, 10, 492, 280);
  x.fillStyle = '#1d2a22'; x.font = 'bold 110px sans-serif'; x.textAlign = 'center'; x.fillText('・ ・・', 256, 120); x.font = 'bold 130px sans-serif'; x.fillText('・・-・・', 256, 250);
  const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace;
  for (const sg of [-1, 1]) {
    const f = new THREE.Mesh(new THREE.PlaneGeometry(sy * 0.94, sz * 0.9), new THREE.MeshStandardMaterial({ map: t, roughness: 0.5 }));
    f.quaternion.setFromRotationMatrix(new THREE.Matrix4().makeBasis(new THREE.Vector3(0, sg, 0), new THREE.Vector3(0, 0, 1), new THREE.Vector3(sg, 0, 0)));
    f.position.x = sg * (sx / 2 + 0.0004); g.add(f);
  }
  g.position.set(...it.pos); return g;
}
function boxItem(it) {
  const M = mats(); const g = new THREE.Group(); const [sx, sy, sz] = it.size;
  if (it.part === 'horn') {
    g.add(box(sx, sy, sz, M.black, 0.01));
    const tr = mesh(new THREE.CylinderGeometry(sz * 0.2, sz * 0.5, sx * 0.9, 20), M.steel); tr.rotation.z = Math.PI / 2; tr.position.x = sx * 0.55; g.add(tr);
  } else if (it.part === 'battery') {
    g.add(box(sx, sy, sz, std(0x25292e, 0.6, 0.1), 0.006));
    const lab = box(sx * 0.7, sy * 1.01, sz * 0.3, std(0xd7d7d0, 0.6, 0), 0.002); lab.position.z = -sz * 0.1; g.add(lab);
    for (const [sg, col] of [[-1, 0xc01818], [1, 0x222222]]) { const t = cylY(0.007, 0.012, std(col, 0.5, 0.3), 12); t.rotation.x = Math.PI / 2; t.position.set(sg * sx * 0.28, 0, sz / 2 + 0.006); g.add(t); }
  } else if (it.color === 'pan') g.add(box(sx, sy, sz, M.pan, 0.004));
  else g.add(box(sx, sy, sz, M.darkSteel, 0.005));
  g.position.set(...it.pos); return g;
}

// ---- winter and future-water items
function hull2(pts) { // convex hull, counter-clockwise (monotone chain)
  const p = pts.slice().sort((a, b) => a[0] - b[0] || a[1] - b[1]); const cr = (o, a, b) => (a[0] - o[0]) * (b[1] - o[1]) - (a[1] - o[1]) * (b[0] - o[0]);
  const lo = [], up = [];
  for (const q of p) { while (lo.length >= 2 && cr(lo[lo.length - 2], lo[lo.length - 1], q) <= 0) lo.pop(); lo.push(q); }
  for (const q of p.slice().reverse()) { while (up.length >= 2 && cr(up[up.length - 2], up[up.length - 1], q) <= 0) up.pop(); up.push(q); }
  return lo.slice(0, -1).concat(up.slice(0, -1));
}
function offsetPoly(h, d) { // move each vertex of a counter-clockwise polygon outward by d
  return h.map((p, i) => {
    const a = h[(i + h.length - 1) % h.length], b = h[(i + 1) % h.length];
    const n1 = [p[1] - a[1], a[0] - p[0]], n2 = [b[1] - p[1], p[0] - b[0]];
    const l1 = Math.hypot(...n1) || 1, l2 = Math.hypot(...n2) || 1;
    const nx = n1[0] / l1 + n2[0] / l2, ny = n1[1] / l1 + n2[1] / l2, nl = Math.hypot(nx, ny) || 1;
    return [p[0] + nx / nl * d, p[1] + ny / nl * d];
  });
}
function trackItem(it) { // a rubber band around the road wheels (x-z plane, centred at y = 0)
  const M = mats(); const g = new THREE.Group(); const t = it.t, w = it.width;
  const pts = [];
  for (const [cx, cz, r] of it.wheels) for (let i = 0; i < 24; i++) { const a = i / 24 * Math.PI * 2; pts.push([cx + r * Math.cos(a), cz + r * Math.sin(a)]); }
  const h = hull2(pts), outer = offsetPoly(h, t), inner = h; // the band rests on the wheels: inner face on the hull
  const sh = new THREE.Shape(outer.map((p) => new THREE.Vector2(p[0], p[1])));
  sh.holes.push(new THREE.Path(inner.slice().reverse().map((p) => new THREE.Vector2(p[0], p[1]))));
  const geo = new THREE.ExtrudeGeometry(sh, { depth: w, bevelEnabled: false, curveSegments: 4 });
  geo.translate(0, 0, -w / 2); geo.rotateX(Math.PI / 2);
  g.add(mesh(geo, M.track));
  // lugs: small cleats across the band, evenly spaced along the outer face
  const lugH = Math.min(0.016, t * 0.7), step = 0.055, segs = [];
  let per = 0; for (let i = 0; i < outer.length; i++) { const a = outer[i], b = outer[(i + 1) % outer.length], l = Math.hypot(b[0] - a[0], b[1] - a[1]); segs.push({ a, b, l, s: per }); per += l; }
  const n = Math.max(8, Math.round(per / step)), lug = new THREE.InstancedMesh(new THREE.BoxGeometry(0.014, w * 0.92, lugH * 2), M.lug, n);
  const mt = new THREE.Matrix4(), q = new THREE.Quaternion(), e = new THREE.Euler();
  let si = 0;
  for (let k = 0; k < n; k++) {
    const d = (k + 0.5) / n * per; while (si < segs.length - 1 && segs[si].s + segs[si].l < d) si++;
    const sg = segs[si], f = Math.min(1, (d - sg.s) / (sg.l || 1)), tx = (sg.b[0] - sg.a[0]) / (sg.l || 1), tz = (sg.b[1] - sg.a[1]) / (sg.l || 1);
    e.set(0, -Math.atan2(tz, tx), 0); q.setFromEuler(e);
    mt.compose(new THREE.Vector3(sg.a[0] + (sg.b[0] - sg.a[0]) * f, 0, sg.a[1] + (sg.b[1] - sg.a[1]) * f), q, new THREE.Vector3(1, 1, 1));
    lug.setMatrixAt(k, mt);
  }
  shade(lug); g.add(lug);
  for (const [cx, cz, r] of it.wheels) { const c = cylY(r * 0.96, w * 0.8, M.rim, 32); c.position.set(cx, 0, cz); g.add(c); }
  return g;
}
function sheetItem(it) { // a flat slab through four corners (UHMW plastic)
  const M = mats(); const c = it.corners.map(V); const u = c[1].clone().sub(c[0]), v = c[3].clone().sub(c[0]);
  const n = new THREE.Vector3().crossVectors(u, v).normalize().multiplyScalar(it.t / 2);
  const top = c.map((p) => p.clone().add(n)), bot = c.map((p) => p.clone().sub(n)), pos = [];
  const tri = (a, b, d) => pos.push(a.x, a.y, a.z, b.x, b.y, b.z, d.x, d.y, d.z);
  const quad = (a, b, d, e) => { tri(a, b, d); tri(a, d, e); };
  quad(top[0], top[1], top[2], top[3]); quad(bot[3], bot[2], bot[1], bot[0]);
  for (let i = 0; i < 4; i++) { const j = (i + 1) % 4; quad(top[i], bot[i], bot[j], top[j]); }
  const geo = new THREE.BufferGeometry(); geo.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3)); geo.computeVertexNormals();
  return mesh(geo, M.pan);
}
function floatItem(it) { // a pontoon along x with tapered ends
  const M = mats(); const g = new THREE.Group(); const r = it.d / 2, L = it.l, k = Math.min(r * 1.6, L * 0.2);
  const prof = [[0, -L / 2], [r * 0.45, -L / 2 + k * 0.12], [r * 0.8, -L / 2 + k * 0.45], [r, -L / 2 + k], [r, L / 2 - k], [r * 0.8, L / 2 - k * 0.45], [r * 0.45, L / 2 - k * 0.12], [0, L / 2]];
  const geo = new THREE.LatheGeometry(prof.map((p) => new THREE.Vector2(p[0], p[1])), 32); geo.rotateZ(-Math.PI / 2);
  const m = mesh(geo, M.float); m.castShadow = false; m.userData.cast = false; g.add(m);
  g.position.set(...it.pos); return g;
}
function outboardItem(it) { // a motor head at the stern top and a shaft that leans back toward -x
  const M = mats(); const g = new THREE.Group(); const tl = it.tilt_deg * Math.PI / 180;
  const head = box(0.25, 0.15, 0.30, M.motorCowl, 0.03); head.position.set(0, 0, 0.0); g.add(head);
  const a = new THREE.Vector3(0, 0, -0.1), dir = new THREE.Vector3(-Math.sin(tl), 0, -Math.cos(tl)), b = a.clone().addScaledVector(dir, it.shaft);
  g.add(cylBetween(a, b, 0.035, M.motor, 14, 0.03));
  const torp = cylBetween(b.clone().addScaledVector(dir, -0.04), b.clone().addScaledVector(dir, 0.1), 0.045, M.motor, 14, 0.03); g.add(torp);
  const hubP = b.clone().addScaledVector(dir, 0.1), hub = sphere(0.02, M.steel, 10); hub.position.copy(hubP); g.add(hub);
  const side = new THREE.Vector3(0, 1, 0), nrm = new THREE.Vector3().crossVectors(dir, side).normalize();
  for (let i = 0; i < 3; i++) { // three blades around the shaft axis
    const ang = i / 3 * Math.PI * 2, rad = new THREE.Vector3().addScaledVector(side, Math.cos(ang)).addScaledVector(nrm, Math.sin(ang));
    const blade = cylBetween(hubP, hubP.clone().addScaledVector(rad, 0.075), 0.011, M.steel, 8); g.add(blade);
  }
  g.position.set(...it.pos); return g;
}
function gaugeItem(it) {
  const M = mats(); const g = new THREE.Group(); const dir = dirOf(it.facing); const r = it.d / 2;
  const c = document.createElement('canvas'); c.width = c.height = 256; const x = c.getContext('2d');
  x.fillStyle = '#0d0f11'; x.fillRect(0, 0, 256, 256); x.strokeStyle = '#f0f0f0'; x.lineWidth = 4;
  for (let i = 0; i <= 8; i++) { const a = (-225 + i * 33.75) * Math.PI / 180, c1 = Math.cos(a), s1 = Math.sin(a); x.beginPath(); x.moveTo(128 + c1 * 100, 128 - s1 * 100); x.lineTo(128 + c1 * 116, 128 - s1 * 116); x.stroke(); }
  x.strokeStyle = '#ff5030'; x.lineWidth = 6; x.beginPath(); x.moveTo(128, 128); x.lineTo(128 + Math.cos(-0.4) * 95, 128 - Math.sin(-0.4) * 95); x.stroke();
  const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace;
  const hs = mesh(new THREE.CylinderGeometry(r, r * 0.9, r * 0.9, 32), M.black); hs.position.y = -r * 0.45; g.add(hs);
  const face = new THREE.Mesh(new THREE.CircleGeometry(r * 0.92, 32), new THREE.MeshStandardMaterial({ map: t, roughness: 0.3 })); face.rotation.x = -Math.PI / 2; face.position.y = 0.0015; g.add(face);
  const bez = mesh(new THREE.TorusGeometry(r * 0.95, r * 0.06, 8, 32), M.steel); bez.rotation.x = Math.PI / 2; g.add(bez);
  g.quaternion.setFromUnitVectors(Y, dir); g.position.set(...it.pos); return g;
}
function leverItem(it) {
  const M = mats(); const g = new THREE.Group(); const a = V(it.pos), b = V(it.to), d = b.clone().sub(a), dir = d.clone().normalize();
  g.add(cylBetween(a, b, 0.008, M.steel, 10));
  g.add(cylBetween(b.clone().addScaledVector(dir, -Math.min(0.12, d.length() * 0.4)), b, 0.0155, M.rubber, 14));
  const k = sphere(0.016, M.rubber, 12); k.position.copy(b); g.add(k);
  const piv = cylY(0.014, 0.03, M.darkSteel, 16); piv.position.copy(a); g.add(piv);
  return g;
}
// ---- padded scooter saddle on top of the engine unit; pos is the centre of the base
function saddleItem(it) {
  const M = mats(); const K = ILLUSTRATIVE.saddle; const g = new THREE.Group();
  const { l, w, h } = it;
  const rear = box(l * (1 - K.noseLenFrac), w, h, M.seat, h * K.cornerFrac); rear.position.set(-l * K.noseLenFrac / 2, 0, h / 2); g.add(rear);
  const nose = box(l * K.noseLenFrac * 1.6, w * K.noseFrac, h * 0.85, M.seat, h * K.cornerFrac); nose.position.set(l / 2 - l * K.noseLenFrac * 0.8, 0, h * 0.85 / 2); g.add(nose);
  const base = box(l * 0.9, w * 0.8, 0.012, M.darkSteel, 0.004); base.position.set(0, 0, 0.004); g.add(base);
  g.position.set(it.pos[0], it.pos[1], it.pos[2]);
  return g;
}

// ---- handlebar: a bar across y at pos, black grips at both ends, a clamp at the centre
function handlebarItem(it) {
  const M = mats(); const K = ILLUSTRATIVE.handlebar; const g = new THREE.Group();
  const r = it.d / 2, half = it.width / 2;
  const bar = cylY(r, it.width, M.steel, 16); g.add(bar);
  for (const s of [-1, 1]) {
    const grip = cylY(r * 1.45, it.grips, M.rubber, 16); grip.position.y = s * (half - it.grips / 2); g.add(grip);
    const end = sphere(r * 1.45, M.rubber, 10); end.position.y = s * half; g.add(end);
  }
  const clamp = box(K.clampLen, K.clampLen, it.d * K.clampFactor, M.darkSteel, 0.008); g.add(clamp);
  g.position.set(...it.pos);
  return g;
}

// ---- fender: a thin curved shell over the top of a wheel, od/2 in radius, width wide
function fenderItem(it) {
  const M = mats(); const K = ILLUSTRATIVE.fender; const g = new THREE.Group();
  const a = K.halfAngleDeg * Math.PI / 180;
  const geo = new THREE.CylinderGeometry(it.od / 2, it.od / 2, it.width, 40, 1, true, -a, 2 * a); // theta 0 is +z (up)
  g.add(mesh(geo, new THREE.MeshStandardMaterial({ color: C.paint, roughness: 0.38, metalness: 0.15, side: THREE.DoubleSide })));
  for (const s of [-1, 1]) { // thin rolled edge at each side
    const e = mesh(new THREE.TorusGeometry(it.od / 2, K.shellMargin, 6, 24, 2 * a), M.paintDark);
    e.rotation.set(Math.PI / 2, 0, 0); e.position.y = s * it.width / 2; e.rotation.z = Math.PI / 2 - a; g.add(e);
  }
  g.position.set(...it.pos);
  return g;
}

function buildItem(it, ctx) {
  switch (it.type) {
    case 'plate': return plateFor(it);
    case 'cyl': return cylItem(it, ctx);
    case 'pillow': return pillowItem(it);
    case 'hub': return hubItem(it, ctx);
    case 'wheel': return wheelItem(it, ctx);
    case 'chains': return chainsItem(it);
    case 'disc': return discItem(it);
    case 'caliper': return caliperItem(it);
    case 'engine': return engineItem(it, ctx);
    case 'scooter_unit': return scooterItem(it, ctx);
    case 'lamp': return lampItem(it);
    case 'mirror': return mirrorItem(it);
    case 'plate_number': return plateNumberItem(it);
    case 'box': return boxItem(it);
    case 'gauge': return gaugeItem(it);
    case 'lever': return leverItem(it);
    case 'clutch': return clutchItem(it);
    case 'sprocket': return sprocketItem(it);
    case 'chain': return chainItem(it, ctx);
    case 'guard': return guardItem(it);
    case 'spindle': return spindleItem(it, ctx);
    case 'ski': return skiItem({ ...it, stubZ: it.stub_z ?? ctx.design.items.find((o) => o.type === 'spindle').to[2] });
    case 'track': return trackItem(it);
    case 'sheet': return sheetItem(it);
    case 'float': return floatItem(it);
    case 'outboard': return outboardItem(it);
    case 'rod': return rodItem(it);
    case 'saddle': return saddleItem(it);
    case 'handlebar': return handlebarItem(it);
    case 'fender': return fenderItem(it);
    default: return null;
  }
}

// Builds the whole kart. Returns { root, groups } where each group carries userData
// { part, configs, type, rider } and every mesh inside carries userData.part.
export function buildKart(design) {
  const root = new THREE.Group(); root.name = 'kart';
  root.applyMatrix4(KART_TO_WORLD);
  const ctx = { design }; const groups = [];
  const add = (g, meta) => {
    g.userData = { ...g.userData, ...meta };
    g.traverse((o) => { o.userData.part = meta.part; });
    root.add(g); groups.push(g);
  };
  for (const g of buildMembers(design)) add(g, { part: g.userData.part, configs: g.userData.configs, type: 'member' });
  for (const it of design.items) {
    const g = buildItem(it, ctx);
    if (g) add(g, { part: it.part, configs: it.configs, type: it.type, rider: it.rider, ground: !!it.ground, future: !!it.future });
  }
  return { root, groups };
}

// ---------------------------------------------------------------- mannequin
function ik(S, T, l1, l2, pole) {
  const d0 = T.clone().sub(S), dist = Math.min(Math.max(d0.length(), Math.abs(l1 - l2) + 1e-4), l1 + l2 - 1e-4);
  const dir = d0.clone().normalize();
  const a = (l1 * l1 - l2 * l2 + dist * dist) / (2 * dist), hh = Math.sqrt(Math.max(0, l1 * l1 - a * a));
  const perp = pole.clone().sub(dir.clone().multiplyScalar(pole.dot(dir))).normalize();
  const joint = S.clone().addScaledVector(dir, a).addScaledVector(perp, hh);
  return { joint, end: S.clone().addScaledVector(dir, dist) };
}
export function buildRider(design, kind) {
  const r = design.riders[kind]; if (!r) return null;
  const K = ILLUSTRATIVE.mannequin, H = r.stature, col = kind === 'adult' ? C.adult : C.child;
  const body = std(col, 0.7, 0), skin = std(C.skin, 0.7, 0);
  const g = new THREE.Group(); g.name = 'rider'; g.userData = { rider: kind };
  const limb = (a, b, rad, m = body) => { g.add(cylBetween(a, b, rad, m, 12)); };
  const ball = (p, rad, m = body) => { const s = sphere(rad, m, 14); s.position.copy(p); g.add(s); };
  const hip = V(r.hip), lr = K.limb * H;
  // astride like on an ATV: the trunk leans forward a little
  const lean = K.trunkLean * Math.PI / 180;
  const shoulder = hip.clone().add(new THREE.Vector3(Math.sin(lean), 0, Math.cos(lean)).multiplyScalar(K.trunk * H * 1.0));
  const pelvis = box(0.1 * H / 1.7 * 1.3, 0.3 * H / 1.7 * 0.9, 0.14 * H / 1.7, body, 0.04); pelvis.position.copy(hip); g.add(pelvis);
  const chestC = hip.clone().lerp(shoulder, 0.62);
  limb(hip, shoulder, lr * 4.4);
  const chest = box(0.18 * H / 1.7, K.shoulderHalfWidth * 2 * H * 1.05, 0.22 * H / 1.7, body, 0.05); chest.position.copy(chestC); chest.rotation.y = lean; g.add(chest);
  const neck = shoulder.clone().add(new THREE.Vector3(0, 0, 0.03 * H));
  limb(shoulder, neck, lr * 1.6, skin);
  const headC = neck.clone().add(new THREE.Vector3(0.03, 0, K.head * H * 1.2));
  const head = sphere(K.head * H, skin, 20); head.position.copy(headC); head.scale.set(1.0, 0.9, 1.15); g.add(head);
  const helmet = mesh(new THREE.SphereGeometry(K.head * H * 1.12, 20, 12, 0, Math.PI * 2, 0, Math.PI * 0.62), std(0xf2f2f0, 0.3, 0.1));
  helmet.position.copy(headC).add(new THREE.Vector3(0, 0, 0.004 * H)); helmet.scale.set(1.0, 0.95, 1.15); g.add(helmet);
  // legs: thigh and shin by IK from each hip joint to the ankle above the heel on the footboard,
  // knees bent forward and outward
  const thigh = K.legFrac * H, shin = K.legFrac * H;
  for (const sy of [-1, 1]) {
    const hp = new THREE.Vector3(hip.x, hip.y + sy * K.hipHalfWidth * H, hip.z);
    const heel = new THREE.Vector3(r.heel[0], sy * r.foot_y, r.heel[2]);
    const ankle = heel.clone().add(new THREE.Vector3(0.012, 0, 0.04 * H));
    const { joint, end } = ik(hp, ankle, thigh, shin, new THREE.Vector3(1, sy * 0.5, 0.25));
    limb(hp, joint, lr * 2.2); ball(joint, lr * 1.9); limb(joint, end, lr * 1.7); ball(hp, lr * 2.2);
    const toeDir = new THREE.Vector3(1, 0, 0);
    const toe = heel.clone().addScaledVector(toeDir, K.foot * H);
    limb(heel, toe, lr * 1.25, std(0x2d2f33, 0.8, 0)); ball(toe, lr * 1.25, std(0x2d2f33, 0.8, 0));
    limb(end, heel, lr * 1.4);
  }
  // arms to both grips
  for (const sy of [-1, 1]) {
    const sp = shoulder.clone().add(new THREE.Vector3(0, sy * K.shoulderHalfWidth * H, -0.01));
    const hand = new THREE.Vector3(r.hand[0], sy * r.hand[1], r.hand[2]);
    const { joint, end } = ik(sp, hand, K.upperArm * H, (K.foreArm + K.hand) * H, new THREE.Vector3(-0.3, sy * 0.9, -0.6));
    ball(sp, lr * 1.9); limb(sp, joint, lr * 1.5); ball(joint, lr * 1.4); limb(joint, end, lr * 1.2, skin); ball(end, lr * 1.3, skin);
  }
  g.traverse((o) => { if (o.isMesh) { o.castShadow = true; } });
  const wrap = new THREE.Group(); wrap.name = 'rider-wrap'; wrap.applyMatrix4(KART_TO_WORLD); wrap.add(g);
  return wrap;
}

// ---------------------------------------------------------------- Delica cargo space
export function makeLabel(text, size = ILLUSTRATIVE.dim.label, colour = '#0b4f9c', bg = 'rgba(255,255,255,0.88)') {
  const c = document.createElement('canvas'); const x = c.getContext('2d');
  const px = 44; x.font = `600 ${px}px "Segoe UI","Yu Gothic UI","Hiragino Sans","Noto Sans JP",sans-serif`;
  const tw = Math.ceil(x.measureText(text).width) + 28; c.width = tw; c.height = px + 20;
  x.font = `600 ${px}px "Segoe UI","Yu Gothic UI","Hiragino Sans","Noto Sans JP",sans-serif`;
  x.fillStyle = bg; x.beginPath(); x.roundRect(0, 0, c.width, c.height, 12); x.fill();
  x.fillStyle = colour; x.textBaseline = 'middle'; x.fillText(text, 14, c.height / 2 + 2);
  const tex = new THREE.CanvasTexture(c); tex.colorSpace = THREE.SRGBColorSpace;
  const sp = new THREE.Sprite(new THREE.SpriteMaterial({ map: tex, depthTest: false, transparent: true }));
  sp.scale.set(size * c.width / c.height, size, 1); sp.renderOrder = 1000;
  return sp;
}
const mmText = (m) => Math.round(m * 1000).toLocaleString('ja-JP') + ' mm';

export function buildDelica(design) {
  const D = design.delica, d = design.dims, K = ILLUSTRATIVE.delica;
  const root = new THREE.Group(); root.name = 'delica';
  const xc = (d.x_front + d.x_back) / 2, x0 = xc - D.length / 2, x1 = xc + D.length / 2;
  const mat = new THREE.MeshBasicMaterial({ color: K.colour, transparent: true, opacity: K.opacity, side: THREE.DoubleSide, depthWrite: false });
  const edge = new THREE.LineBasicMaterial({ color: K.colour });
  const boxG = new THREE.BoxGeometry(D.length, D.width_max, D.height);
  const bx = new THREE.Mesh(boxG, mat); bx.position.set(xc, 0, D.height / 2); root.add(bx);
  const el = new THREE.LineSegments(new THREE.EdgesGeometry(boxG), edge); el.position.copy(bx.position); root.add(el);
  // the cargo floor stands lip above the ground; a ramp leads down from the opening at the rear (-x)
  const lip = D.lip;
  const sill = new THREE.Mesh(new THREE.BoxGeometry(D.length, D.width_max, lip), new THREE.MeshBasicMaterial({ color: 0x8a96a3, transparent: true, opacity: 0.18, depthWrite: false }));
  sill.position.set(xc, 0, -lip / 2); root.add(sill);
  const sillE = new THREE.LineSegments(new THREE.EdgesGeometry(sill.geometry), new THREE.LineBasicMaterial({ color: 0x8a96a3 })); sillE.position.copy(sill.position); root.add(sillE);
  const rl = K.rampLength, ramp = new THREE.Shape(); ramp.moveTo(0, 0); ramp.lineTo(rl, 0); ramp.lineTo(rl, -lip); ramp.lineTo(0, 0);
  const rg = new THREE.ExtrudeGeometry(ramp, { depth: D.width_min, bevelEnabled: false });
  rg.translate(0, 0, -D.width_min / 2); rg.rotateX(Math.PI / 2);
  const rm = new THREE.Mesh(rg, new THREE.MeshStandardMaterial({ color: 0xc9ced4, roughness: 0.8, side: THREE.DoubleSide })); rm.scale.x = -1;
  rm.position.set(x0, 0, 0); rm.castShadow = true; rm.receiveShadow = true; root.add(rm);
  // opening at the rear: outer width (max) and inner width (min)
  const rect = (w, h, z0, colour) => {
    const pts = [[-w / 2, z0], [w / 2, z0], [w / 2, z0 + h], [-w / 2, z0 + h], [-w / 2, z0]].map(([y, z]) => new THREE.Vector3(x0, y, z));
    return new THREE.Line(new THREE.BufferGeometry().setFromPoints(pts), new THREE.LineBasicMaterial({ color: colour }));
  };
  root.add(rect(D.opening_max, D.height * 0.9, 0, 0xf08a00)); root.add(rect(D.opening_min, D.height * 0.9, 0, 0xd04a00));
  const l1 = makeLabel(`開口 ${mmText(D.opening_min)} 〜 ${mmText(D.opening_max)}`, 0.06, '#8a4300'); l1.position.set(x0, 0, D.height * 0.9 + 0.06); root.add(l1);
  const l2 = makeLabel(`荷室 ${mmText(D.length)} × ${mmText(D.width_max)} × ${mmText(D.height)}`, 0.06, '#1f5f9f'); l2.position.set(xc, 0, D.height + 0.07); root.add(l2);
  const l3 = makeLabel(`荷室の床の高さ ${mmText(lip)}`, 0.055, '#444'); l3.position.set(x0 - 0.1, D.width_max / 2 + 0.02, -lip / 2); root.add(l3);
  const wrap = new THREE.Group(); wrap.applyMatrix4(KART_TO_WORLD); wrap.add(root); wrap.name = 'delica';
  wrap.userData.lip = lip;
  return wrap;
}

// ---------------------------------------------------------------- dimension lines
export function buildDims(design, config) {
  const winter = config === 'winter' && design.dims_winter; // the winter form is longer and rides higher
  const d = winter ? { ...design.dims, ...design.dims_winter } : design.dims, K = ILLUSTRATIVE.dim, root = new THREE.Group(); root.name = 'dims';
  const mat = new THREE.LineBasicMaterial({ color: K.colour, depthTest: false, transparent: true });
  const wTot = config === 'transport' ? d.width_transport : d.width, tr = config === 'transport' ? d.track_rear_narrow : d.track_rear;
  const line = (a, b, text, tick, lift = [0, 0, 0]) => {
    const A = V(a), B = V(b), T = V(tick).normalize().multiplyScalar(K.tick / 2);
    const pts = [A, B, A.clone().add(T), A.clone().sub(T), A, B, B.clone().add(T), B.clone().sub(T)];
    const l = new THREE.Line(new THREE.BufferGeometry().setFromPoints(pts), mat); l.renderOrder = 998; root.add(l);
    const lab = makeLabel(text, K.label); lab.position.copy(A.clone().lerp(B, 0.5)).add(V(lift)); root.add(lab);
    // fine extension lines are left out so that the lines stay readable
  };
  const yL = wTot / 2 + 0.18, yR = -(wTot / 2 + 0.18), zg = 0.004;
  line([d.x_back, yL, zg], [d.x_front, yL, zg], `全長 ${mmText(d.length)}`, [0, 1, 0], [0, 0.0, 0.04]);
  line([0, yR, zg], [d.wheelbase, yR, zg], `ホイールベース ${mmText(d.wheelbase)}`, [0, 1, 0], [0, 0, 0.04]);
  line([d.x_back - 0.2, -wTot / 2, zg], [d.x_back - 0.2, wTot / 2, zg], `全幅 ${mmText(wTot)}`, [1, 0, 0], [-0.0, 0, 0.04]);
  line([d.x_back - 0.4, -tr / 2, zg], [d.x_back - 0.4, tr / 2, zg], `後輪トレッド ${mmText(tr)}`, [1, 0, 0], [0, 0, 0.04]);
  line([d.wheelbase + 0.36, -d.track_front / 2, zg], [d.wheelbase + 0.36, d.track_front / 2, zg], `前輪トレッド ${mmText(d.track_front)}`, [1, 0, 0], [0, 0, 0.04]);
  line([d.x_back - 0.05, yL + 0.1, 0], [d.x_back - 0.05, yL + 0.1, d.height], `全高 ${mmText(d.height)}`, [1, 0, 0], [0, 0.0, 0]);
  const clr = winter ? d.belly : d.clearance; // winter: the belly of the sled pan above the snow
  line([d.wheelbase * 0.8, yR - 0.1, 0], [d.wheelbase * 0.8, yR - 0.1, clr], `地上高 ${mmText(clr)}`, [1, 0, 0], [0, 0, 0.0]);
  if (!winter) line([d.wheelbase * 0.2, yR - 0.1, 0], [d.wheelbase * 0.2, yR - 0.1, d.low_point], `最低部 ${mmText(d.low_point)}`, [1, 0, 0], [0, 0, 0.0]);
  const wrap = new THREE.Group(); wrap.applyMatrix4(KART_TO_WORLD); wrap.add(root); wrap.name = 'dims';
  return wrap;
}
