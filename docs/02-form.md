# 1.2 Form

Candidate forms, the yardsticks, rough availability and cost of each, the comparison, and the selection.

Numbers are cited by key and listed in [docs/01-requirements.md#values](01-requirements.md#values).
The rough numbers come from `python calc/form_rough.py`, which reads its inputs from the record and writes its outputs back as calculated values.
Inputs that are only assumed so that forms can be compared wait in Q-009 (shapes and masses), Q-010 (prices), and Q-014 (grip for the simulator); 1.3 and 1.5 replace them.

## 1.2.1 Yardsticks {#yardsticks}

The requirements that separate forms are R-04 (three grounds), R-05 and R-06 (snow), R-07 (cold), R-08 (budget), R-12 (tipping), R-14 (carried in the owner's car), and R-16 (a fairly steep slope climbed slowly without damage).
R-01, R-10, and R-17 decide how the speed is limited and how the drive is cut, which differs between an engine and a motor.
The builder's tools matter too: the owner would buy a welder (D-008), so welding is allowed but is a tool cost outside the budget.

## 1.2.2 Candidates {#candidates}

The form is four choices, and the parts can come new or from a used donor.

| Choice | Candidates |
|--------|-----------|
| Layout | L1 low kart like a racing kart, on 5 inch wheels. L2 off-road kart with a raised floor and 13 inch tyres. L3 tracks all year. L5 the owner's own frame on the axle, wheels, brake, steering, and engine of a used buggy. |
| Winter setup (for L1, L2, L5) | W1 front skis bolted to the spindles and chains on the rear tyres. W2 front skis and a pair of rubber tracks in place of the rear wheels. |
| Frame | F1 welded steel tube. F2 bolted aluminium extrusion. F3 bolted steel square tube. |
| Power | E1 clone engine of the GX200 class with a centrifugal clutch. E1t the same with a torque converter. E1h a genuine Honda engine. E2 electric 1 kW kit with four 12 V batteries. E3 electric 2 kW kit with one 48 V LiFePO4 battery. |

Front skis bolted to the spindles in place of the front wheels are how ATVs and a converted shifter kart were made to run on snow (F1).
Snowblower rubber tracks are sold in Japan without sprockets or idlers (M13); a complete rear-axle track kit is sold abroad (M14).

## 1.2.3 Mass {#mass}

form.mass_total_kg is the rough kart mass kart.mass_rough_kg plus the heaviest rider rider.mass_max_kg (D-009).
A leisure kart of similar size, the GR KART, is listed in P9, and is heavier than the rough value because of its body panels.

## 1.2.4 Snow {#snow}

**Wheels in fresh snow.** CRREL's fit for wheeled vehicles (P1) gives the sinkage z = h (1 − ρ0 / ρf), where h is snow.depth_max_cm, ρ0 the initial snow density between snow.density_initial_min and snow.density_initial_max, and the final density ρf = snow.crrel_rhof_a + snow.crrel_rhof_b × p.
In P1, p is the maximum contact pressure of the wheels; tyre.pressure_kpa is used in its place and lies below the fitted range, but even p = 0 leaves the conclusion unchanged (K-001).
The sinkage is between snow.wheel_sinkage_min_cm and snow.wheel_sinkage_max_cm, more than the tyre radius, so the hubs, the axle, and its brake disc and sprocket run in the snow as well as the floor at kart.clearance_rough_mm.
A wheeled kart therefore cannot meet R-06 at snow.depth_max_cm.
In the lightest snow it clears snow.wheel_depth_limit_cm with its floor, but only snow.wheel_depth_limit_axle_cm with its lowest axle part at kart.axle_part_low_rough_mm; thin parts cut snow rather than plough it, so the real limit lies between the two.
The owner accepts a low speed on snow (D-011), which removes the speed rating of tracks and skis as a concern.

**Tracks and skis.** A pair of snowblower tracks of width track.width_mm, with track.links links of track.pitch_mm, on a sprocket and an idler of track.wheel_dia_mm, carries the rear share kart.rear_share at snow.track_pressure_kpa.
Front skis of ski.width_mm by ski.contact_length_mm carry the rest at snow.ski_pressure_kpa.
Both are close to a snowmobile's snow.snowmobile_pressure_kpa (P2).
Bekker's relation p = (kc / b + kφ) zⁿ with the three snows of P2 (snow.bekker_a_n to snow.bekker_c_kphi) gives sinkage of at most snow.track_sinkage_max_cm for the tracks and snow.ski_sinkage_max_cm for the skis, which the raised floor clears.
That assumes the belt presses evenly. A snowblower track looped over only a sprocket and an idler carries the load under those two wheels; Bekker's wheel relation z = [3W / ((3 − n)(kc + b kφ) √D)]^(2 / (2n + 1)) for each of the four wheels gives snow.track_sinkage_wheels_cm, which the floor does not clear (K-001). That sinkage exceeds the wheel diameter, outside the relation's small-sinkage range, and the exact wheel geometry gives as much or more (K-002).
Replacing the rear tyres by a track on smaller wheels also lowers the rear axle, and with it the floor, unless the track frame raises the axle (K-002).
So W1 fails R-06, and W2 is not shown to pass: the truth lies between the two track figures, P1 does not cover tracked vehicles, and P2's snows are not the owner's snow.
W2 would need road wheels between the sprocket and the idler to spread the load, which adds to cost.allow_track_gear_jpy.
A loaded-plate test in the owner's fresh snow (Q-012) settles the sinkage cheaply before the frame is given mounts for W2.
Turning a pair of tracks on a solid rear axle with ski steering is not yet assessed.

**Grip on packed snow and ice.** Car data reviewed in S1 give the sideways friction on snow ground.mu_snow with plain tyres and ground.mu_snow_chains with chains, and on ice ground.mu_ice and ground.mu_ice_chains: chains roughly double it.
Front skis need a keel or a runner to steer; this is a 1.3 item.

These are estimates: P1 was fitted for heavier vehicles, and the Bekker values come from three snows that may differ from the owner's snow. R-06 is verified by test.

## 1.2.5 Drive {#drive}

The tyre diameter tyre.dia_mm is the 13 inch outside diameter of a 13x5.00-6 tyre, as its name states, and tyre.width_mm its 5.00 inch section width.
The owner lowered the top speed to kart.speed_max_kmh (D-015, superseding D-003); each power source is geared lower, which raises the force at the tyres in the same proportion.
The engine is geared so that its governed no-load speed engine.speed_noload_rpm (assumed until Q-011) gives kart.speed_max_kmh, which enforces R-01 on level ground and uphill; running faster downhill is a 1.3 item. P4's engine.speed_rated_rpm is the speed of rated output, and gearing to it would let the kart pass kart.speed_max_kmh (K-001).
A motor is geared at its rated speed here, which is below its no-load speed, so the electric figures are generous to the motors (K-003).

The kart must climb a fairly steep slope slowly without damage (R-16, D-014), assumed at site.grade_max_pct until Q-008.
On long grass, with the rolling resistance ground.crr_max of ATV tyres (P24), that needs drive.climb_force_n.

- E1: the maximum power engine.power_max_kw at engine.speed_rated_rpm (P4), the reduction drive.engine_ratio, and drive.efficiency give drive.engine_thrust_n at the rear tyres; at the continuous rating engine.power_cont_kw it is drive.engine_thrust_cont_n. Both are above drive.climb_force_n. A clone is assumed to match the genuine engine; 1.3 checks the chosen engine's data. The rolling resistance ground.crr_max was measured on larger ATV tyres; smaller tyres sink further in grass and need more (K-003).
- **Grip, not power, limits the climb on grass.** The rear tyres must pass drive.climb_force_n to the ground. Even with the load moving rearward on the slope, that needs a friction coefficient near the assumed ground.mu_grass, which is not from a source (Q-014). The simulator's R-16 test (see the 3D simulator) shows the kart climbing site.grade_max_pct on short grass with its rear tyres spinning much of the way, and not climbing it on long grass; on gravel it climbs. More grip (tyres with a turf or knobbly tread), more of the mass over the rear axle, or a gentler slope are the ways out, and 1.3 takes them up with the owner's answer to Q-008.
- E2: a motor's force is its rated torque scaled by the controller's current over the motor's rated current. The 1 kW motor (motor.torque_rated_nm, motor.current_rated_a, M5) on its kit's controller (motor.controller_a, M3) gives drive.motor_thrust_n. The torque comes from a brushed motor and the price from a brushless kit, so the two do not describe one product.
- E3: the 2 kW motor (motor2.torque_rated_nm at motor2.speed_rated_rpm, M19, seen only as an excerpt) on its kit's controller (motor2.controller_a) gives drive.motor2_thrust_n.
- Both electric kits fall short of drive.climb_force_n on grass, and of the slope alone on pavement (K-002). The 2 kW data do not agree with each other: its torque at its speed is more shaft power than its current can supply, so motor2.current_rated_a is probably the controller's rating copied over (K-002). If the controllers limit the battery current rather than the motor current, a motor can take more current on a slow climb; that is not assessed.
- Battery run time is marginal rather than failing. One 48 V pack of battery.energy_wh (M21), at a mean speed drive.speed_avg_kmh on grass with the heaviest rider, draws drive.power_avg_heavy_w and lasts battery.run_time_heavy_min, just over kart.run_time_min (D-013); long grass, slopes, starts, and cold shorten it (K-003).
- On level long grass at kart.speed_max_kmh the drive must deliver drive.grass_power_kw, within E1 and close to what E3 delivers on its own controller.
- **Clutch.** A generic centrifugal clutch begins to grip at clutch.engage_rpm and locks at clutch.lock_rpm (M23). Geared as above, it lets go below drive.clutch_engage_kmh and slips at any steady speed below drive.clutch_lock_kmh; it starts the kart from rest by slipping. A seller quoting the clutch maker warns that driving too slowly, restricting the throttle, hills, and deep grass ruin a clutch, and that rear wheels over 15 inch need a torque converter (M23).
- With full throttle the clutch locks within a moment, because the rear tyres spin up when grip runs out (simulator); so on a slope it is the tyres, not the clutch, that slip. Creeping up at part throttle, or holding the kart on the slope with the throttle, slips the clutch instead. The rule for E1 is therefore to climb at full throttle, and to stop on a slope with the brake, not the throttle; a restart on the slope slips the clutch for a few seconds (K-003). Climbing at the lock speed is not the slow climb the owner allowed (D-014), which the owner should accept or not.
- E1t, a torque converter (M24: low ratio tc.ratio_low, high ratio tc.ratio_high; a clone kit costs cost.tc_kit_jpy, M25), keeps the engine above lock while the kart creeps, and suits slow climbing and deep snow. At the earlier top speed it would have been needed for the slope as well; lowering the top speed (D-015) is what lets the cheaper clutch stand.
- The child limit of R-17 must lower the governed speed, not restrict the throttle, because a restricted throttle keeps the clutch slipping (M23). A child limit whose governed speed falls near or below the lock speed keeps the clutch slipping at the limit, so a child limit much below kart.speed_child_kmh needs E1t (K-003).
- The clone engines found (M18) do not state a governor, while the genuine engine has one (P5). A clone must have a working governor, checked when it arrives, or R-01 fails.
- One chain from a sprocket.engine_teeth tooth clutch sprocket of pitch sprocket.pitch_mm (chain size 40, 1/2 inch by its name, which the clutch of M2 takes) to the axle would need an axle sprocket whose teeth reach to drive.sprocket_reach_mm above the ground. A second reduction stage (a jackshaft) is needed; its rough price is cost.allow_reduction_jpy.

## 1.2.6 Stability {#stability}

With the heaviest rider seated rider.cg_above_seat_m above a seat seat.above_floor_rough_m over the floor, and the kart's own centre at kart.cg_height_rough_m, the centre of mass is at form.cg_height_m.
R-12 with kart.tip_ratio_min then needs a track of at least form.track_min_m on level ground.
With its tyres the kart is form.width_overall_m wide, close to a leisure kart's kart.ref_leisure_width_mm (P9). Kart rules ask for a track of at least two thirds of the wheelbase (P10). The track was rounded up to whole centimetres.
Standing sideways on site.grade_max_pct, the same margin needs form.track_min_slope_m, far wider than a leisure kart and than the owner's car can carry (1.2.7).
The assistant proposes that R-12 holds on level ground, and that slopes are driven straight up and down only, written as an operating rule in step 3 that controls H-05. The owner decides with Q-005.
A raised floor costs stability, which is why the floor is not raised further to let wheels clear deep snow.

## 1.2.7 Transport {#transport}

The kart is carried in a Delica D:5 (D-012, R-14).
Its overall width form.width_overall_m (the track form.track_min_m plus a tyre width tyre.width_mm) is about the tailgate opening at its widest, delica.opening_width_max_mm (before rounding the track it is equal), and far more than the opening at its narrowest, delica.opening_width_min_mm, and the width between the flipped-up third-row seats, delica.cargo_width_min_mm (P26, P27).
Its length kart.length_rough_mm fits the cargo length delica.cargo_length_mm with the second row tipped up and slid forward.
So a kart as wide as R-12 asks does not go in on its wheels. The ways out are:

- T1 a rear track that narrows for transport, with hubs that slide along the live axle and front stub axles that come off without tools, so that the kart rolls in narrow and is widened on site;
- T2 taking the wheels off and loading the frame on a small dolly;
- T3 a narrower kart that keeps R-12 only with the child and is driven gently by adults;
- T4 a small trailer, outside the budget.

The sources give the narrowest and widest widths but not at what height each lies, nor how high the flipped-up seats sit; the owner can measure them in the car (Q-015).
T3 has a second use: the axle and wheels of a donor buggy (1.2.10) are narrow, so a narrow kart can use them as they are.
The cargo floor lip is at delica.lip_height_mm, so one adult loading alone (R-15) needs a ramp, designed in 1.3.

## 1.2.8 Cold {#cold}

- Engine: Honda's oil chart for the GX series covers starting down to about -15 degC (P5), below ambient.temp_min_c. Pass.
- LiFePO4 batteries discharge down to -20 degC with most of their capacity, but must not be charged below 0 degC (P6). The kart is kept outdoors under a roof (D-012), so batteries must be taken indoors to charge.
- Sealed lead-acid batteries are recommended for cyclic use only above +5 degC and lose much of their capacity in the cold at high discharge rates (P7). They are ruled out for E2.

## 1.2.9 What the safety sources add {#safety}

- **Law.** On land not used for general traffic, the Road Traffic Act does not apply (P11, P12), and use only off roads is not operation under the Road Transport Vehicle Act (P13). If people other than the family pass freely through the land, it may count as a road. Civil liability remains (P14).
- **Main causes of harm.** In US data, children were hurt or killed mostly by hitting objects or vehicles and by tipping over on bumps, ruts, and sharp turns; hair or clothing caught in an exposed chain, belt, or axle killed several (P19). Japan's Consumer Affairs Agency advises removing scarves and keeping long hair inside the helmet (P20). This supports R-11 covering the axle as well as the chain, and R-12.
- **Guards and stopping.** JAF's guideline for leisure kart events asks for guards against hair and scarves, pedals and seat adjustable to body size, brakes on both rear wheels, and an emergency stop with a remote speed limit or engine stop (P16). JAF's rules require a chain guard over the upper run (P17).
- **No seat belt.** Race karts have no roll bar and prohibit seat belts (P18). The kart follows that: no belt without a roll bar.
- **Braking distance.** No kart standard with a stopping distance could be read; ASTM's fun-kart standard excludes home-made karts and may not be given to an AI (P23). The Japanese rule for mopeds (P15) gives, at the top speed, a limit for linked brakes that is longer than the assumed kart.stop_distance_max_m. Section 1.2.12 proposes which to use.
- **A young driver.** The youngest driver is 5 (D-010). US youth ATV guidance allows no ATVs under 6 and limits ages 6 and up to a low speed with the restrictor (P25, S2), which is why R-17 proposes a child limit of kart.speed_child_kmh that an adult sets (Q-013).
- **Body sizes.** The seat and pedals reach down to rider.stature_min_cm, the small end for a 5-year-old (P21), and up to rider.stature_max_cm, the tallest adult (D-016).

## 1.2.10 Cost {#cost}

Prices are from sales pages read on 2026-11-03, taking the higher price where a range was seen. Allowances are assumed in Q-010.

| Part of the kart | Key |
|------------------|-----|
| Chassis of L2 with F1: tube, rear axle kit, steering kit, tyres, seat, pedals and cables, stop switch, guards and mounts, small parts | cost.chassis_jpy |
| E1 clone engine, clutch, jackshaft, drive chains | cost.power_engine_clone_jpy |
| E1h genuine Honda engine, clutch, jackshaft, drive chains | cost.power_engine_genuine_jpy |
| E2 1 kW kit, four LiFePO4 batteries, charger, wiring, drive chain | cost.power_electric_jpy |
| E3 2 kW kit, 48 V LiFePO4 battery, charger, wiring, drive chain | cost.power_electric2_jpy |
| W1 skis and chains | cost.winter_skis_chains_jpy |
| W2 skis and tracks with running gear | cost.winter_tracks_jpy |
| Whole kart L2 + F1 + E1 + W1, new parts | cost.total_l2_e1_w1_jpy |
| Whole kart L2 + F1 + E1 + W2, new parts | cost.total_l2_e1_w2_jpy |
| Whole kart L2 + F1 + E1 + W1, the cheapest new parts seen (M17, M28 to M31) | cost.total_cheap_new_w1_jpy |
| Whole kart L5 + F1 + W1 on a used buggy donor (M26) with its own engine and a new wide axle and brake, from the cheapest running donor to the dearest donor seen | cost.total_donor_min_w1_jpy to cost.total_donor_w1_jpy |
| The same with E1 in place of the donor's engine | cost.total_donor_e1_w1_jpy |
| The least kart: a running donor's narrow axle and wheels as they are (T3), the owner's frame, no winter parts | cost.total_donor_narrow_summer_jpy |

Every combination of new parts that meets R-04 costs more than budget.parts_jpy (R-08).
The parts that drive the excess are the power, the rear axle kit, the tyres, the many small parts (pedals, cables, guards, chains, a jackshaft), and, for R-06, the tracks.

**Can it be made cheaper?** Lowering the top speed (D-015) did not lower the price of the parts themselves, but it spared the torque converter that the slope would otherwise need (1.2.5).
The cheapest new parts seen save little, because the small parts and allowances weigh as much as the big parts.
A used buggy as a donor saves more, but less than it first seemed (K-003).
Used buggies sell for cost.donor_buggy_min_jpy as junk and from cost.donor_buggy_running_min_jpy running, up to cost.donor_buggy_max_jpy (M26).
A buggy's rear axle is narrower than R-12 asks and does not let the track narrow for the car (T1), so a full kart needs a new axle with hubs and a brake, and keeps from the donor only the wheels, the steering, and the engine with its gearbox.
That engine is not E1: it has no governor and has its own clutch and gears, so how it is held to kart.speed_max_kmh and kart.speed_child_kmh, and how it climbs (R-16), are not yet analysed; with E1 in its place the donor route costs as much as new parts.
The other risks are that listings do not itemise their parts or state a load rating for an adult (R-02), that many are for pickup only, and that the condition is unknown until it is taken apart.
A used engine (cost.engine_used_min_jpy to cost.engine_used_max_jpy, M27) costs about the same as a new clone.

**What it takes to reach the budget.** No route that keeps every requirement reaches budget.parts_jpy. The kart reaches it only by giving something up: the least kart, cost.total_donor_narrow_summer_jpy, keeps a running donor's narrow axle and wheels, which meets R-12 with the child but not with an adult (the child's centre of mass is lower), fits the car more easily (R-14), and leaves the winter parts for later.

## 1.2.11 Comparison {#comparison}

| Form | R-04 grounds | R-05 packed snow | R-06 fresh snow | R-12 | Cost | Kept? |
|------|--------------|------------------|-----------------|------|------|-------|
| L1 low kart | fails on gravel and grass (floor too low) | passes with W1 | fails | passes | lowest; used frames are cheap (M16) | no |
| L2 off-road kart + W1 | passes | passes | only up to between snow.wheel_depth_limit_axle_cm and snow.wheel_depth_limit_cm | passes on level ground with track form.track_min_m | new parts | yes |
| L2 off-road kart + W2 | passes | passes | not shown; needs road wheels and the test of Q-012 | as above | new parts + tracks | later, after Q-012 |
| L3 tracks all year | grass torn, tracks worn on pavement | passes | passes | not assessed | above L2 + W2 | no |
| L5 own frame on a donor buggy + W1 | passes if the donor's parts carry an adult | passes | as L2 + W1 | passes on level ground with a new wide axle; with the donor's narrow axle, only with the child | below new parts, above the budget | yes |

| Frame | Tools | Strength and joints | Kept? |
|-------|-------|---------------------|-------|
| F1 welded steel tube (M6, M7) | a 100 V no-gas welder (P8, M11) | the usual kart frame (P10); no joints to loosen | yes |
| F2 bolted aluminium extrusion (M12) | none | dearer per metre, brackets extra, some sellers refuse home delivery; bolted joints may loosen under vibration (R-02) | no |
| F3 bolted steel square tube | drill | cheap, but many bolted joints with the same risk as F2 | no |

| Power | Grade (R-04, R-16) | Cold (R-07) | Speed limit (R-01, R-17) | Other | Kept? |
|-------|--------------|-------------|--------------------|-------|-------|
| E1 clone engine, centrifugal clutch | force passes; on grass the tyres' grip limits (assumed, Q-014); climb at full throttle | passes | gearing to the governed speed (Q-011); governor to be checked | noise, fuel, hot exhaust (H-04), recoil start | yes |
| E1t clone engine, torque converter | passes, also creeping | passes | as E1 | dearer by the converter | if creeping matters |
| E1h genuine engine | as E1 | passes | as E1 | known quality, dearer | yes |
| E2 1 kW electric | fails, even on pavement | charge indoors only | controller setting | quiet, no fuel, dearer | no |
| E3 2 kW electric | fails on grass with its controller | charge indoors only | controller setting | quiet, no fuel, no hot exhaust; the dearest | only with a larger controller, not assessed |

## 1.2.12 Proposal and the owner's decisions {#proposal}

The assistant proposes an off-road kart on the owner's welded frame (F1) with a clone engine and a centrifugal clutch (E1), built first with W1, slopes climbed straight up at full throttle and stopped with the brake, a rear track that narrows for the car (T1), and the plate test of Q-012 this winter to decide whether and how W2 is added later.
On new parts this costs cost.total_l2_e1_w1_jpy against budget.parts_jpy (R-08).

The owner decides:

1. **Cost against requirements.** (a) New parts (L2 + E1), cost.total_l2_e1_w1_jpy, every requirement kept (proposed). (b) A used buggy as donor with a new wide axle (L5), cost.total_donor_min_w1_jpy to cost.total_donor_w1_jpy, keeping the donor's engine, whose speed limit and climb are then analysed in 1.3. (c) The least kart, cost.total_donor_narrow_summer_jpy: a donor's narrow axle as it is, stable with the child but not with an adult (R-12), winter parts later. (d) The cheapest new parts, cost.total_cheap_new_w1_jpy, which saves little.
2. **R-06 against R-08.** (a) Build with W1 now, run the plate test of Q-012 this winter, and add W2 as a second stage with its own budget if the test supports it. (b) Change R-06 to fresh snow up to the W1 limit, between snow.wheel_depth_limit_axle_cm and snow.wheel_depth_limit_cm. (c) Design and build W2 now and accept the larger excess (cost.total_l2_e1_w2_jpy) without the test.
3. **Transport.** T1 (proposed), T2, T3, or T4; and the owner's measurement of the car (Q-015).
4. **Slopes.** R-12 on level ground with the rule "straight up and down" (proposed), or a wider or lower kart.
5. **Power.** E1 with a centrifugal clutch and the rule to climb at full throttle (proposed, the cheapest), E1t if the kart must creep up slopes or the child limit is set low, E1h for a genuine engine, or an electric drive with a larger controller if a quiet kart without fuel or hot exhaust matters more than cost and climbing grass. Decisions 5 and 8 are linked: a child limit much below kart.speed_child_kmh needs E1t.
6. **Frame.** F1 with a welder bought as a tool (proposed), or F2 without welding.
7. **Stopping distance (R-09, T3).** Current: kart.stop_distance_max_m, assumed. Proposed: keep it as the design point, because a kart has a lower centre of mass than a moped and brakes are cheap, and record the moped limit from P15 as the floor below which the kart fails.
8. **A child limit (R-17, Q-013).** Whether an adult sets a lower top speed for the 5-year-old, at kart.speed_child_kmh or another value.

After the owner decides, 1.2 records the selection, adds the hazards of the chosen power source (fuel, exhaust gas in a closed shed), and 1.3 starts the design calculation and the drawings.
