// Simple 3D model of the go-kart. Local frame: +x forward, +y up, +z to the right,
// origin on the ground under the middle of the wheelbase.
// Dimensions come from the record through p (params.js). Sizes that the record does not
// hold are in ILLUSTRATIVE below.
import { cgHeight } from './params.js';

export const ILLUSTRATIVE = {
  tubeD: 0.03,            // frame tube diameter drawn (m), model constant, not in the record
  frameInset: 0.04,       // gap between tyre inner face and frame side (m)
  hoopHeight: 0.6,        // roll hoop height above the seat (m)
  seatX: -0.1,            // seat centre, fraction of wheelbase from the middle (negative = rearward)
  seatSize: [0.38, 0.06, 0.38], // seat pad length, thickness, width (m)
  engineBox: [0.4, 0.3, 0.3],   // engine box length, height, width (m)
  engineX: -0.38,         // engine box centre, fraction of wheelbase from the middle
  steeringX: 0.22,        // steering column base, fraction of wheelbase from the middle
  steeringWheelD: 0.3,    // steering wheel diameter (m)
  rimFraction: 0.55,      // rim diameter as a fraction of tyre diameter (look only)
  trackThickness: 0.025,  // rubber track belt thickness (m)
  skiThickness: 0.02,     // ski plate thickness (m)
  skiTipLift: 0.12,       // ski tip upturn length as a fraction of ski length
  chainRings: 5,          // number of chain rings drawn across the tyre
  chainLinkD: 0.008,      // chain link size drawn (m)
  cgRadius: 0.04,         // centre-of-mass marker radius (m)
  mannequin: {            // proportions as fractions of stature, mannequin look only
    head: 0.13, torso: 0.30, thigh: 0.245, shin: 0.246, upperArm: 0.186, foreArm: 0.146, limbR: 0.035,
  },
};

export function buildKart(THREE, p, opts = {}) {
  const setup = opts.setup || 'summer';
  const rider = opts.rider || 'adult';
  const g = p.geom;
  const I = ILLUSTRATIVE;
  const root = new THREE.Group();
  root.name = 'kart';

  const mat = (c, extra = {}) => new THREE.MeshLambertMaterial({ color: c, ...extra });
  const mFrame = mat(0x8a8f96), mTyre = mat(0x202225), mRim = mat(0xb0b4ba), mSeat = mat(0x2f4f7f);
  const mEngine = mat(0xc0392b), mSki = mat(0xd9a21b), mTrack = mat(0x15161a), mChain = mat(0xe3e5e8);
  const mSkin = mat(0xe0b394), mCloth = mat(0x3d7a6a), mCg = new THREE.MeshBasicMaterial({ color: 0xff2fb4 });

  const add = (mesh, name, parent = root) => { mesh.name = name; parent.add(mesh); return mesh; };

  // tube between two points
  function tube(a, b, name, r = I.tubeD / 2, m = mFrame) {
    const A = new THREE.Vector3(...a), B = new THREE.Vector3(...b);
    const len = A.distanceTo(B);
    const geo = new THREE.CylinderGeometry(r, r, len, 8);
    const mesh = new THREE.Mesh(geo, m);
    mesh.position.copy(A).add(B).multiplyScalar(0.5);
    mesh.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), B.clone().sub(A).normalize());
    return add(mesh, name);
  }

  const halfTrack = g.track / 2;
  const wbH = g.wheelbase / 2;
  const R = g.tyreD / 2;
  const frameZ = Math.max(0.2, halfTrack - g.tyreW / 2 - I.frameInset);
  const yRail = g.clearance + I.tubeD / 2;
  const xF = g.length / 2, xR = -g.length / 2;
  const seatY = g.clearance + g.seatAboveFloor;

  // frame: side rails, cross members, nose, roll hoop, floor
  const frame = new THREE.Group(); frame.name = 'frame'; root.add(frame);
  const ftube = (a, b, n) => { const t = tube(a, b, n); frame.add(t); return t; };
  for (const s of [-1, 1]) {
    ftube([xR, yRail, s * frameZ], [xF - 0.12, yRail, s * frameZ], 'rail');
    ftube([xF - 0.12, yRail, s * frameZ], [xF, yRail + 0.1, s * frameZ * 0.5], 'nose-rail');
    ftube([xR, yRail, s * frameZ], [xR, seatY + I.hoopHeight, s * frameZ * 0.8], 'hoop-post');
    ftube([xR + 0.02, yRail, s * frameZ], [xR + g.length * 0.3, seatY + 0.18, s * frameZ * 0.9], 'seat-brace');
  }
  ftube([xR, seatY + I.hoopHeight, -frameZ * 0.8], [xR, seatY + I.hoopHeight, frameZ * 0.8], 'hoop-top');
  for (const x of [xR, -wbH, 0, wbH * 0.6]) ftube([x, yRail, -frameZ], [x, yRail, frameZ], 'cross');
  ftube([xF, yRail + 0.1, -frameZ * 0.5], [xF, yRail + 0.1, frameZ * 0.5], 'bumper');
  const floor = new THREE.Mesh(new THREE.BoxGeometry(g.length * 0.55, 0.01, frameZ * 2), mat(0x6b7078));
  floor.position.set(wbH * 0.1, yRail + I.tubeD / 2 + 0.005, 0);
  add(floor, 'floor', frame);

  // axles
  tube([wbH, R, -halfTrack], [wbH, R, halfTrack], 'front-axle', 0.012);
  tube([-wbH, R, -halfTrack], [-wbH, R, halfTrack], 'rear-axle', 0.014);

  // seat
  const seat = new THREE.Mesh(new THREE.BoxGeometry(I.seatSize[0], I.seatSize[1], I.seatSize[2]), mSeat);
  const seatX = I.seatX * g.wheelbase;
  seat.position.set(seatX, seatY - I.seatSize[1] / 2, 0);
  add(seat, 'seat');
  const back = new THREE.Mesh(new THREE.BoxGeometry(0.05, 0.35, I.seatSize[2]), mSeat);
  back.position.set(seatX - I.seatSize[0] / 2, seatY + 0.17, 0);
  add(back, 'seat-back');

  // engine box behind the seat
  const eng = new THREE.Mesh(new THREE.BoxGeometry(...I.engineBox), mEngine);
  eng.position.set(I.engineX * g.wheelbase, yRail + I.tubeD / 2 + I.engineBox[1] / 2 + 0.01, 0);
  add(eng, 'engine');

  // steering wheel
  const steerX = I.steeringX * g.wheelbase;
  const steerTop = seatY + 0.42;
  const column = tube([steerX + 0.15, yRail, 0], [steerX, steerTop, 0], 'steering-column', 0.012);
  const wheelGeo = new THREE.TorusGeometry(I.steeringWheelD / 2, 0.012, 6, 20);
  const steeringWheel = new THREE.Mesh(wheelGeo, mat(0x111111));
  steeringWheel.position.set(steerX, steerTop, 0);
  steeringWheel.rotation.y = Math.PI / 2 - 0.5; // face the rider, tilted
  add(steeringWheel, 'steering-wheel');
  void column;

  // wheels, skis, tracks, chains
  const steerGroups = [];
  const spinners = [];   // {obj, r} rotate about z by -distance/r

  function wheel(r, w, name) {
    const grp = new THREE.Group(); grp.name = name;
    const spin = new THREE.Group(); grp.add(spin);
    const tyre = new THREE.Mesh(new THREE.CylinderGeometry(r, r, w, 20), mTyre);
    tyre.rotation.x = Math.PI / 2; spin.add(tyre);
    const rim = new THREE.Mesh(new THREE.CylinderGeometry(r * I.rimFraction, r * I.rimFraction, w * 1.02, 16), mRim);
    rim.rotation.x = Math.PI / 2; spin.add(rim);
    const bar = new THREE.Mesh(new THREE.BoxGeometry(r * 1.9, r * 0.12, w * 1.04), mTyre); // marks rotation
    spin.add(bar);
    spinners.push({ obj: spin, r });
    return grp;
  }

  function ski(name) {
    const grp = new THREE.Group(); grp.name = name;
    const plate = new THREE.Mesh(new THREE.BoxGeometry(g.skiL, I.skiThickness, g.skiW), mSki);
    plate.position.set(g.skiL * 0.05, I.skiThickness / 2 - R, 0);
    grp.add(plate);
    const tipLen = g.skiL * I.skiTipLift;
    const tip = new THREE.Mesh(new THREE.BoxGeometry(tipLen, I.skiThickness, g.skiW), mSki);
    tip.position.set(g.skiL * 0.05 + g.skiL / 2 + tipLen * 0.4, I.skiThickness / 2 - R + tipLen * 0.25, 0);
    tip.rotation.z = 0.5;
    grp.add(tip);
    const post = tube([0, 0, 0], [0, I.skiThickness - R, 0], name + '-post', 0.01);
    root.remove(post); grp.add(post);
    return grp;
  }

  const useSkis = setup === 'w1' || setup === 'w2';
  for (const [s, side] of [[-1, 'L'], [1, 'R']]) {
    // front: steerable
    const steer = new THREE.Group();
    steer.name = 'front-steer-' + side;
    steer.position.set(wbH, R, s * halfTrack);
    steer.add(useSkis ? ski('ski-' + side) : wheel(R, g.tyreW, 'tyre-F' + side));
    root.add(steer); steerGroups.push(steer);

    // rear
    if (setup === 'w2') {
      const D = g.trackWheelD, r = D / 2 + I.trackThickness;
      const spacing = Math.max(0.2, (g.trackLoop - 2 * Math.PI * r) / 2);
      const pod = new THREE.Group(); pod.name = 'track-' + side;
      pod.position.set(-wbH, 0, s * halfTrack);
      const shape = new THREE.Shape();
      const h = spacing / 2;
      shape.moveTo(-h, -r); shape.lineTo(h, -r);
      shape.absarc(h, 0, r, -Math.PI / 2, Math.PI / 2, false);
      shape.lineTo(-h, r);
      shape.absarc(-h, 0, r, Math.PI / 2, Math.PI * 1.5, false);
      const ri = r - I.trackThickness;
      const hole = new THREE.Path();
      hole.moveTo(-h, -ri); hole.lineTo(h, -ri);
      hole.absarc(h, 0, ri, -Math.PI / 2, Math.PI / 2, false);
      hole.lineTo(-h, ri);
      hole.absarc(-h, 0, ri, Math.PI / 2, Math.PI * 1.5, false);
      shape.holes.push(hole);
      const belt = new THREE.Mesh(new THREE.ExtrudeGeometry(shape, { depth: g.trackW, bevelEnabled: false, curveSegments: 12 }), mTrack);
      belt.position.set(0, r, -g.trackW / 2);
      pod.add(belt);
      for (const x of [-h, h]) {
        const wh = new THREE.Mesh(new THREE.CylinderGeometry(D / 2, D / 2, g.trackW * 0.9, 16), mRim);
        wh.rotation.x = Math.PI / 2; wh.position.set(x, r, 0); pod.add(wh);
      }
      root.add(pod);
    } else {
      const wh = wheel(R, g.tyreW, 'tyre-R' + side);
      wh.position.set(-wbH, R, s * halfTrack);
      root.add(wh);
      if (setup === 'w1') {
        const chains = new THREE.Group(); chains.name = 'chains-' + side;
        for (let i = 0; i < I.chainRings; i++) {
          const z = (i / (I.chainRings - 1) - 0.5) * g.tyreW * 0.9;
          const ring = new THREE.Mesh(new THREE.TorusGeometry(R + I.chainLinkD, I.chainLinkD / 2, 4, 28), mChain);
          ring.position.z = z; chains.add(ring);
        }
        for (let k = 0; k < 12; k++) { // cross links
          const a = (k / 12) * Math.PI * 2;
          const cl = new THREE.Mesh(new THREE.BoxGeometry(I.chainLinkD, I.chainLinkD, g.tyreW * 0.9), mChain);
          cl.position.set(Math.cos(a) * (R + I.chainLinkD), Math.sin(a) * (R + I.chainLinkD), 0);
          cl.rotation.z = a; chains.add(cl);
        }
        wh.children[0].add(chains); // turns with the tyre
      }
    }
  }

  // rider mannequin, sized to stature
  const key = rider === 'child' ? 'rider.stature_min_cm' : 'rider.stature_max_cm';
  const stItem = p.values.get(key);
  const stature = stItem ? Number(stItem.v) / 100 : 1.7;
  const M = I.mannequin;
  const man = new THREE.Group(); man.name = 'rider';
  const hipX = seatX, hipY = seatY + M.limbR;
  const limb = (a, b, r, m, n) => { const t = tube(a, b, n, r, m); root.remove(t); man.add(t); return t; };
  const kneeX = hipX + M.thigh * stature, kneeY = hipY + 0.02;
  const footY = yRail + I.tubeD + 0.01;
  const footX = kneeX + Math.sqrt(Math.max(0, (M.shin * stature) ** 2 - (kneeY - footY) ** 2)) * 0.5;
  const shoulderY = hipY + M.torso * stature;
  const shoulderX = hipX - 0.04;
  for (const s of [-1, 1]) {
    const hz = s * 0.09;
    limb([hipX, hipY, hz], [kneeX, kneeY, hz], M.limbR, mCloth, 'thigh');
    limb([kneeX, kneeY, hz], [footX, footY, hz], M.limbR * 0.9, mCloth, 'shin');
    const sz = s * 0.19;
    const elbow = [shoulderX + M.upperArm * stature * 0.5, shoulderY - M.upperArm * stature * 0.85, sz];
    limb([shoulderX, shoulderY, sz], elbow, M.limbR * 0.8, mCloth, 'upper-arm');
    limb(elbow, [steerX, steerTop, s * I.steeringWheelD / 2 * 0.8], M.limbR * 0.7, mSkin, 'fore-arm');
  }
  limb([hipX, hipY, 0], [shoulderX, shoulderY, 0], M.limbR * 2.2, mCloth, 'torso');
  const head = new THREE.Mesh(new THREE.SphereGeometry(M.head * stature / 2, 12, 10), mSkin);
  head.position.set(shoulderX, shoulderY + M.head * stature * 0.6, 0);
  head.name = 'head'; man.add(head);
  root.add(man);

  // centre of mass
  const cg = new THREE.Mesh(new THREE.SphereGeometry(I.cgRadius, 12, 10), mCg);
  cg.position.set(wbH - p.mass.rearShare * g.wheelbase, cgHeight(p, rider), 0);
  add(cg, 'cg');

  root.userData = {
    setup, rider, stature, cg, steerGroups, steeringWheel,
    // steer: angle (rad) of the front wheels; distance: rolled distance (m)
    animate(steer, distance) {
      for (const s of steerGroups) s.rotation.y = -steer; // sim.js steer is positive to the right; three's +y turns left
      steeringWheel.rotation.x = -steer * 3;
      for (const sp of spinners) sp.obj.rotation.z = -distance / sp.r;
    },
    cgPosition: cg.position.clone(),
  };
  return root;
}
