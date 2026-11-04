"""Japanese text for the navigator: docs/data/ja.json maps each English prose string of the
site data to its Japanese, so the record stays English and the navigator reads Japanese.

    python tools/ja.py todo [out.json]    # list the English strings that have no Japanese yet
    python tools/ja.py add <file.json>... # merge {English: Japanese} files into docs/data/ja.json
    python tools/ja.py prune              # drop Japanese whose English is no longer used
    python tools/ja.py check              # fail if a string lacks Japanese or a translation drops a token

A changed English string has no Japanese until it is translated again, so nothing goes stale.
Every value key, id, docs reference, and section number in the English must stay in the Japanese,
since the navigator finds its links in the prose.
"""
import json
import re
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
JA = ROOT / "docs" / "data" / "ja.json"

# the prose fields translated, by list in record.json; "a[].b" walks a list of dicts
FIELDS = {
    "requirements": ["text", "design_point"],
    "decisions": ["what", "options[]"],
    "open": ["text"],
    "hazards": ["text", "at_risk"],
    "parts": ["name"],
    "checks": ["detail"],
    "procedures": ["title", "steps[].action"],
    "sources": ["note", "license"],
    "sections": ["title"],
    "states": ["groups[].label", "states[].label", "transitions[].trigger"],
    "plan": ["tasks[].title"],
    "bom": ["lines[].item"],
}
TOKEN = re.compile(r"docs/[\w.\-]+\.md(?:#[\w\-]+)?|[A-Za-z][A-Za-z0-9_]*(?:\.[A-Za-z0-9_]+)+")
IDS = re.compile(r"\b(?:[RDQHKI]-\d+|OP-\d+(?:\.\d+)?|[PMSF]\d+)\b|\b\d+\.\d+\.\d+\b")


def load():
    if not JA.exists():
        return {}
    return json.loads(JA.read_text(encoding="utf-8"))["text"]


def save(table):
    body = {"schema": 1, "text": dict(sorted(table.items()))}
    JA.write_text(json.dumps(body, ensure_ascii=False, indent=1) + "\n", encoding="utf-8", newline="\n")


def slots(data):
    """Yield (container, key) for every translated string in the site data."""
    def walk(obj, path):
        head, _, rest = path.partition(".")
        if head.endswith("[]"):
            name = head[:-2]
            seq = obj.get(name) or []
            if not rest:
                for i, s in enumerate(seq):
                    if isinstance(s, str):
                        yield seq, i
            else:
                for it in seq:
                    if isinstance(it, dict):
                        yield from walk(it, rest)
        elif not rest:
            if isinstance(obj.get(head), str):
                yield obj, head
        elif isinstance(obj.get(head), dict):
            yield from walk(obj[head], rest)

    for name, fields in FIELDS.items():
        block = data.get(name)
        items = block if isinstance(block, list) else [block] if isinstance(block, dict) else []
        for it in items:
            for f in fields:
                yield from walk(it, f)


def tokens(text, keys):
    out = set(IDS.findall(text))
    for m in TOKEN.finditer(text):
        tok = m.group(0)
        if tok.startswith("docs/"):
            out.add(tok)
            continue
        k = tok
        while k:   # the longest prefix that is a value key, as the navigator reads it
            if k in keys:
                out.add(k)
                break
            k = k.rpartition(".")[0]
    return out


def dropped(en, ja, keys):
    return sorted(t for t in tokens(en, keys) if t not in ja)


def apply(data):
    """Put the Japanese into the site data in place; return the English strings still missing."""
    table, keys = load(), {v["key"] for v in data.get("values", [])}
    missing = []
    for box, k in slots(data):
        en = box[k]
        if en in table and not dropped(en, table[en], keys):
            box[k] = table[en]
        else:
            missing.append(en)
    return sorted(set(missing))


def english(data):
    return sorted({box[k] for box, k in slots(data)})


def site_data():
    sys.path.insert(0, str(ROOT / "tools"))
    import gen_site_data
    return gen_site_data.build_data()


def main():
    cmd = sys.argv[1] if len(sys.argv) > 1 else "check"
    data = site_data()
    keys = {v["key"] for v in data.get("values", [])}
    table = load()
    if cmd == "todo":
        todo = [s for s in english(data) if s not in table or dropped(s, table[s], keys)]
        text = json.dumps(todo, ensure_ascii=False, indent=1) + "\n"
        if len(sys.argv) > 2:
            Path(sys.argv[2]).write_text(text, encoding="utf-8", newline="\n")
            print(f"{len(todo)} strings to translate")
        else:
            sys.stdout.write(text)
    elif cmd == "add":
        used, bad = set(english(data)), 0
        for f in sys.argv[2:]:
            for en, ja in json.loads(Path(f).read_text(encoding="utf-8")).items():
                if en not in used:
                    print(f"not in the site data: {en[:70]!r}")
                    bad += 1
                    continue
                lost = dropped(en, ja, keys)
                if lost:
                    print(f"drops {', '.join(lost)}: {en[:70]!r}")
                    bad += 1
                    continue
                table[en] = ja
        save(table)
        print(f"{len(table)} strings in docs/data/ja.json; {bad} refused")
    elif cmd == "prune":
        used = set(english(data))
        kept = {en: ja for en, ja in table.items() if en in used}
        save(kept)
        print(f"dropped {len(table) - len(kept)}")
    elif cmd == "check":
        missing = [s for s in english(data) if s not in table or dropped(s, table[s], keys)]
        unused = [en for en in table if en not in set(english(data))]
        for s in missing[:10]:
            print(f"no Japanese: {s[:90]!r}")
        if unused:
            print(f"{len(unused)} unused entries; run python tools/ja.py prune")
        if missing:
            print(f"{len(missing)} strings lack Japanese; run python tools/ja.py todo")
            sys.exit(1)
        print("ok")
    else:
        raise SystemExit(__doc__)


if __name__ == "__main__":
    main()
