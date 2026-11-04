# Kart: a traceable design record

One go-kart with one seat, a personal vehicle for the far outdoors (D-023): driven by a child and an adult on private land (D-001) and by an adult on roads near home as a minicar (D-019), on pavement, gravel, grass, and packed snow, and changed each winter into a snowmobile form for deep fresh snow. Driving on into a lake as a boat is kept as a future development, shown only in the 3D view (D-027).
It is designed under the [traceable-design](https://github.com/traceable-design/traceable-design) standard: an AI assistant researches, calculates, and writes the record, and the owner decides.

## Where the design stands

| Step | State |
|------|-------|
| [1.1 Requirements](01-requirements.md) | Written from the owner's answers (D-001 to D-024). Derived requirements wait for the owner. |
| [1.2 Form](02-form.md) | Forms compared; the latest pass chose the snowmobile form on the 50 cc engine for winter (D-025) and a seated ride (D-026); water use is withdrawn and kept as a future development ([1.2.16](02-form.md#outdoor), D-027). The owner then chose a straddle kart for riders of 6 and up ([1.2.18](02-form.md#straddle), D-030); 1.3 designs the straddle kart on the working basis of 1.2.18's proposals. |
| [1.3 Design](03-design.md) | The straddle kart (D-030) with the winter form W5, on a working basis the owner has still to decide; not yet buildable (Q-035). |
| [1.4 Availability](04-availability.md), [1.5 Parts and cost](05-parts-and-cost.md) | Parts of the summer form, found in Japan and priced. |

The current state, generated from the record, is in [STATUS.md](https://github.com/fujisato-koji/kart/blob/main/STATUS.md).

## How to read it

- **The record** (`record/*.yaml` in the repository) holds the facts: requirements, values, sources, decisions, open items, hazards, and checks. Every value has a status and a basis.
- **These pages** hold the reasoning, one per step. They name values by key, such as kart.speed_max_kmh, and items by id, such as R-01 or P21. On this site a key shows its value beside it, and an id links to the navigator.
- **The [navigator](navi.md)** lets you move through the whole record: what each requirement rests on, what cites a source, which open items wait for whom, and the cost against the budget.
- **The [3D simulator](simulator.md)** builds the kart from the record's values and lets you drive it in a test yard, check it against the owner's car, and run rough tests of the requirements. Grip and plough values are assumed (Q-014), so its results are illustrations, not verification.

Everything on this site comes from `record/` through `docs/data/record.json`, written by `python tools/gen_site_data.py`.
