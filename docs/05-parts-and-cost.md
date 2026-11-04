# 1.5 Parts and cost

The parts list lives in `docs/data/bom.yaml`: each line names its part, how many, and the value key that holds its unit price, so every price stays in one place in the record. The navigator's procurement mode shows the list with prices, sources, and when each is needed.

## 1.5.1 Totals {#totals}

- Parts and materials, including the winter parts, shipping, and small parts: dsn.bom_parts_jpy, against the guideline budget.parts_jpy (R-08, D-008).
- Tools outside the budget (a welder and two loading rails): dsn.bom_tools_jpy.

The list is the cut one of D-033. It is still above the guideline; the owner chose to keep building.

## 1.5.2 What drives the cost {#drivers}

- The donor scooter, a running Tact of the AF79 class at cost.donor_scooter_jpy, the cheaper of the running donors seen (M76); it brings the engine unit, seat, handlebar, levers, lamps, mirrors, and horn.
- The ATV wheels with tyres, cost.atv_wheels_set_jpy for four (M96).
- The front end: ATV knuckles with 17 mm spindles (cost.atv_knuckle_pair_jpy a pair, M92) and two drum brake hubs (cost.atv_drum_hub_jpy each, M93), which carry the second brake system as on the ATVs of 1.5.3, with an allowance for shoes, cables, and a splitter.
- The rear: the hydraulic brake kit (M42), the axle, its three bearings, the made hubs, and machining (Q-018).
- The winter parts: the pan's sheet cut to order (half a square metre, M57, M82), ski runners, the ski brackets made in house, and the rear chains (M15).
- The steel for the frame and the hoop.

What the cut list changed, against the list before D-033: the donor at the lower price (M76), the front end on ATV parts in place of kart spindles, hubs, and an allowance for cable discs, an LCD meter with its own sensor (M94) in place of a meter and sensor bought apart, ATV fenders as sold (M95), the pan's sheet bought by the area it needs, and the ski brackets welded from the frame's steel. The wheels with tyres were priced and came below their allowance.

Ways further down, each a change for the owner to decide:

- Build the summer kart first and leave the winter parts (pan, runners, brackets, chains) for the first winter.
- Take the front end, wheels, rear axle, brakes, and fenders from a non-running 50 cc ATV bought as parts (M99 lists restoration bases at about 10,000 to 50,000 JPY); this changes the frame's mounting points to that ATV's parts.
- A cheaper rear brake or tyre chains listed for ATVs were seen but not confirmed on their item pages.

## 1.5.3 Against buying one {#buy}

- A new road-registered 50 cc ATV costs cost.atv_sl50w_kit_jpy as a kit or cost.atv_sl50w_built_jpy assembled, with the sales certificate needed to register it free (M98); the one the owner compared costs cost.atv_sporty50_jpy plus setup (M97). They have suspension front and rear, which the kart does not, and run faster than the kart's limit.
- Used ones that run and have papers sell mostly at cost.atv_used_low_jpy to cost.atv_used_high_jpy (M99).
- What the home build gives that they do not: the protective hoop and the speed kept to kart.speed_max_kmh (R-01, R-19), the steps that let a child of six ride (D-030), the winter skis (D-032), and a kart sized for the car (R-14). The owner chose to build (D-033).
