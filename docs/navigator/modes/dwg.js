// 図面 (drawing) mode: three orthographic views drawn as SVG from docs/data/design.json.
// 側面図 (right side), 平面図 (top), 正面図 (front). Outlines are grouped by part; a click selects the part.
// Every number about the kart comes from design.json (or the record through api.valueText);
// drawing-only constants are in ILLUSTRATIVE.
export const ILLUSTRATIVE = {
  sheet: { w: 420, h: 297 },            // A3 landscape, mm
  scales: [10, 12, 15, 20],             // 1:N, the largest that fits on the sheet is used
  line: { outline: 0.35, thin: 0.2, dim: 0.22, chain: 0.5, hit: 1.6 },
  font: { dim: 3.2, title: 3.4, big: 5 },
  colours: { part: 'var(--dwg-ink)', fill: 'var(--dwg-fill)', hl: 'var(--dwg-hl)', dim: 'var(--dwg-dim)' },
  rollerFrac: 0.625, pillowWidthPerBore: 1.55, pillowBase: 0.42,
  fenderHalfAngleDeg: 60, fenderThick: 0.006, // the arc over a wheel, as in the 3D view
  skiThickness: 0.022, skiTipRise: 0.1, skiTipFrac: 0.22, skiKickRise: 0.035, skiKickFrac: 0.08,
  margins: { left: 28, top: 20, gap: 36, dimGap: 7 },
  titleBlock: { w: 150, h: 46 },
  zoom: { min: 0.6, max: 12, step: 1.25 },
};
const I = ILLUSTRATIVE;
const CONFIG_LABEL = { summer: '夏', winter: '冬', transport: '搬送', water: '水（将来版）' };
const PART_JA = {
  frame: 'フレーム', bumpers: 'バンパー・サイドバー', seat: '座席（スクーターのもの）', handlebar: 'ハンドル（スクーターのもの）', footrests: '足置き', fenders: '泥よけ',
  guards: 'チェーンガード', tie_rods: 'タイロッド', spindles: 'スピンドル',
  front_wheels: '前輪', axle_shaft: 'アクスル軸', axle_bearings: 'アクスル軸受', rear_hubs: '後輪ハブ', rear_wheels: '後輪', brake: 'ブレーキ',
  engine: 'エンジン', chain_final: 'チェーン', skis: 'スキー', track_unit: 'キャタピラユニット', winter_chain: '冬のチェーン', sled_pan: 'そり底', side_floats: '浮き（将来版）', outboard: '船外機（将来版）', roll_bar: '転倒保護の輪', lighting: '灯火と方向指示器', mirrors: 'ミラー', horn: 'ホーン', speedometer: '速度計', hand_brake: '前輪ブレーキ（2 系統目）', battery: 'バッテリー', number_plate: 'ナンバー',
};

const CSS = `
.dwg { --dwg-bg:#fbfbf8; --dwg-ink:#1d2430; --dwg-fill:rgba(255,255,255,0.55); --dwg-hl:#e0600a; --dwg-dim:#b6bcc4; --dwg-dimline:#0b4f9c; --dwg-frame:#444; position:relative; display:flex; flex-direction:column; height:100%; min-height:420px; background:var(--dwg-bg); color:var(--dwg-ink); }
@media (prefers-color-scheme: dark) { :root:not([data-theme="light"]) .dwg { --dwg-bg:#161a1f; --dwg-ink:#dfe4ea; --dwg-fill:rgba(40,48,58,0.55); --dwg-hl:#ff9a3d; --dwg-dim:#4a525b; --dwg-dimline:#6db0ff; --dwg-frame:#9aa5b0; } }
:root[data-theme="dark"] .dwg { --dwg-bg:#161a1f; --dwg-ink:#dfe4ea; --dwg-fill:rgba(40,48,58,0.55); --dwg-hl:#ff9a3d; --dwg-dim:#4a525b; --dwg-dimline:#6db0ff; --dwg-frame:#9aa5b0; }
.dwg-bar { display:flex; flex-wrap:wrap; align-items:center; gap:6px 12px; padding:6px 10px; border-bottom:1px solid var(--dwg-dim); font-size:14px; }
.dwg-bar button { font:inherit; color:inherit; background:transparent; border:1px solid var(--dwg-dim); border-radius:6px; padding:3px 10px; cursor:pointer; }
.dwg-bar button.on { background:var(--dwg-hl); color:#fff; border-color:var(--dwg-hl); }
.dwg-bar .hint { margin-left:auto; opacity:.65; font-size:12px; }
.dwg-svg { flex:1; width:100%; min-height:0; touch-action:none; cursor:grab; user-select:none; }
.dwg-svg.drag { cursor:grabbing; }
.dwg .part { cursor:pointer; }
.dwg .part * { fill:var(--dwg-fill); stroke:var(--dwg-ink); stroke-width:${I.line.outline}; vector-effect:non-scaling-stroke; stroke-width:1px; stroke-linejoin:round; }
.dwg .part .thin { stroke-width:.6px; fill:none; }
.dwg .part .dash { stroke-dasharray:3 2; fill:none; }
.dwg .part .chain { fill:none; stroke-width:1.4px; stroke-dasharray:8 2 1.5 2; }
.dwg .part .bar { fill:var(--dwg-ink); stroke:none; }
.dwg .part:hover * { stroke:var(--dwg-hl); }
.dwg.has-hl .part { opacity:.28; }
.dwg.has-hl .part.hl { opacity:1; }
.dwg.has-hl .part.hl * { stroke:var(--dwg-hl); stroke-width:1.8px; }
.dwg .dimline * { fill:none; stroke:var(--dwg-dimline); stroke-width:.7px; vector-effect:non-scaling-stroke; }
.dwg .dimline .arrow { fill:var(--dwg-dimline); }
.dwg .dimline text { fill:var(--dwg-dimline); stroke:none; font-size:${I.font.dim}px; text-anchor:middle; paint-order:stroke; }
.dwg .sheet-frame { fill:none; stroke:var(--dwg-frame); stroke-width:.8px; vector-effect:non-scaling-stroke; }
.dwg .vtitle { font-size:${I.font.title}px; font-weight:700; fill:var(--dwg-ink); }
.dwg .tb line, .dwg .tb rect { stroke:var(--dwg-frame); stroke-width:.8px; fill:none; vector-effect:non-scaling-stroke; }
.dwg .tb text { fill:var(--dwg-ink); font-size:3.4px; }
.dwg .tb .big { font-size:${I.font.big}px; font-weight:700; }
.dwg .tb .k { opacity:.65; font-size:2.6px; }
`;

const esc = (s) => String(s).replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
const f = (n) => (Math.round(n * 100) / 100).toString();

export default function create(api) {
  const design = api.design, record = api.record;
  const el = document.createElement('div'); el.className = 'dwg';
  el.innerHTML = `<style>${CSS}</style>
    <div class="dwg-bar"><strong>図面</strong>
      <span class="cfg" role="group" aria-label="構成"></span>
      <span><button type="button" data-z="in" aria-label="拡大">＋</button> <button type="button" data-z="out" aria-label="縮小">－</button> <button type="button" data-z="fit">全体</button></span>
      <span class="hint">ドラッグで移動、ホイールで拡大縮小、部品をクリックで選択</span></div>
    <svg class="dwg-svg" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="ゴーカートの三面図"></svg>`;
  const svg = el.querySelector('svg'), cfgBar = el.querySelector('.cfg');
  const SC = { v: 100, n: 10 };
  let config = 'summer';
  let vb = { x: 0, y: 0, w: I.sheet.w, h: I.sheet.h };
  let lastSel = null;

  for (const c of design.configs) {
    const b = document.createElement('button'); b.type = 'button'; b.dataset.config = c; b.textContent = CONFIG_LABEL[c] || c;
    b.addEventListener('click', () => { config = c; draw(); api.goto && api.goto('dwg', { cfg: c }); });
    cfgBar.appendChild(b);
  }

  // ------------------------------------------------------------------ values
  const num = (key, fallbackM, unit = 'mm') => {
    let t = ''; try { t = key ? api.valueText(key) : ''; } catch (e) { t = ''; }
    if (t && t !== key && !/undefined|null/.test(t)) return t;
    return Math.round(fallbackM * 1000).toLocaleString('ja-JP') + ' ' + unit;
  };
  const recordDate = () => {
    const ds = [...(record.decisions || []).map((d) => d.date), ...(record.checks || []).map((c) => c.date), ...(record.sources || []).map((s) => s.retrieved)].filter(Boolean).sort();
    return ds.length ? ds[ds.length - 1] : (record.plan && record.plan.start) || '';
  };

  // ------------------------------------------------------------------ geometry of the kart for this config
  const lift = () => (config === 'winter' && design.lift ? design.lift.winter || 0 : 0); // the chassis rides higher in winter; ground items stay
  const shown = (it) => it.configs.includes(config);
  function bounds() {
    let x0 = Infinity, x1 = -Infinity, y1 = 0, z1 = 0;
    let lf = 0;
    const px = (x, y, z) => { x0 = Math.min(x0, x); x1 = Math.max(x1, x); y1 = Math.max(y1, Math.abs(y)); z1 = Math.max(z1, z + lf); };
    lf = lift();
    for (const m of design.members) { px(...m.a); px(...m.b); }
    for (const it of design.items.filter(shown)) {
      lf = it.ground ? 0 : lift();
      if (it.type === 'track') { for (const [cx, cz, r] of it.wheels) { px(cx - r, it.width / 2, cz + r); px(cx + r, 0, 0); } }
      if (it.type === 'outboard') { const tl = it.tilt_deg * Math.PI / 180; px(it.pos[0] - Math.sin(tl) * it.shaft, 0, it.pos[2] - Math.cos(tl) * it.shaft); px(it.pos[0], it.pos[1], it.pos[2] + 0.15); }
      if (it.type === 'float') { px(it.pos[0] - it.l / 2, it.pos[1] + Math.sign(it.pos[1]) * it.d / 2, it.pos[2] + it.d / 2); px(it.pos[0] + it.l / 2, 0, 0); }
      if (it.type === 'wheel') { px(it.pos[0] - it.od / 2, it.pos[1] + it.width / 2 * Math.sign(it.pos[1]), 0); px(it.pos[0] + it.od / 2, it.pos[1] + it.width / 2 * Math.sign(it.pos[1]), it.od); }
      else if (it.type === 'ski') { px(it.pos[0] - it.l / 2, it.pos[1] + it.w / 2 * Math.sign(it.pos[1]), 0); px(it.pos[0] + it.l / 2, it.pos[1], I.skiTipRise); }
      else if (it.type === 'saddle') px(it.pos[0], it.pos[1], it.pos[2] + it.h);
      else if (it.type === 'handlebar') px(it.pos[0], it.width / 2, it.pos[2]);
    }
    return { x0, x1, y1, z1 };
  }

  // ------------------------------------------------------------------ projections
  let layout;
  function makeLayout() {
    const B = bounds(), M = I.margins, d = design.dims;
    const H0 = Math.max(B.z1, config === 'winter' && design.dims_winter ? design.dims_winter.height : d.height), yw0 = Math.max(B.y1, d.width / 2);
    for (const n of I.scales) { SC.n = n; SC.v = 1000 / n; if (M.top + 18 + H0 * SC.v + 36 + 2 * yw0 * SC.v + 14 <= I.sheet.h) break; }
    const s = SC.v;
    const ex0 = Math.min(B.x0, d.x_back), ex1 = Math.max(B.x1, d.x_front);
    const sideW = (ex1 - ex0) * s, H = Math.max(B.z1, config === 'winter' && design.dims_winter ? design.dims_winter.height : d.height) * s;
    const yw = Math.max(B.y1, d.width / 2) * s;
    const ox = Math.max(M.left + 8, M.left - 8 - ex0 * s), gy = M.top + 18 + H;          // side view: x origin (x=0), ground line
    const px0 = ox + ex0 * s;
    const py = gy + 36 + yw;                         // plan: y=0 line
    const fx = px0 + sideW + M.gap + 20 + yw;             // front view: y=0 line
    return {
      B, s, ex0, ex1, H, yw, sideW,
      side: (x, y, z) => [ox + x * s, gy - z * s],
      plan: (x, y, z) => [ox + x * s, py - y * s],
      front: (x, y, z) => [fx + y * s, gy - z * s],
      ox, gy, py, fx, px0,
    };
  }

  // ------------------------------------------------------------------ shape helpers (return svg strings)
  const poly = (pts, cls = '') => `<polygon class="${cls}" points="${pts.map((p) => f(p[0]) + ',' + f(p[1])).join(' ')}"/>`;
  const line = (a, b, cls = 'thin') => `<polyline class="${cls}" points="${f(a[0])},${f(a[1])} ${f(b[0])},${f(b[1])}"/>`;
  const rectA = (a, b, cls = '') => poly([[a[0], a[1]], [b[0], a[1]], [b[0], b[1]], [a[0], b[1]]], cls);
  const circ = (c, r, cls = '') => `<circle class="${cls}" cx="${f(c[0])}" cy="${f(c[1])}" r="${f(Math.max(r, 0.05))}"/>`;
  const thick = (a, b, w, cls = '') => { // a line with a width, as a polygon
    const dx = b[0] - a[0], dy = b[1] - a[1], L = Math.hypot(dx, dy);
    if (L < 0.05) return circ(a, w / 2, cls);
    const nx = -dy / L * w / 2, ny = dx / L * w / 2;
    return poly([[a[0] + nx, a[1] + ny], [b[0] + nx, b[1] + ny], [b[0] - nx, b[1] - ny], [a[0] - nx, a[1] - ny]], cls);
  };
  const boxRect = (P, c, sx, sy, sz, cls = '') => { // axis aligned box seen in a view: bounding rectangle of its 8 corners
    const pts = []; for (const a of [-1, 1]) for (const b of [-1, 1]) for (const g of [-1, 1]) pts.push(P(c[0] + a * sx / 2, c[1] + b * sy / 2, c[2] + g * sz / 2));
    const xs = pts.map((p) => p[0]), ys = pts.map((p) => p[1]);
    return rectA([Math.min(...xs), Math.min(...ys)], [Math.max(...xs), Math.max(...ys)], cls);
  };
  const gearPath = (P, it) => { // a sprocket in the side view with its real number of teeth
    const n = it.teeth, pitch = it.pd * Math.sin(Math.PI / n), rootR = it.pd / 2 - I.rollerFrac * pitch / 2, tipR = it.od / 2, step = Math.PI * 2 / n;
    const pts = []; const at = (r, a) => P(it.pos[0] + Math.cos(a) * r, 0, it.pos[2] + Math.sin(a) * r);
    for (let i = 0; i < n; i++) { const a = i * step; pts.push(at(rootR, a - step * 0.34), at(tipR, a - step * 0.2), at(tipR, a + step * 0.2), at(rootR, a + step * 0.34)); }
    return poly(pts, '') + circ(P(it.pos[0], 0, it.pos[2]), it.pd / 2 * SC.v, 'thin dash') + circ(P(it.pos[0], 0, it.pos[2]), rootR * 0.3 * SC.v, 'thin');
  };
  const ringSamples = (c, n, u, v, r, N = 40) => { // a 3D circle as points
    const out = []; for (let i = 0; i < N; i++) { const a = i / N * Math.PI * 2; out.push([c[0] + (u[0] * Math.cos(a) + v[0] * Math.sin(a)) * r, c[1] + (u[1] * Math.cos(a) + v[1] * Math.sin(a)) * r, c[2] + (u[2] * Math.cos(a) + v[2] * Math.sin(a)) * r]); }
    return out;
  };
  const beltPath = (P, it) => { // roller chain: closed path round two sprockets (side view)
    const c1 = [it.pos[0], it.pos[2]], c2 = [it.to[0], it.to[2]], r1 = it.r1, r2 = it.r2;
    const dx = c2[0] - c1[0], dz = c2[1] - c1[1], L = Math.hypot(dx, dz), ang = Math.atan2(dz, dx), phi = Math.acos((r1 - r2) / L);
    const pts = []; const arc = (c, r, a0, a1) => { const n = 24; for (let i = 0; i <= n; i++) { const a = a0 + (a1 - a0) * i / n; pts.push(P(c[0] + r * Math.cos(a), 0, c[1] + r * Math.sin(a))); } };
    arc(c2, r2, ang - phi, ang + phi); arc(c1, r1, ang + phi, ang - phi + Math.PI * 2);
    return poly(pts, 'chain');
  };

  function shapes(it, view, P) { // svg for one item in one view; P projects model points
    const s = SC.v, pos = it.pos || [0, 0, 0], y = pos[1]; // track and sheet carry no pos
    switch (it.type) {
      case 'plate': case 'guard': return boxRect(P, pos, ...it.size, it.rider ? 'dash' : ''); // items for one rider only are dashed
      case 'cyl': case 'hub': {
        const r = it.d / 2;
        return view === 'side' ? circ(P(pos[0], y, pos[2]), r * s) : boxRect(P, pos, r * 2, it.l, r * 2);
      }
      case 'wheel': {
        const r = it.od / 2;
        return view === 'side' ? circ(P(pos[0], y, pos[2]), r * s) + circ(P(pos[0], y, pos[2]), it.rim / 2 * s, 'thin')
          : boxRect(P, pos, it.od, it.width, it.od) + (view === 'plan' ? '' : boxRect(P, pos, it.rim, it.width * 0.9, it.rim, 'thin'));
      }
      case 'chains': {
        const r = it.od / 2 + 0.004;
        return view === 'side' ? circ(P(pos[0], y, pos[2]), r * s, 'thin dash') : boxRect(P, pos, it.od + 0.008, it.width, it.od + 0.008, 'thin dash');
      }
      case 'disc': return view === 'side' ? circ(P(pos[0], y, pos[2]), it.d / 2 * s) + circ(P(pos[0], y, pos[2]), it.d / 2 * 0.34 * s, 'thin') : boxRect(P, pos, it.d, it.t, it.d);
      case 'caliper': return boxRect(P, pos, ...it.size);
      case 'scooter_unit': {
        const out = it.out, c = [pos[0], pos[1], pos[2] + it.height / 2];
        const sp = design.items.find((o) => o.type === 'sprocket' && Math.abs(o.pos[0] - out[0]) < 0.002 && Math.abs(o.pos[2] - out[2]) < 0.002);
        const cvt = boxRect(P, [(out[0] + pos[0] + it.length * 0.12) / 2, pos[1] + it.width / 2 - 0.045, out[2]], pos[0] + it.length * 0.12 - out[0], 0.09, 0.15, 'thin');
        return boxRect(P, c, it.length, it.width, it.height) + cvt + line(P(...out), P(out[0], sp ? sp.pos[1] : out[1], out[2]), 'thin')
          + (view === 'side' ? circ(P(out[0], out[1], out[2]), 0.075 * s, 'thin') : '');
      }
      case 'lamp': {
        if (it.d) return view === 'side' ? (Math.abs(it.facing[1] === 'x' ? 1 : 0) ? boxRect(P, pos, it.d * 0.7, it.d, it.d, '') : circ(P(...pos), it.d / 2 * s)) : (it.facing.endsWith('x') ? (view === 'front' ? circ(P(...pos), it.d / 2 * s) : boxRect(P, pos, it.d * 0.7, it.d, it.d)) : boxRect(P, pos, it.d, it.d, it.d * 0.7));
        return boxRect(P, pos, ...it.size);
      }
      case 'mirror': {
        const st = it.stem;
        return thick(P(...st), P(...pos), 0.016 * s) + (view === 'front' ? boxRect(P, pos, 0.02, it.d, it.d) : view === 'side' ? boxRect(P, pos, 0.02, it.d, it.d) : boxRect(P, pos, 0.02, it.d, it.d));
      }
      case 'plate_number': return boxRect(P, pos, ...it.size);
      case 'box': return boxRect(P, pos, ...it.size);
      case 'gauge': return view === 'front' ? circ(P(...pos), it.d / 2 * s) : boxRect(P, pos, it.d * 0.9, it.d, it.d);
      case 'lever': return thick(P(...pos), P(...it.to), 0.016 * s);
      case 'clutch': return view === 'side' ? circ(P(pos[0], y, pos[2]), it.od / 2 * s) : boxRect(P, pos, it.od, it.l, it.od);
      case 'sprocket': return view === 'side' ? gearPath(P, it) : boxRect(P, pos, it.od, it.t, it.od);
      case 'chain': {
        if (view === 'side') return beltPath(P, it);
        const x0 = Math.min(it.pos[0] - it.r1, it.to[0] - it.r2), x1 = Math.max(it.pos[0] + it.r1, it.to[0] + it.r2);
        const z0 = Math.min(it.pos[2] - it.r1, it.to[2] - it.r2), z1 = Math.max(it.pos[2] + it.r1, it.to[2] + it.r2), w = 0.008;
        return boxRect(P, [(x0 + x1) / 2, y, (z0 + z1) / 2], x1 - x0, w, z1 - z0, 'thin dash');
      }
      case 'pillow': {
        const w = it.bore * I.pillowWidthPerBore, tb = it.h * I.pillowBase, R = it.h2 - it.h, g = it.inverted ? -1 : 1;
        if (view === 'side') return boxRect(P, [pos[0], y, pos[2] + g * tb / 2], it.l, w, tb) + circ(P(pos[0], y, pos[2] + g * it.h), R * s) + circ(P(pos[0], y, pos[2] + g * it.h), it.bore / 2 * s, 'thin');
        if (view === 'plan') return boxRect(P, pos, it.l, w, tb * 2);
        return boxRect(P, [pos[0], y, pos[2] + g * it.h2 / 2], R * 2, w, it.h2);
      }
      case 'engine': {
        const sh = it.shaft_h, W = it.width, L = it.length, H = it.height;
        const c = [pos[0], pos[1], pos[2] + H / 2];
        const shaftA = P(pos[0], pos[1], pos[2] + sh), shaftB = P(pos[0], pos[1] + (it.pto.startsWith('-') ? -L / 2 : L / 2), pos[2] + sh);
        return boxRect(P, c, W, L, H) + (view === 'side' ? circ(P(pos[0], pos[1], pos[2] + sh), 0.03 * s, 'thin') : '') + line(shaftA, shaftB, 'thin');
      }
      case 'spindle': {
        const k = it.pos, w = it.to, rod = design.items.find((o) => o.part === 'tie_rods' && Math.sign(o.to[1]) === it.side);
        const end = rod ? rod.to : [k[0] - it.arm, k[1], k[2]];
        if (it.kp_lo) { // the kingpin between the A-arms' joints (D-041)
          const lo = it.kp_lo, hi = it.kp_hi, at = (z) => lo.map((v, i) => v + (hi[i] - v) * (z - lo[2]) / (hi[2] - lo[2]));
          return thick(P(...lo), P(...hi), 0.025 * s) + thick(P(...at(w[2])), P(...w), 0.025 * s) + thick(P(...at(end[2])), P(...end), 0.015 * s);
        }
        const kb = [k[0], k[1], w[2] - 0.032];
        return thick(P(...kb), P(k[0], k[1], k[2] + 0.025), 0.025 * s) + thick(P(k[0], k[1], w[2]), P(...w), 0.025 * s) + thick(P(k[0], k[1], end[2]), P(...end), 0.015 * s);
      }
      case 'ski': {
        const l = it.l, t = I.skiThickness, x0 = pos[0] - l / 2, x1 = pos[0] + l / 2, tip = l * I.skiTipFrac, kick = l * I.skiKickFrac, N = 10;
        if (view === 'side') {
          const bot = []; for (let i = 0; i <= N; i++) { const q = i / N; bot.push([x0 + q * kick, I.skiKickRise * (1 - q) * (1 - q)]); }
          for (let i = 1; i <= N; i++) { const q = i / N; bot.push([x1 - tip + q * tip, I.skiTipRise * q * q]); }
          const pts = bot.map((p) => P(p[0], y, p[1])).concat(bot.slice().reverse().map((p) => P(p[0], y, p[1] + t)));
          return poly(pts);
        }
        return view === 'plan' ? boxRect(P, [pos[0], y, 0], l, it.w, 0.01) : boxRect(P, [pos[0], y, t / 2], 0, it.w, t);
      }
      case 'rod': return thick(P(...it.pos), P(...it.to), Math.max(it.d * s, 0.8));
      case 'arm': return thick(P(...pos), P(...it.to), Math.max((view === 'side' ? it.t : it.w) * s, 0.8)); // flat bar: thickness seen from the side, width from above and the front
      case 'saddle': return boxRect(P, [pos[0], y, pos[2] + it.h / 2], it.l, it.w, it.h);
      case 'handlebar': {
        const half = it.width / 2, gl = it.grips;
        let out = boxRect(P, pos, it.d, it.width, it.d);
        for (const sg of [-1, 1]) out += boxRect(P, [pos[0], sg * (half - gl / 2), pos[2]], it.d * 1.45, gl, it.d * 1.45, 'thin');
        return out;
      }
      case 'fender': {
        const r = it.od / 2, a = I.fenderHalfAngleDeg * Math.PI / 180, t = I.fenderThick, N = 16;
        if (view === 'side') {
          const outer = [], inner = [];
          for (let i = 0; i <= N; i++) { const q = -a + 2 * a * i / N; outer.push(P(pos[0] + r * Math.sin(q), y, pos[2] + r * Math.cos(q))); inner.push(P(pos[0] + (r - t) * Math.sin(q), y, pos[2] + (r - t) * Math.cos(q))); }
          return poly(outer.concat(inner.reverse()));
        }
        const zb = pos[2] + r * Math.cos(a);
        return view === 'plan' ? boxRect(P, [pos[0], y, pos[2] + r], 2 * r * Math.sin(a), it.width, t)
          : boxRect(P, [pos[0], y, (zb + pos[2] + r) / 2], 0, it.width, pos[2] + r - zb);
      }
      case 'track': { // the band round its wheels: a hull outline in the side view, rectangles in the others
        const t = it.t, hp = [];
        for (const [cx, cz, r] of it.wheels) for (let i = 0; i < 24; i++) { const a = i / 24 * Math.PI * 2; hp.push([cx + (r + t) * Math.cos(a), cz + (r + t) * Math.sin(a)]); }
        const hull = convexHull(hp), xs = hull.map((p) => p[0]), zs = hull.map((p) => p[1]);
        const x0 = Math.min(...xs), x1 = Math.max(...xs), z0 = Math.min(...zs), z1 = Math.max(...zs);
        if (view === 'side') return poly(hull.map((p) => P(p[0], 0, p[1]))) + it.wheels.map(([cx, cz, r]) => circ(P(cx, 0, cz), r * s, 'thin')).join('');
        return boxRect(P, [(x0 + x1) / 2, 0, (z0 + z1) / 2], x1 - x0, it.width, z1 - z0);
      }
      case 'shock': { // body at the fixed eye, thinner rod, spring between the eyes (zigzag), eye rings
        const a = P(...it.to), b = P(...pos), m = [(a[0] + b[0]) / 2, (a[1] + b[1]) / 2];
        const dx = b[0] - a[0], dy = b[1] - a[1], L = Math.hypot(dx, dy) || 1, nx = -dy / L, ny = dx / L, w = it.spring_d / 2 * s, zig = [];
        for (let i = 0; i <= 16; i++) { const q = 0.06 + 0.88 * i / 16, o = i % 2 ? w : -w; zig.push([a[0] + dx * q + nx * o, a[1] + dy * q + ny * o]); }
        return thick(a, m, it.d * s) + thick(m, b, it.rod_d * s) + `<polyline class="thin" points="${zig.map((p) => f(p[0]) + ',' + f(p[1])).join(' ')}"/>`
          + circ(a, 0.012 * s, 'thin') + circ(b, 0.012 * s, 'thin');
      }
      case 'sheet': return poly(it.corners.map((c) => P(...c)));
      case 'float': return view === 'front' ? circ(P(...pos), it.d / 2 * s) : boxRect(P, pos, it.l, it.d, it.d);
      case 'outboard': {
        const tl = it.tilt_deg * Math.PI / 180, a = [pos[0], pos[1], pos[2] - 0.1], b = [a[0] - Math.sin(tl) * it.shaft, a[1], a[2] - Math.cos(tl) * it.shaft];
        return boxRect(P, pos, 0.25, 0.15, 0.3) + thick(P(...a), P(...b), 0.07 * s);
      }
      default: return ''; // unknown types are skipped, never an error
    }
  }
  const convexHull = (pts) => { // counter-clockwise monotone chain
    const p = pts.slice().sort((a, b) => a[0] - b[0] || a[1] - b[1]), cr = (o, a, b) => (a[0] - o[0]) * (b[1] - o[1]) - (a[1] - o[1]) * (b[0] - o[0]), lo = [], up = [];
    for (const q of p) { while (lo.length >= 2 && cr(lo[lo.length - 2], lo[lo.length - 1], q) <= 0) lo.pop(); lo.push(q); }
    for (const q of p.slice().reverse()) { while (up.length >= 2 && cr(up[up.length - 2], up[up.length - 1], q) <= 0) up.pop(); up.push(q); }
    return lo.slice(0, -1).concat(up.slice(0, -1));
  };
  function memberShape(m, view, P) {
    return thick(P(...m.a), P(...m.b), Math.max(m.od * SC.v, 0.8));
  }

  // ------------------------------------------------------------------ dimension lines
  const ARROW = 2.2;
  function dim(a, b, off, text, dir) { // a,b sheet points; the dimension line is offset by `off` (mm, to the side of the a-b line; dir = 'h' or 'v')
    const horiz = dir === 'h';
    const A = horiz ? [a[0], a[1] + off] : [a[0] + off, a[1]], B = horiz ? [b[0], b[1] + off] : [b[0] + off, b[1]];
    const sgn = off >= 0 ? 1 : -1, over = 1.5;
    const ext = (p, q) => horiz ? line([p[0], p[1] + sgn * 1], [q[0], q[1] + sgn * over], 'x') : line([p[0] + sgn * 1, p[1]], [q[0] + sgn * over, q[1]], 'x');
    const arrow = (p, towards) => { // filled arrow head at p pointing away from `towards`
      const dx = p[0] - towards[0], dy = p[1] - towards[1], L = Math.hypot(dx, dy) || 1, ux = dx / L, uy = dy / L;
      return `<polygon class="arrow" points="${f(p[0])},${f(p[1])} ${f(p[0] - ux * ARROW - uy * ARROW * 0.3)},${f(p[1] - uy * ARROW + ux * ARROW * 0.3)} ${f(p[0] - ux * ARROW + uy * ARROW * 0.3)},${f(p[1] - uy * ARROW - ux * ARROW * 0.3)}"/>`;
    };
    const mid = [(A[0] + B[0]) / 2, (A[1] + B[1]) / 2];
    const tx = horiz ? `<text x="${f(mid[0])}" y="${f(mid[1] - 1)}">${esc(text)}</text>` : `<text transform="translate(${f(mid[0] - 1)},${f(mid[1])}) rotate(-90)">${esc(text)}</text>`;
    return `<g class="dimline">${ext(a, A)}${ext(b, B)}${line(A, B, 'x')}${arrow(A, B)}${arrow(B, A)}${tx}</g>`;
  }

  // ------------------------------------------------------------------ the sheet
  function draw() {
    layout = makeLayout();
    const L = layout, winter = config === 'winter' && design.dims_winter, d = winter ? { ...design.dims, ...design.dims_winter } : design.dims, s = SC.v, S = I.sheet;
    const items = design.items.filter(shown);
    const prio = (t) => (t === 'plate' || t === 'sheet' ? 0 : t === 'wheel' || t === 'chains' || t === 'ski' || t === 'track' || t === 'float' ? 1 : 3);
    const byPart = new Map(); // part -> { side:'', plan:'', front:'' }
    const add = (part, view, str) => { if (!str) return; if (!byPart.has(part)) byPart.set(part, { side: '', plan: '', front: '' }); byPart.get(part)[view] += str; };
    let nShapes = 0;
    const views = [['side', L.side], ['plan', L.plan], ['front', L.front]];
    const order = [...items.map((it) => ({ kind: 'item', it, p: prio(it.type) })), ...design.members.map((m) => ({ kind: 'member', m, p: 2 }))].sort((a, b) => a.p - b.p);
    const buckets = { side: [], plan: [], front: [] };
    for (const o of order) {
      for (const [view, P] of views) {
        const lf = o.kind === 'item' && o.it.ground ? 0 : lift(); // ground items keep their absolute height
        const Pl = lf ? (x, y, z) => P(x, y, z + lf) : P;
        let str = '';
        try { str = o.kind === 'item' ? shapes(o.it, view, Pl) : memberShape(o.m, view, Pl); } catch (e) { str = ''; }
        if (str) buckets[view].push([o.kind === 'item' ? o.it.part : o.m.part, str]);
      }
      nShapes++;
    }
    const partIds = new Set([...items.map((i) => i.part), ...design.members.map((m) => m.part)]);
    let body = '';
    for (const [view] of views) {
      body += `<g class="view" data-view="${view}">`;
      for (const [part, str] of buckets[view]) body += `<g class="part" data-part="${part}"><title>${esc(PART_JA[part] || part)}</title>${str}</g>`;
      body += '</g>';
    }
    // dimension lines
    const wTot = config === 'transport' ? d.width_transport : d.width, tr = config === 'transport' ? d.track_rear_narrow : d.track_rear;
    const wKey = config === 'transport' ? 'dsn.width_transport_m' : 'dsn.width_m', trKey = config === 'transport' ? 'lay.track_rear_narrow_mm' : 'lay.track_rear_mm';
    let dims = '';
    const sd = (x, z) => L.side(x, 0, z), pd = (x, y) => L.plan(x, y, 0), fd = (y, z) => L.front(0, y, z);
    dims += dim(sd(d.x_back, 0), sd(d.x_front, 0), 12, `全長 ${num(winter ? '' : 'dsn.length_m', d.length)}`, 'h');
    dims += dim(sd(0, 0), sd(d.wheelbase, 0), 20, `ホイールベース ${num('lay.wheelbase_mm', d.wheelbase)}`, 'h');
    dims += dim(sd(L.ex1 + 0.02, 0), sd(L.ex1 + 0.02, d.height), 12, `全高 ${num(winter ? '' : 'dsn.height_m', d.height)}`, 'v');
    const clr = winter ? d.belly : d.clearance; // winter: belly of the sled pan above the snow
    dims += dim(sd(d.x_back, 0), sd(d.x_back, clr), -9, `地上高 ${num('', clr)}`, 'v');
    if (!winter) dims += dim(sd(0.5, 0), sd(0.5, d.low_point), 6, `最低部 ${num('dsn.low_point_mm', d.low_point)}`, 'v');
    dims += dim(pd(d.x_front, wTot / 2), pd(d.x_front, -wTot / 2), 12, `全幅 ${num(wKey, wTot)}`, 'v');
    dims += dim(pd(0, tr / 2), pd(0, -tr / 2), -14 - 0, `後輪トレッド ${num(trKey, tr)}`, 'v');
    dims += dim(pd(d.wheelbase, d.track_front / 2), pd(d.wheelbase, -d.track_front / 2), 24, `前輪トレッド ${num('lay.track_front_mm', d.track_front)}`, 'v');
    dims += dim(fd(wTot / 2, 0), fd(-wTot / 2, 0), 12, `全幅 ${num(wKey, wTot)}`, 'h');
    dims += dim(fd(tr / 2, 0), fd(-tr / 2, 0), 22, `後輪トレッド ${num(trKey, tr)}`, 'h');
    dims += dim(fd(wTot / 2 + 0.0, 0), fd(wTot / 2 + 0.0, d.height), 12, `全高 ${num(winter ? '' : 'dsn.height_m', d.height)}`, 'v');
    // 1 m marker line (side and front views)
    const mk = (a, b, tx, ty) => `<g class="dimline"><line x1="${f(a[0])}" y1="${f(a[1])}" x2="${f(b[0])}" y2="${f(b[1])}" style="stroke-dasharray:4 2"/><text x="${f(tx)}" y="${f(ty)}" style="text-anchor:start">1 m</text></g>`;
    { const a = L.side(L.ex0, 0, 1), b = L.side(L.ex1, 0, 1), c = L.front(-L.yw / s, 0, 1), e = L.front(L.yw / s, 0, 1);
      dims += mk(a, b, a[0] + 1, a[1] - 1) + mk(c, e, c[0] + 1, c[1] - 1); }
    // view titles and axes
    const title = (x, y, t) => `<text class="vtitle" x="${f(x)}" y="${f(y)}">${esc(t)}</text>`;
    let titles = title(L.ox + L.ex0 * s, L.gy - L.H - 7, '側面図 (右から)') + title(L.ox + L.ex0 * s, L.py - L.yw - 3, '平面図') + title(L.fx - L.yw, L.gy - L.H - 7, '正面図');
    const ground = `<line class="thin-l" x1="${f(L.ox + L.ex0 * s - 6)}" x2="${f(L.ox + L.ex1 * s + 6)}" y1="${f(L.gy)}" y2="${f(L.gy)}" style="stroke:var(--dwg-frame);stroke-width:.6px;stroke-dasharray:6 2 1 2;vector-effect:non-scaling-stroke"/>`
      + `<line x1="${f(L.fx - L.yw - 6)}" x2="${f(L.fx + L.yw + 6)}" y1="${f(L.gy)}" y2="${f(L.gy)}" style="stroke:var(--dwg-frame);stroke-width:.6px;stroke-dasharray:6 2 1 2;vector-effect:non-scaling-stroke"/>`
      + `<line x1="${f(L.ox + L.ex0 * s - 6)}" x2="${f(L.ox + L.ex1 * s + 6)}" y1="${f(L.py)}" y2="${f(L.py)}" style="stroke:var(--dwg-frame);stroke-width:.6px;stroke-dasharray:6 2 1 2;vector-effect:non-scaling-stroke"/>`
      + `<line x1="${f(L.fx)}" x2="${f(L.fx)}" y1="${f(L.gy - L.H - 4)}" y2="${f(L.gy + 4)}" style="stroke:var(--dwg-frame);stroke-width:.6px;stroke-dasharray:6 2 1 2;vector-effect:non-scaling-stroke"/>`;
    if (config === 'water') titles += `<text class="vtitle" x="${f(L.ox + L.ex0 * s)}" y="14" style="fill:var(--dwg-hl)">将来版の参考表示（要求ではありません、D-027）</text>`;
    // title block
    const T = I.titleBlock, tx = S.w - 10 - T.w, ty = S.h - 10 - T.h;
    const tb = `<g class="tb"><rect x="${tx}" y="${ty}" width="${T.w}" height="${T.h}"/>
      <line x1="${tx}" x2="${tx + T.w}" y1="${ty + 16}" y2="${ty + 16}"/><line x1="${tx}" x2="${tx + T.w}" y1="${ty + 31}" y2="${ty + 31}"/>
      <line x1="${tx + 78}" x2="${tx + 78}" y1="${ty + 16}" y2="${ty + T.h}"/>
      <text class="k" x="${tx + 2}" y="${ty + 4}">図面名</text><text class="big" x="${tx + 2}" y="${ty + 12}">ゴーカート 三面図（${esc(CONFIG_LABEL[config] || config)}）</text>
      <text class="k" x="${tx + 2}" y="${ty + 20}">縮尺</text><text x="${tx + 2}" y="${ty + 28}">1:${SC.n}（A3 横）</text>
      <text class="k" x="${tx + 80}" y="${ty + 20}">日付</text><text x="${tx + 80}" y="${ty + 28}">${esc(recordDate())}</text>
      <text class="k" x="${tx + 2}" y="${ty + 35}">部品</text><text x="${tx + 2}" y="${ty + 43}">${partIds.size} 部品（${nShapes} 要素）</text>
      <text class="k" x="${tx + 80}" y="${ty + 35}">寸法の単位</text><text x="${tx + 80}" y="${ty + 43}">mm（図は m 値から作図）</text></g>`;
    svg.innerHTML = `<rect x="0" y="0" width="${S.w}" height="${S.h}" fill="var(--dwg-bg)"/><rect class="sheet-frame" x="5" y="5" width="${S.w - 10}" height="${S.h - 10}"/>`
      + ground + body + dims + titles + tb;
    svg.querySelectorAll('.part').forEach((g) => g.addEventListener('click', (e) => { if (moved) return; e.stopPropagation(); api.select('part', g.dataset.part); }));
    for (const b of cfgBar.children) b.classList.toggle('on', b.dataset.config === config);
    applyVb(); if (lastSel) highlight(lastSel);
  }

  // ------------------------------------------------------------------ pan and zoom (viewBox)
  let moved = false;
  function applyVb() { svg.setAttribute('viewBox', `${f(vb.x)} ${f(vb.y)} ${f(vb.w)} ${f(vb.h)}`); }
  function fit() {
    const r = svg.getBoundingClientRect(), ar = (r.width || 1) / (r.height || 1), S = I.sheet;
    if (S.w / S.h > ar) { vb = { x: 0, y: (S.h - S.w / ar) / 2, w: S.w, h: S.w / ar }; } else { vb = { x: (S.w - S.h * ar) / 2, y: 0, w: S.h * ar, h: S.h }; }
    applyVb();
  }
  function zoomAt(factor, cx, cy) { // cx, cy in sheet units
    const S = I.sheet, w = Math.min(Math.max(vb.w / factor, S.w / I.zoom.max), S.w / I.zoom.min), k = w / vb.w;
    vb = { x: cx - (cx - vb.x) * k, y: cy - (cy - vb.y) * k, w, h: vb.h * k }; applyVb();
  }
  const toSheet = (e) => { const r = svg.getBoundingClientRect(); return [vb.x + (e.clientX - r.left) / r.width * vb.w, vb.y + (e.clientY - r.top) / r.height * vb.h]; };
  svg.addEventListener('wheel', (e) => { e.preventDefault(); const [cx, cy] = toSheet(e); zoomAt(e.deltaY < 0 ? I.zoom.step : 1 / I.zoom.step, cx, cy); }, { passive: false });
  const pts = new Map(); let pinch = 0;
  svg.addEventListener('pointerdown', (e) => { pts.set(e.pointerId, { x: e.clientX, y: e.clientY }); moved = false; svg.classList.add('drag'); if (pts.size === 2) { const [a, b] = [...pts.values()]; pinch = Math.hypot(a.x - b.x, a.y - b.y); } });
  svg.addEventListener('pointermove', (e) => {
    const p = pts.get(e.pointerId); if (!p) return;
    if (pts.size === 2) { const q = { ...p, x: e.clientX, y: e.clientY }; pts.set(e.pointerId, q); const [a, b] = [...pts.values()]; const dd = Math.hypot(a.x - b.x, a.y - b.y); if (pinch) { const [cx, cy] = toSheet({ clientX: (a.x + b.x) / 2, clientY: (a.y + b.y) / 2 }); zoomAt(dd / pinch, cx, cy); } pinch = dd; moved = true; return; }
    const dx = e.clientX - p.x, dy = e.clientY - p.y;
    if (!moved && Math.hypot(dx, dy) < 4) return;
    if (!moved) { moved = true; }
    const r = svg.getBoundingClientRect(); vb.x -= dx / r.width * vb.w; vb.y -= dy / r.height * vb.h; applyVb();
    pts.set(e.pointerId, { x: e.clientX, y: e.clientY });
  });
  const up = (e) => { pts.delete(e.pointerId); pinch = 0; if (!pts.size) { svg.classList.remove('drag'); setTimeout(() => { moved = false; }, 0); } };
  svg.addEventListener('pointerup', up); svg.addEventListener('pointercancel', up);
  svg.addEventListener('click', () => { if (!moved && lastSel) api.select(null, null); });
  el.querySelector('.dwg-bar').addEventListener('click', (e) => {
    const b = e.target.closest('button[data-z]'); if (!b) return;
    if (b.dataset.z === 'fit') return fit();
    zoomAt(b.dataset.z === 'in' ? I.zoom.step : 1 / I.zoom.step, vb.x + vb.w / 2, vb.y + vb.h / 2);
  });

  // ------------------------------------------------------------------ shell interface
  function highlight(sel) {
    lastSel = sel || null;
    const lit = new Set();
    if (sel) {
      let rel = null; try { rel = api.related(sel); } catch (e) { rel = null; }
      if (rel && rel.part) for (const p of rel.part) lit.add(p);
      if (sel.k === 'part') lit.add(sel.i);
    }
    const groups = svg.querySelectorAll('.part');
    let any = false;
    groups.forEach((g) => { const on = lit.has(g.dataset.part); g.classList.toggle('hl', on); if (on) any = true; });
    el.classList.toggle('has-hl', any);
    if (any && sel && sel.reveal) { // pan the first lit shape into view
      const g = svg.querySelector('.part.hl'); if (!g) return;
      const bb = g.getBBox();
      if (bb.x < vb.x || bb.y < vb.y || bb.x + bb.width > vb.x + vb.w || bb.y + bb.height > vb.y + vb.h) {
        vb.x = bb.x + bb.width / 2 - vb.w / 2; vb.y = bb.y + bb.height / 2 - vb.h / 2; applyVb();
      }
    }
  }
  return {
    el,
    enter(params) {
      const c = params && (params.cfg || params.config);
      if (c && design.configs.includes(c)) config = c;
      draw(); requestAnimationFrame(fit);
    },
    leave() {},
    highlight,
    params() { return config === 'summer' ? {} : { cfg: config }; },
  };
}
