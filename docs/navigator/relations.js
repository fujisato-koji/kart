// Pure module: index the record and build the relation graph. No DOM.
export const KINDS = ['req', 'dec', 'open', 'haz', 'check', 'src', 'value'];
const LISTS = { req: 'requirements', dec: 'decisions', open: 'open', haz: 'hazards', check: 'checks', src: 'sources' };
export const REF_FIELDS = ['basis', 'touches', 'affects', 'controls', 'target', 'closed_by', 'supersedes', 'parent'];
export const PROSE_FIELDS = ['text', 'design_point', 'expected', 'what', 'note', 'detail'];

const TOKEN = /docs\/[\w.\-]+\.md(?:#[\w\-]+)?|[A-Za-z][A-Za-z0-9_]*(?:\.[A-Za-z0-9_]+)+/g;

export function asArray(x) { return x == null ? [] : Array.isArray(x) ? x : [x]; }

// docs/02-form.md#snow -> ../02-form/#snow
export function docsHref(ref) {
  const m = /^docs\/([\w.\-]+)\.md(?:#([\w\-]+))?$/.exec(ref);
  if (!m) return null;
  const page = m[1] === 'index' ? '' : m[1] + '/';
  return '../' + page + (m[2] ? '#' + m[2] : '');
}

// Split prose into segments: text, known value key, docs reference.
// A token such as kart.foo.bar is matched whole, then trimmed from the right
// (longest known key first) so that "kart.foo.bar" finds key "kart.foo".
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
    for (const f of REF_FIELDS) for (const r of asArray(item[f])) add(id, r);
    for (const f of PROSE_FIELDS) addProse(id, item[f]);
    for (const o of asArray(item.options)) addProse(id, typeof o === 'string' ? o : JSON.stringify(o));
  }
  const superseded = new Set();
  for (const d of record.decisions || []) for (const r of asArray(d.supersedes)) superseded.add(r);
  const toArr = (m) => new Map([...m].map(([k, s]) => [k, [...s]]));
  return { byId, values, valueKeys, kindOf, get, out: toArr(out), inc: toArr(inc), superseded };
}
