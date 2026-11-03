// Parts of the kart as the 3D view draws them, and the record's value keys each part
// stands for. The navigator and the 3D view share this table, as the bread oven's
// navigator shares its part ids: selecting a value lights its part, and picking a part
// selects its values. A key pattern ending in '*' matches every key that starts with it.
// `mesh` matches the names of the groups that kart-model.js and main.js give the part.

export const PARTS = [
  { id: 'frame', label: 'Frame', mesh: /^(frame|floor)/,
    keys: ['kart.wheelbase_rough_mm', 'kart.length_rough_mm', 'kart.clearance_rough_mm', 'kart.mass_rough_kg',
      'kart.axle_part_low_rough_mm', 'form.track_min_m', 'form.track_min_slope_m', 'form.width_overall_m',
      'form.mass_total_kg', 'frame.*', 'cost.tube_*', 'cost.chassis_jpy', 'cost.axle_*', 'cost.allow_guards_mounts_jpy'] },
  { id: 'tyres', label: 'Tyres and wheels', mesh: /^wheel/,
    keys: ['tyre.*', 'ground.crr_*', 'ground.mu_paved', 'ground.mu_gravel', 'ground.mu_grass', 'cost.tyres_set_jpy',
      'cost.tyre_each_cheap_jpy', 'snow.wheel_*', 'snow.crrel_*', 'snow.density_*', 'drive.climb_force_n'] },
  { id: 'steering', label: 'Steering', mesh: /^(steering|front-steer)/,
    keys: ['cost.steering_kit_jpy', 'cost.steering_cheap_jpy'] },
  { id: 'seat', label: 'Seat and pedals', mesh: /^seat/,
    keys: ['seat.*', 'cost.seat_jpy', 'cost.seat_cheap_jpy', 'cost.allow_controls_jpy'] },
  { id: 'engine', label: 'Engine and drive', mesh: /^engine/,
    keys: ['engine.*', 'clutch.*', 'tc.*', 'sprocket.*', 'drive.*', 'motor.*', 'motor2.*', 'battery.*',
      'cost.engine_*', 'cost.clutch_jpy', 'cost.power_*', 'cost.tc_kit_jpy', 'cost.motor*', 'cost.battery_*',
      'cost.charger*', 'cost.allow_reduction_jpy', 'cost.allow_drive_chains_jpy', 'cost.allow_electric_jpy',
      'kart.speed_max_kmh', 'kart.speed_child_kmh', 'kart.run_time_min'] },
  { id: 'skis', label: 'Front skis (W1, W2)', mesh: /^ski/,
    keys: ['ski.*', 'snow.ski_*', 'cost.allow_skis_jpy'] },
  { id: 'chains', label: 'Rear chains (W1)', mesh: /^chains/,
    keys: ['ground.mu_snow_chains', 'ground.mu_ice_chains', 'cost.snow_chain_jpy', 'cost.winter_skis_chains_jpy'] },
  { id: 'tracks', label: 'Rear tracks (W2)', mesh: /^track/,
    keys: ['track.*', 'snow.track_*', 'snow.snowmobile_pressure_kpa', 'snow.bekker_*', 'cost.track_jpy',
      'cost.allow_track_gear_jpy', 'cost.winter_tracks_jpy'] },
  { id: 'rider', label: 'Rider', mesh: /^(rider|head)/,
    keys: ['rider.*'] },
  { id: 'cg', label: 'Centre of mass', mesh: /^cg/,
    keys: ['form.cg_height_m', 'kart.cg_height_rough_m', 'kart.tip_ratio_min', 'kart.rear_share'] },
  { id: 'delica', label: 'Delica D:5 cargo space', mesh: /^delica/,
    keys: ['delica.*', 'form.width_overall_m', 'kart.length_rough_mm'] },
];

const byId = new Map(PARTS.map((p) => [p.id, p]));
const matches = (pattern, key) => (pattern.endsWith('*') ? key.startsWith(pattern.slice(0, -1)) : key === pattern);

export function partById(id) { return byId.get(id) || null; }

// Part ids that stand for a value key
export function partsForKey(key) {
  return PARTS.filter((p) => p.keys.some((k) => matches(k, key))).map((p) => p.id);
}

// The record's value keys a part stands for, from the list of all keys
export function keysForPart(id, allKeys) {
  const p = byId.get(id);
  return p ? allKeys.filter((key) => p.keys.some((k) => matches(k, key))) : [];
}

// The part id of a three.js object, from its own name or its nearest named ancestor
export function partOfObject(obj) {
  for (let o = obj; o; o = o.parent) {
    if (!o.name) continue;
    const hit = PARTS.find((p) => p.mesh.test(o.name));
    if (hit) return hit.id;
  }
  return null;
}

// Where in the 3D view an item is best seen: scene, and setup if it matters
const REQ_VIEW = {
  'R-01': { scene: 'yard' }, 'R-04': { scene: 'yard' }, 'R-05': { scene: 'yard', setup: 'w1' },
  'R-06': { scene: 'yard', setup: 'w2' }, 'R-09': { scene: 'yard' }, 'R-12': { scene: 'inspect' },
  'R-14': { scene: 'delica' }, 'R-15': { scene: 'delica' }, 'R-16': { scene: 'yard' }, 'R-17': { scene: 'yard' },
};
export function viewForItem(kind, id) {
  if (kind === 'req') return REQ_VIEW[id] || null;
  if (kind === 'part') {
    if (id === 'delica') return { scene: 'delica' };
    if (id === 'skis' || id === 'chains') return { scene: 'inspect', setup: 'w1' };
    if (id === 'tracks') return { scene: 'inspect', setup: 'w2' };
    return { scene: 'inspect' };
  }
  if (kind === 'value') {
    if (id.startsWith('delica.')) return { scene: 'delica' };
    if (id.startsWith('form.') || id.startsWith('kart.') || id.startsWith('tyre.') || id.startsWith('seat.')) return { scene: 'inspect' };
    if (id.startsWith('ski.')) return { scene: 'inspect', setup: 'w1' };
    if (id.startsWith('track.')) return { scene: 'inspect', setup: 'w2' };
    if (id.startsWith('snow.') || id.startsWith('ground.')) return { scene: 'yard' };
  }
  return null;
}
