// 3D view of the kart design: shows the real design from docs/data/design.json.
// Not a driving game. Protocol with the navigator: see the messages at the end of this file.
import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js';
import { buildKart, buildRider, buildDelica, buildDims, k2w } from './model.js';
import { partOfObject } from './parts.js';

const params = new URLSearchParams(location.search);
const EMBED = params.get('embed') === '1';
if (EMBED) document.documentElement.classList.add('embed');
const theme = params.get('theme'); if (theme) document.documentElement.dataset.theme = theme;

// Japanese names of the parts (the record's own part names are English)
const PART_NAMES = {
  frame: 'フレーム（溶接パイプ）', bumpers: 'バンパーとサイドバー', seat: '座席（スクーターのもの）',
  handlebar: 'ハンドル（スクーターのもの）', footrests: '足置き', fenders: '泥よけ', guards: 'チェーンガード',
  tie_rods: 'タイロッド', spindles: 'スピンドルとキングピン', front_wheels: '前輪とタイヤ', axle_shaft: 'アクスル軸',
  axle_bearings: 'アクスル軸受（UCP）', rear_hubs: '後輪ハブ', rear_wheels: '後輪とタイヤ', brake: 'ディスクブレーキ',
  engine: 'エンジン', clutch: '遠心クラッチ', jackshaft: 'ジャックシャフト', chain_primary: '一次チェーン', chain_final: '二次チェーン',
  skis: 'スキー', swing_arm: 'スイングアーム', rear_shock: '後ろの緩衝器', front_arms: '前のスイングアクスル', front_shocks: '前の緩衝器', sled_pan: 'そり底',
  side_floats: '浮き（将来版）', outboard: '船外機（将来版）', roll_bar: '転倒保護の輪', lighting: '灯火と方向指示器', mirrors: 'ミラー', horn: 'ホーン',
  speedometer: '速度計', hand_brake: '前輪ブレーキ（2 系統目）', battery: 'バッテリー', number_plate: 'ナンバー',
};

const state = {
  config: ['summer', 'winter', 'transport', 'water'].includes(params.get('config')) ? params.get('config') : 'summer',
  rider: ['adult', 'child', 'none'].includes(params.get('rider')) ? params.get('rider') : 'adult',
  delica: params.get('delica') === '1', dims: params.get('dims') === '1',
  view: ['iso', 'side', 'top', 'front'].includes(params.get('view')) ? params.get('view') : 'iso',
};
const $ = (id) => document.getElementById(id);
const post = (msg) => { if (window.parent !== window) window.parent.postMessage(msg, '*'); };

function fail(e) {
  console.error(e);
  const el = $('error'); el.hidden = false; el.textContent = '読み込みに失敗しました: ' + (e && e.message || e);
  $('loading').hidden = true;
}

let design, renderer, scene, camera, controls, kart, groups = [], riderCache = {}, riderObj = null, delicaObj = null, dimsObj = null;
let ground, groundShadow, floorShadow, dirty = true, tween = null;
const hidden = new Set(); let focus = new Set(); let selected = null;
const matCache = new Map();

function sceneColour() { return getComputedStyle(document.documentElement).getPropertyValue('--scene').trim() || '#e9eff5'; }

async function init() {
  design = await (await fetch('../data/design.json', { cache: 'no-cache' })).json();
  const host = $('stage');
  renderer = new THREE.WebGLRenderer({ antialias: true, preserveDrawingBuffer: false });
  renderer.setPixelRatio(Math.min(devicePixelRatio, 2));
  renderer.shadowMap.enabled = true; renderer.shadowMap.type = THREE.PCFSoftShadowMap;
  renderer.toneMapping = THREE.ACESFilmicToneMapping; renderer.toneMappingExposure = 1.05;
  host.appendChild(renderer.domElement);
  scene = new THREE.Scene(); scene.background = new THREE.Color(sceneColour());
  const pm = new THREE.PMREMGenerator(renderer);
  scene.environment = pm.fromScene(new RoomEnvironment(), 0.04).texture; scene.environmentIntensity = 0.55;
  scene.add(new THREE.HemisphereLight(0xffffff, 0xaab4c0, 0.65));
  const sun = new THREE.DirectionalLight(0xffffff, 2.1);
  sun.position.copy(k2w(2.2, 2.6, 3.4)); sun.target.position.copy(k2w(0.55, 0, 0.1));
  sun.castShadow = true; sun.shadow.mapSize.set(2048, 2048);
  Object.assign(sun.shadow.camera, { left: -1.8, right: 1.8, top: 1.8, bottom: -1.8, near: 0.5, far: 12 });
  sun.shadow.bias = -0.0004; sun.shadow.normalBias = 0.01; sun.shadow.radius = 5; sun.shadow.blurSamples = 16;
  scene.add(sun, sun.target);
  const fill = new THREE.DirectionalLight(0xdbe8ff, 0.5); fill.position.copy(k2w(-2, -2.5, 1.5)); scene.add(fill);

  // ground: a soft light disc and a shadow catcher
  const c = document.createElement('canvas'); c.width = c.height = 256; const g2 = c.getContext('2d');
  const gr = g2.createRadialGradient(128, 128, 10, 128, 128, 128); gr.addColorStop(0, 'rgba(255,255,255,0.85)'); gr.addColorStop(0.6, 'rgba(255,255,255,0.35)'); gr.addColorStop(1, 'rgba(255,255,255,0)');
  g2.fillStyle = gr; g2.fillRect(0, 0, 256, 256);
  ground = new THREE.Group();
  const disc = new THREE.Mesh(new THREE.PlaneGeometry(7, 7).rotateX(-Math.PI / 2), new THREE.MeshBasicMaterial({ map: new THREE.CanvasTexture(c), transparent: true, depthWrite: false }));
  disc.position.set(0.55, -0.002, 0);
  groundShadow = new THREE.Mesh(new THREE.PlaneGeometry(9, 9).rotateX(-Math.PI / 2), new THREE.ShadowMaterial({ opacity: 0.26 }));
  groundShadow.receiveShadow = true; groundShadow.position.set(0.55, -0.001, 0);
  ground.add(disc, groundShadow); scene.add(ground);

  camera = new THREE.PerspectiveCamera(32, 1, 0.05, 60);
  controls = new OrbitControls(camera, renderer.domElement);
  controls.enableDamping = true; controls.dampingFactor = 0.12; controls.maxPolarAngle = Math.PI * 0.499; controls.minDistance = 0.4; controls.maxDistance = 9;
  controls.addEventListener('change', () => { dirty = true; });
  controls.addEventListener('start', () => { tween = null; });

  const built = buildKart(design); kart = built.root; groups = built.groups; scene.add(kart);
  const D = design.delica, d = design.dims;
  const dl = buildDelica(design); dl.visible = false; delicaObj = dl; scene.add(dl);
  const fl = new THREE.Mesh(new THREE.PlaneGeometry(D.length, D.width_max).rotateX(-Math.PI / 2), new THREE.ShadowMaterial({ opacity: 0.26 }));
  fl.receiveShadow = true; fl.position.set((d.x_front + d.x_back) / 2, 0.0008, 0); fl.visible = false; floorShadow = fl; scene.add(fl);

  resize(); addEventListener('resize', resize);
  new ResizeObserver(resize).observe(host);
  matchMedia('(prefers-color-scheme: dark)').addEventListener('change', () => { scene.background = new THREE.Color(sceneColour()); dirty = true; });
  bindPicking(); bindUi(); applyAll(); setView(state.view, false);
  $('loading').hidden = true;
  const ids = [...new Set(groups.map((g) => g.userData.part))];
  post({ type: 'kart3d:ready', parts: ids.map((id) => ({ id, name: PART_NAMES[id] || id })) });
  requestAnimationFrame(frame);
  window.__kart = { state, scene, camera, controls, setState, focusParts, groups, THREE, get riderObj() { return riderObj; } };
}

function resize() {
  const host = $('stage'); const w = Math.max(1, host.clientWidth), h = Math.max(1, host.clientHeight);
  renderer.setSize(w, h, false); camera.aspect = w / h; camera.updateProjectionMatrix(); dirty = true;
}

function frame(t) {
  requestAnimationFrame(frame);
  if (tween) {
    const k = Math.min(1, (performance.now() - tween.t0) / tween.ms), e = k * k * (3 - 2 * k);
    camera.position.lerpVectors(tween.p0, tween.p1, e); controls.target.lerpVectors(tween.c0, tween.c1, e);
    camera.lookAt(controls.target); if (k >= 1) tween = null; dirty = true;
  }
  if (controls.update()) dirty = true;
  if (dirty) { dirty = false; renderer.render(scene, camera); }
}

// ---------------------------------------------------------------- state -> scene
function itemRider() { return state.rider === 'child' ? 'child' : 'adult'; }
function groupShown(g) {
  const u = g.userData;
  if (!u.configs.includes(state.config) || hidden.has(u.part)) return false;
  if (u.rider && u.rider !== itemRider()) return false; // items made for one rider only (child's raised steps)
  return true;
}
// winter: the whole chassis rides higher; items marked ground (tracks, skis) keep their absolute height
function liftNow() { return state.config === 'winter' && design.lift ? design.lift.winter || 0 : 0; }
function applyAll() {
  const lift = liftNow();
  for (const g of groups) {
    if (g.userData.baseZ === undefined) g.userData.baseZ = g.position.z;
    g.position.z = g.userData.baseZ + (g.userData.ground ? 0 : lift); // kart frame: z is up
    g.visible = groupShown(g);
  }
  // rider
  if (riderObj) { scene.remove(riderObj); riderObj = null; }
  if (state.rider !== 'none') {
    riderCache[state.rider] = riderCache[state.rider] || buildRider(design, state.rider);
    riderObj = riderCache[state.rider]; riderObj.position.y = lift; scene.add(riderObj); // world frame: y is up
  }
  delicaObj.visible = state.delica; floorShadow.visible = state.delica;
  const lip = state.delica ? design.delica.lip : 0;
  ground.position.y = -lip;
  if (dimsObj) { scene.remove(dimsObj); dimsObj = null; }
  if (state.dims) { dimsObj = buildDims(design, state.config); scene.add(dimsObj); }
  $('futureNote').hidden = state.config !== 'water';
  applyFocus(); syncUi(); dirty = true;
}
function setState(patch, user = false) {
  const prev = { ...state };
  for (const k of ['config', 'rider', 'view']) if (patch[k] != null && patch[k] !== state[k]) state[k] = patch[k];
  for (const k of ['delica', 'dims']) if (patch[k] != null) state[k] = !!patch[k];
  if (user && patch.delica && !prev.delica && state.config !== 'transport') state.config = 'transport'; // the Delica holds the kart in transport form
  applyAll();
  if (state.view !== prev.view || state.rider !== prev.rider || patch.delica != null || patch.view != null) setView(state.view, true);
  if (user) post({ type: 'kart3d:state', ...state });
}

// ---------------------------------------------------------------- focus and highlight
const dimMat = (m) => { const k = 'd' + m.uuid; if (!matCache.has(k)) { const c = m.clone(); c.transparent = true; c.opacity = 0.1; c.depthWrite = false; if (c.alphaMap) c.alphaMap = null; matCache.set(k, c); } return matCache.get(k); };
const hiMat = (m) => { const k = 'h' + m.uuid; if (!matCache.has(k)) { const c = m.clone(); if (c.emissive) { c.emissive = new THREE.Color(0xff7a00); c.emissiveIntensity = 0.7; } matCache.set(k, c); } return matCache.get(k); };
function applyFocus() {
  const on = focus.size > 0;
  const walk = (root) => root.traverse((o) => {
    if (!o.isMesh && !o.isInstancedMesh) return;
    if (!o.userData.base) o.userData.base = o.material;
    const base = o.userData.base, part = partOfObject(o);
    o.material = !on ? base : focus.has(part) ? hiMat(base) : dimMat(base);
    if (on && !focus.has(part)) o.castShadow = false; else o.castShadow = o.userData.cast !== false;
  });
  walk(kart); if (riderObj) walk(riderObj);
  dirty = true;
}
function focusParts(ids) {
  focus = new Set(ids || []);
  if (focus.size === 0) selected = null;
  applyFocus(); syncUi();
}

// ---------------------------------------------------------------- views
function viewSpec(name) {
  const win = state.config === 'winter' && design.dims_winter, d = win ? { ...design.dims, ...design.dims_winter } : design.dims, D = design.delica, dl = state.delica;
  const rd = design.riders[state.rider], riderTop = rd ? rd.hip[2] + 0.55 * rd.stature + liftNow() : 0;
  const L = dl ? Math.max(d.length, D.length) : d.length, W = dl ? D.width_max : d.width, Hh = dl ? D.height : Math.max(d.height, riderTop) + 0.1;
  const target = k2w((d.x_front + d.x_back) / 2, 0, dl ? D.height * 0.35 : Math.max(d.height, riderTop) * 0.4);
  const aspect = camera.aspect, tf = Math.tan(THREE.MathUtils.degToRad(camera.fov / 2));
  const fit = (hw, hh) => Math.max(hh / tf, hw / (tf * aspect)) * 1.18;
  let dir, dist;
  if (name === 'side') { dir = new THREE.Vector3(0, 1, 0.1); dist = fit(L / 2 + 0.3, Hh / 2 + 0.12); }
  else if (name === 'top') { dir = new THREE.Vector3(0.0001, -0.07, 1); dist = fit(L / 2 + 0.25, W / 2 + 0.3); }
  else if (name === 'front') { dir = new THREE.Vector3(1, 0, 0.1); dist = fit(W / 2 + 0.25, Hh / 2 + 0.12); }
  else { dir = new THREE.Vector3(1, 1.05, 0.72); const rho = 0.5 * Math.sqrt(L * L + W * W + Hh * Hh); dist = Math.max(rho / tf, rho / (tf * aspect)) * 0.95; }
  const w = k2w(dir.x, dir.y, dir.z).normalize();
  return { pos: target.clone().addScaledVector(w, dist), target };
}
function setView(name, animate = true) {
  const v = viewSpec(name);
  if (!animate) { camera.position.copy(v.pos); controls.target.copy(v.target); camera.lookAt(v.target); controls.update(); dirty = true; return; }
  tween = { p0: camera.position.clone(), p1: v.pos, c0: controls.target.clone(), c1: v.target, t0: performance.now(), ms: 450 }; dirty = true;
}

// ---------------------------------------------------------------- picking (a click without a drag)
function bindPicking() {
  const el = renderer.domElement; let down = null; const ray = new THREE.Raycaster();
  el.addEventListener('pointerdown', (e) => { down = { x: e.clientX, y: e.clientY, t: performance.now() }; });
  el.addEventListener('pointerup', (e) => {
    if (!down) return; const moved = Math.hypot(e.clientX - down.x, e.clientY - down.y); down = null;
    if (moved > 5) return;
    const r = el.getBoundingClientRect();
    ray.setFromCamera(new THREE.Vector2(((e.clientX - r.left) / r.width) * 2 - 1, -((e.clientY - r.top) / r.height) * 2 + 1), camera);
    const hits = ray.intersectObject(kart, true);
    for (const h of hits) {
      let vis = true; for (let o = h.object; o; o = o.parent) if (!o.visible) { vis = false; break; }
      const part = partOfObject(h.object);
      if (!vis || !part) continue;
      if (focus.size && !focus.has(part) && !EMBED) continue;
      selected = part; post({ type: 'kart3d:pick', part });
      if (!EMBED) { focusParts([part]); }
      return;
    }
    if (!EMBED && focus.size) focusParts([]);
  });
}

// ---------------------------------------------------------------- toolbar and parts list (standalone)
function bindUi() {
  if (EMBED) return;
  $('gConfig').addEventListener('click', (e) => { const b = e.target.closest('button'); if (b) setState({ config: b.dataset.config }, true); });
  $('gView').addEventListener('click', (e) => { const b = e.target.closest('button'); if (b) setState({ view: b.dataset.view }, true); });
  $('rider').addEventListener('change', (e) => setState({ rider: e.target.value }, true));
  $('delica').addEventListener('change', (e) => setState({ delica: e.target.checked }, true));
  $('dims').addEventListener('change', (e) => setState({ dims: e.target.checked }, true));
  $('partsBtn').addEventListener('click', () => { const p = $('partsPanel'); p.hidden = !p.hidden; $('partsBtn').setAttribute('aria-expanded', String(!p.hidden)); $('partsBtn').classList.toggle('on', !p.hidden); });
  $('themeBtn').addEventListener('click', () => {
    const dark = document.documentElement.dataset.theme === 'dark' || (!document.documentElement.dataset.theme && matchMedia('(prefers-color-scheme: dark)').matches);
    document.documentElement.dataset.theme = dark ? 'light' : 'dark'; scene.background = new THREE.Color(sceneColour()); dirty = true;
  });
  const ids = [...new Set(groups.map((g) => g.userData.part))];
  const ul = $('partsList');
  for (const id of ids) {
    const li = document.createElement('li'); li.dataset.part = id;
    li.innerHTML = `<input type="checkbox" checked id="pc-${id}"><label for="pc-${id}"></label><button type="button" title="この部品を強調">◎</button>`;
    li.querySelector('label').textContent = PART_NAMES[id] || id;
    li.querySelector('input').addEventListener('change', (e) => { if (e.target.checked) hidden.delete(id); else hidden.add(id); applyAll(); });
    li.querySelector('button').addEventListener('click', () => focusParts(focus.has(id) ? [] : [id]));
    ul.appendChild(li);
  }
  $('allOn').addEventListener('click', () => { hidden.clear(); applyAll(); });
  $('allOff').addEventListener('click', () => { for (const id of ids) hidden.add(id); applyAll(); });
}
function syncUi() {
  if (EMBED) return;
  for (const b of $('gConfig').children) b.classList.toggle('on', b.dataset.config === state.config);
  for (const b of $('gView').children) b.classList.toggle('on', b.dataset.view === state.view);
  $('rider').value = state.rider; $('delica').checked = state.delica; $('dims').checked = state.dims;
  for (const li of $('partsList').children) {
    li.querySelector('input').checked = !hidden.has(li.dataset.part);
    li.classList.toggle('sel', focus.has(li.dataset.part));
  }
  const names = [...focus].map((p) => PART_NAMES[p] || p);
  $('status').textContent = names.length ? '強調: ' + names.join('、') : '';
}

// ---------------------------------------------------------------- messages from the navigator
//  in : { type:'kart3d:set', config?, rider?, delica?, dims?, view? }   { type:'kart3d:focus', parts:[ids] }
//  out: { type:'kart3d:ready', parts:[{id,name}] }  { type:'kart3d:pick', part }  { type:'kart3d:state', config, rider, delica, dims, view }
addEventListener('message', (e) => {
  const m = e.data; if (!m || typeof m.type !== 'string' || !renderer) return;
  if (m.type === 'kart3d:set') setState(m, false);
  else if (m.type === 'kart3d:focus') focusParts(Array.isArray(m.parts) ? m.parts : []);
});

init().catch(fail);
