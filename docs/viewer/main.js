// 3D viewer and driving screen. Scenes: yard (drive), inspect (dimensions, tip triangle),
// delica (cargo fit). All kart numbers come from the record through params.js.
import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { loadRecord, makeParams, cgHeight } from './params.js';
import { buildKart, ILLUSTRATIVE } from './kart-model.js';

// Drawing constants of this screen that are not in the record: model constant, not in the record
export const VIEW_CONSTANTS = {
  rampLength: 1.2,       // ramp horizontal length drawn at the Delica opening (m)
  rampWidth: 0.9,        // ramp width drawn (m)
  chaseBack: 7,          // chase camera distance behind the kart (m)
  chaseUp: 3,            // chase camera height above the kart (m)
  startX: -35,           // start position in the yard, on the paved zone (m)
  startZ: -17,
  dimOffset: 0.18,       // distance of dimension lines from the kart (m)
  maxSteer: 0.6,         // clamp for the drawn front wheel angle (rad)
  tipBarFull: 3,         // tip margin that fills the HUD bar
  gravity: 9.81,         // to show lateral acceleration in g
};
const VC = VIEW_CONSTANTS;
const SCENES = ['yard', 'inspect', 'delica'];
const RIDERS = ['adult', 'child'];
const SURFACE_COLOUR = {
  paved: 0x6f7378, gravel: 0xb09a74, grass: 0x6aa84f, grassLong: 0x4f8a3a,
  snowPacked: 0xdfe9f2, snowFresh: 0xf8fbff, ice: 0xb6e3f0,
};
const OK = 0x2e9e4f, BAD = 0xe03131;

const $ = (id) => document.getElementById(id);
const fmt = (x, d = 2) => (typeof x === 'number' && isFinite(x) ? x.toFixed(d) : String(x));
const inFrame = window.parent !== window;

function showError(msg) {
  $('loading').hidden = true;
  const e = $('error'); e.hidden = false; e.textContent = msg;
}

// ---- state from the URL ------------------------------------------------------------------
const q = new URLSearchParams(location.search);
const pick1 = (v, list, d) => (list.includes(v) ? v : d);
const ui = {
  scene: pick1(q.get('scene'), SCENES, 'yard'),
  setup: 'summer', rider: pick1(q.get('rider'), RIDERS, 'adult'),
  child: q.get('child') === '1', sink: q.get('sink') === 'belt' ? 'belt' : 'wheels',
};
if (q.get('embed') === '1') document.body.classList.add('embed');

// theme
function applyTheme(t) { if (t) document.documentElement.setAttribute('data-theme', t); updateBackground?.(); }
$('theme').addEventListener('click', () => {
  const dark = document.documentElement.getAttribute('data-theme') === 'dark' ||
    (!document.documentElement.getAttribute('data-theme') && matchMedia('(prefers-color-scheme: dark)').matches);
  applyTheme(dark ? 'light' : 'dark');
});
let updateBackground = null;

main().catch((e) => showError('Could not start the viewer.\n' + (e && e.message ? e.message : e)));

async function main() {
  let record, yardMod, simMod;
  try { record = await loadRecord('../data/record.json'); }
  catch (e) { throw new Error('The record could not be read (../data/record.json). ' + e.message); }
  try { [yardMod, simMod] = await Promise.all([import('./yard.js'), import('./sim.js')]); }
  catch (e) { throw new Error('yard.js or sim.js could not be loaded: ' + e.message); }
  const { makeYard } = yardMod;
  const { createKart, SETUPS, delicaFit, runTests } = simMod;
  const p = makeParams(record);
  ui.setup = pick1(q.get('setup'), SETUPS, 'summer');

  $('loading').hidden = true;
  $('app').hidden = false;

  // ---- renderer ----------------------------------------------------------------------------
  const view = $('view');
  const renderer = new THREE.WebGLRenderer({ antialias: true });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
  view.insertBefore(renderer.domElement, view.firstChild);
  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(55, 1, 0.05, 500);
  const controls = new OrbitControls(camera, renderer.domElement);
  controls.enableDamping = true;
  scene.add(new THREE.HemisphereLight(0xffffff, 0x667788, 1.6));
  const sun = new THREE.DirectionalLight(0xffffff, 1.4); sun.position.set(-20, 40, 15); scene.add(sun);
  updateBackground = () => {
    const c = getComputedStyle(document.documentElement).getPropertyValue('--scene').trim() || '#dfe8f1';
    scene.background = new THREE.Color(c);
  };
  updateBackground();
  function resize() {
    const w = view.clientWidth, h = view.clientHeight;
    renderer.setSize(w, h, false); camera.aspect = w / h; camera.updateProjectionMatrix();
  }
  new ResizeObserver(resize).observe(view);

  // ---- helpers -----------------------------------------------------------------------------
  function label(text, h = 0.25, colour = '#111', bg = 'rgba(255,255,255,0.85)') {
    const c = document.createElement('canvas'); c.width = 512; c.height = 96;
    const x = c.getContext('2d');
    x.font = 'bold 40px system-ui, sans-serif';
    const w = Math.min(500, x.measureText(text).width + 24);
    x.fillStyle = bg; x.fillRect((512 - w) / 2, 8, w, 80);
    x.fillStyle = colour; x.textAlign = 'center'; x.textBaseline = 'middle'; x.fillText(text, 256, 48, 488);
    const t = new THREE.CanvasTexture(c);
    const s = new THREE.Sprite(new THREE.SpriteMaterial({ map: t, depthTest: false, transparent: true }));
    s.scale.set(h * 512 / 96, h, 1); s.renderOrder = 10;
    return s;
  }
  function line(points, colour, width = 1) {
    const g = new THREE.BufferGeometry().setFromPoints(points.map((a) => new THREE.Vector3(...a)));
    const l = new THREE.Line(g, new THREE.LineBasicMaterial({ color: colour, depthTest: false }));
    l.renderOrder = 9; return l;
  }
  // dimension line a-b with end ticks and a label
  function dim(a, b, text, colour = 0x111111, tick = [0, 0.04, 0]) {
    const grp = new THREE.Group();
    const A = new THREE.Vector3(...a), B = new THREE.Vector3(...b), T = new THREE.Vector3(...tick);
    grp.add(line([a, b], colour));
    grp.add(line([A.clone().sub(T).toArray(), A.clone().add(T).toArray()], colour));
    grp.add(line([B.clone().sub(T).toArray(), B.clone().add(T).toArray()], colour));
    const l = label(text, 0.12, '#' + colour.toString(16).padStart(6, '0'));
    l.position.copy(A).add(B).multiplyScalar(0.5).add(new THREE.Vector3(0, 0.1, 0));
    grp.add(l);
    return grp;
  }
  function edges(w, h, d, colour) {
    const e = new THREE.LineSegments(new THREE.EdgesGeometry(new THREE.BoxGeometry(w, h, d)),
      new THREE.LineBasicMaterial({ color: colour }));
    return e;
  }
  function disposeTree(o) {
    o.traverse((n) => {
      if (n.geometry) n.geometry.dispose();
      if (n.material) { const ms = Array.isArray(n.material) ? n.material : [n.material]; ms.forEach((m) => { m.map?.dispose(); m.dispose(); }); }
    });
  }

  // ---- state of the simulation ---------------------------------------------------------------
  const yard = makeYard(p);
  let sim = null, kartModel = null, root = null;
  let tipRoll = 0, tipSide = 0, camSnap = true;
  const input = { throttle: 0, brake: 0, steer: 0 };
  const keys = new Set(), touch = new Set();

  function newSim() {
    sim = createKart(p, { setup: ui.setup, rider: ui.rider, childLimit: ui.child, trackSink: ui.sink });
    resetSim();
  }
  function resetSim() {
    sim.reset({ x: VC.startX, z: VC.startZ, heading: 0 });
    tipRoll = 0; tipSide = 0; camSnap = true;
  }

  // ---- scenes --------------------------------------------------------------------------------
  let delicaFitResult = null;
  function buildScene() {
    if (root) { scene.remove(root); disposeTree(root); }
    root = new THREE.Group(); scene.add(root);
    kartModel = buildKart(THREE, p, { setup: ui.setup, rider: ui.rider });
    const g = p.geom, hT = g.track / 2, wbH = g.wheelbase / 2, h = cgHeight(p, ui.rider);
    controls.enabled = ui.scene !== 'yard';
    $('hud').hidden = ui.scene !== 'yard';
    $('touch').hidden = ui.scene !== 'yard';
    $('fit').hidden = ui.scene !== 'delica';
    $('hint').textContent = ui.scene === 'yard'
      ? 'Arrow keys or WASD to drive, Space to brake, R to reset. On a phone use the buttons.'
      : 'Drag to orbit, scroll or pinch to zoom.';

    if (ui.scene === 'yard') {
      const s = yard.size;
      const nx = Math.round(s.x1 - s.x0), nz = Math.round(s.z1 - s.z0);
      const pos = [], col = [];
      const push = (x, z, c) => { pos.push(x, yard.heightAt(x, z), z); col.push(c.r, c.g, c.b); };
      const cc = new THREE.Color();
      for (let i = 0; i < nx; i++) for (let j = 0; j < nz; j++) {
        const x0 = s.x0 + i, x1 = x0 + 1, z0 = s.z0 + j, z1 = z0 + 1;
        cc.set(SURFACE_COLOUR[yard.surfaceAt(x0 + 0.5, z0 + 0.5)] ?? 0x888888);
        push(x0, z0, cc); push(x0, z1, cc); push(x1, z0, cc);
        push(x1, z0, cc); push(x0, z1, cc); push(x1, z1, cc);
      }
      const geo = new THREE.BufferGeometry();
      geo.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3));
      geo.setAttribute('color', new THREE.Float32BufferAttribute(col, 3));
      geo.computeVertexNormals();
      const ground = new THREE.Mesh(geo, new THREE.MeshLambertMaterial({ vertexColors: true, side: THREE.DoubleSide }));
      ground.name = 'ground'; root.add(ground);
      for (const z of yard.zones) {
        const cx = (z.x0 + z.x1) / 2, cz = (z.z0 + z.z1) / 2;
        let text = z.label || z.id;
        if (z.surface === 'snowFresh') text += ` (${fmt(p.snow.depth * 100, 0)} cm)`;
        const l = label(text, 1.6); l.position.set(cx, yard.heightAt(cx, cz) + 2.2, cz); root.add(l);
        const edge = line([[z.x0, 0.05, z.z0], [z.x1, 0.05, z.z0], [z.x1, 0.05, z.z1], [z.x0, 0.05, z.z1], [z.x0, 0.05, z.z0]].map(
          ([x, y, zz]) => [x, yard.heightAt(x, zz) + y, zz]), 0x333333);
        edge.material.depthTest = true; root.add(edge);
      }
      const sn = yard.zones.find((z) => z.surface === 'snowFresh');
      if (sn) {
        const d = p.snow.depth;
        const m = new THREE.Mesh(new THREE.BoxGeometry(sn.x1 - sn.x0, d, sn.z1 - sn.z0),
          new THREE.MeshLambertMaterial({ color: 0xffffff, transparent: true, opacity: 0.45, depthWrite: false }));
        const cx = (sn.x0 + sn.x1) / 2, cz = (sn.z0 + sn.z1) / 2;
        m.position.set(cx, yard.heightAt(cx, cz) + d / 2, cz); m.name = 'fresh-snow'; root.add(m);
      }
      const sl = yard.slope;
      if (sl) {
        const cx = (sl.x0 + sl.x1) / 2, cz = (sl.z0 + sl.z1) / 2;
        const l = label(`incline ${fmt(sl.grade * 100, 0)} %`, 1.0);
        l.position.set(cx, yard.heightAt(cx, cz) + 1.2, cz); root.add(l);
      }
      root.add(kartModel);
      resetSim(); poseKart();
    } else if (ui.scene === 'inspect') {
      root.add(kartModel);
      const grid = new THREE.GridHelper(4, 16, 0x888888, 0xaaaaaa); grid.position.y = -0.001; root.add(grid);
      const side = hT + g.tyreW / 2 + VC.dimOffset;
      root.add(dim([-wbH, 0.02, side], [wbH, 0.02, side], `wheelbase ${fmt(g.wheelbase * 1000, 0)} mm`, 0x1f4f99, [0, 0, 0.04]));
      root.add(dim([-wbH - g.tyreD / 2 - 0.2, 0.02, -hT], [-wbH - g.tyreD / 2 - 0.2, 0.02, hT], `track ${fmt(g.track * 1000, 0)} mm`, 0x1f4f99, [0.04, 0, 0]));
      root.add(dim([0, 0, -side], [0, g.clearance, -side], `clearance ${fmt(g.clearance * 1000, 0)} mm`, 0x7a3f00, [0, 0, 0.04]));
      const cgx = kartModel.userData.cgPosition.x;
      root.add(dim([cgx, 0, side + 0.15], [cgx, h, side + 0.15], `centre height ${fmt(h * 1000, 0)} mm`, 0xb0178a, [0, 0, 0.04]));
      // tip triangle in the plane in front of the kart
      const tx = wbH + g.tyreD / 2 + 0.35;
      const ratio = hT / h, ok = ratio >= p.limits.tipRatio, c = ok ? OK : BAD;
      root.add(line([[tx, 0, 0], [tx, 0, hT], [tx, h, 0], [tx, 0, 0]], c));
      root.add(line([[tx, 0, hT], [tx, hT / p.limits.tipRatio, 0]], 0x555555)); // limit line: lowest allowed ratio
      const tl = label(`half-track / centre height = ${fmt(ratio)}  (limit ${fmt(p.limits.tipRatio)}) ${ok ? 'OK' : 'TIPS'}`, 0.13,
        ok ? '#1a7f37' : '#c62828');
      tl.position.set(tx, h + 0.18, hT / 2); root.add(tl);
      const tl2 = label(`half-track ${fmt(hT * 1000, 0)} mm`, 0.1); tl2.position.set(tx, 0.06, hT / 2); root.add(tl2);
      camera.position.set(2.4, 1.4, 2.6); controls.target.set(0, 0.35, 0); controls.update();
    } else {
      const d = p.delica, L = d.cargoLength, H = d.cargoHeight, lip = d.lip;
      const fit = delicaFit(p, ui.setup); delicaFitResult = fit;
      const okc = (b) => (b ? OK : BAD);
      const W = fit.width;
      const boxMax = edges(L, H, d.cargoWidthMax, okc(W.okCargoMax)); boxMax.position.set(L / 2, lip + H / 2, 0); root.add(boxMax);
      const boxMin = edges(L, H * 0.98, d.cargoWidthMin, okc(W.okCargoMin)); boxMin.position.set(L / 2, lip + H / 2, 0); root.add(boxMin);
      const opMax = edges(0.01, H, d.openingWidthMax, okc(W.okOpeningMax)); opMax.position.set(0, lip + H / 2, 0); root.add(opMax);
      const opMin = edges(0.01, H * 0.96, d.openingWidthMin, okc(W.okOpeningMin)); opMin.position.set(0, lip + H / 2, 0); root.add(opMin);
      const kl = fit.length;
      root.add(dim([0, lip + 0.02, -d.cargoWidthMax / 2 - 0.1], [L, lip + 0.02, -d.cargoWidthMax / 2 - 0.1],
        `cargo length ${fmt(L * 1000, 0)} mm`, okc(kl.ok), [0, 0, 0.04]));
      root.add(dim([0, lip + H + 0.05, -d.openingWidthMax / 2], [0, lip + H + 0.05, d.openingWidthMax / 2],
        `opening ${fmt(d.openingWidthMin * 1000, 0)}-${fmt(d.openingWidthMax * 1000, 0)} mm`, okc(W.okOpeningMin && W.okOpeningMax), [0.04, 0, 0]));
      root.add(dim([L * 0.5, lip + H + 0.12, -d.cargoWidthMax / 2], [L * 0.5, lip + H + 0.12, d.cargoWidthMax / 2],
        `cargo width ${fmt(d.cargoWidthMin * 1000, 0)}-${fmt(d.cargoWidthMax * 1000, 0)} mm`, okc(W.okCargoMin && W.okCargoMax), [0.04, 0, 0]));
      // floor and ramp
      const floor = new THREE.Mesh(new THREE.BoxGeometry(L, 0.02, d.cargoWidthMax), new THREE.MeshLambertMaterial({ color: 0x9aa0a6 }));
      floor.position.set(L / 2, lip - 0.01, 0); root.add(floor);
      const rl = Math.hypot(VC.rampLength, lip);
      const ramp = new THREE.Mesh(new THREE.BoxGeometry(rl, 0.03, VC.rampWidth), new THREE.MeshLambertMaterial({ color: 0xc58b2a }));
      ramp.position.set(-VC.rampLength / 2, lip / 2, 0); ramp.rotation.z = Math.atan2(lip, VC.rampLength); root.add(ramp);
      const lipLabel = label(`lip ${fmt(lip * 1000, 0)} mm`, 0.1); lipLabel.position.set(-0.1, lip + 0.1, d.openingWidthMax / 2 + 0.1); root.add(lipLabel);
      const grid = new THREE.GridHelper(8, 32, 0x888888, 0xaaaaaa); grid.position.set(1, -0.001, 0); root.add(grid);
      kartModel.position.set(g.length / 2, lip, 0); root.add(kartModel);
      camera.position.set(-2.8, 1.9, 2.8); controls.target.set(L * 0.35, lip + 0.4, 0); controls.update();
      renderFit(fit);
    }
    if (ui.scene === 'yard') { controls.target.set(0, 0, 0); }
    syncUrl();
  }

  function renderFit(f) {
    const yn = (b) => `<span class="${b ? 'ok-t' : 'bad-t'}">${b ? 'fits' : 'does not fit'}</span>`;
    const mm = (x) => fmt(x * 1000, 0) + ' mm';
    const W = f.width, lip = typeof f.lip === 'number' ? f.lip : (f.lip && (f.lip.value ?? f.lip.height)) ;
    $('fit').innerHTML = `<table><tr><th>Dimension</th><th>Kart</th><th>Limit</th><th></th></tr>
      <tr><td>Length vs cargo length</td><td>${mm(f.length.kart)}</td><td>${mm(f.length.limit)}</td><td>${yn(f.length.ok)}</td></tr>
      <tr><td>Width vs opening, narrow</td><td>${mm(W.kart)}</td><td>${mm(W.openingMin)}</td><td>${yn(W.okOpeningMin)}</td></tr>
      <tr><td>Width vs opening, wide</td><td>${mm(W.kart)}</td><td>${mm(W.openingMax)}</td><td>${yn(W.okOpeningMax)}</td></tr>
      <tr><td>Width vs cargo, narrow</td><td>${mm(W.kart)}</td><td>${mm(W.cargoMin)}</td><td>${yn(W.okCargoMin)}</td></tr>
      <tr><td>Width vs cargo, wide</td><td>${mm(W.kart)}</td><td>${mm(W.cargoMax)}</td><td>${yn(W.okCargoMax)}</td></tr>
      <tr><td>Lip above ground</td><td></td><td>${typeof lip === 'number' ? mm(lip) : ''}</td><td></td></tr></table>`;
  }

  // ---- kart pose ---------------------------------------------------------------------------
  function poseKart() {
    const s = sim.state;
    kartModel.position.set(s.x, s.y, s.z);
    const [gx, gz] = yard.gradAt(s.x, s.z);
    const fx = Math.cos(s.heading), fz = Math.sin(s.heading);   // sim.js: heading 0 = +x, positive toward +z (right)
    const along = gx * fx + gz * fz;
    const rx = -Math.sin(s.heading), rz = Math.cos(s.heading);  // the kart's right side
    const crossRight = gx * rx + gz * rz;
    if (s.tipped) {
      // falls to the outside of the turn, or downhill; positive roll leans the top to the right
      if (!tipSide) tipSide = -(Math.sign(s.yawRate) || Math.sign(crossRight) || 1);
      tipRoll += (tipSide * Math.PI / 2 - tipRoll) * 0.12;
    } else { tipSide = 0; tipRoll += (0 - tipRoll) * 0.3; }
    kartModel.rotation.order = 'YZX';
    kartModel.rotation.set(-Math.atan(crossRight) + tipRoll, -s.heading, Math.atan(along));  // three's +y turn is toward -z
    kartModel.userData.animate(Math.max(-VC.maxSteer, Math.min(VC.maxSteer, s.steer)), s.distance);
  }

  // ---- HUD ---------------------------------------------------------------------------------
  const hud = $('hud'), warn = $('warn');
  function updateHud() {
    const s = sim.state;
    const m = s.tipMargin, frac = Math.max(0, Math.min(1, m / VC.tipBarFull));
    hud.innerHTML = `<div class="big">${fmt(s.v * 3.6, 1)} km/h</div>
      <div class="row"><span>engine</span><span>${fmt(s.engineRpm, 0)} rpm</span></div>
      <div class="row"><span>clutch</span><span>${s.clutch}</span></div>
      <div class="row"><span>surface</span><span>${s.surface}</span></div>
      <div class="row"><span>grade along</span><span>${fmt(s.gradeAlong * 100, 1)} %</span></div>
      <div class="row"><span>grade across</span><span>${fmt(s.gradeCross * 100, 1)} %</span></div>
      <div class="row"><span>lateral</span><span>${fmt(s.latAccel / VC.gravity, 2)} g</span></div>
      <div class="row"><span>tip margin</span><span>${fmt(m, 2)}</span></div>
      <div class="bar ${m < 1 ? 'bad' : ''}"><i style="width:${frac * 100}%"></i><b style="left:${100 / VC.tipBarFull}%"></b></div>
      <div class="row"><span>sinkage</span><span>${fmt(s.sinkage * 100, 1)} cm</span></div>
      <div class="row"><span>clutch slip</span><span>${fmt(s.slipTime, 1)} s, ${fmt(s.slipEnergy / 1000, 1)} kJ</span></div>
      <div class="row"><span>rear load</span><span>${fmt((s.rearLoadShare ?? 0) * 100, 0)} %</span></div>
      <div class="row"><span>tyre spin</span><span>${fmt(s.spinTime ?? 0, 1)} s</span></div>`;
    const w = [];
    if (s.tipped) w.push('TIPPED');
    if (s.stuck) w.push('STUCK');
    if (s.clutch === 'slip') w.push('CLUTCH SLIPPING');
    if (s.ploughing) w.push('PLOUGHING');
    if (s.wheelSpin) w.push('WHEELS SPINNING');
    if (s.frontLift) w.push('FRONT LIFTING');
    warn.innerHTML = w.map((t) => `<span>${t}</span>`).join('');
  }

  // ---- input -------------------------------------------------------------------------------
  function readInput() {
    const has = (...k) => k.some((x) => keys.has(x) || touch.has(x));
    input.throttle = has('ArrowUp', 'w', 'W', 'throttle') ? 1 : 0;
    input.brake = has(' ', 'ArrowDown', 's', 'S', 'brake') ? 1 : 0;
    const left = has('ArrowLeft', 'a', 'A', 'left'), right = has('ArrowRight', 'd', 'D', 'right');
    input.steer = (right ? 1 : 0) - (left ? 1 : 0);   // sim.js: positive steer turns right, toward +z at heading 0
  }
  window.addEventListener('keydown', (e) => {
    if (/INPUT|SELECT|TEXTAREA/.test(e.target.tagName)) return;
    if (e.key === 'r' || e.key === 'R') { if (ui.scene === 'yard') resetSim(); return; }
    if (ui.scene === 'yard' && [' ', 'ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(e.key)) e.preventDefault();
    keys.add(e.key);
  });
  window.addEventListener('keyup', (e) => keys.delete(e.key));
  window.addEventListener('blur', () => { keys.clear(); touch.clear(); });
  for (const b of $('touch').querySelectorAll('button')) {
    const k = b.dataset.k;
    const down = (e) => { e.preventDefault(); if (k === 'reset') { resetSim(); return; } touch.add(k); b.classList.add('on'); };
    const up = () => { touch.delete(k); b.classList.remove('on'); };
    b.addEventListener('pointerdown', down);
    for (const ev of ['pointerup', 'pointercancel', 'pointerleave']) b.addEventListener(ev, up);
  }

  // ---- side panel --------------------------------------------------------------------------
  function pick(kind, id) {
    if (inFrame) { window.parent.postMessage(kind === 'key' ? { type: 'kart3d:pick', key: id } : { type: 'kart3d:pick', id }, '*'); return; }
    const url = kind === 'key' ? `../navigator/#/?k=value&i=${encodeURIComponent(id)}` : `../navigator/#/?k=req&i=${encodeURIComponent(id)}`;
    window.open(url, '_blank');
  }
  const keyLink = (k) => `<button type="button" class="k" data-pick="key" data-id="${k}">${k}</button>`;
  const reqLink = (r) => `<button type="button" class="k" data-pick="req" data-id="${r}">${r}</button>`;
  const esc = (s) => String(s).replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
  const opt = (list, cur, names = {}) => list.map((v) => `<option value="${v}" ${v === cur ? 'selected' : ''}>${names[v] || v}</option>`).join('');

  const panel = $('panel');
  function buildPanel() {
    const rows = Object.entries(p.prov).map(([path, key]) => {
      const it = p.values.get(key);
      return `<tr><td>${esc(path)}</td><td>${keyLink(key)}</td><td>${esc(it ? it.v : '?')} ${esc(it && it.unit ? it.unit : '')}</td><td>${esc(it ? it.status : '')}</td></tr>`;
    }).join('');
    const illus = (obj) => Object.entries(obj).map(([k, v]) => `<tr><td>${esc(k)}</td><td>${esc(typeof v === 'object' ? JSON.stringify(v) : v)}</td></tr>`).join('');
    const simModel = simMod.MODEL || (sim && sim.MODEL) || {};
    panel.innerHTML = `<div class="card">
      <label>Scene <select id="selScene">${opt(SCENES, ui.scene, { yard: 'Yard (drive)', inspect: 'Inspect', delica: 'Delica D:5 fit' })}</select></label>
      <label>Setup <select id="selSetup">${opt(SETUPS, ui.setup, { summer: 'Summer tyres', w1: 'W1 skis and chains', w2: 'W2 skis and tracks' })}</select></label>
      <label id="rowSink">W2 track sinkage <select id="selSink">${opt(['wheels', 'belt'], ui.sink, { wheels: 'Wheels', belt: 'Belt' })}</select></label>
      <label>Rider <select id="selRider">${opt(RIDERS, ui.rider)}</select></label>
      <label>Child speed limit <input type="checkbox" id="chkChild" ${ui.child ? 'checked' : ''}></label>
      <p class="small" id="stat"></p>
    </div>
    <h2>Requirement tests</h2>
    <div class="card"><button type="button" id="btnTests">Run tests</button><div class="tbl-wrap" id="tests"></div></div>
    <details><summary>Where the numbers come from (${Object.keys(p.prov).length})</summary>
      <div class="tbl-wrap"><table class="t"><tr><th>Parameter</th><th>Key</th><th>Value</th><th>Status</th></tr>${rows}</table></div></details>
    <details><summary>Model constants, not in the record</summary>
      <p class="small">Drawing and model constants. They are not design numbers.</p>
      <div class="tbl-wrap"><table class="t"><tr><th>Name</th><th>Value</th></tr>
      <tr><td colspan="2"><b>kart-model.js ILLUSTRATIVE</b></td></tr>${illus(ILLUSTRATIVE)}
      <tr><td colspan="2"><b>main.js VIEW_CONSTANTS</b></td></tr>${illus(VIEW_CONSTANTS)}
      ${Object.keys(simModel).length ? '<tr><td colspan="2"><b>sim.js MODEL</b></td></tr>' + illus(simModel) : ''}
      </table></div></details>`;
    syncPanel();
    panel.addEventListener('click', (e) => {
      const b = e.target.closest('[data-pick]'); if (b) pick(b.dataset.pick, b.dataset.id);
    });
    $('selScene').onchange = (e) => set({ scene: e.target.value });
    $('selSetup').onchange = (e) => set({ setup: e.target.value });
    $('selSink').onchange = (e) => set({ sink: e.target.value });
    $('selRider').onchange = (e) => set({ rider: e.target.value });
    $('chkChild').onchange = (e) => set({ child: e.target.checked });
    $('btnTests').onclick = runAndShowTests;
  }
  function syncPanel() {
    $('selScene').value = ui.scene; $('selSetup').value = ui.setup; $('selSink').value = ui.sink;
    $('selRider').value = ui.rider; $('chkChild').checked = ui.child;
    $('rowSink').style.display = ui.setup === 'w2' ? '' : 'none';
    const st = kartModel ? kartModel.userData.stature : 0;
    $('stat').textContent = `Rider stature drawn: ${fmt(st * 100, 0)} cm. Centre of mass height: ${fmt(cgHeight(p, ui.rider) * 1000, 0)} mm.`;
  }
  function runAndShowTests() {
    let res;
    try { res = runTests(p); } catch (e) { $('tests').textContent = 'Tests failed to run: ' + e.message; return; }
    const cls = (r) => (r === true ? 'pass' : r === false ? 'fail' : 'na');
    const txt = (r) => (r === true ? 'pass' : r === false ? 'FAIL' : 'n/a');
    $('tests').innerHTML = `<table class="t"><tr><th>Req</th><th>Title</th><th>Design</th><th>Result</th><th></th></tr>` +
      res.map((r) => `<tr><td>${reqLink(r.req)}<div class="small">${esc(r.setup || '')} ${esc(r.rider || '')}</div></td><td>${esc(r.title)}</td>
        <td>${r.design ? keyLink(r.design.key) + '<br>' + esc(fmt(r.design.value, 3)) + ' ' + esc(r.design.unit || '') : ''}</td>
        <td>${r.result ? esc(fmt(r.result.value, 3)) + ' ' + esc(r.result.unit || '') : ''}</td>
        <td class="${cls(r.pass)}" title="${esc(r.note || '')}">${txt(r.pass)}</td></tr>`).join('') + '</table>';
  }

  // ---- state changes and URL ---------------------------------------------------------------
  function syncUrl() {
    const u = new URLSearchParams(location.search);
    u.set('scene', ui.scene); u.set('setup', ui.setup); u.set('rider', ui.rider);
    if (ui.child) u.set('child', '1'); else u.delete('child');
    if (ui.setup === 'w2') u.set('sink', ui.sink); else u.delete('sink');
    history.replaceState(null, '', location.pathname + '?' + u.toString() + location.hash);
  }
  function set(ch) {
    let simChange = false, sceneChange = false;
    if (ch.scene && SCENES.includes(ch.scene) && ch.scene !== ui.scene) { ui.scene = ch.scene; sceneChange = true; }
    if (ch.setup && SETUPS.includes(ch.setup) && ch.setup !== ui.setup) { ui.setup = ch.setup; simChange = true; sceneChange = true; }
    if (ch.rider && RIDERS.includes(ch.rider) && ch.rider !== ui.rider) { ui.rider = ch.rider; simChange = true; sceneChange = true; }
    if (ch.child !== undefined && !!ch.child !== ui.child) { ui.child = !!ch.child; simChange = true; }
    if (ch.sink && ['belt', 'wheels'].includes(ch.sink) && ch.sink !== ui.sink) { ui.sink = ch.sink; simChange = true; }
    if (simChange) newSim();
    if (sceneChange) buildScene();
    syncPanel(); syncUrl();
  }

  window.addEventListener('message', (e) => {
    const d = e.data;
    if (d && d.type === 'kart3d:set') set({ scene: d.scene, setup: d.setup, rider: d.rider, child: d.child });
  });

  // ---- start -------------------------------------------------------------------------------
  newSim();
  buildScene();
  buildPanel();
  resize();
  if (inFrame) window.parent.postMessage({ type: 'kart3d:ready' }, '*');

  const clock = new THREE.Clock();
  const chaseTarget = new THREE.Vector3(), chasePos = new THREE.Vector3();
  let frame = 0;
  function tick() {
    requestAnimationFrame(tick);
    const dt = Math.min(clock.getDelta(), 0.05);
    if (ui.scene === 'yard') {
      readInput();
      sim.step(dt, input, yard);
      poseKart();
      const s = sim.state;
      const fx = Math.cos(s.heading), fz = Math.sin(s.heading);
      chaseTarget.set(s.x + fx * 3, s.y + 0.6, s.z + fz * 3);
      chasePos.set(s.x - fx * VC.chaseBack, s.y + VC.chaseUp, s.z - fz * VC.chaseBack);
      if (camSnap) { camera.position.copy(chasePos); camSnap = false; }
      else camera.position.lerp(chasePos, 1 - Math.exp(-4 * dt));
      camera.lookAt(chaseTarget);
      if ((frame++ % 3) === 0) updateHud();
    } else {
      controls.update();
      if (kartModel) kartModel.userData.animate(0, 0);
    }
    renderer.render(scene, camera);
  }
  tick();
}
