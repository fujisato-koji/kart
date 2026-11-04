# 1.3 Design calculation

Calculations, one section per item, each with an id that values and checks can cite.

The working basis is the proposal of [1.2.12](02-form.md#proposal): an off-road kart (L2) on a welded steel frame (F1) with a GX200-class engine and a centrifugal clutch (E1), new parts readily available in Japan (D-017), skis and chains first (W1), and a rear track that narrows for the car (T1). The owner has not yet decided the other items of 1.2.12; a change there comes back to this step.

`python calc/design.py --write` reads every input from the record and writes the calculated values (keys starting with `dsn.`) and `docs/data/design.json`, the geometry that the navigator's drawings and 3D view draw. Axes are x forward, y left, z up, with the origin on the ground under the rear axle centre. Inputs that have no source yet are assumed in Q-017, which blocks the gate from design to build.

## 1.3.1 Layout {#layout}

- The wheelbase lay.wheelbase_mm is within the racing kart range of P10 and keeps the overall length dsn.length_m inside the Delica's cargo length (R-14), with the front overhang lay.front_overhang_mm for the bumper and the rear overhang lay.rear_overhang_mm behind the rear tyres.
- The tracks lay.track_front_mm and lay.track_rear_mm are chosen so that the kart slides before it tips with the adult (1.3.9); the overall width is dsn.width_m.
- The rails' underside is at lay.rail_bottom_mm above the ground, the floor of 1.2 (kart.clearance_rough_mm). The height to the top of the steering wheel or the seat back is dsn.height_m.
- The engine sits beside the seat on the left (y is positive to the left), ahead of the rear axle, as on a racing kart; behind the axle it would make the kart too long for the car. The seat sits right of the centre line (lay.hpoint_y_mm), so that the adult and the engine balance; the centre of mass lies dsn.cg_side_adult_mm to the side with the adult and dsn.cg_side_child_mm with the child.

## 1.3.2 Frame {#frame}

- A ladder of two main rails (dsn.rail_od_mm by dsn.rail_t_mm STKM11A) at ±lay.rail_half_width_mm, low under the driver and rising behind lay.kick_x_mm to pass over the rear axle with dsn.axle_rail_gap_mm to spare, widening at the front to the spindle brackets at ±lay.front_half_width_mm, with cross members, outriggers to the outer axle bearings, a roll bar, a front bumper, side nerf bars (the left one only ahead of the engine unit), and a support under the steering column, all of dsn.cross_od_mm by dsn.cross_t_mm (M6), and the roll bar of 1.3.13. Tube lengths are dsn.tube_main_m and dsn.tube_cross_m; the frame with its plates weighs dsn.frame_mass_kg and more.
- The floor plate covers the driver's side only, clear of the drive on the left.
- A floor plate of dsn.floor_t_mm closes the area under the driver.
- Strength (R-02): the rails are taken as a beam between the rear axle and the kingpins carrying every sprung mass and the rider at their places, times the load factor dsn.load_factor, half on each rail, leaving out the cross members, the floor, and the nerf bars that share the load. The largest moment is dsn.frame_moment_nm, which stresses each rail to dsn.rail_stress_mpa, a safety factor of dsn.rail_safety on the tensile strength dsn.stkm11a_tensile_mpa (JIS gives STKM11A no yield point). The thicker wall of dsn.rail_t_mm was chosen for this (K-004). The load factor and the strength wait for a source (Q-017), and a static load test of the built frame confirms R-02.

## 1.3.3 Rear axle {#axle}

- A keyed steel shaft of dsn.axle_dia_mm (S45C, M35) and lay.axle_length_mm, in three UCP205 pillow blocks (P32, M34) hung upside down under plates: two outboard at ±lay.bearing_y_mm on outriggers, close to the wheels, because the bending at the bearing grows with the overhang of the wheel; and one at lay.bearing_mid_y_mm beside the axle sprocket, which takes the chain's pull.
- Load cases: a bump on each rear wheel with the adult times the load factor bends the axle at the outer bearing; the final chain pulls dsn.axle_chain_pull_n at full engine torque on its sprocket next to the middle bearing. Combined, the axle is stressed to dsn.axle_stress_mpa, a safety factor of dsn.axle_safety on the yield strength dsn.s45c_yield_mpa (Q-017); the keyway and the pin holes raise the stress locally, and the axle turns, so fatigue is checked in the build step. Each outer bearing carries about dsn.bearing_load_n at rest, far below its rating brg.ucp205_cr_kn.
- The lowest parts are the bearing plates, the brake disc, and the axle sprocket, at dsn.low_point_mm above the ground; on grass and gravel this is a 1.2 limit (R-04) to be checked on the owner's land.
- The rear hubs are keyed to the shaft and located by a cross pin through holes drilled at the driving and the transport positions, so that the track changes without tools (1.3.11); at the transport position the rims clear the outer bearings by dsn.hub_bearing_gap_mm.

## 1.3.4 Drive {#drive}

- Since the kart is to be road-going (D-019, D-022), the engine is a used 50 cc four-stroke scooter's engine unit, within law.minicar_cc_max (R-26): the engine, its CVT (eng50.cvt_low to eng50.cvt_high, P43), its centrifugal clutch, and its final reduction su.final_ratio in one unit, with the ECU, fuel pump, and approved silencer that came with it. Its size su.length_mm by su.width_mm by su.height_mm, mass su.mass_kg, final reduction, and rev limit su.rev_limit_rpm are assumed until the donor is measured (Q-023).
- The unit sits beside the seat on the left at lay.unit_y_mm, its output at the rear end (lay.unit_out_x_mm ahead of the axle) pointing toward the seat. One chain of size 420 runs from a gear.t_out420 tooth sprocket on the output to a gear.t_axle420 tooth sprocket on the axle at lay.chain420_y_mm, beside the middle axle bearing: dsn.chain420_links links at a centre distance of dsn.chain420_centre_mm, tensioned by slotted holes under the unit's plate. The unit's front end is at dsn.unit_front_x_mm.
- Overall reduction from the crank: dsn.ratio_top at the CVT's top ratio, which gives dsn.top_speed_kmh at the rev limit, within kart.speed_max_kmh (R-01); dsn.ratio at its low ratio. The top speed is held by the rev limit, since a scooter has no governor (Q-023 sets the sprockets when the limit is measured).
- The clutch, the reduction, and the speed change are inside the unit, so the separate clutch, the jackshaft with its bearings, and the second chain of the first design are gone, and with them most of the crowding of Q-020.

## 1.3.5 Brake {#brake}

- A disc of lay.disc_dia_mm on the axle at lay.brake_y_mm with a caliper on the frame. To stop from kart.speed_max_kmh within kart.stop_distance_max_m with the adult (R-09) needs dsn.brake_decel_needed, an axle torque of dsn.brake_torque_needed_nm, and a clamp force of dsn.brake_clamp_needed_n with pad friction dsn.pad_mu (Q-017). That clamp force favours the hydraulic kit (M42) over a cable caliper; 1.4 confirms what the chosen caliper gives.
- Downhill on the grass slope the load moves forward off the braked rear wheels; at the assumed grip ground.mu_grass the kart then decelerates at only dsn.brake_downhill_decel and needs dsn.brake_downhill_stop_m to stop from top speed (K-004). The operating rule is to descend slopes straight at walking pace (OP-02.04).

## 1.3.6 Steering {#steering}

- Bought spindles of 17 mm (M36) on kingpins in brackets welded to the front of the frame, front hubs with three studs (M37), tie rods of M10 rod ends PHS10 (P34, M38) from a drop arm at the bottom of the column, and a 300 mm steering wheel (M39) at lay.wheel_x_mm, lay.wheel_z_mm, the column in a UCFL204 flange unit (M40).
- With a steering lock of lay.steer_max_deg the smallest turning radius is dsn.turn_radius_m.

## 1.3.7 Seat, pedals, and fit {#fit}

- The hip point of the adult is at lay.hpoint_x_mm, just ahead of the rear axle as on a kart, at lay.hpoint_y_mm. The seat slides lay.seat_slide_mm forward for the child on pin positions; the pedal box slides on two floor rails from lay.pedal_x_far_mm (adult) to lay.pedal_x_near_mm (child) on pins, without tools (R-03).
- The legs reach the pedals with dsn.leg_margin_adult_mm to spare for the adult of rider.stature_max_cm and dsn.leg_margin_child_mm for the 5-year-old of rider.stature_min_cm, taking the leg (buttock to heel) as dsn.buttock_heel_ratio_adult and dsn.buttock_heel_ratio_child of stature (Q-017). A positive margin means the knees stay bent; a cushion takes up a large margin.

## 1.3.8 Mass {#mass}

- The kart's parts sum to dsn.mass_kg, with the centre of mass at dsn.cg_x_m ahead of the rear axle and dsn.cg_z_m above the ground. Part masses come from the makers' data (engine P30, bearings P32 and P33, sprockets P31) or are assumed (Q-017); `docs/data/design.json` lists each.
- With the adult the rear wheels carry dsn.rear_share_adult and the centre of mass is at dsn.cg_height_adult_m; with the child, dsn.rear_share_child and dsn.cg_height_child_m. These replace the rough 1.2 values (kart.rear_share, kart.cg_height_rough_m) for the design.

## 1.3.9 Stability {#stability}

- Taking the half track at the centre of mass between the rear and the front track, less the sideways offset of the centre of mass, the ratio of half track to centre height is dsn.tip_ratio_adult with the adult and dsn.tip_ratio_child with the child, against kart.tip_ratio_min (R-12, on level ground; slopes are driven straight, OP-02.04).

## 1.3.10 Climbing {#climb}

- On site.grade_max_pct of long grass (ground.crr_max) with the adult, climbing needs dsn.climb_force_n. With the load moving rearward on the slope the rear tyres can pass dsn.climb_grip_n at the assumed grip ground.mu_grass (Q-014), and the engine gives dsn.climb_thrust_n. The engine ahead of the axle puts more weight on the rear wheels than 1.2 assumed, which turns the grass slope from a likely fail in 1.2 into a narrow pass; the grip value is still to be measured.

## 1.3.11 Transport {#transport}

- The rear hubs slide in to lay.track_rear_narrow_mm on their pins. The axle's ends then stick out past the tyres, so the kart is dsn.width_transport_m wide, set by the axle, dsn.delica_width_margin_mm inside the widest tailgate opening, and dsn.delica_length_margin_mm shorter than the cargo length (R-14, OP-05). Whether it passes the opening at the height of the floor waits for the owner's measurement (Q-015).

## 1.3.12 Winter form {#winter}

The owner chose the snowmobile form on the summer engine (D-025). The change of form is OP-04 and back OP-06, with the kart on four stands at the winter height (R-28).

- **Track unit.** The rear axle with its wheels, hubs, sprocket, and brake disc comes off. A donor snowmobile's track unit takes its place - a track sm.track_width_mm wide touching the snow over sm.track_contact_mm (P51), centred under the summer axle (sm.track_x_mm). It is one self-contained unit, as the electric track unit MTT (F3) and the motor tugs (M81) are, and comes on and off whole: two side plates beside the track carry the skid's cross shafts inside the loop and the drive shaft's bearings, sm.drive_ahead_mm ahead of the slide rails at a height of sm.drive_z_mm; at the back a pivot shaft of the axle's size through the three pillow blocks holds them, and at the front they bolt through spacers to the cross members at lay.kick_x_mm and 0.55 m. The track's thickness, idler, drive height, and mounts are assumed until the donor is measured (Q-029).
- **Lift.** The loop's top over the drive sprocket and a gap of lay.tunnel_gap_mm under the floor set the winter lift, dsn.winter_lift_mm: the chassis rides that much higher than in summer, and the skis (ski.width_mm by ski.contact_length_mm on the snow) stand on stanchions as tall, bolted to the spindles in place of the front wheels.
- **Drive.** The summer 30T sprocket goes onto the drive shaft, and a chain of dsn.winter_chain_links links (centres dsn.winter_chain_centre_mm) runs to it from the engine unit's output, beside the track; it crosses the frame's level between two cross members, and a guard stands between it and the driver. With a drive sprocket of sm.drive_dia_mm the clutch locks at dsn.winter_clutch_lock_kmh and the top speed is dsn.winter_top_speed_kmh.
- **Brake.** The summer disc with both calipers moves to the drive shaft, outside the right side plate, opposite the chain, so the foot brake and the hand brake act on the track.
- **Mass, loads, and tipping.** The winter kart weighs dsn.winter_mass_kg. With the adult its centre of mass is dsn.winter_cg_height_m high; the track carries dsn.winter_rear_share and presses dsn.winter_track_pressure_kpa, and the skis press dsn.winter_ski_pressure_kpa. On its three supports the tipping ratio is dsn.winter_tip_ratio, above kart.tip_ratio_snow_min (R-12, D-025).
- **Sled pan.** Kept in both forms, of UHMW polyethylene: two bottom strips hull.bottom_t_mm thick either side of the track's tunnel, hull.bottom_clear_mm above the ground in summer; a box on the right between the nerf bar's stays; and a bow in three panels rising lay.bow_rise_mm under the front frame, clear of the tie rods, the front cross member, and the horn. It weighs dsn.pan_mass_kg. In winter its bottom is dsn.belly_height_mm above the snow, so it meets the snow only when the track has sunk that far; then the strips and the bow, with the track between them, spread the whole weight over dsn.belly_area_m2 at dsn.belly_pressure_kpa, below a person on snowshoes (S4).
- **Foam (R-29).** The pan holds dsn.foam_fit_m3 of extruded polystyrene, which floats dsn.foam_reserve_ratio of the winter kart's weight; floating it at water.reserve_ratio needs dsn.foam_needed_m3, room the kart does not have without large floats. The owner decides (Q-030).
- **Size.** The winter form is dsn.winter_length_m long and dsn.winter_height_m high. It does not go into the Delica, which carries the kart in its summer form with the winter parts beside it.
- **Order of work.** The snowshoe test (Q-012) comes before the donor is bought; then the donor is measured (Q-029) and the mounts, stanchions, chain, and pan are made.
- **Future water version (D-027).** Not required. The 3D view shows it as an option: side floats of lay.float_dia_mm on arms outside the wheels, and an electric outboard with its battery at the stern. 1.2.15 holds its basis.

## 1.3.13 Roll bar and road equipment {#rollbar}

- The law asks for a seat belt on this kart (R-22), so a belted driver must be protected if it rolls (R-19): the seat-back hoop becomes a roll bar of dsn.rail_od_mm tube, braced to the rear rails, rising to lay.rollbar_top_mm, which is also the marker of at least law.marker_height_mm that R-24 asks for. The kart's height is then dsn.height_m, inside the Delica's cargo height.
- The road equipment of R-20 to R-23 is placed on the frame: the head lamp and front turn signals on the bumper, the tail and stop lamp, rear turn signals, reflector, and number plate with its lamp on the rear cross member, mirrors on the roll bar, the speedometer on the column, the horn at the front, the battery beside the seat, a hand brake lever with its own caliper on the rear disc (the second brake system and the parking brake, R-21), the seat belt anchored to the frame, and a head restraint on the roll bar. Their prices are allowances until quoted (Q-018); their masses are assumed together (dsn.road_kit_mass_kg, Q-023).

## 1.3.14 Guards and stopping {#safety}

- R-10: a throttle pedal with its own return spring and a throttle cable with the engine's return spring (M43, M49); a stop switch on the steering and a tether switch clipped to the driver (M50), both wired to the engine's stop circuit.
- R-11: a steel guard covers the drive chain and its sprockets from the seat side and above, and the turning axle between the seat and the bearings is covered (P17, P19).
- R-13: the front bumper and the side nerf bars keep the driver's feet and legs inside the frame.

## 1.3.15 Where the engine sits {#engine-position}

The owner asked whether the engine's place is the best (2026-11-04). `calc/design.py` was run with the engine moved forward beside the seat, and the length was worked out for an engine behind the rear axle:

- **Forward beside the seat:** the rear wheels carry less of the weight, so the grip margin on the grass slope (1.3.10) shrinks and the downhill stop with rear brakes (1.3.5) grows; the frame is stressed a little less and the primary chain gets longer. Nothing else improves.
- **Behind the rear axle (buggy layout):** the engine's width across the crank lies along the kart behind the axle and makes the kart too long for the Delica (R-14); the rear grip and the downhill stop would improve.
- **Where it is, beside the seat near the axle:** the most weight on the rear wheels that still fits the car. It stays.

The crowding of Q-020 comes from the drive, not from the engine's place: two chain stages through a jackshaft, with the jackshaft's bearings and a third axle bearing, all between the seat and the left rail. The next pass looks first at an engine with a built-in reduction gear and centrifugal clutch, which would remove the jackshaft and one chain, and otherwise at wider rails or the chains outboard of the rail.

On the clutch: an engine needs one, because it must idle while the kart stands, and the recoil starter cannot turn the wheels; a centrifugal clutch also lets go when the throttle is released, which is how R-10 cuts the drive. Only an electric drive would need none.

## 1.3.16 Layout issues still open {#issues}

Two independent checks searched `docs/data/design.json` for parts that collide (K-004, K-005). The first pass placed the rear axle through the main rails and the seat on the drive; the second pass cleared those, but the space between the seat and the left rail still cannot hold both chains, the jackshaft and its bearings, the middle axle bearing, and the guard, the column support and the pedal box rails cross other members and the adult's shins, the steering arms touch the front rails, and several plates are joined to nothing. The next design pass resolves Q-020 before any number of this step is used for building; the 3D view and the drawings show the present layout as it is, including these faults.

The road-going layout of D-022 was checked by another independent helper (K-006) and is not yet buildable either; its faults are listed in Q-025, and the next pass builds the collision search into `calc/design.py` so that every change is checked as it is made.

The winter form of 1.3.12 was placed by hand against the frame members it comes near - the tie rods, the front cross member, the horn, and the right nerf bar's stays - and, like the summer form, has not had a collision search; the next pass builds that search into `calc/design.py` for both forms.
