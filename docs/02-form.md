# 1.2 Form

Candidate forms, the yardsticks, rough availability and cost of each, the comparison, and the selection.

Numbers are cited by key and listed in [docs/01-requirements.md#values](01-requirements.md#values).
The rough numbers come from `python calc/form_rough.py`, which reads its inputs from the record and writes its outputs back as calculated values.
Inputs that are only assumed so that forms can be compared wait in Q-009 (shapes and masses) and Q-010 (prices); 1.3 and 1.5 replace them.

## 1.2.1 Yardsticks {#yardsticks}

The requirements that separate forms are R-04 (three grounds), R-05 and R-06 (snow), R-07 (cold), R-08 (budget), R-12 (tipping), and the drive's ability to climb site.grade_max_pct with the heaviest rider.
R-01 and R-10 decide how the speed is limited and how the drive is cut, which differs between an engine and a motor.
The builder's tools matter too: the owner would buy a welder (D-008), so welding is allowed but is a tool cost outside the budget.

## 1.2.2 Candidates {#candidates}

The form is four choices.

| Choice | Candidates |
|--------|-----------|
| Layout | L1 low kart like a racing kart, on 5 inch wheels. L2 off-road kart with a raised floor and 13 inch tyres. L3 tracks all year. |
| Winter setup (for L1 and L2) | W1 front skis bolted to the spindles and chains on the rear tyres. W2 front skis and a pair of rubber tracks in place of the rear wheels. |
| Frame | F1 welded steel tube. F2 bolted aluminium extrusion. F3 bolted steel square tube. |
| Power | E1 clone engine of the GX200 class with a centrifugal clutch. E1h the same with a genuine Honda engine. E2 electric 1 kW kit with four 12 V batteries. E3 electric 2 kW kit with one 48 V LiFePO4 battery. |

Front skis bolted to the spindles in place of the front wheels are how ATVs and a converted shifter kart were made to run on snow (F1).
Snowblower rubber tracks are sold in Japan without sprockets or idlers (M13); a complete rear-axle track kit is sold abroad (M14).

## 1.2.3 Mass {#mass}

form.mass_total_kg is the rough kart mass kart.mass_rough_kg plus the heaviest rider rider.mass_max_kg.
A leisure kart of similar size, the GR KART, is listed in P9, and is heavier than the rough value because of its body panels.

## 1.2.4 Snow {#snow}

**Wheels in fresh snow.** CRREL's fit for wheeled vehicles (P1) gives the sinkage z = h (1 − ρ0 / ρf), where h is snow.depth_max_cm, ρ0 the initial snow density between snow.density_initial_min and snow.density_initial_max, and the final density ρf = snow.crrel_rhof_a + snow.crrel_rhof_b × p.
In P1, p is the maximum contact pressure of the wheels; tyre.pressure_kpa is used in its place and lies below the fitted range, but even p = 0 leaves the conclusion unchanged (K-001).
The sinkage is between snow.wheel_sinkage_min_cm and snow.wheel_sinkage_max_cm, more than the tyre radius, so the hubs, the axle, and its brake disc and sprocket run in the snow as well as the floor at kart.clearance_rough_mm.
A wheeled kart therefore cannot meet R-06 at snow.depth_max_cm.
In the lightest snow it clears snow.wheel_depth_limit_cm with its floor, but only snow.wheel_depth_limit_axle_cm with its lowest axle part at kart.axle_part_low_rough_mm; thin parts cut snow rather than plough it, so the real limit lies between the two.

**Tracks and skis.** A pair of snowblower tracks of width track.width_mm, with track.links links of track.pitch_mm, on a sprocket and an idler of track.wheel_dia_mm, carries the rear share kart.rear_share at snow.track_pressure_kpa.
Front skis of ski.width_mm by ski.contact_length_mm carry the rest at snow.ski_pressure_kpa.
Both are close to a snowmobile's snow.snowmobile_pressure_kpa (P2).
Bekker's relation p = (kc / b + kφ) zⁿ with the three snows of P2 (snow.bekker_a_n to snow.bekker_c_kphi) gives sinkage of at most snow.track_sinkage_max_cm for the tracks and snow.ski_sinkage_max_cm for the skis, which the raised floor clears.
That assumes the belt presses evenly. A snowblower track looped over only a sprocket and an idler carries the load under those two wheels; Bekker's wheel relation z = [3W / ((3 − n)(kc + b kφ) √D)]^(2 / (2n + 1)) for each of the four wheels gives snow.track_sinkage_wheels_cm, which the floor does not clear (K-001). That sinkage exceeds the wheel diameter, outside the relation's small-sinkage range, and the exact wheel geometry gives as much or more (K-002).
Replacing the rear tyres by a track on smaller wheels also lowers the rear axle, and with it the floor, unless the track frame raises the axle (K-002).
So W1 fails R-06, and W2 is not shown to pass: the truth lies between the two track figures, P1 does not cover tracked vehicles, and P2's snows are not the owner's snow.
W2 would need road wheels between the sprocket and the idler to spread the load, which adds to cost.allow_track_gear_jpy.
A loaded-plate test in the owner's fresh snow (Q-012) settles the sinkage cheaply before the frame is given mounts for W2.
Turning a pair of tracks on a solid rear axle with ski steering, and the speed rating of snowblower tracks, are not yet assessed.

**Grip on packed snow and ice.** Car data reviewed in S1 show that chains roughly double the braking and cornering friction on ice compared with plain tyres, and give the best traction of the options tested.
Front skis need a keel or a runner to steer; this is a 1.3 item.

These are estimates: P1 was fitted for heavier vehicles, and the Bekker values come from three snows that may differ from the owner's snow. R-06 is verified by test.

## 1.2.5 Drive {#drive}

The tyre diameter tyre.dia_mm is the 13 inch outside diameter of a 13x5.00-6 tyre, as its name states.
Each power source is geared so that its highest free speed gives kart.speed_max_kmh, which enforces R-01 on level ground and uphill; running faster downhill is a 1.3 item.
For the engine that is the governed no-load speed engine.speed_noload_rpm, assumed until Q-011; P4's engine.speed_rated_rpm is the speed of rated output, and gearing to it would let the kart pass kart.speed_max_kmh (K-001).
For a motor it is its rated speed.

The kart must climb site.grade_max_pct on grass with the heaviest rider (R-04). With the rolling resistance ground.crr_max of ATV tyres on long grass (P24), that needs drive.climb_force_n.

- E1: the maximum power engine.power_max_kw at engine.speed_rated_rpm (P4), the reduction drive.engine_ratio, and drive.efficiency give drive.engine_thrust_n at the rear tyres, above drive.climb_force_n. A clone is assumed to match the genuine engine; 1.3 checks the chosen engine's data.
- E2: a motor's force is its rated torque scaled by the controller's current over the motor's rated current. The 1 kW motor (motor.torque_rated_nm, motor.current_rated_a, M5) on its kit's controller (motor.controller_a, M3) gives drive.motor_thrust_n. The torque comes from a brushed motor and the price from a brushless kit, so the two do not describe one product.
- E3: the 2 kW motor (motor2.torque_rated_nm at motor2.speed_rated_rpm, M19, seen only as an excerpt) on its kit's controller (motor2.controller_a) gives drive.motor2_thrust_n.
- Both electric kits fall short of drive.climb_force_n on grass. E2 falls short of the slope alone even on pavement, and E3 is marginal there (K-002).
- The 2 kW data do not agree with each other: its torque at its speed is more shaft power than its current can supply, so motor2.current_rated_a is probably the controller's rating copied over, and E3 gives less than drive.motor2_thrust_n near top speed (K-002). If the kits' controllers limit the battery current rather than the motor current, a motor can take more current on a slow climb; that is not assessed.
- On level long grass at kart.speed_max_kmh the drive must deliver drive.grass_power_kw, within E1 and beyond what E3 delivers on its own controller.
- The clone engines found (M18) do not state a governor, while the genuine engine has one (P5). A clone must have a working governor, checked when it arrives, or R-01 fails.
- One chain from a sprocket.engine_teeth tooth clutch sprocket of pitch sprocket.pitch_mm (chain size 40, 1/2 inch by its name, which the clutch of M2 takes) to the axle would need an axle sprocket whose teeth reach to drive.sprocket_reach_mm above the ground. A second reduction stage (a jackshaft) is needed; its rough price is cost.allow_reduction_jpy.

## 1.2.6 Stability {#stability}

With the heaviest rider seated rider.cg_above_seat_m above a seat seat.above_floor_rough_m over the floor, and the kart's own centre at kart.cg_height_rough_m, the centre of mass is at form.cg_height_m.
R-12 with kart.tip_ratio_min then needs a track of at least form.track_min_m on level ground.
That is within the width of a leisure kart (P9). Kart rules ask for a track of at least two thirds of the wheelbase (P10).
Standing sideways on site.grade_max_pct, the same margin needs form.track_min_slope_m, wider than a leisure kart. Whether R-12 must hold on the slope, or the slope is driven straight up and down only, is part of Q-005.
A raised floor costs stability, which is why the floor is not raised further to let wheels clear deep snow.

## 1.2.7 Cold {#cold}

- Engine: Honda's oil chart for the GX series covers starting down to about -15 degC (P5), below ambient.temp_min_c. Pass.
- LiFePO4 batteries discharge down to -20 degC with most of their capacity, but must not be charged below 0 degC (P6). The batteries must be charged indoors.
- Sealed lead-acid batteries are recommended for cyclic use only above +5 degC and lose much of their capacity in the cold at high discharge rates (P7). They are ruled out for E2.

## 1.2.8 What the safety sources add {#safety}

- **Law.** On land not used for general traffic, the Road Traffic Act does not apply (P11, P12), and use only off roads is not operation under the Road Transport Vehicle Act (P13). If people other than the family pass freely through the land, it may count as a road. Civil liability remains (P14).
- **Main causes of harm.** In US data, children were hurt or killed mostly by hitting objects or vehicles and by tipping over on bumps, ruts, and sharp turns; hair or clothing caught in an exposed chain, belt, or axle killed several (P19). Japan's Consumer Affairs Agency advises removing scarves and keeping long hair inside the helmet (P20). This supports R-11 covering the axle as well as the chain, and R-12.
- **Guards and stopping.** JAF's guideline for leisure kart events asks for guards against hair and scarves, pedals and seat adjustable to body size, brakes on both rear wheels, and an emergency stop with a remote speed limit or engine stop (P16). JAF's rules require a chain guard over the upper run (P17).
- **No seat belt.** Race karts have no roll bar and prohibit seat belts (P18). The kart follows that: no belt without a roll bar.
- **Braking distance.** No kart standard with a stopping distance could be read; ASTM's fun-kart standard excludes home-made karts and may not be given to an AI (P23). The Japanese rule for mopeds (P15) gives, at kart.speed_max_kmh, a limit for linked brakes that is longer than the assumed kart.stop_distance_max_m. Section 1.2.10 proposes which to use.
- **Body sizes.** Children's stature by age is in P21, adults' in P22. Q-002 is answered first by the owner (the youngest driver), and the range is then set from these sources.

## 1.2.9 Cost {#cost}

Prices are from sales pages read on 2026-11-03 (M1 to M17), taking the higher price where a range was seen. Allowances are assumed in Q-010.

| Part of the kart | Key |
|------------------|-----|
| Chassis of L2 with F1: tube, rear axle kit, steering kit, tyres, seat, pedals and cables, stop switch, guards and mounts, small parts | cost.chassis_jpy |
| E1 clone engine, clutch, jackshaft, drive chains | cost.power_engine_clone_jpy |
| E1h genuine Honda engine, clutch, jackshaft, drive chains | cost.power_engine_genuine_jpy |
| E2 1 kW kit, four LiFePO4 batteries, charger, wiring, drive chain | cost.power_electric_jpy |
| E3 2 kW kit, 48 V LiFePO4 battery, charger, wiring, drive chain | cost.power_electric2_jpy |
| W1 skis and chains | cost.winter_skis_chains_jpy |
| W2 skis and tracks with running gear | cost.winter_tracks_jpy |
| Whole kart L2 + F1 + E1 + W1 | cost.total_l2_e1_w1_jpy |
| Whole kart L2 + F1 + E1 + W2 | cost.total_l2_e1_w2_jpy |

Every combination that meets R-04 costs more than budget.parts_jpy (R-08). The parts that drive the excess are the power (engine or batteries), the rear axle kit, the tyres, the many small parts (pedals, cables, guards, chains), and, for R-06, the tracks.

## 1.2.10 Comparison {#comparison}

| Form | R-04 grounds | R-05 packed snow | R-06 fresh snow | R-12 | Cost | Kept? |
|------|--------------|------------------|-----------------|------|------|-------|
| L1 low kart | fails on gravel and grass (floor too low) | passes with W1 | fails | passes | lowest; used frames are cheap (M16) | no |
| L2 off-road kart + W1 | passes | passes | only up to between snow.wheel_depth_limit_axle_cm and snow.wheel_depth_limit_cm | passes with track form.track_min_m | chassis + power + W1 | yes |
| L2 off-road kart + W2 | passes | passes | not shown; needs road wheels and the test of Q-012 | passes with track form.track_min_m | chassis + power + W2 | later, after Q-012 |
| L3 tracks all year | grass torn, tracks worn on pavement; speed rating of snowblower tracks unknown | passes | passes | not assessed | above L2 + W2 | no |

| Frame | Tools | Strength and joints | Kept? |
|-------|-------|---------------------|-------|
| F1 welded steel tube (M6, M7) | a 100 V no-gas welder (P8, M11) | the usual kart frame (P10); no joints to loosen | yes |
| F2 bolted aluminium extrusion (M12) | none | dearer per metre, brackets extra, some sellers refuse home delivery; bolted joints may loosen under vibration (R-02) | no |
| F3 bolted steel square tube | drill | cheap, but many bolted joints with the same risk as F2 | no |

| Power | Grade (R-04) | Cold (R-07) | Speed limit (R-01) | Other | Kept? |
|-------|--------------|-------------|--------------------|-------|-------|
| E1 clone engine | passes | passes | gearing to the governed speed (Q-011); governor to be checked | noise, fuel, hot exhaust (H-04), recoil start | yes |
| E1h genuine engine | passes | passes | gearing to the governed speed (Q-011) | as E1, known quality, dearer | yes |
| E2 1 kW electric | fails, even on pavement | charge indoors only | controller setting | quiet, no fuel, dearer | no |
| E3 2 kW electric | fails on grass with its controller, marginal on pavement | charge indoors only | controller setting | quiet, no fuel, no hot exhaust; the dearest | only with a larger controller, not assessed |

## 1.2.11 Proposal and the owner's decisions {#proposal}

The assistant proposes L2 + F1 + E1, built first with W1, and the test of Q-012 this winter to decide whether and how W2 (with road wheels) is added later.
This meets R-04, R-05, R-07, and R-12 on level ground, and does not meet R-06 at snow.depth_max_cm.
It does not meet R-08 either: cost.total_l2_e1_w1_jpy against budget.parts_jpy. The owner decides:

1. **R-06 against R-08.** (a) Build L2 + E1 + W1 now, run the plate test of Q-012 this winter, and add W2 as a second stage with its own budget if the test supports it. (b) Change R-06 to fresh snow up to the W1 limit, between snow.wheel_depth_limit_axle_cm and snow.wheel_depth_limit_cm. (c) Design and build W2 now and accept the larger excess (cost.total_l2_e1_w2_jpy) without the test.
2. **Power.** E1 clone (proposed, the cheapest, with its governor checked) or E1h genuine, the two with margin on the grass slope; or an electric drive with a larger controller if a quiet kart without fuel or hot exhaust matters more than cost and climbing grass.
3. **Frame.** F1 with a welder bought as a tool (proposed), or F2 without welding.
4. **Stopping distance (R-09, T3).** Current: kart.stop_distance_max_m, assumed. Proposed: the moped limit for linked brakes at kart.speed_max_kmh from P15. The assistant recommends keeping the shorter assumed value as the design point, because a kart has a lower centre of mass than a moped and brakes are cheap, and recording the moped limit as the floor below which the kart fails.

After the owner decides, 1.2 records the selection, adds the hazards of the chosen power source (fuel, exhaust gas in a closed shed), and 1.3 starts the design calculation and the drawings.
