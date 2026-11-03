# Kart: a traceable design record

One go-kart with one seat, for the owner's private land, driven mainly by a child and also by an adult, on pavement, gravel, grass, packed snow, and fresh snow (D-001).
It is designed under the [traceable-design](https://github.com/traceable-design/traceable-design) standard: an AI assistant researches, calculates, and writes the record, and the owner decides.

## Where the design stands

| Step | State |
|------|-------|
| [1.1 Requirements](01-requirements.md) | Written from the owner's answers (D-001 to D-015). Derived requirements wait for the owner. |
| [1.2 Form](02-form.md) | Forms compared and a proposal made; the owner's decisions are listed in [1.2.12](02-form.md#proposal). |
| 1.3 Design, 1.4 Availability, 1.5 Parts and cost | Not started. |

The current state, generated from the record, is in [STATUS.md](https://github.com/fujisato-koji/kart/blob/main/STATUS.md).

## How to read it

- **The record** (`record/*.yaml` in the repository) holds the facts: requirements, values, sources, decisions, open items, hazards, and checks. Every value has a status and a basis.
- **These pages** hold the reasoning, one per step. They name values by key, such as kart.speed_max_kmh, and items by id, such as R-01 or P21. On this site a key shows its value beside it, and an id links to the navigator.
- **The [navigator](navigator.md)** lets you move through the whole record: what each requirement rests on, what cites a source, which open items wait for whom, and the cost against the budget.
- **The [3D simulator](simulator.md)** builds the kart from the record's values and lets you drive it in a test yard, check it against the owner's car, and run rough tests of the requirements. Grip and plough values are assumed (Q-014), so its results are illustrations, not verification.

Everything on this site comes from `record/` through `docs/data/record.json`, written by `python tools/gen_site_data.py`.
