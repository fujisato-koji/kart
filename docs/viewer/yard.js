// The test yard of the go-kart simulator. Pure module: no DOM, no three.js.
//
// Coordinates in metres: x east, z south, y up; the origin is the centre of the yard.
// Every design number (the grade, the snow depth) comes from the parameters `p`
// (docs/viewer/params.js). The layout below (zone corners, the length of the ramp)
// is a drawing of the yard, not a design number; it is exported as LAYOUT so that the
// screen can say "model constant, not in the record".

// Layout of the 80 m by 60 m yard. Model constants, not in the record.
export const LAYOUT = {
  size: { x0: -40, x1: 40, z0: -30, z1: 30 },
  // The ramp inside the long-grass zone: rises from rampZ0 to rampZ1, plateau after.
  rampX0: -10, rampX1: 10, rampZ0: 0, rampZ1: 20,
  // Width of the ramp's sloping side edges (inside the zone, so the ground stays continuous).
  flank: 1.5,
};

const smooth = (t) => { const c = Math.min(1, Math.max(0, t)); return c * c * (3 - 2 * c); };
const dsmooth = (t) => (t <= 0 || t >= 1 ? 0 : 6 * t * (1 - t));

export function makeYard(p) {
  const L = LAYOUT;
  const grade = p.limits.grade; // rise per run
  const run = L.rampZ1 - L.rampZ0;
  const slope = { x0: L.rampX0, x1: L.rampX1, z0: L.rampZ0, z1: L.rampZ1, grade, rise: grade * run };
  const zones = [
    { id: 'paved', label: 'Paved', surface: 'paved', x0: -40, x1: 0, z0: -30, z1: -5 },
    { id: 'gravel', label: 'Gravel', surface: 'gravel', x0: 0, x1: 40, z0: -30, z1: -5 },
    { id: 'grass', label: 'Grass', surface: 'grass', x0: -40, x1: -10, z0: -5, z1: 30 },
    { id: 'grassLong', label: 'Long grass with ramp', surface: 'grassLong', x0: -10, x1: 10, z0: -5, z1: 30 },
    { id: 'snowPacked', label: 'Packed snow', surface: 'snowPacked', x0: 10, x1: 25, z0: -5, z1: 30 },
    { id: 'snowFresh', label: 'Fresh snow', surface: 'snowFresh', x0: 25, x1: 40, z0: -5, z1: 30 },
  ];

  // side blend of the ramp: 0 at the zone edge, 1 from `flank` metres inside
  function wx(x) {
    const a = (x - L.rampX0) / L.flank, b = (L.rampX1 - x) / L.flank;
    return smooth(a) * smooth(b);
  }
  function dwx(x) {
    const a = (x - L.rampX0) / L.flank, b = (L.rampX1 - x) / L.flank;
    return (dsmooth(a) * smooth(b) - smooth(a) * dsmooth(b)) / L.flank;
  }
  const profile = (z) => grade * Math.min(run, Math.max(0, z - L.rampZ0));
  const inRamp = (x) => x > L.rampX0 && x < L.rampX1;

  function surfaceAt(x, z) {
    const s = L.size;
    const cx = Math.min(s.x1, Math.max(s.x0, x)), cz = Math.min(s.z1, Math.max(s.z0, z));
    for (const zn of zones) {
      if (cx >= zn.x0 && cx <= zn.x1 && cz >= zn.z0 && cz <= zn.z1) return zn.surface;
    }
    return 'grass';
  }
  return {
    size: { ...L.size },
    zones,
    slope,
    heightAt: (x, z) => (inRamp(x) ? profile(z) * wx(x) : 0),
    gradAt: (x, z) => {
      if (!inRamp(x)) return [0, 0];
      const inZ = z > L.rampZ0 && z < L.rampZ1;
      return [profile(z) * dwx(x), inZ ? grade * wx(x) : 0];
    },
    surfaceAt,
    snowDepthAt: (x, z) => (surfaceAt(x, z) === 'snowFresh' ? p.snow.depth : 0),
  };
}

// Unbounded test yard, flat, one surface everywhere.
export function flatYard(p, surface) {
  return inclineYard(p, surface, 0);
}

// Unbounded test yard, one surface, ground rising toward +z at `grade` (rise per run).
export function inclineYard(p, surface, grade) {
  return {
    size: { x0: -1e6, x1: 1e6, z0: -1e6, z1: 1e6 },
    zones: [{ id: surface, label: surface, surface, x0: -1e6, x1: 1e6, z0: -1e6, z1: 1e6 }],
    slope: { x0: -1e6, x1: 1e6, z0: -1e6, z1: 1e6, grade, rise: 0 },
    heightAt: (x, z) => grade * z,
    gradAt: () => [0, grade],
    surfaceAt: () => surface,
    snowDepthAt: () => (surface === 'snowFresh' ? p.snow.depth : 0),
  };
}
