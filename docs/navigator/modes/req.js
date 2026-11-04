// 要求: the requirements as a list or tree, with what each one touches.
import { partsForKey } from '../../viewer/parts.js';

export default function create(api) {
  const { h, chip, statusChip, refChip, STATUS_JA, VERIFY_JA } = api;
  const rec = api.record, idx = api.index();
  const f = { st: '', vf: '', view: 'list' };
  const el = h('div', { class: 'm-req' });
  const list = h('div');
  const count = h('span', { class: 'meta' });

  const sel = (key, opts) => h('select', { onchange: (e) => { f[key] = e.target.value; draw(); api.syncUrl(); } },
    h('option', { value: '' }, 'すべて'), opts.map(([v, t]) => h('option', { value: v }, t)));
  const stSel = sel('st', [['confirmed', STATUS_JA.confirmed], ['awaiting', STATUS_JA.awaiting]]);
  const vfSel = sel('vf', Object.entries(VERIFY_JA).map(([v, t]) => [v, t]));
  const viewSel = h('select', { onchange: (e) => { f.view = e.target.value; draw(); api.syncUrl(); } },
    h('option', { value: 'list' }, '一覧'), h('option', { value: 'tree' }, '木 (上位と下位)'));
  el.append(h('div', { class: 'controls' }, h('label', {}, '状態 ', stSel), h('label', {}, '検証方法 ', vfSel), h('label', {}, '表示 ', viewSel), count), list);

  // lookups
  const keysOf = (r) => [...new Set(api.scan(r.design_point, idx.valueKeys).filter((s) => s.t === 'key').map((s) => s.key))];
  const hazOf = (id) => rec.hazards.filter((x) => (x.controls || []).includes(id));
  function sectionsOf(keys) {
    const ids = new Set();
    for (const k of keys) for (const b of idx.values.get(k)?.basis || []) if (b.startsWith('docs/03-design.md#')) ids.add(b.split('#')[1]);
    return rec.sections.filter((s) => s.doc === 'docs/03-design.md' && ids.has(s.id));
  }
  function checksOf(r, keys) {
    return rec.checks.filter((c) => (c.target || []).some((t) => t === r.id || keys.includes(t)));
  }

  function row(r, depth) {
    const keys = keysOf(r);
    const parts = [...new Set([...(r.parts || []), ...keys.flatMap((k) => partsForKey(k))])];
    const hz = hazOf(r.id), secs = sectionsOf(keys), chks = checksOf(r, keys);
    const line = (lab, kids) => (kids.length ? h('div', { class: 'meta rline' }, h('span', { class: 'rlab' }, lab), kids) : null);
    return h('div', { class: 'item reqrow', 'data-k': 'req', 'data-i': r.id, style: depth ? `margin-left:${depth * 20}px` : null, onclick: (e) => { if (!e.target.closest('a,[role=button]')) api.select('req', r.id); } },
      h('a', { class: 'id', href: api.href('req', r.id) }, r.id), ' ', statusChip(r.status), chip('起源: ' + (api.ORIGIN_JA[r.origin] || r.origin), '', r.origin),
      chip('検証: ' + (VERIFY_JA[r.verify] || r.verify), '', r.verify),
      r.parent ? h('span', {}, ' 上位 ', refChip(r.parent)) : null,
      h('div', { class: 'rtext' }, r.text),
      h('div', { class: 'meta rline' }, h('span', { class: 'rlab' }, '設計点'), api.rich(r.design_point)),
      r.expected ? h('div', { class: 'meta rline' }, h('span', { class: 'rlab' }, '期待値'), api.rich(r.expected)) : null,
      line('部品', parts.map((p) => refChip(p))),
      line('制御するハザード', hz.map((x) => refChip(x.id))),
      line('設計の節', secs.map((s) => h('a', { class: 'chip', href: '../03-design/#' + s.id, title: s.title }, s.title))),
      line('検査', chks.map((c) => refChip(c.id))));
  }

  function draw() {
    stSel.value = f.st; vfSel.value = f.vf; viewSel.value = f.view;
    const ok = (r) => (!f.st || r.status === f.st) && (!f.vf || r.verify === f.vf);
    const shown = rec.requirements.filter(ok);
    count.textContent = `${shown.length} / ${rec.requirements.length} 件`;
    const ids = new Set(shown.map((r) => r.id));
    const rows = [];
    if (f.view === 'tree') {
      const kids = (p) => shown.filter((r) => r.parent === p);
      const walk = (r, d) => { rows.push(row(r, d)); kids(r.id).forEach((c) => walk(c, d + 1)); };
      shown.filter((r) => !r.parent || !ids.has(r.parent)).forEach((r) => walk(r, 0));
    } else shown.forEach((r) => rows.push(row(r, 0)));
    list.replaceChildren(...(rows.length ? rows : [h('p', { class: 'meta' }, '条件に合う要求がありません。')]));
    api.light(el, curSel);
  }

  let curSel = null;
  return {
    el,
    enter(params) {
      f.st = ['confirmed', 'awaiting'].includes(params.st) ? params.st : '';
      f.vf = VERIFY_JA[params.vf] ? params.vf : '';
      f.view = params.view === 'tree' ? 'tree' : 'list';
      draw();
    },
    leave() {},
    highlight(sel) { curSel = sel; api.light(el, sel); },
    params() { return { st: f.st, vf: f.vf, view: f.view === 'tree' ? 'tree' : '' }; },
  };
}
