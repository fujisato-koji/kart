// Simple go-kart simulator: one rigid body on a yard, no DOM, no three.js.
// Every design number comes from the parameters `p` (docs/viewer/params.js).
// Constants that are not in the record are in MODEL (model constants, not in the record).
//
// CONVENTIONS
//   Units SI. x east, z south, y up. heading 0 = +x; positive heading turns toward +z
//   (seen from above with north at the top this is a turn to the right). The forward
//   unit vector is t = (cos h, sin h); the "left-of-travel for positive yaw" normal is
//   n = (-sin h, cos h): the centre of a turn with positive yaw rate lies on +n.
//   Steering angle > 0 turns toward +n. state.latAccel = v * yawRate (positive toward +n).
//
// SIMPLIFICATIONS (all deliberate)
//   - Weight is split by p.mass.rearShare, plus longitudinal load transfer from the grade and the
//     previous sub-step's acceleration (rear drive grip and rear brakes use the rear load).
//   - No aerodynamic drag. The rear axle has its own speed; the tyre force saturates at grip (wheels spin or lock).
//   - Sideways sliding is not simulated: lateral demand is capped at front grip (understeer)
//     and tipping is checked against the geometry.
//   - Tracks (W2) are taken as chains for grip (muChains) on snow and ice.
//   - Skis and tracks use the surface crr on non-snow surfaces.

import { cgHeight } from './params.js';
import { flatYard, inclineYard } from './yard.js';

export const G = 9.81; // m/s2, physical constant
export const SETUPS = ['summer', 'w1', 'w2'];

// Model constants, not in the record.
export const MODEL = {
  steerLock: 0.5,       // rad, front wheel or ski steering lock
  steerRate: 1.5,       // rad/s, how fast the steering angle follows the input
  engineInertia: 0.05,  // kg m2, engine plus clutch drum
  idleRpm: 1400,        // rpm, engine speed with the throttle closed (below clutch engage)
  engineDrag: 1.0,      // N m, engine friction that slows it down with the throttle closed
  maxDt: 0.005,         // s, largest integration sub-step (200 Hz)
  vEps: 0.01,           // m/s, speed below which the kart counts as at rest
  stuckSpeed: 0.1,      // m/s, speed below which "stuck" is considered
  stuckTime: 1,         // s, how long the drive force must fail before "stuck" is set
  // Rear axle and tyre. The inertia is chosen as: two rear wheels with tyres (about 3 kg each at 0.7 m r^2,
  // r = 0.165 m, 0.057 kg m2 each) plus axle and sprocket (about 0.03 kg m2), rounded up.
  wheelInertia: 0.15,   // kg m2, rear wheels + axle + sprocket
  axleDt: 0.0005,       // s, axle integration step (stability: grip r^2 / (kappaPeak slipSpeed I) * dt < 1)
  kappaPeak: 0.15,      // slip ratio at which the tyre force reaches grip (linear below, flat above)
  slipSpeed: 1.0,       // m/s, floor of the speed in the slip ratio denominator
  spinKappa: 0.3,       // slip ratio above which the rear wheels are counted as spinning
  brakeTorque: 400,     // N m, rear axle brake torque at full pedal (enough to lock the wheels)
  tipMarginCap: 99,     // tipMargin shown when there is almost nothing to tip it
};

const RPM2RAD = (2 * Math.PI) / 60;
// One-variable motion with Coulomb-type resistance R (x: speed or angular speed, M: mass or inertia).
// Holds at rest when |F| <= R, and does not let R reverse the motion.
function coulomb(x, F, R, M, h, eps) {
  if (Math.abs(x) < eps && Math.abs(F) <= R) return 0;
  const dir = Math.abs(x) >= eps ? Math.sign(x) : Math.sign(F);
  const xn = x + (h * (F - dir * R)) / M;
  if (x !== 0 && xn * x < 0 && Math.abs(F) <= R) return 0;
  return xn;
}
const clamp = (x, a, b) => Math.min(b, Math.max(a, x));
const SNOWY = new Set(['snowPacked', 'snowFresh', 'ice']);

export function createKart(p, opts = {}) {
  const o = { setup: 'summer', rider: 'adult', childLimit: false, trackSink: 'wheels', ...opts };
  if (!SETUPS.includes(o.setup)) throw new Error(`unknown setup ${o.setup}`);
  const m = p.mass.kart + (o.rider === 'child' ? p.mass.child : p.mass.adult);
  const cg = cgHeight(p, o.rider);
  const r = p.geom.tyreD / 2;
  const L = p.geom.wheelbase;
  const chained = o.setup !== 'summer'; // W1 chains, W2 tracks taken as chains
  const skis = o.setup !== 'summer';

  // Engine. Torque is powerMax / omega_rated below rated speed and falls linearly to
  // zero at no-load speed. The child limit moves both speeds by vChild / vMax (a lower
  // governor setting); the torque stays that of the unlimited engine.
  const k = o.childLimit ? p.drive.vChild / p.drive.vMax : 1;
  const nRated = p.drive.rpmRated * k;
  const nNoLoad = p.drive.rpmNoLoad * k;
  const Tr = p.drive.powerMax / (p.drive.rpmRated * RPM2RAD);
  const torqueCurve = (n) => (n <= nRated ? Tr : n >= nNoLoad ? 0 : (Tr * (nNoLoad - n)) / (nNoLoad - nRated));
  const wheelForce = (Tc) => (Tc * p.drive.ratio * p.drive.eta) / r;

  // Snow sinkage at full depth, by part
  const rearSinkFull = o.setup === 'w2'
    ? (o.trackSink === 'belt' ? p.snow.trackSinkBelt : p.snow.trackSinkWheels)
    : p.snow.wheelSinkMax;
  const frontSinkFull = skis ? p.snow.skiSink : p.snow.wheelSinkMax;

  const state = {};
  let stuckTimer = 0;
  let aPrev = 0; // longitudinal acceleration of the previous sub-step (explicit lag, used for load transfer)
  let last = {};

  function reset({ x = 0, z = 0, heading = 0, v = 0, yard = null } = {}) {
    Object.assign(state, {
      x, y: yard ? yard.heightAt(x, z) : 0, z, heading, v, yawRate: 0, steer: 0,
      engineRpm: MODEL.idleRpm, clutch: 'idle', slipTime: 0, slipEnergy: 0,
      surface: yard ? yard.surfaceAt(x, z) : '', gradeAlong: 0, gradeCross: 0, latAccel: 0,
      tipMargin: MODEL.tipMarginCap, tipped: false, frontLift: false, wheelOmega: v / r, wheelSlip: 0, wheelSpin: false, spinTime: 0, rearLoadShare: p.mass.rearShare, stuck: false, sinkage: 0, ploughing: false,
      distance: 0, time: 0,
    });
    stuckTimer = 0;
    aPrev = 0;
    last = {};
  }
  reset();

  function sub(hh, input, yard) {
    const s = state;
    const thr = clamp(input.throttle ?? 0, 0, 1);
    const brk = clamp(input.brake ?? 0, 0, 1);
    const str = clamp(input.steer ?? 0, -1, 1);
    s.time += hh;
    if (s.tipped) { s.v = 0; s.yawRate = 0; s.latAccel = 0; return; }

    const ch = Math.cos(s.heading), sh = Math.sin(s.heading);
    const [gx, gz] = yard.gradAt(s.x, s.z);
    const gA = gx * ch + gz * sh;   // dy per metre along heading
    const gC = -gx * sh + gz * ch;  // dy per metre toward +n
    const theta = Math.atan(gA);
    const sinT = Math.sin(theta), cosT = Math.cos(theta);
    const N = m * G / Math.sqrt(1 + gx * gx + gz * gz); // load normal to the ground
    const surface = yard.surfaceAt(s.x, s.z);
    const surf = p.surfaces[surface];
    if (!surf) throw new Error(`no surface data for ${surface}`);
    const snowy = SNOWY.has(surface);
    s.surface = surface;
    s.gradeAlong = gA;
    s.gradeCross = gC;

    // Grip: the surface mu; chains (W1) and tracks (W2, taken as chains) on snow and ice
    const muRear = chained && snowy ? surf.muChains : surf.mu;
    const muFront = skis && snowy ? p.snow.skiMuLateral : surf.mu;
    // Longitudinal load transfer: static split by rearShare, plus m (g sin(theta) + a) h / wheelbase
    // (uphill grade and forward acceleration load the rear). a is the PREVIOUS sub-step's
    // acceleration (explicit, one sub-step of lag). Rear load is clamped to 0..N; above N the front lifts.
    const rearRaw = N * p.mass.rearShare + (m * (G * sinT + aPrev) * cg) / L;
    const Nrear = clamp(rearRaw, 0, N);
    s.frontLift = rearRaw > N;
    s.rearLoadShare = Nrear / N;
    const gripRear = muRear * Nrear;

    // Fresh snow: sinkage scales with the local depth; the floor ploughs above the clearance
    const depth = yard.snowDepthAt(s.x, s.z);
    const depthFrac = depth / p.snow.depth;
    const sinkage = depth > 0 ? Math.max(rearSinkFull, frontSinkFull) * depthFrac : 0;
    const excessCm = Math.max(0, sinkage - p.geom.clearance) * 100;
    const Fplough = p.snow.ploughPerCm * excessCm * m * G;
    s.sinkage = sinkage;
    s.ploughing = excessCm > 0;

    // Rolling resistance (W2 uses the track value in fresh snow)
    const crr = surface === 'snowFresh' && o.setup === 'w2' ? p.surfaces.snowFresh.crrTrack : surf.crr;
    const Froll = crr * N;

    // Engine and centrifugal clutch. The clutch sees the wheel side omega_w * ratio (not the ground speed).
    // Locked (wheel side at or above rpmLock): engine speed = wheel side, engine inertia neglected,
    // torque from the governor curve, none with the throttle closed (the engine is then decoupled,
    // so there is no engine braking). Otherwise the engine speed is a state; it slips.
    const wsRpm0 = (Math.max(s.wheelOmega, 0) * p.drive.ratio) / RPM2RAD;
    const lockedMode = wsRpm0 >= p.drive.rpmLock;
    let TcSlip = 0;
    if (lockedMode) {
      s.clutch = 'locked';
      s.engineRpm = wsRpm0;
    } else {
      const Te = thr * torqueCurve(s.engineRpm);
      const f = clamp((s.engineRpm - p.drive.rpmEngage) / (p.drive.rpmLock - p.drive.rpmEngage), 0, 1);
      if (s.engineRpm > wsRpm0) TcSlip = Te * f;
      const drag = thr > 0 ? 0 : MODEL.engineDrag;
      const dOmega = ((Te - TcSlip - drag) / MODEL.engineInertia) * hh;
      s.engineRpm = Math.max(MODEL.idleRpm, s.engineRpm + dOmega / RPM2RAD);
      if (TcSlip > 0) {
        s.clutch = 'slip';
        const P = TcSlip * (s.engineRpm - wsRpm0) * RPM2RAD; // slip power, W
        s.slipEnergy += P * hh;
        s.slipTime += hh;
      } else s.clutch = 'idle';
    }
    const Fgrade = m * G * sinT;
    const Rbody = Froll + Fplough;
    const Tbrake = brk * MODEL.brakeTorque; // rear axle only

    // Rear axle and body, integrated in small steps (the tyre force law is stiff):
    //   I dw/dt = Tc ratio eta - Ft r - brake;   m dv/dt = Ft - m g sin(theta) - rolling - plough
    // Ft = gripRear * clamp(kappa / kappaPeak, -1, 1), kappa = (w r - v) / max(|v|, slipSpeed).
    const nIn = Math.max(1, Math.ceil(hh / MODEL.axleDt - 1e-9));
    const hi = hh / nIn;
    const vStart = s.v;
    let Ft = 0, kappa = 0, Tc = 0;
    for (let i = 0; i < nIn; i++) {
      const wsRpm = (Math.max(s.wheelOmega, 0) * p.drive.ratio) / RPM2RAD;
      Tc = lockedMode ? thr * torqueCurve(wsRpm) : TcSlip;
      kappa = (s.wheelOmega * r - s.v) / Math.max(Math.abs(s.v), MODEL.slipSpeed);
      Ft = gripRear * clamp(kappa / MODEL.kappaPeak, -1, 1);
      const Tdrive = Tc * p.drive.ratio * p.drive.eta - Ft * r;
      const wn = coulomb(s.wheelOmega, Tdrive, Tbrake, MODEL.wheelInertia, hi, MODEL.vEps / r);
      const vn = coulomb(s.v, Ft - Fgrade, Rbody, m, hi, MODEL.vEps);
      s.wheelOmega = wn;
      s.v = vn;
    }
    aPrev = (s.v - vStart) / hh;
    s.wheelSlip = kappa;
    s.wheelSpin = kappa > MODEL.spinKappa;
    if (s.wheelSpin) s.spinTime += hh;
    const Fdrive = Ft, Fbrake = 0;

    // Stuck: near zero speed with the throttle on, and the largest drive force cannot beat the resistance
    const Fmax = Math.min(wheelForce(Tr), gripRear);
    if (Math.abs(s.v) < MODEL.stuckSpeed && thr > 0.1 && Fmax <= Froll + Fplough + Fgrade) stuckTimer += hh;
    else stuckTimer = 0;
    s.stuck = stuckTimer >= MODEL.stuckTime;

    // Lateral: kinematic bicycle, capped by front grip
    const target = str * MODEL.steerLock;
    const dmax = MODEL.steerRate * hh;
    s.steer += clamp(target - s.steer, -dmax, dmax);
    let yaw = (s.v * Math.tan(s.steer)) / L;
    const aCap = muFront * G;
    if (Math.abs(s.v * yaw) > aCap) yaw = (Math.sign(yaw) * aCap) / Math.abs(s.v); // understeer
    s.yawRate = yaw;
    s.latAccel = s.v * yaw;
    s.heading += yaw * hh;

    // Position: ground speed v along the slope, horizontal part v cos(theta); y follows the yard
    s.x += s.v * cosT * ch * hh;
    s.z += s.v * cosT * sh * hh;
    s.y = yard.heightAt(s.x, s.z);
    s.distance += Math.abs(s.v) * hh;

    // Tipping: overturning ratio toward the outside of the turn over the available half track / cg height
    const phi = Math.atan(gC);
    const needed = Math.abs((s.latAccel + G * Math.sin(phi)) / (G * Math.cos(phi)));
    const avail = p.geom.track / 2 / cg;
    s.tipMargin = needed < avail / MODEL.tipMarginCap ? MODEL.tipMarginCap : avail / needed;
    if (s.tipMargin < 1) { s.tipped = true; s.v = 0; s.yawRate = 0; s.latAccel = 0; }

    last = { N, Nrear, muRear, muFront, gripRear, Fdrive, Fbrake, Froll, Fplough, Fgrade, Fmax, Tc, crr };
  }

  function step(dt, input, yard) {
    const n = Math.max(1, Math.ceil(dt / MODEL.maxDt - 1e-9));
    const hh = dt / n;
    for (let i = 0; i < n; i++) sub(hh, input || {}, yard);
  }

  function info() {
    return {
      setup: o.setup, rider: o.rider, childLimit: o.childLimit, trackSink: o.trackSink,
      mass: m, cgHeight: cg, tipAvailable: p.geom.track / 2 / cg,
      torqueMax: Tr, rpmRated: nRated, rpmNoLoad: nNoLoad,
      ...last,
    };
  }

  return { state, reset, step, info, MODEL };
}

// Fit in the Delica D:5. Width is the widest of track + tyre / ski / track-belt width.
export function delicaFit(p, setup = 'summer') {
  const part = setup === 'w1' ? p.geom.skiW : setup === 'w2' ? p.geom.trackW : p.geom.tyreW;
  // W1 has skis in front but rear tyres: the widest of the two applies
  const wide = setup === 'w1' ? Math.max(p.geom.skiW, p.geom.tyreW) : part;
  const w = p.geom.track + wide;
  const d = p.delica;
  return {
    length: { kart: p.geom.length, limit: d.cargoLength, ok: p.geom.length <= d.cargoLength },
    width: {
      kart: w, openingMin: d.openingWidthMin, openingMax: d.openingWidthMax,
      cargoMin: d.cargoWidthMin, cargoMax: d.cargoWidthMax,
      okOpeningMin: w <= d.openingWidthMin, okOpeningMax: w <= d.openingWidthMax,
      okCargoMin: w <= d.cargoWidthMin, okCargoMax: w <= d.cargoWidthMax,
    },
    lip: d.lip,
  };
}

// ---------------------------------------------------------------- the requirement tests


function dv(p, key) {
  const it = p.values.get(key);
  if (!it) throw new Error(`value ${key} is not in the record`);
  return { key, value: Number(it.v), unit: it.unit ?? '' };
}

// Run a kart until `until(state)` or tmax; input is a function of the state.
function run(kart, yard, input, until, tmax, dt = 0.01) {
  while (kart.state.time < tmax && !until(kart.state)) kart.step(dt, input(kart.state), yard);
}

function topSpeedKmh(p, opts) {
  const yard = flatYard(p, 'paved');
  const kart = createKart(p, opts);
  kart.reset({ x: 0, z: 0, heading: 0, yard });
  run(kart, yard, () => ({ throttle: 1 }), () => false, 20);
  return kart.state.v * 3.6;
}

function climb(p, surface, setup = 'summer') {
  const yard = inclineYard(p, surface, p.limits.grade);
  const kart = createKart(p, { setup, rider: 'adult' });
  kart.reset({ x: 0, z: 0, heading: Math.PI / 2, yard });
  let peak = 0;
  run(kart, yard, () => ({ throttle: 1 }), (s) => { peak = Math.max(peak, s.rearLoadShare); return s.distance >= 20 || s.tipped; }, 90);
  const s = kart.state;
  return { ok: s.distance >= 20, t: s.time, dist: s.distance, slipT: s.slipTime, slipE: s.slipEnergy, spinT: s.spinTime, stuck: s.stuck, tipped: s.tipped, peak };
}

const f1 = (x) => (Number.isFinite(x) ? Math.round(x * 10) / 10 : x);
const f2 = (x) => (Number.isFinite(x) ? Math.round(x * 100) / 100 : x);

export function runTests(p) {
  const out = [];
  const add = (r) => out.push(r);

  // R-01 top speed, level paved, adult and child
  for (const rider of ['adult', 'child']) {
    const vk = topSpeedKmh(p, { rider });
    const d = dv(p, 'kart.speed_max_kmh');
    add({ req: 'R-01', title: `Top speed, level paved, ${rider}`, setup: 'summer', rider, design: d,
      result: { value: f2(vk), unit: 'km/h' }, pass: vk <= d.value,
      note: `${f2((vk / d.value - 1) * 100)} % against the limit` });
  }

  // R-17 child limit on
  for (const rider of ['child', 'adult']) {
    const vk = topSpeedKmh(p, { rider, childLimit: true });
    const d = dv(p, 'kart.speed_child_kmh');
    add({ req: 'R-17', title: `Top speed with the child limit on, ${rider}`, setup: 'summer', rider, design: d,
      result: { value: f2(vk), unit: 'km/h' }, pass: vk <= d.value,
      note: `${f2((vk / d.value - 1) * 100)} % against the child limit; governor speeds scaled by vChild / vMax` });
  }

  // R-09 stopping distance from top speed
  {
    const yard = flatYard(p, 'paved');
    const kart = createKart(p, { rider: 'adult' });
    kart.reset({ x: 0, z: 0, heading: 0, yard });
    run(kart, yard, () => ({ throttle: 1 }), () => false, 20);
    const v0 = kart.state.v, x0 = kart.state.distance, t0 = kart.state.time;
    run(kart, yard, () => ({ throttle: 0, brake: 1 }), (s) => s.v <= 0, t0 + 20);
    const d = dv(p, 'kart.stop_distance_max_m');
    const dist = kart.state.distance - x0;
    add({ req: 'R-09', title: 'Stopping distance from top speed, level paved', setup: 'summer', rider: 'adult', design: d,
      result: { value: f2(dist), unit: 'm' }, pass: dist <= d.value,
      note: `from ${f2(v0 * 3.6)} km/h, brakes on rear wheels only, no reaction time` });
  }

  // R-16 and R-04 climbs
  {
    const d = dv(p, 'site.grade_max_pct');
    const c = climb(p, 'grassLong');
    add({ req: 'R-16', title: 'Climb 20 m from rest at the maximum grade, long grass', setup: 'summer', rider: 'adult', design: d,
      result: { value: c.ok ? f1(c.t) : null, unit: 's' }, pass: c.ok,
      note: c.ok
        ? `climbs 20 m in ${f1(c.t)} s (${f2(20 / c.t)} m/s); clutch slip ${f2(c.slipT)} s, ${Math.round(c.slipE)} J; peak rear load share ${f2(c.peak)}; tyre spin ${f2(c.spinT)} s. Pass is for the climb; "no part slips" needs the slip result`
        : `does not climb: reached ${f1(c.dist)} m in ${f1(c.t)} s${c.stuck ? ', stuck' : ''}; clutch slip ${f2(c.slipT)} s, ${Math.round(c.slipE)} J; peak rear load share ${f2(c.peak)}; tyre spin ${f2(c.spinT)} s` });
    for (const [surface, name] of [['gravel', 'gravel'], ['grass', 'grass']]) {
      const g = climb(p, surface);
      add({ req: 'R-04', title: `Climb 20 m from rest at the maximum grade, ${name}`, setup: 'summer', rider: 'adult', design: d,
        result: { value: g.ok ? f1(g.t) : null, unit: 's' }, pass: g.ok,
        note: g.ok ? `climbs in ${f1(g.t)} s; slip ${f2(g.slipT)} s, ${Math.round(g.slipE)} J; peak rear share ${f2(g.peak)}; tyre spin ${f2(g.spinT)} s`
          : `does not climb: reached ${f1(g.dist)} m${g.stuck ? ', stuck' : ''}; slip ${f2(g.slipT)} s, ${Math.round(g.slipE)} J; peak rear share ${f2(g.peak)}; tyre spin ${f2(g.spinT)} s` });
    }
  }

  // R-12 slide before tip, analytic
  {
    const d = dv(p, 'kart.tip_ratio_min');
    for (const rider of ['adult', 'child']) {
      const avail = p.geom.track / 2 / cgHeight(p, rider);
      const mu = p.surfaces.paved.mu;
      add({ req: 'R-12', title: `Half track over centre height, level paved, ${rider}`, setup: 'summer', rider, design: d,
        result: { value: f2(avail), unit: '' }, pass: avail >= d.value && avail > mu,
        note: `slides first when this exceeds mu ${mu} (it does: ${avail > mu}); tips at a lateral ratio of ${f2(avail)}` });
      // standing sideways on the grade on grass, from the simulator
      const yard = inclineYard(p, 'grass', p.limits.grade);
      const kart = createKart(p, { rider });
      kart.reset({ x: 0, z: 0, heading: 0, yard });
      kart.step(0.5, {}, yard);
      const muG = p.surfaces.grass.mu;
      const s = kart.state;
      add({ req: 'R-12', title: `Standing sideways on the grade, grass, ${rider}`, setup: 'summer', rider, design: d,
        result: { value: f2(avail), unit: '' }, pass: avail >= d.value && !s.tipped && p.limits.grade < muG && avail > muG,
        note: `tipMargin ${f2(s.tipMargin)} (tips below 1); grade ${p.limits.grade} is below grass mu ${muG}, so it holds; slides before it tips` });
    }
  }

  // R-05 W1 on packed snow: start, run 20 m, stop
  {
    const yard = flatYard(p, 'snowPacked');
    const kart = createKart(p, { setup: 'w1', rider: 'adult' });
    kart.reset({ x: 0, z: 0, heading: 0, yard });
    run(kart, yard, () => ({ throttle: 1 }), (s) => s.distance >= 20, 40);
    const ran = kart.state.distance >= 20, tRun = kart.state.time, v1 = kart.state.v;
    const x0 = kart.state.distance, t0 = kart.state.time;
    run(kart, yard, () => ({ throttle: 0, brake: 1 }), (s) => s.v <= 0, t0 + 30);
    const stopped = kart.state.v <= 0;
    const dist = kart.state.distance - x0;
    const d = dv(p, 'ground.mu_snow_chains');
    add({ req: 'R-05', title: 'W1 on packed snow: starts, runs 20 m, stops', setup: 'w1', rider: 'adult', design: d,
      result: { value: f2(dist), unit: 'm' }, pass: ran && stopped,
      note: `20 m in ${f1(tRun)} s at ${f2(v1 * 3.6)} km/h, then stops in ${f2(dist)} m (stopping distance on snow is a value, not a pass limit)` });
  }

  // R-06 fresh snow 10 m
  {
    const d = dv(p, 'snow.depth_max_cm');
    const configs = [
      { setup: 'summer', name: 'summer tyres' },
      { setup: 'w1', name: 'W1 chains' },
      { setup: 'w2', trackSink: 'belt', name: 'W2 belt' },
      { setup: 'w2', trackSink: 'wheels', name: 'W2 wheels' },
    ];
    for (const c of configs) {
      const yard = flatYard(p, 'snowFresh');
      const kart = createKart(p, { setup: c.setup, rider: 'adult', trackSink: c.trackSink });
      kart.reset({ x: 0, z: 0, heading: 0, yard });
      run(kart, yard, () => ({ throttle: 1 }), (s) => s.distance >= 10 || s.stuck, 30);
      const s = kart.state;
      const ok = s.distance >= 10 && !s.stuck;
      add({ req: 'R-06', title: `Fresh snow 10 m, ${c.name}`, setup: c.setup, rider: 'adult', design: d,
        result: { value: f1(s.distance), unit: 'm' }, pass: ok,
        note: `${ok ? `10 m in ${f1(s.time)} s` : `stuck after ${f1(s.time)} s`}; sinkage ${f1(s.sinkage * 100)} cm, ploughing ${s.ploughing}` });
    }
  }

  // R-14 Delica fit
  {
    const fs = delicaFit(p, 'summer');
    const dl = dv(p, 'kart.length_rough_mm');
    add({ req: 'R-14', title: 'Length against the cargo space', setup: 'all', rider: '', design: dl,
      result: { value: Math.round(fs.length.kart * 1000), unit: 'mm' }, pass: fs.length.ok,
      note: `limit ${Math.round(fs.length.limit * 1000)} mm` });
    const dw = dv(p, 'form.track_min_m');
    for (const setup of SETUPS) {
      const w = delicaFit(p, setup).width;
      const hard = w.okOpeningMin && w.okCargoMin;
      const never = !w.okOpeningMax || !w.okCargoMax;
      add({ req: 'R-14', title: `Width against the opening and the cargo space`, setup, rider: '', design: dw,
        result: { value: f2(w.kart), unit: 'm' }, pass: hard ? true : never ? false : null,
        note: `opening ${w.openingMin}-${w.openingMax} m (fits min ${w.okOpeningMin}, max ${w.okOpeningMax}); cargo ${w.cargoMin}-${w.cargoMax} m (min ${w.okCargoMin}, max ${w.okCargoMax}); null = depends on the true measure` });
    }
  }
  return out;
}
