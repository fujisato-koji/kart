// 開発日程計画: Gantt chart of plan tasks, coloured by phase, with waits hatched and the critical path in bold.
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
  ROW: 27, HEAD: 52, BAR: 15, DAY: 13, LEFT: 280, TAIL: 11, TITLE_CHARS: 34,
  phase: { design: '設計', procure: '調達', build: '製作', test: '試験' },
  phaseVar: { design: '--info', procure: '--warn', build: '--ok', test: '--bad' },
  phaseFallback: { design: '#1f5fbf', procure: '#8a5a00', build: '#1d7a3a', test: '#a8261c' },
};
const CSS = `
#mode-plan .legend{display:flex;flex-wrap:wrap;gap:4px 14px;align-items:center;margin-bottom:8px;font-size:.85rem;color:var(--mut,#5f6670)}
#mode-plan .legend span{display:inline-flex;align-items:center;gap:4px}
#mode-plan .legend svg{width:22px;height:12px}
#mode-plan .gantt{display:flex;border:1px solid var(--line,#d9dbd5);border-radius:8px;background:var(--card,#fff);overflow:hidden}
#mode-plan .lf{flex:0 0 auto;border-right:1px solid var(--line,#d9dbd5);z-index:1;background:var(--card,#fff)}
#mode-plan .sc{flex:1 1 auto;overflow-x:auto;min-width:0}
#mode-plan svg{display:block;max-width:none;height:auto}
#mode-plan text{font-size:11.5px}
#mode-plan .stripe{fill:var(--neubg,#e7e8e4);opacity:.45}
#mode-plan .gl{stroke:var(--line,#d9dbd5);stroke-width:1}
#mode-plan .tick{fill:var(--mut,#5f6670);font-size:10.5px;text-anchor:middle}
#mode-plan .row{cursor:pointer}
#mode-plan .row:hover .rowbg{fill:var(--infobg,#dce8fa)}
#mode-plan .rowbg{fill:transparent}
#mode-plan .nm{fill:var(--fg,#1c1f23)}
#mode-plan .crit .nm{font-weight:700}
#mode-plan .idt{fill:var(--mut,#5f6670);font-size:10.5px}
#mode-plan .gbar.work{stroke:none}
#mode-plan .gbar.wait{stroke-width:1.2;stroke-dasharray:3 2}
#mode-plan .crit .gbar{stroke:var(--fg,#1c1f23);stroke-width:2.6;stroke-dasharray:none}
#mode-plan .lab{fill:var(--mut,#5f6670);font-size:10.5px}
#mode-plan .dep{fill:none;stroke:var(--mut,#5f6670);stroke-width:1}
#mode-plan .dep.crit{stroke:var(--fg,#1c1f23);stroke-width:2.6}
#mode-plan .ah{fill:var(--mut,#5f6670)}#mode-plan .ahc{fill:var(--fg,#1c1f23)}
#mode-plan .today{stroke:var(--bad,#a8261c);stroke-width:1.6}
#mode-plan .today-t{fill:var(--bad,#a8261c);font-weight:700;font-size:10.5px}
#mode-plan .edge-t{fill:var(--fg,#1c1f23);font-weight:600;font-size:10.5px}
#mode-plan .edge{stroke:var(--mut,#5f6670);stroke-width:1;stroke-dasharray:4 3}
#mode-plan .has-sel .row:not(.hl){opacity:.28}
#mode-plan .has-sel .dep:not(.hl){opacity:.12}
#mode-plan .row.hl .rowbg,#mode-plan .row.sel .rowbg{fill:var(--sel,#fff3c4)}
#mode-plan .detail{margin-top:10px;background:var(--card,#fff);border:1px solid var(--line,#d9dbd5);border-radius:8px;padding:8px 14px;min-height:3.2em}
#mode-plan .detail h3{margin:0 0 4px;font-size:.95rem}
#mode-plan .chip{display:inline-block;padding:0 8px;margin:1px 2px;border-radius:10px;font-size:.82rem;text-decoration:none;background:var(--neubg,#e7e8e4);color:var(--neu,#4b5260);border:1px solid var(--line,#d9dbd5)}
#mode-plan .chip.part{background:var(--infobg,#dce8fa);color:var(--info,#1f5fbf)}
#mode-plan .meta{color:var(--mut,#5f6670);font-size:.85rem}
`;
const DAYMS = 86400000;
const parseDay = (x) => {
  if (x instanceof Date) return Math.floor(Date.UTC(x.getFullYear(), x.getMonth(), x.getDate()) / DAYMS);
  const m = /^(\d{4})-(\d{2})-(\d{2})/.exec(String(x || '')); return m ? Date.UTC(+m[1], +m[2] - 1, +m[3]) / DAYMS : NaN;
};
const md = (d) => new Date(d * DAYMS).toISOString().slice(5, 10).replace('-', '/');
const ymd = (d) => new Date(d * DAYMS).toISOString().slice(0, 10);

export default function create(api) {
  const rec = api.record, I = ILLUSTRATIVE;
  const el = h('div', { id: 'mode-plan' }, h('style', {}, CSS));
  const legend = h('div', { class: 'legend' });
  const gantt = h('div', { class: 'gantt' });
  const detail = h('div', { class: 'detail' });
  el.append(legend, gantt, detail);
  let tasks = [], byId = new Map(), rowEls = new Map(), depEls = [], sel = null, hover = null;
  let leftSvg, chartSvg, critical = new Set(), scEl;

  function schedule() {
    let sch = [];
    try { sch = api.planSchedule() || []; } catch (e) { /* shell not ready */ }
    const sm = new Map(sch.map((t) => [t.id, t]));
    const out = [];
    for (const t of rec.plan.tasks) {
      const st = sm.get(t.id);
      out.push({ ...t, ...(st || {}), s: parseDay(st && st.start) });
    }
    // fall back to own computation when the shell gave no dates
    const m = new Map(out.map((t) => [t.id, t]));
    const t0 = parseDay(rec.plan.start);
    const start = (t) => {
      if (Number.isFinite(t.s)) return t.s;
      t.s = (t.after || []).length ? Math.max(...t.after.map((a) => start(m.get(a)) + m.get(a).days)) : t0;
      return t.s;
    };
    out.forEach(start);
    return out;
  }
  const colour = (ph) => `var(${I.phaseVar[ph]}, ${I.phaseFallback[ph]})`;

  function build() {
    tasks = schedule(); byId = new Map(tasks.map((t) => [t.id, t]));
    const t0 = Math.min(...tasks.map((t) => t.s)), endX = Math.max(...tasks.map((t) => t.s + t.days));
    // critical path: tasks that end at the project end, and, going back, predecessors that end the day this one starts
    critical = new Set();
    const back = (t) => { if (critical.has(t.id)) return; critical.add(t.id); for (const a of t.after || []) { const p = byId.get(a); if (p && p.s + p.days === t.s) back(p); } };
    tasks.filter((t) => t.s + t.days === endX).forEach(back);
    const n = tasks.length, H = I.HEAD + n * I.ROW + 10, span = endX - t0 + I.TAIL, Wc = span * I.DAY + 12;
    const X = (d) => 6 + (d - t0) * I.DAY, cy = (i) => I.HEAD + i * I.ROW + I.ROW / 2;
    const idx = new Map(tasks.map((t, i) => [t.id, i]));

    // legend
    legend.replaceChildren(...Object.entries(I.phase).map(([k, label]) => {
      const sv = s('svg', { viewBox: '0 0 22 12' }, s('rect', { x: 0, y: 1, width: 22, height: 10, fill: colour(k), rx: 2 }));
      return h('span', {}, sv, label);
    }), h('span', {}, s('svg', { viewBox: '0 0 22 12' }, s('rect', { x: 0.6, y: 1.6, width: 20.8, height: 8.8, fill: 'url(#plhatch-design)', stroke: colour('design'), 'stroke-dasharray': '3 2', rx: 2 })), '待ち（網掛け・暦日）'),
    h('span', {}, s('svg', { viewBox: '0 0 22 12' }, s('rect', { x: 1, y: 2, width: 20, height: 8, fill: colour('build'), stroke: 'var(--fg,#1c1f23)', 'stroke-width': 2.4, rx: 2 })), '太枠・太字＝クリティカルパス（終了日を決める鎖）'),
    h('span', {}, s('svg', { viewBox: '0 0 22 12' }, s('line', { x1: 11, y1: 0, x2: 11, y2: 12, stroke: 'var(--bad,#a8261c)', 'stroke-width': 2 })), '今日'));
    // legend hatch pattern needs a definition in the same document: it lives in the chart svg (ids are document-wide)

    // left column
    leftSvg = s('svg', { width: I.LEFT, height: H, viewBox: `0 0 ${I.LEFT} ${H}`, class: 'lf-svg' });
    chartSvg = s('svg', { width: Wc, height: H, viewBox: `0 0 ${Wc} ${H}` });
    const defs = s('defs');
    for (const ph of Object.keys(I.phase)) {
      defs.append(s('pattern', { id: 'plhatch-' + ph, width: 6, height: 6, patternUnits: 'userSpaceOnUse', patternTransform: 'rotate(45)' },
        s('rect', { width: 6, height: 6, fill: colour(ph), opacity: 0.12 }), s('rect', { width: 2.4, height: 6, fill: colour(ph), opacity: 0.7 })));
    }
    for (const c of ['ah', 'ahc']) defs.append(s('marker', { id: 'pl' + c, viewBox: '0 0 10 10', refX: 9, refY: 5, markerWidth: 8, markerHeight: 8, markerUnits: 'userSpaceOnUse', orient: 'auto' }, s('path', { d: 'M0,0 L10,5 L0,10 z', class: c })));
    chartSvg.append(defs);
    // header and grid
    leftSvg.append(s('text', { x: 8, y: 20, class: 'idt' }, '工程'), s('line', { class: 'gl', x1: 0, y1: I.HEAD - 2, x2: I.LEFT, y2: I.HEAD - 2 }));
    tasks.forEach((t, i) => { if (i % 2) { leftSvg.append(s('rect', { class: 'stripe', x: 0, y: I.HEAD + i * I.ROW, width: I.LEFT, height: I.ROW })); chartSvg.append(s('rect', { class: 'stripe', x: 0, y: I.HEAD + i * I.ROW, width: Wc, height: I.ROW })); } });
    for (let d = t0 + 7; d <= t0 + span; d += 7) {
      chartSvg.append(s('line', { class: 'gl', x1: X(d), y1: I.HEAD - 6, x2: X(d), y2: H }), s('text', { class: 'tick', x: X(d), y: I.HEAD - 10 }, md(d)));
    }
    chartSvg.append(s('line', { class: 'gl', x1: 0, y1: I.HEAD - 2, x2: Wc, y2: I.HEAD - 2 }));
    // start, end, today
    const lastDay = endX - 1;
    chartSvg.append(s('line', { class: 'edge', x1: X(t0), y1: 14, x2: X(t0), y2: H }), s('text', { class: 'edge-t', x: X(t0) + 3, y: 12 }, `着手 ${ymd(t0)}`),
      s('line', { class: 'edge', x1: X(endX), y1: 14, x2: X(endX), y2: H }), s('text', { class: 'edge-t', x: X(endX) - 3, y: 12, 'text-anchor': 'end' }, `完了 ${ymd(lastDay)}（${lastDay - t0 + 1} 日目）`));
    const now = parseDay(new Date());
    if (now >= t0 - 2 && now <= endX + I.TAIL) {
      chartSvg.append(s('line', { class: 'today', x1: X(now), y1: 24, x2: X(now), y2: H }), s('text', { class: 'today-t', x: X(now) + 3, y: 26 + 9 }, `今日 ${md(now)}`));
    }
    // dependencies first so bars sit above
    depEls = [];
    const depG = s('g');
    for (const t of tasks) for (const a of t.after || []) {
      const p = byId.get(a); if (!p) continue;
      const x1 = X(p.s + p.days), y1 = cy(idx.get(a)), x2 = X(t.s), y2 = cy(idx.get(t.id));
      const crit = critical.has(t.id) && critical.has(a) && p.s + p.days === t.s;
      let d;
      if (x2 - x1 < 3) d = `M${x1},${y1 + I.BAR / 2} V${y2 - I.BAR / 2 - 1}`;
      else { const xm = x1 + Math.min(6, (x2 - x1) / 2); d = `M${x1},${y1} H${xm} V${y2} H${x2 - 1}`; }
      const g = s('path', { class: 'dep' + (crit ? ' crit' : ''), d, 'marker-end': `url(#pl${crit ? 'ahc' : 'ah'})` });
      g.dataset.from = a; g.dataset.to = t.id; depG.append(g); depEls.push(g);
    }
    chartSvg.append(depG);
    rowEls = new Map();
    tasks.forEach((t, i) => {
      const y = I.HEAD + i * I.ROW, c = crit(t);
      const label = `${t.title}`, short = label.length > I.TITLE_CHARS ? label.slice(0, I.TITLE_CHARS - 1) + '…' : label;
      const tip = `${t.id} ${t.title}\n${ymd(t.s)} – ${ymd(t.s + t.days - 1)}（${t.days} 日${t.kind === 'wait' ? '・待ち' : ''}）`;
      const mkRow = () => s('g', { class: 'row' + (c ? ' crit' : ''), 'data-i': t.id, onclick: () => api.select('task', t.id), onmouseenter: () => { hover = t.id; showDetail(); }, onmouseleave: () => { hover = null; showDetail(); } });
      const lg = mkRow();
      lg.append(s('title', {}, tip), s('rect', { class: 'rowbg', x: 0, y, width: I.LEFT, height: I.ROW }), s('rect', { x: 6, y: y + 8, width: 5, height: 11, fill: colour(t.phase), rx: 1 }),
        s('text', { class: 'idt', x: 16, y: y + 18 }, t.id), s('text', { class: 'nm', x: 40, y: y + 18 }, short));
      leftSvg.append(lg);
      const cg = mkRow();
      const x = X(t.s), w = Math.max(3, t.days * I.DAY - 1);
      cg.append(s('title', {}, tip), s('rect', { class: 'rowbg', x: 0, y, width: Wc, height: I.ROW }),
        s('rect', { class: 'gbar ' + t.kind, x, y: y + (I.ROW - I.BAR) / 2, width: w, height: I.BAR, rx: 3, fill: t.kind === 'wait' ? `url(#plhatch-${t.phase})` : colour(t.phase), stroke: t.kind === 'wait' ? colour(t.phase) : null }),
        s('text', { class: 'lab', x: x + w + 5, y: y + 18 }, `${md(t.s)}–${md(t.s + t.days - 1)}・${t.days}日`));
      chartSvg.append(cg);
      rowEls.set(t.id, [lg, cg]);
    });
    function crit(t) { return critical.has(t.id); }
    const lf = h('div', { class: 'lf' }), sc = h('div', { class: 'sc' }); scEl = sc;
    lf.append(leftSvg); sc.append(chartSvg);
    gantt.replaceChildren(lf, sc);
    showDetail();
  }

  function showDetail() {
    const id = hover || (sel && sel.k === 'task' ? sel.i : null), t = id && byId.get(id);
    if (!t) { detail.replaceChildren(h('span', { class: 'meta' }, '工程にポインタを置くか選ぶと、その工程が作る部品と確かめる要求を示す。')); return; }
    const link = (k, i, cls) => h('a', { class: 'chip ' + (cls || ''), href: api.href(k, i) }, i);
    detail.replaceChildren(
      h('h3', {}, `${t.id}　${t.title}`),
      h('div', { class: 'meta' }, `${I.phase[t.phase] || t.phase}・${t.kind === 'wait' ? '待ち（暦日）' : '作業'}・${ymd(t.s)} から ${ymd(t.s + t.days - 1)}（${t.days} 日）${critical.has(t.id) ? '・クリティカルパス' : ''}`),
      (t.after || []).length ? h('div', {}, '前の工程: ', ...t.after.map((a) => link('task', a))) : '',
      (t.parts || []).length ? h('div', {}, '作る部品: ', ...t.parts.map((p) => link('part', p, 'part'))) : '',
      (t.reqs || []).length ? h('div', {}, '確かめる要求: ', ...t.reqs.map((r) => link('req', r))) : '');
  }
  const cl = (e, name, on) => e.setAttribute('class', (e.getAttribute('class') || '').split(' ').filter((c) => c && c !== name).concat(on ? [name] : []).join(' '));
  function paint() {
    if (!leftSvg) return;
    const rel = sel && api.related ? api.related(sel) : null;
    const lit = new Set();
    if (sel) {
      if (sel.k === 'task') lit.add(sel.i);
      if (rel && rel.task) for (const x of rel.task) lit.add(x);
    }
    const has = lit.size > 0;
    for (const svg of [leftSvg, chartSvg]) cl(svg, 'has-sel', has);
    for (const [id, pair] of rowEls) for (const e of pair) { cl(e, 'hl', lit.has(id)); cl(e, 'sel', !!sel && sel.k === 'task' && sel.i === id); }
    for (const d of depEls) cl(d, 'hl', lit.has(d.dataset.from) && lit.has(d.dataset.to));
    showDetail();
  }
  return {
    el,
    enter() { build(); paint(); },
    leave() {},
    highlight(next) {
      sel = next && next.k ? next : null; paint();
      if (sel && next.reveal && scEl) {
        const first = sel.k === 'task' ? sel.i : [...(api.related ? api.related(sel).task || [] : [])][0];
        const r = first && rowEls.get(first);
        if (r && r[1].scrollIntoView) r[1].scrollIntoView({ block: 'nearest', inline: 'center', behavior: 'smooth' });
      }
    },
    params() { return {}; },
  };
}
