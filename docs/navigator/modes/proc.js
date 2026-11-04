// 調達部品リスト: BOM lines grouped by part, totals against the budget, cost by part group.
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

// Drawing-only constants: Japanese group names and which top-level parts fall in each.
export const ILLUSTRATIVE = {
  groups: [
    ['chassis', '車体', ['chassis']],
    ['steering', '操舵', ['steering']],
    ['powertrain', '動力', ['powertrain']],
    ['running', '足回り', ['front_wheels', 'rear_axle', 'rear_wheels', 'brake']],
    ['winter', '冬', ['winter']],
    ['other', '全体・その他', ['kart']],
  ],
  barW: 520, barH: 22, labelW: 110,
};
const CSS = `
#mode-proc .cards{display:grid;grid-template-columns:repeat(auto-fit,minmax(260px,1fr));gap:10px;margin-bottom:12px}
#mode-proc .tot{background:var(--card,#fff);border:1px solid var(--line,#d9dbd5);border-radius:8px;padding:8px 12px}
#mode-proc .tot b{font-size:1.15rem}
#mode-proc .meter{height:10px;background:var(--neubg,#e7e8e4);border-radius:3px;margin-top:6px;overflow:hidden}
#mode-proc .meter i{display:block;height:100%;background:var(--bar,#4f86d6)}
#mode-proc .meter i.over{background:var(--bar2,#a8261c)}
#mode-proc .over-t{color:var(--bad,#a8261c);font-weight:600}
#mode-proc .panel{background:var(--card,#fff);border:1px solid var(--line,#d9dbd5);border-radius:8px;padding:10px 14px;margin-bottom:12px}
#mode-proc .panel h2{font-size:1rem;margin:0 0 8px}
#mode-proc table{border-collapse:collapse;width:100%;font-size:.9rem}
#mode-proc th,#mode-proc td{text-align:left;padding:4px 8px;border-bottom:1px solid var(--line,#d9dbd5);vertical-align:top}
#mode-proc td.num,#mode-proc th.num{text-align:right;font-variant-numeric:tabular-nums;white-space:nowrap}
#mode-proc tr.ph td{background:var(--neubg,#e7e8e4);font-weight:600;cursor:pointer}
#mode-proc tr.ph td a{color:inherit}
#mode-proc tr.ln{cursor:pointer}
#mode-proc tr.ln:hover td{background:var(--infobg,#dce8fa)}
#mode-proc tr.sel td,#mode-proc tr.hl td{background:var(--sel,#fff3c4)}
#mode-proc.has-sel tr.ln:not(.hl):not(.sel),#mode-proc.has-sel tr.ph:not(.hl){opacity:.35}
#mode-proc .tablewrap{overflow-x:auto}
#mode-proc .chip{display:inline-block;padding:0 7px;border-radius:10px;font-size:.8rem;text-decoration:none;background:var(--neubg,#e7e8e4);color:var(--neu,#4b5260);border:1px solid var(--line,#d9dbd5)}
#mode-proc .chip.warn{background:var(--warnbg,#fdecc8);color:var(--warn,#8a5a00)}
#mode-proc .chip.ok{background:var(--okbg,#dff3e4);color:var(--ok,#1d7a3a)}
#mode-proc .chip.info{background:var(--infobg,#dce8fa);color:var(--info,#1f5fbf)}
#mode-proc .meta{color:var(--mut,#5f6670);font-size:.85rem}
#mode-proc svg text{font-size:12px}
#mode-proc svg .cbar{fill:var(--bar,#4f86d6)}#mode-proc svg .cbar.tools{fill:var(--neu,#4b5260)}
#mode-proc svg .bgb{stroke:var(--bad,#a8261c);stroke-width:2;stroke-dasharray:5 3}
`;
const yen = (n) => Math.round(n).toLocaleString('ja-JP') + ' 円';

export default function create(api) {
  const rec = api.record, I = ILLUSTRATIVE;
  const el = h('div', { id: 'mode-proc' }, h('style', {}, CSS));
  const val = new Map(rec.values.map((v) => [v.key, v]));
  const partById = new Map(rec.parts.map((p) => [p.id, p]));
  const srcIds = new Set((rec.sources || []).map((x) => x.id)), decIds = new Set((rec.decisions || []).map((x) => x.id));
  const kindOfId = (id) => (srcIds.has(id) ? 'src' : decIds.has(id) ? 'dec' : 'value');
  const topPart = (id) => { let p = partById.get(id); while (p && p.parent && p.parent !== 'kart') p = partById.get(p.parent); return p ? p.id : 'kart'; };
  const groupOf = (id) => { const t = topPart(id); const g = I.groups.find((q) => q[2].includes(t)) || I.groups[I.groups.length - 1]; return g; };

  const lines = rec.bom.lines.map((l, idx) => {
    const v = val.get(l.price), unit = v ? v.v : NaN;
    return { ...l, idx, unit, total: l.qty * unit, tool: l.group === 'tools' };
  });
  const budget = val.get('budget.parts_jpy');
  const rows = new Map(); // idx -> tr
  const partRows = new Map();
  let sel = null;

  function sched() {
    const m = new Map();
    try { for (const t of api.planSchedule() || []) m.set(t.id, t); } catch (e) { /* shell not ready */ }
    return m;
  }
  const dateOf = (t) => { if (!t) return '—'; const d = t.start; if (!d) return '—'; if (d instanceof Date) return d.toISOString().slice(0, 10); return String(d).slice(0, 10); };

  function build() {
    const sch = sched(), task = new Map(rec.plan.tasks.map((t) => [t.id, t]));
    const parts = lines.filter((l) => !l.tool), tools = lines.filter((l) => l.tool);
    const sumP = parts.reduce((a, l) => a + (l.total || 0), 0), sumT = tools.reduce((a, l) => a + (l.total || 0), 0);
    const out = [];

    // totals
    const cards = h('div', { class: 'cards' });
    const bud = budget ? budget.v : null, over = bud != null && sumP > bud;
    cards.append(
      h('div', { class: 'tot' }, h('div', { class: 'meta' }, '部品の合計（予算に対して）'), h('b', { class: over ? 'over-t' : '' }, yen(sumP)),
        bud != null ? h('span', { class: 'meta' }, ` / 予算 ${yen(bud)}`) : '',
        bud != null ? h('div', { class: 'meta' }, over ? `予算を ${yen(sumP - bud)} 超えている` : `残り ${yen(bud - sumP)}（${Math.round((sumP / bud) * 100)}%）`) : '',
        bud != null ? h('div', { class: 'meter' }, h('i', { class: over ? 'over' : '', style: `width:${Math.min(100, (sumP / bud) * 100)}%` })) : ''),
      h('div', { class: 'tot' }, h('div', { class: 'meta' }, '道具の合計（予算とは別）'), h('b', {}, yen(sumT)), h('div', { class: 'meta' }, `${tools.length} 品`)),
      h('div', { class: 'tot' }, h('div', { class: 'meta' }, '部品＋道具'), h('b', {}, yen(sumP + sumT)), h('div', { class: 'meta' }, `${lines.length} 行`)));
    out.push(cards);

    // chart
    const rowsC = I.groups.map(([id, label, tops]) => ({ id, label, v: parts.filter((l) => groupOf(l.part)[0] === id).reduce((a, l) => a + (l.total || 0), 0) }));
    rowsC.push({ id: 'tools', label: '道具', v: sumT, tools: true });
    const shown = rowsC.filter((r) => r.v > 0), mx = Math.max(1, ...shown.map((r) => r.v));
    const H = shown.length * (I.barH + 8) + 12, W = I.labelW + I.barW + 130;
    const svg = s('svg', { viewBox: `0 0 ${W} ${H}`, role: 'img', 'aria-label': '部品群ごとの費用', style: `max-width:${W}px;width:100%` });
    shown.forEach((r, i) => {
      const y = 6 + i * (I.barH + 8), w = (r.v / mx) * I.barW;
      svg.append(s('text', { x: I.labelW - 8, y: y + 15, 'text-anchor': 'end' }, r.label), s('rect', { class: 'cbar' + (r.tools ? ' tools' : ''), x: I.labelW, y, width: Math.max(1, w), height: I.barH, rx: 3 }),
        s('text', { x: I.labelW + w + 6, y: y + 15 }, yen(r.v)));
    });
    out.push(h('div', { class: 'panel' }, h('h2', {}, '部品群ごとの費用'), svg, h('div', { class: 'meta' }, '道具は予算に入れず、別の棒で示す。')));

    // tables
    const mk = (title, ls, withBudget) => {
      const tb = h('tbody'), order = [...new Set(ls.map((l) => l.part))].sort((a, b) => rec.parts.findIndex((p) => p.id === a) - rec.parts.findIndex((p) => p.id === b));
      for (const pid of order) {
        const pl = ls.filter((l) => l.part === pid), sub = pl.reduce((a, l) => a + (l.total || 0), 0);
        const pn = partById.get(pid);
        const tr = h('tr', { class: 'ph', 'data-part': pid, onclick: () => api.select('part', pid) },
          h('td', { colspan: 4 }, `${groupOf(pid)[1]} / ${pn ? pn.name : pid}`, h('span', { class: 'meta' }, `  ${pid}`)), h('td', { class: 'num' }, yen(sub)), h('td', { colspan: 2 }, ''));
        partRows.set(pid + (withBudget ? '' : '#t'), tr); tb.append(tr);
        for (const l of pl) {
          const v = val.get(l.price), t = task.get(l.need), st = sch.get(l.need);
          const srcs = v ? (v.basis || []) : [];
          const tr2 = h('tr', { class: 'ln', 'data-bom': l.idx, onclick: () => api.select('bom', String(l.idx)) },
            h('td', {}, h('a', { href: api.href('part', pid), onclick: (e) => e.stopPropagation() }, pid)),
            h('td', {}, l.item),
            h('td', { class: 'num' }, String(l.qty)),
            h('td', { class: 'num' }, api.valueText(l.price), ' ', v ? h('span', { class: 'chip ' + (v.status === 'sourced' || v.status === 'measured' ? 'ok' : v.status === 'assumed' ? 'warn' : 'info'), title: l.price }, api.STATUS_JA[v.status] || v.status) : '',
              ' ', ...srcs.flatMap((b, i) => [i ? ', ' : '', h('a', { href: api.href(kindOfId(b), b), onclick: (e) => e.stopPropagation() }, b)])),
            h('td', { class: 'num' }, yen(l.total)),
            h('td', {}, t ? h('a', { href: api.href('task', t.id), onclick: (e) => e.stopPropagation(), title: t.title }, t.id) : '—', t ? h('span', { class: 'meta' }, ' ' + t.title) : ''),
            h('td', { class: 'num' }, dateOf(st)));
          rows.set(l.idx, tr2); tb.append(tr2);
        }
      }
      return h('div', { class: 'panel' }, h('h2', {}, title), h('div', { class: 'tablewrap' }, h('table', {},
        h('thead', {}, h('tr', {}, ...['部品', '品目', '数量', '単価（出典）', '小計', '必要な工程', '必要日'].map((c, i) => h('th', { class: i === 2 || i === 3 || i === 4 || i === 6 ? 'num' : '' }, c)))), tb)));
    };
    // header has 7 columns; part header row has colspan to match
    out.push(mk('部品', parts, true));
    if (tools.length) out.push(mk('道具', tools, false));
    return out;
  }

  function render() {
    rows.clear(); partRows.clear();
    for (const c of [...el.children]) if (c.tagName !== 'STYLE') c.remove();
    el.append(...build());
    paint();
  }
  function paint() {
    const rel = sel && api.related ? api.related(sel) : null;
    el.classList.toggle('has-sel', !!sel);
    const relBom = new Set([...(rel && rel.bom ? rel.bom : [])].map(String));
    const hlParts = new Set();
    for (const [idx, tr] of rows) {
      const on = sel && ((sel.k === 'bom' && sel.i === String(idx)) || relBom.has(String(idx)));
      tr.classList.toggle('hl', !!on); tr.classList.toggle('sel', !!(sel && sel.k === 'bom' && sel.i === String(idx)));
      if (on) hlParts.add(tr.dataset.bom != null ? lines[idx].part : '');
    }
    for (const [key, tr] of partRows) {
      const pid = key.replace('#t', '');
      tr.classList.toggle('hl', !!sel && (hlParts.has(pid) || (rel && rel.part && rel.part.has(pid)) || (sel.k === 'part' && sel.i === pid)));
    }
    if (sel && sel.reveal) { const t = sel.k === 'bom' ? rows.get(Number(sel.i)) : null; if (t && t.scrollIntoView) t.scrollIntoView({ block: 'center', behavior: 'smooth' }); }
  }
  return {
    el,
    enter() { render(); },
    leave() {},
    highlight(next) { sel = next && next.k ? next : null; paint(); },
    params() { return {}; },
  };
}
