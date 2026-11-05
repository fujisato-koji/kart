// Checks of the 3D view's animation (docs/viewer/motion.js) against the design it shows: the tie rods
// keep their length and the wheels rise as far as asked between the grid points of calc/front.py's
// poses, the rear wheel's travel is the suspension's, and the steer at full lock is the recorded one.
//   node tools/test_motion.mjs
import fs from 'node:fs';
import { fileURLToPath } from 'node:url';
import path from 'node:path';
import { stateAt, motionsOf, endsOf, readout, apply, dist, MOTIONS } from '../docs/viewer/motion.js';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const design = JSON.parse(fs.readFileSync(path.join(root, 'docs/data/design.json'), 'utf8'));
const record = JSON.parse(fs.readFileSync(path.join(root, 'docs/data/record.json'), 'utf8'));
const val = (k) => record.values.find((v) => v.key === k).v;

let bad = 0;
const check = (name, ok, detail) => { console.log(`${ok ? 'ok  ' : 'BAD '} ${name}: ${detail}`); if (!ok) bad++; };
const fs_ = design.front_suspension, P = fs_.points;
const ties = design.items.filter((it) => it.part === 'tie_rods');
const wheel = (side) => [P.wheel[0], (side === 'l' ? 1 : -1) * P.wheel[1], P.wheel[2]];

// a sweep off the grid: rises and bar angles between the grid's points, both sides apart
let tie = 0, rise = 0;
for (let a = -fs_.droop; a <= fs_.bump + 1e-9; a += 0.0037) {
  for (let b = -fs_.lock_bar_deg; b <= fs_.lock_bar_deg + 1e-9; b += 1.7) {
    const s = { rear: 0, l: a, r: -a * 0.6, bar: b }, mv = motionsOf(design, s);
    for (const it of ties) { const e = endsOf(it, mv); tie = Math.max(tie, Math.abs(dist(e.pos, e.to) - dist(it.pos, it.to))); }
    for (const side of ['l', 'r']) { const w = wheel(side); rise = Math.max(rise, Math.abs(apply(mv[side + '.knuckle'], w)[2] - w[2] - s[side])); }
  }
}
check('tie rods keep their length', tie < 0.001, `largest change ${(tie * 1000).toFixed(2)} mm over the travel and the lock`);
check('front wheels rise as asked', rise < 0.001, `largest error ${(rise * 1000).toFixed(2)} mm`);

// the rear wheel's travel at the arm's ends
const rs = design.rear_suspension;
for (const [deg, want, name] of [[rs.bump_deg, val('sus.bump_mm') / 1000, 'full bump'], [-rs.droop_deg, -val('sus.droop_mm') / 1000, 'full droop']]) {
  const r = readout(design, { rear: deg, l: 0, r: 0, bar: 0 }, motionsOf(design, { rear: deg, l: 0, r: 0, bar: 0 })).rear;
  check(`rear wheel at ${name}`, Math.abs(r.rise - want) < 0.001, `${(r.rise * 1000).toFixed(1)} mm vs ${(want * 1000).toFixed(0)} mm`);
}

// the steer at full lock, left turn: the left wheel inner
{
  const s = { rear: 0, l: 0, r: 0, bar: fs_.lock_bar_deg }, ro = readout(design, s, motionsOf(design, s));
  check('outer wheel at full lock', Math.abs(ro.front.r.steer - val('dsn.steer_outer_deg')) < 0.2,
    `${ro.front.r.steer.toFixed(2)} deg vs ${val('dsn.steer_outer_deg')} deg (inner ${ro.front.l.steer.toFixed(1)} deg)`);
  check('inner wheel at full lock', Math.abs(ro.front.l.steer - val('lay.steer_max_deg')) < 0.2,
    `${ro.front.l.steer.toFixed(2)} deg vs ${val('lay.steer_max_deg')} deg`);
}

// every motion starts and ends at rest
for (const [k] of MOTIONS) {
  const s0 = stateAt(design, k, 0), off = Math.max(...['rear', 'l', 'r', 'bar'].map((q) => Math.abs(s0[q])));
  check(`motion ${k} starts at rest`, off < 1e-9, `${off.toExponential(1)}`);
}

console.log(bad ? `${bad} motion check(s) failed` : 'all motion checks passed');
process.exit(bad ? 1 : 0);
