"""Write docs/data/record.json from record/ for the site, the navigator, and the 3D simulator.

    python tools/gen_site_data.py          # write
    python tools/gen_site_data.py --check  # fail if the file is not what would be written

The JSON holds every item of every kind as written in record/*.yaml, in file order.
It carries no time stamp, so the same record always gives the same file.
"""
import importlib.util
import json
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
OUT = ROOT / "docs" / "data" / "record.json"

spec = importlib.util.spec_from_file_location("tdr", ROOT / "tools" / "tdr.py")
tdr = importlib.util.module_from_spec(spec)
spec.loader.exec_module(tdr)

# kind in tdr -> key in the JSON
KINDS = {
    "requirement": "requirements",
    "value": "values",
    "source": "sources",
    "decision": "decisions",
    "open": "open",
    "hazard": "hazards",
    "part": "parts",
    "interface": "interfaces",
    "check": "checks",
}


def build():
    rec = tdr.Record(ROOT)
    if rec.problems:
        raise SystemExit("record has problems; run python tools/tdr.py check")
    data = {"schema": 1}
    for kind, name in KINDS.items():
        data[name] = [dict(it.d) for it in rec.items.get(kind, [])]
    return json.dumps(data, ensure_ascii=False, indent=1, default=str) + "\n"


def main():
    text = build()
    if "--check" in sys.argv:
        if not OUT.exists() or OUT.read_text(encoding="utf-8") != text:
            print("docs/data/record.json is stale; run python tools/gen_site_data.py")
            sys.exit(1)
        print("ok")
        return
    OUT.parent.mkdir(parents=True, exist_ok=True)
    OUT.write_text(text, encoding="utf-8", newline="\n")
    print(f"wrote {OUT.relative_to(ROOT).as_posix()}")


if __name__ == "__main__":
    main()
