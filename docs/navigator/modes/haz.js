// ハザード解析: hazards, their controls (requirements and procedure steps), and a hazard x control matrix.
export default function create(api) {
  const { h, chip, statusChip, refChip, VERIFY_JA, PHASE_JA } = api;
  const rec = api.record, idx = api.index();
  const el = h('div', { class: 'm-haz' });
  let curSel = null;

  const isReq = (c) => idx.kindOf(c) === 'req';
  const stepOf = (c) => idx.get(c);
  const ctlKind = (c) => (isReq(c) ? 'req' : 'proc');
  const pick = (k, i) => () => api.select(k, i);

  // table
  const rows = rec.hazards.map((x) => {
    const reqs = (x.controls || []).filter(isReq), steps = (x.controls || []).filter((c) => !isReq(c));
    return h('tr', { 'data-k': 'haz', 'data-i': x.id, onclick: (e) => { if (!e.target.closest('a,[role=button]')) api.select('haz', x.id); } },
      h('td', {}, h('a', { class: 'id', href: api.href('haz', x.id) }, x.id)),
      h('td', {}, x.text),
      h('td', {}, (x.phases || []).map((p) => chip(PHASE_JA[p] || p, '', p))),
      h('td', {}, x.at_risk),
      h('td', {}, reqs.length ? reqs.map((c) => {
        const r = idx.get(c);
        return h('div', { class: 'ctl', 'data-k': 'req', 'data-i': c }, refChip(c), ' ', statusChip(r.status), ' ', chip(VERIFY_JA[r.verify] || r.verify, '', r.verify), h('div', { class: 'meta' }, api.short(r.text, 90)));
      }) : h('span', { class: 'meta' }, 'なし')),
      h('td', {}, steps.length ? steps.map((c) => {
        const s = stepOf(c);
        return h('div', { class: 'ctl', 'data-k': 'proc', 'data-i': c }, refChip(c), h('div', { class: 'meta' }, s ? s.action : ''));
      }) : h('span', { class: 'meta' }, 'なし')));
  });
  const table = h('div', { class: 'tablewrap' }, h('table', { class: 'haztable' },
    h('thead', {}, h('tr', {}, ['ハザード', '内容', '段階', '危険にさらされる人', '管理策: 要求', '管理策: 手順の工程'].map((t) => h('th', {}, t)))),
    h('tbody', {}, rows)));

  // matrix
  const ctls = [...new Set(rec.hazards.flatMap((x) => x.controls || []))].sort((a, b) => (isReq(b) - isReq(a)) || a.localeCompare(b));
  const head = h('tr', {}, h('th', {}, ''), ctls.map((c) => h('th', { class: 'vert', 'data-k': ctlKind(c), 'data-i': c, title: api.label(ctlKind(c), c), onclick: pick(ctlKind(c), c) }, c)));
  const body = rec.hazards.map((x) => h('tr', { 'data-k': 'haz', 'data-i': x.id },
    h('th', { class: 'rowh', title: x.text, onclick: pick('haz', x.id) }, x.id),
    ctls.map((c) => ((x.controls || []).includes(c)
      ? h('td', { class: 'cell on', 'data-k': ctlKind(c), 'data-i': c, title: `${x.id} は ${c} で管理`, role: 'button', tabindex: '0', onclick: pick(ctlKind(c), c) }, '●')
      : h('td', { class: 'cell' })))));
  const matrix = h('div', { class: 'tablewrap' }, h('table', { class: 'hazmat' }, h('thead', {}, head), h('tbody', {}, body)));

  el.append(
    h('div', { class: 'panel' }, h('h2', {}, `ハザード (${rec.hazards.length})`), table),
    h('div', { class: 'panel' }, h('h2', {}, 'ハザード x 管理策の対応表'), h('div', { class: 'meta' }, '丸を押すとその管理策を選びます。左は要求、右は手順の工程です。'), matrix));

  return {
    el, enter() { api.light(el, curSel); }, leave() {},
    highlight(sel) { curSel = sel; api.light(el, sel); },
    params() { return {}; },
  };
}
