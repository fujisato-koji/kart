# 1.3 Design calculation

Calculations, one section per item, each with an id that values and checks can cite.

This step designs the straddle kart the owner chose (D-030): ridden astride by riders of 6 and up, leaning into turns, with the engine unit under the seat. The seated kart that stood here before is in the repository's history; its checks K-004 to K-006 and K-009 judged that kart. Where the owner has not yet decided the proposals of [1.2.18](02-form.md#straddle), this step takes them as its working basis: R-12 at kart.tip_ratio_snow_min sideways and law.quad_pitch_ratio_min fore and aft (Q-032), and a protective hoop behind the seat for R-19; the children's speed is left open. The owner chose buggy-size tyres all year with skis inside the front wheels in winter (D-032), springs at the rear (D-036), and a frame made low, small, and cheaper where its shape allows (D-037). A change there comes back to this step.

`python calc/design.py --write` reads every input from the record and writes the calculated values (keys starting with `dsn.`) and `docs/data/design.json`, the geometry that the navigator's drawings and 3D view draw. It solves the frame as a space frame of tubes (`calc/frame.py`) and searches the geometry for interferences (`calc/clash.py`). Axes are x forward, y left, z up, with the origin on the ground under the rear axle centre. Inputs that have no source yet are assumed in Q-017, Q-023, Q-033, Q-036, and Q-039.

## 1.3.1 Layout {#layout}

- Buggy-size tyres of yr.tyre_dia_mm stay on all year, yr.front_width_mm wide at the front and yr.rear_width_mm at the rear, as on the 50 cc buggies registered as minicars (M90; sizes assumed, Q-036) (D-032).
- The wheelbase lay.wheelbase_mm and the overhangs lay.front_overhang_mm and lay.rear_overhang_mm, with the tyres reaching past both ends, make the kart dsn.length_m long, inside the Delica's cargo length (R-14). The wheelbase stays a little longer than those buggies' so that the riders' toes clear the front tyres at full lock (1.3.16).
- The front and rear tracks are lay.track_front_mm and lay.track_rear_mm, with fenders lay.fender_margin_mm wider than the tyres (R-30), so the kart is dsn.width_m wide, inside the car's tailgate opening. The height to the mirrors or the hoop is dsn.height_m.
- The engine unit lies along the centre line under the seat (lay.unit_y_mm), so the kart is symmetric: the centre of mass lies dsn.cg_side_adult_mm to the side with the adult.
- **Low and small (D-037).** The spine rails run lay.rail_bottom_mm above the ground, just over the sled pan, and the engine unit sits on rubber mounts on its plate on them. That brings the seat down to lay.seat_height_mm and the centre of mass with it (1.3.8), and with the lower centre of mass the track, the hoop, and the handlebar come down and in and still keep the stability of 1.3.9.

## 1.3.2 Frame {#frame}

- **Tubes.** The frame is of two tube sizes, dsn.rail_od_mm by dsn.rail_t_mm and dsn.cross_od_mm by dsn.cross_t_mm STKM11A (M6), so that the steel comes in two kinds; the bearing outriggers and the kick of the spine over the axle are gone. It has:
    - two spine rails at ±lay.spine_half_width_mm under the engine unit, from the swing arm's pivot at lay.pivot_x_mm to the front beam;
    - the front beam rising to the kingpin bosses at ±lay.kingpin_y_mm, braced to the rails, with the bumper ahead and the stem's lower bearing on the bosses;
    - a tower from the rails to the stem's upper bearing;
    - three cross tubes and an outer tube either side under each footboard;
    - behind the unit, posts at ±lay.post_y_mm rising from the rails' ends through the pivot tube to two upper rails under the seat's rear;
    - struts from the posts to a cross tube on the shock's axis just beyond its upper eye, so each side closes into a triangle and the shock's load closes within it; the struts cross the upper rails at a joint;
    - the protective hoop of 1.3.13 on the upper rails.
- **Lengths and mass.** dsn.tube_main_m of the larger tube and dsn.tube_cross_m of the smaller go into the frame, dsn.tube_roll_m into the hoop, and dsn.tube_arm_m into the swing arm of 1.3.17. The frame weighs dsn.frame_mass_kg, with more in plates.
- **Strength (R-02).** The tubes are solved as a space frame (`calc/frame.py`): each tube a beam, the swing arm pinned on the pivot tube and held by the shock taken as a rigid link, the kart standing on its kingpins and the arm's bearings. Every sprung mass goes to the frame nodes nearest it. The three cases are:
    - the seated adult in a bump, 80 % on the seat and 20 % on the footboards, times dsn.load_factor;
    - the adult standing on the footboards, as quad riders do over rough ground, times dsn.load_factor;
    - the right front wheel off the ground, times dsn.load_factor_twist.
- **Result.** The largest stress, by von Mises with bending, axial force, and torsion, is dsn.rail_stress_mpa, with the adult standing, in the spine between the footboards' supports. That is a safety factor of dsn.rail_safety on the tensile strength dsn.stkm11a_tensile_mpa, against the dsn.frame_safety_min taken so that the tubes stay below yield (STKM11A has no stated yield; Q-017). The frame sags dsn.frame_deflection_mm in the seated bump.

## 1.3.3 Rear axle {#axle}

- A keyed steel shaft of dsn.axle_dia_mm (S45C, M35) and lay.axle_length_mm in two UCP206 pillow blocks (M101; sizes assumed, Q-039) hung under plates on the swing arm's sides at ±lay.bearing_y_mm. The axle sprocket sits just outside the left bearing, where it takes the chain's pull, and the brake disc outside the right one at lay.brake_y_mm. The hubs sit dsn.hub_bearing_gap_mm outside the bearings. A middle bearing is no longer needed.
- A bump on each rear wheel with the adult times the load factor, the chain's pull of dsn.axle_chain_pull_n at full torque, and that torque twisting the shaft, combined by von Mises, stress the axle to dsn.axle_stress_mpa, a safety factor of dsn.axle_safety on dsn.s45c_yield_mpa (Q-017). The bearings sit further in than before to clear the tyres, so the wheels overhang more and the shaft is larger. Each bearing carries roughly dsn.bearing_load_n at rest, far below its rating.
- The lowest part of the kart is the sled pan at dsn.belly_height_mm; of the axle's parts the lowest is at dsn.low_point_mm above the ground (R-04).

## 1.3.4 Drive {#drive}

- A used 50 cc four-stroke scooter's engine unit (D-022, R-26), with its CVT (eng50.cvt_low to eng50.cvt_high, P43), centrifugal clutch, final reduction su.final_ratio, ECU, fuel pump, and silencer; its size su.length_mm by su.width_mm by su.height_mm and mass su.mass_kg are assumed until the donor is measured (Q-023).
- It lies under the seat as in the scooter, cylinder forward, its output at the rear end lay.unit_out_x_mm ahead of the axle on the left at lay.chain420_y_mm. A chain of size 420 runs from a gear.t_out420 tooth sprocket to a gear.t_axle420 tooth sprocket beside the left bearing: dsn.chain420_links links at a centre distance of dsn.chain420_centre_mm, which changes by dsn.chain_centre_change_mm over the suspension's travel (1.3.17), so the chain needs no tensioner. The unit's front end is at dsn.unit_front_x_mm.
- Overall reduction dsn.ratio_top at the CVT's top ratio gives dsn.top_speed_kmh at the rev limit, within kart.speed_max_kmh (R-01); dsn.ratio at its low ratio.

## 1.3.5 Brake {#brake}

- Two systems as on the scooter (R-21): the right lever works a hydraulic caliper on a disc of lay.disc_dia_mm on the axle at lay.brake_y_mm (M42); the left lever works, through a cable splitter, drum brakes of about lay.front_drum_dia_mm in the ATV front hubs (M93; Q-037); a lock on the right lever holds the kart parked.
- To stop from kart.speed_max_kmh within kart.stop_distance_max_m with the adult (R-09) needs dsn.brake_decel_needed. Braking moves load onto the front wheels, so the rear tyres pass only part of it: the rear caliper then clamps dsn.brake_clamp_needed_n, with pad friction dsn.pad_mu, and each front drum brakes its wheel with dsn.brake_front_torque_needed_nm; both levers are used together. The rear brake alone stops at dsn.brake_rear_alone_decel on pavement. Whether the front drums give that torque is a 1.4 item (Q-037); on ATVs of this size they are the front brakes (M97).
- Downhill on the grass slope the straddle kart carries less on its rear wheels than the seated kart did: the rear brake alone decelerates at dsn.brake_downhill_decel_rear, which does not stop it. With the front brakes too, every wheel brakes, giving dsn.brake_downhill_decel and a stop of dsn.brake_downhill_stop_m from top speed. This is why the second system is on the front wheels. That stop is longer than kart.stop_distance_max_m, which R-09 sets on level pavement; slopes are descended at walking pace (OP-02.04).

## 1.3.6 Steering {#steering}

- The donor scooter's handlebar, lay.bar_width_mm wide, at lay.bar_x_mm and lay.bar_z_mm, on a stem raked dsn.stem_rake_deg in two UCFL204 flange units (M40). The ATV steering knuckles with 17 mm spindles (M92) turn on kingpins at ±lay.kingpin_y_mm, inside the brake drums; if the knuckles are made for ball joints, two brackets on the front beam take their place (Q-037). A bar handle needs no impact-absorbing steering (P70).
- The knuckles' arms point back at the rear axle's centre (Ackermann) at the spindles' height, well above the spine and the front beam. A pitman arm at the stem's foot, as long as the knuckles' arms, reaches back to the inner ends of the two tie rods of M10 rod ends PHS10 (P34, M38), dsn.tie_rod_length_mm long. They lie across the kart, so turning bar and wheels alike to full lock changes their length by only dsn.tie_rod_change_mm; the wheels take that up by turning a little more or less than the bar.
- With a steering lock of lay.steer_max_deg the smallest turning radius is dsn.turn_radius_m.

## 1.3.7 Seat, footrests, and fit {#fit}

- The donor scooter's seat sits on the engine unit and, at its rear, on the upper rails, its top lay.seat_height_mm above the ground, from lay.seat_x0_mm to lay.seat_x1_mm and lay.seat_width_mm wide, dsn.saddle_thickness_mm thick. The adult's hip is at lay.hpoint_x_mm, dsn.seat_drop_adult_mm above the footboards.
- Footboards lie beside the unit at lay.footrest_height_mm, from lay.foot_x0_mm to lay.foot_x1_mm, between lay.foot_y0_mm and lay.foot_y1_mm from the centre line, on three cross tubes and an outer tube, with a toe board at the front edge. A child sits further forward at lay.child_hip_x_mm on steps of lay.child_foot_raise_mm bolted on the footboards (R-03, D-030).
- Standing on the steps, the smallest rider's crotch clears the seat by dsn.child_fit_margin_mm more than the rider.child_fit_clear_mm of youth ATV guidance (P69), with the crotch height assumed at rider.child_crotch_ratio of stature (Q-033).

## 1.3.8 Mass {#mass}

- The kart's parts sum to dsn.mass_kg, with the centre of mass at dsn.cg_x_m ahead of the rear axle and dsn.cg_z_m above the ground; `docs/data/design.json` lists each part's mass.
- With the adult the rear wheels carry dsn.rear_share_adult and the centre of mass is at dsn.cg_height_adult_m; with the child, dsn.rear_share_child and dsn.cg_height_child_m.

## 1.3.9 Stability {#stability}

- Half the track at the centre of mass over its height is dsn.tip_ratio_adult with the adult and dsn.tip_ratio_child with the child; the shorter half of the wheelbase over the height is dsn.pitch_ratio_adult and dsn.pitch_ratio_child. The working basis asks kart.tip_ratio_snow_min sideways and law.quad_pitch_ratio_min fore and aft, above Australia's tilt-table minimums for quad bikes with a rider (P66); the owner decides (Q-032).
- The adult's hip sits at lay.hpoint_x_mm, where the toes clear the front tyres at full lock (1.3.16); the lower centre of mass keeps the fore-and-aft margin with it.

## 1.3.10 Climbing {#climb}

- On site.grade_max_pct of long grass (ground.crr_max) with the adult, climbing needs dsn.climb_force_n; the rear tyres pass dsn.climb_grip_n at the assumed grip ground.mu_grass (Q-014), and the engine gives dsn.climb_thrust_n. The steepest grass slope the rear tyres climb is dsn.climb_grade_max_pct, short of the assumed site.grade_max_pct (Q-008). D-021 lets the slope follow what the kart can do; the rider leaning forward uphill, as on a quad, takes still more weight off the rear.

## 1.3.11 Transport {#transport}

- The kart goes into the Delica as it is: dsn.delica_length_margin_mm shorter than the cargo length, dsn.delica_width_margin_mm inside the widest tailgate opening, and dsn.delica_height_margin_mm under the cargo height (R-14, OP-05). Whether it passes the opening at floor height waits for the owner's measurement (Q-015).

## 1.3.12 Winter form {#winter}

The winter form is W6 of [1.2.19](02-form.md#tyres) (D-032): the kart keeps its wheels, skis bolt beside the front wheels, and chains go on the rear tyres as needed. The change of form is OP-04 and back OP-06 (R-28).

- **Skis.** Skis of ski.width_mm by ski.contact_length_mm on the snow bolt to the steering knuckles inside the front tyres, lay.ski_gap_mm clear of them, at dsn.ski_y_mm from the centre line, on brackets that pivot with rubber stops and adjust in height: below the tyre for deep snow, which lifts the front wheels, or a little above it where the ground is firm, so that the tyre rolls and keeps its brake until it sinks. They steer with the wheels, clear of the front brake drums and the tie rods. With the adult they press dsn.winter_ski_pressure_kpa when they carry the front.
- **Chains.** Ladder chains on the rear tyres (P1, S1) for grip on packed snow and ice.
- **Mass and stability.** The winter kart weighs dsn.winter_mass_kg. With the adult its centre of mass is dsn.winter_cg_height_m high and the rear tyres carry dsn.winter_rear_share. With the skis carrying the front their stance is narrower than the front track, and the tipping ratio is dsn.winter_tip_ratio against kart.tip_ratio_snow_min (R-12, D-025); fore and aft it is dsn.winter_pitch_ratio, since nothing is lifted. How the tyres and skis do in fresh snow is in 1.2.19.
- **Sled pan.** A UHMW polyethylene plate hull.bottom_t_mm thick under the spine, dsn.belly_height_mm above the ground, with a bow in three panels rising lay.bow_rise_mm under the front frame, clear of the tie rods, the front beam, and the horn; it weighs dsn.pan_mass_kg and keeps the spine from ploughing when the tyres sink.
- **Future water version (D-027).** Not required. The 3D view shows it as an option: side floats of lay.float_dia_mm on arms outside the wheels, and an electric outboard with its battery at the stern. 1.2.15 holds its basis.

## 1.3.13 Protective hoop and road equipment {#rollbar}

- A hoop of dsn.rail_od_mm tube behind the seat at lay.hoop_x_mm, standing on the upper rails and braced to their rear ends, rising to lay.rollbar_top_mm, meant to hold the kart off a rider it lands on, as the protection devices that Australia requires on quad bikes do (P66, P68); dsn.tube_roll_m of tube. A straddled seat needs no seat belt, head restraint, or 1 m marker (P70).
- The road equipment of R-20, R-21, and R-23 comes from the donor scooter where it can: the head lamp on the handlebar, beside an LCD meter with its own wheel sensor (M94), mirrors outside the bar ends so that they clear the riders' arms at full lock, front turn signals above the bumper inside the tyres' sweep, rear turn signals on the hoop, the tail and stop lamp, reflector, and number plate with its lamp on the upper rails' rear ends, the horn at the front, and the battery on the upper rails behind the shock. Fenders cover the tyres (R-30); they are ATV fenders as sold (M95), their mass dsn.fender_mass_kg and the road kit's dsn.road_kit_mass_kg assumed (Q-033, Q-023).

## 1.3.14 Guards and stopping {#safety}

- R-10: the donor's throttle grip springs back when released; a stop switch on the handlebar and a tether switch clipped to the rider (M50) are wired to the engine's stop circuit.
- R-11: a steel guard on the swing arm covers the chain's upper run and the sprockets' tops from the rider's side, and tubes on the arm cover the turning axle between the bearings and the hubs (P17, P19).
- R-13: the footboards and the front bumper keep the rider's feet inside the kart; riders wear the gear of R-31.

## 1.3.15 Where the engine sits {#engine-position}

- Under the seat along the centre line, as in the scooter it comes from (D-030). Beside the seat it made the seated kart wide; under the seat the kart is as narrow as its track allows and still fits the car's length. The centrifugal clutch stays, since the engine must idle while the kart stands and the clutch lets go when the throttle is released (R-10).

## 1.3.16 Layout checks and issues still open {#issues}

- **Interference search (Q-035).** `calc/clash.py` builds every part as the 3D view draws it, the frame tubes and the riders as capsules, and measures the smallest gap between every pair that is not mounted on each other. It runs in the summer and winter forms, straight and at ±lay.steer_max_deg of steering with the front wheels, knuckles, skis, fenders, tie rods, and handlebar turned, and at the ends of the rear suspension's travel (sus.bump_mm up and sus.droop_mm down). It finds dsn.clashes_summer pairs closer than 5 mm in summer and dsn.clashes_winter in winter.
- **What it found and changed.** The first search of the earlier layout found the bearing outriggers inside the rear tyres, the riders' feet, the front fenders, and the turn signals in the front tyres' sweep at full lock, the skis' brackets through the front beam, and tie rods that changed length by about 45 mm. The layout of 1.3.1 to 1.3.17 answers these: the arm's bearings sit inside the tyres, the front fenders turn with the knuckles, the feet stop at a toe board, the skis' brackets stay under the beam, and the pitman arm sets the tie rods' length.
- **Still open.** The grass slope the kart climbs is less than assumed (1.3.10). The fit of the ATV front knuckles, drum hubs, wheels, and meter is unstated by their sellers, and the drum brakes' parts, the ski brackets, and the axle sprocket are allowances (Q-036, Q-037). The bearings' sizes, the shock's stroke, and the target frequency are assumed (Q-039).
- The rider's thighs pass round the engine unit, which is wider than the seat; the adult's knees bend well, about as on a youth quad. Both are to be tried on the built kart.

## 1.3.17 Rear suspension {#suspension}

The owner asked whether the wheels should follow the ground on springs (Q-038). Springs keep the tyres pressing on rough ground for steering and braking, cut the shock loads on the frame, and spare the rider. The rear comes first, since most of the rider's weight is on it (D-036); the front stays rigid on its low-pressure tyres.

- **Arm.** The axle's two bearings hang under the swing arm's sides at ±lay.bearing_y_mm, inside the chain, so that no tube of the arm crosses the chain's loop. The arm turns on a pivot tube at lay.pivot_x_mm, just behind the engine unit and level with its output shaft, so the chain's centre distance changes by only dsn.chain_centre_change_mm over the travel and the chain needs no tensioner.
    - Its sides bend level just ahead of the bearing plates, where a brace joins them.
    - A cross tube behind the axle closes the arm.
    - It is dsn.tube_arm_m of the larger tube.
    - Its largest stress is dsn.arm_stress_mpa, a safety factor of dsn.arm_safety, in the cases of 1.3.2.
- **Shock.** One shock of shock.eye_mm between the eyes (M100) runs from a lug lay.shock_low_rise_mm over the arm's sides at lay.shock_low_x_mm, up and back, to the frame's cross tube near lay.shock_top_x_mm.
    - Its motion ratio, the shock's travel per unit of the wheels' travel, is dsn.motion_ratio.
    - The wheels move sus.bump_mm up and sus.droop_mm down from the laden position. That uses dsn.shock_stroke_used_mm of the shock's assumed shock.stroke_mm stroke in bump (Q-039), dsn.shock_travel_mm in all.
    - Laden it is dsn.shock_length_static_mm long.
    - The axle clears the struts above it by dsn.axle_rail_gap_mm at full bump.
- **Spring.**
    - For a natural frequency of sus.freq_hz, stiffer than a full-size quad's because the travel is short (Q-039), the rear wheels' rate with the dsn.rear_sprung_kg on them is dsn.rear_wheel_rate_n_mm. They sag dsn.rear_sag_mm laden.
    - The spring at the shock is dsn.shock_spring_n_mm, chosen when the shock is bought.
    - The shock carries dsn.shock_force_static_n at rest and dsn.shock_force_bump_n in the bump case of 1.3.2.
- **The front.** ATV A-arms with two shocks would follow the ground best, but they change the front a great deal and cost several times as much. A front beam pivoting on the centre line is cheap, but it tips sideways like the one front wheel of 1.2.19 unless it is stopped. Neither is taken now; the rigid front and its tyres are to be tried first.
