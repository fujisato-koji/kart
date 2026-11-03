# 1.1 Requirements

Why each requirement in record/requirements.yaml is what it is. Start with the questions that can rule a form out.

The thing is one go-kart for the owner's private land, driven mainly by a child and also by an adult, in summer and in winter (D-001).
The power source is not preset; 1.2 compares an engine and an electric drive.

## 1.1.1 Questions that can rule a form out {#questions}

Asked on 2026-11-03, before any form was compared; a second round of answers came the same day.

| Question | Answer recorded as |
|----------|--------------------|
| Where the kart runs, and the law there | D-005 (private land only, no public road), D-006 (snow) |
| Who drives | D-001, D-004 (child speed, adult strength and fit), D-009 (the heaviest adult), D-010 (the youngest driver), D-016 (the tallest adult) |
| Top speed | D-003, lowered by D-015; on snow, D-011 |
| Ground in summer | D-005 |
| Snow in winter | D-006, Q-003 |
| Lowest temperature in use | D-007 |
| Budget and what it includes | D-008 |
| Builder's tools and skills | D-008 (tools outside the budget; a welder may be bought) |
| Power source | D-001 (not preset) |
| Storage and transport | D-012 (outdoors under a roof, carried in a Delica D:5), Q-015 |
| Session length, use, and when it must be ready | D-013 (refuel between runs, or two to three hours per charge), Q-007 |
| Slopes on the land | D-014 (a fairly steep slope, climbed slowly without damage), Q-008 |
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
| R-05 | The kart runs on packed snow and ice. | With the heaviest rider, on level packed snow, the kart starts from rest, runs, turns, and stops, at any speed. | test | confirmed |
| R-06 | The kart runs in fresh snow. | With the heaviest rider, on level fresh snow of depth snow.depth_max_cm, the kart starts from rest, runs, and turns at any speed without getting stuck. | test | confirmed |
| R-07 | The kart works in the cold. | After standing outdoors at ambient.temp_min_c, the kart starts and runs. With batteries it runs for kart.run_time_min per charge; with an engine it may be refuelled between runs. | test | confirmed |
| R-08 | The kart is built within the budget. | The parts list of docs/05-parts-and-cost.md, with tax, shipping, and winter parts, totals at most budget.parts_jpy, or the owner has accepted the excess. | inspection | confirmed |
| R-09 | The kart stops in a short distance. | With the heaviest rider, from kart.speed_max_kmh on level dry paved ground, the kart stops within kart.stop_distance_max_m. | test | awaiting |
| R-10 | The drive stops when the driver lets go. | The throttle returns to zero by a spring when released, and a stop switch that the driver reaches from the seat, and a helper reaches from beside the kart, cuts the drive. | demonstration | awaiting |
| R-11 | Moving and hot parts cannot be touched. | Chain, sprockets, belt, the turning axle near the seat, and any hot part are covered so that the driver's hands, feet, hair, and clothing cannot reach them from the seat. | inspection | awaiting |
| R-12 | The kart slides before it tips over. | With the heaviest rider, half the track width divided by the height of the centre of mass is at least kart.tip_ratio_min, on every wheel or ski setup. | analysis | awaiting |
| R-13 | The frame shields the driver's legs and feet. | Seen from the front and the sides, the driver's feet and legs are inside the frame or a bumper. | inspection | awaiting |
| R-14 | The kart is carried in a Mitsubishi Delica D:5. | With the rear seats of a Delica D:5 folded and slid forward, the kart passes through the tailgate opening (delica.opening_width_min_mm to delica.opening_width_max_mm wide) and lies within the cargo space (delica.cargo_length_mm long, delica.cargo_width_min_mm between the flipped-up third-row seats, delica.cargo_width_max_mm at most), after removing at most parts that come off without tools. | demonstration | confirmed |
| R-15 | One adult loads and unloads the kart alone. | One adult rolls the kart up a ramp onto the cargo floor at delica.lip_height_mm and back down, without lifting the whole kart. | demonstration | awaiting |
| R-16 | The kart climbs a fairly steep slope slowly without damage. | With the heaviest rider, on grass at site.grade_max_pct, the kart starts from rest on the slope and climbs at walking pace or faster, and no part slips, overheats, or deforms. | test | confirmed |
| R-17 | An adult can set a lower top speed for a small child. | Without tools, an adult sets the top speed on level paved ground to at most kart.speed_child_kmh, and the child cannot undo the setting from the seat. | demonstration | awaiting |
<!-- tdr:end -->

R-01 to R-08, R-14, and R-16 restate the owner's answers.
R-09 to R-13, R-15, and R-17 are derived from the hazards in 1.1.4 and wait for the owner to confirm them.

## 1.1.3 Why each requirement is as it is {#why}

- **R-01 speed.** The owner set the speed for a child (D-003) and then lowered it to see whether the kart can be made cheaper (D-015). It applies on paved ground; on snow the kart may be slow (D-011). The limit holds with the lightest rider too, because a light rider makes the kart faster on the same drive.
- **R-02 strength.** The owner wants an adult to drive (D-004), up to rider.mass_max_kg (D-009). The load cases (bumps, braking, a kerb hit, a slope) are set in 1.3.
- **R-03 fit.** One kart must fit both a child and an adult (D-004). Adjustment without welding or cutting lets the owner switch drivers on the spot. The youngest driver is 5 (D-010), so the small end rider.stature_min_cm comes from the school health statistics for 5-year-olds (P21); the large end rider.stature_max_cm is the tallest adult who drives (D-016).
- **R-04 ground.** The owner named three grounds (D-005). Gravel and grass set the tyre size and the clearance; slopes set the drive (Q-008).
- **R-05 and R-06 snow.** The owner wants both packed snow and fresh snow up to snow.depth_max_cm (D-006). The requirement on snow is only that the kart runs, turns, and stops, at any speed (D-011).
- **R-07 cold.** The owner set ambient.temp_min_c (D-007). The kart is kept outdoors under a roof (D-012), so it stands in the cold before a run. With an engine, refuelling between runs is fine; with batteries the owner wants kart.run_time_min or more per charge, depending on the trade-off (D-013).
- **R-08 budget.** budget.parts_jpy covers parts and materials with tax, shipping, and winter parts, and excludes tools (D-008). It is a guideline: when the total is likely to pass it, the assistant names the parts that drive it and the owner decides.
- **R-09 braking.** A child at speed near people and buildings needs a short stop (H-01), and snow lowers the grip (H-07). The value kart.stop_distance_max_m is assumed until Q-004 settles it from a standard.
- **R-10 dead-man drive.** A child may freeze or let go (H-02). A spring-return throttle and a stop switch that a helper can reach are the usual controls.
- **R-11 guards.** Winter clothing and scarves are long and loose (H-03). Engines have hot exhausts, and motors and batteries heat up (H-04).
- **R-12 slide before tipping.** A kart without a roll bar must slide sideways before it tips (H-05). An adult raises the centre of mass, and the snow setup may raise it more. kart.tip_ratio_min is assumed until Q-005.
- **R-13 leg shield.** In a hit the driver's legs are the first thing to meet an obstacle (H-01).
- **R-14 car.** The owner carries the kart in a Delica D:5 and wants it easy to load (D-012). The car's cargo and tailgate sizes come from the maker (P26, P27); the clear width at floor height is measured by the owner (Q-015).
- **R-15 loading alone.** "Easy to load" is read as one adult rolling the kart up a ramp without lifting it, which also controls a kart rolling off the ramp (H-09). It waits for the owner.
- **R-16 slope.** The owner wants the kart not to be damaged on a fairly steep slope, and accepts a slow climb (D-014). The slope is assumed at site.grade_max_pct until Q-008. "Without damage" covers a slipping clutch, which a slow climb can cause (1.2.5).
- **R-17 child limit.** A 5-year-old drives (D-010). US youth ATV guidance allows no ATVs under 6 and limits older children to a low speed with a restrictor (P25, S2). R-17 lets an adult set a lower top speed for the child; it waits for the owner (Q-013).

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
| H-08 | A small child drives faster than the child can control. | The child and people nearby. | R-01, R-17 |
| H-09 | The kart rolls off the ramp or falls while being loaded or unloaded. | The person loading it and people nearby. | R-15 |
| H-10 | Petrol catches fire while refuelling or near the hot engine, or exhaust gas builds up when the engine runs in a closed shed. | The driver, helpers, and children nearby. | OP-03.02, OP-03.03 |
<!-- tdr:end -->

H-04 covers both an engine and a battery; the hazards particular to the chosen power source (exhaust gas in a closed shed, fuel, charging) are added when 1.2 selects it.
Cold injury of a child in winter is handled by an operating procedure in step 3 (operation), not by the kart.

## 1.1.5 Tensions the form must resolve {#tensions}

These are not decided here. 1.2 compares forms against them.

1. **Fresh snow against paved ground.** R-06 at snow.depth_max_cm needs a large footprint and a high floor, so that the kart floats and the frame does not plough. R-01, R-04 on paved ground, and R-12 favour a low kart with a low centre of mass. One form may not serve both; a kit that swaps wheels for skis or tracks in winter is a candidate.
2. **Budget against winter.** R-08 includes the winter parts. Tracks and large low-pressure tyres are the parts most likely to pass budget.parts_jpy.
3. **Adult strength against child speed.** The drive is sized by the heaviest rider (rider.mass_max_kg) on slopes (site.grade_max_pct) and in snow, while R-01 caps the speed. The speed must be limited by gearing, a governor, or a controller setting, not by a weak drive.
4. **Cold against batteries.** R-07 at ambient.temp_min_c affects batteries more than engines, especially charging. 1.2 takes the limits from cell makers' data.
5. **The car against stability.** R-14 limits the width that goes into the car, while R-12 asks for a wide track, and R-16 on a slope sideways asks for a wider one still.
6. **A slow climb against a simple clutch.** R-16 accepts a slow climb, but a centrifugal clutch slips and heats below its lock speed.
7. **A young driver against the top speed.** R-01 is set for the kart, and R-17 lowers it for the youngest driver.

## 1.1.6 Values used by the requirements {#values}

<!-- tdr:table kind=value fields=key,v,unit,status,basis -->
| key | v | unit | status | basis |
|---|---|---|---|---|
| kart.seats | 1 |  | decided | D-001 |
| kart.speed_max_kmh | 20 | km/h | decided | D-015 |
| snow.depth_max_cm | 30 | cm | decided | D-006 |
| ambient.temp_min_c | -10 | degC | decided | D-007 |
| budget.parts_jpy | 100000 | JPY | decided | D-008 |
| rider.mass_max_kg | 100 | kg | decided | D-009 |
| rider.stature_min_cm | 102 | cm | sourced | P21 |
| rider.stature_max_cm | 170 | cm | decided | D-016 |
| site.grade_max_pct | 20 | % | assumed | Q-008 |
| kart.run_time_min | 120 | min | decided | D-013 |
| kart.stop_distance_max_m | 6 | m | assumed | Q-004 |
| kart.tip_ratio_min | 1.5 |  | assumed | Q-005 |
| snow.density_initial_min | 0.11 | Mg/m3 | sourced | P1 |
| snow.density_initial_max | 0.25 | Mg/m3 | sourced | P1 |
| snow.crrel_rhof_a | 0.519 | Mg/m3 | sourced | P1 |
| snow.crrel_rhof_b | 0.0023 | Mg/m3/kPa | sourced | P1 |
| snow.bekker_a_n | 1.6 |  | sourced | P2 |
| snow.bekker_a_kc | 4.37 | kN/m^(n+1) | sourced | P2 |
| snow.bekker_a_kphi | 196.72 | kN/m^(n+2) | sourced | P2 |
| snow.bekker_b_n | 1.6 |  | sourced | P2 |
| snow.bekker_b_kc | 2.49 | kN/m^(n+1) | sourced | P2 |
| snow.bekker_b_kphi | 245.9 | kN/m^(n+2) | sourced | P2 |
| snow.bekker_c_n | 1.44 |  | sourced | P2 |
| snow.bekker_c_kc | 10.55 | kN/m^(n+1) | sourced | P2 |
| snow.bekker_c_kphi | 66.08 | kN/m^(n+2) | sourced | P2 |
| snow.snowmobile_pressure_kpa | 3.5 | kPa | sourced | P2 |
| track.width_mm | 180 | mm | sourced | M13 |
| track.pitch_mm | 60 | mm | sourced | M13 |
| track.links | 28 |  | sourced | M13 |
| engine.torque_max_nm | 12.4 | N m | sourced | P4 |
| engine.speed_rated_rpm | 3600 | rpm | sourced | P4 |
| motor.torque_rated_nm | 3.2 | N m | sourced | M5 |
| motor.speed_rated_rpm | 3000 | rpm | sourced | M5 |
| sprocket.engine_teeth | 10 |  | sourced | M2 |
| cost.tube_25_jpy_per_m | 924 | JPY/m | sourced | M6 |
| cost.tube_32_jpy_per_m | 1133 | JPY/m | sourced | M7 |
| cost.axle_kit_jpy | 21630 | JPY | sourced | M8 |
| cost.steering_kit_jpy | 10052 | JPY | sourced | M9 |
| cost.tyres_set_jpy | 15460 | JPY | sourced | M10 |
| cost.seat_jpy | 3855 | JPY | sourced | M17 |
| cost.clutch_jpy | 4960 | JPY | sourced | M2 |
| cost.engine_genuine_jpy | 68980 | JPY | sourced | M1 |
| cost.motor_kit_jpy | 18780 | JPY | sourced | M3 |
| cost.battery_12v_jpy | 13998 | JPY | sourced | M4 |
| cost.track_jpy | 24000 | JPY | sourced | M13 |
| cost.snow_chain_jpy | 7480 | JPY | sourced | M15 |
| tyre.dia_mm | 330 | mm | calculated | docs/02-form.md#drive |
| sprocket.pitch_mm | 12.7 | mm | calculated | docs/02-form.md#drive |
| kart.mass_rough_kg | 70 | kg | assumed | Q-009 |
| kart.rear_share | 0.6 |  | assumed | Q-009 |
| tyre.pressure_kpa | 70 | kPa | assumed | Q-009 |
| track.wheel_dia_mm | 200 | mm | assumed | Q-009 |
| ski.width_mm | 120 | mm | assumed | Q-009 |
| ski.contact_length_mm | 600 | mm | assumed | Q-009 |
| drive.efficiency | 0.9 |  | assumed | Q-009 |
| frame.tube_25_m | 10 | m | assumed | Q-009 |
| frame.tube_32_m | 5 | m | assumed | Q-009 |
| cost.engine_clone_jpy | 19980 | JPY | sourced | M18 |
| cost.charger_jpy | 10000 | JPY | assumed | Q-010 |
| cost.allow_shipping_jpy | 5000 | JPY | assumed | Q-010 |
| cost.allow_small_parts_jpy | 10000 | JPY | assumed | Q-010 |
| cost.allow_reduction_jpy | 8000 | JPY | assumed | Q-010 |
| cost.allow_skis_jpy | 8000 | JPY | assumed | Q-010 |
| cost.allow_track_gear_jpy | 20000 | JPY | assumed | Q-010 |
| kart.clearance_rough_mm | 150 | mm | assumed | Q-009 |
| kart.cg_height_rough_m | 0.25 | m | assumed | Q-009 |
| seat.above_floor_rough_m | 0.05 | m | assumed | Q-009 |
| rider.cg_above_seat_m | 0.25 | m | assumed | Q-009 |
| motor2.torque_rated_nm | 4.8 | N m | sourced | M19 |
| motor2.speed_rated_rpm | 4300 | rpm | sourced | M19 |
| cost.motor2_kit_jpy | 30994 | JPY | sourced | M20 |
| cost.battery_48v_jpy | 74780 | JPY | sourced | M21 |
| cost.charger_48v_jpy | 20900 | JPY | sourced | M22 |
| engine.power_max_kw | 4.3 | kW | sourced | P4 |
| engine.speed_noload_rpm | 3850 | rpm | assumed | Q-011 |
| motor.current_rated_a | 26.7 | A | sourced | M5 |
| motor.controller_a | 30 | A | sourced | M3 |
| motor2.current_rated_a | 34 | A | sourced | M19 |
| motor2.controller_a | 34 | A | sourced | M19 |
| ground.crr_max | 0.12 |  | sourced | P24 |
| kart.axle_part_low_rough_mm | 75 | mm | assumed | Q-009 |
| cost.allow_controls_jpy | 8000 | JPY | assumed | Q-010 |
| cost.allow_guards_mounts_jpy | 5000 | JPY | assumed | Q-010 |
| cost.allow_drive_chains_jpy | 5000 | JPY | assumed | Q-010 |
| cost.allow_electric_jpy | 5000 | JPY | assumed | Q-010 |
| kart.speed_child_kmh | 16 | km/h | assumed | Q-013 |
| ground.crr_avg | 0.08 |  | assumed | Q-009 |
| drive.speed_avg_kmh | 12 | km/h | assumed | Q-009 |
| drive.efficiency_electric | 0.8 |  | assumed | Q-009 |
| battery.usable_fraction | 0.8 |  | assumed | Q-009 |
| battery.energy_wh | 1536 | Wh | sourced | M21 |
| rider.mass_child_kg | 19 | kg | sourced | P21 |
| delica.cargo_length_mm | 1610 | mm | sourced | P26 |
| delica.cargo_width_max_mm | 1245 | mm | sourced | P26 |
| delica.cargo_width_min_mm | 770 | mm | sourced | P26 |
| delica.cargo_height_mm | 1130 | mm | sourced | P26 |
| delica.opening_width_min_mm | 900 | mm | sourced | P27 |
| delica.opening_width_max_mm | 1230 | mm | sourced | P27 |
| delica.lip_height_mm | 620 | mm | sourced | P27 |
| clutch.engage_rpm | 2000 | rpm | sourced | M23 |
| tc.ratio_low | 2.7 |  | sourced | M24 |
| tc.ratio_high | 0.9 |  | sourced | M24 |
| cost.tc_kit_jpy | 35276 | JPY | sourced | M25 |
| ground.crr_paved | 0.02 |  | sourced | P29 |
| ground.crr_gravel | 0.06 |  | sourced | P24 |
| ground.crr_grass | 0.1 |  | sourced | P24 |
| ground.crr_snow_packed | 0.016 |  | sourced | P1 |
| ground.crr_snow_fresh | 0.18 |  | sourced | P1 |
| ground.mu_snow | 0.15 |  | sourced | S1 |
| ground.mu_snow_chains | 0.27 |  | sourced | S1 |
| ground.mu_ice | 0.08 |  | sourced | S1 |
| ground.mu_ice_chains | 0.19 |  | sourced | S1 |
| ground.mu_paved | 0.8 |  | assumed | Q-014 |
| ground.mu_gravel | 0.5 |  | assumed | Q-014 |
| ground.mu_grass | 0.45 |  | assumed | Q-014 |
| ski.mu_lateral | 0.2 |  | assumed | Q-014 |
| track.crr_snow_fresh | 0.1 |  | assumed | Q-014 |
| snow.plough_per_cm | 0.05 | 1/cm | assumed | Q-014 |
| kart.wheelbase_rough_mm | 1000 | mm | assumed | Q-009 |
| kart.length_rough_mm | 1550 | mm | assumed | Q-009 |
| rider.cg_above_seat_child_m | 0.15 | m | assumed | Q-009 |
| tyre.width_mm | 127 | mm | calculated | docs/02-form.md#drive |
| clutch.lock_rpm | 2600 | rpm | sourced | M23 |
| cost.donor_buggy_min_jpy | 12000 | JPY | sourced | M26 |
| cost.donor_buggy_max_jpy | 45000 | JPY | sourced | M26 |
| cost.engine_used_min_jpy | 11000 | JPY | sourced | M27 |
| cost.engine_used_max_jpy | 33000 | JPY | sourced | M27 |
| cost.tyre_each_cheap_jpy | 2911 | JPY | sourced | M28 |
| cost.brake_cheap_jpy | 6390 | JPY | sourced | M29 |
| cost.axle_parts_cheap_jpy | 17000 | JPY | sourced | M30 |
| cost.steering_cheap_jpy | 9179 | JPY | sourced | M31 |
| cost.seat_cheap_jpy | 1776 | JPY | sourced | M17 |
| engine.power_cont_kw | 3.7 | kW | sourced | P4 |
| cost.donor_buggy_running_min_jpy | 21870 | JPY | sourced | M26 |
| kart.ref_leisure_width_mm | 1160 | mm | sourced | P9 |
| eng.length_mm | 313 | mm | sourced | P30 |
| eng.width_mm | 376 | mm | sourced | P30 |
| eng.height_mm | 339 | mm | sourced | P30 |
| eng.mass_kg | 16.1 | kg | sourced | P30 |
| eng.shaft_height_mm | 106 | mm | sourced | P30 |
| eng.shaft_dia_mm | 19.05 | mm | sourced | P30 |
| eng.base_across_mm | 162 | mm | sourced | P30 |
| eng.base_along_mm | 80 | mm | sourced | P30 |
| whl.tyre_od_mm | 325 | mm | sourced | M32 |
| whl.tyre_width_mm | 127 | mm | sourced | M32 |
| brg.ucp205_h_mm | 36.5 | mm | sourced | P32 |
| brg.ucp205_l_mm | 140 | mm | sourced | P32 |
| brg.ucp205_j_mm | 105 | mm | sourced | P32 |
| brg.ucp205_h2_mm | 71 | mm | sourced | P32 |
| brg.ucp205_mass_kg | 0.9 | kg | sourced | P32 |
| brg.ucp205_cr_kn | 14.0 | kN | sourced | P32 |
| brg.ucp204_h_mm | 33.3 | mm | sourced | P33 |
| brg.ucp204_l_mm | 127 | mm | sourced | P33 |
| brg.ucp204_h2_mm | 65 | mm | sourced | P33 |
| brg.ucp204_mass_kg | 0.66 | kg | sourced | P33 |
| spr.t10_pd_mm | 41.098 | mm | sourced | P31 |
| spr.t12_pd_mm | 49.069 | mm | sourced | P31 |
| spr.t12_od_mm | 55 | mm | sourced | P31 |
| spr.t36_pd_mm | 145.716 | mm | sourced | P31 |
| spr.t36_od_mm | 153 | mm | sourced | P31 |
| spr.t36_mass_kg | 1.5 | kg | sourced | P31 |
| spr.t40_pd_mm | 161.868 | mm | sourced | P31 |
| spr.t40_od_mm | 169 | mm | sourced | P31 |
| spr.t40_mass_kg | 1.7 | kg | sourced | P31 |
| clutch.od_mm | 107 | mm | sourced | M51 |
| clutch.width_mm | 64 | mm | sourced | M52 |
| rod.phs10_cs_n | 13200 | N | sourced | P34 |
| cost.tyre_pair_jpy | 11770 | JPY | sourced | M32 |
| cost.rim_each_jpy | 6480 | JPY | sourced | M33 |
| cost.ucp205_jpy | 1758 | JPY | sourced | M34 |
| cost.shaft25_short_jpy | 2088 | JPY | sourced | M35 |
| cost.spindle_pair_jpy | 9220 | JPY | sourced | M36 |
| cost.front_hub_jpy | 9390 | JPY | sourced | M37 |
| cost.rod_end_jpy | 1758 | JPY | sourced | M38 |
| cost.steering_wheel_jpy | 7280 | JPY | sourced | M39 |
| cost.ucfl204_jpy | 1640 | JPY | sourced | M40 |
| cost.disc_jpy | 5426 | JPY | sourced | M41 |
| cost.brake_hyd_jpy | 17640 | JPY | sourced | M42 |
| cost.pedal_kit_jpy | 8994 | JPY | sourced | M43 |
| cost.spr_t12_jpy | 1032 | JPY | sourced | M45 |
| cost.spr_t40_jpy | 2824 | JPY | sourced | M45 |
| cost.spr_t36_jpy | 1798 | JPY | sourced | M45 |
| cost.chain_3m_jpy | 3298 | JPY | sourced | M46 |
| cost.ucp204_jpy | 1648 | JPY | sourced | M47 |
| cost.shaft20_jpy | 2418 | JPY | sourced | M48 |
| cost.throttle_cable_jpy | 6680 | JPY | sourced | M49 |
| cost.kill_switch_jpy | 1135 | JPY | sourced | M50 |
| lay.wheelbase_mm | 1000 | mm | calculated | docs/03-design.md#layout |
| lay.track_front_mm | 1060 | mm | calculated | docs/03-design.md#layout |
| lay.track_rear_mm | 1150 | mm | calculated | docs/03-design.md#layout |
| lay.track_rear_narrow_mm | 1000 | mm | calculated | docs/03-design.md#transport |
| lay.rail_bottom_mm | 150 | mm | calculated | docs/03-design.md#layout |
| lay.rail_half_width_mm | 300 | mm | calculated | docs/03-design.md#frame |
| lay.front_half_width_mm | 430 | mm | calculated | docs/03-design.md#frame |
| lay.front_overhang_mm | 300 | mm | calculated | docs/03-design.md#layout |
| lay.rear_overhang_mm | 230 | mm | calculated | docs/03-design.md#layout |
| lay.hpoint_x_mm | 80 | mm | calculated | docs/03-design.md#fit |
| lay.hpoint_y_mm | -40 | mm | calculated | docs/03-design.md#fit |
| lay.seat_slide_mm | 120 | mm | calculated | docs/03-design.md#fit |
| lay.pedal_x_far_mm | 1010 | mm | calculated | docs/03-design.md#fit |
| lay.pedal_x_near_mm | 560 | mm | calculated | docs/03-design.md#fit |
| lay.wheel_x_mm | 600 | mm | calculated | docs/03-design.md#steering |
| lay.wheel_z_mm | 560 | mm | calculated | docs/03-design.md#steering |
| lay.steer_max_deg | 30 | deg | calculated | docs/03-design.md#steering |
| lay.engine_x_mm | 380 | mm | calculated | docs/03-design.md#drive |
| lay.engine_y_mm | 400 | mm | calculated | docs/03-design.md#drive |
| lay.jack_x_mm | 150 | mm | calculated | docs/03-design.md#drive |
| lay.jack_z_mm | 215 | mm | calculated | docs/03-design.md#drive |
| lay.chain1_y_mm | 205 | mm | calculated | docs/03-design.md#drive |
| lay.chain2_y_mm | 140 | mm | calculated | docs/03-design.md#drive |
| lay.bearing_y_mm | 420 | mm | calculated | docs/03-design.md#axle |
| lay.brake_y_mm | -150 | mm | calculated | docs/03-design.md#brake |
| lay.axle_length_mm | 1220 | mm | calculated | docs/03-design.md#axle |
| lay.disc_dia_mm | 152 | mm | calculated | docs/03-design.md#brake |
| gear.t_clutch | 10 |  | calculated | docs/03-design.md#drive |
| gear.t_jack_in | 40 |  | calculated | docs/03-design.md#drive |
| gear.t_jack_out | 12 |  | calculated | docs/03-design.md#drive |
| gear.t_axle | 36 |  | calculated | docs/03-design.md#drive |
| dsn.axle_dia_mm | 25 | mm | calculated | docs/03-design.md#axle |
| dsn.rail_od_mm | 31.8 | mm | calculated | docs/03-design.md#frame |
| dsn.rail_t_mm | 1.6 | mm | calculated | docs/03-design.md#frame |
| dsn.cross_od_mm | 25.4 | mm | calculated | docs/03-design.md#frame |
| dsn.cross_t_mm | 1.6 | mm | calculated | docs/03-design.md#frame |
| dsn.floor_t_mm | 2.3 | mm | calculated | docs/03-design.md#frame |
| dsn.load_factor | 2.5 |  | assumed | Q-017 |
| dsn.steel_density_kg_m3 | 7850 | kg/m3 | assumed | Q-017 |
| dsn.s45c_yield_mpa | 345 | MPa | assumed | Q-017 |
| dsn.stkm11a_tensile_mpa | 290 | MPa | assumed | Q-017 |
| dsn.wheel_mass_kg | 3.5 | kg | assumed | Q-017 |
| dsn.clutch_mass_kg | 1.2 | kg | assumed | Q-017 |
| dsn.seat_mass_kg | 3.0 | kg | assumed | Q-017 |
| dsn.steering_mass_kg | 4.0 | kg | assumed | Q-017 |
| dsn.brake_mass_kg | 2.0 | kg | assumed | Q-017 |
| dsn.misc_mass_kg | 5.0 | kg | assumed | Q-017 |
| dsn.fuel_mass_kg | 2.0 | kg | assumed | Q-017 |
| dsn.pad_mu | 0.35 |  | assumed | Q-017 |
| dsn.buttock_heel_ratio_adult | 0.587 |  | calculated | docs/03-design.md#fit |
| dsn.buttock_heel_ratio_child | 0.5 |  | assumed | Q-017 |
| cost.seat_kart_jpy | 16240 | JPY | sourced | M53 |
| cost.seat_rail_pair_jpy | 2900 | JPY | sourced | M54 |
| cost.sq_tube_25_jpy_per_m | 1078 | JPY | sourced | M55 |
| cost.flat_bar_jpy_per_m | 1012 | JPY | sourced | M56 |
| cost.uhmw_order_jpy | 2806 | JPY | sourced | M57 |
| cost.punched_sheet_jpy | 3628 | JPY | sourced | M58 |
| cost.padding_jpy | 1538 | JPY | sourced | M59 |
| cost.kill_lanyard_jpy | 1919 | JPY | sourced | M60 |
| cost.ramp_rail_jpy | 12078 | JPY | sourced | M61 |
| cost.seat_operator_jpy | 5460 | JPY | sourced | M62 |
| cost.plate_allow_jpy | 6000 | JPY | assumed | Q-018 |
| cost.machining_allow_jpy | 12000 | JPY | assumed | Q-018 |
| cost.rear_hub_make_jpy | 3000 | JPY | assumed | Q-018 |
| cost.axle_shaft_jpy | 5000 | JPY | assumed | Q-018 |
| cost.welder_jpy | 9900 | JPY | sourced | M11 |
| form.mass_total_kg | 170 | kg | calculated | docs/02-form.md#mass |
| snow.wheel_sinkage_min_cm | 19.0 | cm | calculated | docs/02-form.md#snow |
| snow.wheel_sinkage_max_cm | 25.1 | cm | calculated | docs/02-form.md#snow |
| snow.track_pressure_kpa | 5.3 | kPa | calculated | docs/02-form.md#snow |
| snow.ski_pressure_kpa | 4.6 | kPa | calculated | docs/02-form.md#snow |
| snow.track_sinkage_max_cm | 11.1 | cm | calculated | docs/02-form.md#snow |
| snow.ski_sinkage_max_cm | 8.8 | cm | calculated | docs/02-form.md#snow |
| snow.track_sinkage_wheels_cm | 20.9 | cm | calculated | docs/02-form.md#snow |
| snow.wheel_depth_limit_cm | 17.9 | cm | calculated | docs/02-form.md#snow |
| snow.wheel_depth_limit_axle_cm | 8.9 | cm | calculated | docs/02-form.md#snow |
| form.cg_height_m | 0.368 | m | calculated | docs/02-form.md#stability |
| form.width_overall_m | 1.24 | m | calculated | docs/02-form.md#transport |
| form.track_min_m | 1.11 | m | calculated | docs/02-form.md#stability |
| form.track_min_slope_m | 1.79 | m | calculated | docs/02-form.md#stability |
| drive.engine_ratio | 11.97 |  | calculated | docs/02-form.md#drive |
| drive.engine_thrust_n | 745 | N | calculated | docs/02-form.md#drive |
| drive.engine_thrust_cont_n | 641 | N | calculated | docs/02-form.md#drive |
| drive.motor_thrust_n | 183 | N | calculated | docs/02-form.md#drive |
| drive.motor2_thrust_n | 350 | N | calculated | docs/02-form.md#drive |
| drive.clutch_engage_kmh | 10.4 | km/h | calculated | docs/02-form.md#drive |
| drive.clutch_lock_kmh | 13.5 | km/h | calculated | docs/02-form.md#drive |
| drive.climb_force_n | 523 | N | calculated | docs/02-form.md#drive |
| drive.grass_power_kw | 1.24 | kW | calculated | docs/02-form.md#drive |
| drive.power_avg_heavy_w | 556 | W | calculated | docs/02-form.md#drive |
| battery.run_time_heavy_min | 133 | min | calculated | docs/02-form.md#drive |
| drive.sprocket_reach_mm | -81 | mm | calculated | docs/02-form.md#drive |
| cost.chassis_jpy | 93902 | JPY | calculated | docs/02-form.md#cost |
| cost.power_engine_clone_jpy | 37940 | JPY | calculated | docs/02-form.md#cost |
| cost.power_engine_genuine_jpy | 86940 | JPY | calculated | docs/02-form.md#cost |
| cost.power_electric_jpy | 94772 | JPY | calculated | docs/02-form.md#cost |
| cost.power_electric2_jpy | 136674 | JPY | calculated | docs/02-form.md#cost |
| cost.winter_skis_chains_jpy | 22960 | JPY | calculated | docs/02-form.md#cost |
| cost.winter_tracks_jpy | 76000 | JPY | calculated | docs/02-form.md#cost |
| cost.total_l2_e1_w1_jpy | 154802 | JPY | calculated | docs/02-form.md#cost |
| cost.total_l2_e1_w2_jpy | 207842 | JPY | calculated | docs/02-form.md#cost |
| cost.total_cheap_new_w1_jpy | 149794 | JPY | calculated | docs/02-form.md#cost |
| cost.total_donor_min_w1_jpy | 112901 | JPY | calculated | docs/02-form.md#cost |
| cost.total_donor_w1_jpy | 136031 | JPY | calculated | docs/02-form.md#cost |
| cost.total_donor_e1_w1_jpy | 150841 | JPY | calculated | docs/02-form.md#cost |
| cost.total_donor_narrow_summer_jpy | 66551 | JPY | calculated | docs/02-form.md#cost |
| dsn.length_m | 1.53 | m | calculated | docs/03-design.md#layout |
| dsn.width_m | 1.277 | m | calculated | docs/03-design.md#layout |
| dsn.width_transport_m | 1.187 | m | calculated | docs/03-design.md#transport |
| dsn.tube_main_m | 3.35 | m | calculated | docs/03-design.md#frame |
| dsn.tube_cross_m | 8.95 | m | calculated | docs/03-design.md#frame |
| dsn.ratio | 12.0 |  | calculated | docs/03-design.md#drive |
| dsn.top_speed_kmh | 19.65 | km/h | calculated | docs/03-design.md#drive |
| dsn.chain1_centre_mm | 243 | mm | calculated | docs/03-design.md#drive |
| dsn.chain2_centre_mm | 159 | mm | calculated | docs/03-design.md#drive |
| dsn.chain1_links | 66 |  | calculated | docs/03-design.md#drive |
| dsn.chain2_links | 52 |  | calculated | docs/03-design.md#drive |
| dsn.chain1_gap_mm | 105 | mm | calculated | docs/03-design.md#drive |
| dsn.chain2_gap_mm | 55 | mm | calculated | docs/03-design.md#drive |
| dsn.low_point_mm | 86 | mm | calculated | docs/03-design.md#axle |
| dsn.turn_radius_m | 2.26 | m | calculated | docs/03-design.md#steering |
| dsn.leg_margin_adult_mm | 68 | mm | calculated | docs/03-design.md#fit |
| dsn.leg_margin_child_mm | 149 | mm | calculated | docs/03-design.md#fit |
| dsn.mass_kg | 87.6 | kg | calculated | docs/03-design.md#mass |
| dsn.cg_x_m | 0.378 | m | calculated | docs/03-design.md#mass |
| dsn.cg_z_m | 0.235 | m | calculated | docs/03-design.md#mass |
| dsn.frame_mass_kg | 12.4 | kg | calculated | docs/03-design.md#frame |
| dsn.rear_share_adult | 0.728 |  | calculated | docs/03-design.md#mass |
| dsn.cg_height_adult_m | 0.356 | m | calculated | docs/03-design.md#mass |
| dsn.tip_ratio_adult | 1.58 |  | calculated | docs/03-design.md#stability |
| dsn.rear_share_child | 0.636 |  | calculated | docs/03-design.md#mass |
| dsn.cg_height_child_m | 0.257 | m | calculated | docs/03-design.md#mass |
| dsn.tip_ratio_child | 2.17 |  | calculated | docs/03-design.md#stability |
| dsn.climb_force_n | 577 | N | calculated | docs/03-design.md#climb |
| dsn.climb_grip_n | 649 | N | calculated | docs/03-design.md#climb |
| dsn.climb_thrust_n | 758 | N | calculated | docs/03-design.md#climb |
| dsn.axle_stress_mpa | 169 | MPa | calculated | docs/03-design.md#axle |
| dsn.axle_safety | 2.04 |  | calculated | docs/03-design.md#axle |
| dsn.rail_stress_mpa | 126 | MPa | calculated | docs/03-design.md#frame |
| dsn.rail_safety | 2.29 |  | calculated | docs/03-design.md#frame |
| dsn.bearing_load_n | 669 | N | calculated | docs/03-design.md#axle |
| dsn.brake_decel_needed | 2.57 | m/s2 | calculated | docs/03-design.md#brake |
| dsn.brake_torque_needed_nm | 78 | N m | calculated | docs/03-design.md#brake |
| dsn.brake_clamp_needed_n | 1750 | N | calculated | docs/03-design.md#brake |
| dsn.delica_length_margin_mm | 80 | mm | calculated | docs/03-design.md#transport |
| dsn.delica_width_margin_mm | 43 | mm | calculated | docs/03-design.md#transport |
| dsn.height_m | 0.71 | m | calculated | docs/03-design.md#layout |
| dsn.bom_parts_jpy | 224104 | JPY | calculated | docs/03-design.md#cost |
| dsn.bom_tools_jpy | 34056 | JPY | calculated | docs/03-design.md#cost |
<!-- tdr:end -->

## 1.1.7 Open items {#open}

<!-- tdr:table kind=open fields=id,text,waits_for -->
| id | text | waits_for |
|---|---|---|
| Q-001 | How heavy is the heaviest adult who will drive? The strength is assumed for 100 kg until the owner answers. | owner |
| Q-002 | How tall is the tallest adult who will drive? The youngest is a 5-year-old (D-010); the lower end of the seat and pedal range is set from the statistics of 5-year-olds. The upper end is assumed at 185 cm until the owner answers. | owner |
| Q-003 | Does the top speed of 30 km/h have to be reached on snow, or is a lower speed enough on packed snow and in fresh snow? R-05 and R-06 ask only that the kart runs, turns, and stops on snow. | owner |
| Q-004 | Set the longest stopping distance from the top speed from a go-kart standard or kart rules. Until then it is assumed at 6 m, about 0.6 g. | assistant |
| Q-005 | Set the smallest ratio of half the track width to the height of the centre of mass, so that the kart slides before it tips, from tyre friction data and any standard. Until then it is assumed at 1.5. Also decide whether R-12 must hold standing sideways on site.grade_max_pct, which needs a wider track (form.track_min_slope_m, check K-001). | assistant |
| Q-006 | Where is the kart kept (indoors, under a roof, outdoors), and must it be carried in a car or a truck? This sets the size and mass limits and whether it stands in the cold before a run. | owner |
| Q-007 | How often is the kart used, and by when should it be ready? The run time is settled by D-013. | owner |
| Q-008 | How steep is the fairly steep slope of D-014? It is assumed at 20 % (about 11 degrees) until the owner gives a number or measures the steepest slope on the land. | owner |
| Q-009 | The rough inputs of step 1.2 (kart mass and its rear share, tyre pressure, track wheel diameter, ski size, drive efficiency, tube lengths, ground clearance, heights of the centres of mass, and a mean speed, rolling resistance, electric efficiency, and usable battery fraction for the run time) are assumed so that forms can be compared. Step 1.3 replaces each with the chosen part's data or a calculation. | assistant |
| Q-010 | The price of the 12 V chargers for E2 and the allowances for shipping, small parts, a reduction stage, skis, the track running gear, pedals and cables and the stop switch, guards and mounts, drive chains, and electric wiring are assumed. Whether the snow chain price of M15 is for one tyre or a pair is not known; two are counted. Step 1.5 replaces each with a quoted price. | assistant |
| Q-011 | What is the governed no-load speed of the chosen engine? The gearing for R-01 is set to it. It is assumed at 3850 rpm from a checker's recollection (K-001), not from a source; take it from the engine maker's data, or measure it on the engine when it arrives. | assistant |
| Q-012 | How far does the owner's fresh snow give under a loaded plate? A board of known area loaded to about 5 kPa and to about 16 kPa, set on undisturbed fresh snow and its sinkage measured, settles whether rear tracks (W2) clear snow.depth_max_cm before the frame is given mounts for them. | owner |
| Q-013 | Should an adult be able to set a lower top speed for a small child? A 5-year-old drives (D-010), while US youth ATV guidance allows no ATVs under 6 and limits ages 6 and up to 10 mph with the restrictor (P25, S2). The child limit is assumed at 16 km/h, about 10 mph, until the owner decides R-17. | owner |
| Q-014 | The 3D simulator needs the tyre grip on pavement, gravel, and grass, the sideways grip of the front skis, the resistance of tracks in fresh snow, and the resistance when the floor ploughs snow. No source was found; they are assumed so that the simulator can run, and a test run of the built kart settles them. Simulator results that rest on them are illustrations, not verification. | assistant |
| Q-015 | In the owner's Delica D:5, with the third row flipped up and the second row tipped up and slid forward, how wide is the clear space at the floor and at 40 cm above it, and how wide is the tailgate opening at the height of the cargo floor? The sources give only the narrowest and widest widths. | owner |
| Q-016 | How many hours a day can the owner work on the kart? The plan in docs/data/plan.yaml assumes two to three hours a day for its task lengths. | owner |
| Q-017 | Step 1.3 assumes, without a source yet, the dynamic load factor on the frame and axle, the density and strength of S45C and STKM11A steel, the masses of a wheel with its tyre, the clutch, the seat, the steering, the brake, the fuel, and small parts, the brake pad friction, and the ratio of buttock-to-heel length to stature for an adult and for a 5-year-old. Cite a standard, a maker's data, or a weighing for each before the gate from design to build. | assistant |
| Q-018 | The parts list assumes the price of steel plate cut to size, of machining by a local shop (keyways on the axle and the jackshaft, boring the 36 tooth sprocket, cross holes for the hub pins, the brake disc carrier), of making the two rear hubs, and of a 25 mm axle shaft of 1.22 m. Get quotes before the gate from design to build. | assistant |
| Q-019 | The fit of bought parts to each other is not stated by their sellers and is checked when they arrive, before the frame is welded to them - the rim's three-hole pattern against the front hubs and the made rear hubs, the front hubs' bore against the 17 mm spindles, the engine's shaft (3/4 inch Q-type) and base holes, the ladder chains on 13x5.00-6 tyres, and the seat's rail bolt spacing. | assistant |
<!-- tdr:end -->
