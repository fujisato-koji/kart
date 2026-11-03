// Parts of the kart, by the ids of record/parts.yaml, and the record's value keys each
// part stands for. The navigator and the 3D view share this table, as the bread oven's
// navigator shares its part ids: selecting a value lights its part, and picking a part
// selects its values. docs/data/design.json draws each item under one of these part ids.
// A key pattern ending in '*' matches every key that starts with it.

export const PART_KEYS = {
  frame: ['lay.wheelbase_mm', 'lay.rail_*', 'lay.front_*', 'lay.rear_overhang_mm', 'dsn.rail_*', 'dsn.cross_*',
    'dsn.tube_*', 'dsn.frame_mass_kg', 'dsn.length_m', 'dsn.width_m', 'dsn.height_m', 'cost.tube_*',
    'cost.sq_tube_25_jpy_per_m', 'cost.flat_bar_jpy_per_m', 'dsn.stkm11a_tensile_mpa', 'dsn.load_factor'],
  floor: ['dsn.floor_t_mm', 'cost.plate_allow_jpy'],
  bumpers: ['cost.padding_jpy'],
  seat: ['lay.hpoint_*', 'dsn.seat_mass_kg', 'cost.seat_*', 'rider.*', 'dsn.leg_margin_*', 'dsn.buttock_heel_*'],
  seat_slide: ['lay.seat_slide_mm', 'cost.seat_rail_pair_jpy'],
  pedal_box: ['lay.pedal_x_*', 'cost.pedal_kit_jpy'],
  guards: ['cost.punched_sheet_jpy'],
  steering_wheel: ['lay.wheel_x_mm', 'lay.wheel_z_mm', 'cost.steering_wheel_jpy'],
  steering_column: ['cost.ucfl204_jpy', 'dsn.steering_mass_kg'],
  tie_rods: ['rod.*', 'cost.rod_end_jpy'],
  spindles: ['lay.track_front_mm', 'lay.steer_max_deg', 'dsn.turn_radius_m', 'cost.spindle_pair_jpy'],
  front_wheels: ['whl.*', 'cost.front_hub_jpy', 'dsn.wheel_mass_kg'],
  axle_shaft: ['dsn.axle_*', 'lay.axle_length_mm', 'dsn.s45c_yield_mpa', 'cost.axle_shaft_jpy', 'cost.machining_allow_jpy'],
  axle_bearings: ['brg.ucp205_*', 'lay.bearing_y_mm', 'dsn.bearing_load_n', 'cost.ucp205_jpy'],
  rear_hubs: ['lay.track_rear_*', 'cost.rear_hub_make_jpy', 'dsn.width_transport_m'],
  rear_wheels: ['whl.*', 'cost.tyres_set_jpy', 'dsn.wheel_mass_kg', 'dsn.climb_grip_n', 'dsn.low_point_mm'],
  brake: ['lay.disc_dia_mm', 'lay.brake_y_mm', 'dsn.brake_*', 'dsn.pad_mu', 'cost.brake_hyd_jpy', 'kart.stop_distance_max_m'],
  engine: ['eng.*', 'engine.*', 'lay.engine_*', 'cost.engine_*', 'dsn.climb_thrust_n', 'dsn.top_speed_kmh'],
  clutch: ['clutch.*', 'gear.t_clutch', 'cost.clutch_jpy', 'drive.clutch_*'],
  jackshaft: ['lay.jack_*', 'gear.t_jack_*', 'brg.ucp204_*', 'spr.t40_*', 'spr.t12_*', 'cost.spr_t40_jpy',
    'cost.spr_t12_jpy', 'cost.shaft20_jpy', 'cost.ucp204_jpy'],
  chain_primary: ['lay.chain1_y_mm', 'dsn.chain1_*', 'cost.chain_3m_jpy'],
  chain_final: ['lay.chain2_y_mm', 'dsn.chain2_*', 'gear.t_axle', 'spr.t36_*', 'cost.spr_t36_jpy', 'dsn.ratio'],
  throttle: ['cost.throttle_cable_jpy'],
  kill_switch: ['cost.kill_*'],
  skis: ['ski.*', 'snow.ski_*', 'cost.uhmw_order_jpy'],
  snow_chains: ['ground.mu_snow_chains', 'ground.mu_ice_chains', 'cost.snow_chain_jpy'],
};

const matches = (pattern, key) => (pattern.endsWith('*') ? key.startsWith(pattern.slice(0, -1)) : key === pattern);

// Part ids that stand for a value key
export function partsForKey(key) {
  return Object.keys(PART_KEYS).filter((id) => PART_KEYS[id].some((k) => matches(k, key)));
}

// The record's value keys a part stands for, from the list of all keys
export function keysForPart(id, allKeys) {
  const pats = PART_KEYS[id] || [];
  return allKeys.filter((key) => pats.some((k) => matches(k, key)));
}

// The part id of a three.js object: the nearest ancestor whose userData.part is set
export function partOfObject(obj) {
  for (let o = obj; o; o = o.parent) if (o.userData && o.userData.part) return o.userData.part;
  return null;
}

// The setup of the 3D view that shows an item best
export function viewForItem(kind, id) {
  if (kind === 'part') {
    if (id === 'skis' || id === 'snow_chains') return { config: 'winter' };
    if (id === 'rear_hubs') return { config: 'transport' };
    return null;
  }
  if (kind === 'req') {
    if (id === 'R-05' || id === 'R-06') return { config: 'winter' };
    if (id === 'R-14' || id === 'R-15') return { config: 'transport', delica: true };
    if (id === 'R-03') return { rider: 'child' };
  }
  return null;
}
