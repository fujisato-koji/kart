import { buildIndex, scan, docsHref, asArray, REF_FIELDS, PROSE_FIELDS } from './relations.js';
import { makeParams } from '../viewer/params.js';
import { PARTS, partById, partsForKey, keysForPart, viewForItem } from '../viewer/parts.js';

const MODES = [
  ['overview', 'Overview'], ['requirements', 'Requirements'], ['3d', '3D'], ['hazards', 'Hazards'], ['decisions', 'Decisions'],
  ['open', 'Open items'], ['values', 'Values'], ['sources', 'Sources'], ['cost', 'Cost'],
];
const KIND_MODE = { req: 'requirements', dec: 'decisions', open: 'open', haz: 'hazards', check: 'overview', src: 'sources', value: 'values', part: '3d' };
const KIND_LABEL = { req: 'Requirements', dec: 'Decisions', open: 'Open items', haz: 'Hazards', check: 'Checks', src: 'Sources', value: 'Values', docs: 'Docs', part: 'Parts' };
const KIND_ORDER = ['part', 'req', 'haz', 'dec', 'open', 'check', 'src', 'value', 'docs'];
const STATUS_CLASS = {
  decided: 'info', sourced: 'ok', calculated: 'info', measured: 'ok', assumed: 'warn',
  confirmed: 'ok', awaiting: 'warn', withdrawn: 'neu', pass: 'ok', partial: 'warn', fail: 'bad',
};

let kindOf = () => null;
let record, idx, params, prov = {}, provRev = new Map();
let state = { m: 'overview', k: '', i: '' };
const filters = { vPrefix: '', vStatus: '', vQ: '', sClass: '', sRead: '', sQ: '' };

// ---------- small DOM helpers ----------
function h(tag, attrs, ...kids) {
  const e = document.createElement(tag);
  for (const [k, v] of Object.entries(attrs || {})) {
    if (v == null || v === false) continue;
    if (k === 'class') e.className = v;
    else if (k.startsWith('on')) e.addEventListener(k.slice(2), v);
    else e.setAttribute(k, v === true ? '' : v);
  }
  for (const c of kids.flat()) if (c != null && c !== false) e.append(c.nodeType ? c : document.createTextNode(String(c)));
  return e;
}
const $ = (s) => document.querySelector(s);
const fmt = (v) => (typeof v === 'number' ? v.toLocaleString('en-US', { maximumSignificantDigits: 10 }) : String(v));
const valText = (v) => `${fmt(v.v)}${v.unit ? ' ' + v.unit : ''}`;
const chip = (text, cls = '') => h('span', { class: 'chip ' + cls }, text);
const statusChip = (s) => chip(s, STATUS_CLASS[s] || '');

// ---------- URL ----------
function hashFor(s) {
  const p = new URLSearchParams();
  if (s.m && s.m !== 'overview') p.set('m', s.m);
  if (s.k && s.i) { p.set('k', s.k); p.set('i', s.i); }
  const q = p.toString();
  return '#/' + (q ? '?' + q : '');
}
function parseHash() {
  const q = location.hash.includes('?') ? location.hash.slice(location.hash.indexOf('?') + 1) : '';
  const p = new URLSearchParams(q);
  let m = p.get('m') || '';
  const k = p.get('k') || '', i = p.get('i') || '';
  const okSel = k && i && kindOf(i) === k;
  if (!MODES.some(([id]) => id === m)) m = okSel ? KIND_MODE[k] : 'overview';
  return { m, k: okSel ? k : '', i: okSel ? i : '' };
}
// href that selects ref; mode defaults to the kind's own mode
function hrefTo(ref, mode) {
  const k = kindOf(ref);
  return hashFor({ m: mode || (state.m === '3d' ? '3d' : KIND_MODE[k]) || state.m, k, i: ref });
}
function hrefMode(m) { return hashFor({ m, k: '', i: '' }); }

// ---------- reference rendering ----------
function brief(ref) {
  const it = idx.get(ref);
  if (!it) return '';
  const t = it.text || it.what || it.title || it.method || '';
  return t.length > 70 ? t.slice(0, 67) + '…' : t;
}
function refLink(ref, mode) {
  const k = kindOf(ref);
  if (k === 'docs') return h('a', { class: 'chip', href: docsHref(ref) }, ref.replace(/^docs\//, ''));
  if (!k) return chip(ref);
  if (k === 'part') return h('a', { class: 'chip part', href: hrefTo(ref, mode), 'data-ref': ref }, partById(ref).label);
  const it = idx.get(ref);
  const sup = idx.superseded.has(ref) ? 'sup' : '';
  const label = k === 'value' ? `${ref} = ${valText(it)}` : ref;
  return h('a', { class: `chip ${k === 'value' ? 'val' : ''} ${sup}`, href: hrefTo(ref, mode), 'data-ref': ref, title: brief(ref) }, label);
}
// prose with value keys as chips "key = value unit" and docs references as links
function rich(text, mode) {
  const box = document.createElement('span');
  for (const seg of scan(text, idx.valueKeys)) {
    if (seg.t === 'text') box.append(seg.s);
    else if (seg.t === 'key') box.append(refLink(seg.key, mode));
    else box.append(refLink(seg.ref));
  }
  return box;
}
const refs = (list, mode) => asArray(list).map((r) => refLink(r, mode));

// ---------- parts ----------
function mentionedKeys(r) {
  const out = new Set();
  for (const f of ['design_point', 'text', 'expected']) for (const seg of scan(r[f], idx.valueKeys)) if (seg.t === 'key') out.add(seg.key);
  return [...out];
}
function partsForItem(kind, id) {
  if (kind === 'part') return [id];
  if (kind === 'value') return partsForKey(id);
  if (kind === 'req') {
    const r = idx.get(id);
    const set = new Set(r ? mentionedKeys(r).flatMap((x) => partsForKey(x)) : []);
    return PARTS.map((p) => p.id).filter((x) => set.has(x));
  }
  return [];
}

// ---------- selection card ----------
function renderCard() {
  const card = $('#card');
  document.body.classList.toggle('hascard', !!state.i);
  document.querySelectorAll('.sel').forEach((e) => e.classList.remove('sel'));
  if (!state.i) { card.className = 'empty'; card.replaceChildren('Select an item to see its fields and relations.'); return; }
  document.querySelectorAll('[data-row]').forEach((e) => { if (e.dataset.row === state.i) e.classList.add('sel'); });
  card.className = '';
  const id = state.i, kind = state.k;
  const parts = [
    h('a', { id: 'closecard', href: hashFor({ m: state.m }), 'aria-label': 'Close (Esc)' }, 'Close ✕'),
    h('h2', {}, kind === 'value' ? id : kind === 'part' ? partById(id).label : `${id}${idx.superseded.has(id) ? ' (superseded)' : ''}`),
    h('div', { class: 'meta' }, KIND_LABEL[kind].replace(/s$/, '')),
  ];
  const show3d = (partsForItem(kind, id).length || viewForItem(kind, id))
    ? h('a', { class: 'btn', href: hashFor({ m: '3d', k: kind, i: id }) }, 'Show in 3D') : null;
  if (kind === 'part') {
    const keys = keysForPart(id, [...idx.valueKeys]);
    const reqs = record.requirements.filter((r) => mentionedKeys(r).some((x) => keys.includes(x)));
    parts.push(show3d,
      h('h3', {}, `Values (${keys.length})`), h('div', {}, keys.length ? keys.map((x) => refLink(x)) : h('span', { class: 'meta' }, 'none')),
      h('h3', {}, `Requirements (${reqs.length})`), h('div', {}, reqs.length ? reqs.map((r) => refLink(r.id)) : h('span', { class: 'meta' }, 'none')));
    card.replaceChildren(...parts.filter(Boolean));
    card.scrollTop = 0;
    return;
  }
  const it = idx.get(id);
  if (show3d) parts.push(show3d);
  const dl = h('dl');
  for (const [f, v] of Object.entries(it)) {
    if (f === 'id' || f === 'key' || REF_FIELDS.includes(f)) continue;
    let dd;
    if (f === 'url') dd = h('a', { href: v, target: '_blank', rel: 'noopener' }, v);
    else if (f === 'status') dd = statusChip(v);
    else if (f === 'result') dd = statusChip(v);
    else if (Array.isArray(v)) dd = h('span', {}, v.map((x) => (typeof x === 'string' ? chip(x) : chip(JSON.stringify(x)))));
    else if (PROSE_FIELDS.includes(f)) dd = rich(v);
    else dd = String(v);
    dl.append(h('dt', {}, f), h('dd', {}, dd));
  }
  parts.push(dl);
  if (kind === 'value' && provRev.has(id)) {
    parts.push(h('h3', {}, '3D simulator'), h('div', {}, provRev.get(id).map((p) => h('div', {}, 'used in 3D as ', h('code', {}, p)))));
  }
  const pl = partsForItem(kind, id);
  if (pl.length) parts.push(h('h3', {}, 'Parts'), h('div', {}, pl.map((x) => refLink(x))));
  const own = REF_FIELDS.filter((f) => it[f] != null).map((f) => [f, asArray(it[f])]);
  if (own.length) {
    parts.push(h('h3', {}, 'Reference fields'));
    for (const [f, l] of own) parts.push(h('div', {}, h('span', { class: 'meta' }, f + ': '), refs(l)));
  }
  const group = (list) => {
    const g = {};
    for (const r of list) (g[kindOf(r)] ||= []).push(r);
    return KIND_ORDER.filter((k) => g[k]).map((k) => h('div', {}, h('span', { class: 'meta' }, KIND_LABEL[k] + ': '), g[k].map((r) => refLink(r))));
  };
  const outs = idx.out.get(id) || [], ins = idx.inc.get(id) || [];
  parts.push(h('h3', {}, `References (${outs.length})`), ...(outs.length ? group(outs) : [h('div', { class: 'meta' }, 'none')]));
  parts.push(h('h3', {}, `Cited by (${ins.length})`), ...(ins.length ? group(ins) : [h('div', { class: 'meta' }, 'none')]));
  const docs = outs.filter((r) => kindOf(r) === 'docs');
  if (docs.length) parts.push(h('h3', {}, 'Docs'), h('div', {}, docs.map((r) => refLink(r))));
  card.replaceChildren(...parts);
  card.scrollTop = 0;
  const row = document.querySelector(`[data-row="${CSS.escape(state.i)}"]`);
  if (row && row.scrollIntoView) row.scrollIntoView({ block: 'nearest' });
}

// ---------- modes ----------
const rowAttrs = (id, cls = '') => ({ 'data-row': id, class: cls });

function counts() {
  const rows = [['Requirements', record.requirements.length], ['Hazards', record.hazards.length], ['Decisions', record.decisions.length],
    ['Open items', record.open.length], ['Checks', record.checks.length], ['Values', record.values.length], ['Sources', record.sources.length]];
  return h('div', { class: 'panel' }, h('h2', {}, 'Counts'), rows.map(([n, c]) => chip(`${n}: ${c}`)),
    h('div', { class: 'meta' }, `Open items still open: ${record.open.filter((o) => !o.closed).length}. Requirements by status: ` +
      ['confirmed', 'awaiting', 'withdrawn'].map((s) => `${s} ${record.requirements.filter((r) => r.status === s).length}`).join(', ') + '.'));
}
function waitsOrder(a, b) { return (a === 'owner' ? 0 : 1) - (b === 'owner' ? 0 : 1) || a.localeCompare(b); }
function openGrouped(list, withAffects) {
  const g = {};
  for (const o of list) (g[o.waits_for] ||= []).push(o);
  return Object.keys(g).sort(waitsOrder).map((w) => h('div', { class: 'panel' }, h('h2', {}, `Waits for ${w} (${g[w].length})`),
    g[w].map((o) => h('div', rowAttrs(o.id, 'item' + (o.closed ? ' dim' : '')),
      h('a', { class: 'id', href: hrefTo(o.id, state.m) }, o.id), ' ', chip(o.kind), o.closed ? chip('closed ' + o.closed, 'neu') : null, ' ', rich(o.text, state.m),
      withAffects && o.affects?.length ? h('div', { class: 'meta' }, 'Affects: ', refs(o.affects, state.m)) : null,
      o.closed_by ? h('div', { class: 'meta' }, 'Closed by: ', refs(o.closed_by, state.m)) : null))));
}
function budgetPanel() {
  const b = idx.values.get('budget.parts_jpy');
  const totals = record.values.filter((v) => v.key.startsWith('cost.total_'));
  const panel = h('div', { class: 'panel' }, h('h2', {}, 'Budget against cost totals'));
  if (!b) { panel.append('No budget.parts_jpy in the record.'); return panel; }
  const max = Math.max(b.v, ...totals.map((t) => t.v));
  const row = (v, over) => h('tr', rowAttrs(v.key), h('td', {}, refLink(v.key, state.m)), h('td', { class: 'num' }, valText(v)),
    h('td', { style: 'width:40%' }, h('div', { class: 'bar' + (over ? ' over' : ''), style: `width:${Math.max(1, (v.v / max) * 100)}%` })),
    h('td', {}, over == null ? '' : over ? chip(`over by ${fmt(v.v - b.v)} ${b.unit}`, 'bad') : chip('within budget', 'ok')));
  panel.append(h('div', { class: 'tablewrap' }, h('table', {}, h('tbody', {}, row(b, null), totals.map((t) => row(t, t.v > b.v))))));
  return panel;
}
function overview() {
  const awaiting = record.requirements.filter((r) => r.status === 'awaiting');
  const checks = record.checks.filter((c) => c.result === 'partial' || c.result === 'fail');
  return h('div', {}, counts(),
    h('h2', {}, 'Open items'), ...openGrouped(record.open.filter((o) => !o.closed), true),
    h('div', { class: 'panel' }, h('h2', {}, `Requirements awaiting the owner (${awaiting.length})`),
      awaiting.length ? awaiting.map((r) => h('div', rowAttrs(r.id, 'item'), h('a', { class: 'id', href: hrefTo(r.id, state.m) }, r.id), ' ', r.text)) : 'None.'),
    h('div', { class: 'panel' }, h('h2', {}, `Checks with result partial or fail (${checks.length})`),
      checks.length ? checks.map((c) => h('div', rowAttrs(c.id, 'item'), h('a', { class: 'id', href: hrefTo(c.id, state.m) }, c.id), ' ', statusChip(c.result), ' ',
        chip(c.tier), h('div', { class: 'meta' }, `${c.by}, ${c.date}; targets: ${c.target.length}`))) : 'None.'),
    budgetPanel());
}
function requirements() {
  return h('div', {}, record.requirements.map((r) => h('div', rowAttrs(r.id, 'item'),
    h('a', { class: 'id', href: hrefTo(r.id, 'requirements') }, r.id), ' ', statusChip(r.status), chip('origin: ' + r.origin), chip('verify: ' + r.verify),
    r.parent ? h('span', {}, ' parent ', refs(r.parent, 'requirements')) : null,
    h('div', {}, r.text),
    h('div', { class: 'meta' }, 'Design point: ', rich(r.design_point, 'requirements')),
    r.expected ? h('div', { class: 'meta' }, 'Expected: ', rich(r.expected, 'requirements')) : null)));
}
function hazards() {
  return h('div', {}, record.hazards.map((x) => h('div', rowAttrs(x.id, 'item'),
    h('a', { class: 'id', href: hrefTo(x.id, 'hazards') }, x.id), ' ', x.phases.map((p) => chip(p)),
    h('div', {}, x.text), h('div', { class: 'meta' }, 'At risk: ' + x.at_risk),
    h('div', {}, 'Controlled by: ', x.controls.length ? x.controls.map((c) => h('div', {}, refLink(c, 'hazards'), ' ', brief(c))) : 'no requirement'))));
}
function decisions() {
  const list = [...record.decisions].sort((a, b) => b.date.localeCompare(a.date) || b.id.localeCompare(a.id));
  return h('div', {}, list.map((d) => h('div', rowAttrs(d.id, 'item' + (idx.superseded.has(d.id) ? ' dim' : '')),
    h('a', { class: 'id', href: hrefTo(d.id, 'decisions') }, d.id), ' ', chip(d.date), chip('by ' + d.by),
    idx.superseded.has(d.id) ? chip('superseded', 'warn') : null,
    h('div', {}, rich(d.what, 'decisions')),
    d.touches?.length ? h('div', { class: 'meta' }, 'Touches: ', refs(d.touches, 'decisions')) : null,
    d.supersedes ? h('div', { class: 'meta' }, 'Supersedes: ', refs(d.supersedes, 'decisions')) : null)));
}
function openItems() {
  const open = record.open.filter((o) => !o.closed), closed = record.open.filter((o) => o.closed);
  return h('div', {}, ...openGrouped(open, true), closed.length ? h('h2', {}, `Closed (${closed.length})`) : null, ...(closed.length ? openGrouped(closed, true) : []));
}
function select(name, label, opts, key) {
  return h('label', {}, label + ' ', h('select', { 'data-f': key, onchange: (e) => { filters[key] = e.target.value; refilter(); } },
    h('option', { value: '' }, 'all'), opts.map((o) => h('option', { value: o, selected: filters[key] === o }, o))));
}
function searchBox(key, ph) {
  return h('input', { id: 'q', type: 'search', placeholder: ph, value: filters[key], oninput: (e) => { filters[key] = e.target.value; refilter(); } });
}
function values() {
  const prefixes = [...new Set(record.values.map((v) => v.key.split('.')[0]))];
  const statuses = [...new Set(record.values.map((v) => v.status))];
  const body = h('tbody', { id: 'vbody' });
  const box = h('div', {}, h('div', { class: 'controls' }, select('p', 'Group', prefixes, 'vPrefix'), select('s', 'Status', statuses, 'vStatus'), searchBox('vQ', 'Search values ( / )'), h('span', { id: 'vcount', class: 'meta' })),
    h('div', { class: 'tablewrap' }, h('table', {}, h('thead', {}, h('tr', {}, ['Key', 'Value', 'Unit', 'Status', 'Basis'].map((t) => h('th', {}, t)))), body)));
  return box;
}
function fillValues() {
  const body = $('#vbody'); if (!body) return;
  const q = filters.vQ.toLowerCase();
  const list = record.values.filter((v) => (!filters.vPrefix || v.key.split('.')[0] === filters.vPrefix) && (!filters.vStatus || v.status === filters.vStatus) &&
    (!q || v.key.toLowerCase().includes(q) || String(v.unit || '').toLowerCase().includes(q) || String(v.v).toLowerCase().includes(q)));
  body.replaceChildren(...list.map((v) => h('tr', rowAttrs(v.key), h('td', {}, h('a', { href: hrefTo(v.key, 'values') }, v.key)), h('td', { class: 'num' }, fmt(v.v)),
    h('td', {}, v.unit || ''), h('td', {}, statusChip(v.status)), h('td', {}, refs(v.basis, 'values')))));
  $('#vcount').textContent = `${list.length} of ${record.values.length}`;
}
function sources() {
  const classes = [...new Set(record.sources.map((s) => s.class))].sort();
  const reads = [...new Set(record.sources.map((s) => s.read))];
  return h('div', {}, h('div', { class: 'controls' }, select('c', 'Class', classes, 'sClass'), select('r', 'Read', reads, 'sRead'), searchBox('sQ', 'Search sources ( / )'), h('span', { id: 'scount', class: 'meta' })),
    h('div', { class: 'tablewrap' }, h('table', {}, h('thead', {}, h('tr', {}, ['Id', 'Class', 'Title', 'Read', 'License', 'Retrieved'].map((t) => h('th', {}, t)))), h('tbody', { id: 'sbody' }))));
}
function fillSources() {
  const body = $('#sbody'); if (!body) return;
  const q = filters.sQ.toLowerCase();
  const list = record.sources.filter((s) => (!filters.sClass || s.class === filters.sClass) && (!filters.sRead || s.read === filters.sRead) &&
    (!q || (s.title + ' ' + s.id + ' ' + (s.note || '')).toLowerCase().includes(q)));
  body.replaceChildren(...list.map((s) => h('tr', rowAttrs(s.id), h('td', {}, h('a', { href: hrefTo(s.id, 'sources') }, s.id)), h('td', {}, s.class),
    h('td', {}, s.url ? h('a', { href: s.url, target: '_blank', rel: 'noopener' }, s.title) : s.title), h('td', {}, chip(s.read)), h('td', {}, s.license || ''), h('td', {}, s.retrieved || ''))));
  $('#scount').textContent = `${list.length} of ${record.sources.length}`;
}
function refilter() { fillValues(); fillSources(); renderCard(); }

function cost() {
  const b = idx.values.get('budget.parts_jpy');
  const order = (k) => (k.startsWith('cost.power_') ? 0 : k.startsWith('cost.winter_') ? 1 : k === 'cost.chassis_jpy' ? 2 : k.startsWith('cost.total_') ? 3 : 4);
  const list = record.values.filter((v) => v.key.startsWith('cost.') && v.status === 'calculated').sort((x, y) => order(x.key) - order(y.key) || x.key.localeCompare(y.key));
  const NS = 'http://www.w3.org/2000/svg';
  const el = (t, a, ...k) => { const e = document.createElementNS(NS, t); for (const [n, v] of Object.entries(a || {})) e.setAttribute(n, v); k.forEach((c) => e.append(c)); return e; };
  const W = 760, L = 240, R = 30, T = 36, rowH = 28, H = T + list.length * rowH + 40;
  const max = Math.max(b ? b.v : 0, ...list.map((v) => v.v)) * 1.08;
  const x = (v) => L + (v / max) * (W - L - R);
  const svg = el('svg', { viewBox: `0 0 ${W} ${H}`, role: 'img', 'aria-label': 'Calculated costs in JPY against the budget' });
  const step = 10 ** Math.floor(Math.log10(max)) / (max / 10 ** Math.floor(Math.log10(max)) < 3 ? 2 : 1);
  for (let t = 0; t <= max; t += step) {
    svg.append(el('line', { class: 'grid', x1: x(t), x2: x(t), y1: T - 6, y2: H - 30 }));
    const tx = el('text', { x: x(t), y: H - 14, 'text-anchor': 'middle' }); tx.textContent = fmt(t); svg.append(tx);
  }
  const unit = el('text', { x: W - R, y: H - 2, 'text-anchor': 'end' }); unit.textContent = 'JPY'; svg.append(unit);
  list.forEach((v, n) => {
    const y = T + n * rowH;
    const a = el('a', { href: hrefTo(v.key, 'cost'), 'data-ref': v.key });
    const lab = el('text', { x: L - 8, y: y + 15, 'text-anchor': 'end' }); lab.textContent = v.key.replace('cost.', '').replace('_jpy', '');
    const bar = el('rect', { class: 'bar' + (b && v.v > b.v ? ' over' : ''), x: L, y: y + 3, width: Math.max(1, x(v.v) - L), height: rowH - 8 });
    const val = el('text', { x: x(v.v) + 4, y: y + 15 }); val.textContent = fmt(v.v);
    const tt = el('title'); tt.textContent = `${v.key} = ${valText(v)}`;
    a.append(tt, lab, bar, val); svg.append(a);
  });
  if (b) {
    svg.append(el('line', { class: 'budget', x1: x(b.v), x2: x(b.v), y1: T - 10, y2: H - 30 }));
    const t = el('text', { x: x(b.v), y: 12, 'text-anchor': 'middle' }); t.textContent = `budget ${fmt(b.v)} JPY`; svg.append(t);
  }
  return h('div', { class: 'panel' }, h('h2', {}, 'Calculated costs (cost.*) against the budget'),
    h('div', { class: 'meta' }, 'Bars in red exceed budget.parts_jpy. Click a bar to select its value.'), svg);
}

// 3D pane: the iframe is created once and kept (hidden, never detached) when the tab is left
let pane3d = null, ready3d = false, pending3d = {}, tstate = {};
const SCENES = [['yard', 'Yard'], ['inspect', 'Inspect'], ['delica', 'Delica']];
const SETUPS = [['summer', 'Summer'], ['w1', 'W1'], ['w2', 'W2']];
const RIDERS = [['adult', 'Adult'], ['child', 'Child']];
function post(o) {
  if (!pane3d || !pane3d.frame.contentWindow) return;
  pane3d.frame.contentWindow.postMessage(o, '*');
}
function sendSet(o) {
  if (!ready3d) { Object.assign(pending3d, o); return; }
  post({ type: 'kart3d:set', ...o });
}
function ensure3d() {
  if (pane3d) return pane3d;
  const frame = h('iframe', { src: '../viewer/index.html?embed=1', title: '3D simulator' });
  const grp = (label, key, opts) => h('span', { class: 'grp' }, label + ' ',
    opts.map(([v, t]) => h('button', { type: 'button', 'data-set': key, 'data-v': v, onclick: () => sendSet({ [key]: v }) }, t)));
  const child = h('button', { type: 'button', 'data-set': 'child', 'data-v': 'toggle', onclick: () => sendSet({ child: !tstate.child }) }, 'Child limit');
  pane3d = document.getElementById('pane3d');
  pane3d.frame = frame;
  pane3d.replaceChildren(
    h('div', { class: 'controls tb3d' }, grp('Scene', 'scene', SCENES), grp('Setup', 'setup', SETUPS), grp('Rider', 'rider', RIDERS), child,
      h('span', { id: 'partbtns', class: 'grp' })),
    frame);
  syncToolbar();
  return pane3d;
}
function syncToolbar() {
  if (!pane3d) return;
  pane3d.querySelectorAll('button[data-set]').forEach((b) => {
    const key = b.dataset.set;
    const on = key === 'child' ? !!tstate.child : tstate[key] === b.dataset.v;
    b.setAttribute('aria-pressed', on ? 'true' : 'false');
  });
}
function fillPartButtons(list) {
  const box = document.getElementById('partbtns'); if (!box) return;
  box.replaceChildren('Parts ', ...list.map((x) => {
    const id = typeof x === 'string' ? x : x.id;
    const label = (typeof x === 'object' && x.label) || (partById(id) && partById(id).label) || id;
    return h('a', { class: 'btn small', href: hashFor({ m: '3d', k: 'part', i: id }), 'data-part': id, title: label }, label);
  }));
}
// Tell the viewer what is selected: the parts to light, and the view when in the 3D mode
function sync3d() {
  if (!pane3d || !ready3d) return;
  post({ type: 'kart3d:focus', parts: state.i ? partsForItem(state.k, state.i) : [] });
  if (state.m === '3d' && state.i) {
    const v = viewForItem(state.k, state.i);
    if (v) { const o = {}; if (v.scene) o.scene = v.scene; if (v.setup) o.setup = v.setup; post({ type: 'kart3d:set', ...o }); }
  }
}

const MODE_FN = { overview, requirements, hazards, decisions, open: openItems, values, sources, cost };
let shownMode = null;
function renderMode() {
  const view = $('#content');
  document.body.classList.toggle('m3d', state.m === '3d');
  $('#pane3d').hidden = state.m !== '3d';
  view.hidden = state.m === '3d';
  document.querySelectorAll('#tabs a').forEach((a) => (a.dataset.m === state.m ? a.setAttribute('aria-current', 'page') : a.removeAttribute('aria-current')));
  if (shownMode === state.m && state.m !== 'overview') return;
  shownMode = state.m;
  if (state.m === '3d') { ensure3d(); return; }
  view.replaceChildren(MODE_FN[state.m]());
  fillValues(); fillSources();
}

function apply() {
  const next = parseHash();
  const modeChanged = next.m !== state.m;
  state = next;
  if (modeChanged || shownMode !== state.m) renderMode(); else if (state.m === 'overview') renderMode();
  renderCard();
  $('#link3d').setAttribute('href', hashFor({ m: '3d', k: state.k, i: state.i }));
  sync3d();
}

// ---------- boot ----------
function initTheme() {
  const root = document.documentElement;
  try { const t = localStorage.getItem('kart-theme'); if (t) root.dataset.theme = t; } catch (e) { /* ignore */ }
  $('#theme').addEventListener('click', () => {
    const dark = root.dataset.theme ? root.dataset.theme === 'dark' : matchMedia('(prefers-color-scheme: dark)').matches;
    root.dataset.theme = dark ? 'light' : 'dark';
    try { localStorage.setItem('kart-theme', root.dataset.theme); } catch (e) { /* ignore */ }
  });
}

async function boot() {
  initTheme();
  $('#tabs').replaceChildren(...MODES.map(([id, label]) => h('a', { href: hrefModeStatic(id), 'data-m': id }, label)));
  try {
    const res = await fetch('../data/record.json');
    if (!res.ok) throw new Error(`record.json: ${res.status}`);
    record = await res.json();
  } catch (e) { $('#content').replaceChildren(h('p', {}, 'Cannot load the record: ' + e.message)); return; }
  idx = buildIndex(record);
  kindOf = (ref) => (partById(ref) ? 'part' : idx.kindOf(ref));
  try { params = makeParams(record); prov = params.prov; } catch (e) { prov = {}; console.warn('makeParams failed', e); }
  for (const [path, key] of Object.entries(prov)) { if (!provRev.has(key)) provRev.set(key, []); provRev.get(key).push(path); }
  $('#tabs').replaceChildren(...MODES.map(([id, label]) => h('a', { href: hrefMode(id), 'data-m': id }, label)));
  window.addEventListener('hashchange', apply);
  window.addEventListener('message', onMessage);
  document.addEventListener('keydown', onKey);
  apply();
}
function hrefModeStatic(id) { return '#/?m=' + id; }

function onMessage(ev) {
  if (!pane3d || ev.source !== pane3d.frame.contentWindow) return;
  const d = ev.data;
  if (!d || typeof d.type !== 'string') return;
  if (d.type === 'kart3d:ready') {
    ready3d = true;
    fillPartButtons(Array.isArray(d.parts) ? d.parts : PARTS);
    if (Object.keys(pending3d).length) { post({ type: 'kart3d:set', ...pending3d }); pending3d = {}; }
    sync3d();
  } else if (d.type === 'kart3d:state') {
    tstate = { scene: d.scene, setup: d.setup, rider: d.rider, child: !!d.child };
    syncToolbar();
  } else if (d.type === 'kart3d:pick') {
    const ref = d.part || d.key || d.id;
    const k = ref && kindOf(ref);
    if (k && k !== 'docs') location.hash = hashFor({ m: '3d', k, i: ref });
  }
}
function onKey(e) {
  const t = e.target, typing = t && (t.tagName === 'INPUT' || t.tagName === 'SELECT' || t.tagName === 'TEXTAREA');
  if (e.key === 'Escape') {
    if (typing) t.blur();
    if (state.i) location.hash = hashFor({ m: state.m });
  } else if (e.key === '/' && !typing && !e.ctrlKey && !e.metaKey && !e.altKey) {
    e.preventDefault();
    const focus = () => { const q = $('#q'); if (q) { q.focus(); q.select(); return true; } return false; };
    if (!focus()) { location.hash = hashFor({ m: 'values' }); setTimeout(focus, 0); }
  }
}

boot();
