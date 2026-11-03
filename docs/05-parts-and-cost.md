# 1.5 Parts and cost

The parts list lives in `docs/data/bom.yaml`: each line names its part, how many, and the value key that holds its unit price, so every price stays in one place in the record. The navigator's procurement mode shows the list with prices, sources, and when each is needed.

## 1.5.1 Totals {#totals}

- Parts and materials, including the winter parts, shipping, and small parts: dsn.bom_parts_jpy, against the guideline budget.parts_jpy (R-08, D-008).
- Tools outside the budget (a welder and two loading rails): dsn.bom_tools_jpy.

The design built from new parts readily available in Japan costs about twice the guideline, and more than the rough estimate of 1.2 (cost.total_l2_e1_w1_jpy), which priced cheaper kit parts. The assistant names the parts that drive it, as D-008 asks; the owner decides.

## 1.5.2 What drives the cost {#drivers}

- The front end: two front hubs, a spindle pair, four rod ends, and a steering wheel bought separately.
- The brake: a hydraulic kit, chosen for the clamp force of 1.3.5.
- Machining and made parts: the rear hubs, the disc carrier, boring and keyways (Q-018).
- The powertrain: engine, clutch, three sprockets, chain, the jackshaft and its bearings.
- The wheels with tyres, and the steel.

Ways down, each a change for the owner to decide: a complete steering and spindle kit instead of separate parts, a cable brake if its clamp force is enough, a used engine (M27), and leaving the winter parts for later.
