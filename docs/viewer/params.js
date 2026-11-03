// Map the record (docs/data/record.json) to the dimensions and constants that the
// 3D view and the simulator use. Every number comes from a value key of the record;
// nothing is typed in here. `prov` tells, for each parameter, which key it came from,
// so that the screen can show where a number comes from.

export async function loadRecord(url = '../data/record.json') {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`cannot read ${url}: ${res.status}`);
  return res.json();
}

export function makeParams(record) {
  const values = new Map(record.values.map((v) => [v.key, v]));
  const prov = {};
  const used = new Set();
  // val(path, key, scale): read a key, remember where the parameter came from
  function val(path, key, scale = 1) {
    const item = values.get(key);
    if (!item) throw new Error(`value ${key} is not in the record`);
    prov[path] = key;
    used.add(key);
    return Number(item.v) * scale;
  }

  const mm = 0.001;
  const geom = {
    wheelbase: val('geom.wheelbase', 'kart.wheelbase_rough_mm', mm),
    track: val('geom.track', 'form.track_min_m'),
    length: val('geom.length', 'kart.length_rough_mm', mm),
    tyreD: val('geom.tyreD', 'tyre.dia_mm', mm),
    tyreW: val('geom.tyreW', 'tyre.width_mm', mm),
    clearance: val('geom.clearance', 'kart.clearance_rough_mm', mm),
    axleLow: val('geom.axleLow', 'kart.axle_part_low_rough_mm', mm),
    seatAboveFloor: val('geom.seatAboveFloor', 'seat.above_floor_rough_m'),
    skiW: val('geom.skiW', 'ski.width_mm', mm),
    skiL: val('geom.skiL', 'ski.contact_length_mm', mm),
    trackW: val('geom.trackW', 'track.width_mm', mm),
    trackWheelD: val('geom.trackWheelD', 'track.wheel_dia_mm', mm),
    trackLoop: val('geom.trackLoop', 'track.pitch_mm', mm) * val('geom.trackLinks', 'track.links'),
  };

  const mass = {
    kart: val('mass.kart', 'kart.mass_rough_kg'),
    adult: val('mass.adult', 'rider.mass_max_kg'),
    child: val('mass.child', 'rider.mass_child_kg'),
    kartCg: val('mass.kartCg', 'kart.cg_height_rough_m'),
    adultCgAboveSeat: val('mass.adultCgAboveSeat', 'rider.cg_above_seat_m'),
    childCgAboveSeat: val('mass.childCgAboveSeat', 'rider.cg_above_seat_child_m'),
    rearShare: val('mass.rearShare', 'kart.rear_share'),
  };

  const drive = {
    powerMax: val('drive.powerMax', 'engine.power_max_kw', 1000), // W
    rpmRated: val('drive.rpmRated', 'engine.speed_rated_rpm'),
    rpmNoLoad: val('drive.rpmNoLoad', 'engine.speed_noload_rpm'),
    rpmEngage: val('drive.rpmEngage', 'clutch.engage_rpm'),
    rpmLock: val('drive.rpmLock', 'clutch.lock_rpm'),
    ratio: val('drive.ratio', 'drive.engine_ratio'),
    eta: val('drive.eta', 'drive.efficiency'),
    vMax: val('drive.vMax', 'kart.speed_max_kmh', 1 / 3.6), // m/s
    vChild: val('drive.vChild', 'kart.speed_child_kmh', 1 / 3.6),
  };

  // Rolling resistance (crr) and grip (mu) by surface
  const surfaces = {
    paved: { crr: val('surf.paved.crr', 'ground.crr_paved'), mu: val('surf.paved.mu', 'ground.mu_paved') },
    gravel: { crr: val('surf.gravel.crr', 'ground.crr_gravel'), mu: val('surf.gravel.mu', 'ground.mu_gravel') },
    grass: { crr: val('surf.grass.crr', 'ground.crr_grass'), mu: val('surf.grass.mu', 'ground.mu_grass') },
    grassLong: { crr: val('surf.grassLong.crr', 'ground.crr_max'), mu: val('surf.grassLong.mu', 'ground.mu_grass') },
    snowPacked: {
      crr: val('surf.snowPacked.crr', 'ground.crr_snow_packed'),
      mu: val('surf.snowPacked.mu', 'ground.mu_snow'),
      muChains: val('surf.snowPacked.muChains', 'ground.mu_snow_chains'),
    },
    ice: {
      crr: val('surf.ice.crr', 'ground.crr_snow_packed'),
      mu: val('surf.ice.mu', 'ground.mu_ice'),
      muChains: val('surf.ice.muChains', 'ground.mu_ice_chains'),
    },
    snowFresh: {
      crr: val('surf.snowFresh.crr', 'ground.crr_snow_fresh'),
      mu: val('surf.snowFresh.mu', 'ground.mu_snow'),
      muChains: val('surf.snowFresh.muChains', 'ground.mu_snow_chains'),
      crrTrack: val('surf.snowFresh.crrTrack', 'track.crr_snow_fresh'),
    },
  };

  const snow = {
    depth: val('snow.depth', 'snow.depth_max_cm', 0.01),
    wheelSinkMin: val('snow.wheelSinkMin', 'snow.wheel_sinkage_min_cm', 0.01),
    wheelSinkMax: val('snow.wheelSinkMax', 'snow.wheel_sinkage_max_cm', 0.01),
    trackSinkBelt: val('snow.trackSinkBelt', 'snow.track_sinkage_max_cm', 0.01),
    trackSinkWheels: val('snow.trackSinkWheels', 'snow.track_sinkage_wheels_cm', 0.01),
    skiSink: val('snow.skiSink', 'snow.ski_sinkage_max_cm', 0.01),
    ploughPerCm: val('snow.ploughPerCm', 'snow.plough_per_cm'),
    skiMuLateral: val('snow.skiMuLateral', 'ski.mu_lateral'),
  };

  const limits = {
    tipRatio: val('limits.tipRatio', 'kart.tip_ratio_min'),
    stopDist: val('limits.stopDist', 'kart.stop_distance_max_m'),
    grade: val('limits.grade', 'site.grade_max_pct', 0.01),
  };

  const delica = {
    cargoLength: val('delica.cargoLength', 'delica.cargo_length_mm', mm),
    cargoWidthMax: val('delica.cargoWidthMax', 'delica.cargo_width_max_mm', mm),
    cargoWidthMin: val('delica.cargoWidthMin', 'delica.cargo_width_min_mm', mm),
    cargoHeight: val('delica.cargoHeight', 'delica.cargo_height_mm', mm),
    openingWidthMin: val('delica.openingWidthMin', 'delica.opening_width_min_mm', mm),
    openingWidthMax: val('delica.openingWidthMax', 'delica.opening_width_max_mm', mm),
    lip: val('delica.lip', 'delica.lip_height_mm', mm),
  };

  return { geom, mass, drive, surfaces, snow, limits, delica, prov, used: [...used], values };
}

// Centre of mass height above the ground for a rider ('adult' or 'child')
export function cgHeight(p, rider) {
  const m = rider === 'child' ? p.mass.child : p.mass.adult;
  const above = rider === 'child' ? p.mass.childCgAboveSeat : p.mass.adultCgAboveSeat;
  const seat = p.geom.clearance + p.geom.seatAboveFloor;
  return (p.mass.kart * p.mass.kartCg + m * (seat + above)) / (p.mass.kart + m);
}
