// Pure module: index the record, build the relation graph and the plan schedule. No DOM.
export const KINDS = ['req', 'dec', 'open', 'haz', 'check', 'src', 'value', 'part', 'proc', 'task', 'bom', 'iface'];
const LISTS = { req: 'requirements', dec: 'decisions', open: 'open', haz: 'hazards', check: 'checks', src: 'sources' };
export const REF_FIELDS = ['basis', 'touches', 'affects', 'controls', 'target', 'closed_by', 'supersedes', 'parent', 'parts', 'reqs', 'after', 'between'];
export const PROSE_FIELDS = ['text', 'design_point', 'expected', 'what', 'note', 'detail', 'action'];

const TOKEN = /docs\/[\w.\-]+\.md(?:#[\w\-]+)?|[A-Za-z][A-Za-z0-9_]*(?:\.[A-Za-z0-9_]+)+/g;

export function asArray(x) { return x == null ? [] : Array.isArray(x) ? x : [x]; }

// docs/03-design.md#frame -> ../03-design/#frame
export function docsHref(ref) {
  const m = /^docs\/([\w.\-]+)\.md(?:#([\w\-]+))?$/.exec(ref);
  if (!m) return null;
  const page = m[1] === 'index' ? '' : m[1] + '/';
  return '../' + page + (m[2] ? '#' + m[2] : '');
}

// Split prose into segments: text, known value key, docs reference.
export function scan(text, valueKeys) {
  const out = [];
  let last = 0;
  const s = String(text ?? '');
  for (const m of s.matchAll(TOKEN)) {
    const tok = m[0];
    let seg = null;
    if (tok.startsWith('docs/')) seg = { t: 'docs', ref: tok };
    else {
      let k = tok;
      while (k) {
        if (valueKeys.has(k)) { seg = { t: 'key', key: k }; break; }
        const d = k.lastIndexOf('.');
        if (d < 0) break;
        k = k.slice(0, d);
      }
    }
    if (!seg) continue;
    const len = seg.t === 'docs' ? tok.length : seg.key.length;
    if (m.index > last) out.push({ t: 'text', s: s.slice(last, m.index) });
    out.push(seg);
    last = m.index + len;
  }
  if (last < s.length) out.push({ t: 'text', s: s.slice(last) });
  return out;
}

export function buildIndex(record) {
  const byId = new Map();
  for (const [kind, list] of Object.entries(LISTS)) for (const item of record[list] || []) byId.set(item.id, { kind, item });
  for (const p of record.parts || []) byId.set(p.id, { kind: 'part', item: p });
  for (const p of record.procedures || []) {
    byId.set(p.id, { kind: 'proc', item: p });
    for (const s of p.steps || []) byId.set(s.id, { kind: 'proc', item: { ...s, procedure: p.id } });
  }
  for (const t of (record.plan && record.plan.tasks) || []) byId.set(t.id, { kind: 'task', item: t });
  for (const i of record.interfaces || []) byId.set(i.id, { kind: 'iface', item: i });
  const values = new Map((record.values || []).map((v) => [v.key, v]));
  const valueKeys = new Set(values.keys());
  const kindOf = (ref) => (byId.has(ref) ? byId.get(ref).kind : values.has(ref) ? 'value' : String(ref).startsWith('docs/') ? 'docs' : null);
  const get = (ref) => (byId.has(ref) ? byId.get(ref).item : values.get(ref) || null);

  const out = new Map();
  const inc = new Map();
  function add(from, to) {
    if (from === to || !kindOf(to)) return;
    if (!out.has(from)) out.set(from, new Set());
    if (!inc.has(to)) inc.set(to, new Set());
    out.get(from).add(to);
    inc.get(to).add(from);
  }
  function addProse(id, text) {
    for (const seg of scan(text, valueKeys)) {
      if (seg.t === 'key') add(id, seg.key); else if (seg.t === 'docs') add(id, seg.ref);
    }
  }
  const nodes = [...byId.entries()].map(([id, { item }]) => [id, item]).concat([...values.entries()]);
  for (const [id, item] of nodes) {
    for (const f of REF_FIELDS) for (const r of asArray(item[f])) if (typeof r === 'string') add(id, r);
    for (const f of PROSE_FIELDS) addProse(id, item[f]);
    for (const r of asArray(item.values)) if (typeof r === 'string') add(id, r);
    for (const o of asArray(item.options)) addProse(id, typeof o === 'string' ? o : JSON.stringify(o));
    if (item.procedure) add(item.procedure, id);
  }
  // a bom line's price key and a plan task are cited from the lines (lines are not nodes)
  const superseded = new Set();
  for (const d of record.decisions || []) for (const r of asArray(d.supersedes)) superseded.add(r);
  const toArr = (m) => new Map([...m].map(([k, s]) => [k, [...s]]));
  return { byId, values, valueKeys, kindOf, get, out: toArr(out), inc: toArr(inc), superseded };
}

// ---------- schedule: every day a working day, waits in calendar days ----------
const DAY = 86400000;
const iso = (ms) => new Date(ms).toISOString().slice(0, 10);
export function computeSchedule(record) {
  const plan = record.plan || { start: '2026-01-01', tasks: [] };
  const byId = new Map(plan.tasks.map((t) => [t.id, t]));
  const done = new Map();
  const startMs = Date.parse(plan.start + 'T00:00:00Z');
  const visit = (t, stack = []) => {
    if (done.has(t.id)) return done.get(t.id);
    if (stack.includes(t.id)) throw new Error('plan loop at ' + t.id);
    let s = startMs;
    for (const a of asArray(t.after)) {
      const p = byId.get(a);
      if (p) s = Math.max(s, visit(p, [...stack, t.id]).endMs + DAY);
    }
    const days = Math.max(1, t.days || 1);
    const r = { ...t, startMs: s, endMs: s + (days - 1) * DAY };
    r.start = iso(r.startMs); r.end = iso(r.endMs);
    done.set(t.id, r);
    return r;
  };
  return plan.tasks.map((t) => visit(t));
}

// ---------- everything linked to a selection ----------
export function makeRelated(record, idx, pk) {
  const { partsForKey, keysForPart } = pk;
  const allKeys = [...idx.valueKeys];
  const parts = record.parts || [];
  const children = new Map();
  for (const p of parts) if (p.parent) (children.get(p.parent) || children.set(p.parent, []).get(p.parent)).push(p.id);
  const descendants = (id) => { const o = [id]; for (const c of children.get(id) || []) o.push(...descendants(c)); return o; };

  const reqKeys = new Map(), reqParts = new Map();
  for (const r of record.requirements) {
    const ks = new Set();
    for (const f of ['design_point', 'text', 'expected']) for (const s of scan(r[f], idx.valueKeys)) if (s.t === 'key') ks.add(s.key);
    reqKeys.set(r.id, ks);
    const ps = new Set(asArray(r.parts));
    for (const k of ks) for (const p of partsForKey(k)) ps.add(p);
    reqParts.set(r.id, ps);
  }
  const hazByControl = new Map();
  for (const hz of record.hazards) for (const c of asArray(hz.controls)) (hazByControl.get(c) || hazByControl.set(c, []).get(c)).push(hz.id);
  const stepOf = new Map(); // step id -> procedure id
  for (const p of record.procedures || []) for (const s of p.steps || []) stepOf.set(s.id, p.id);
  const tasks = (record.plan && record.plan.tasks) || [];
  const lines = (record.bom && record.bom.lines) || [];

  return function related(sel) {
    const o = { req: new Set(), part: new Set(), haz: new Set(), proc: new Set(), value: new Set(), task: new Set(), bom: new Set(), dec: new Set(), open: new Set(), src: new Set(), check: new Set() };
    if (!sel || !sel.i) return o;
    const { k, i } = sel;
    const seedParts = new Set(), seedReqs = new Set(), seedControls = new Set();
    const addPart = (p) => { for (const d of descendants(p)) seedParts.add(d); };
    if (o[k] && k !== 'bom') o[k].add(i);
    if (k === 'bom') o.bom.add(String(i));
    // direct neighbours through the reference graph
    for (const r of [...(idx.out.get(i) || []), ...(idx.inc.get(i) || [])]) {
      const kk = idx.kindOf(r);
      if (kk === 'proc') o.proc.add(r);
      else if (o[kk] && kk !== 'part' && kk !== 'haz') o[kk].add(r);
    }
    if (k === 'req') {
      seedReqs.add(i); seedControls.add(i);
      for (const p of reqParts.get(i) || []) addPart(p);
      for (const x of reqKeys.get(i) || []) o.value.add(x);
    } else if (k === 'value') {
      for (const p of partsForKey(i)) addPart(p);
      for (const r of record.requirements) if (reqKeys.get(r.id).has(i)) o.req.add(r.id);
      lines.forEach((l, n) => { if (l.price === i) o.bom.add(String(n)); });
      for (const [sid, pid] of stepOf) { const s = idx.get(sid); if (asArray(s.values).includes(i)) { o.proc.add(sid); o.proc.add(pid); } }
    } else if (k === 'part') {
      addPart(i);
      for (const r of record.requirements) if ([...seedParts].some((p) => reqParts.get(r.id).has(p))) { o.req.add(r.id); seedReqs.add(r.id); }
      for (const x of keysForPart(i, allKeys)) o.value.add(x);
      for (const f of record.interfaces || []) if (f.between.includes(i)) for (const b of f.between) seedParts.add(b);
    } else if (k === 'haz') {
      const hz = idx.get(i);
      for (const c of asArray(hz.controls)) {
        if (idx.kindOf(c) === 'req') { o.req.add(c); seedReqs.add(c); for (const p of reqParts.get(c) || []) addPart(p); }
        else if (idx.kindOf(c) === 'proc') { o.proc.add(c); if (stepOf.has(c)) o.proc.add(stepOf.get(c)); }
      }
    } else if (k === 'proc') {
      const steps = stepOf.has(i) ? [i] : (idx.get(i)?.steps || []).map((s) => s.id);
      for (const sid of steps) {
        const s = idx.get(sid); o.proc.add(sid); o.proc.add(stepOf.get(sid)); seedControls.add(sid);
        for (const x of asArray(s.values)) o.value.add(x);
        for (const hid of asArray(s.controls)) o.haz.add(hid);
        for (const x of asArray(s.limits)) if (typeof x === 'string' && idx.kindOf(x) === 'value') o.value.add(x);
      }
      for (const x of o.value) for (const p of partsForKey(x)) addPart(p);
    } else if (k === 'task') {
      const t = idx.get(i);
      for (const p of asArray(t.parts)) addPart(p);
      for (const r of asArray(t.reqs)) { o.req.add(r); seedReqs.add(r); seedControls.add(r); }
      for (const t2 of tasks) { if (asArray(t2.after).includes(i) || asArray(t.after).includes(t2.id)) o.task.add(t2.id); }
      lines.forEach((l, n) => { if (l.need === i) o.bom.add(String(n)); });
    } else if (k === 'bom') {
      const l = lines[Number(i)];
      if (l) { addPart(l.part); if (l.need) o.task.add(l.need); if (idx.valueKeys.has(l.price)) o.value.add(l.price); }
    } else if (k === 'iface') {
      for (const b of idx.get(i).between) addPart(b);
    }
    // hazards whose controls cite the requirement or step, and what else they cite
    for (const c of seedControls) for (const hid of hazByControl.get(c) || []) o.haz.add(hid);
    if (k !== 'haz') {
      for (const hid of o.haz) for (const c of asArray(idx.get(hid)?.controls)) {
        if (idx.kindOf(c) === 'req') o.req.add(c);
        else if (idx.kindOf(c) === 'proc') { o.proc.add(c); if (stepOf.has(c)) o.proc.add(stepOf.get(c)); }
      }
    }
    // through the parts: their BOM lines and plan tasks
    for (const p of seedParts) o.part.add(p);
    if (k !== 'iface' || true) {
      lines.forEach((l, n) => { if (seedParts.has(l.part)) { o.bom.add(String(n)); if (l.need) o.task.add(l.need); } });
      for (const t of tasks) if (asArray(t.parts).some((p) => seedParts.has(p))) o.task.add(t.id);
      for (const t of tasks) if (asArray(t.reqs).some((r) => seedReqs.has(r))) o.task.add(t.id);
    }
    return o;
  };
}
