// 3D: the viewer in an iframe (created once, kept alive when the tab is left), a Japanese toolbar, and the parts list.
import { viewForItem } from '../../viewer/parts.js';

const DEFAULTS = { config: 'summer', rider: 'adult', delica: false, dims: false, view: 'iso' };
const GROUPS = [
  ['構成', 'config', [['summer', '夏'], ['winter', '冬（スノーモービル型）'], ['transport', '運搬'], ['water', '水（将来版）']]],
  ['乗る人', 'rider', [['adult', '大人'], ['child', '子ども'], ['none', 'なし']]],
  ['視点', 'view', [['iso', '斜め'], ['side', '横'], ['top', '上'], ['front', '前']]],
];
const URLKEY = { config: 'cfg', rider: 'rd', delica: 'dl', dims: 'dm', view: 'vw' };

export default function create(api) {
  const { h } = api;
  const known = new Set(api.record.parts.map((p) => p.id));
  const st = { ...DEFAULTS };
  let frame = null, ready = false, curSel = null, active = false;
  const el = h('div', { class: 'm-v3d' });
  const bar = h('div', { class: 'controls tb3d' });
  const partBox = h('span', { class: 'grp', id: 'partbtns' });
  const stage = h('div', { class: 'stage3d' });
  el.append(bar, stage);

  const post = (o) => { if (frame && ready && frame.contentWindow) frame.contentWindow.postMessage(o, '*'); };
  const send = (o) => { Object.assign(st, o); paintBar(); if (ready) post({ type: 'kart3d:set', ...o }); api.syncUrl(); };

  function btn(key, val, text) {
    return h('button', { type: 'button', 'data-key': key, 'data-val': String(val), onclick: () => send({ [key]: val }) }, text);
  }
  for (const [lab, key, opts] of GROUPS) bar.append(h('span', { class: 'grp' }, lab + ' ', opts.map(([v, t]) => btn(key, v, t))));
  bar.append(
    h('span', { class: 'grp' }, h('button', { type: 'button', 'data-key': 'delica', 'data-val': 'toggle', onclick: () => send({ delica: !st.delica }) }, 'デリカの荷室'),
      h('button', { type: 'button', 'data-key': 'dims', 'data-val': 'toggle', onclick: () => send({ dims: !st.dims }) }, '寸法')),
    h('span', { class: 'grp' }, '部品 ', partBox));
  function paintBar() {
    bar.querySelectorAll('button[data-key]').forEach((b) => {
      const key = b.dataset.key;
      const on = b.dataset.val === 'toggle' ? !!st[key] : String(st[key]) === b.dataset.val;
      b.setAttribute('aria-pressed', on ? 'true' : 'false');
    });
  }
  function fillParts(list) {
    partBox.replaceChildren(...list.map((x) => {
      const id = typeof x === 'string' ? x : x.id;
      const name = (typeof x === 'object' && x.name) || api.partName(id);
      return h('button', { type: 'button', class: 'small partbtn', 'data-k': 'part', 'data-i': id, title: id, onclick: () => { if (known.has(id)) api.select('part', id); } }, name);
    }));
    api.light(partBox, curSel);
  }

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
      fillParts(Array.isArray(d.parts) ? d.parts : []);
      post({ type: 'kart3d:set', ...st });
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
  function sync(force) {
    if (!ready) return;
    const parts = curSel ? [...api.related(curSel).part] : [];
    post({ type: 'kart3d:focus', parts });
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
      const any = Object.values(URLKEY).some((u) => params[u] !== undefined);
      if (active || any) Object.assign(st, DEFAULTS);
      active = true;
      for (const [k, u] of Object.entries(URLKEY)) {
        const v = params[u];
        if (v === undefined) continue;
        st[k] = typeof DEFAULTS[k] === 'boolean' ? v === '1' : v;
      }
      paintBar();
      ensureFrame();
      if (ready) post({ type: 'kart3d:set', ...st });
    },
    leave() { active = false; },
    highlight(sel) { curSel = sel; api.light(partBox, sel); if (active) sync(false); },
    params() {
      const o = {};
      for (const [k, u] of Object.entries(URLKEY)) if (st[k] !== DEFAULTS[k]) o[u] = typeof st[k] === 'boolean' ? (st[k] ? '1' : '') : st[k];
      return o;
    },
  };
}
