// 運用フロー / 状態遷移図: procedures as columns of steps, and the state machine.
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

// Drawing-only constants.
export const ILLUSTRATIVE = {
  colW: 236, colGap: 24, fontPx: 12, lineH: 15, tagH: 18,
  groupJa: { setup: '構成', run: '走行' },
  // state centres (x, y) in the fixed arrangement; group rectangles below
  stateXY: {
    stored: [150, 160], transport: [430, 75], summer: [430, 240], winter: [880, 160],
    checked: [150, 410], idle: [410, 410], slipping: [700, 410], driving: [1020, 410],
    stopped: [150, 570], braking: [700, 570],
  },
  groupRect: { setup: [10, 10, 1100, 290], run: [10, 320, 1100, 320] },
  stateW: 190, VBW: 1120, VBH: 650,
};
const CSS = `
#mode-ops .tb{display:flex;flex-wrap:wrap;gap:6px 14px;align-items:center;margin-bottom:8px}
#mode-ops .scroll{overflow-x:auto;border:1px solid var(--line,#d9dbd5);border-radius:8px;background:var(--card,#fff)}
#mode-ops svg{display:block}
#mode-ops .box{fill:var(--card,#fff);stroke:var(--mut,#5f6670);stroke-width:1.2}
#mode-ops .st .box{fill:var(--neubg,#e7e8e4)}
#mode-ops .st.run .box{fill:var(--infobg,#dce8fa);stroke:var(--info,#1f5fbf)}
#mode-ops .st.setup .box{fill:var(--okbg,#dff3e4);stroke:var(--ok,#1d7a3a)}
#mode-ops .click{cursor:pointer}
#mode-ops .click:hover .box{stroke-width:2.6}
#mode-ops .sid{font-size:11px;font-weight:700;fill:var(--acc,#1f5fbf)}
#mode-ops text{font-size:12px}
#mode-ops .colh .box{fill:var(--neubg,#e7e8e4)}
#mode-ops .colh text{font-weight:700}
#mode-ops .tag rect{stroke-width:1}
#mode-ops .tag text{font-size:10.5px;text-anchor:middle}
#mode-ops .tag.haz rect{fill:var(--badbg,#f8d9d5);stroke:var(--bad,#a8261c)}#mode-ops .tag.haz text{fill:var(--bad,#a8261c)}
#mode-ops .tag.val rect{fill:var(--neubg,#e7e8e4);stroke:var(--line,#d9dbd5)}
#mode-ops .tag.ref rect{fill:var(--card,#fff);stroke:var(--mut,#5f6670)}
#mode-ops .tag:hover rect{stroke-width:2}
#mode-ops .arr{stroke:var(--mut,#5f6670);stroke-width:1.6;fill:none}
#mode-ops .ah{fill:var(--mut,#5f6670)}
#mode-ops .grp{fill:none;stroke:var(--line,#d9dbd5);stroke-width:1.5;stroke-dasharray:6 4}
#mode-ops .grplabel{font-weight:700;font-size:14px;fill:var(--mut,#5f6670)}
#mode-ops .tr .ln{fill:none;stroke:var(--mut,#5f6670);stroke-width:1.6}
#mode-ops .tr .hit{fill:none;stroke:transparent;stroke-width:12}
#mode-ops .tr.click:hover .ln{stroke-width:3}
#mode-ops .tr text{font-size:10.5px;text-anchor:middle;paint-order:stroke;stroke:var(--card,#fff);stroke-width:3.5px;fill:var(--fg,#1c1f23)}
#mode-ops .tr.ref text{fill:var(--acc,#1f5fbf)}
#mode-ops .has-sel .it:not(.hl){opacity:.22}
#mode-ops .it.hl .box{fill:var(--sel,#fff3c4);stroke-width:2.6}
#mode-ops .tr.hl .ln{stroke:var(--acc,#1f5fbf);stroke-width:3.2}
#mode-ops .tag.hl rect{stroke-width:2.6}
`;

export default function create(api) {
  const rec = api.record, I = ILLUSTRATIVE;
  const el = h('div', { id: 'mode-ops' }, h('style', {}, CSS));
  let view = 'flow', sel = null;
  const bar = h('div', { class: 'tb' });
  const btns = {};
  for (const [v, label] of [['flow', '運用フロー'], ['state', '状態遷移図']]) {
    btns[v] = h('button', { type: 'button', onclick: () => { setView(v); try { api.goto('ops', { v }); } catch (e) { /* shell not ready */ } } }, label);
    bar.append(btns[v]);
  }
  const scroll = h('div', { class: 'scroll' });
  el.append(bar, scroll);

  // text measuring and wrapping
  const ctx = document.createElement('canvas').getContext('2d');
  const FONT = (px, bold) => `${bold ? '600 ' : ''}${px}px system-ui, sans-serif`;
  const width = (t, px = I.fontPx, bold) => { ctx.font = FONT(px, bold); return ctx.measureText(t).width; };
  function wrap(text, maxW, px = I.fontPx, bold) {
    const words = String(text).split(/(\s+)/), lines = [];
    let cur = '';
    for (const w of words) {
      if (width(cur + w, px, bold) > maxW && cur.trim()) { lines.push(cur.trim()); cur = w.trimStart(); } else cur += w;
    }
    if (cur.trim()) lines.push(cur.trim());
    return lines.length ? lines : [''];
  }
  const kindOfRef = (r) => (/^R-/.test(r) ? 'req' : /^OP-/.test(r) ? 'proc' : /^H-/.test(r) ? 'haz' : 'value');
  const refText = (r) => (kindOfRef(r) === 'value' ? r.split('.').pop() : r);

  // items to light: {el, test(sel, rel)}
  let lit = [];
  function tagRow(g, tags, x, y, maxW) {
    // tags: [{text, cls, kind, id, title}] laid out in rows; returns used height
    let cx = x, cy = y;
    for (const t of tags) {
      const w = Math.min(maxW, width(t.text, 10.5) + 14);
      if (cx + w > x + maxW && cx > x) { cx = x; cy += I.tagH + 3; }
      const tg = s('g', { class: 'tag click ' + t.cls, onclick: (ev) => { ev.stopPropagation(); api.select(t.kind, t.id); } },
        s('title', {}, t.title || t.text), s('rect', { x: cx, y: cy, width: w, height: I.tagH, rx: 9 }), s('text', { x: cx + w / 2, y: cy + 13 }, t.text));
      g.append(tg); lit.push({ el: tg, kind: t.kind, id: t.id });
      cx += w + 4;
    }
    return tags.length ? cy + I.tagH - y : 0;
  }

  function drawFlow() {
    lit = [];
    const cols = rec.procedures, W = I.colW;
    const svg = s('svg', { viewBox: `0 0 ${10 + cols.length * (W + I.colGap)} 10`, role: 'img', 'aria-label': '運用フロー' });
    const defs = s('defs', {}, s('marker', { id: 'opsah', viewBox: '0 0 10 10', refX: 9, refY: 5, markerWidth: 10, markerHeight: 10, markerUnits: 'userSpaceOnUse', orient: 'auto' }, s('path', { d: 'M0,0 L10,5 L0,10 z', class: 'ah' })));
    svg.append(defs);
    let maxY = 0;
    cols.forEach((p, c) => {
      const x = 10 + c * (W + I.colGap);
      const tl = wrap(p.title, W - 16, 13, true);
      const hh = 26 + tl.length * 16;
      const hg = s('g', { class: 'it click colh', onclick: () => api.select('proc', p.id) }, s('title', {}, p.id + ' ' + p.title),
        s('rect', { class: 'box', x, y: 10, width: W, height: hh, rx: 8 }), s('text', { class: 'sid', x: x + 8, y: 27 }, p.id),
        ...tl.map((t, i) => s('text', { x: x + 8, y: 44 + i * 16, style: 'font-size:13px;font-weight:600' }, t)));
      svg.append(hg); lit.push({ el: hg, kind: 'proc', id: p.id, head: true });
      let y = 10 + hh + 20, prev = null;
      for (const st of p.steps) {
        const lines = wrap(st.action, W - 16);
        const tags = [];
        for (const hz of st.controls || []) tags.push({ text: hz, cls: 'haz', kind: 'haz', id: hz, title: ((rec.hazards.find((q) => q.id === hz) || {}).text) || hz });
        for (const v of st.values || []) {
          let txt; try { txt = api.valueText(v); } catch (e) { txt = v; }
          tags.push({ text: ((st.limits || []).includes(v) ? '上限 ' : '') + txt, cls: 'val', kind: 'value', id: v, title: v });
        }
        const g = s('g', { class: 'it click', onclick: () => api.select('proc', st.id), 'data-i': st.id });
        const tagBox = s('g'); // measured after
        const th = tagRow(tagBox, tags, x + 8, y + 22 + lines.length * I.lineH + 4, W - 16);
        const bh = 22 + lines.length * I.lineH + (tags.length ? th + 8 : 0) + 6;
        g.append(s('title', {}, st.id + ': ' + st.action), s('rect', { class: 'box', x, y, width: W, height: bh, rx: 8 }), s('text', { class: 'sid', x: x + 8, y: y + 16 }, st.id),
          ...lines.map((t, i) => s('text', { x: x + 8, y: y + 32 + i * I.lineH }, t)));
        g.append(tagBox); svg.append(g);
        lit.push({ el: g, kind: 'proc', id: st.id, step: st });
        if (prev != null) svg.append(s('path', { class: 'arr', d: `M${x + W / 2},${prev} L${x + W / 2},${y - 1}`, 'marker-end': 'url(#opsah)' }));
        prev = y + bh; y += bh + 20;
      }
      maxY = Math.max(maxY, y);
    });
    svg.setAttribute('viewBox', `0 0 ${10 + cols.length * (W + I.colGap)} ${maxY + 4}`);
    svg.setAttribute('width', 10 + cols.length * (W + I.colGap)); svg.style.maxWidth = 'none';
    return svg;
  }

  function drawState() {
    lit = [];
    const S = rec.states, svg = s('svg', { viewBox: `0 0 ${I.VBW} ${I.VBH}`, role: 'img', 'aria-label': '状態遷移図' });
    svg.append(s('defs', {}, s('marker', { id: 'opsah', viewBox: '0 0 10 10', refX: 9, refY: 5, markerWidth: 10, markerHeight: 10, markerUnits: 'userSpaceOnUse', orient: 'auto' }, s('path', { d: 'M0,0 L10,5 L0,10 z', class: 'ah' }))));
    for (const g of S.groups) {
      const r = I.groupRect[g.id]; if (!r) continue;
      svg.append(s('rect', { class: 'grp', x: r[0], y: r[1], width: r[2], height: r[3], rx: 12 }), s('text', { class: 'grplabel', x: r[0] + 12, y: r[1] + 22 }, I.groupJa[g.id] || g.label));
    }
    const box = new Map();
    for (const st of S.states) {
      const [cx, cy] = I.stateXY[st.id] || [100, 100], W = I.stateW;
      const lines = wrap(st.label, W - 16);
      const tags = (st.refs || []).map((r) => ({ text: refText(r), cls: 'ref', kind: kindOfRef(r), id: r, title: r }));
      const tg = s('g'), tagH = tags.length ? 22 : 0;
      const hh = 14 + lines.length * I.lineH + tagH + 6;
      const x = cx - W / 2, y = cy - hh / 2;
      // tags centred row
      if (tags.length) { const tw = tags.reduce((a, t) => a + width(t.text, 10.5) + 18, 0); tagRow(tg, tags, cx - Math.min(tw, W - 16) / 2, y + 8 + lines.length * I.lineH + 2, W - 16); }
      const first = (st.refs || [])[0];
      const g = s('g', { class: `it st ${st.group}` + (first ? ' click' : ''), 'data-i': st.id, onclick: first ? () => api.select(kindOfRef(first), first) : null },
        s('title', {}, st.id + ': ' + st.label), s('rect', { class: 'box', x, y, width: W, height: hh, rx: 16 }),
        ...lines.map((t, i) => s('text', { x: cx, y: y + 20 + i * I.lineH, style: 'text-anchor:middle' }, t)));
      box.set(st.id, { x, y, w: W, h: hh, cx, cy });
      g.append(tg); svg.append(g);
      lit.push({ el: g, refs: st.refs || [], state: st.id });
    }
    const pairs = new Set(S.transitions.map((t) => t.from + '>' + t.to));
    const anchor = (b, tx, ty) => {
      const dx = tx - b.cx, dy = ty - b.cy;
      const t = Math.min(dx ? (b.w / 2) / Math.abs(dx) : 1e9, dy ? (b.h / 2) / Math.abs(dy) : 1e9);
      return { x: b.cx + dx * t, y: b.cy + dy * t };
    };
    const special = { 'stopped>stored': { ctrl: [-25, 365] } };
    const lblD = { 'stopped>stored': [58, -22] };
    const lblT = { 'driving>stopped': 0.2, 'slipping>stopped': 0.3, 'braking>idle': 0.35, 'transport>summer': 0.78, 'stored>winter': 0.8, 'summer>winter': 0.4, 'winter>summer': 0.6, 'winter>checked': 0.45 };
    for (const t of S.transitions) {
      const a = box.get(t.from), b = box.get(t.to); if (!a || !b) continue;
      const key = t.from + '>' + t.to, sp = special[key];
      let p0, p2, ctrl;
      if (sp) {
        p0 = { x: a.x, y: a.cy }; p2 = { x: b.x, y: b.cy }; ctrl = { x: sp.ctrl[0], y: sp.ctrl[1] };
      } else {
        p0 = anchor(a, b.cx, b.cy); p2 = anchor(b, a.cx, a.cy);
        const dx = p2.x - p0.x, dy = p2.y - p0.y, len = Math.hypot(dx, dy) || 1;
        const bend = pairs.has(t.to + '>' + t.from) ? 30 : 0;
        ctrl = { x: (p0.x + p2.x) / 2 + (-dy / len) * bend * 2, y: (p0.y + p2.y) / 2 + (dx / len) * bend * 2 };
      }
      const f = lblT[key] ?? 0.5, u = 1 - f;
      const dd = lblD[key] || [0, 0];
      const lx = u * u * p0.x + 2 * u * f * ctrl.x + f * f * p2.x + dd[0], ly = u * u * p0.y + 2 * u * f * ctrl.y + f * f * p2.y + dd[1];
      const lines = wrap(t.trigger, 105, 10.5);
      const first = (t.refs || [])[0];
      const g = s('g', { class: 'it tr' + (first ? ' click ref' : ''), onclick: first ? () => api.select(kindOfRef(first), first) : null },
        s('title', {}, `${t.from} → ${t.to}: ${t.trigger}`),
        s('path', { class: 'hit', d: `M${p0.x},${p0.y} Q${ctrl.x},${ctrl.y} ${p2.x},${p2.y}` }),
        s('path', { class: 'ln', d: `M${p0.x},${p0.y} Q${ctrl.x},${ctrl.y} ${p2.x},${p2.y}`, 'marker-end': 'url(#opsah)' }),
        ...lines.map((l, i) => s('text', { x: lx, y: ly + 4 + (i - (lines.length - 1) / 2) * 12 }, l)));
      svg.append(g);
      lit.push({ el: g, refs: t.refs || [], tr: true });
    }
    svg.style.minWidth = '860px'; svg.style.width = '100%';
    return svg;
  }

  function setView(v) {
    view = v === 'state' ? 'state' : 'flow';
    for (const [id, b] of Object.entries(btns)) b.setAttribute('aria-pressed', id === view ? 'true' : 'false');
    scroll.replaceChildren(view === 'flow' ? drawFlow() : drawState());
    paint();
  }
  const cl = (e, name, on) => e.setAttribute('class', (e.getAttribute('class') || '').split(' ').filter((c) => c && c !== name).concat(on ? [name] : []).join(' '));
  function paint() {
    const svg = scroll.firstChild; if (!svg) return;
    const rel = sel && api.related ? api.related(sel) : null;
    const has = (set, x) => !!(set && set.has && set.has(x));
    let any = false;
    for (const it of lit) {
      let on = false;
      if (sel) {
        if (it.kind === 'proc') on = (sel.k === 'proc' && (sel.i === it.id || (it.step && sel.i === it.id.split('.')[0]) || (it.head && sel.i.startsWith(it.id + '.')))) || has(rel && rel.proc, it.id);
        else if (it.kind === 'haz') on = (sel.k === 'haz' && sel.i === it.id) || has(rel && rel.haz, it.id);
        else if (it.kind === 'req') on = (sel.k === 'req' && sel.i === it.id) || has(rel && rel.req, it.id);
        else if (it.kind === 'value') on = (sel.k === 'value' && sel.i === it.id) || has(rel && rel.value, it.id);
        else if (it.refs) on = it.refs.some((r) => {
          const k = kindOfRef(r);
          return (sel.k === k && sel.i === r) || (k === 'proc' && (has(rel && rel.proc, r) || sel.k === 'proc' && sel.i.startsWith(r + '.'))) || (k === 'req' && has(rel && rel.req, r)) || (k === 'haz' && has(rel && rel.haz, r)) || (k === 'value' && has(rel && rel.value, r));
        });
      }
      cl(it.el, 'hl', on);
      if (on) any = true;
    }
    // tags inherit dim from nothing; only top-level items are dimmed
    svg.setAttribute('class', sel && any ? 'has-sel' : '');
    if (sel && sel.reveal) { const t = lit.find((i) => i.id === sel.i && i.el); if (t && t.el.scrollIntoView) t.el.scrollIntoView({ block: 'nearest', inline: 'center', behavior: 'smooth' }); }
  }
  return {
    el,
    enter(params) { setView((params && params.v) || view); },
    leave() {},
    highlight(next) { sel = next && next.k ? next : null; paint(); },
    params() { return view === 'flow' ? {} : { v: 'state' }; },
  };
}
