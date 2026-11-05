// 3D: the viewer in an iframe (created once, kept alive when the tab is left), a Japanese toolbar, and,
// floating over the view's left, the parts as the system diagram groups them: tick to show or hide a
// part or a whole group, click a name to select it, point at a name to light it in the view.
import { viewForItem } from '../../viewer/parts.js';

const DEFAULTS = { config: 'summer', rider: 'adult', delica: false, dims: false, view: 'iso' };
const GROUPS = [
  ['構成', 'config', [['summer', '夏'], ['winter', '冬'], ['transport', '運搬'], ['water', '水（将来版）']]],
  ['乗る人', 'rider', [['adult', '大人'], ['child', '子ども'], ['none', 'なし']]],
  ['視点', 'view', [['iso', '斜め'], ['side', '横'], ['top', '上'], ['front', '前']]],
];
const URLKEY = { config: 'cfg', rider: 'rd', delica: 'dl', dims: 'dm', view: 'vw' };

export default function create(api) {
  const { h } = api;
  const parts = api.record.parts;
  const byId = new Map(parts.map((p) => [p.id, p]));
  const known = new Set(byId.keys());
  const st = { ...DEFAULTS };
  const hidden = new Set();
  let drawn = [];                       // [{id, name}] the parts the view draws, from kart3d:ready
  let frame = null, ready = false, curSel = null, active = false;
  const el = h('div', { class: 'm-v3d' });
  const bar = h('div', { class: 'controls tb3d' });
  const treeBody = h('div', { class: 'tb' });
  const tree = h('div', { class: 'tree3d' + (matchMedia('(max-width:760px)').matches ? ' closed' : '') },
    h('div', { class: 'th' },
      h('button', { type: 'button', class: 'fold', 'aria-label': '部品の一覧を開閉', onclick: () => tree.classList.toggle('closed') }, '部品'),
      h('button', { type: 'button', class: 'small', onclick: () => { hidden.clear(); afterHide(); } }, 'すべて表示')),
    treeBody);
  const stage = h('div', { class: 'stage3d' }, tree);
  el.append(bar, stage);

  const post = (o) => { if (frame && ready && frame.contentWindow) frame.contentWindow.postMessage(o, '*'); };
  const send = (o) => { Object.assign(st, o); paintBar(); if (ready) post({ type: 'kart3d:set', ...o }); api.syncUrl(); };

  function btn(key, val, text) {
    return h('button', { type: 'button', 'data-key': key, 'data-val': String(val), onclick: () => send({ [key]: val }) }, text);
  }
  for (const [lab, key, opts] of GROUPS) bar.append(h('span', { class: 'grp' }, lab + ' ', opts.map(([v, t]) => btn(key, v, t))));
  bar.append(h('span', { class: 'grp' },
    h('button', { type: 'button', 'data-key': 'delica', 'data-val': 'toggle', onclick: () => send({ delica: !st.delica }) }, 'デリカの荷室'),
    h('button', { type: 'button', 'data-key': 'dims', 'data-val': 'toggle', onclick: () => send({ dims: !st.dims }) }, '寸法')));
  function paintBar() {
    bar.querySelectorAll('button[data-key]').forEach((b) => {
      const key = b.dataset.key;
      const on = b.dataset.val === 'toggle' ? !!st[key] : String(st[key]) === b.dataset.val;
      b.setAttribute('aria-pressed', on ? 'true' : 'false');
    });
  }

  // ---- the parts tree: the drawn parts under their parents in the record, as the system diagram has them
  const kids = new Map();               // id -> [child ids], within the tree
  let roots = [];
  const drawnIds = () => new Set(drawn.map((d) => d.id));
  function under(id) {                  // the drawn parts at or below id
    const out = [], ds = drawnIds(), walk = (q) => { if (ds.has(q)) out.push(q); (kids.get(q) || []).forEach(walk); };
    walk(id);
    return out;
  }
  function buildTree() {
    const ds = drawnIds(), keep = new Set();
    for (const id of ds) {
      keep.add(id);
      for (let p = byId.get(id); p && p.parent && byId.has(p.parent) && !keep.has(p.parent); p = byId.get(p.parent)) keep.add(p.parent);
    }
    kids.clear(); roots = [];
    const order = [...parts.map((p) => p.id).filter((id) => keep.has(id)), ...[...ds].filter((id) => !known.has(id))];
    for (const id of order) {
      const par = byId.has(id) ? byId.get(id).parent : null;
      if (par && keep.has(par)) { if (!kids.has(par)) kids.set(par, []); kids.get(par).push(id); } else roots.push(id);
    }
    if (roots.length === 1 && kids.has(roots[0]) && !ds.has(roots[0])) roots = kids.get(roots[0]);   // skip the one root (the kart)
    const name = (id) => (drawn.find((d) => d.id === id) || {}).name || api.partName(id);
    const row = (id) => {
      const box = h('input', { type: 'checkbox', 'data-box': id, title: '表示する', onchange: (e) => {
        for (const q of under(id)) { if (e.target.checked) hidden.delete(q); else hidden.add(q); }
        afterHide();
      } });
      const nm = h('button', { type: 'button', class: 'nm', 'data-k': 'part', 'data-i': id, title: id,
        onclick: () => { if (known.has(id)) api.select('part', id); },
        onmouseenter: () => post({ type: 'kart3d:focus', parts: under(id) }),
        onmouseleave: () => sync(false, true) }, name(id));
      return h('div', { class: 'row' }, box, nm);
    };
    const node = (id, depth) => {
      if (!kids.has(id)) return row(id);
      return h('details', depth === 0 ? { open: true } : {}, h('summary', {}, row(id)),
        h('div', { class: 'kids' }, kids.get(id).map((q) => node(q, depth + 1))));
    };
    treeBody.replaceChildren(...roots.map((id) => node(id, 0)));
    paintBoxes();
    api.light(treeBody, curSel);
  }
  function paintBoxes() {
    treeBody.querySelectorAll('input[data-box]').forEach((b) => {
      const all = under(b.dataset.box), off = all.filter((q) => hidden.has(q)).length;
      b.checked = off === 0; b.indeterminate = off > 0 && off < all.length;
    });
  }
  function afterHide() { paintBoxes(); post({ type: 'kart3d:hide', parts: [...hidden] }); api.syncUrl(); }

  function ensureFrame() {
    if (frame) return;
    frame = h('iframe', { src: '../viewer/index.html?embed=1', title: '3D ビュー', allow: 'fullscreen' });
    stage.append(frame);
  }
  window.addEventListener('message', (ev) => {
    if (!frame || ev.source !== frame.contentWindow) return;
    const d = ev.data;
    if (!d || typeof d.type !== 'string') return;
    if (d.type === 'kart3d:ready') {
      ready = true;
      drawn = Array.isArray(d.parts) ? d.parts : [];
      buildTree();
      post({ type: 'kart3d:set', ...st });
      post({ type: 'kart3d:hide', parts: [...hidden] });
      sync(true);
    } else if (d.type === 'kart3d:pick') {
      if (d.part && known.has(d.part)) api.select('part', d.part);
    } else if (d.type === 'kart3d:state') {
      for (const k of Object.keys(DEFAULTS)) if (d[k] !== undefined) st[k] = d[k];
      paintBar(); api.syncUrl();
    }
  });

  // focus the parts of the selection, and set the view that shows the item best
  let lastKey = '';
  function sync(force, focusOnly) {
    if (!ready) return;
    const ps = curSel ? [...api.related(curSel).part] : [];
    post({ type: 'kart3d:focus', parts: ps });
    if (focusOnly) return;
    const key = curSel ? curSel.k + ':' + curSel.i : '';
    if (curSel && (force || key !== lastKey)) {
      const v = viewForItem(curSel.k, curSel.i);
      if (v) { Object.assign(st, v); paintBar(); post({ type: 'kart3d:set', ...v }); }
    }
    lastKey = key;
  }

  return {
    el,
    enter(params) {
      const any = Object.values(URLKEY).some((u) => params[u] !== undefined) || params.hd !== undefined;
      if (active || any) { Object.assign(st, DEFAULTS); hidden.clear(); }
      active = true;
      for (const [k, u] of Object.entries(URLKEY)) {
        const v = params[u];
        if (v === undefined) continue;
        st[k] = typeof DEFAULTS[k] === 'boolean' ? v === '1' : v;
      }
      for (const q of (params.hd || '').split(',').filter(Boolean)) hidden.add(q);
      paintBar();
      ensureFrame();
      if (ready) { post({ type: 'kart3d:set', ...st }); afterHide(); }
    },
    leave() { active = false; },
    highlight(sel) { curSel = sel; api.light(treeBody, sel); if (active) sync(false); },
    params() {
      const o = {};
      for (const [k, u] of Object.entries(URLKEY)) if (st[k] !== DEFAULTS[k]) o[u] = typeof st[k] === 'boolean' ? (st[k] ? '1' : '') : st[k];
      if (hidden.size) o.hd = [...hidden].sort().join(',');
      return o;
    },
  };
}
