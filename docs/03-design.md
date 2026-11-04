# 1.3 Design calculation

Calculations, one section per item, each with an id that values and checks can cite.

This step designs the straddle kart the owner chose (D-030): ridden astride by riders of 6 and up, leaning into turns, with the engine unit under the seat. The seated kart that stood here before is in the repository's history; its checks K-004 to K-006 and K-009 judged that kart. Where the owner has not yet decided the proposals of [1.2.18](02-form.md#straddle), this step takes them as its working basis: R-12 at kart.tip_ratio_snow_min sideways and law.quad_pitch_ratio_min fore and aft (Q-032), and a protective hoop behind the seat for R-19; the children's speed is left open. The owner chose buggy-size tyres all year with skis inside the front wheels in winter (D-032). A change there comes back to this step.

`python calc/design.py --write` reads every input from the record and writes the calculated values (keys starting with `dsn.`) and `docs/data/design.json`, the geometry that the navigator's drawings and 3D view draw. Axes are x forward, y left, z up, with the origin on the ground under the rear axle centre. Inputs that have no source yet are assumed in Q-017, Q-023, Q-033, and Q-036.

## 1.3.1 Layout {#layout}

- Buggy-size tyres of yr.tyre_dia_mm stay on all year, yr.front_width_mm wide at the front and yr.rear_width_mm at the rear, as on the 50 cc buggies registered as minicars (M90; sizes assumed, Q-036) (D-032).
- The wheelbase lay.wheelbase_mm and the overhangs lay.front_overhang_mm and lay.rear_overhang_mm, with the tyres reaching past the bumper, make the kart dsn.length_m long, inside the Delica's cargo length (R-14), a little longer between the wheels than those buggies so that an adult's toes stay clear of the front tyres at full lock.
- The front and rear tracks are lay.track_front_mm and lay.track_rear_mm, with fenders lay.fender_margin_mm wider than the tyres (R-30), so the kart is dsn.width_m wide, inside the car's tailgate opening. The height to the mirrors or the hoop is dsn.height_m.
- The engine unit lies along the centre line under the seat (lay.unit_y_mm), so the kart is symmetric: the centre of mass lies dsn.cg_side_adult_mm to the side with the adult.

## 1.3.2 Frame {#frame}

- A spine of two main rails (dsn.rail_od_mm by dsn.rail_t_mm STKM11A) at ±lay.spine_half_width_mm under the engine unit, rising behind lay.kick_x_mm to pass over the rear axle with dsn.axle_rail_gap_mm to spare; outriggers to the axle bearings; a front beam to the kingpins at ±lay.kingpin_y_mm; a front bumper; supports for the footboards; a tower for the steering stem's upper bearing; and the protective hoop of 1.3.13. Cross members are dsn.cross_od_mm by dsn.cross_t_mm (M6). Tube lengths are dsn.tube_main_m and dsn.tube_cross_m; the frame weighs dsn.frame_mass_kg with more in plates.
- Strength (R-02): the spine is taken as a beam between the rear axle and the front beam carrying every sprung mass and the rider at their places, times the load factor dsn.load_factor, half on each rail. The largest moment is dsn.frame_moment_nm, which stresses each rail to dsn.rail_stress_mpa, a safety factor of only dsn.rail_safety on the tensile strength dsn.stkm11a_tensile_mpa: the rider sits in the middle of the wheelbase, where a spine of two tubes alone is too weak. The next pass deepens it - upper rails under the seat joined to the spine as a truss, or a larger tube (Q-035).

## 1.3.3 Rear axle {#axle}

- A keyed steel shaft of dsn.axle_dia_mm (S45C, M35) and lay.axle_length_mm in three UCP205 pillow blocks (P32, M34) hung under plates on the outriggers: two at ±lay.bearing_y_mm close to the wheels, and one at lay.bearing_mid_y_mm beside the axle sprocket, which takes the chain's pull. The hubs sit dsn.hub_bearing_gap_mm outside the outer bearings; the kart no longer narrows for the car.
- A bump on each rear wheel with the adult times the load factor, the chain's pull of dsn.axle_chain_pull_n at full torque, and that torque twisting the shaft, combined by von Mises, stress the axle to dsn.axle_stress_mpa, a safety factor of dsn.axle_safety on dsn.s45c_yield_mpa (Q-017). Each outer bearing carries roughly dsn.bearing_load_n at rest (the overhang of the wheel raises it, far below the rating).
- The lowest part is the brake disc, at dsn.low_point_mm above the ground, with the axle sprocket and the bearings a little higher (R-04).

## 1.3.4 Drive {#drive}

- A used 50 cc four-stroke scooter's engine unit (D-022, R-26), with its CVT (eng50.cvt_low to eng50.cvt_high, P43), centrifugal clutch, final reduction su.final_ratio, ECU, fuel pump, and silencer; its size su.length_mm by su.width_mm by su.height_mm and mass su.mass_kg are assumed until the donor is measured (Q-023).
- It lies under the seat as in the scooter, cylinder forward, its output at the rear end lay.unit_out_x_mm ahead of the axle on the left at lay.chain420_y_mm. A chain of size 420 runs from a gear.t_out420 tooth sprocket to a gear.t_axle420 tooth sprocket beside the middle bearing: dsn.chain420_links links at a centre distance of dsn.chain420_centre_mm, closed round the left outrigger with its master link. The unit's front end is at dsn.unit_front_x_mm.
- Overall reduction dsn.ratio_top at the CVT's top ratio gives dsn.top_speed_kmh at the rev limit, within kart.speed_max_kmh (R-01); dsn.ratio at its low ratio.

## 1.3.5 Brake {#brake}

- Two systems as on the scooter (R-21): the right lever works a hydraulic caliper on a disc of lay.disc_dia_mm on the axle at lay.brake_y_mm (M42); the left lever works cable calipers on small discs of lay.front_disc_dia_mm on both front hubs (an allowance, Q-033); a lock on the right lever holds the kart parked.
- To stop from kart.speed_max_kmh within kart.stop_distance_max_m with the adult (R-09) needs dsn.brake_decel_needed. Braking moves load onto the front wheels, so the rear tyres pass only part of it: the rear caliper then clamps dsn.brake_clamp_needed_n and each front caliper dsn.brake_front_clamp_needed_n, with pad friction dsn.pad_mu; both levers are used together. The rear brake alone stops at dsn.brake_rear_alone_decel on pavement. Whether cable calipers on the front give that force is a 1.4 item (Q-033).
- Downhill on the grass slope the straddle kart carries less on its rear wheels than the seated kart did: the rear brake alone decelerates at dsn.brake_downhill_decel_rear, which does not stop it. With the front brakes too, every wheel brakes, giving dsn.brake_downhill_decel and a stop of dsn.brake_downhill_stop_m from top speed. This is why the second system is on the front wheels. That stop is longer than kart.stop_distance_max_m, which R-09 sets on level pavement; slopes are descended at walking pace (OP-02.04).

## 1.3.6 Steering {#steering}

- The donor scooter's handlebar, lay.bar_width_mm wide, at lay.bar_x_mm and lay.bar_z_mm, on a raked stem in two UCFL204 flange units (M40), a drop arm at its foot, and tie rods of M10 rod ends PHS10 (P34, M38) to spindles of 17 mm (M36) on kingpins at ±lay.kingpin_y_mm. A bar handle needs no impact-absorbing steering (P70).
- With a steering lock of lay.steer_max_deg the smallest turning radius is dsn.turn_radius_m.

## 1.3.7 Seat, footrests, and fit {#fit}

- The donor scooter's seat sits on the engine unit, its top lay.seat_height_mm above the ground, from lay.seat_x0_mm to lay.seat_x1_mm and lay.seat_width_mm wide. The adult's hip is at lay.hpoint_x_mm.
- Footboards lie beside the unit at lay.footrest_height_mm, from lay.foot_x0_mm to lay.foot_x1_mm, between lay.foot_y0_mm and lay.foot_y1_mm from the centre line. A child sits further forward at lay.child_hip_x_mm on steps of lay.child_foot_raise_mm bolted on the footboards (R-03, D-030).
- Standing on the steps, the smallest rider's crotch clears the seat by dsn.child_fit_margin_mm more than the rider.child_fit_clear_mm of youth ATV guidance (P69), with the crotch height assumed at rider.child_crotch_ratio of stature (Q-033).

## 1.3.8 Mass {#mass}

- The kart's parts sum to dsn.mass_kg, with the centre of mass at dsn.cg_x_m ahead of the rear axle and dsn.cg_z_m above the ground; `docs/data/design.json` lists each part's mass.
- With the adult the rear wheels carry dsn.rear_share_adult and the centre of mass is at dsn.cg_height_adult_m; with the child, dsn.rear_share_child and dsn.cg_height_child_m.

## 1.3.9 Stability {#stability}

- Half the track at the centre of mass over its height is dsn.tip_ratio_adult with the adult and dsn.tip_ratio_child with the child; the shorter half of the wheelbase over the height is dsn.pitch_ratio_adult and dsn.pitch_ratio_child. The working basis asks kart.tip_ratio_snow_min sideways and law.quad_pitch_ratio_min fore and aft, above Australia's tilt-table minimums for quad bikes with a rider (P66); the owner decides (Q-032).
- The adult's hip was moved forward to lay.hpoint_x_mm to reach the fore-and-aft margin; that takes weight off the rear wheels, which costs the climb (1.3.10) and the rear brake (1.3.5).

## 1.3.10 Climbing {#climb}

- On site.grade_max_pct of long grass (ground.crr_max) with the adult, climbing needs dsn.climb_force_n; the rear tyres pass dsn.climb_grip_n at the assumed grip ground.mu_grass (Q-014), and the engine gives dsn.climb_thrust_n. The steepest grass slope the rear tyres climb is dsn.climb_grade_max_pct, short of the assumed site.grade_max_pct (Q-008). D-021 lets the slope follow what the kart can do; the rider leaning forward uphill, as on a quad, takes still more weight off the rear.

## 1.3.11 Transport {#transport}

- The kart goes into the Delica as it is: dsn.delica_length_margin_mm shorter than the cargo length, dsn.delica_width_margin_mm inside the widest tailgate opening, and dsn.delica_height_margin_mm under the cargo height (R-14, OP-05). Whether it passes the opening at floor height waits for the owner's measurement (Q-015).

## 1.3.12 Winter form {#winter}

The winter form is W6 of [1.2.19](02-form.md#tyres) (D-032): the kart keeps its wheels, skis bolt beside the front wheels, and chains go on the rear tyres as needed. The change of form is OP-04 and back OP-06 (R-28).

- **Skis.** Skis of ski.width_mm by ski.contact_length_mm on the snow bolt to the steering knuckles inside the front tyres, lay.ski_gap_mm clear of them, at dsn.ski_y_mm from the centre line, on brackets that pivot with rubber stops and adjust in height: below the tyre for deep snow, which lifts the front wheels, or a little above it where the ground is firm, so that the tyre rolls and keeps its brake until it sinks. They steer with the wheels, clear of the front brake discs and the tie rods. With the adult they press dsn.winter_ski_pressure_kpa when they carry the front.
- **Chains.** Ladder chains on the rear tyres (P1, S1) for grip on packed snow and ice.
- **Mass and stability.** The winter kart weighs dsn.winter_mass_kg. With the adult its centre of mass is dsn.winter_cg_height_m high and the rear tyres carry dsn.winter_rear_share. With the skis carrying the front their stance is narrower than the front track, and the tipping ratio is dsn.winter_tip_ratio against kart.tip_ratio_snow_min (R-12, D-025); fore and aft it is dsn.winter_pitch_ratio, since nothing is lifted. How the tyres and skis do in fresh snow is in 1.2.19.
- **Sled pan.** A UHMW polyethylene plate hull.bottom_t_mm thick under the spine, dsn.belly_height_mm above the ground, with a bow in three panels rising lay.bow_rise_mm under the front frame, clear of the tie rods, the front beam, and the horn; it weighs dsn.pan_mass_kg and keeps the spine from ploughing when the tyres sink.
- **Future water version (D-027).** Not required. The 3D view shows it as an option: side floats of lay.float_dia_mm on arms outside the wheels, and an electric outboard with its battery at the stern. 1.2.15 holds its basis.

## 1.3.13 Protective hoop and road equipment {#rollbar}

- A hoop of dsn.rail_od_mm tube behind the seat at lay.hoop_x_mm, braced to the rear of the spine, rising to lay.rollbar_top_mm, meant to hold the kart off a rider it lands on, as the protection devices that Australia requires on quad bikes do (P66, P68); dsn.tube_roll_m of tube. A straddled seat needs no seat belt, head restraint, or 1 m marker (P70).
- The road equipment of R-20, R-21, and R-23 comes from the donor scooter where it can: the head lamp and speedometer on the handlebar, mirrors on the bar ends, front turn signals by the bumper, the tail and stop lamp, rear turn signals, reflector, and number plate with its lamp at the rear, the horn at the front, and the battery behind the seat over the axle. Fenders cover the tyres (R-30); their mass dsn.fender_mass_kg and the road kit's dsn.road_kit_mass_kg are assumed (Q-033, Q-023).

## 1.3.14 Guards and stopping {#safety}

- R-10: the donor's throttle grip springs back when released; a stop switch on the handlebar and a tether switch clipped to the rider (M50) are wired to the engine's stop circuit.
- R-11: a steel guard covers the chain from the rider's side between the outrigger and the output sprocket, where the rider's leg is; the axle sprocket below the outrigger and the turning axle are to be covered in the next pass (P17, P19).
- R-13: the footboards and the front bumper keep the rider's feet inside the kart; riders wear the gear of R-31.

## 1.3.15 Where the engine sits {#engine-position}

- Under the seat along the centre line, as in the scooter it comes from (D-030). Beside the seat it made the seated kart wide; under the seat the kart is as narrow as its track allows and still fits the car's length. The centrifugal clutch stays, since the engine must idle while the kart stands and the clutch lets go when the throttle is released (R-10).

## 1.3.16 Layout issues still open {#issues}

- The straddle kart is placed by hand and has had no collision search; an independent helper checks this layout (K-013) and the next pass builds a collision search into `calc/design.py` for the summer and winter forms (Q-035).
- The spine alone is too weak for the rider (dsn.rail_safety, 1.3.2); the grass slope it climbs is less than assumed (1.3.10); the front brakes, fenders, buggy tyres, ski brackets, and the axle sprocket are allowances until quoted (Q-033, Q-036).
- The rider's thighs pass round the engine unit, which is wider than the seat; the adult's knees bend well, about as on a youth quad. Both are to be tried on the built kart.
