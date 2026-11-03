# 1.3 Design calculation

Calculations, one section per item, each with an id that values and checks can cite.

The working basis is the proposal of [1.2.12](02-form.md#proposal): an off-road kart (L2) on a welded steel frame (F1) with a GX200-class engine and a centrifugal clutch (E1), new parts readily available in Japan (D-017), skis and chains first (W1), and a rear track that narrows for the car (T1). The owner has not yet decided the other items of 1.2.12; a change there comes back to this step.

`python calc/design.py --write` reads every input from the record and writes the calculated values (keys starting with `dsn.`) and `docs/data/design.json`, the geometry that the navigator's drawings and 3D view draw. Axes are x forward, y left, z up, with the origin on the ground under the rear axle centre. Inputs that have no source yet are assumed in Q-017, which blocks the gate from design to build.

## 1.3.1 Layout {#layout}

- The wheelbase lay.wheelbase_mm is within the racing kart range of P10 and keeps the overall length dsn.length_m inside the Delica's cargo length (R-14), with the front overhang lay.front_overhang_mm for the bumper and the rear overhang lay.rear_overhang_mm behind the rear tyres.
- The tracks lay.track_front_mm and lay.track_rear_mm are chosen so that the kart slides before it tips with the adult (1.3.9); the overall width is dsn.width_m.
- The rails' underside is at lay.rail_bottom_mm above the ground, the floor of 1.2 (kart.clearance_rough_mm). The height to the top of the steering wheel or the seat back is dsn.height_m.
- The engine sits to the right of the seat, ahead of the rear axle, as on a racing kart; behind the axle it would make the kart too long for the car.

## 1.3.2 Frame {#frame}

- A ladder of two main rails (dsn.rail_od_mm by dsn.rail_t_mm STKM11A, M7) at ±lay.rail_half_width_mm, widening at the front to the spindle brackets at ±lay.front_half_width_mm, with cross members, a seat-back hoop, a front bumper, and side nerf bars of dsn.cross_od_mm by dsn.cross_t_mm (M6). Tube lengths are dsn.tube_main_m and dsn.tube_cross_m; the frame weighs dsn.frame_mass_kg.
- A floor plate of dsn.floor_t_mm closes the area under the driver.
- Strength (R-02): the heaviest rider times the load factor dsn.load_factor, on two rails over the span from the seat cross members to the axle cross member, bends each rail to dsn.rail_stress_mpa, a safety factor of dsn.rail_safety on the tensile strength dsn.stkm11a_tensile_mpa. Both the load factor and the strength wait for a source (Q-017).

## 1.3.3 Rear axle {#axle}

- A keyed steel shaft of dsn.axle_dia_mm (S45C, M35) and lay.axle_length_mm, in two UCP205 pillow blocks (P32, M34) at ±lay.bearing_y_mm, hung under the rails on plates. The bearings sit outboard, close to the wheels, because the bending at the bearing grows with the overhang of the wheel.
- With the adult and the load factor, the axle is bent at the bearing to dsn.axle_stress_mpa, a safety factor of dsn.axle_safety on the yield strength dsn.s45c_yield_mpa (Q-017). Each bearing carries about dsn.bearing_load_n at rest, far below its rating brg.ucp205_cr_kn.
- The lowest parts are the bearing plates, the brake disc, and the axle sprocket, at dsn.low_point_mm above the ground; on grass and gravel this is a 1.2 limit (R-04) to be checked on the owner's land.
- The rear hubs are keyed to the shaft and located by a cross pin through holes drilled at the driving and the transport positions, so that the track changes without tools (1.3.10).

## 1.3.4 Drive {#drive}

- Two chain stages of size 40 (P31, M45, M46): the clutch's gear.t_clutch teeth to gear.t_jack_in on a jackshaft, and gear.t_jack_out on the jackshaft to gear.t_axle on the axle, a reduction of dsn.ratio. At the governed no-load speed engine.speed_noload_rpm (Q-011) on the tyres' whl.tyre_od_mm, the top speed is dsn.top_speed_kmh, within kart.speed_max_kmh (R-01).
- The jackshaft (20 mm, M48) turns in two UCP204 blocks (P33, M47) at lay.jack_x_mm, lay.jack_z_mm. The chains run at lay.chain1_y_mm and lay.chain2_y_mm from the centre line, between the seat and the engine. Their centre distances are dsn.chain1_centre_mm and dsn.chain2_centre_mm, their lengths dsn.chain1_links and dsn.chain2_links links, and the gaps between the sprockets dsn.chain1_gap_mm and dsn.chain2_gap_mm.
- The engine: a GX200-class engine with a 3/4 inch output shaft (Q-type), because every 10 tooth clutch for chain 40 sold in Japan has a 3/4 inch bore (M44, M51), and the S-type 20 mm shaft would not take a 10 tooth sprocket (P31). Its envelope, mass, and base pattern are those of the Honda GX200 drawing (P30); a clone of the same class is expected to match, and its base holes are measured when it arrives.
- A 36 tooth sprocket with a finished 25 mm bore was not found priced; a pilot-bore one (M45) is bored and keyed by a machine shop (1.4).

## 1.3.5 Brake {#brake}

- A disc of lay.disc_dia_mm on the axle at lay.brake_y_mm with a caliper on the frame. To stop from kart.speed_max_kmh within kart.stop_distance_max_m with the adult (R-09) needs dsn.brake_decel_needed, an axle torque of dsn.brake_torque_needed_nm, and a clamp force of dsn.brake_clamp_needed_n with pad friction dsn.pad_mu (Q-017). That clamp force favours the hydraulic kit (M42) over a cable caliper; 1.4 confirms what the chosen caliper gives.

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

- Taking the half track at the centre of mass between the rear and the front track, the ratio of half track to centre height is dsn.tip_ratio_adult with the adult and dsn.tip_ratio_child with the child, against kart.tip_ratio_min (R-12, on level ground; slopes are driven straight, OP-02.04).

## 1.3.10 Climbing {#climb}

- On site.grade_max_pct of long grass (ground.crr_max) with the adult, climbing needs dsn.climb_force_n. With the load moving rearward on the slope the rear tyres can pass dsn.climb_grip_n at the assumed grip ground.mu_grass (Q-014), and the engine gives dsn.climb_thrust_n. The engine ahead of the axle puts more weight on the rear wheels than 1.2 assumed, which turns the grass slope from a likely fail in 1.2 into a narrow pass; the grip value is still to be measured.

## 1.3.11 Transport {#transport}

- The rear hubs slide in to lay.track_rear_narrow_mm on their pins, which makes the kart dsn.width_transport_m wide, dsn.delica_width_margin_mm inside the widest tailgate opening, and dsn.delica_length_margin_mm shorter than the cargo length (R-14, OP-05). Whether it passes the opening at the height of the floor waits for the owner's measurement (Q-015).

## 1.3.12 Winter {#winter}

- Skis of ski.width_mm by ski.contact_length_mm on the ground bolt onto the spindles in place of the front wheels (OP-04), and chains go on the rear tyres (W1). Their making and fitting are 1.4 items.

## 1.3.13 Guards and stopping {#safety}

- R-10: a throttle pedal with its own return spring and a throttle cable with the engine's return spring (M43, M49); a stop switch on the steering and a tether switch clipped to the driver (M50), both wired to the engine's stop circuit.
- R-11: a steel guard covers both chains and the clutch from the seat side and above, and the turning axle between the seat and the bearings is covered (P17, P19).
- R-13: the front bumper and the side nerf bars keep the driver's feet and legs inside the frame.
