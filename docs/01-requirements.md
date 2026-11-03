# 1.1 Requirements

Why each requirement in record/requirements.yaml is what it is. Start with the questions that can rule a form out.

The thing is one go-kart for the owner's private land, driven mainly by a child and also by an adult, in summer and in winter (D-001).
The power source is not preset; 1.2 compares an engine and an electric drive.

## 1.1.1 Questions that can rule a form out {#questions}

Asked on 2026-11-03, before any form was compared.

| Question | Answer recorded as |
|----------|--------------------|
| Where the kart runs, and the law there | D-005 (private land only, no public road), D-006 (snow) |
| Who drives | D-001, D-004 (child speed, adult strength and fit), Q-001, Q-002 |
| Top speed | D-003 |
| Ground in summer | D-005 |
| Snow in winter | D-006, Q-003 |
| Lowest temperature in use | D-007 |
| Budget and what it includes | D-008 |
| Builder's tools and skills | D-008 (tools outside the budget; a welder may be bought) |
| Power source | D-001 (not preset) |
| Storage and transport | Q-006 |
| Session length, use, and when it must be ready | Q-007 |
| Slopes on the land | Q-008 |
| Where the record lives, and its language | D-002 |

Because the kart never runs on a public road (D-005), road vehicle rules for small vehicles do not shape the form.
Whether a piece of private land counts as a road when other people pass through it is checked in 1.2 with the law text, and is written as a source.

## 1.1.2 Requirements {#list}

<!-- tdr:table kind=requirement fields=id,text,design_point,verify,status -->
| id | text | design_point | verify | status |
|---|---|---|---|---|
| R-01 | The kart is not faster than a speed set for a child. | Top speed on level paved ground, with the lightest and with the heaviest rider, is at most kart.speed_max_kmh. | test | confirmed |
| R-02 | The kart carries an adult. | Frame, axles, steering, seat, and their joints carry a rider of rider.mass_max_kg under the load cases of docs/03-design.md without yield or loosening. | analysis | confirmed |
| R-03 | The seat and pedals fit a child and an adult. | Without welding or cutting, the seat-to-pedal distance and the seat height adjust so that riders from rider.stature_min_cm to rider.stature_max_cm reach the pedals fully and hold the steering wheel with bent arms. | demonstration | confirmed |
| R-04 | The kart runs on paved ground, gravel or dirt, and grass. | With the heaviest rider, on each of the three surfaces, the kart starts from rest, runs, turns, and stops, climbs site.grade_max_pct, and no part other than the tyres touches the ground. | test | confirmed |
| R-05 | The kart runs on packed snow and ice. | With the heaviest rider, on level packed snow, the kart starts from rest, runs, turns, and stops. | test | confirmed |
| R-06 | The kart runs in fresh snow. | With the heaviest rider, on level fresh snow of depth snow.depth_max_cm, the kart starts from rest, runs, and turns without getting stuck. | test | confirmed |
| R-07 | The kart works in the cold. | After standing at ambient.temp_min_c, the kart starts and runs for kart.run_time_min. | test | confirmed |
| R-08 | The kart is built within the budget. | The parts list of docs/05-parts-and-cost.md, with tax, shipping, and winter parts, totals at most budget.parts_jpy, or the owner has accepted the excess. | inspection | confirmed |
| R-09 | The kart stops in a short distance. | With the heaviest rider, from kart.speed_max_kmh on level dry paved ground, the kart stops within kart.stop_distance_max_m. | test | awaiting |
| R-10 | The drive stops when the driver lets go. | The throttle returns to zero by a spring when released, and a stop switch that the driver reaches from the seat, and a helper reaches from beside the kart, cuts the drive. | demonstration | awaiting |
| R-11 | Moving and hot parts cannot be touched. | Chain, sprockets, belt, the turning axle near the seat, and any hot part are covered so that the driver's hands, feet, hair, and clothing cannot reach them from the seat. | inspection | awaiting |
| R-12 | The kart slides before it tips over. | With the heaviest rider, half the track width divided by the height of the centre of mass is at least kart.tip_ratio_min, on every wheel or ski setup. | analysis | awaiting |
| R-13 | The frame shields the driver's legs and feet. | Seen from the front and the sides, the driver's feet and legs are inside the frame or a bumper. | inspection | awaiting |
<!-- tdr:end -->

R-01 to R-08 restate the owner's answers.
R-09 to R-13 are derived from the hazards in 1.1.4 and wait for the owner to confirm them.

## 1.1.3 Why each requirement is as it is {#why}

- **R-01 speed.** The owner set the speed for a child (D-003). The limit holds with the lightest rider too, because a light rider makes the kart faster on the same drive.
- **R-02 strength.** The owner wants an adult to drive (D-004). The adult's mass is assumed in rider.mass_max_kg until Q-001 is answered. The load cases (bumps, braking, a kerb hit) are set in 1.3.
- **R-03 fit.** One kart must fit both a child and an adult (D-004). Adjustment without welding or cutting lets the owner switch drivers on the spot. The range in rider.stature_min_cm and rider.stature_max_cm is assumed until Q-002 is answered, and then set from body dimension data.
- **R-04 ground.** The owner named three grounds (D-005). Gravel and grass set the tyre size and the clearance; slopes set the drive (Q-008).
- **R-05 and R-06 snow.** The owner wants both packed snow and fresh snow up to snow.depth_max_cm (D-006). The requirement on snow is only that the kart runs, turns, and stops. Whether the top speed applies on snow waits for Q-003.
- **R-07 cold.** The owner set ambient.temp_min_c (D-007). How long the kart stands in the cold before a run depends on where it is kept (Q-006).
- **R-08 budget.** budget.parts_jpy covers parts and materials with tax, shipping, and winter parts, and excludes tools (D-008). It is a guideline: when the total is likely to pass it, the assistant names the parts that drive it and the owner decides.
- **R-09 braking.** A child at speed near people and buildings needs a short stop (H-01), and snow lowers the grip (H-07). The value kart.stop_distance_max_m is assumed until Q-004 settles it from a standard.
- **R-10 dead-man drive.** A child may freeze or let go (H-02). A spring-return throttle and a stop switch that a helper can reach are the usual controls.
- **R-11 guards.** Winter clothing and scarves are long and loose (H-03). Engines have hot exhausts, and motors and batteries heat up (H-04).
- **R-12 slide before tipping.** A kart without a roll bar must slide sideways before it tips (H-05). An adult raises the centre of mass, and the snow setup may raise it more. kart.tip_ratio_min is assumed until Q-005.
- **R-13 leg shield.** In a hit the driver's legs are the first thing to meet an obstacle (H-01).

## 1.1.4 Hazards {#hazards}

<!-- tdr:table kind=hazard fields=id,text,at_risk,controls -->
| id | text | at_risk | controls |
|---|---|---|---|
| H-01 | The kart hits an obstacle, a building, a vehicle, or a person. | The driver and people nearby. | R-01, R-09, R-13 |
| H-02 | The drive keeps pushing after the driver lets go or loses control. | The driver and people nearby. | R-10 |
| H-03 | Hair, clothing such as a scarf, or fingers are caught in the chain, sprockets, belt, or turning axle. | The driver and helpers. | R-11 |
| H-04 | The driver touches a hot engine, exhaust, or motor, or the battery overheats or burns. | The driver and helpers. | R-11 |
| H-05 | The kart tips over in a turn or on a slope. | The driver. | R-12 |
| H-06 | The steering, an axle, the frame, or the seat breaks under an adult. | The driver. | R-02 |
| H-07 | Braking or steering is lost on snow or ice. | The driver and people nearby. | R-05, R-09 |
<!-- tdr:end -->

H-04 covers both an engine and a battery; the hazards particular to the chosen power source (exhaust gas in a closed shed, fuel, charging) are added when 1.2 selects it.
Cold injury of a child in winter is handled by an operating procedure in step 3 (operation), not by the kart.

## 1.1.5 Tensions the form must resolve {#tensions}

These are not decided here. 1.2 compares forms against them.

1. **Fresh snow against paved ground.** R-06 at snow.depth_max_cm needs a large footprint and a high floor, so that the kart floats and the frame does not plough. R-01, R-04 on paved ground, and R-12 favour a low kart with a low centre of mass. One form may not serve both; a kit that swaps wheels for skis or tracks in winter is a candidate.
2. **Budget against winter.** R-08 includes the winter parts. Tracks and large low-pressure tyres are the parts most likely to pass budget.parts_jpy.
3. **Adult strength against child speed.** The drive is sized by the heaviest rider (rider.mass_max_kg) on slopes (site.grade_max_pct) and in snow, while R-01 caps the speed. The speed must be limited by gearing, a governor, or a controller setting, not by a weak drive.
4. **Cold against batteries.** R-07 at ambient.temp_min_c affects batteries more than engines, especially charging. 1.2 takes the limits from cell makers' data.

## 1.1.6 Values used by the requirements {#values}

<!-- tdr:table kind=value fields=key,v,unit,status,basis -->
| key | v | unit | status | basis |
|---|---|---|---|---|
| kart.seats | 1 |  | decided | D-001 |
| kart.speed_max_kmh | 30 | km/h | decided | D-003 |
| snow.depth_max_cm | 30 | cm | decided | D-006 |
| ambient.temp_min_c | -10 | degC | decided | D-007 |
| budget.parts_jpy | 100000 | JPY | decided | D-008 |
| rider.mass_max_kg | 100 | kg | assumed | Q-001 |
| rider.stature_min_cm | 120 | cm | assumed | Q-002 |
| rider.stature_max_cm | 185 | cm | assumed | Q-002 |
| site.grade_max_pct | 10 | % | assumed | Q-008 |
| kart.run_time_min | 30 | min | assumed | Q-007 |
| kart.stop_distance_max_m | 6 | m | assumed | Q-004 |
| kart.tip_ratio_min | 1.5 |  | assumed | Q-005 |
<!-- tdr:end -->

## 1.1.7 Open items {#open}

<!-- tdr:table kind=open fields=id,text,waits_for -->
| id | text | waits_for |
|---|---|---|
| Q-001 | How heavy is the heaviest adult who will drive? The strength is assumed for 100 kg until the owner answers. | owner |
| Q-002 | How old and how tall is the youngest child who will drive, and how tall is the tallest adult? The seat and pedal range is assumed from 120 cm to 185 cm stature until the owner answers, and is then set from body dimension data. | owner |
| Q-003 | Does the top speed of 30 km/h have to be reached on snow, or is a lower speed enough on packed snow and in fresh snow? R-05 and R-06 ask only that the kart runs, turns, and stops on snow. | owner |
| Q-004 | Set the longest stopping distance from the top speed from a go-kart standard or kart rules. Until then it is assumed at 6 m, about 0.6 g. | assistant |
| Q-005 | Set the smallest ratio of half the track width to the height of the centre of mass, so that the kart slides before it tips, from tyre friction data and any standard. Until then it is assumed at 1.5. | assistant |
| Q-006 | Where is the kart kept (indoors, under a roof, outdoors), and must it be carried in a car or a truck? This sets the size and mass limits and whether it stands in the cold before a run. | owner |
| Q-007 | How long is one session of driving, how often is the kart used, and by when should it be ready? The run time per charge or tank is assumed at 30 min until the owner answers. | owner |
| Q-008 | What is the steepest slope the kart must climb on the land? It is assumed at 10 % until the owner answers. | owner |
<!-- tdr:end -->
