// Kart design navigator: the shell. Modes live in modes/<id>.js and are loaded by dynamic import.
import { buildIndex, scan, docsHref, asArray, REF_FIELDS, PROSE_FIELDS, makeRelated, computeSchedule } from './relations.js';
import * as PK from '../viewer/parts.js';

const MODES = [
  ['req', '要求'], ['sys', '系統図'], ['ops', '運用フロー/状態遷移図'], ['design', '設計'], ['dwg', '図面'],
  ['haz', 'ハザード解析'], ['v3d', '3D'], ['proc', '調達部品リスト'], ['plan', '開発日程計画'],
];
const BUTTON_JA = { req: '要求で見る', sys: '系統図で見る', ops: '運用フローで見る', design: '設計で見る', dwg: '図面で見る', haz: 'ハザード解析で見る', v3d: '3D で見る', proc: '調達部品リストで見る', plan: '開発日程計画で見る' };
const KIND_MODES = {
  req: ['req', 'haz', 'design', 'v3d', 'plan', 'ops'], haz: ['haz', 'req', 'ops'], part: ['v3d', 'sys', 'dwg', 'proc', 'plan', 'req'],
  value: ['design', 'v3d', 'dwg', 'req'], proc: ['ops', 'haz'], task: ['plan', 'proc'], bom: ['proc', 'v3d', 'plan'], iface: ['sys', 'dwg'],
  dec: ['req'], open: ['design', 'req'], src: ['req'], check: ['req'],
};
const KIND_DEFAULT = {
  req: ['req'], haz: ['haz'], part: ['v3d', 'sys', 'dwg'], proc: ['ops', 'haz'], task: ['plan', 'proc'], bom: ['proc', 'plan'],
  value: ['design', 'v3d'], dec: ['req'], open: ['req', 'design'], src: ['req'], check: ['req'], iface: ['sys', 'dwg'],
};
export const KIND_JA = { req: '要求', dec: '決定', open: '未決事項', haz: 'ハザード', check: '検査', src: '出典', value: '値', part: '部品', proc: '手順', task: '日程の作業', bom: '部品リストの品', iface: '接続', docs: '文書' };
export const STATUS_JA = {
  confirmed: '確定', awaiting: '確認待ち', withdrawn: '取り下げ', pass: '合格', partial: '一部', fail: '不合格',
  decided: '決定', sourced: '出典あり', calculated: '計算', measured: '実測', assumed: '仮定',
};
export const VERIFY_JA = { test: '試験', analysis: '解析', demonstration: '実演', inspection: '検査' };
const PHASE_JA = { operate: '運転', build: '製作', design: '設計', procure: '調達', test: '試験' };
const ORIGIN_JA = { owner: '施主', assistant: 'アシスタント', derived: '派生' };
const CARRIES_JA = { power: '動力', load: '荷重', signal: '信号', other: 'その他' };
const SRC_CLASS_JA = { P: '一次資料 (P)', S: '二次資料 (S)', M: '販売頁 (M)', F: '掲示板 (F)' };
const READ_JA = { full: '全文', partial: '一部', excerpt: '抜粋', abstract: '要旨', archived: '保存版', not_read: '未読' };
const OPEN_KIND_JA = { question: '問い', finding: '所見' };
const BLOCKS_JA = { design_build: '設計から製作への関門' };
const METHOD_JA = { refute: '反証' };
const TASK_KIND_JA = { wait: '待ち（暦日）', work: '作業' };
const GROUP_JA = { tools: '道具', parts: '部品' };
const UNIT_JA = { JPY: '円', 'JPY/m': '円/m' };
export const unitJa = (u) => (u ? ' ' + (UNIT_JA[u] || u) : '');
const STATUS_CLASS = { decided: 'info', sourced: 'ok', calculated: 'info', measured: 'ok', assumed: 'warn', confirmed: 'ok', awaiting: 'warn', withdrawn: 'neu', pass: 'ok', partial: 'warn', fail: 'bad' };
const KIND_ORDER = ['part', 'req', 'haz', 'proc', 'task', 'dec', 'open', 'check', 'src', 'value', 'iface', 'docs'];
const FIELD_JA = { id: 'ID', v: '値', name: '名前', between: 'つなぐ部品', carries: '伝えるもの', steps: '手順', procedure: '手順', action: '操作', values: '値', limits: '限界', item: '品', part: '部品', parts: '部品', reqs: '要求', price: '単価', need: '届く作業', group: '区分', qty: '数量', after: '前の作業', days: '日数', start: '期間', raised_by: '起票した人', options: '選択肢', unit: '単位', text: '文', status: '状態', origin: '起源', verify: '検証', design_point: '設計点', expected: '期待値', parent: '上位', basis: '根拠', date: '日付', by: '決めた人', what: '内容', touches: '関わるもの', supersedes: '置き換える決定', kind: '種別', waits_for: '待つ相手', affects: '影響するもの', opened: '起票日', phase: '段階', phases: '段階', blocks: '塞ぐ関門', closed: '解決日', closed_by: '解決した決定', at_risk: '危険にさらされる人', controls: '管理策', target: '対象の値', tier: '階層', method: '方法', result: '結果', detail: '詳細', class: '種類', title: '題名', url: 'URL', retrieved: '取得日', license: 'ライセンス', read: '読んだ範囲', note: '注記' };

let record, idx, relatedFn, schedule;
let state = { m: '', k: '', i: '', p: {} };
const loaded = new Map(); // id -> {inst, wrap}
let active = null, noReveal = false;

// ---------- DOM helpers ----------
export function h(tag, attrs, ...kids) {
  const e = document.createElement(tag);
  for (const [k, v] of Object.entries(attrs || {})) {
    if (v == null || v === false) continue;
    if (k === 'class') e.className = v;
    else if (k.startsWith('on')) e.addEventListener(k.slice(2), v);
    else e.setAttribute(k, v === true ? '' : v);
  }
  for (const c of kids.flat(Infinity)) if (c != null && c !== false) e.append(c.nodeType ? c : document.createTextNode(String(c)));
  return e;
}
const $ = (s) => document.querySelector(s);
const fmt = (v) => (typeof v === 'number' ? v.toLocaleString('ja-JP', { maximumSignificantDigits: 10 }) : String(v));
const chip = (text, cls = '', title) => h('span', { class: 'chip ' + cls, title }, text);
const statusChip = (s) => chip(STATUS_JA[s] || s, STATUS_CLASS[s] || '');
const short = (t, n) => { t = String(t ?? ''); return t.length > n ? t.slice(0, n - 1) + '…' : t; };

// ---------- URL ----------
function hashFor(m, k, i, extra) {
  const p = new URLSearchParams();
  if (m) p.set('m', m);
  if (k && i != null && i !== '') { p.set('k', k); p.set('i', String(i)); }
  for (const [a, b] of Object.entries(extra || {})) if (b != null && b !== '' && !['m', 'k', 'i'].includes(a)) p.set(a, String(b));
  const q = p.toString();
  return '#/' + (q ? '?' + q : '');
}
function exists(k, i) {
  if (!k || i == null || i === '') return false;
  if (k === 'bom') return !!(record.bom.lines || [])[Number(i)];
  const kk = idx.kindOf(i);
  return kk === k;
}
function curParams() {
  const inst = active && loaded.get(active)?.inst;
  try { return inst ? inst.params() || {} : {}; } catch (e) { return {}; }
}
function parseHash() {
  const q = location.hash.includes('?') ? location.hash.slice(location.hash.indexOf('?') + 1) : '';
  const p = new URLSearchParams(q);
  const params = Object.fromEntries(p.entries());
  const okSel = exists(params.k, params.i);
  let m = params.m;
  if (!m || !loaded.has(m)) {
    const cands = okSel ? KIND_DEFAULT[params.k] || [] : [];
    m = cands.find((c) => loaded.has(c)) || (loaded.has('req') ? 'req' : [...loaded.keys()][0] || '');
  }
  return { m, k: okSel ? params.k : '', i: okSel ? params.i : '', p: params };
}
const selObj = () => (state.i ? { k: state.k, i: state.i } : null);

// ---------- labels and values ----------
function partName(id) { return (record.parts.find((p) => p.id === id) || {}).name || id; }
function valueText(key) {
  const v = idx.values.get(key);
  return v ? `${fmt(v.v)}${unitJa(v.unit)}` : key;
}
function label(k, i) {
  const it = k === 'bom' ? record.bom.lines[Number(i)] : idx.get(i);
  if (k === 'part') return partName(i);
  if (k === 'value') return `${i} = ${valueText(i)}`;
  if (!it) return String(i);
  if (k === 'req') return `${i} ${short(it.text, 40)}`;
  if (k === 'dec') return `${i} ${short(it.what, 40)}`;
  if (k === 'open') return `${i} ${short(it.text, 40)}`;
  if (k === 'haz') return `${i} ${short(it.text, 40)}`;
  if (k === 'src') return `${i} ${short(it.title, 40)}`;
  if (k === 'check') return `${i} ${it.tier || ''}`;
  if (k === 'proc') return it.steps ? `${i} ${it.title}` : `${i} ${short(it.action, 40)}`;
  if (k === 'task') return `${i} ${short(it.title, 40)}`;
  if (k === 'bom') return `${partName(it.part)}: ${short(it.item, 40)}`;
  if (k === 'iface') return `${i} ${it.between.map(partName).join(' - ')}`;
  return String(i);
}
function href(k, i) { return hashFor(state.m, k, i, state.m && loaded.has(state.m) ? curParams() : {}); }
function refChip(ref, kOverride) {
  const k = kOverride || idx.kindOf(ref);
  if (k === 'docs') return h('a', { class: 'chip', href: docsHref(ref) }, ref.replace(/^docs\//, ''));
  if (!k) return chip(ref);
  const cls = k === 'value' ? 'val' : k === 'part' ? 'part' : k === 'haz' ? 'haz' : '';
  const text = k === 'value' ? ref : k === 'part' ? partName(ref) : String(ref);
  return h('a', { class: `chip ${cls}${idx.superseded.has(ref) ? ' sup' : ''}`, href: href(k, ref), 'data-k': k, 'data-i': ref, title: label(k, ref) }, text);
}
function valueChip(key) {
  const mk = () => h('span', { class: 'chip val', role: 'button', tabindex: '0', 'data-k': 'value', 'data-i': key, title: STATUS_JA[idx.values.get(key)?.status] || '',
    onclick: (e) => { e.stopPropagation(); select('value', key); },
    onkeydown: (e) => { if (e.key === 'Enter') select('value', key); } }, `${key} = ${valueText(key)}`);
  return mk();
}
function rich(text) {
  const box = document.createElement('span');
  for (const seg of scan(text, idx.valueKeys)) {
    if (seg.t === 'text') box.append(seg.s);
    else if (seg.t === 'key') box.append(valueChip(seg.key));
    else box.append(refChip(seg.ref));
  }
  return box;
}
// light the things related to the selection under root; elements carry data-k and data-i
function light(root, sel) {
  const rel = sel ? relatedFn(sel) : null;
  let first = null;
  root.querySelectorAll('[data-k]').forEach((el) => {
    const k = el.dataset.k, i = el.dataset.i;
    const isSel = !!sel && sel.k === k && String(sel.i) === i;
    const isLit = !isSel && !!rel && !!rel[k] && rel[k].has(i);
    el.classList.toggle('sel', isSel);
    el.classList.toggle('lit', isLit);
    el.classList.toggle('dim', !!sel && !isSel && !isLit);
    if (!first && (isSel || isLit) && el.offsetParent) first = el;
  });
  if (sel && sel.reveal && first && first.scrollIntoView) {
    const sticky = root.querySelector('.sel[data-k]') || first;
    sticky.scrollIntoView({ block: 'center', inline: 'nearest' });
  }
}
function select(k, i, opts) {
  noReveal = !(opts && opts.reveal);
  location.hash = hashFor(state.m, k, i, curParams());
}
function goto(mode, params) {
  noReveal = false;
  location.hash = hashFor(mode, state.k, state.i, params);
}
function syncUrl() {
  if (!state.m) return;
  const next = hashFor(state.m, state.k, state.i, curParams());
  if (location.hash !== next) history.replaceState(null, '', next);
  updateTabs();
}

const api = {
  get record() { return record; }, design: null,
  select, goto, href, label, valueText, valueChip, related: (sel) => relatedFn(sel), planSchedule: () => schedule,
  // extras for the modes written together with the shell
  h, chip, statusChip, refChip, rich, light, syncUrl, scan, docsHref, asArray, fmt, short, partName, kindOf: (r) => idx.kindOf(r), get: (r) => idx.get(r),
  index: () => idx, STATUS_JA, VERIFY_JA, PHASE_JA, KIND_JA, ORIGIN_JA, CARRIES_JA, OPEN_KIND_JA, TASK_KIND_JA, GROUP_JA, unitJa, loadedModes: () => [...loaded.keys()],
};

// ---------- selection card ----------
function group(list) {
  const g = {};
  for (const r of list) { const k = idx.kindOf(r); if (k) (g[k] ||= []).push(r); }
  return KIND_ORDER.filter((k) => g[k]).map((k) => h('div', {}, h('span', { class: 'meta' }, KIND_JA[k] + ': '), g[k].map((r) => refChip(r))));
}
const ENUM_FIELD_JA = { class: SRC_CLASS_JA, read: READ_JA, waits_for: ORIGIN_JA, raised_by: ORIGIN_JA, blocks: BLOCKS_JA, method: METHOD_JA, carries: CARRIES_JA, group: GROUP_JA };
function fieldEl(f, v) {
  if (v && v.nodeType) return v;
  if (f === 'status' || f === 'result') return statusChip(v);
  if (f === 'verify') return chip(VERIFY_JA[v] || v);
  if (f === 'origin' || f === 'by') return chip(ORIGIN_JA[v] || v);
  if (f === 'url') return h('a', { href: v, target: '_blank', rel: 'noopener' }, v);
  if (f === 'phase' || f === 'phases') return h('span', {}, asArray(v).map((x) => chip(PHASE_JA[x] || x)));
  if (ENUM_FIELD_JA[f]) return h('span', {}, asArray(v).map((x) => chip(ENUM_FIELD_JA[f][x] || x)));
  if (Array.isArray(v)) return h('span', {}, v.map((x) => (typeof x === 'string' && idx.kindOf(x) ? refChip(x) : chip(typeof x === 'string' ? x : JSON.stringify(x)))));
  if (typeof v === 'string' && (REF_FIELDS.includes(f) || f === 'procedure') && idx.kindOf(v)) return refChip(v);
  if (PROSE_FIELDS.includes(f)) return rich(v);
  if (typeof v === 'number') return fmt(v);
  return String(v);
}
function cardFields(kind, id) {
  const it = kind === 'bom' ? record.bom.lines[Number(id)] : idx.get(id);
  const rows = [];
  const F = (lab, f, v) => { lab = lab || FIELD_JA[f]; v = v === undefined ? it[f] : v; if (v != null && !(Array.isArray(v) && !v.length)) rows.push([lab, fieldEl(f, v)]); };
  if (kind === 'req') {
    const ps = new Set(asArray(it.parts));
    for (const s of scan(it.design_point, idx.valueKeys)) if (s.t === 'key') PK.partsForKey(s.key).forEach((p) => ps.add(p));
    F('文', 'text'); F('状態', 'status'); F('起源', 'origin'); F('検証', 'verify'); F('設計点', 'design_point'); F('期待値', 'expected'); F('上位', 'parent');
    F('部品', 'parts', [...ps]); F('根拠', 'basis');
  } else if (kind === 'dec') { F('日付', 'date'); F('決めた人', 'by'); F('内容', 'what'); F('選択肢', 'options'); F('関わるもの', 'touches'); F('置き換える決定', 'supersedes'); }
  else if (kind === 'open') { F('文', 'text'); F('種別', 'kind', OPEN_KIND_JA[it.kind] || it.kind); F('起票した人', 'raised_by'); F('待つ相手', 'waits_for'); F('段階', 'phase'); F('塞ぐ関門', 'blocks'); F('起票日', 'opened'); F('影響するもの', 'affects'); F('解決日', 'closed'); F('解決した決定', 'closed_by'); }
  else if (kind === 'haz') { F('文', 'text'); F('段階', 'phases'); F('危険にさらされる人', 'at_risk'); F('管理策', 'controls'); }
  else if (kind === 'check') { F('結果', 'result'); F('階層', 'tier'); F('方法', 'method'); F('実施', 'by', `${ORIGIN_JA[it.by] || it.by}、${it.date}`); F('対象の値', 'target'); F('詳細', 'detail'); }
  else if (kind === 'src') { F('題名', 'title'); F('種類', 'class'); F('URL', 'url'); F('取得日', 'retrieved'); F('ライセンス', 'license'); F('読んだ範囲', 'read'); F('注記', 'note'); }
  else if (kind === 'value') {
    F('値', 'v', valueText(id)); F('状態', 'status'); F('根拠', 'basis');
    const ps = PK.partsForKey(id);
    F('部品', 'parts', ps);
  } else if (kind === 'part') {
    F('名前', 'name', it.name); F('上位', 'parent');
    const kids = record.parts.filter((p) => p.parent === id).map((p) => p.id);
    F('下位', 'parts', kids);
    F('値', 'parts', PK.keysForPart(id, [...idx.valueKeys]));
  } else if (kind === 'proc') {
    if (it.steps) { F('題名', 'title'); F('手順', 'steps', it.steps.map((s) => s.id)); }
    else { F('手順', 'procedure', it.procedure); F('操作', 'action'); F('値', 'values'); F('防ぐハザード', 'controls'); F('限界', 'limits'); }
  } else if (kind === 'task') {
    const s = schedule.find((t) => t.id === id);
    F('題名', 'title'); F('段階', 'phase'); F('種別', 'kind', TASK_KIND_JA[it.kind] || it.kind); F('日数', 'days', it.days + ' 日');
    F('期間', 'start', `${s.start} から ${s.end}`); F('前の作業', 'after'); F('部品', 'parts'); F('要求', 'reqs');
  } else if (kind === 'bom') {
    F('品', 'item'); F('部品', 'part', refChip(it.part)); F('数量', 'qty'); F('単価', 'price', valueChip(it.price));
    F('小計', 'qty', fmt(it.qty * (idx.values.get(it.price)?.v || 0)) + unitJa('JPY'));
    F('届く作業', 'need', refChip(it.need)); F('区分', 'group', GROUP_JA[it.group] || GROUP_JA.parts);
  } else if (kind === 'iface') { F('つなぐ部品', 'between'); F('伝えるもの', 'carries'); }
  return rows;
}
function renderCard() {
  const card = $('#card');
  document.body.classList.toggle('hascard', !!state.i);
  if (!state.i) { card.className = 'empty'; card.replaceChildren('項目を選ぶと、ここに中身と関係が出ます。'); return; }
  card.className = '';
  const { k: kind, i: id } = state;
  const clear = hashFor(state.m, '', '', curParams());
  const nodes = [
    h('a', { id: 'closecard', href: clear, 'aria-label': '閉じる (Esc)' }, '閉じる ✕'),
    h('h2', {}, kind === 'part' ? partName(id) : kind === 'bom' ? label('bom', id) : id + (idx.superseded.has(id) ? ' (置き換え済み)' : '')),
    h('div', { class: 'meta' }, KIND_JA[kind] + (kind === 'part' ? ` (${id})` : '')),
  ];
  const btns = (KIND_MODES[kind] || []).filter((m) => loaded.has(m) && m !== state.m)
    .map((m) => h('a', { class: 'btn', href: hashFor(m, kind, id, {}), 'data-reveal': '1' }, BUTTON_JA[m]));
  if (['dec', 'open', 'src', 'check', 'value'].includes(kind)) btns.push(h('a', { class: 'btn', href: '../record/' }, '記録ページで見る'));
  if (btns.length) nodes.push(h('div', { class: 'btns' }, btns));
  const dl = h('dl');
  for (const [lab, el] of cardFields(kind, id)) dl.append(h('dt', {}, lab), h('dd', {}, el));
  nodes.push(dl);
  let outs = [], ins = [];
  if (kind === 'bom') { const l = record.bom.lines[Number(id)]; outs = [l.part, l.need, l.price].filter((x) => idx.kindOf(x)); }
  else { outs = idx.out.get(id) || []; ins = idx.inc.get(id) || []; }
  nodes.push(h('h3', {}, `引用している (${outs.length})`), ...(outs.length ? group(outs) : [h('div', { class: 'meta' }, 'なし')]));
  nodes.push(h('h3', {}, `引用されている (${ins.length})`), ...(ins.length ? group(ins) : [h('div', { class: 'meta' }, 'なし')]));
  const docs = outs.filter((r) => idx.kindOf(r) === 'docs');
  if (docs.length) nodes.push(h('h3', {}, '文書'), h('div', {}, docs.map((r) => refChip(r))));
  card.replaceChildren(...nodes);
  card.scrollTop = 0;
}

// ---------- modes ----------
function updateTabs() {
  document.querySelectorAll('#tabs a').forEach((a) => {
    const m = a.dataset.m;
    a.hidden = !loaded.has(m);
    a.href = hashFor(m, state.k, state.i, m === state.m ? curParams() : {});
    if (m === state.m) a.setAttribute('aria-current', 'page'); else a.removeAttribute('aria-current');
  });
}
function showError(msg) {
  const box = $('#view');
  let e = box.querySelector('.moderr');
  if (!e) { e = h('div', { class: 'panel moderr' }); box.prepend(e); }
  e.textContent = msg; e.hidden = !msg;
}
function enterMode(m, params) {
  const rec = loaded.get(m);
  try { rec.inst.enter(params); showError(''); } catch (e) { console.error(`mode ${m} enter failed`, e); showError(`このモード (${m}) を開けませんでした: ${e.message}`); }
}
function apply() {
  const next = parseHash();
  if (!next.m) { showError('開けるモードがありません。'); renderCard(); return; }
  const prevMode = state.m;
  const reveal = !noReveal || next.m !== prevMode;
  noReveal = false;
  state = next;
  document.body.classList.toggle('full', next.m === 'v3d');
  document.body.dataset.mode = next.m;
  if (next.m !== prevMode) {
    if (active && loaded.has(active)) {
      try { loaded.get(active).inst.leave(); } catch (e) { console.error(`mode ${active} leave failed`, e); }
      loaded.get(active).wrap.hidden = true;
    }
    active = next.m;
    loaded.get(active).wrap.hidden = false;
    enterMode(active, next.p);
  } else {
    let cur = {};
    try { cur = Object.fromEntries(Object.entries(loaded.get(active).inst.params() || {}).filter(([, b]) => b != null && b !== '')); } catch (e) { /* ignore */ }
    const want = Object.fromEntries(Object.entries(next.p).filter(([a]) => !['m', 'k', 'i'].includes(a)));
    if (JSON.stringify(Object.entries(cur).sort()) !== JSON.stringify(Object.entries(want).sort())) enterMode(active, next.p);
  }
  updateTabs();
  renderCard();
  const sel = state.i ? { k: state.k, i: state.i, reveal } : null;
  try { loaded.get(active).inst.highlight(sel); } catch (e) { console.error(`mode ${active} highlight failed`, e); }
  document.title = 'ゴーカート 設計ナビゲータ' + (state.i ? ' - ' + state.i : '');
}

async function loadModes() {
  const view = $('#view');
  await Promise.all(MODES.map(async ([id]) => {
    try {
      const mod = await import(`./modes/${id}.js`);
      const inst = mod.default(api);
      const wrap = h('div', { class: 'mode', 'data-mode': id, hidden: true }, inst.el);
      loaded.set(id, { inst, wrap });
    } catch (e) { console.error(`mode ${id} not available`, e); }
  }));
  for (const [id] of MODES) if (loaded.has(id)) view.append(loaded.get(id).wrap);
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
function onKey(e) {
  const t = e.target, typing = t && (t.tagName === 'INPUT' || t.tagName === 'SELECT' || t.tagName === 'TEXTAREA');
  if (e.key === 'Escape') {
    if (typing) t.blur();
    if (state.i) { noReveal = true; location.hash = hashFor(state.m, '', '', curParams()); }
  }
}

async function boot() {
  initTheme();
  $('#tabs').replaceChildren(...MODES.map(([id, lab]) => h('a', { href: '#/?m=' + id, 'data-m': id, hidden: true }, lab)));
  try {
    const [r, d] = await Promise.all([
      fetch('../data/record.json').then((x) => { if (!x.ok) throw new Error(`record.json: ${x.status}`); return x.json(); }),
      fetch('../data/design.json').then((x) => (x.ok ? x.json() : null)).catch(() => null),
    ]);
    record = r; api.design = d;
  } catch (e) { $('#view').replaceChildren(h('p', {}, 'データを読めませんでした: ' + e.message)); return; }
  idx = buildIndex(record);
  relatedFn = makeRelated(record, idx, PK);
  try { schedule = computeSchedule(record); } catch (e) { console.error('plan schedule failed', e); schedule = []; }
  $('#view').replaceChildren();
  await loadModes();
  window.addEventListener('hashchange', apply);
  document.addEventListener('keydown', onKey);
  document.getElementById('card').addEventListener('click', (e) => { if (e.target.closest('a.btn')) noReveal = false; });
  apply();
}

boot();
