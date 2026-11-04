// 系統図: parts as blocks, interfaces as arrows, three views by flow type.
const NS = 'http://www.w3.org/2000/svg';
function h(tag, attrs, ...kids) {
  const e = document.createElement(tag);
  for (const [k, v] of Object.entries(attrs || {})) {
    if (v == null || v === false) continue;
    if (k === 'class') e.className = v; else if (k.startsWith('on')) e.addEventListener(k.slice(2), v); else e.setAttribute(k, v === true ? '' : v);
  }
  for (const c of kids.flat()) if (c != null && c !== false) e.append(c.nodeType ? c : document.createTextNode(String(c)));
  return e;
}
function s(tag, attrs, ...kids) {
  const e = document.createElementNS(NS, tag);
  for (const [k, v] of Object.entries(attrs || {})) {
    if (v == null || v === false) continue;
    if (k.startsWith('on')) e.addEventListener(k.slice(2), v); else e.setAttribute(k, v);
  }
  for (const c of kids.flat()) if (c != null && c !== false) e.append(c.nodeType ? c : document.createTextNode(String(c)));
  return e;
}

// Drawing-only constants: block size, grid, Japanese short names, fixed positions.
export const ILLUSTRATIVE = {
  W: 106, H: 36, X0: 15, PITCH: 131, VBW: 1200, VBH: 910,
  ja: {
    frame: 'フレーム', bumpers: 'バンパー', seat: '座席', handlebar: 'ハンドル', footrests: '足置き', fenders: '泥よけ',
    guards: 'ガード', tie_rods: 'タイロッド', spindles: 'スピンドル',
    front_wheels: '前輪', axle_shaft: 'アクスル軸', axle_bearings: '軸受', rear_hubs: '後ハブ', rear_wheels: '後輪', brake: 'ブレーキ',
    engine: 'エンジン', chain_final: '最終チェーン',
    throttle: 'スロットル', kill_switch: '停止スイッチ', skis: 'スキー', lighting: '灯火', mirrors: 'ミラー', horn: 'ホーン', speedometer: 'スピードメーター', hand_brake: '前輪ブレーキ', battery: 'バッテリー', number_plate: 'ナンバー', roll_bar: '転倒保護の輪',
    snow_chains: 'タイヤチェーン', sled_pan: 'そり底', swing_arm: 'スイングアーム', rear_shock: '緩衝器', side_floats: '浮き（将来版）', outboard: '船外機（将来版）',
  },
  // [column, y]; the frame is a wide bar. A part missing here is drawn in the fallback row.
  pos: {
    engine: [0, 60], chain_final: [4, 60], throttle: [2, 130], kill_switch: [3, 130],
    axle_shaft: [6, 60], rear_hubs: [7, 60], rear_wheels: [8, 60], axle_bearings: [6, 130], brake: [7, 130], swing_arm: [8, 130], rear_shock: [5, 130],
    battery: [1, 232], lighting: [2, 232], mirrors: [3, 232], hand_brake: [5, 232], speedometer: [7, 232],
    horn: [1, 292], number_plate: [7, 292],
    seat: [1, 410], footrests: [2, 410], fenders: [3, 410], roll_bar: [4, 410],
    bumpers: [2, 545], guards: [5, 545],
    handlebar: [0, 645], tie_rods: [2, 645], spindles: [3, 645], front_wheels: [4, 645],
    skis: [3, 755], snow_chains: [4, 755],
    sled_pan: [0, 545],
    side_floats: [1, 845], outboard: [2, 845],
  },
  frame: { x: 15, y: 490, w: 1033 },
  fallbackY: 925, VBH_BASE: 910,
  // id, label, x, y, w, h, css class
  bands: [
    ['powertrain', '動力', 5, 30, 660, 155, 'g-pt'],
    ['rear', '足回り（後）', 791, 30, 394, 155, 'g-su'],
    ['road', '道路装備', 5, 200, 1053, 150, 'g-rd'],
    ['chassis', '車体', 5, 375, 1053, 225, 'g-ch'],
    ['steering', '操舵', 5, 615, 530, 80, 'g-st'],
    ['front', '足回り（前）', 529, 615, 136, 80, 'g-su'],
    ['winter', '冬', 398, 705, 792, 100, 'g-wi'],
    ['future_water', '水の将来版（参考、要求ではありません、D-027）', 5, 815, 560, 80, 'g-fu'],
  ],
  group: { powertrain: 'g-pt', chassis: 'g-ch', steering: 'g-st', winter: 'g-wi', future_water: 'g-fu', road: 'g-rd', front_wheels: 'g-su', rear_axle: 'g-su', rear_wheels: 'g-su', brake: 'g-su' },
};
const VIEWS = [['power', '動力の流れ'], ['load', '力の流れ'], ['signal', '操作と信号'], ['all', 'すべて']];
const CSS = `
#mode-sys .tb{display:flex;flex-wrap:wrap;gap:6px 14px;align-items:center;margin-bottom:8px}
#mode-sys .scroll{overflow-x:auto;border:1px solid var(--line,#d9dbd5);border-radius:8px;background:var(--card,#fff)}
#mode-sys svg.sysfig{min-width:900px;width:100%;display:block}
#mode-sys .band{fill:var(--neubg,#e7e8e4);stroke:var(--line,#d9dbd5);opacity:.55}
#mode-sys .band.g-pt{fill:var(--warnbg,#fdecc8)}#mode-sys .band.g-st{fill:var(--infobg,#dce8fa)}
#mode-sys .band.g-rd{fill:var(--badbg,#f8d9d5)}#mode-sys .n.g-rd rect{stroke:var(--bad,#a8261c)}
#mode-sys .band.g-su{fill:var(--okbg,#dff3e4)}#mode-sys .band.g-wi{fill:var(--card,#fff);stroke-dasharray:5 3}
#mode-sys .band.g-fu{fill:var(--card,#fff);stroke:#e07a1a;stroke-dasharray:2 4}#mode-sys .n.g-fu rect{stroke:#e07a1a;stroke-dasharray:4 3;fill:var(--card,#fff)}
#mode-sys .bandlabel{font-weight:700;fill:var(--mut,#5f6670)}
#mode-sys .n{cursor:pointer}
#mode-sys .n rect{fill:var(--card,#fff);stroke:var(--mut,#5f6670);stroke-width:1.2}
#mode-sys .n.g-pt rect{stroke:var(--warn,#8a5a00)}#mode-sys .n.g-st rect{stroke:var(--info,#1f5fbf)}
#mode-sys .n.g-su rect{stroke:var(--ok,#1d7a3a)}
#mode-sys .n:hover rect{stroke-width:2.5}
#mode-sys .n text.t1{font-size:12px;font-weight:600;text-anchor:middle}
#mode-sys .n text.t2{font-size:9px;text-anchor:middle;fill:var(--mut,#5f6670)}
#mode-sys .e{cursor:pointer;fill:none}
#mode-sys .e .ln{stroke-width:2;fill:none}
#mode-sys .e .hit{stroke:transparent;stroke-width:14;fill:none}
#mode-sys .e.power .ln{stroke:var(--warn,#8a5a00);stroke-width:3.2}
#mode-sys .e.load .ln{stroke:var(--neu,#4b5260)}
#mode-sys .e.sig .ln{stroke:var(--info,#1f5fbf);stroke-dasharray:6 3}
#mode-sys .e:hover .ln{stroke-width:4.5}
#mode-sys .e text{font-size:9px;text-anchor:middle;paint-order:stroke;stroke:var(--card,#fff);stroke-width:3px;fill:var(--mut,#5f6670)}
#mode-sys .ah.power{fill:var(--warn,#8a5a00)}#mode-sys .ah.load{fill:var(--neu,#4b5260)}#mode-sys .ah.sig{fill:var(--info,#1f5fbf)}
#mode-sys .e.off{display:none}
#mode-sys .n.off{opacity:.28}
#mode-sys .has-sel .n:not(.hl),#mode-sys .has-sel .e:not(.hl){opacity:.18}
#mode-sys .n.hl rect{fill:var(--sel,#fff3c4);stroke-width:2.6}
#mode-sys .e.hl .ln{stroke-width:5}
#mode-sys .legend{font-size:.85rem;color:var(--mut,#5f6670)}
#mode-sys .legend i{display:inline-block;width:26px;border-top:3px solid;vertical-align:middle;margin:0 4px 0 10px}
`;

export default function create(api) {
  const rec = api.record, I = ILLUSTRATIVE;
  const byId = new Map(rec.parts.map((p) => [p.id, p]));
  const kids = new Map();
  for (const p of rec.parts) if (p.parent) (kids.get(p.parent) || kids.set(p.parent, []).get(p.parent)).push(p.id);
  const descend = (id, out = new Set()) => { out.add(id); for (const c of kids.get(id) || []) descend(c, out); return out; };
  const topGroup = (id) => { let p = byId.get(id); while (p && p.parent && p.parent !== 'kart') p = byId.get(p.parent); return p ? p.id : id; };

  const el = h('div', { id: 'mode-sys' }, h('style', {}, CSS));
  let view = 'power', sel = null;
  const bar = h('div', { class: 'tb' });
  const btns = {};
  for (const [v, label] of VIEWS) {
    btns[v] = h('button', { type: 'button', onclick: () => { setView(v); try { api.goto('sys', { v }); } catch (e) { /* shell not ready */ } } }, label);
    bar.append(btns[v]);
  }
  const legend = h('span', { class: 'legend' });
  legend.innerHTML = '<i style="border-color:var(--warn,#8a5a00)"></i>動力<i style="border-color:var(--neu,#4b5260)"></i>力（荷重）<i style="border-color:var(--info,#1f5fbf);border-top-style:dashed"></i>操作・信号';
  bar.append(legend);
  const scroll = h('div', { class: 'scroll' });
  el.append(bar, scroll);

  const rect = new Map();
  for (const [id, [c, y]] of Object.entries(I.pos)) rect.set(id, { x: I.X0 + c * I.PITCH, y, w: I.W, h: I.H });
  const leaves = rec.parts.filter((p) => !kids.has(p.id)).map((p) => p.id);
  const need = new Set(leaves); for (const i of rec.interfaces) i.between.forEach((x) => need.add(x));
  let fb = 0; const orphan = [];
  for (const id of need) if (id !== 'frame' && !rect.has(id)) { rect.set(id, { x: I.X0 + (fb % 9) * I.PITCH, y: I.fallbackY + Math.floor(fb / 9) * 50, w: I.W, h: I.H }); orphan.push(id); fb++; }
  const vbh = orphan.length ? I.fallbackY + Math.ceil(orphan.length / 9) * 50 + 20 : I.VBH;
  rect.set('frame', { x: I.frame.x, y: I.frame.y, w: I.frame.w, h: I.H });
  const centre = (id, other) => {
    const r = rect.get(id);
    if (id === 'frame' && other) { const o = rect.get(other); const ox = o.x + o.w / 2; return { x: Math.max(r.x + 14, Math.min(r.x + r.w - 14, ox)), y: r.y + r.h / 2 }; }
    return { x: r.x + r.w / 2, y: r.y + r.h / 2 };
  };
  const edge = (id, from, to, gap) => {
    const r = rect.get(id), dx = to.x - from.x, dy = to.y - from.y;
    const t = Math.min(dx ? (r.w / 2) / Math.abs(dx) : 1e9, dy ? (r.h / 2) / Math.abs(dy) : 1e9);
    const len = Math.hypot(dx, dy) || 1;
    return { x: from.x + dx * t + (dx / len) * gap, y: from.y + dy * t + (dy / len) * gap };
  };

  const kind = (c) => (c === 'power' ? 'power' : c === 'load' ? 'load' : 'sig');
  const svg = s('svg', { class: 'sysfig', viewBox: `0 0 ${I.VBW} ${vbh}`, role: 'img', 'aria-label': '系統図' });
  const defs = s('defs');
  for (const k of ['power', 'load', 'sig']) defs.append(s('marker', { id: 'sysah-' + k, viewBox: '0 0 10 10', refX: 9, refY: 5, markerWidth: 11, markerHeight: 11, markerUnits: 'userSpaceOnUse', orient: 'auto' }, s('path', { d: 'M0,0 L10,5 L0,10 z', class: 'ah ' + k })));
  svg.append(defs);
  for (const [, label, x, y, w, hh, cls] of I.bands) {
    svg.append(s('rect', { class: 'band ' + cls, x, y, width: w, height: hh, rx: 8 }), s('text', { class: 'bandlabel', x: x + 8, y: y + 16 }, label));
  }
  if (orphan.length) svg.append(s('text', { class: 'bandlabel', x: 8, y: I.fallbackY - 8 }, '未配置'));
  const edgeEls = new Map(), nodeEls = new Map();
  const ifaces = rec.interfaces.filter((i) => rect.has(i.between[0]) && rect.has(i.between[1]));
  for (const i of ifaces) {
    const [a, b] = i.between, ca = centre(a, b), cb = centre(b, a);
    const pa = edge(a, ca, cb, 1), pb = edge(b, cb, ca, 4);
    const k = kind(i.carries);
    const g = s('g', { class: 'e ' + k, 'data-i': i.id, onclick: () => api.select('iface', i.id) },
      s('title', {}, `${i.id}: ${(byId.get(a) || {}).name || a} → ${(byId.get(b) || {}).name || b} (${api.CARRIES_JA[i.carries] || i.carries})`),
      s('line', { class: 'hit', x1: pa.x, y1: pa.y, x2: pb.x, y2: pb.y }),
      s('line', { class: 'ln', x1: pa.x, y1: pa.y, x2: pb.x, y2: pb.y, 'marker-end': `url(#sysah-${k})` }),
      Math.hypot(pb.x - pa.x, pb.y - pa.y) > 60 ? s('text', { x: (pa.x + pb.x) / 2, y: (pa.y + pb.y) / 2 + 3 }, i.id) : null);
    edgeEls.set(i.id, g); svg.append(g);
  }
  for (const [id, r] of rect) {
    const cls = I.group[topGroup(id)] || '';
    const g = s('g', { class: 'n ' + cls, 'data-i': id, onclick: () => api.select('part', id) },
      s('title', {}, `${id}: ${(byId.get(id) || {}).name || id}`),
      s('rect', { x: r.x, y: r.y, width: r.w, height: r.h, rx: 6 }),
      s('text', { class: 't1', x: r.x + r.w / 2, y: r.y + 15 }, I.ja[id] || id),
      s('text', { class: 't2', x: r.x + r.w / 2, y: r.y + 28 }, id));
    nodeEls.set(id, g); svg.append(g);
  }
  scroll.append(svg);

  const visible = (i) => view === 'all' || (view === 'signal' ? (i.carries === 'other' || i.carries === 'signal') : i.carries === view);
  function setView(v) {
    if (!btns[v]) v = 'power';
    view = v;
    for (const [id, b] of Object.entries(btns)) b.setAttribute('aria-pressed', id === v ? 'true' : 'false');
    const used = new Set();
    for (const i of ifaces) { const on = visible(i); edgeEls.get(i.id).classList.toggle('off', !on); if (on) i.between.forEach((p) => used.add(p)); }
    for (const [id, g] of nodeEls) g.classList.toggle('off', view !== 'all' && !used.has(id));
    paint();
  }
  function cls(g, name, on) { g.setAttribute('class', (g.getAttribute('class') || '').split(' ').filter((c) => c && c !== name).concat(on ? [name] : []).join(' ')); }
  function paint() {
    for (const g of [...nodeEls.values(), ...edgeEls.values()]) cls(g, 'hl', false);
    svg.setAttribute('class', 'sysfig' + (sel ? ' has-sel' : ''));
    if (!sel) return;
    const parts = new Set(), eds = new Set();
    if (sel.k === 'iface') {
      const i = ifaces.find((x) => x.id === sel.i);
      if (i) { eds.add(i.id); i.between.forEach((p) => parts.add(p)); }
    } else {
      const own = sel.k === 'part' ? descend(sel.i) : null;
      if (own) own.forEach((p) => parts.add(p));
      const rel = api.related ? api.related(sel) : null;
      if (rel && rel.part) for (const p of rel.part) descend(p).forEach((q) => parts.add(q));
      for (const i of ifaces) {
        const [a, b] = i.between;
        if (own ? (own.has(a) || own.has(b)) : (parts.has(a) && parts.has(b))) { eds.add(i.id); parts.add(a); parts.add(b); }
      }
    }
    for (const p of parts) if (nodeEls.has(p)) cls(nodeEls.get(p), 'hl', true);
    for (const e of eds) cls(edgeEls.get(e), 'hl', true);
  }
  // the toggle above rewrites class on the groups; keep 'off' separate through classList
  return {
    el,
    enter(params) { setView((params && params.v) || view); },
    leave() {},
    highlight(next) {
      sel = next && next.k ? next : null; paint();
      if (sel && next.reveal) {
        const t = sel.k === 'iface' ? edgeEls.get(sel.i) : nodeEls.get(sel.i);
        if (t && t.scrollIntoView) t.scrollIntoView({ block: 'nearest', inline: 'center', behavior: 'smooth' });
      }
    },
    params() { return view === 'power' ? {} : { v: view }; },
  };
}
