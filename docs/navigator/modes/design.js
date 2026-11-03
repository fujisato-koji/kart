// 設計: the sections of docs/03-design.md with the values they set, and what blocks the design-to-build gate.
export default function create(api) {
  const { h, refChip } = api;
  const rec = api.record, idx = api.index();
  const el = h('div', { class: 'm-design' });
  let q = '';
  let curSel = null;

  const keysOfReq = (r) => new Set(api.scan(r.design_point, idx.valueKeys).filter((s) => s.t === 'key').map((s) => s.key));
  const reqKeys = rec.requirements.map((r) => [r, keysOfReq(r)]);
  const sections = rec.sections.filter((s) => s.doc === 'docs/03-design.md');
  const valuesOf = (id) => rec.values.filter((v) => /^(dsn|lay)\./.test(v.key) && (v.basis || []).includes('docs/03-design.md#' + id));

  const gate = rec.open.filter((o) => o.blocks === 'design_build' && !o.closed);
  const gatePanel = h('div', { class: 'panel' }, h('h2', {}, `設計から製作への関門を塞ぐ未決事項 (${gate.length})`),
    gate.length ? gate.map((o) => h('div', { class: 'gateitem', 'data-k': 'open', 'data-i': o.id, onclick: (e) => { if (!e.target.closest('a,[role=button]')) api.select('open', o.id); } },
      h('a', { class: 'id', href: api.href('open', o.id) }, o.id), ' ', api.chip('待つ相手: ' + o.waits_for), ' ', api.rich(o.text),
      o.affects && o.affects.length ? h('div', { class: 'meta' }, '影響するもの: ', o.affects.map((a) => refChip(a))) : null))
      : h('p', { class: 'meta' }, '塞いでいる未決事項はありません。'));

  const box = h('div');
  const search = h('input', { type: 'search', placeholder: '値の鍵で絞る (例 axle)', oninput: (e) => { q = e.target.value.toLowerCase(); draw(); } });

  function draw() {
    const blocks = [];
    for (const s of sections) {
      const vals = valuesOf(s.id).filter((v) => !q || v.key.toLowerCase().includes(q));
      if (q && !vals.length) continue;
      const keys = new Set(vals.map((v) => v.key));
      const reqs = reqKeys.filter(([, ks]) => [...ks].some((k) => keys.has(k))).map(([r]) => r);
      blocks.push(h('section', { class: 'panel dsec', 'data-sec': s.id },
        h('h2', {}, s.title, ' ', h('a', { class: 'chip', href: '../03-design/#' + s.id }, '文書の節 ' + s.id)),
        vals.length ? h('div', { class: 'chips' }, vals.map((v) => api.valueChip(v.key))) : h('div', { class: 'meta' }, 'この節を根拠にする dsn.* / lay.* の値はありません。'),
        reqs.length ? h('div', { class: 'meta rline' }, h('span', { class: 'rlab' }, 'これらの値が働く要求'), reqs.map((r) => refChip(r.id))) : null));
    }
    box.replaceChildren(...blocks);
    paint();
  }
  function paint() {
    api.light(el, curSel);
    el.querySelectorAll('.dsec').forEach((s) => {
      const dimmed = !!curSel && !s.querySelector('.sel,.lit');
      s.classList.toggle('dim', dimmed);
      if (dimmed) s.querySelectorAll('.dim').forEach((x) => x.classList.remove('dim'));
    });
  }
  el.append(gatePanel, h('div', { class: 'controls' }, search, h('span', { class: 'meta' }, `${sections.length} 節 (docs/03-design.md)`)), box);

  return {
    el,
    enter() { draw(); },
    leave() {},
    highlight(sel) { curSel = sel; paint(); },
    params() { return {}; },
  };
}
