# The record

Every fact of the design, generated from `record/` by `python tools/tdr.py` and the table generator; never edited by hand.
The current state, with open items grouped by whom they wait for, is in [STATUS.md](https://github.com/fujisato-koji/kart/blob/main/STATUS.md).

## Decisions {#decisions}

<!-- tdr:table kind=decision fields=id,date,by,what -->
| id | date | by | what |
|---|---|---|---|
| D-001 | 2026-11-03 | owner | Build one go-kart with one seat, for the owner's private land, to be driven mainly by a child and also by an adult, in summer and in winter. The power source is not preset; the form step compares an engine and an electric drive. |
| D-002 | 2026-11-03 | owner | Keep the record public in fujisato-koji/kart, created from the traceable-design template. The record is written in English and the conversation with the assistant is in Japanese. Private facts such as the place stay outside the repository. |
| D-003 | 2026-11-03 | owner | The top speed is set for a child, at 30 km/h. |
| D-004 | 2026-11-03 | owner | The speed is set for a child, but the strength and the seat and pedal positions must also fit an adult. |
| D-005 | 2026-11-03 | owner | The kart runs only on private land, on paved ground, gravel or dirt, and grass. It does not run on public roads. |
| D-006 | 2026-11-03 | owner | In winter the kart runs on private land on packed snow or ice and on fresh snow up to 30 cm deep. |
| D-007 | 2026-11-03 | owner | The lowest air temperature in use is -10 degC. |
| D-008 | 2026-11-03 | owner | The budget for parts and materials is 100,000 JPY, including tax, shipping, and the winter parts, and excluding tools. It is a guideline that may be passed a little; when it is likely to be passed, the assistant names the parts that drive it and the owner decides. The owner would buy a welder if the chosen form needs one. |
| D-009 | 2026-11-03 | owner | The heaviest adult who drives weighs 100 kg. |
| D-010 | 2026-11-03 | owner | The youngest driver is a 5-year-old child. |
| D-011 | 2026-11-03 | owner | On snow the kart may be slow. The top speed of 30 km/h applies on paved ground. |
| D-012 | 2026-11-03 | owner | The kart is kept outdoors under a roof, and is carried in a Mitsubishi Delica D:5, in which it should be easy to load and carry. |
| D-013 | 2026-11-03 | owner | With an engine, refuelling between runs is acceptable. With batteries, two to three hours of driving per charge is wanted, depending on the trade-off. |
| D-014 | 2026-11-03 | owner | The kart must not be damaged on a fairly steep slope. It may climb slowly. |
| D-015 | 2026-11-03 | owner | The top speed on paved ground is lowered to 20 km/h, to see whether the kart can be made cheaper. |
| D-016 | 2026-11-03 | owner | The tallest adult who drives is about 170 cm tall. |
| D-017 | 2026-11-03 | owner | Make the design concrete with new parts that are readily available in Japan, with realistic shapes, and show the designed kart in 3D to grasp what will be built; the 3D view need not be a driving game. This settles item 1 of docs/02-form.md#proposal as new parts (L2). The other items of that proposal are taken as the working basis of step 1.3 until the owner decides them. |
| D-018 | 2026-11-04 | owner | No lower speed limit for the child is needed; the kart has one top speed for every driver. |
<!-- tdr:end -->

## Open items {#open}

<!-- tdr:table kind=open fields=id,text,waits_for,closed_by -->
| id | text | waits_for | closed_by |
|---|---|---|---|
| Q-001 | How heavy is the heaviest adult who will drive? The strength is assumed for 100 kg until the owner answers. | owner | D-009 |
| Q-002 | How tall is the tallest adult who will drive? The youngest is a 5-year-old (D-010); the lower end of the seat and pedal range is set from the statistics of 5-year-olds. The upper end is assumed at 185 cm until the owner answers. | owner | D-016 |
| Q-003 | Does the top speed of 30 km/h have to be reached on snow, or is a lower speed enough on packed snow and in fresh snow? R-05 and R-06 ask only that the kart runs, turns, and stops on snow. | owner | D-011 |
| Q-004 | Set the longest stopping distance from the top speed from a go-kart standard or kart rules. Until then it is assumed at 6 m, about 0.6 g. | assistant |  |
| Q-005 | Set the smallest ratio of half the track width to the height of the centre of mass, so that the kart slides before it tips, from tyre friction data and any standard. Until then it is assumed at 1.5. Also decide whether R-12 must hold standing sideways on site.grade_max_pct, which needs a wider track (form.track_min_slope_m, check K-001). | assistant |  |
| Q-006 | Where is the kart kept (indoors, under a roof, outdoors), and must it be carried in a car or a truck? This sets the size and mass limits and whether it stands in the cold before a run. | owner | D-012 |
| Q-007 | How often is the kart used, and by when should it be ready? The run time is settled by D-013. | owner |  |
| Q-008 | How steep is the fairly steep slope of D-014? It is assumed at 20 % (about 11 degrees) until the owner gives a number or measures the steepest slope on the land. | owner |  |
| Q-009 | The rough inputs of step 1.2 (kart mass and its rear share, tyre pressure, track wheel diameter, ski size, drive efficiency, tube lengths, ground clearance, heights of the centres of mass, and a mean speed, rolling resistance, electric efficiency, and usable battery fraction for the run time) are assumed so that forms can be compared. Step 1.3 replaces each with the chosen part's data or a calculation. | assistant |  |
| Q-010 | The price of the 12 V chargers for E2 and the allowances for shipping, small parts, a reduction stage, skis, the track running gear, pedals and cables and the stop switch, guards and mounts, drive chains, and electric wiring are assumed. Whether the snow chain price of M15 is for one tyre or a pair is not known; two are counted. Step 1.5 replaces each with a quoted price. | assistant |  |
| Q-011 | What is the governed no-load speed of the chosen engine? The gearing for R-01 is set to it. It is assumed at 3850 rpm from a checker's recollection (K-001), not from a source; take it from the engine maker's data, or measure it on the engine when it arrives. | assistant |  |
| Q-012 | How far does the owner's fresh snow give under a loaded plate? A board of known area loaded to about 5 kPa and to about 16 kPa, set on undisturbed fresh snow and its sinkage measured, settles whether rear tracks (W2) clear snow.depth_max_cm before the frame is given mounts for them. | owner |  |
| Q-013 | Should an adult be able to set a lower top speed for a small child? A 5-year-old drives (D-010), while US youth ATV guidance allows no ATVs under 6 and limits ages 6 and up to 10 mph with the restrictor (P25, S2). The child limit is assumed at 16 km/h, about 10 mph, until the owner decides R-17. | owner | D-018 |
| Q-014 | The 3D simulator needs the tyre grip on pavement, gravel, and grass, the sideways grip of the front skis, the resistance of tracks in fresh snow, and the resistance when the floor ploughs snow. No source was found; they are assumed so that the simulator can run, and a test run of the built kart settles them. Simulator results that rest on them are illustrations, not verification. | assistant |  |
| Q-015 | In the owner's Delica D:5, with the third row flipped up and the second row tipped up and slid forward, how wide is the clear space at the floor and at 40 cm above it, and how wide is the tailgate opening at the height of the cargo floor? The sources give only the narrowest and widest widths. | owner |  |
| Q-016 | How many hours a day can the owner work on the kart? The plan in docs/data/plan.yaml assumes two to three hours a day for its task lengths. | owner |  |
| Q-017 | Step 1.3 assumes, without a source yet, the dynamic load factor on the frame and axle, the density and strength of S45C and STKM11A steel, the masses of a wheel with its tyre, the clutch, the seat, the steering, the brake, the fuel, and small parts, the brake pad friction, and the ratio of buttock-to-heel length to stature for an adult and for a 5-year-old. Cite a standard, a maker's data, or a weighing for each before the gate from design to build. | assistant |  |
| Q-018 | The parts list assumes the price of steel plate cut to size, of machining by a local shop (keyways on the axle and the jackshaft, boring the 36 tooth sprocket, cross holes for the hub pins, the brake disc carrier), of making the two rear hubs, and of a 25 mm axle shaft of 1.22 m. Get quotes before the gate from design to build. | assistant |  |
| Q-019 | The fit of bought parts to each other is not stated by their sellers and is checked when they arrive, before the frame is welded to them - the rim's three-hole pattern against the front hubs and the made rear hubs, the front hubs' bore against the 17 mm spindles, the engine's shaft (3/4 inch Q-type) and base holes, the ladder chains on 13x5.00-6 tyres, and the seat's rail bolt spacing. | assistant |  |
| Q-020 | The layout of step 1.3 is not yet buildable (K-005). Rearrange the drive so that the chains, the jackshaft and its bearings, the middle axle bearing, and the guard fit between the seat and the left rail, or move the drive outboard; redesign the column support so it holds the column at its lower flange bearing and clears the legs; route the pedal box rails clear of the cross members; raise the steering arms and tie rods clear of the front rails; join every plate, the floor, and the seat slide to the frame; widen the seat space; and add the cornering side force to the axle and the engine's offset to the left rail. | assistant |  |
<!-- tdr:end -->

## Values {#values}

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
| lay.track_rear_narrow_mm | 1040 | mm | calculated | docs/03-design.md#transport |
| lay.rail_bottom_mm | 150 | mm | calculated | docs/03-design.md#layout |
| lay.rail_half_width_mm | 300 | mm | calculated | docs/03-design.md#frame |
| lay.front_half_width_mm | 430 | mm | calculated | docs/03-design.md#frame |
| lay.front_overhang_mm | 300 | mm | calculated | docs/03-design.md#layout |
| lay.rear_overhang_mm | 230 | mm | calculated | docs/03-design.md#layout |
| lay.hpoint_x_mm | 80 | mm | calculated | docs/03-design.md#fit |
| lay.hpoint_y_mm | -90 | mm | calculated | docs/03-design.md#fit |
| lay.seat_slide_mm | 120 | mm | calculated | docs/03-design.md#fit |
| lay.pedal_x_far_mm | 930 | mm | calculated | docs/03-design.md#fit |
| lay.pedal_x_near_mm | 560 | mm | calculated | docs/03-design.md#fit |
| lay.wheel_x_mm | 600 | mm | calculated | docs/03-design.md#steering |
| lay.wheel_z_mm | 560 | mm | calculated | docs/03-design.md#steering |
| lay.steer_max_deg | 30 | deg | calculated | docs/03-design.md#steering |
| lay.engine_x_mm | 380 | mm | calculated | docs/03-design.md#drive |
| lay.engine_y_mm | 430 | mm | calculated | docs/03-design.md#drive |
| lay.jack_x_mm | 150 | mm | calculated | docs/03-design.md#drive |
| lay.jack_z_mm | 215 | mm | calculated | docs/03-design.md#drive |
| lay.chain1_y_mm | 225 | mm | calculated | docs/03-design.md#drive |
| lay.chain2_y_mm | 155 | mm | calculated | docs/03-design.md#drive |
| lay.bearing_y_mm | 400 | mm | calculated | docs/03-design.md#axle |
| lay.brake_y_mm | -350 | mm | calculated | docs/03-design.md#brake |
| lay.axle_length_mm | 1210 | mm | calculated | docs/03-design.md#axle |
| lay.disc_dia_mm | 152 | mm | calculated | docs/03-design.md#brake |
| gear.t_clutch | 10 |  | calculated | docs/03-design.md#drive |
| gear.t_jack_in | 40 |  | calculated | docs/03-design.md#drive |
| gear.t_jack_out | 12 |  | calculated | docs/03-design.md#drive |
| gear.t_axle | 36 |  | calculated | docs/03-design.md#drive |
| dsn.axle_dia_mm | 25 | mm | calculated | docs/03-design.md#axle |
| dsn.rail_od_mm | 31.8 | mm | calculated | docs/03-design.md#frame |
| dsn.rail_t_mm | 2.3 | mm | calculated | docs/03-design.md#frame |
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
| lay.bearing_mid_y_mm | 245 | mm | calculated | docs/03-design.md#axle |
| lay.axle_gap_mm | 30 | mm | calculated | docs/03-design.md#frame |
| lay.kick_x_mm | 250 | mm | calculated | docs/03-design.md#frame |
| cost.tube_32x23_jpy_per_m | 1700 | JPY/m | assumed | Q-018 |
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
| dsn.width_transport_m | 1.21 | m | calculated | docs/03-design.md#transport |
| dsn.axle_rail_gap_mm | 30 | mm | calculated | docs/03-design.md#frame |
| dsn.tube_main_m | 3.37 | m | calculated | docs/03-design.md#frame |
| dsn.tube_cross_m | 8.66 | m | calculated | docs/03-design.md#frame |
| dsn.hub_bearing_gap_mm | 39 | mm | calculated | docs/03-design.md#transport |
| dsn.ratio | 12.0 |  | calculated | docs/03-design.md#drive |
| dsn.top_speed_kmh | 19.65 | km/h | calculated | docs/03-design.md#drive |
| dsn.chain1_centre_mm | 240.0 | mm | calculated | docs/03-design.md#drive |
| dsn.chain2_centre_mm | 157.6 | mm | calculated | docs/03-design.md#drive |
| dsn.chain1_links | 64 |  | calculated | docs/03-design.md#drive |
| dsn.chain2_links | 50 |  | calculated | docs/03-design.md#drive |
| dsn.chain1_gap_mm | 102 | mm | calculated | docs/03-design.md#drive |
| dsn.chain2_gap_mm | 54 | mm | calculated | docs/03-design.md#drive |
| dsn.engine_x_mm | 375 | mm | calculated | docs/03-design.md#drive |
| dsn.jack_x_mm | 149 | mm | calculated | docs/03-design.md#drive |
| dsn.low_point_mm | 86 | mm | calculated | docs/03-design.md#axle |
| dsn.turn_radius_m | 2.26 | m | calculated | docs/03-design.md#steering |
| dsn.leg_margin_adult_mm | 148 | mm | calculated | docs/03-design.md#fit |
| dsn.leg_margin_child_mm | 149 | mm | calculated | docs/03-design.md#fit |
| dsn.mass_kg | 94.5 | kg | calculated | docs/03-design.md#mass |
| dsn.cg_x_m | 0.368 | m | calculated | docs/03-design.md#mass |
| dsn.cg_y_m | 0.097 | m | calculated | docs/03-design.md#mass |
| dsn.cg_z_m | 0.231 | m | calculated | docs/03-design.md#mass |
| dsn.frame_mass_kg | 13.8 | kg | calculated | docs/03-design.md#frame |
| dsn.rear_share_adult | 0.729 |  | calculated | docs/03-design.md#mass |
| dsn.cg_side_adult_mm | 1 | mm | calculated | docs/03-design.md#mass |
| dsn.cg_height_adult_m | 0.35 | m | calculated | docs/03-design.md#mass |
| dsn.tip_ratio_adult | 1.61 |  | calculated | docs/03-design.md#stability |
| dsn.rear_share_child | 0.644 |  | calculated | docs/03-design.md#mass |
| dsn.cg_side_child_mm | 66 | mm | calculated | docs/03-design.md#mass |
| dsn.cg_height_child_m | 0.253 | m | calculated | docs/03-design.md#mass |
| dsn.tip_ratio_child | 1.95 |  | calculated | docs/03-design.md#stability |
| dsn.climb_force_n | 599 | N | calculated | docs/03-design.md#climb |
| dsn.climb_grip_n | 672 | N | calculated | docs/03-design.md#climb |
| dsn.climb_thrust_n | 758 | N | calculated | docs/03-design.md#climb |
| dsn.axle_chain_pull_n | 1691 | N | calculated | docs/03-design.md#axle |
| dsn.axle_stress_mpa | 222 | MPa | calculated | docs/03-design.md#axle |
| dsn.axle_safety | 1.56 |  | calculated | docs/03-design.md#axle |
| dsn.frame_moment_nm | 559 | N m | calculated | docs/03-design.md#frame |
| dsn.rail_stress_mpa | 191 | MPa | calculated | docs/03-design.md#frame |
| dsn.rail_safety | 1.52 |  | calculated | docs/03-design.md#frame |
| dsn.bearing_load_n | 695 | N | calculated | docs/03-design.md#axle |
| dsn.brake_decel_needed | 2.57 | m/s2 | calculated | docs/03-design.md#brake |
| dsn.brake_torque_needed_nm | 81 | N m | calculated | docs/03-design.md#brake |
| dsn.brake_clamp_needed_n | 1814 | N | calculated | docs/03-design.md#brake |
| dsn.brake_downhill_decel | 0.93 | m/s2 | calculated | docs/03-design.md#brake |
| dsn.brake_downhill_stop_m | 16.6 | m | calculated | docs/03-design.md#brake |
| dsn.delica_length_margin_mm | 80 | mm | calculated | docs/03-design.md#transport |
| dsn.delica_width_margin_mm | 20 | mm | calculated | docs/03-design.md#transport |
| dsn.height_m | 0.71 | m | calculated | docs/03-design.md#layout |
| dsn.bom_parts_jpy | 228130 | JPY | calculated | docs/03-design.md#cost |
| dsn.bom_tools_jpy | 34056 | JPY | calculated | docs/03-design.md#cost |
<!-- tdr:end -->

## Sources {#sources}

<!-- tdr:table kind=source fields=id,class,title,read -->
| id | class | title | read |
|---|---|---|---|
| P1 | P | Richmond, Motion Resistance of Wheeled Vehicles in Snow, CRREL Report 95-7, 1995 | partial |
| P2 | P | Lines, Elliott, Ray, Rigid Wheel Design and Evaluation for Lightweight Snow Rover, ISTVS conference proceedings, 2021 | partial |
| P3 | P | Lever et al., Advances in Antarctic Sled Technology, ERDC/CRREL TR-16-4, 2016 | partial |
| P4 | P | Honda GX200 product page | partial |
| P5 | P | Honda GX160 and GX200 Owner's Manual 00X37ZEE6000 | partial |
| P6 | P | EVE Energy LF105 Product Specification Ver. F, 2019-12-02 | partial |
| P7 | P | Yuasa NP Valve Regulated Lead Acid Battery Manual | partial |
| P8 | P | SUZUKID Buddy80 SBD-80 maker shop page | full |
| P9 | P | Toyota, GR KART release | full |
| P10 | P | CIK-FIA Technical Regulations 2023 | partial |
| P11 | P | Road Traffic Act of Japan (道路交通法), articles 1 and 2, e-Gov | partial |
| P12 | P | Sendai High Court judgment of 1963-12-23 on places used for general traffic | partial |
| P13 | P | Road Transport Vehicle Act of Japan (道路運送車両法), article 2, e-Gov | partial |
| P14 | P | Automobile Liability Security Act of Japan (自動車損害賠償保障法), articles 2, 3, 5, 10, e-Gov | partial |
| P15 | P | MLIT detailed technical notice, attachment 98 (braking of mopeds) and article 302 | partial |
| P16 | P | JAF guideline for go-kart and similar events, 2023-03-27 | partial |
| P17 | P | JAF national kart technical rules 2019 | partial |
| P18 | P | JAF national kart technical rules 2026, comparison of old and new text | partial |
| P19 | P | Adler, Go-Kart Related Injuries and Deaths to Children, US CPSC, 2000 | partial |
| P20 | P | Consumer Affairs Agency of Japan, caution on go-kart and similar accidents, 2022-12-02 | partial |
| P21 | P | MEXT school health statistics FY2025, national tables 1 to 3, e-Stat | full |
| P22 | P | AIST human body dimension database 1991-92 | full |
| P23 | P | ASTM F2011-02(2018), Standard Specification for Fun-Karts, abstract | abstract |
| P24 | P | Petterson and Gooch, Rolling resistance of ATV tyres in agriculture, DESIGN 2020, doi:10.1017/dsd.2020.75 | partial |
| P25 | P | US CPSC, Guidance for Youth ATVs | full |
| P26 | P | Mitsubishi Motors FAQ No.762, cargo space dimensions of the Delica D:5 | full |
| P27 | P | Mitsubishi Motors FAQ No.440, opening dimensions of the Delica D:5 | full |
| P29 | P | Stilwell, Gooch, Lafitte, Comparison of e-scooter tyre performance using rolling resistance trailer, DESIGN 2024, doi:10.1017/pds.2024.148 | partial |
| P30 | P | Honda, GX200 equipment drawing, June 2022 | full |
| P31 | P | Katayama Chain (KANA), catalogue pages 162 to 171, FB sprockets No.40 | partial |
| P32 | P | NTN bearing finder, S-UCP205D1 pillow block unit | full |
| P33 | P | FYH mounted units catalogue, pages 84 to 88 | partial |
| P34 | P | THK, rod ends PHS and POS, catalogue A23 | partial |
| S1 | S | Scheibe, An Overview of Studded and Studless Tire Traction and Safety, WSDOT WA-RD 551.1, 2002 | partial |
| S2 | S | University of Iowa, Parents Guide To ATV Safety (patient and family handout) | full |
| M1 | M | Yahoo Shopping search for Honda GX160 general-purpose engines | partial |
| M2 | M | Yahoo Shopping search for go-kart centrifugal clutches, 19 mm bore | partial |
| M3 | M | Yahoo Shopping search for 48 V 1000 W motor, controller, and throttle kits | partial |
| M4 | M | LVYUAN LiFePO4 12.8 V 30 Ah battery, Yahoo Shopping | partial |
| M5 | M | Motion Dynamics, Unite MY1020 1000 W 3000 rpm 48 V DC motor | partial |
| M6 | M | Haganeya, STKM11A round steel tube 25.4 x 1.6 | full |
| M7 | M | Haganeya, STKM11A round steel tube 31.8 x 1.6 | full |
| M8 | M | Go-kart rear axle kit (axle, sprocket, brake, hubs), Yahoo Shopping | full |
| M9 | M | AliExpress search for go-kart steering spindle kits | partial |
| M10 | M | Yahoo Shopping search for 13x5.00-6 tyres with wheels | partial |
| M11 | M | TOAN TW-MIG100X 100 V no-gas welder, Yahoo Shopping | full |
| M12 | M | Yahoo Shopping search for 40 x 40 aluminium extrusion, 1000 mm | partial |
| M13 | M | Yahoo Shopping search for snowblower rubber tracks | partial |
| M14 | M | VXB rear axle rubber track kit for go-karts and ATVs | partial |
| M15 | M | Yahoo Shopping searches for snowblower tyre chains | partial |
| M16 | M | Yahoo Auctions closed listings for racing kart frames | partial |
| M17 | M | AliExpress search for go-kart seats | partial |
| M18 | M | kakaku.com search for 196 cc engines (OVAQUIXI 196 cc 6.5 HP OHV engine on Amazon.co.jp) | partial |
| M19 | M | VEVOR 48 V 2000 W brushless motor and controller kit (MY1020D type), eBay listing | excerpt |
| M20 | M | kakaku.com search for 48 V 2000 W brushless motors (kit with 34 A controller and throttle on Amazon.co.jp) | partial |
| M21 | M | LiTime 51.2 V 30 Ah LiFePO4 battery, Yahoo Shopping | partial |
| M22 | M | LiTime 58.4 V 10 A LiFePO4 charger L48V10A-BCHA-A, Yahoo Shopping | partial |
| M23 | M | GoKartSupply, centrifugal clutches | full |
| M24 | M | OMB Warehouse, Comet TAV2 torque converter drive 3/4 inch 10T | full |
| M25 | M | Ameetaa 30-series torque converter kit AMT-GKC001, Yahoo Shopping | full |
| M26 | M | Yahoo Auctions closed listings for used four-wheel buggies (四輪バギー, バギー 中古, バギー 110cc) | partial |
| M27 | M | Yahoo Auctions closed listings for used general-purpose engines (GX160 中古, 汎用エンジン 中古) | partial |
| M28 | M | AliExpress search for 13x5.00-6 tyres on rims | partial |
| M29 | M | AliExpress search for go-kart mechanical disc brakes | partial |
| M30 | M | AliExpress search for 25 mm go-kart rear axle parts | partial |
| M31 | M | AliExpress search for go-kart steering knuckle kits | partial |
| M32 | M | BKT LG-RIB 13x5.00-6 4PR tubeless tyres, pair, Yahoo Shopping | full |
| M33 | M | 6 inch three-hole rims for 13x5.00-6, Yahoo Shopping | full |
| M34 | M | FYH UCP205 pillow block, MonotaRO | excerpt |
| M35 | M | S45CD bright bar 25 mm cut to length, MonotaRO | excerpt |
| M36 | M | Go-kart spindle pair 17 mm, Yahoo Shopping | partial |
| M37 | M | Go-kart front hub 78 mm three studs, Yahoo Shopping | full |
| M38 | M | THK PHS10 rod end, MonotaRO | excerpt |
| M39 | M | 300 mm kart steering wheel, Yahoo Shopping | full |
| M40 | M | FYH UCFL204 flange unit, Askul | excerpt |
| M41 | M | JOIQEXJ 6 inch brake disc, 1 inch bore with 1/4 inch key, Amazon.co.jp | excerpt |
| M42 | M | Go-kart hydraulic brake caliper with disc, Yahoo Shopping | excerpt |
| M43 | M | GREHUA go-kart pedal kit with throttle cable, Amazon.co.jp | excerpt |
| M44 | M | Centrifugal clutch 3/4 inch 10T for chain 40, Trade Journey, Yahoo Shopping | partial |
| M45 | M | KANA finished-bore sprockets No.40, Askul and MonotaRO | excerpt |
| M46 | M | KANA roller chain No.40, 3 m, MonotaRO | excerpt |
| M47 | M | FYH UCP204 pillow block, MonotaRO | excerpt |
| M48 | M | S45CD bright bar 20 mm cut to length, MonotaRO | excerpt |
| M49 | M | Throttle cable with return spring for GX160 and GX200, Yahoo Shopping | partial |
| M50 | M | Kill switch with a tether cord, Amazon.co.jp | excerpt |
| M51 | M | Centrifugal clutch 3/4 inch 10T, STK-shop, Yahoo Shopping | partial |
| M52 | M | GoPowerSports KD1041SHD heavy-duty clutch 3/4 inch 10T | partial |
| M53 | M | Go-kart seat, kabuon, Rakuten | partial |
| M54 | M | Seat slide rail pair amr-199-g, Rakuten | partial |
| M55 | M | Haganeya square tube 25 x 25 x 1.6 cut to length | partial |
| M56 | M | Haganeya flat bar 6 x 32 cut to length | partial |
| M57 | M | Takiron UHMW polyethylene sheet cut to order, MonotaRO | partial |
| M58 | M | TRUSCO punched steel sheet SPCC 1.0 mm 450 x 450, MonotaRO | partial |
| M59 | M | TRUSCO tube cushion TAC-81Y, MonotaRO | partial |
| M60 | M | Kill switch with lanyard, the-apex, Rakuten | partial |
| M61 | M | MonotaRO folding aluminium ladder rail 1820 mm | partial |
| M62 | M | KYU B11S small operator seat with slide rails, Rakuten | partial |
| F1 | F | Motor1, a shifter kart turned into a snowmobile, 2025-02-02 | partial |
<!-- tdr:end -->

## Checks {#checks}

<!-- tdr:table kind=check fields=id,tier,method,result,date -->
| id | tier | method | result | date |
|---|---|---|---|---|
| K-001 | T2 | refute | partial | 2026-11-03 |
| K-002 | T2 | refute | partial | 2026-11-03 |
| K-003 | T2 | refute | partial | 2026-11-03 |
| K-004 | T2 | refute | fail | 2026-11-03 |
| K-005 | T2 | refute | fail | 2026-11-03 |
<!-- tdr:end -->

## Parts {#parts}

<!-- tdr:table kind=part fields=id,name,parent -->
| id | name | parent |
|---|---|---|
| kart | Kart |  |
| chassis | Chassis | kart |
| frame | Welded tube frame | chassis |
| floor | Floor plate | chassis |
| bumpers | Front bumper and side nerf bars | chassis |
| seat | Seat | chassis |
| seat_slide | Seat slide with pin positions | chassis |
| pedal_box | Pedal box with throttle and brake pedals, sliding on pin positions | chassis |
| guards | Chain and axle guards | chassis |
| steering | Steering | kart |
| steering_wheel | Steering wheel | steering |
| steering_column | Steering column with its bearings | steering |
| tie_rods | Tie rods with rod ends | steering |
| spindles | Kingpins, spindles, and steering arms | steering |
| front_wheels | Front wheels and tyres | kart |
| rear_axle | Rear live axle | kart |
| axle_shaft | Axle shaft | rear_axle |
| axle_bearings | Axle bearings | rear_axle |
| rear_hubs | Rear wheel hubs that slide along the axle | rear_axle |
| rear_wheels | Rear wheels and tyres | kart |
| brake | Rear disc brake with its carrier | kart |
| powertrain | Powertrain | kart |
| engine | Engine | powertrain |
| clutch | Centrifugal clutch | powertrain |
| jackshaft | Jackshaft with its bearings and sprockets | powertrain |
| chain_primary | Primary chain from the clutch to the jackshaft | powertrain |
| chain_final | Final chain from the jackshaft to the axle, with the axle sprocket and its carrier | powertrain |
| throttle | Throttle cable with a return spring | powertrain |
| kill_switch | Engine stop switches, one on the steering and one with a tether | powertrain |
| winter | Winter parts | kart |
| skis | Front skis on the spindles | winter |
| snow_chains | Rear tyre chains | winter |
<!-- tdr:end -->

## Interfaces {#interfaces}

<!-- tdr:table kind=interface fields=id,between,carries -->
| id | between | carries |
|---|---|---|
| I-01 | engine, clutch | power |
| I-02 | clutch, chain_primary | power |
| I-03 | chain_primary, jackshaft | power |
| I-04 | jackshaft, chain_final | power |
| I-05 | chain_final, axle_shaft | power |
| I-06 | axle_shaft, rear_hubs | power |
| I-07 | rear_hubs, rear_wheels | power |
| I-08 | brake, axle_shaft | power |
| I-09 | seat, seat_slide | load |
| I-10 | seat_slide, frame | load |
| I-11 | engine, frame | load |
| I-12 | axle_bearings, frame | load |
| I-13 | axle_shaft, axle_bearings | load |
| I-14 | spindles, frame | load |
| I-15 | front_wheels, spindles | load |
| I-16 | jackshaft, frame | load |
| I-17 | pedal_box, frame | load |
| I-18 | pedal_box, throttle | other |
| I-19 | throttle, engine | other |
| I-20 | pedal_box, brake | other |
| I-21 | steering_wheel, steering_column | other |
| I-22 | steering_column, tie_rods | other |
| I-23 | tie_rods, spindles | other |
| I-24 | kill_switch, engine | signal |
| I-25 | skis, spindles | load |
| I-26 | snow_chains, rear_wheels | load |
| I-27 | bumpers, frame | load |
| I-28 | guards, frame | load |
| I-29 | steering_column, frame | load |
<!-- tdr:end -->
