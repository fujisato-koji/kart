// Run the simulator against the requirement tests and check that the model itself is right.
// Usage: node tools/test_sim.mjs   (exit code 1 only if a sanity check fails)
import fs from 'node:fs';
import { fileURLToPath } from 'node:url';
import path from 'node:path';
import { makeParams, cgHeight } from '../docs/viewer/params.js';
import { createKart, runTests, G, MODEL } from '../docs/viewer/sim.js';
import { flatYard, inclineYard } from '../docs/viewer/yard.js';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const record = JSON.parse(fs.readFileSync(path.join(root, 'docs/data/record.json'), 'utf8'));
const p = makeParams(record);

// ---- requirement table
const rows = runTests(p);
const mark = (x) => (x === true ? 'PASS' : x === false ? 'FAIL' : '  ? ');
for (const r of rows) {
  const des = `${r.design.key}=${r.design.value}${r.design.unit ? ' ' + r.design.unit : ''}`;
  const res = r.result.value === null ? 'n/a' : `${r.result.value}${r.result.unit ? ' ' + r.result.unit : ''}`;
  console.log(`${mark(r.pass)} ${r.req} [${r.setup}/${r.rider || '-'}] ${r.title} | ${des} | ${res} | ${r.note}`);
}

// ---- sanity checks (model correctness, not requirements)
let bad = 0;
const check = (name, ok, detail) => { console.log(`${ok ? 'ok  ' : 'BAD '} ${name}: ${detail}`); if (!ok) bad++; };
const within = (a, b, tol) => Math.abs(a - b) <= tol * Math.abs(b);

function drive(kart, yard, input, secs, dt = 0.01, each) {
  const t1 = kart.state.time + secs;
  while (kart.state.time < t1 - 1e-9) { kart.step(dt, input, yard); if (each) each(kart.state); }
}

{ // coast-down deceleration = crr g
  const yard = flatYard(p, 'paved');
  const k = createKart(p);
  k.reset({ v: p.drive.vMax, yard });
  const v0 = k.state.v;
  drive(k, yard, { throttle: 0 }, 1);
  const a = v0 - k.state.v, expect = p.surfaces.paved.crr * G;
  check('coast-down deceleration', within(a, expect, 0.05), `${a.toFixed(4)} vs crr g ${expect.toFixed(4)} m/s2`);
}
{ // stopping distance = v2 / (2 mu rearShare g)
  const yard = flatYard(p, 'paved');
  const k = createKart(p);
  k.reset({ v: p.drive.vMax, yard });
  drive(k, yard, { throttle: 0, brake: 1 }, 10);
  const mu = p.surfaces.paved.mu, h = cgHeight(p, 'adult'), Lb = p.geom.wheelbase;
  // with load transfer: d = (mu s + crr) g / (1 + mu h / L)
  const dec = ((mu * p.mass.rearShare + p.surfaces.paved.crr) * G) / (1 + (mu * h) / Lb);
  const expect = p.drive.vMax ** 2 / (2 * dec);
  check('stopping distance', within(k.state.distance, expect, 0.05), `${k.state.distance.toFixed(3)} vs ${expect.toFixed(3)} m`);
}
{ // top speed with the adult within 3 % of vMax
  const yard = flatYard(p, 'paved');
  const k = createKart(p);
  k.reset({ yard });
  drive(k, yard, { throttle: 1 }, 20);
  check('top speed adult', within(k.state.v, p.drive.vMax, 0.03), `${(k.state.v * 3.6).toFixed(2)} vs ${(p.drive.vMax * 3.6).toFixed(2)} km/h`);
}
{ // energy never created when coasting (flat: kinetic strictly non-increasing; slope: total within 0.5 %)
  const m = p.mass.kart + p.mass.adult;
  const yard = flatYard(p, 'gravel');
  const k = createKart(p);
  k.reset({ v: p.drive.vMax, yard });
  let prev = 0.5 * m * k.state.v ** 2 + 0.5 * MODEL.wheelInertia * k.state.wheelOmega ** 2, worst = 0;
  drive(k, yard, { throttle: 0, steer: 0.3 }, 10, 0.01, (s) => {
    const e = 0.5 * m * s.v ** 2 + 0.5 * MODEL.wheelInertia * s.wheelOmega ** 2; worst = Math.max(worst, e - prev); prev = e;
  });
  check('energy, coasting on the flat', worst <= 1e-6, `largest rise ${worst.toExponential(2)} J`);

  const hill = inclineYard(p, 'grass', p.limits.grade);
  const k2 = createKart(p);
  k2.reset({ z: 30, heading: -Math.PI / 2, v: 0.5, yard: hill }); // starts uphill-ward, turns round on the hill
  const E = (s) => 0.5 * m * s.v ** 2 + 0.5 * MODEL.wheelInertia * s.wheelOmega ** 2 + m * G * s.y;
  const e0 = E(k2.state);
  let rise = 0;
  drive(k2, hill, { throttle: 0 }, 20, 0.01, (s) => { rise = Math.max(rise, E(s) - e0); });
  check('energy, coasting on the grade', rise <= 0.005 * Math.abs(e0) + 1, `largest rise ${rise.toFixed(3)} J of ${e0.toFixed(0)} J`);
}

console.log(bad ? `${bad} sanity check(s) failed` : 'all sanity checks passed');
process.exit(bad ? 1 : 0);
