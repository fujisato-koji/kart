// Marks value keys with badges and turns item ids into navigator links.
// Works with Material's instant navigation (document$) and under any base path.
(function () {
  const scriptEl = document.querySelector('script[src*="record-links"]');
  const siteBase = (typeof __md_scope !== "undefined" && __md_scope)
    ? new URL(__md_scope)
    : new URL("../", new URL(scriptEl ? scriptEl.src : "javascripts/record-links.js", document.baseURI));
  const dataUrl = new URL("data/record.json", siteBase).href;
  const navUrl = new URL("navigator/", siteBase).href;

  const KINDS = [
    [/^R-\d+$/, "req"], [/^D-\d+$/, "dec"], [/^Q-\d+$/, "open"],
    [/^H-\d+$/, "haz"], [/^K-\d+$/, "check"], [/^[PSMF]\d+$/, "src"],
  ];
  const ID_RE = /(?<![\w-])(?:[RDQHK]-\d+|[PSMF]\d+)(?![\w-])/g;
  const SKIP = "pre, code, a, script, style, .headerlink, kbd";

  let valuesPromise = null;
  function loadValues() {
    if (!valuesPromise) {
      valuesPromise = fetch(dataUrl)
        .then((r) => (r.ok ? r.json() : Promise.reject(r.status)))
        .then((d) => new Map((d.values || []).map((v) => [v.key, v])))
        .catch(() => new Map());
    }
    return valuesPromise;
  }

  const esc = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

  function fmt(v) {
    const val = typeof v.v === "object" ? JSON.stringify(v.v) : String(v.v);
    return v.unit ? val + " " + v.unit : val;
  }

  function process(root, values) {
    if (root.dataset.recDone) return;
    root.dataset.recDone = "1";
    const keys = [...values.keys()].sort((a, b) => b.length - a.length);
    const keyRe = keys.length
      ? new RegExp("(?<![\\w.-])(?:" + keys.map(esc).join("|") + ")(?![\\w-]|\\.\\w)", "g")
      : null;
    const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT, {
      acceptNode(n) {
        if (!n.nodeValue.trim()) return NodeFilter.FILTER_REJECT;
        return n.parentElement && n.parentElement.closest(SKIP)
          ? NodeFilter.FILTER_REJECT : NodeFilter.FILTER_ACCEPT;
      },
    });
    const nodes = [];
    while (walker.nextNode()) nodes.push(walker.currentNode);

    for (const node of nodes) {
      const inTable = !!node.parentElement.closest("table");
      const text = node.nodeValue;
      const hits = [];
      if (keyRe && !inTable) {
        for (const m of text.matchAll(keyRe)) hits.push({ i: m.index, s: m[0], t: "key" });
      }
      for (const m of text.matchAll(ID_RE)) {
        const i = m.index, e = i + m[0].length;
        if (!hits.some((h) => i < h.i + h.s.length && e > h.i)) hits.push({ i, s: m[0], t: "id" });
      }
      if (!hits.length) continue;
      hits.sort((a, b) => a.i - b.i);
      const frag = document.createDocumentFragment();
      let pos = 0;
      for (const h of hits) {
        if (h.i > pos) frag.append(text.slice(pos, h.i));
        if (h.t === "key") {
          const v = values.get(h.s);
          frag.append(h.s);
          const b = document.createElement("span");
          b.className = "rec-badge";
          b.dataset.status = v.status || "";
          b.textContent = fmt(v);
          b.title = h.s + "\nstatus: " + (v.status || "?") +
            "\nbasis: " + ((v.basis || []).join(", ") || "none");
          frag.append(" ", b);
        } else {
          const kind = KINDS.find(([re]) => re.test(h.s))[1];
          const a = document.createElement("a");
          a.className = "rec-id";
          a.href = navUrl + "#/?k=" + kind + "&i=" + encodeURIComponent(h.s);
          a.textContent = h.s;
          frag.append(a);
        }
        pos = h.i + h.s.length;
      }
      if (pos < text.length) frag.append(text.slice(pos));
      node.replaceWith(frag);
    }
  }

  function run() {
    const root = document.querySelector(".md-content__inner");
    if (!root) return;
    loadValues().then((values) => process(root, values));
  }

  if (typeof document$ !== "undefined") document$.subscribe(run);
  else if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", run);
  else run();
})();
