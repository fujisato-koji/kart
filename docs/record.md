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
| D-019 | 2026-11-04 | owner | The kart should also be driven on public roads, for short trips and leisurely runs near home in daytime, so it is to be equipped and registered as the law requires (most likely as a four-wheel moped, a minicar). The child drives only on private land. This changes D-005, which kept the kart off public roads. |
| D-020 | 2026-11-04 | owner | The top speed is about 30 km/h, on public roads and on private land alike (one top speed, D-018). This replaces the 20 km/h of D-015. |
| D-021 | 2026-11-04 | owner | Road use comes first. The slope the kart must climb is lowered to what the engine allowed on public roads can do, instead of choosing a larger engine for the slope. |
| D-022 | 2026-11-04 | owner | Reflect the proposal of docs/02-form.md#road in the design and the 3D view. The working basis becomes a used 50 cc four-stroke scooter engine with its CVT, centrifugal clutch, and final reduction in one unit, driving the rear axle by one chain; a roll bar over the driver's head that also serves as the 1 m marker; and the equipment the law asks for road use. The owner may still change the engine choice. |
| D-023 | 2026-11-04 | owner | The kart is to be a personal vehicle for the far outdoors, in the owner's words like a kick scooter for the far outdoors. In winter it is changed into a snowmobile form - two front skis, one rear rubber track, and a sled bottom - to cross fresh snow that may lie about 1 m deep where nobody clears it, and in summer it is changed back to tyres for roads and private land. Aim at fresh snow 1 m deep and confirm it by the snowshoe test of Q-012. This raises the 30 cm of D-006 and starts a new pass of step 1.2. |
| D-024 | 2026-11-04 | owner | The owner would like the kart, if it can be done, to drive from a shore straight into a lake, move on as a boat, and drive out again. Step 1.2 finds what that takes and what it costs before the owner confirms it. |
| D-025 | 2026-11-04 | owner | Settles items 1, 2, and 5 of docs/02-form.md#outdoor. The winter form is the snowmobile form W3, driven by the summer 50 cc scooter unit (D1). R-12 is relaxed for the snowmobile form only, which runs only on snow - its tipping ratio need be at least kart.tip_ratio_snow_min, above the snow's grip. Item 3 (water) waits until the owner has heard what a ship inspection involves. |
| D-026 | 2026-11-04 | owner | The driver may sit or stand, but if standing would keep the kart off public roads, the kart is ridden seated. A minicar needs a seat with a seat belt and a head restraint (R-22), so the kart stays seated. This settles Q-026. |
| D-027 | 2026-11-04 | owner | Settles item 3 of docs/02-form.md#outdoor. The water requirement R-27 is withdrawn. Water use is kept only as a future development, shown in the 3D view as an option (side floats and an electric outboard on the tub) without a requirement; the tub stays for the snow and as safety buoyancy (R-29). Q-028 is closed until such a version is taken up. |
| D-028 | 2026-11-04 | owner | R-29 keeps only the driver's safety - on ice and near water a life jacket and no seat belt, and nothing of the kart holding the driver. The kart need not float. This settles Q-030; the sled pan keeps its bottom strips and bow and loses its foam and the right pod, which were there only to float the kart. |
| D-029 | 2026-11-04 | owner | Record W4 - the sled pan carrying most of the weight in snow and the rear tyres, pressed down and wearing chains, pushing - as a winter candidate beside the snowmobile form, and test the summer form with chains in fresh snow before the donor snowmobile is bought. |
| D-030 | 2026-11-04 | owner | Riders are 6 years old and up, instead of 5 (D-010). The kart is ridden astride, like an ATV or a snowmobile, with the feet on footrests beside the seat and the rider leaning into turns; the owner accepts this active riding so that the kart can be short and narrow with the engine under or behind the seat. Measures that keep a rider safe if the kart tips or rolls are to be designed. |
| D-031 | 2026-11-04 | owner | The kart keeps four wheels. One front wheel was considered for its simplicity - the donor scooter's whole front end with its brake and speedometer - and a triangular sled bottom, but with the straddle kart's centre of mass it tips far more easily (1.2.19) and would need the seat lowered a long way. |
| D-032 | 2026-11-04 | owner | Buggy-size tyres stay on all year. In winter height-adjustable skis bolt to the steering knuckles inside the front wheels (W6 of 1.2.19), and chains go on the rear tyres as needed. This replaces the large tyres changed each winter (W5), which were the working basis of 1.3, and makes the inside skis the winter form; outside skis remain the choice if more stability is wanted. |
| D-033 | 2026-11-04 | owner | The kart stays a home build, and its parts list is cut. A road-registered 50 cc ATV costs about 198,000 to 298,000 JPY new and mostly 60,000 to 160,000 JPY used with papers (1.5.3), less than the kart's parts were. The list now takes the cheaper running donor, ATV knuckles and drum brake hubs in place of kart spindles, hubs, and cable discs, an LCD meter with its own sensor, ATV wheels with tyres and fenders as sold, the pan's sheet cut to order, and ski brackets made in house. |
| D-034 | 2026-11-04 | owner | The navigator is in Japanese. Its own display is Japanese, and the record's statements are shown in Japanese from a table of translations kept beside the site data; the record, the reasoning pages, and the code stay English (D-002). |
| D-035 | 2026-11-04 | owner | R-03 is reworded for the straddle kart (D-030) - the seat, footrests, and handlebar fit riders from a 6-year-old child to an adult, the child on bolt-on steps - in place of the seat and pedals of the seated kart. |
| D-036 | 2026-11-04 | owner | The rear wheels follow the ground on springs - the axle in two bearings on a swing arm pivoted just behind the engine unit, level with its output so that the chain keeps its length, and one shock between the arm and the frame. The front stays rigid on its low-pressure tyres; ATV A-arms and a pivoting front beam were not taken. |
| D-037 | 2026-11-04 | owner | The frame is made low and small and cheaper where its shape allows. The engine unit sits on spine rails just above the sled pan, which lowers the seat and the centre of mass; with that the track, the hoop, and the handlebar come down and in, and the rear overhang shortens. The bearing outriggers and the middle bearing go; the frame is of two tube sizes, the rear triangulated so that the shock's load closes within it, and is checked as a space frame and for interferences. |
| D-038 | 2026-11-04 | owner | For rough ground the kart stands 150 mm off the ground under its frame, at the clearance of a small sport quad (1.3.19). The frame and the sled pan under it go up by about 40 mm and the seat back to 600 mm, giving up part of the lower seat of D-037. |
| D-039 | 2026-11-04 | owner | The front wheels follow the ground on springs too, by the cheapest of the means compared in 1.3.20 - the front beam cut into two swing axles, each turning on a pivot near the centre line level with the tie rods' inner ends, with one shock each of the rear's kind to a cross tube over the front. ATV A-arms bought as a kit (about 70,000 to 73,000 JPY, M104) were judged too dear. |
| D-040 | 2026-11-04 | owner | The frame meets fatigue on rough ground by its shape and its joints - seat rails of the larger tube under the saddle, from the upper rails down to the spine ahead of the footboards, so that spine and seat rails work as a truss; tubes fitted to each other and welded all round, no intermediate plates fillet-welded on the spine, the posts, or the footboards' supports, and gussets where the posts and struts meet; and the welds looked over for cracks before each day's riding (OP-01). |
| D-041 | 2026-11-04 | owner | The front end takes form S1 of 1.2.20 - upper and lower A-arms each side with the knuckle between their ends, one coil-over from each lower arm to a node of the upper rails, a triangulated nose box carrying the arms' pivots, the shocks' tops, and the stem's two bearings, and tie rods from a plate on the stem, their inner ends at the height that keeps the toe change least; it replaces the swing axles of D-039, which change the camber too much over the travel |
| D-042 | 2026-11-05 | owner | The frame's ends lose what carries little. At the rear the swing arm's pivot stays level with the engine's output, carried by two tubes rising from the spine's rear cross tube to the seat rails' rear ends behind the saddle; the protective hoop stands there, leaning back, and carries the rear shock's top on a cross tube between its legs; the struts, the upper rails behind the seat, and the number plate's frame go, the plate and the rear lamps riding on the swing arm. At the front the nose box's front panel is the bumper, ahead of the tyres, and the separate bumper with its struts goes. A pivot right on the spine rails was chosen first; the owner moved to the pivot at the output's height when a faulty search said no single shock fitted the low pivot, and kept it once a corrected search (K-019) found layouts for both, since the low pivot changes the chain's centre distance by about 45 mm against 14 mm. |
| D-043 | 2026-11-05 | owner | The swing arm's pivot moves down onto the line from the engine's output to the axle, so that the chain's centre distance is longest at rest and changes by about 2 mm over the travel, and the chain is sized for its longest distance. With the pivot level with the output (D-042) the distance grew by about 6 mm toward full bump, and the 76-link chain, sized at rest, would have pulled tight about 6 mm into the bump and carried the springs' load through the sprockets and bearings. With the pivot lower, the arm's brace at full bump would meet the rising tubes where they lean back from the pivot, so they now go straight up through the pivot tube to a knee above the brace's reach and lean back from there; the shock's lower eye moves to keep the motion ratio as it was. |
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
| Q-008 | How steep is the fairly steep slope of D-014? It is assumed at 20 % (about 11 degrees); D-021 lowers it to what the road-legal engine can climb, which is set when the engine is chosen. | owner |  |
| Q-009 | The rough inputs of step 1.2 (kart mass and its rear share, tyre pressure, track wheel diameter, ski size, drive efficiency, tube lengths, ground clearance, heights of the centres of mass, and a mean speed, rolling resistance, electric efficiency, and usable battery fraction for the run time) are assumed so that forms can be compared. Step 1.3 replaces each with the chosen part's data or a calculation. | assistant |  |
| Q-010 | The price of the 12 V chargers for E2 and the allowances for shipping, small parts, a reduction stage, skis, the track running gear, pedals and cables and the stop switch, guards and mounts, drive chains, and electric wiring are assumed. Whether the snow chain price of M15 is for one tyre or a pair is not known; two are counted. Step 1.5 replaces each with a quoted price. | assistant |  |
| Q-011 | What is the governed no-load speed of the chosen engine? The gearing for R-01 is set to it. It is assumed at 3850 rpm from a checker's recollection (K-001), not from a source; take it from the engine maker's data, or measure it on the engine when it arrives. | assistant |  |
| Q-012 | How far does the owner's fresh snow give under a loaded plate? A board of known area loaded to about 5 kPa and to about 16 kPa, set on undisturbed fresh snow and its sinkage measured, settles whether rear tracks (W2) clear snow.depth_max_cm before the frame is given mounts for them. A person on snowshoes presses about 3.5 kPa (S4), the same order as a sled bottom (D-023), so the depth a snowshoe sinks in the deepest fresh snow is a first measure of whether the snowmobile form floats. | owner |  |
| Q-013 | Should an adult be able to set a lower top speed for a small child? A 5-year-old drives (D-010), while US youth ATV guidance allows no ATVs under 6 and limits ages 6 and up to 10 mph with the restrictor (P25, S2). The child limit is assumed at 16 km/h, about 10 mph, until the owner decides R-17. | owner | D-018 |
| Q-014 | The 3D simulator needs the tyre grip on pavement, gravel, and grass, the sideways grip of the front skis, the resistance of tracks in fresh snow, and the resistance when the floor ploughs snow. No source was found; they are assumed so that the simulator can run, and a test run of the built kart settles them. Simulator results that rest on them are illustrations, not verification. | assistant |  |
| Q-015 | In the owner's Delica D:5, with the third row flipped up and the second row tipped up and slid forward, how wide is the clear space at the floor and at 40 cm above it, and how wide is the tailgate opening at the height of the cargo floor? The sources give only the narrowest and widest widths. | owner |  |
| Q-016 | How many hours a day can the owner work on the kart? The plan in docs/data/plan.yaml assumes two to three hours a day for its task lengths. | owner |  |
| Q-017 | Step 1.3 assumes, without a source yet, the dynamic load factor on the frame and axle, the density and strength of S45C and STKM11A steel, the masses of a wheel with its tyre, the clutch, the seat, the steering, the brake, the fuel, and small parts, the brake pad friction, and the ratio of buttock-to-heel length to stature for an adult and for a 5-year-old. Cite a standard, a maker's data, or a weighing for each before the gate from design to build. | assistant |  |
| Q-018 | The parts list assumes the price of steel plate cut to size, of machining by a local shop (keyways on the axle and the jackshaft, boring the 36 tooth sprocket, cross holes for the hub pins, the brake disc carrier), of making the two rear hubs, and of a 25 mm axle shaft of 1.22 m. Get quotes before the gate from design to build. | assistant |  |
| Q-019 | The fit of bought parts to each other is not stated by their sellers and is checked when they arrive, before the frame is welded to them - the rim's three-hole pattern against the front hubs and the made rear hubs, the front hubs' bore against the 17 mm spindles, the engine's shaft (3/4 inch Q-type) and base holes, and the seat's rail bolt spacing. | assistant |  |
| Q-020 | The layout of step 1.3 is not yet buildable (K-005). Rearrange the drive so that the chains, the jackshaft and its bearings, the middle axle bearing, and the guard fit between the seat and the left rail, or move the drive outboard; redesign the column support so it holds the column at its lower flange bearing and clears the legs; route the pedal box rails clear of the cross members; raise the steering arms and tie rods clear of the front rails; join every plate, the floor, and the seat slide to the frame; widen the seat space; and add the cornering side force to the axle and the engine's offset to the left rail. | assistant | D-030 |
| Q-021 | Which class of vehicle the kart becomes on public roads (most likely a minicar, a four-wheel first-class moped with up to 50 cc or 0.6 kW rated electric output), and which safety standards (brakes, lamps, turn signals, mirrors, horn, speedometer, plate, size), registration steps, tax, and insurance apply; list each as a requirement with its article from the law. | assistant |  |
| Q-022 | How does the owner's municipality register a minicar built from scratch - how is a frame number given to a home-made frame, and which papers prove the engine's displacement (the donor's scrapping certificate, a receipt or transfer certificate, an engine-number rubbing)? No official page found covers a scratch-built frame; the owner asks the municipality's light vehicle tax counter. Pages read later show the usual practice - a declaration that the vehicle was modified or made, with photos - for a minicar one showing the track over 50 cm - and, for an electric motor, its rated output written in (P89, P90); no municipality found inspects the vehicle or asks for a test. Type approval is an option for makers, not needed for one kart (P87); there is no inspection for a moped, but it must still meet the safety standards (P88). | owner |  |
| Q-023 | The size and mass of a 50 cc scooter's engine and transmission unit, its final reduction, and its ECU's rev limit are not stated in any source found; the design assumes them. Measure the donor unit when it arrives, and set the drive sprockets so the top speed at the rev limit is kart.speed_max_kmh. | assistant |  |
| Q-024 | No seat belt marked JIS D4604, which the safety standards accept (P36 article 66-2), was found for sale to individuals; generic belts (M78) are not marked. A belt with its anchors from a scrapped kei car carries its approval; find one and its price, and check how it mounts on the kart's frame and seat. | assistant |  |
| Q-025 | The road-going layout is not yet buildable (K-006). Move the left side bar and the column braces clear of the scooter unit and the adult's shins; give the unit a plate on both rails; keep the axle sprocket and chain clear of the middle bearing plate; raise the roll bar above the tallest driver's head with a folding or bolted top for the car, with a front structure for a rollover; mount the hand brake, belt anchors, head restraint, battery, horn, and mirrors (facing the driver) on the frame; place the fuel tank, ECU, regulator, key switch, and the donor's silencer; add the cornering load to the axle and check a 30 mm axle; and carry the engine unit's mass on both rails. Build the collision search into calc/design.py so each change is checked. | assistant | D-030 |
| Q-026 | The owner described the kart as like a kick scooter for the far outdoors (D-023). Does that ask for a standing ride, or for a light personal vehicle that is still seated? A standing ride conflicts with the seat, seat belt, and head restraint the law asks of a minicar on roads (R-22), and with a child driving. | owner | D-026 |
| Q-027 | The rough inputs of the snowmobile form and the hull - the track's place and mass (its size is a Yamaha Bravo's, P51), the parts removed and added at each change, the drive sprocket, the hull's size, foam share, and plating, the water design points, the outboard's battery, and the change time - are assumed until a donor is chosen and the hull is laid out in step 1.3. | assistant |  |
| Q-028 | A kart that moves on a lake is an amphibious vessel, a special ship, which the small-boat exemption from ship inspection does not cover (P46). Ask the regional transport bureau whether a home-built amphibious kart moved on water only by an electric outboard under 1.5 kW, with its engine stopped, can be inspected; whether a tub that the persons formula rates for nobody may be approved on an inclining test, or needs side floats for water days; whether the 50 cc engine counts as propulsion because it can turn the wheels in water; and whether a pond on private land is outside the Ship Safety Act (only named waters are exempt from registration, P58). What an inspection asks and costs is in docs/02-form.md#water (P55, P56). No official page on a small amphibious vessel was found. | owner | D-027 |
| Q-029 | (W3, given up for W6 by D-032; its part left the record.) The donor's track unit is drawn from assumed sizes - the track's thickness with its lugs, the rear idler's diameter, the drive shaft's height and its place ahead of the slide rails - which set the winter lift. Measure them on the donor (a Yamaha Bravo class) when it is bought, with its mass and mounting points, and check that a pivot shaft through the pillow blocks and brackets hanging from the rails can hold it. | assistant |  |
| Q-030 | The sled pan held 0.020 m3 of foam, which floated 0.15 of the winter kart's own weight, while R-29 asked water.reserve_ratio, which needed about 0.158 m3. The room is not there without bolting large floats on. With boat use withdrawn (D-027), should R-29 keep only the driver's part (a life jacket and no seat belt on ice, nothing holding the driver) and drop the kart's floating, or should the kart carry floats in winter? | owner | D-028 |
| Q-031 | The rough inputs of 1.2.17 - the track's own resistance on packed snow, and the wheel size under a snowblower crawler - are assumed until the donor's track is run on packed snow and the roll bar is laid out. | assistant |  |
| Q-032 | With the straddle layout of D-030, set the stability margin that R-12 asks for a kart ridden actively, and the protection R-19 asks if it tips or rolls; and confirm which of R-22 (seat belt and head restraint) and R-24 (the 1 m marker) still apply to a straddled seat of at least 500 mm, which P36 exempts. | assistant |  |
| Q-033 | The straddle kart of 1.2.18 is sized from assumed numbers - its seat and footrest heights, track, wheelbase, overhangs, mass and centre of mass, fender margin, and a 6-year-old's crotch height as a share of stature (no Japanese data for that age was found) - until it is laid out in 1.3. | assistant |  |
| Q-034 | The winter form W5 (dropped for W6 by D-032) assumes large low-pressure tyres of the 25x12-9 class with rims, their mass and price, and a 12T output and 45T axle sprocket and their price, until a tyre that fits the rear hubs is chosen. | assistant |  |
| Q-035 | The straddle kart of 1.3 is placed by hand and has had no collision search. K-013 left the spine too weak (a truss under the seat or a larger tube), the tie rods 4 mm from the front rails, the footboards held at one edge, the axle sprocket and axle uncovered, and the battery and the stem's foot without supports. The next pass builds a collision search into calc/design.py for the summer and winter forms and resolves these. | assistant | D-037 |
| Q-036 | The buggy-size tyres of 1.2.19 (about 19x7-8 at the front and 18x9.5-8 at the rear, as on the MAGMAX50 of M90) are taken at a common diameter, their widths and mass, with the chains for them and the 42T axle sprocket the larger tyres need, until a set that fits the hubs and the road rules is chosen; a set of four is priced in M96. | assistant |  |
| Q-037 | The cheaper parts of D-033 are taken from shop listings that leave their fit unstated - whether the ATV knuckles (M92) turn on kingpins as 1.3.6 draws them or need two ball joints on brackets; whether the drum hubs (M93) come with shoes and a backing plate, their drum size, and whether their three studs on 78 mm match the wheels (M96 gives PCD 110, or 88 at the front); the cable and splitter from the left lever; whether the LCD meter (M94) is lit at night and how its sensor reads the wheel; the fenders' width (M95); and the cost of making the ski brackets. They are settled before the parts are ordered, and checked on arrival as Q-019 says. | assistant |  |
| Q-038 | The owner asked whether the wheels should follow the ground on springs. The kart of 1.3 is rigid and rides on its low-pressure tyres alone, as small karts and the cheapest youth quads do, while road-registered 50 cc ATVs have shocks front and rear (M97). Springs would keep the tyres pressing on rough ground for steering and braking, cut the shock loads on the spine that Q-035 already finds weak, and spare the rider. The candidates are a rear swing arm with one shock carrying the axle, pivoted at the engine unit's output so that the chain keeps its length; ATV A-arms with shocks at the front; and a front beam pivoting on the centre line, which is cheap but tips sideways like the one front wheel of 1.2.19 unless stopped. Studied with the frame in the pass of Q-035. | assistant | D-036 |
| Q-039 | The frame pass of D-036 and D-037 assumes the UCP207 pillow block's sizes, mass, and price for the 35 mm axle (the common sizes of the series; check them against the FYH catalogue P33 when bought), the rear shock's stroke (its seller states the eye-to-eye length only, M100), and a rear natural frequency of 2.5 Hz for a short-travel kart, until the shock is bought, measured, and its spring chosen. | assistant |  |
| Q-040 | The load cases for rough ground of 1.3.18 assume what no source gives for this kart - the combination of 2 g vertical with 1 g braking and 1 g sideways, a frontal impact of 5 g at 30 km/h against a post or tree that misses the tyres (Baja's frontal 8 to 10 g at 56 km/h scaled with the same impulse time gives 4.3 to 5.4 g, P74, P75), a sideways push on the hoop of the kart's weight, both hoop loads applied with the frame held at its spine and the rider's mass left out (as rollover structures are tested; held at the hoop with the kart's masses pushing, the side push would be worse), a safety factor of 1 on tensile strength in accidents, a usable tyre deflection of 50 mm and a reference drop of 150 mm, a repeated load range of 1 g with a partial factor of 1.35 for fatigue, and the detail categories of butt-welded tubes and plates standing for the frame's tube-to-tube joints, which EN 1993-1-9 does not list. The frame is to last 2 million such ranges at those details, as many kilometres of rough ground at one such bump a metre. They hold until the kart is measured on its ground. | assistant |  |
| Q-041 | Against the load cases for rough ground of 1.3.18 the frame's welded joints have a limited fatigue life - a repeated 1 g range is unlimited only below about 0.7 g at butt-welded details and 0.4 g at fillet-welded ones. (The spine, the axle, the bumper, and the hoop, which fell short at first, were changed with D-038 and now meet their cases.) The joints are to be detailed with gussets and fitted ends for the better categories before building, and the frame tried on its ground. | assistant | D-040 |
| Q-042 | For rough ground the owner decides the front's springing of 1.3.18 (the ride height of 1.3.19 is settled by D-038) - stay rigid and ride drops of more than a few centimetres slowly, or add ATV A-arms with two shocks (D-036 put this off; a kit costs about 70,000 to 73,000 JPY, M104). | owner | D-039 |
| Q-043 | The front end of 1.3 grew by patching interferences and passed its checks without being a sound structure - the steering did not visibly reach the wheels, the springs' action was unclear, and the stem's stays carried little. 1.2.20 sets the front end's requirements, gathers precedents, and compares four forms - double A-arms, one arm a side on a fore-and-aft axis, a leading arm a side, and a rigid beam - by their load paths and by how camber, toe, and caster change over the travel; the owner chooses the form before the front end is designed again. | owner | D-041 |
| Q-044 | The double A-arms of D-041 (1.3.20) rest on hard points set before the knuckles were measured. Whether the bought knuckles (M92) take ball joints or a kingpin between the arms, where their joints and steering arm are, and how long that arm is (lay.steer_arm_mm, assumed) are to be measured on the parts in hand, and the hard points set from them, before the arms are made; the ball joints in the parts list (M106) stand for either. The front steers with more Ackermann than one turning centre needs - the outer wheel turns dsn.steer_outer_deg where dsn.steer_outer_ideal_deg would do - because arms angled to correct it raise the toe change to dsn.bump_steer_alt_deg. The tyre stands within 5 mm of the lower arm's outer end. From land.drop_ref_mm the front lands at dsn.landing_front_g, above the bump case (FE-04); the arms would allow more travel, as far as the shocks' stroke does. The arms' pivot bolts and bushes are not yet priced. | owner |  |
<!-- tdr:end -->

## Values {#values}

<!-- tdr:table kind=value fields=key,v,unit,status,basis -->
| key | v | unit | status | basis |
|---|---|---|---|---|
| kart.seats | 1 |  | decided | D-001 |
| kart.speed_max_kmh | 30 | km/h | decided | D-020 |
| snow.depth_max_cm | 100 | cm | decided | D-023 |
| ambient.temp_min_c | -10 | degC | decided | D-007 |
| budget.parts_jpy | 100000 | JPY | decided | D-008 |
| rider.mass_max_kg | 100 | kg | decided | D-009 |
| rider.stature_min_cm | 108 | cm | sourced | P21 |
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
| lay.wheelbase_mm | 1080 | mm | calculated | docs/03-design.md#layout |
| lay.track_front_mm | 800 | mm | calculated | docs/03-design.md#layout |
| lay.track_rear_mm | 800 | mm | calculated | docs/03-design.md#layout |
| lay.rail_bottom_mm | 156 | mm | calculated | docs/03-design.md#layout |
| lay.front_overhang_mm | 250 | mm | calculated | docs/03-design.md#layout |
| lay.rear_overhang_mm | 250 | mm | calculated | docs/03-design.md#layout |
| lay.hpoint_x_mm | 400 | mm | calculated | docs/03-design.md#fit |
| lay.steer_max_deg | 30 | deg | calculated | docs/03-design.md#steering |
| lay.engine_x_mm | 380 | mm | calculated | docs/03-design.md#drive |
| lay.engine_y_mm | 430 | mm | calculated | docs/03-design.md#drive |
| lay.jack_x_mm | 150 | mm | calculated | docs/03-design.md#drive |
| lay.jack_z_mm | 215 | mm | calculated | docs/03-design.md#drive |
| lay.chain1_y_mm | 225 | mm | calculated | docs/03-design.md#drive |
| lay.chain2_y_mm | 155 | mm | calculated | docs/03-design.md#drive |
| lay.bearing_y_mm | 140 | mm | calculated | docs/03-design.md#axle |
| lay.brake_y_mm | -195 | mm | calculated | docs/03-design.md#brake |
| lay.axle_length_mm | 850 | mm | calculated | docs/03-design.md#axle |
| lay.disc_dia_mm | 152 | mm | calculated | docs/03-design.md#brake |
| gear.t_clutch | 10 |  | calculated | docs/03-design.md#drive |
| gear.t_jack_in | 40 |  | calculated | docs/03-design.md#drive |
| gear.t_jack_out | 12 |  | calculated | docs/03-design.md#drive |
| gear.t_axle | 36 |  | calculated | docs/03-design.md#drive |
| dsn.axle_dia_mm | 35 | mm | calculated | docs/03-design.md#axle |
| dsn.rail_od_mm | 48.6 | mm | calculated | docs/03-design.md#frame |
| dsn.rail_t_mm | 2.3 | mm | calculated | docs/03-design.md#frame |
| dsn.cross_od_mm | 25.4 | mm | calculated | docs/03-design.md#frame |
| dsn.cross_t_mm | 1.6 | mm | calculated | docs/03-design.md#frame |
| dsn.floor_t_mm | 2.3 | mm | calculated | docs/03-design.md#frame |
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
| lay.axle_gap_mm | 30 | mm | calculated | docs/03-design.md#frame |
| cost.tube_32x23_jpy_per_m | 1700 | JPY/m | assumed | Q-018 |
| law.minicar_cc_max | 50 | cc | sourced | P35 |
| law.minicar_kw_max | 0.6 | kW | sourced | P35 |
| law.width_max_mm | 1300 | mm | sourced | P36 |
| law.length_max_mm | 2500 | mm | sourced | P36 |
| law.speed_road_kmh | 60 | km/h | sourced | P38 |
| law.speed_lane_kmh | 30 | km/h | sourced | P38 |
| law.parking_grade_pct | 18 | % | sourced | P37 |
| law.marker_height_mm | 1000 | mm | sourced | P36 |
| cost.tax_year_jpy | 3700 | JPY | sourced | P41 |
| cost.cali_year_jpy | 7730 | JPY | sourced | P42 |
| eng50.kw | 3.3 | kW | sourced | P43 |
| eng50.rpm | 8000 | rpm | sourced | P43 |
| eng50.torque_nm | 4.1 | N m | sourced | P43 |
| eng50.cvt_low | 2.85 |  | sourced | P43 |
| eng50.cvt_high | 0.86 |  | sourced | P43 |
| cost.engine50_used_min_jpy | 9765 | JPY | sourced | M63 |
| cost.engine50_used_max_jpy | 38500 | JPY | sourced | M63 |
| cub50.kw | 2.7 | kW | sourced | P44 |
| cub50.torque_nm | 3.8 | N m | sourced | P44 |
| su.length_mm | 560 | mm | assumed | Q-023 |
| su.width_mm | 320 | mm | assumed | Q-023 |
| su.height_mm | 330 | mm | assumed | Q-023 |
| su.mass_kg | 22 | kg | assumed | Q-023 |
| su.final_ratio | 10.5 |  | assumed | Q-023 |
| su.rev_limit_rpm | 8500 | rpm | assumed | Q-023 |
| dsn.road_kit_mass_kg | 6.0 | kg | assumed | Q-023 |
| gear.t_out420 | 14 |  | calculated | docs/03-design.md#drive |
| gear.t_axle420 | 40 |  | calculated | docs/03-design.md#drive |
| lay.unit_y_mm | 0 | mm | calculated | docs/03-design.md#drive |
| lay.chain420_y_mm | 185 | mm | calculated | docs/03-design.md#drive |
| lay.unit_out_x_mm | 290 | mm | calculated | docs/03-design.md#drive |
| lay.rollbar_top_mm | 950 | mm | calculated | docs/03-design.md#rollbar |
| cost.hand_brake_jpy | 6000 | JPY | assumed | Q-018 |
| cost.headlamp_jpy | 6380 | JPY | sourced | M65 |
| cost.tail_plate_lamp_jpy | 3446 | JPY | sourced | M66 |
| cost.turn_signals_jpy | 3200 | JPY | sourced | M67 |
| cost.flasher_jpy | 1950 | JPY | sourced | M68 |
| cost.switch_jpy | 2480 | JPY | sourced | M68 |
| cost.reflector_jpy | 715 | JPY | sourced | M69 |
| cost.mirror_jpy | 1860 | JPY | sourced | M70 |
| cost.horn_jpy | 2619 | JPY | sourced | M71 |
| cost.speedo_jpy | 15737 | JPY | sourced | M72 |
| cost.speed_sensor_jpy | 7751 | JPY | sourced | M72 |
| cost.head_restraint_jpy | 8673 | JPY | sourced | M73 |
| cost.battery_gtz6v_jpy | 5454 | JPY | sourced | M74 |
| cost.chain420_jpy | 1928 | JPY | sourced | M75 |
| cost.spr420_30t_jpy | 2090 | JPY | sourced | M75 |
| cost.spr420_15t_jpy | 1270 | JPY | sourced | M75 |
| cost.donor_scooter_jpy | 32000 | JPY | sourced | M76 |
| cost.plate_stay_jpy | 2617 | JPY | sourced | M77 |
| cost.belt_anchor_jpy | 2772 | JPY | sourced | M78 |
| cost.belt_used_car_jpy | 3000 | JPY | assumed | Q-024 |
| sm.track_width_mm | 381 | mm | sourced | P51 |
| sm.track_contact_mm | 1110 | mm | sourced | P51 |
| sm.track_x_mm | 0 | mm | assumed | Q-027 |
| sm.track_unit_kg | 30 | kg | assumed | Q-027 |
| sm.removed_kg | 21 | kg | assumed | Q-027 |
| ski.pair_kg | 6 | kg | assumed | Q-027 |
| sm.drive_dia_mm | 180 | mm | assumed | Q-027 |
| sm.speed_snow_kmh | 10 | km/h | assumed | Q-027 |
| su.clutch_lock_rpm | 4000 | rpm | assumed | Q-023 |
| hull.length_mm | 1500 | mm | assumed | Q-027 |
| hull.beam_mm | 900 | mm | assumed | Q-027 |
| hull.depth_mm | 350 | mm | assumed | Q-027 |
| hull.bottom_clear_mm | 100 | mm | assumed | Q-027 |
| hull.foam_share_max | 0.4 |  | assumed | Q-027 |
| water.freeboard_min_mm | 150 | mm | assumed | Q-027 |
| water.speed_min_kmh | 2 | km/h | assumed | Q-027 |
| water.shore_grade_pct | 15 | % | assumed | Q-027 |
| water.reserve_ratio | 1.2 |  | assumed | Q-027 |
| kart.swap_time_h | 2 | h | assumed | Q-027 |
| kart.tip_ratio_snow_min | 0.6 |  | decided | D-025 |
| hull.bottom_t_mm | 6 | mm | assumed | Q-027 |
| hull.side_t_mm | 3 | mm | assumed | Q-027 |
| hull.sheet_density_kg_m3 | 940 | kg/m3 | assumed | Q-027 |
| cost.allow_winter_mounts_jpy | 15000 | JPY | assumed | Q-027 |
| foam.density_kg_m3 | 27 | kg/m3 | sourced | M83 |
| cost.xps_jpy_per_m3 | 43200 | JPY | sourced | M83 |
| cost.hull_bottom_jpy_per_m2 | 29100 | JPY | sourced | M82 |
| cost.hull_side_jpy_per_m2 | 21800 | JPY | sourced | M82 |
| cost.donor_bravo_jpy | 131000 | JPY | sourced | M80 |
| cost.outboard_jpy | 40990 | JPY | sourced | M84 |
| outboard.mass_kg | 8.2 | kg | sourced | M84 |
| outboard.power_max_w | 660 | W | sourced | M84 |
| water.load_share_manual | 0.3 |  | sourced | P52 |
| snow.skip_kmh_per_100kg | 12 | km/h | sourced | S5 |
| outboard.battery_kg | 20 | kg | assumed | Q-027 |
| cost.allow_outboard_battery_jpy | 20000 | JPY | assumed | Q-027 |
| law.boat_fee_periodic_jpy | 9900 | JPY | sourced | P56 |
| law.boat_fee_interim_jpy | 5100 | JPY | sourced | P56 |
| sm.track_t_mm | 25 | mm | assumed | Q-029 |
| sm.idler_dia_mm | 180 | mm | assumed | Q-029 |
| sm.drive_z_mm | 220 | mm | assumed | Q-029 |
| sm.drive_ahead_mm | 50 | mm | assumed | Q-029 |
| lay.tunnel_gap_mm | 30 | mm | calculated | docs/03-design.md#winter |
| lay.pan_x0_mm | 170 | mm | calculated | docs/03-design.md#winter |
| lay.pan_x1_mm | 950 | mm | calculated | docs/03-design.md#winter |
| lay.pan_half_beam_mm | 180 | mm | calculated | docs/03-design.md#winter |
| lay.bow_x_mm | 1240 | mm | calculated | docs/03-design.md#winter |
| lay.bow_rise_mm | 80 | mm | calculated | docs/03-design.md#winter |
| lay.bow_half_beam_mm | 60 | mm | calculated | docs/03-design.md#winter |
| lay.float_dia_mm | 300 | mm | calculated | docs/03-design.md#winter |
| snow.track_traction_packed | 0.3 |  | sourced | P59 |
| track.crr_snow_packed | 0.05 |  | assumed | Q-031 |
| sled.mu_packed | 0.1 |  | sourced | P60 |
| sled.cold_start_factor | 2 |  | sourced | P60 |
| rider.sitting_ratio | 0.54 |  | sourced | P61 |
| sm.crawler_wheel_dia_mm | 250 | mm | assumed | Q-031 |
| crawler.c180_width_mm | 180 | mm | sourced | M86 |
| crawler.c180_pitch_mm | 60 | mm | sourced | M86 |
| crawler.c180_links | 28 |  | sourced | M86 |
| crawler.c180_mass_kg | 13 | kg | sourced | M86 |
| cost.crawler180_jpy | 24700 | JPY | sourced | M86 |
| crawler.c300_width_mm | 300 | mm | sourced | M87 |
| crawler.c300_pitch_mm | 72 | mm | sourced | M87 |
| crawler.c300_links | 36 |  | sourced | M87 |
| crawler.c300_mass_kg | 40 | kg | sourced | M87 |
| cost.crawler300_jpy | 65200 | JPY | sourced | M87 |
| snow.crrel_trac_shallow_a | 0.851 |  | sourced | P59 |
| snow.crrel_trac_shallow_b | 0.823 |  | sourced | P59 |
| w4.wheel_share | 0.35 |  | assumed | Q-027 |
| w4.big_tyre_dia_mm | 600 | mm | assumed | Q-027 |
| w4.big_tyre_width_mm | 250 | mm | assumed | Q-027 |
| law.quad_tilt_ratio_min | 0.55 |  | sourced | P66 |
| law.quad_pitch_ratio_min | 0.8 |  | sourced | P66 |
| law.youth_speed_kmh | 16 | km/h | sourced | P69 |
| law.youth_speed_max_kmh | 24 | km/h | sourced | P69 |
| rider.child_fit_clear_mm | 102 | mm | sourced | P69 |
| cost.buggy50_new_jpy | 198000 | JPY | sourced | M90 |
| st.seat_height_mm | 600 | mm | assumed | Q-033 |
| st.footrest_height_mm | 220 | mm | assumed | Q-033 |
| st.track_mm | 880 | mm | assumed | Q-033 |
| st.wheelbase_mm | 1000 | mm | assumed | Q-033 |
| st.overhang_mm | 270 | mm | assumed | Q-033 |
| st.kart_mass_kg | 110 | kg | assumed | Q-033 |
| st.kart_cg_mm | 330 | mm | assumed | Q-033 |
| st.kart_cg_x_share | 0.45 |  | assumed | Q-033 |
| st.fender_mm | 30 | mm | assumed | Q-033 |
| rider.child_crotch_ratio | 0.44 |  | assumed | Q-033 |
| lay.spine_half_width_mm | 130 | mm | calculated | docs/03-design.md#frame |
| lay.kingpin_y_mm | 290 | mm | calculated | docs/03-design.md#steering |
| lay.footrest_height_mm | 180 | mm | calculated | docs/03-design.md#fit |
| lay.foot_x0_mm | 360 | mm | calculated | docs/03-design.md#fit |
| lay.foot_x1_mm | 780 | mm | calculated | docs/03-design.md#fit |
| lay.foot_y0_mm | 170 | mm | calculated | docs/03-design.md#fit |
| lay.foot_y1_mm | 300 | mm | calculated | docs/03-design.md#fit |
| lay.bar_x_mm | 840 | mm | calculated | docs/03-design.md#steering |
| lay.bar_z_mm | 860 | mm | calculated | docs/03-design.md#steering |
| lay.bar_width_mm | 620 | mm | calculated | docs/03-design.md#steering |
| lay.hoop_x_mm | -220 | mm | calculated | docs/03-design.md#rollbar |
| lay.fender_margin_mm | 30 | mm | calculated | docs/03-design.md#layout |
| lay.seat_height_mm | 600 | mm | calculated | docs/03-design.md#fit |
| lay.seat_x0_mm | 100 | mm | calculated | docs/03-design.md#fit |
| lay.seat_x1_mm | 700 | mm | calculated | docs/03-design.md#fit |
| lay.seat_width_mm | 300 | mm | calculated | docs/03-design.md#fit |
| lay.child_hip_x_mm | 530 | mm | calculated | docs/03-design.md#fit |
| lay.child_foot_raise_mm | 70 | mm | calculated | docs/03-design.md#fit |
| dsn.fender_mass_kg | 2.0 | kg | assumed | Q-033 |
| w5.tyre_dia_mm | 635 | mm | assumed | Q-034 |
| w5.tyre_width_mm | 300 | mm | assumed | Q-034 |
| w5.wheel_mass_kg | 9 | kg | assumed | Q-034 |
| w5.axle_teeth | 45 |  | assumed | Q-034 |
| cost.w5_wheel_jpy | 12000 | JPY | assumed | Q-034 |
| cost.spr420_45t_jpy | 3000 | JPY | assumed | Q-034 |
| sm.lift_mm | 218 | mm | assumed | Q-029 |
| lay.front_drum_dia_mm | 110 | mm | assumed | Q-037 |
| w5.out_teeth | 12 |  | assumed | Q-034 |
| dsn.battery_mass_kg | 2.1 | kg | sourced | M74 |
| yr.tyre_dia_mm | 470 | mm | assumed | Q-036 |
| yr.rear_width_mm | 240 | mm | assumed | Q-036 |
| yr.front_width_mm | 178 | mm | assumed | Q-036 |
| lay.ski_gap_mm | 30 | mm | calculated | docs/03-design.md#winter |
| yr.wheel_mass_kg | 6 | kg | assumed | Q-036 |
| w6.chain_mass_kg | 2 | kg | assumed | Q-036 |
| cost.spr420_42t_jpy | 3000 | JPY | assumed | Q-036 |
| cost.atv_wheels_set_jpy | 26800 | JPY | sourced | M96 |
| cost.atv_knuckle_pair_jpy | 9380 | JPY | sourced | M92 |
| cost.atv_drum_hub_jpy | 9080 | JPY | sourced | M93 |
| cost.front_drum_allow_jpy | 3000 | JPY | assumed | Q-037 |
| cost.lcd_meter_jpy | 3980 | JPY | sourced | M94 |
| cost.atv_fender_pair_jpy | 4660 | JPY | sourced | M95 |
| cost.ski_bracket_make_jpy | 6000 | JPY | assumed | Q-037 |
| cost.atv_sporty50_jpy | 298000 | JPY | sourced | M97 |
| cost.atv_sl50w_kit_jpy | 168000 | JPY | sourced | M98 |
| cost.atv_sl50w_built_jpy | 198000 | JPY | sourced | M98 |
| cost.atv_used_low_jpy | 60000 | JPY | sourced | M99 |
| cost.atv_used_high_jpy | 160000 | JPY | sourced | M99 |
| lay.pivot_x_mm | 175 | mm | calculated | docs/03-design.md#suspension |
| lay.shock_low_x_mm | 55 | mm | calculated | docs/03-design.md#suspension, D-043 |
| lay.shock_low_rise_mm | 15 | mm | calculated | docs/03-design.md#suspension, D-043 |
| lay.rising_knee_z_mm | 360 | mm | calculated | docs/03-design.md#frame, D-043 |
| lay.post_y_mm | 75 | mm | calculated | docs/03-design.md#frame |
| sus.bump_mm | 40 | mm | calculated | docs/03-design.md#suspension |
| sus.droop_mm | 30 | mm | calculated | docs/03-design.md#suspension |
| sus.freq_hz | 2.5 | Hz | assumed | Q-039 |
| shock.rear_eye_mm | 290 | mm | sourced | M100 |
| shock.stroke_mm | 50 | mm | assumed | Q-039 |
| dsn.frame_safety_min | 1.5 |  | assumed | Q-017 |
| cost.rear_shock_jpy | 7980 | JPY | sourced | M100 |
| cost.ucp206_jpy | 1903 | JPY | sourced | M101 |
| cost.chain_tensioner_jpy | 2600 | JPY | sourced | M103 |
| cost.tube_38x23_jpy_per_m | 2000 | JPY | assumed | Q-018 |
| load.bump_g | 3.5 |  | sourced | P72 |
| load.brake_g | 1.5 |  | sourced | P72 |
| load.lateral_g | 1.5 |  | sourced | P72 |
| load.twist_rough | 1.8 |  | sourced | S8 |
| load.combined_vert_g | 2.0 |  | assumed | Q-040 |
| load.combined_brake_g | 1.0 |  | assumed | Q-040 |
| load.combined_lat_g | 1.0 |  | assumed | Q-040 |
| load.impact_g | 5.0 |  | assumed | Q-040 |
| load.hoop_crush_n_per_kg | 20 | N/kg | sourced | P76 |
| load.hoop_side_g | 1.0 |  | assumed | Q-040 |
| load.accident_safety_min | 1.0 |  | assumed | Q-040 |
| land.tyre_eff | 0.47 |  | sourced | S9 |
| land.shock_eff | 0.5 |  | sourced | S9 |
| land.tyre_defl_mm | 50 | mm | assumed | Q-040 |
| land.drop_ref_mm | 150 | mm | assumed | Q-040 |
| fat.cat_tube_mpa | 71 | MPa | sourced | S10 |
| fat.cat_fillet_mpa | 40 | MPa | sourced | S10 |
| fat.gamma_mf | 1.35 |  | assumed | Q-040 |
| fat.range_g | 1.0 |  | assumed | Q-040 |
| atv.clear_youth_low_mm | 84 | mm | sourced | P78 |
| atv.clear_youth_high_mm | 120 | mm | sourced | P78 |
| atv.clear_sport_small_mm | 145 | mm | sourced | P79 |
| atv.clear_utility_mm | 292 | mm | sourced | P80 |
| brg.ucp207_h_mm | 47.6 | mm | assumed | Q-039 |
| brg.ucp207_l_mm | 167 | mm | assumed | Q-039 |
| brg.ucp207_h2_mm | 93 | mm | assumed | Q-039 |
| brg.ucp207_mass_kg | 1.6 | kg | assumed | Q-039 |
| cost.ucp207_jpy | 2400 | JPY | assumed | Q-039 |
| cost.tube_48x23_jpy_per_m | 2300 | JPY | assumed | Q-018 |
| lay.front_shock_y_mm | 210 | mm | calculated | docs/03-design.md#front-suspension, D-041 |
| lay.front_shock_top_y_mm | 145 | mm | calculated | docs/03-design.md#front-suspension, D-041 |
| lay.front_shock_x_mm | 0 | mm | calculated | docs/03-design.md#front-suspension, D-041 |
| lay.kpi_deg | 10 | deg | calculated | docs/03-design.md#front-suspension, P81, P82 |
| lay.caster_deg | 4 | deg | calculated | docs/03-design.md#front-suspension, P82 |
| lay.fa_lower_joint_z_mm | 150 | mm | calculated | docs/03-design.md#front-suspension, D-038 |
| lay.fa_upper_joint_z_mm | 370 | mm | calculated | docs/03-design.md#front-suspension |
| lay.fa_pivot_front_x_mm | 120 | mm | calculated | docs/03-design.md#front-suspension |
| lay.fa_pivot_rear_x_mm | 110 | mm | calculated | docs/03-design.md#front-suspension |
| lay.fa_lower_pivot_y_mm | 115 | mm | calculated | docs/03-design.md#front-suspension |
| lay.fa_lower_pivot_z_mm | 185 | mm | calculated | docs/03-design.md#front-suspension |
| lay.fa_upper_pivot_y_mm | 100 | mm | calculated | docs/03-design.md#front-suspension |
| lay.fa_upper_pivot_z_mm | 390 | mm | calculated | docs/03-design.md#front-suspension |
| lay.steer_arm_mm | 90 | mm | assumed | Q-044 |
| lay.steer_arm_z_mm | 250 | mm | assumed | Q-044 |
| lay.steer_arm_angle_deg | 15 | deg | calculated | docs/03-design.md#steering |
| lay.tie_inner_y_mm | 50 | mm | calculated | docs/03-design.md#steering |
| lay.nose_lower_y_mm | 65 | mm | calculated | docs/03-design.md#frame, D-041 |
| lay.nose_post_offset_mm | 45 | mm | calculated | docs/03-design.md#frame, D-041 |
| lay.bumper_half_mm | 150 | mm | calculated | docs/03-design.md#frame, D-042 |
| lay.nose_top_z_mm | 440 | mm | calculated | docs/03-design.md#frame, D-041 |
| shock.front_eye_mm | 290 | mm | sourced | M100 |
| dsn.farm_od_mm | 31.8 | mm | calculated | docs/03-design.md#front-suspension |
| dsn.farm_t_mm | 2.3 | mm | calculated | docs/03-design.md#front-suspension |
| dsn.farm_upper_od_mm | 25.4 | mm | calculated | docs/03-design.md#stress-map |
| dsn.farm_upper_t_mm | 1.6 | mm | calculated | docs/03-design.md#stress-map |
| dsn.box_od_mm | 31.8 | mm | calculated | docs/03-design.md#stress-map |
| dsn.box_t_mm | 2.3 | mm | calculated | docs/03-design.md#stress-map |
| fat.life_kcycles_min | 2000 |  | assumed | Q-040 |
| cost.atv_aarm_kit_jpy | 72703 | JPY | sourced | M104 |
| cost.tube_60x32_jpy_per_m | 3500 | JPY | assumed | Q-018 |
| cost.atv_aarm_set_jpy | 19380 | JPY | sourced | M105 |
| cost.ball_joint_pair_jpy | 4790 | JPY | sourced | M106 |
| form.mass_total_kg | 170 | kg | calculated | docs/02-form.md#mass |
| snow.wheel_sinkage_min_cm | 63.2 | cm | calculated | docs/02-form.md#snow |
| snow.wheel_sinkage_max_cm | 83.8 | cm | calculated | docs/02-form.md#snow |
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
| drive.engine_ratio | 7.98 |  | calculated | docs/02-form.md#drive |
| drive.engine_thrust_n | 497 | N | calculated | docs/02-form.md#drive |
| drive.engine_thrust_cont_n | 427 | N | calculated | docs/02-form.md#drive |
| drive.motor_thrust_n | 122 | N | calculated | docs/02-form.md#drive |
| drive.motor2_thrust_n | 233 | N | calculated | docs/02-form.md#drive |
| drive.clutch_engage_kmh | 15.6 | km/h | calculated | docs/02-form.md#drive |
| drive.clutch_lock_kmh | 20.3 | km/h | calculated | docs/02-form.md#drive |
| drive.climb_force_n | 523 | N | calculated | docs/02-form.md#drive |
| drive.grass_power_kw | 1.85 | kW | calculated | docs/02-form.md#drive |
| drive.power_avg_heavy_w | 556 | W | calculated | docs/02-form.md#drive |
| battery.run_time_heavy_min | 133 | min | calculated | docs/02-form.md#drive |
| drive.sprocket_reach_mm | 0 | mm | calculated | docs/02-form.md#drive |
| hull.sheet_kg | 12.4 | kg | calculated | docs/02-form.md#water |
| hull.foam_m3 | 0.173 | m3 | calculated | docs/02-form.md#water |
| hull.foam_share | 0.37 |  | calculated | docs/02-form.md#water |
| hull.mass_kg | 17.0 | kg | calculated | docs/02-form.md#water |
| water.draft_mm | 191 | mm | calculated | docs/02-form.md#water |
| water.freeboard_mm | 159 | mm | calculated | docs/02-form.md#water |
| water.gm_m | -0.006 | m | calculated | docs/02-form.md#water |
| water.load_rating_kg | 94 | kg | calculated | docs/02-form.md#water |
| water.depth_for_rider_mm | 364 | mm | calculated | docs/02-form.md#water |
| water.persons_rated | 0 |  | calculated | docs/02-form.md#water |
| water.persons_index | 0.59 |  | calculated | docs/02-form.md#water |
| water.beam_for_one_mm | 1170 | mm | calculated | docs/02-form.md#water |
| sm.mass_kg | 145.2 | kg | calculated | docs/02-form.md#snowmobile |
| sm.rear_share | 0.56 |  | calculated | docs/02-form.md#snowmobile |
| sm.track_pressure_kpa | 3.19 | kPa | calculated | docs/02-form.md#snowmobile |
| sm.ski_pressure_kpa | 7.33 | kPa | calculated | docs/02-form.md#snowmobile |
| sm.hull_pressure_kpa | 1.78 | kPa | calculated | docs/02-form.md#snowmobile |
| sm.track_sinkage_max_cm | 9.6 | cm | calculated | docs/02-form.md#snowmobile |
| sm.ski_sinkage_max_cm | 12.1 | cm | calculated | docs/02-form.md#snowmobile |
| sm.hull_sinkage_max_cm | 7.3 | cm | calculated | docs/02-form.md#snowmobile |
| sm.clutch_lock_kmh | 1.6 | km/h | calculated | docs/02-form.md#snowmobile |
| sm.top_speed_kmh | 11.4 | km/h | calculated | docs/02-form.md#snowmobile |
| sm.power_snow_kw | 0.74 | kW | calculated | docs/02-form.md#snowmobile |
| sm.cg_height_m | 0.74 | m | calculated | docs/02-form.md#snowmobile |
| sm.tip_ratio | 0.51 |  | calculated | docs/02-form.md#snowmobile |
| sm.length_min_m | 1.94 | m | calculated | docs/02-form.md#snowmobile |
| sm.skip_speed_kmh | 29 | km/h | calculated | docs/02-form.md#snowmobile |
| w4.share_min | 0.2 |  | calculated | docs/02-form.md#snowmobile |
| w4.wheel_sink_cm | 18.9 | cm | calculated | docs/02-form.md#snowmobile |
| w4.grip_n | 452 | N | calculated | docs/02-form.md#snowmobile |
| w4.resistance_n | 271 | N | calculated | docs/02-form.md#snowmobile |
| w4.resistance_bekker_n | 507 | N | calculated | docs/02-form.md#snowmobile |
| w4.wheel_drop_mm | 139 | mm | calculated | docs/02-form.md#snowmobile |
| w4.tyre_dia_min_mm | 377 | mm | calculated | docs/02-form.md#snowmobile |
| w4.dual_share_min | 0.15 |  | calculated | docs/02-form.md#snowmobile |
| w4.dual_wheel_sink_cm | 13.2 | cm | calculated | docs/02-form.md#snowmobile |
| w4.dual_grip_n | 510 | N | calculated | docs/02-form.md#snowmobile |
| w4.dual_resistance_bekker_n | 447 | N | calculated | docs/02-form.md#snowmobile |
| w4.big_wheel_sink_cm | 17.5 | cm | calculated | docs/02-form.md#snowmobile |
| w4.big_grip_n | 475 | N | calculated | docs/02-form.md#snowmobile |
| w4.big_resistance_bekker_n | 452 | N | calculated | docs/02-form.md#snowmobile |
| w4.big_dual_wheel_sink_cm | 12.2 | cm | calculated | docs/02-form.md#snowmobile |
| w4.big_dual_grip_n | 527 | N | calculated | docs/02-form.md#snowmobile |
| w4.big_dual_resistance_bekker_n | 401 | N | calculated | docs/02-form.md#snowmobile |
| w4.dual_width_m | 1.62 | m | calculated | docs/02-form.md#snowmobile |
| st.cg_height_m | 0.578 | m | calculated | docs/02-form.md#straddle |
| st.tip_ratio | 0.76 |  | calculated | docs/02-form.md#straddle |
| st.pitch_ratio | 0.82 |  | calculated | docs/02-form.md#straddle |
| st.length_m | 1.54 | m | calculated | docs/02-form.md#straddle |
| st.width_m | 1.07 | m | calculated | docs/02-form.md#straddle |
| st.child_fit_margin_mm | -7 | mm | calculated | docs/02-form.md#straddle |
| mtt.tow_pull_packed_n | 285 | N | calculated | docs/02-form.md#mtt |
| mtt.tow_sled_kg | 145 | kg | calculated | docs/02-form.md#mtt |
| mtt.tow_power_kw | 0.81 | kW | calculated | docs/02-form.md#mtt |
| mtt.crawler180_pair_kpa | 8.4 | kPa | calculated | docs/02-form.md#mtt |
| mtt.crawler300_kpa | 5.0 | kPa | calculated | docs/02-form.md#mtt |
| mtt.crawler300_pair_kpa | 2.5 | kPa | calculated | docs/02-form.md#mtt |
| yr.lift_mm | 72 | mm | calculated | docs/02-form.md#tyres |
| yr.track_max_mm | 930 | mm | calculated | docs/02-form.md#tyres |
| yr.tip_ratio | 0.84 |  | calculated | docs/02-form.md#tyres |
| yr.pitch_ratio | 0.86 |  | calculated | docs/02-form.md#tyres |
| yr.length_m | 1.58 | m | calculated | docs/02-form.md#tyres |
| w5.pitch_ratio_all_year | 0.74 |  | calculated | docs/02-form.md#tyres |
| w5.length_all_year_m | 1.72 | m | calculated | docs/02-form.md#tyres |
| yr.front_tyre_sink_cm | 23.1 | cm | calculated | docs/02-form.md#tyres |
| yr.front_tyre_resist_n | 257 | N | calculated | docs/02-form.md#tyres |
| yr.ski_sink_cm | 11.0 | cm | calculated | docs/02-form.md#tyres |
| yr.ski_resist_n | 81 | N | calculated | docs/02-form.md#tyres |
| yr.rear_grip_n | 666 | N | calculated | docs/02-form.md#tyres |
| yr.rear_resist_n | 669 | N | calculated | docs/02-form.md#tyres |
| yr.ski_inside_tip_ratio | 0.7 |  | calculated | docs/02-form.md#tyres |
| yr.ski_outside_tip_ratio | 0.98 |  | calculated | docs/02-form.md#tyres |
| tri.tip_ratio | 0.43 |  | calculated | docs/02-form.md#tyres |
| tri.cg_height_max_m | 0.47 | m | calculated | docs/02-form.md#tyres |
| cost.tub_jpy | 83397 | JPY | calculated | docs/02-form.md#water |
| cost.winter_sm_jpy | 237397 | JPY | calculated | docs/02-form.md#snowmobile |
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
| dsn.width_m | 1.1 | m | calculated | docs/03-design.md#layout |
| dsn.width_transport_m | 1.1 | m | calculated | docs/03-design.md#transport |
| dsn.shock_top_x_mm | -8 | mm | calculated | docs/03-design.md#suspension |
| dsn.stem_rake_deg | 23.4 | deg | calculated | docs/03-design.md#steering |
| dsn.tie_z_mm | 282 | mm | calculated | docs/03-design.md#front-suspension |
| dsn.stem_top_tube_gap_mm | 21 | mm | calculated | docs/03-design.md#frame |
| dsn.tube_main_m | 7.38 | m | calculated | docs/03-design.md#frame |
| dsn.tube_box_m | 2.92 | m | calculated | docs/03-design.md#frame |
| dsn.tube_cross_m | 4.56 | m | calculated | docs/03-design.md#frame |
| dsn.tube_roll_m | 1.63 | m | calculated | docs/03-design.md#rollbar |
| dsn.tube_arm_m | 1.12 | m | calculated | docs/03-design.md#suspension |
| dsn.hub_bearing_gap_mm | 196 | mm | calculated | docs/03-design.md#axle |
| dsn.ratio_top | 25.8 |  | calculated | docs/03-design.md#drive |
| dsn.ratio | 85.5 |  | calculated | docs/03-design.md#drive |
| dsn.top_speed_kmh | 29.19 | km/h | calculated | docs/03-design.md#drive |
| dsn.chain420_centre_mm | 306 | mm | calculated | docs/03-design.md#drive |
| dsn.chain420_links | 76 |  | calculated | docs/03-design.md#drive |
| dsn.chain_centre_change_mm | 1.8 | mm | calculated | docs/03-design.md#suspension |
| dsn.chain_takeup_mm | 6 | mm | calculated | docs/03-design.md#drive |
| dsn.unit_front_x_mm | 800 | mm | calculated | docs/03-design.md#drive |
| dsn.low_point_mm | 150 | mm | calculated | docs/03-design.md#axle |
| dsn.tie_rod_length_mm | 216 | mm | calculated | docs/03-design.md#steering |
| dsn.bar_lock_deg | 22.1 | deg | calculated | docs/03-design.md#steering |
| dsn.steer_outer_deg | 17.9 | deg | calculated | docs/03-design.md#steering |
| dsn.steer_outer_ideal_deg | 23.1 | deg | calculated | docs/03-design.md#steering |
| dsn.steer_outer_alt_deg | 23.3 | deg | calculated | docs/03-design.md#steering |
| dsn.bump_steer_alt_deg | 1.74 | deg | calculated | docs/03-design.md#steering |
| dsn.turn_radius_m | 2.27 | m | calculated | docs/03-design.md#steering |
| dsn.turn_radius_outer_m | 3.75 | m | calculated | docs/03-design.md#steering |
| dsn.saddle_thickness_mm | 44 | mm | calculated | docs/03-design.md#fit |
| dsn.child_fit_margin_mm | 23 | mm | calculated | docs/03-design.md#fit |
| dsn.seat_drop_adult_mm | 420 | mm | calculated | docs/03-design.md#fit |
| dsn.pan_mass_kg | 2.0 | kg | calculated | docs/03-design.md#winter |
| dsn.ski_y_mm | 221 | mm | calculated | docs/03-design.md#winter |
| dsn.mass_kg | 142.9 | kg | calculated | docs/03-design.md#mass |
| dsn.cg_x_m | 0.474 | m | calculated | docs/03-design.md#mass |
| dsn.cg_y_m | -0.0 | m | calculated | docs/03-design.md#mass |
| dsn.cg_z_m | 0.307 | m | calculated | docs/03-design.md#mass |
| dsn.frame_mass_kg | 25.9 | kg | calculated | docs/03-design.md#frame |
| dsn.rear_share_adult | 0.57 |  | calculated | docs/03-design.md#mass |
| dsn.cg_side_adult_mm | 0 | mm | calculated | docs/03-design.md#mass |
| dsn.cg_height_adult_m | 0.531 | m | calculated | docs/03-design.md#mass |
| dsn.tip_ratio_adult | 0.75 |  | calculated | docs/03-design.md#stability |
| dsn.pitch_ratio_adult | 0.88 |  | calculated | docs/03-design.md#stability |
| dsn.rear_share_child | 0.558 |  | calculated | docs/03-design.md#mass |
| dsn.cg_side_child_mm | 0 | mm | calculated | docs/03-design.md#mass |
| dsn.cg_height_child_m | 0.353 | m | calculated | docs/03-design.md#mass |
| dsn.tip_ratio_child | 1.13 |  | calculated | docs/03-design.md#stability |
| dsn.pitch_ratio_child | 1.36 |  | calculated | docs/03-design.md#stability |
| dsn.winter_mass_kg | 152.9 | kg | calculated | docs/03-design.md#winter |
| dsn.winter_cg_height_m | 0.515 | m | calculated | docs/03-design.md#winter |
| dsn.winter_rear_share | 0.563 |  | calculated | docs/03-design.md#winter |
| dsn.winter_tip_ratio | 0.62 |  | calculated | docs/03-design.md#stability |
| dsn.winter_pitch_ratio | 0.92 |  | calculated | docs/03-design.md#stability |
| dsn.winter_ski_pressure_kpa | 7.52 | kPa | calculated | docs/03-design.md#winter |
| dsn.belly_height_mm | 150 | mm | calculated | docs/03-design.md#winter |
| dsn.motion_ratio | 0.62 |  | calculated | docs/03-design.md#suspension |
| dsn.motion_ratio_droop | 0.73 |  | calculated | docs/03-design.md#suspension |
| dsn.motion_ratio_bump | 0.47 |  | calculated | docs/03-design.md#suspension |
| dsn.rear_sprung_kg | 111.3 | kg | calculated | docs/03-design.md#suspension |
| dsn.rear_wheel_rate_n_mm | 27.5 | N/mm | calculated | docs/03-design.md#suspension |
| dsn.shock_spring_n_mm | 72 | N/mm | calculated | docs/03-design.md#suspension |
| dsn.rear_sag_mm | 40 | mm | calculated | docs/03-design.md#suspension |
| dsn.shock_force_static_n | 1770 | N | calculated | docs/03-design.md#suspension |
| dsn.shock_length_static_mm | 265 | mm | calculated | docs/03-design.md#suspension |
| dsn.shock_stroke_used_mm | 46 | mm | calculated | docs/03-design.md#suspension |
| dsn.shock_travel_mm | 42 | mm | calculated | docs/03-design.md#suspension |
| dsn.axle_rail_gap_mm | 133 | mm | calculated | docs/03-design.md#suspension |
| dsn.front_motion_ratio | 0.48 |  | calculated | docs/03-design.md#front-suspension |
| dsn.front_sprung_kg | 42.5 | kg | calculated | docs/03-design.md#front-suspension |
| dsn.front_wheel_rate_n_mm | 10.5 | N/mm | calculated | docs/03-design.md#front-suspension |
| dsn.front_shock_spring_n_mm | 45 | N/mm | calculated | docs/03-design.md#front-suspension |
| dsn.front_shock_force_static_n | 867 | N | calculated | docs/03-design.md#front-suspension |
| dsn.front_shock_length_static_mm | 271 | mm | calculated | docs/03-design.md#front-suspension |
| dsn.front_shock_length_droop_mm | 285 | mm | calculated | docs/03-design.md#front-suspension |
| dsn.front_shock_stroke_used_mm | 38 | mm | calculated | docs/03-design.md#front-suspension |
| dsn.front_camber_change_deg | 1.2 | deg | calculated | docs/03-design.md#front-suspension |
| dsn.front_track_change_mm | 14.1 | mm | calculated | docs/03-design.md#front-suspension |
| dsn.bump_steer_deg | 0.46 | deg | calculated | docs/03-design.md#front-suspension |
| dsn.bump_steer_lock_deg | 1.14 | deg | calculated | docs/03-design.md#front-suspension |
| dsn.scrub_radius_mm | 69 | mm | calculated | docs/03-design.md#front-suspension |
| dsn.trail_mm | 16 | mm | calculated | docs/03-design.md#front-suspension |
| dsn.climb_force_n | 748 | N | calculated | docs/03-design.md#climb |
| dsn.climb_grip_n | 703 | N | calculated | docs/03-design.md#climb |
| dsn.climb_thrust_n | 1343 | N | calculated | docs/03-design.md#climb |
| dsn.climb_grade_max_pct | 17.5 | % | calculated | docs/03-design.md#climb |
| dsn.axle_chain_pull_n | 3898 | N | calculated | docs/03-design.md#axle |
| dsn.axle_stress_mpa | 166 | MPa | calculated | docs/03-design.md#axle |
| dsn.axle_safety | 2.08 |  | calculated | docs/03-design.md#axle |
| dsn.bearing_load_n | 679 | N | calculated | docs/03-design.md#axle |
| dsn.nose_bay_stress_mpa | 59 | MPa | calculated | docs/03-design.md#frame |
| dsn.rail_stress_mpa | 124 | MPa | calculated | docs/03-design.md#frame |
| dsn.rail_safety | 2.33 |  | calculated | docs/03-design.md#frame |
| dsn.arm_stress_mpa | 89 | MPa | calculated | docs/03-design.md#suspension |
| dsn.arm_safety | 3.27 |  | calculated | docs/03-design.md#suspension |
| dsn.impact_safety | 1.63 |  | calculated | docs/03-design.md#loads |
| dsn.hoop_crush_safety | 2.51 |  | calculated | docs/03-design.md#loads |
| dsn.hoop_side_safety | 3.54 |  | calculated | docs/03-design.md#loads |
| dsn.shock_force_bump_n | 5672 | N | calculated | docs/03-design.md#suspension |
| dsn.frame_deflection_mm | 0.9 | mm | calculated | docs/03-design.md#frame |
| dsn.fatigue_range_mpa | 36 | MPa | calculated | docs/03-design.md#loads |
| dsn.fatigue_limit_tube_mpa | 39 | MPa | calculated | docs/03-design.md#loads |
| dsn.fatigue_g_tube | 1.09 |  | calculated | docs/03-design.md#loads |
| dsn.fatigue_kcycles_tube | 0 |  | calculated | docs/03-design.md#loads |
| dsn.fatigue_limit_fillet_mpa | 22 | MPa | calculated | docs/03-design.md#loads |
| dsn.fatigue_g_fillet | 0.61 |  | calculated | docs/03-design.md#loads |
| dsn.fatigue_kcycles_fillet | 1148 |  | calculated | docs/03-design.md#loads |
| dsn.fatigue_life_ratio | 99.0 |  | calculated | docs/03-design.md#loads |
| dsn.landing_front_g | 4.6 |  | calculated | docs/03-design.md#loads |
| dsn.landing_rear_g | 4.6 |  | calculated | docs/03-design.md#loads |
| dsn.drop_front_at_bump_mm | 85 | mm | calculated | docs/03-design.md#loads |
| dsn.drop_rear_at_bump_mm | 85 | mm | calculated | docs/03-design.md#loads |
| dsn.clearance_mm | 150 | mm | calculated | docs/03-design.md#clearance |
| dsn.clearance_no_pan_mm | 156 | mm | calculated | docs/03-design.md#clearance |
| dsn.breakover_deg | 31.0 | deg | calculated | docs/03-design.md#clearance |
| dsn.breakover_no_pan_deg | 32.2 | deg | calculated | docs/03-design.md#clearance |
| dsn.clearance_bump_rear_mm | 116 | mm | calculated | docs/03-design.md#clearance |
| dsn.brake_decel_needed | 5.79 | m/s2 | calculated | docs/03-design.md#brake |
| dsn.brake_torque_needed_nm | 330 | N m | calculated | docs/03-design.md#brake |
| dsn.brake_rear_alone_decel | 3.21 | m/s2 | calculated | docs/03-design.md#brake |
| dsn.brake_clamp_needed_n | 2801 | N | calculated | docs/03-design.md#brake |
| dsn.brake_front_torque_needed_nm | 102 | N m | calculated | docs/03-design.md#brake |
| dsn.brake_downhill_decel_rear | 0.12 | m/s2 | calculated | docs/03-design.md#brake |
| dsn.brake_downhill_decel | 2.4 | m/s2 | calculated | docs/03-design.md#brake |
| dsn.brake_downhill_stop_m | 14.4 | m | calculated | docs/03-design.md#brake |
| dsn.delica_width_margin_mm | 130 | mm | calculated | docs/03-design.md#transport |
| dsn.height_m | 1.02 | m | calculated | docs/03-design.md#layout |
| dsn.delica_height_margin_mm | 110 | mm | calculated | docs/03-design.md#transport |
| dsn.length_m | 1.58 | m | calculated | docs/03-design.md#layout |
| dsn.delica_length_margin_mm | 30 | mm | calculated | docs/03-design.md#transport |
| dsn.bom_parts_jpy | 316599 | JPY | calculated | docs/03-design.md#cost |
| dsn.bom_tools_jpy | 34056 | JPY | calculated | docs/03-design.md#cost |
| dsn.clashes_summer | 76 |  | calculated | docs/03-design.md#issues |
| dsn.clashes_winter | 76 |  | calculated | docs/03-design.md#issues |
| dsn.tie_rod_change_heave_mm | 0.6 | mm | calculated | docs/03-design.md#front-suspension |
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
| P35 | P | Road Transport Vehicle Act enforcement regulations (道路運送車両法施行規則), article 1 and table 1, e-Gov | full |
| P36 | P | Safety standards for road vehicles (道路運送車両の保安基準), articles 59 to 67, e-Gov | full |
| P37 | P | MLIT detailed technical notice, articles 255 to 270-3 and attachment 98 | partial |
| P38 | P | Road Traffic Act, its order and regulations (道路交通法, 施行令, 施行規則), e-Gov | full |
| P39 | P | National Police Agency, minicar review meeting, first session material, 2026-03-26 | full |
| P40 | P | Saitama City, declaration of a modified moped (改造申告書) | full |
| P41 | P | Local Tax Act (地方税法), article 448, e-Gov | partial |
| P42 | P | GIROJ, compulsory automobile liability insurance base rates from 2026-11-01 | partial |
| P43 | P | Honda, Tact specifications (factbook 2015) | full |
| P44 | P | Honda news, Super Cub 50 and 110, 2017 | partial |
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
| M63 | M | Yahoo Auctions closed listings for AF79 engines (Honda Tact 50) | partial |
| M64 | M | Yahoo Auctions closed listings for AA09 engines (Honda Super Cub 50) | partial |
| M65 | M | Kitaco multi-reflector headlamp unit 800-1083100 | full |
| M66 | M | Daytona LED slim tail lamp with number plate lamp, Yahoo Shopping | partial |
| M67 | M | Generic 12 V turn signal sets of four, Yahoo Shopping | partial |
| M68 | M | Kitaco LED flasher relay 755-2409900 and generic handlebar switches, Yahoo Shopping | partial |
| M69 | M | Kijima red reflector 305-2160, Yahoo Shopping | partial |
| M70 | M | Kitaco GPR mirror type 1 | excerpt |
| M71 | M | Mitsuba UC flat horn UCH-201, Yahoo Shopping | partial |
| M72 | M | Daytona VELONA speedometer 44196 and non-contact speed sensor 90666 | full |
| M73 | M | Suzuki Alto rear head restraint 86401-64L11-ELZ, Yahoo Shopping | partial |
| M74 | M | GS Yuasa GTZ6V battery (Tact AF79 standard), kakaku.com | partial |
| M75 | M | DID chain 420D-120L and 420 sprockets (Kitaco 30T, CK Custom 15T), Yahoo Shopping | partial |
| M76 | M | Yahoo Auctions closed listings for AF79 parts vehicles (Honda Tact) | partial |
| M77 | M | Generic moped number plate stay CL935, Yahoo Shopping | partial |
| M78 | M | Generic three-point seat belts and anchor bolts, Yahoo Shopping | partial |
| P45 | P | Ordinance for Enforcement of the Act on Ship Officers and Boat Operators (326M50000800091), article 2 paragraph 2 item 1, and MLIT Notice 1528 of 2003 | partial |
| P46 | P | Ordinance for Enforcement of the Ship Safety Act (338M50000800041), article 1 paragraph 4 and article 2 paragraph 2 item 1, with Ministry of Transport Notice 56 of 1980 | partial |
| P47 | P | Ordinance on the Registration of Small Vessels (414M60000800004), article 2 item 1 | partial |
| P48 | P | MLIT and JCI pages on licence-free boats, inspection, and life jackets | partial |
| P49 | P | Kinki District Transport Bureau, modified mini boats | full |
| P50 | P | Vehicle Restriction Order (336CO0000000265), article 8, and the River Act (339AC0000000167) article 29 with its Enforcement Order (340CO0000000014) article 16-4 | partial |
| P51 | P | Yamaha BR250F service manual, specifications, on manualslib | excerpt |
| P55 | P | Small Vessel Safety Rules (349M50000800036), articles 4, 40 to 45, 58, 70, 82, 102, and 103 | partial |
| P56 | P | Ship Safety Act (308AC0000000011) articles 5, 6, 10, and 18, and its Enforcement Ordinance articles 18, 24, 32, 35, and 66 with appended table 1 | partial |
| P57 | P | MLIT, outline of the small boat operator licence | excerpt |
| P58 | P | MLIT Notice 243 of 2002, waters exempt from small vessel registration | full |
| P59 | P | CRREL Report 95-1, Cold Regions Mobility Models (traction on snow), with ERDC/CRREL TR-11-9 | partial |
| P60 | P | ERDC/CRREL TR-16-4, Advances in Antarctic Sled Technology, 2016 | partial |
| P61 | P | AIST human body dimension database 1991-92 (Kouchi and Mochimaru 2005, H16PRO 287), stature and sitting height | full |
| P62 | P | OECD Code 7 (February 2025), rear-mounted foldable roll-over protective structures, section 3.7 | partial |
| P63 | P | Shackleton, South (1919), Project Gutenberg 5199 | partial |
| P64 | P | Shackleton, The Heart of the Antarctic, vol. 1 (1909), archive.org | partial |
| P65 | P | Patents for sleds pushed by sprung spiked wheels or drums - AT81336B (1917), US1567776 (1925), US136750 (1873) | full |
| P66 | P | Consumer Goods (Quad Bikes) Safety Standard 2019 (Australia, F2019L01321), as made | partial |
| P67 | P | ACCC, Quad bike safety - final recommendation to the Minister, February 2019 | partial |
| P68 | P | UNSW Newsroom, workplace survey of quad bike use highlights rollover risks, 2017-06-06 | full |
| P69 | P | US youth ATV categories, ANSI/SVIA 1 as cited in the Federal Register (2012-4385) and a Polaris owner's manual, with the University of Iowa parents' guide | partial |
| P70 | P | MLIT, safety standard amendment for three- and four-wheel mopeds (2018) and article 66-2 of the safety standards | full |
| P71 | P | Minato City, what a minicar is (FAQ, updated 2025-02-12) | full |
| S3 | S | Wikipedia, Yamaha Bravo | full |
| S4 | S | Wikipedia, Ground pressure | full |
| S7 | S | PowerSportsGuide, 120 cc snowmobiles and Yamaha snowmobile horsepower | partial |
| M79 | M | Micromobility Japan, electric snow bike SIN EV, seated and standing models | full |
| M80 | M | Yahoo Auctions closed listings for used snowmobiles, tracks, and sprockets | partial |
| M81 | M | Sharmax S500 motor tug, rolf.ru | full |
| P52 | P | 33 CFR 183 Subpart C, safe loading of monohull boats under 20 ft (eCFR) | full |
| P53 | P | US8002596B2, amphibious vehicle track propulsion (Google Patents) | partial |
| P54 | P | Milcon, EPS method technical data | full |
| S5 | S | Wikipedia, Snowmobile skipping | full |
| S6 | S | Wikipedia, M113 armored personnel carrier and Bandvagn 206 | excerpt |
| M82 | M | MonotaRO, Takiron UHMW-PE sheet | partial |
| M83 | M | Cainz, Styrofoam IB extruded polystyrene board 910 x 1,820 mm | full |
| M84 | M | HAIGE electric outboard HS-50703-90, Yahoo Shopping | partial |
| M85 | M | Argo Frontier 650 6x6 2023 and Sherp Pro specifications | full |
| M86 | M | Kenki Parts Store, snowblower rubber crawler 180 x 60 x 28 with steel cores | full |
| M87 | M | Kenki Parts Store, snowblower rubber crawler 300 x 72 x 36 with steel cores | full |
| M88 | M | MTT-154 20 in technical specifications, 2020 (archived) | full |
| M89 | M | Baltmotors Snowdog Sport and Trail, and Sharmax S380 Ultra motor tugs | full |
| M90 | M | 50 cc buggies sold in Japan as minicars - ATV-MAX SL50W (goo-bike dealer stock) and the MAGMAX50 and 4CROSS50 press releases | full |
| M91 | M | Kawasaki KFX50, KFX90, and Brute Force 300, Yamaha YFZ50, and Honda TRX250X specifications | full |
| M92 | M | ATV steering knuckles with 17 mm spindles for drum brake hubs, pair, Yahoo Shopping | partial |
| M93 | M | ATV front brake drum hub, three studs on 78 mm, one side, Yahoo Shopping | partial |
| M94 | M | LCD motorcycle meter DC 12 V with odometer and speed sensor, Yahoo Shopping | partial |
| M95 | M | Plastic rear fenders for trikes and ATVs, pair, Yahoo Shopping | partial |
| M96 | M | ATV 8 in tubeless wheels with tyres, 19x7.00-8 front and 18x9.50-8 rear, set of four, Yahoo Shopping | partial |
| M97 | M | Access Motor Sporty 50, road-legal 50 cc ATV, Loft Japan | full |
| M98 | M | ATV-MAX SL50W at an ATV shop, GooBike stock list | full |
| M99 | M | Yahoo Auctions closed listings for 50 cc ATVs and buggies with papers | partial |
| M100 | M | Rear shock absorber for motorcycles, scooters, and ATVs, 240 to 290 mm, Yahoo Shopping | partial |
| M101 | M | FYH pillow block UCP206, Yahoo Shopping | excerpt |
| M103 | M | Chain tensioner with a spring roller for 420, 428, and 530 chain, Yahoo Shopping | partial |
| P72 | P | Riley and George, Design, Analysis and Testing of a Formula SAE Car Chassis, SAE 2002-01-3300 | partial |
| P73 | P | Singh, Structural Performance Analysis of Formula SAE Car, Jurnal Mekanikal 31, 2010 | partial |
| P74 | P | Bennett and others, SAE Mini Baja Frame Analysis, Northern Arizona University, 2014 | full |
| P75 | P | Devi and Dilip, Design and Optimisation of SAE Mini Baja Chassis, IJERA 4(9), 2014 | full |
| P76 | P | NIOSH, CROPS Massey Ferguson 135 testing information, to SAE J2194, 2021 | partial |
| P77 | P | Yamaha YFZ50 2023 specifications | full |
| P78 | P | Suzuki QuadSport Z50 2026 | full |
| P79 | P | Honda TRX250X 2023 specifications | full |
| P80 | P | Yamaha Grizzly EPS 2026 specifications | full |
| S8 | S | Ibrahim, Loads on Vehicle Structures, course chapter 9 | full |
| S9 | S | Irvine, Aircraft Landing Gear Dynamic Analysis, Vibrationdata | full |
| S10 | S | EN 1993-1-9 tables 8.6 and 8.7 on hollow sections, secondary copy | partial |
| S11 | S | IDEA StatiCa, Fatigue analysis according to EN 1993-1-9 | full |
| M104 | M | Front suspension kit for ATVs - upper and lower A-arms, knuckles, spindles, hubs, and 340 mm shocks, Yahoo Shopping | partial |
| P81 | P | Yamaha YFM50S Raptor 50 service manual | partial |
| P82 | P | Yamaha YFM90RA Raptor 90 service manual | partial |
| P83 | P | Honda TRX90X 2023 specifications | full |
| P84 | P | Kawasaki KFX90 2024 specification sheet | full |
| P85 | P | Blazer 110P (Tao Tao ATA110B class) parts schematic | full |
| P86 | P | Kymco MXU 50 workshop manual | partial |
| S12 | S | Wikipedia, Swing axle | full |
| F6 | F | DIY Go Karts forum, tyre alignment issues with shock compression | full |
| M105 | M | Front upper and lower A-arm set 285 mm for 49 to 110 cc ATVs, Yahoo Shopping | full |
| M106 | M | Front A-arm ball joints for buggies, pair, Yahoo Shopping | full |
| F1 | F | Motor1, a shifter kart turned into a snowmobile, 2025-02-02 | partial |
| F2 | F | 6x6world forum, Argo open water speed with outboard | full |
| F3 | F | Goo-net Magazine, an electric track unit from Canada (MTT, My Track Technology), 2016-10-14 | full |
| F4 | F | Commercial Motor, A novel Girling tractor for the Imperial Antarctic Expedition, 1914-09-17 | full |
| F5 | F | Za Rulem, Iz snezhnogo plena (out of snow captivity), November 2007 | full |
| P87 | P | Road Transport Vehicle Act enforcement regulations (道路運送車両法施行規則), article 62-3, type approval of mopeds, e-Gov | full |
| P88 | P | Road Transport Vehicle Act (道路運送車両法), articles 44 and 58, e-Gov | partial |
| P89 | P | City of Yokohama, mopeds and the light vehicle tax (原動機付自転車), registration of a modified or made vehicle | partial |
| P90 | P | City of Kyoto, form 15, declaration of a modified moped (改造申立書) | full |
| P91 | P | NALTEC examination rules, attachment TRIAS 99-017-02, electric motor maximum and rated output test (電動機最高出力及び定格出力試験) | partial |
| P92 | P | MLIT, guideline and application handbook for confirming small electric mopeds (特定小型・一般小型原動機付自転車の性能等確認) | partial |
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
| K-006 | T2 | refute | fail | 2026-11-04 |
| K-007 | T2 | refute | pass | 2026-11-04 |
| K-008 | T2 | refute | pass | 2026-11-04 |
| K-009 | T2 | refute | pass | 2026-11-04 |
| K-010 | T2 | refute | pass | 2026-11-04 |
| K-011 | T2 | refute | pass | 2026-11-04 |
| K-012 | T2 | refute | pass | 2026-11-04 |
| K-013 | T2 | refute | fail | 2026-11-04 |
| K-014 | T2 | refute | partial | 2026-11-04 |
| K-015 | T2 | refute | partial | 2026-11-04 |
| K-016 | T2 | refute | partial | 2026-11-04 |
| K-017 | T2 | refute | partial | 2026-11-05 |
| K-018 | T2 | refute | partial | 2026-11-05 |
| K-019 | T2 | refute | partial | 2026-11-05 |
| K-020 | T2 | refute | partial | 2026-11-05 |
<!-- tdr:end -->

## Parts {#parts}

<!-- tdr:table kind=part fields=id,name,parent -->
| id | name | parent |
|---|---|---|
| kart | Kart |  |
| chassis | Chassis | kart |
| frame | Welded tube frame | chassis |
| bumpers | Front bumper and side nerf bars | chassis |
| seat | Seat | chassis |
| guards | Chain and axle guards | chassis |
| steering | Steering | kart |
| tie_rods | Tie rods with rod ends | steering |
| front_arms | Front A-arms - an upper and a lower arm each side, hinged on the nose box, the knuckle between their ends (D-041) | steering |
| front_shocks | Front shock absorbers with their coil springs, one per side, from the lower arm to the nose box's top rail (D-041) | steering |
| spindles | ATV steering knuckles with 17 mm spindles and steering arms, between the A-arms' joints | steering |
| front_wheels | Front wheels and tyres | kart |
| rear_axle | Rear live axle | kart |
| swing_arm | Rear swing arm carrying the axle's two bearings, pivoted on the frame just behind the engine unit (D-036) | rear_axle |
| rear_shock | Rear shock absorber with its coil spring between the swing arm and the frame (D-036) | rear_axle |
| axle_shaft | Axle shaft | rear_axle |
| axle_bearings | Axle bearings | rear_axle |
| rear_hubs | Rear wheel hubs that slide along the axle | rear_axle |
| rear_wheels | Rear wheels and tyres | kart |
| brake | Rear disc brake with its carrier | kart |
| powertrain | Powertrain | kart |
| engine | Engine unit of a 50 cc four-stroke scooter, with its CVT, centrifugal clutch, final reduction, ECU, fuel pump, and silencer | powertrain |
| chain_final | Drive chain from the engine unit's output to the axle, with both sprockets and the axle sprocket's carrier | powertrain |
| throttle | Throttle cable with a return spring | powertrain |
| kill_switch | Engine stop switches, one on the steering and one with a tether | powertrain |
| winter | Winter parts | kart |
| skis | Skis bolted to the steering knuckles inside the front wheels, adjustable in height (W6) | winter |
| snow_chains | Rear tyre chains for winter (W6) | winter |
| roll_bar | Protective hoop behind the seat, against crushing in a rollover (R-19) | chassis |
| road | Road equipment | kart |
| lighting | Head lamp, tail and stop lamp, number plate lamp, reflector, and turn signals | road |
| mirrors | Mirrors on both sides | road |
| horn | Horn | road |
| speedometer | Speedometer with odometer | road |
| hand_brake | Second brake system - cable drum brakes in the front hubs from the left lever, and a lock on the rear lever as the parking brake | road |
| battery | 12 V battery for the engine's ECU and the lamps | road |
| number_plate | Number plate and its bracket | road |
| sled_pan | Sled pan of UHMW polyethylene under the frame, with foam, kept in both forms | chassis |
| future_water | Future water version, not required (D-027) | kart |
| side_floats | Side floats on arms, for a future water version | future_water |
| outboard | Electric outboard with its battery, for a future water version | future_water |
| handlebar | The donor scooter's handlebar with its throttle grip, two brake levers, and switches, on a raked stem | steering |
| footrests | Footboards beside the engine unit, with raised steps for a child | chassis |
| fenders | Fenders over the four tyres (R-30) | chassis |
<!-- tdr:end -->

## Interfaces {#interfaces}

<!-- tdr:table kind=interface fields=id,between,carries -->
| id | between | carries |
|---|---|---|
| I-05 | chain_final, axle_shaft | power |
| I-06 | axle_shaft, rear_hubs | power |
| I-07 | rear_hubs, rear_wheels | power |
| I-08 | brake, axle_shaft | power |
| I-11 | engine, frame | load |
| I-12 | axle_bearings, swing_arm | load |
| I-13 | axle_shaft, axle_bearings | load |
| I-14 | spindles, frame | load |
| I-15 | front_wheels, spindles | load |
| I-19 | throttle, engine | other |
| I-23 | tie_rods, spindles | other |
| I-24 | kill_switch, engine | signal |
| I-25 | skis, spindles | load |
| I-27 | bumpers, frame | load |
| I-28 | guards, frame | load |
| I-30 | engine, chain_final | power |
| I-31 | roll_bar, frame | load |
| I-34 | battery, engine | power |
| I-35 | battery, lighting | power |
| I-36 | hand_brake, brake | other |
| I-37 | speedometer, rear_wheels | signal |
| I-38 | horn, battery | power |
| I-39 | mirrors, roll_bar | load |
| I-40 | number_plate, frame | load |
| I-46 | sled_pan, frame | load |
| I-47 | snow_chains, rear_wheels | load |
| I-48 | handlebar, tie_rods | load |
| I-49 | handlebar, frame | load |
| I-50 | footrests, frame | load |
| I-51 | fenders, frame | load |
| I-52 | seat, engine | load |
| I-53 | swing_arm, frame | load |
| I-54 | rear_shock, swing_arm | load |
| I-55 | rear_shock, frame | load |
| I-56 | front_arms, frame | load |
| I-57 | front_arms, spindles | load |
| I-58 | front_shocks, front_arms | load |
| I-59 | front_shocks, frame | load |
<!-- tdr:end -->
