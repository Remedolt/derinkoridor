/**
 * Flesh-Ripper (melee), Void-Stalker (ranged), Slag-Brute (tank),
 * Gold-Flayer (golden flame melee), Ember-Drone (flying fire)
 */

import * as THREE from "three";

const STATE = { PATROL: "patrol", CHASE: "chase", ATTACK: "attack", DEAD: "dead" };

function std(color, opts = {}) {
  return new THREE.MeshStandardMaterial({
    color,
    map: opts.map || null,
    roughness: opts.roughness ?? 0.72,
    metalness: opts.metalness ?? 0.08,
    flatShading: opts.flat ?? true,
  });
}

function glow(color, _intensity = 1.2) {
  // MeshBasicMaterial: bloom still picks up bright color, but no HDR
  // emissive + PointLight combo that freezes UnrealBloomPass on dispose.
  return new THREE.MeshBasicMaterial({ color });
}

const _skinCache = new Map();
function skin(key, base, speck, count = 110) {
  if (_skinCache.has(key)) return _skinCache.get(key);
  const c = document.createElement("canvas");
  c.width = c.height = 64;
  const ctx = c.getContext("2d");
  ctx.fillStyle = base;
  ctx.fillRect(0, 0, 64, 64);
  ctx.fillStyle = speck;
  for (let i = 0; i < count; i++) {
    ctx.fillRect((Math.random() * 64) | 0, (Math.random() * 64) | 0, 1 + ((Math.random() * 3) | 0), 1);
  }
  const tex = new THREE.CanvasTexture(c);
  tex.magFilter = THREE.NearestFilter;
  tex.minFilter = THREE.NearestFilter;
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.wrapS = tex.wrapT = THREE.RepeatWrapping;
  _skinCache.set(key, tex);
  return tex;
}

function add(parent, geo, mat, x = 0, y = 0, z = 0) {
  const m = new THREE.Mesh(geo, mat);
  m.position.set(x, y, z);
  parent.add(m);
  return m;
}

/** Hunched quadruped predator — organic proportions */
function buildRipper() {
  const g = new THREE.Group();
  const hide = std(0x4a3020, { roughness: 0.9, map: skin("rip-hide", "#4a3020", "#2a1810") });
  const flesh = std(0x6a3a28, { roughness: 0.8, map: skin("rip-flesh", "#6a3a28", "#3a1810") });
  const bone = std(0xc8b090, { roughness: 0.5, metalness: 0.2 });
  const claw = std(0x1a1210, { roughness: 0.35, metalness: 0.4 });
  const scar = std(0x3a1814, { roughness: 0.95 });

  const torso = add(g, new THREE.CapsuleGeometry(0.4, 0.62, 5, 10), hide, 0, 0.82, 0.1);
  torso.rotation.z = Math.PI / 2;
  torso.rotation.y = 0.14;

  const hump = add(g, new THREE.SphereGeometry(0.34, 8, 6), hide, 0, 1.12, 0.18);
  hump.scale.set(1.15, 0.7, 1.4);

  const belly = add(g, new THREE.SphereGeometry(0.34, 8, 6), flesh, 0, 0.46, 0.14);
  belly.scale.set(1.15, 0.72, 1.4);

  for (let i = 0; i < 4; i++) {
    const rib = add(g, new THREE.BoxGeometry(0.42, 0.05, 0.06), bone, 0, 0.62 + i * 0.1, 0.32);
    rib.rotation.x = 0.35;
  }

  const spine = add(g, new THREE.BoxGeometry(0.16, 0.2, 1.15), bone, 0, 1.12, 0.02);
  for (let i = 0; i < 6; i++) {
    const spike = add(
      g,
      new THREE.ConeGeometry(0.075, 0.32 + i * 0.03, 5),
      bone,
      i % 2 ? 0.1 : -0.1,
      1.32,
      -0.42 + i * 0.2
    );
    spike.rotation.x = -0.35;
    const spike2 = add(
      g,
      new THREE.ConeGeometry(0.05, 0.2, 4),
      bone,
      i % 2 ? -0.16 : 0.16,
      1.22,
      -0.38 + i * 0.18
    );
    spike2.rotation.z = (i % 2 ? 1 : -1) * 0.4;
  }

  const neck = add(g, new THREE.CapsuleGeometry(0.17, 0.28, 4, 8), hide, 0, 0.95, -0.62);
  neck.rotation.x = 0.55;

  const skull = add(g, new THREE.SphereGeometry(0.3, 9, 7), flesh, 0, 0.92, -1.02);
  skull.scale.set(1.08, 0.88, 1.35);

  const snout = add(g, new THREE.ConeGeometry(0.16, 0.38, 6), hide, 0, 0.82, -1.38);
  snout.rotation.x = Math.PI / 2;
  const nose = add(g, new THREE.SphereGeometry(0.08, 6, 5), scar, 0, 0.78, -1.52);

  for (const sx of [-1, 1]) {
    const ear = add(g, new THREE.ConeGeometry(0.07, 0.22, 4), hide, sx * 0.2, 1.18, -0.95);
    ear.rotation.z = sx * -0.45;
    ear.rotation.x = -0.3;
  }

  const jaw = add(g, new THREE.BoxGeometry(0.44, 0.13, 0.42), std(0x3a2018, { roughness: 0.92 }), 0, 0.7, -1.1);
  jaw.name = "jaw";
  for (const sx of [-0.14, -0.05, 0.05, 0.14]) {
    const fang = add(jaw, new THREE.ConeGeometry(0.032, 0.16, 4), bone, sx, -0.1, -0.16);
    fang.rotation.x = Math.PI;
  }

  const mawGlow = add(g, new THREE.SphereGeometry(0.12, 7, 6), glow(0xff3311), 0, 0.8, -1.26);
  mawGlow.name = "maw";
  mawGlow.scale.set(1.1, 0.55, 0.8);

  const eyeMat = glow(0xff2200);
  const eyeL = add(g, new THREE.SphereGeometry(0.07, 7, 6), eyeMat, -0.14, 1.0, -1.24);
  const eyeR = add(g, new THREE.SphereGeometry(0.07, 7, 6), eyeMat, 0.14, 1.0, -1.24);
  eyeL.name = "eyeL";
  eyeR.name = "eyeR";
  add(g, new THREE.SphereGeometry(0.045, 5, 5), glow(0xff8844), -0.2, 0.92, -1.18);
  add(g, new THREE.SphereGeometry(0.045, 5, 5), glow(0xff8844), 0.2, 0.92, -1.18);

  for (let i = 0; i < 5; i++) {
    const seg = add(
      g,
      new THREE.CapsuleGeometry(0.09 - i * 0.012, 0.16, 3, 5),
      hide,
      0,
      0.7 - i * 0.05,
      0.58 + i * 0.2
    );
    seg.rotation.x = 0.4;
  }
  const tip = add(g, new THREE.ConeGeometry(0.05, 0.22, 4), claw, 0, 0.46, 1.58);
  tip.rotation.x = Math.PI / 2;

  const placements = [
    [-0.42, 0.1, -0.44],
    [0.42, 0.1, -0.44],
    [-0.4, 0.08, 0.42],
    [0.4, 0.08, 0.42],
  ];
  const limbs = [];
  for (const [x, y, z] of placements) {
    const limb = new THREE.Group();
    limb.position.set(x, y, z);
    add(limb, new THREE.CapsuleGeometry(0.1, 0.3, 3, 6), hide, 0, 0.34, 0);
    add(limb, new THREE.CapsuleGeometry(0.075, 0.24, 3, 6), flesh, 0, 0.1, z < 0 ? -0.07 : 0.07);
    const foot = add(limb, new THREE.BoxGeometry(0.16, 0.08, 0.28), claw, 0, 0.03, z < 0 ? -0.12 : 0.12);
    for (const cx of [-0.05, 0.05]) {
      const talon = add(foot, new THREE.ConeGeometry(0.025, 0.12, 4), claw, cx, -0.02, z < 0 ? -0.16 : 0.16);
      talon.rotation.x = z < 0 ? Math.PI / 2 : -Math.PI / 2;
    }
    g.add(limb);
    limbs.push(limb);
  }
  g.userData.limbs = limbs;
  g.userData.idleKind = "crawler";
  return g;
}

/** Tall bipedal stalker with glowing maw */
function buildStalker() {
  const g = new THREE.Group();
  const hide = std(0x4a4258, { roughness: 0.84, map: skin("stk-hide", "#4a4258", "#221c30") });
  const plate = std(0x6a7588, { roughness: 0.34, metalness: 0.62, map: skin("stk-plate", "#6a7588", "#2a3444") });
  const viscera = glow(0x7a2040);
  const bone = std(0xb8a090, { roughness: 0.5, metalness: 0.15 });

  add(g, new THREE.CapsuleGeometry(0.28, 0.14, 4, 8), hide, 0, 0.88, 0);

  const torso = add(g, new THREE.CapsuleGeometry(0.34, 0.62, 5, 10), hide, 0, 1.5, 0);
  const chest = add(g, new THREE.BoxGeometry(0.56, 0.44, 0.2), plate, 0, 1.62, 0.22);
  for (let i = 0; i < 3; i++) {
    add(g, new THREE.BoxGeometry(0.48, 0.04, 0.08), bone, 0, 1.38 + i * 0.1, 0.3);
  }

  const core = add(g, new THREE.SphereGeometry(0.14, 9, 8), viscera, 0, 1.44, 0.3);
  core.name = "core";
  add(g, new THREE.SphereGeometry(0.07, 6, 6), glow(0xff6688), 0, 1.44, 0.38);

  const cloak = add(g, new THREE.BoxGeometry(0.7, 0.85, 0.08), hide, 0, 1.45, 0.38);
  cloak.rotation.x = 0.25;
  cloak.position.set(0, 1.35, 0.42);

  const neck = add(g, new THREE.CapsuleGeometry(0.12, 0.22, 3, 6), hide, 0, 1.98, -0.02);
  const head = add(g, new THREE.SphereGeometry(0.28, 9, 7), hide, 0, 2.22, -0.06);
  head.scale.set(0.92, 1.28, 1.15);

  const crest = add(g, new THREE.ConeGeometry(0.11, 0.42, 6), plate, 0, 2.62, -0.04);
  add(g, new THREE.ConeGeometry(0.06, 0.22, 4), plate, -0.12, 2.52, 0.02).rotation.z = 0.5;
  add(g, new THREE.ConeGeometry(0.06, 0.22, 4), plate, 0.12, 2.52, 0.02).rotation.z = -0.5;

  const maw = add(g, new THREE.BoxGeometry(0.28, 0.18, 0.22), glow(0xff4422), 0, 2.06, -0.28);
  maw.name = "maw";
  for (const sx of [-0.08, 0.08]) {
    const fang = add(maw, new THREE.ConeGeometry(0.03, 0.1, 4), bone, sx, -0.12, -0.04);
    fang.rotation.x = Math.PI;
  }

  const eye = add(g, new THREE.SphereGeometry(0.085, 8, 7), glow(0x66ffe8), 0, 2.28, -0.28);
  eye.name = "eye";
  add(g, new THREE.TorusGeometry(0.1, 0.02, 5, 10), plate, 0, 2.28, -0.26).rotation.x = Math.PI / 2;

  const arms = [];
  for (const sx of [-1, 1]) {
    const arm = new THREE.Group();
    arm.position.set(sx * 0.46, 1.74, 0);
    const shoulder = add(arm, new THREE.SphereGeometry(0.12, 6, 6), plate, 0, 0, 0);
    shoulder.scale.set(1.2, 0.9, 1);
    const upper = add(arm, new THREE.CapsuleGeometry(0.075, 0.46, 3, 6), hide, sx * 0.04, -0.3, 0);
    upper.rotation.z = sx * 0.22;
    add(arm, new THREE.BoxGeometry(0.12, 0.22, 0.3), plate, sx * 0.1, -0.66, -0.08);
    for (let c = 0; c < 3; c++) {
      const talon = add(arm, new THREE.ConeGeometry(0.025, 0.16, 4), plate, sx * 0.1 + (c - 1) * 0.04, -0.8, -0.16);
      talon.rotation.x = Math.PI / 2.4;
    }
    g.add(arm);
    arms.push(arm);
  }
  g.userData.arms = arms;

  const gun = add(g, new THREE.CylinderGeometry(0.055, 0.09, 0.78, 8), plate, 0.54, 1.22, -0.28);
  gun.rotation.x = Math.PI / 2;
  add(g, new THREE.BoxGeometry(0.14, 0.1, 0.22), plate, 0.54, 1.28, 0.05);
  add(g, new THREE.SphereGeometry(0.06, 6, 6), glow(0x44ffcc), 0.54, 1.22, -0.68);

  for (const sx of [-1, 1]) {
    add(g, new THREE.CapsuleGeometry(0.1, 0.4, 3, 6), hide, sx * 0.2, 0.54, 0);
    add(g, new THREE.CapsuleGeometry(0.075, 0.3, 3, 6), plate, sx * 0.2, 0.18, 0.04);
    add(g, new THREE.BoxGeometry(0.16, 0.1, 0.32), plate, sx * 0.2, 0.05, 0.08);
  }

  g.userData.idleKind = "stalker";
  return g;
}

/** Heavy tank — Slag-Brute */
function buildBrute() {
  const g = new THREE.Group();
  const slag = std(0x6a5a48, { roughness: 0.62, metalness: 0.38, map: skin("brt-slag", "#6a5a48", "#3a2a18") });
  const iron = std(0x8a8880, { roughness: 0.28, metalness: 0.78, map: skin("brt-iron", "#8a8880", "#3a3830") });
  const ember = glow(0xff6622);
  const soot = std(0x1a1410, { roughness: 0.95 });

  add(g, new THREE.BoxGeometry(0.92, 0.44, 0.6), slag, 0, 0.95, 0);
  add(g, new THREE.BoxGeometry(1.12, 1.02, 0.72), slag, 0, 1.68, 0.02);
  add(g, new THREE.BoxGeometry(1.18, 0.18, 0.78), iron, 0, 2.12, 0.02);

  const pauldronL = add(g, new THREE.BoxGeometry(0.42, 0.4, 0.5), iron, -0.68, 2.05, 0);
  const pauldronR = add(g, new THREE.BoxGeometry(0.42, 0.4, 0.5), iron, 0.68, 2.05, 0);
  pauldronL.rotation.z = 0.2;
  pauldronR.rotation.z = -0.2;
  add(g, new THREE.ConeGeometry(0.1, 0.22, 5), iron, -0.72, 2.28, 0.08);
  add(g, new THREE.ConeGeometry(0.1, 0.22, 5), iron, 0.72, 2.28, 0.08);

  for (const sx of [-0.35, 0.35]) {
    const pipe = add(g, new THREE.CylinderGeometry(0.07, 0.09, 0.45, 6), iron, sx, 2.15, 0.42);
    pipe.rotation.x = -0.6;
    add(g, new THREE.SphereGeometry(0.08, 6, 6), ember, sx, 2.32, 0.58);
  }

  const furnace = add(g, new THREE.SphereGeometry(0.2, 9, 8), ember, 0, 1.55, 0.38);
  furnace.name = "furnace";
  add(g, new THREE.BoxGeometry(0.55, 0.08, 0.08), soot, 0, 1.72, 0.42);
  add(g, new THREE.BoxGeometry(0.08, 0.36, 0.08), soot, 0, 1.52, 0.42);
  add(g, new THREE.BoxGeometry(0.08, 0.36, 0.08), soot, 0.16, 1.52, 0.42);
  add(g, new THREE.BoxGeometry(0.08, 0.36, 0.08), soot, -0.16, 1.52, 0.42);

  add(g, new THREE.BoxGeometry(0.52, 0.46, 0.52), slag, 0, 2.38, 0.06);
  add(g, new THREE.BoxGeometry(0.58, 0.16, 0.56), iron, 0, 2.6, 0.06);
  add(g, new THREE.BoxGeometry(0.2, 0.12, 0.12), iron, 0, 2.38, -0.28);

  const bruteEye = glow(0xffaa33);
  const eyeL = add(g, new THREE.BoxGeometry(0.12, 0.09, 0.07), bruteEye, -0.13, 2.4, -0.26);
  const eyeR = add(g, new THREE.BoxGeometry(0.12, 0.09, 0.07), bruteEye, 0.13, 2.4, -0.26);
  eyeL.name = "eyeL";
  eyeR.name = "eyeR";

  const maw = add(g, new THREE.BoxGeometry(0.32, 0.14, 0.16), glow(0xff3300), 0, 2.22, -0.26);
  maw.name = "maw";
  for (const sx of [-0.1, 0.1]) {
    const tusk = add(g, new THREE.ConeGeometry(0.045, 0.22, 5), iron, sx, 2.12, -0.32);
    tusk.rotation.x = 2.4;
  }

  const arms = [];
  for (const sx of [-1, 1]) {
    const arm = new THREE.Group();
    arm.position.set(sx * 0.78, 1.88, 0);
    add(arm, new THREE.BoxGeometry(0.32, 0.78, 0.32), slag, 0, -0.32, 0);
    const fist = add(arm, new THREE.BoxGeometry(0.36, 0.36, 0.42), iron, 0, -0.8, 0.02);
    for (const kx of [-0.1, 0, 0.1]) {
      add(fist, new THREE.BoxGeometry(0.08, 0.08, 0.1), iron, kx, 0.08, -0.24);
    }
    g.add(arm);
    arms.push(arm);
  }
  g.userData.arms = arms;

  for (const sx of [-1, 1]) {
    add(g, new THREE.BoxGeometry(0.32, 0.58, 0.34), slag, sx * 0.3, 0.55, 0);
    add(g, new THREE.BoxGeometry(0.34, 0.22, 0.46), iron, sx * 0.3, 0.12, 0.08);
  }

  g.userData.idleKind = "brute";
  return g;
}

/** Gold-Flayer — golden melee predator with living flame */
function buildGoldFlayer() {
  const g = new THREE.Group();
  const gold = std(0xd4a017, { roughness: 0.24, metalness: 0.88, map: skin("gld", "#d4a017", "#8a5a10", 70) });
  const bronze = std(0x8a5a12, { roughness: 0.38, metalness: 0.74 });
  const flame = glow(0xff7722);

  add(g, new THREE.CapsuleGeometry(0.36, 0.78, 5, 10), gold, 0, 1.18, 0);
  add(g, new THREE.BoxGeometry(0.6, 0.5, 0.32), bronze, 0, 1.38, 0.14);
  add(g, new THREE.BoxGeometry(0.72, 0.7, 0.06), gold, 0, 1.25, 0.38).rotation.x = 0.2;

  const core = add(g, new THREE.SphereGeometry(0.18, 9, 8), flame, 0, 1.22, 0.24);
  core.name = "furnace";

  add(g, new THREE.SphereGeometry(0.28, 9, 7), gold, 0, 1.98, 0);
  const mask = add(g, new THREE.BoxGeometry(0.42, 0.28, 0.12), bronze, 0, 2.0, -0.2);
  mask.rotation.x = -0.15;
  add(g, new THREE.ConeGeometry(0.16, 0.38, 6), bronze, 0, 2.32, 0);
  add(g, new THREE.ConeGeometry(0.07, 0.2, 4), bronze, -0.14, 2.22, 0.02).rotation.z = 0.55;
  add(g, new THREE.ConeGeometry(0.07, 0.2, 4), bronze, 0.14, 2.22, 0.02).rotation.z = -0.55;

  const eyeGlow = glow(0xffee66);
  const eyeL = add(g, new THREE.SphereGeometry(0.065, 7, 6), eyeGlow, -0.11, 2.02, -0.24);
  const eyeR = add(g, new THREE.SphereGeometry(0.065, 7, 6), eyeGlow, 0.11, 2.02, -0.24);
  eyeL.name = "eyeL";
  eyeR.name = "eyeR";

  const maw = add(g, new THREE.BoxGeometry(0.24, 0.11, 0.16), glow(0xff4400), 0, 1.84, -0.24);
  maw.name = "maw";

  const flames = [];
  for (let i = 0; i < 6; i++) {
    const orb = add(
      g,
      new THREE.SphereGeometry(0.07 + (i % 3) * 0.02, 6, 5),
      glow(i % 2 ? 0xffaa33 : 0xff5500),
      (i - 2.5) * 0.11,
      1.5 + (i % 3) * 0.14,
      0.3 + (i % 2) * 0.05
    );
    orb.name = `flame${i}`;
    flames.push(orb);
  }
  for (const sx of [-0.18, 0.18, 0]) {
    const mane = add(g, new THREE.ConeGeometry(0.08, 0.36, 5), flame, sx, 2.15, 0.18);
    mane.rotation.x = 0.7;
  }
  g.userData.flames = flames;

  const arms = [];
  for (const sx of [-1, 1]) {
    const arm = new THREE.Group();
    arm.position.set(sx * 0.5, 1.48, 0);
    add(arm, new THREE.CapsuleGeometry(0.085, 0.48, 3, 6), gold, 0, -0.26, 0);
    const blade = add(arm, new THREE.BoxGeometry(0.07, 0.62, 0.14), bronze, sx * 0.05, -0.74, -0.04);
    blade.rotation.z = sx * 0.12;
    add(arm, new THREE.ConeGeometry(0.07, 0.28, 5), bronze, sx * 0.05, -1.12, -0.04).rotation.x = Math.PI;
    add(arm, new THREE.SphereGeometry(0.075, 6, 5), flame, sx * 0.05, -1.22, -0.04);
    g.add(arm);
    arms.push(arm);
  }
  g.userData.arms = arms;

  for (const sx of [-1, 1]) {
    add(g, new THREE.CapsuleGeometry(0.11, 0.42, 3, 6), gold, sx * 0.22, 0.55, 0);
    add(g, new THREE.BoxGeometry(0.2, 0.14, 0.3), bronze, sx * 0.22, 0.1, 0.05);
  }

  g.userData.idleKind = "goldflayer";
  return g;
}

/** Ember-Drone — hovering fire drone */
function buildEmberDrone() {
  const g = new THREE.Group();
  const hull = std(0x3a2818, { roughness: 0.42, metalness: 0.6, map: skin("drn-hull", "#3a2818", "#1a1008") });
  const gold = std(0xc9a227, { roughness: 0.26, metalness: 0.84 });
  const iron = std(0x4a4844, { roughness: 0.4, metalness: 0.7 });
  const flame = glow(0xff6622);

  const body = add(g, new THREE.SphereGeometry(0.4, 12, 9), hull, 0, 0, 0);
  body.scale.set(1.2, 0.72, 1.05);
  add(g, new THREE.OctahedronGeometry(0.22, 0), iron, 0, 0.08, 0);

  const ring = add(g, new THREE.TorusGeometry(0.46, 0.055, 7, 18), gold, 0, 0.06, 0);
  ring.rotation.x = Math.PI / 2;
  add(g, new THREE.TorusGeometry(0.22, 0.03, 6, 12), gold, 0, 0.04, -0.32).rotation.x = Math.PI / 2;

  const core = add(g, new THREE.SphereGeometry(0.2, 9, 8), flame, 0, 0, 0);
  core.name = "furnace";

  const eye = add(g, new THREE.SphereGeometry(0.1, 8, 7), glow(0xffee55), 0, 0.06, -0.4);
  eye.name = "eye";
  add(g, new THREE.CylinderGeometry(0.12, 0.14, 0.08, 10), iron, 0, 0.06, -0.34).rotation.x = Math.PI / 2;

  for (const sx of [-1, 1]) {
    const gun = add(g, new THREE.CylinderGeometry(0.04, 0.055, 0.32, 6), iron, sx * 0.38, -0.04, -0.22);
    gun.rotation.x = Math.PI / 2;
    add(g, new THREE.SphereGeometry(0.045, 5, 5), flame, sx * 0.38, -0.04, -0.4);
  }

  const flames = [];
  for (let i = 0; i < 6; i++) {
    const a = (i / 6) * Math.PI * 2;
    const orb = add(
      g,
      new THREE.SphereGeometry(0.065, 6, 5),
      glow(i % 2 ? 0xffaa44 : 0xff3300),
      Math.cos(a) * 0.48,
      -0.16,
      Math.sin(a) * 0.48
    );
    flames.push(orb);
  }
  g.userData.flames = flames;

  add(g, new THREE.CylinderGeometry(0.08, 0.14, 0.18, 7), iron, 0, -0.28, 0);
  add(g, new THREE.SphereGeometry(0.1, 6, 6), flame, 0, -0.4, 0);

  const blades = new THREE.Group();
  blades.name = "rotors";
  for (let i = 0; i < 4; i++) {
    const blade = add(blades, new THREE.BoxGeometry(0.82, 0.03, 0.1), gold, 0, 0, 0);
    blade.rotation.y = (i / 4) * Math.PI * 2;
    add(blade, new THREE.BoxGeometry(0.12, 0.04, 0.16), iron, 0.34, 0, 0);
  }
  blades.position.y = 0.32;
  g.add(blades);
  g.userData.rotors = blades;

  for (const a of [0.7, 2.3, 3.9, 5.5]) {
    const leg = add(g, new THREE.BoxGeometry(0.06, 0.06, 0.28), iron, Math.cos(a) * 0.32, -0.22, Math.sin(a) * 0.32);
    leg.rotation.y = -a;
    leg.rotation.x = 0.5;
  }

  g.userData.idleKind = "flyer";
  return g;
}

const TYPE_STATS = {
  crawler: {
    radius: 0.75,
    hitHeight: 0.7,
    hp: 60,
    speed: 4.4,
    detectRange: 14,
    attackRange: 1.7,
    attackRate: 0.85,
    damage: 13,
    scoreValue: 100,
    flying: false,
    build: buildRipper,
  },
  sentry: {
    radius: 0.58,
    hitHeight: 1.35,
    hp: 80,
    speed: 3.15,
    detectRange: 18,
    attackRange: 12,
    attackRate: 1.35,
    damage: 10,
    scoreValue: 150,
    flying: false,
    build: buildStalker,
  },
  brute: {
    radius: 0.9,
    hitHeight: 1.5,
    hp: 160,
    speed: 2.35,
    detectRange: 12,
    attackRange: 2.1,
    attackRate: 1.1,
    damage: 22,
    scoreValue: 250,
    flying: false,
    build: buildBrute,
  },
  goldflayer: {
    radius: 0.7,
    hitHeight: 1.2,
    hp: 95,
    speed: 3.9,
    detectRange: 15,
    attackRange: 1.85,
    attackRate: 0.75,
    damage: 16,
    scoreValue: 180,
    flying: false,
    build: buildGoldFlayer,
  },
  flyer: {
    radius: 0.55,
    hitHeight: 1.85,
    hp: 55,
    speed: 3.6,
    detectRange: 20,
    attackRange: 11,
    attackRate: 1.15,
    damage: 11,
    scoreValue: 160,
    flying: true,
    flyY: 1.85,
    diveRange: 3.2,
    build: buildEmberDrone,
  },
};

class Enemy {
  static _graveyard = [];

  constructor(scene, level, type, position) {
    this.scene = scene;
    this.level = level;
    this.type = type;
    this.alive = true;
    this.state = STATE.PATROL;
    this.position = position.clone();
    this.position.y = 0;
    this.yaw = Math.random() * Math.PI * 2;
    const stats = TYPE_STATS[type] || TYPE_STATS.crawler;
    this.radius = stats.radius;
    this.hitHeight = stats.hitHeight;
    this.hp = stats.hp;
    this.speed = stats.speed;
    this.detectRange = stats.detectRange;
    this.attackRange = stats.attackRange;
    this.attackCooldown = 0;
    this.attackRate = stats.attackRate;
    this.damage = stats.damage;
    this.scoreValue = stats.scoreValue;
    this.scoreValue = this.scoreValue;
    this.hitHeight = this.hitHeight;
    this.flying = !!stats.flying;
    this.flyY = stats.flyY || 1.8;
    this.diveRange = stats.diveRange || 3;
    this.diving = false;
    this.diveTimer = 0;
    this.patrolTimer = 0;
    this.patrolDir = new THREE.Vector3(Math.cos(this.yaw), 0, Math.sin(this.yaw));
    this.mesh = stats.build();
    this.mesh.position.copy(this.position);
    this.scene.add(this.mesh);
    this.projectiles = [];
    this._idlePhase = Math.random() * Math.PI * 2;
  }

  takeDamage(amount) {
    if (!this.alive) return;
    this.hp -= amount;
    this.state = STATE.CHASE;
    if (this.hp <= 0) this.kill();
  }

  /**
   * Remove from the scene immediately, but do NOT dispose GPU resources
   * this frame. UnrealBloomPass freezes if emissive mats / PointLights
   * are disposed while still in the bloom mip chain.
   */
  kill() {
    if (!this.alive && !this.mesh) return;
    this.alive = false;
    this.state = STATE.DEAD;
    this._clearProjectiles();

    const root = this.mesh;
    this.mesh = null;
    if (!root) return;

    root.traverse((o) => {
      if (o.isLight) {
        o.intensity = 0;
        o.parent?.remove(o);
      }
    });
    root.visible = false;
    this.scene.remove(root);
    Enemy._graveyard.push(root);
  }

  static flushGraveyard() {
    const list = Enemy._graveyard;
    if (!list.length) return;
    for (const root of list) {
      const geometries = new Set();
      const materials = new Set();
      root.traverse((o) => {
        if (o.geometry) geometries.add(o.geometry);
        const mat = o.material;
        if (!mat) return;
        if (Array.isArray(mat)) mat.forEach((m) => m && materials.add(m));
        else materials.add(mat);
      });
      for (const geo of geometries) {
        try {
          geo.dispose();
        } catch {
          /* ignore */
        }
      }
      for (const mat of materials) {
        try {
          mat.dispose();
        } catch {
          /* ignore */
        }
      }
    }
    list.length = 0;
  }

  _clearProjectiles() {
    for (const p of this.projectiles) {
      this.scene.remove(p.mesh);
      p.mesh.visible = false;
      Enemy._graveyard.push(p.mesh);
    }
    this.projectiles.length = 0;
  }

  _idleAnim(t) {
    if (!this.mesh) return;
    const kind = this.mesh.userData.idleKind;
    const phase = t + this._idlePhase;

    if (kind === "crawler") {
      this.mesh.position.y = Math.abs(Math.sin(phase * 1.8)) * 0.07;
      const limbs = this.mesh.userData.limbs || [];
      limbs.forEach((limb, i) => {
        limb.rotation.x = Math.sin(phase * 2.2 + i) * 0.18;
      });
      const jaw = this.mesh.getObjectByName("jaw");
      if (jaw) jaw.rotation.x = Math.sin(phase * 1.4) * 0.12;
      const maw = this.mesh.getObjectByName("maw");
      if (maw?.material) maw.material.emissiveIntensity = 1.1 + Math.sin(phase * 3) * 0.4;
    } else if (kind === "stalker") {
      this.mesh.position.y = Math.sin(phase * 1.2) * 0.04;
      const arms = this.mesh.userData.arms || [];
      arms.forEach((arm, i) => {
        arm.rotation.x = Math.sin(phase * 1.5 + i) * 0.1;
      });
      const eye = this.mesh.getObjectByName("eye");
      if (eye?.material) eye.material.emissiveIntensity = 1.4 + Math.sin(phase * 4) * 0.5;
      const maw = this.mesh.getObjectByName("maw");
      if (maw?.material) maw.material.emissiveIntensity = 1.2 + Math.sin(phase * 2.5) * 0.35;
      const core = this.mesh.getObjectByName("core");
      if (core) {
        const s = 1 + Math.sin(phase * 2) * 0.08;
        core.scale.setScalar(s);
      }
    } else if (kind === "brute") {
      this.mesh.position.y = Math.abs(Math.sin(phase * 0.9)) * 0.03;
      const arms = this.mesh.userData.arms || [];
      arms.forEach((arm, i) => {
        arm.rotation.x = Math.sin(phase * 1.1 + i * 1.5) * 0.08;
      });
      const furnace = this.mesh.getObjectByName("furnace");
      if (furnace?.material) {
        furnace.material.emissiveIntensity = 0.9 + Math.sin(phase * 2.8) * 0.45;
      }
      ["eyeL", "eyeR", "maw"].forEach((n) => {
        const o = this.mesh.getObjectByName(n);
        if (o?.material) o.material.emissiveIntensity = 1.2 + Math.sin(phase * 3 + 1) * 0.4;
      });
    } else if (kind === "goldflayer") {
      this.mesh.position.y = Math.abs(Math.sin(phase * 1.4)) * 0.05;
      const arms = this.mesh.userData.arms || [];
      arms.forEach((arm, i) => {
        arm.rotation.x = Math.sin(phase * 1.8 + i) * 0.14;
        arm.rotation.z = Math.sin(phase * 1.2 + i) * 0.08;
      });
      const flames = this.mesh.userData.flames || [];
      flames.forEach((f, i) => {
        const s = 0.85 + Math.sin(phase * 4 + i) * 0.25;
        f.scale.setScalar(s);
        f.position.y = 1.45 + (i % 3) * 0.12 + Math.sin(phase * 3 + i) * 0.08;
        if (f.material) f.material.emissiveIntensity = 1.4 + Math.sin(phase * 5 + i) * 0.5;
      });
      const furnace = this.mesh.getObjectByName("furnace");
      if (furnace?.material) {
        furnace.material.emissiveIntensity = 1.2 + Math.sin(phase * 3.5) * 0.55;
        const s = 1 + Math.sin(phase * 2.5) * 0.12;
        furnace.scale.setScalar(s);
      }
      ["eyeL", "eyeR", "maw"].forEach((n) => {
        const o = this.mesh.getObjectByName(n);
        if (o?.material) o.material.emissiveIntensity = 1.4 + Math.sin(phase * 4) * 0.45;
      });
    } else if (kind === "flyer") {
      const baseY = this.diving ? 0.9 : this.flyY;
      this.mesh.position.y = baseY + Math.sin(phase * 1.6) * 0.18;
      const rotors = this.mesh.userData.rotors;
      if (rotors) rotors.rotation.y += 0.35;
      const flames = this.mesh.userData.flames || [];
      flames.forEach((f, i) => {
        const a = (i / flames.length) * Math.PI * 2 + phase * 1.5;
        f.position.set(Math.cos(a) * 0.45, -0.12 + Math.sin(phase * 3 + i) * 0.06, Math.sin(a) * 0.45);
        const s = 0.8 + Math.sin(phase * 5 + i) * 0.3;
        f.scale.setScalar(s);
      });
      const furnace = this.mesh.getObjectByName("furnace");
      if (furnace?.material) {
        furnace.material.emissiveIntensity = 1.3 + Math.sin(phase * 4) * 0.5;
      }
      const eye = this.mesh.getObjectByName("eye");
      if (eye?.material) eye.material.emissiveIntensity = 1.6 + Math.sin(phase * 5) * 0.5;
    }
  }

  update(dt, player, audio) {
    if (!this.alive || !this.mesh || !player.alive) {
      this._updateProjectiles(dt, player, audio);
      return;
    }

    this.attackCooldown = Math.max(0, this.attackCooldown - dt);
    if (this.diveTimer > 0) this.diveTimer -= dt;
    if (this.diveTimer <= 0) this.diving = false;

    const toPlayer = player.position.clone().sub(this.position);
    toPlayer.y = 0;
    const dist = toPlayer.length();
    const los =
      dist < this.detectRange &&
      this.level.hasLineOfSight(this.position, player.position);

    if (los) {
      this.state = dist <= this.attackRange ? STATE.ATTACK : STATE.CHASE;
    } else if (this.state !== STATE.PATROL) {
      this.patrolTimer = 0;
      this.state = STATE.PATROL;
    }

    if (this.state === STATE.PATROL) {
      this.patrolTimer -= dt;
      if (this.patrolTimer <= 0) {
        this.yaw = Math.random() * Math.PI * 2;
        this.patrolDir.set(Math.cos(this.yaw), 0, Math.sin(this.yaw));
        this.patrolTimer = 1.5 + Math.random() * 2;
      }
      this._move(this.patrolDir, this.speed * 0.45, dt);
    } else if (this.state === STATE.CHASE) {
      toPlayer.normalize();
      this.yaw = Math.atan2(toPlayer.x, toPlayer.z);
      this._move(toPlayer, this.speed, dt);
    } else if (this.state === STATE.ATTACK) {
      toPlayer.normalize();
      this.yaw = Math.atan2(toPlayer.x, toPlayer.z);

      if (this.type === "sentry" || this.type === "flyer") {
        if (dist < 5) this._move(toPlayer.clone().negate(), this.speed * 0.6, dt);

        // Ember-Drone dive when close
        if (this.type === "flyer" && dist <= this.diveRange && this.attackCooldown <= 0) {
          this.diving = true;
          this.diveTimer = 0.45;
          player.takeDamage(this.damage);
          audio.play("hurt");
          this.attackCooldown = this.attackRate * 0.85;
        } else if (this.attackCooldown <= 0 && los) {
          this._fireProjectile(player.position);
          audio.play("enemyShot");
          this.attackCooldown = this.attackRate;
        }
      } else {
        if (dist > this.attackRange * 0.7) this._move(toPlayer, this.speed * 0.8, dt);
        if (this.attackCooldown <= 0 && dist <= this.attackRange) {
          player.takeDamage(this.damage);
          audio.play("hurt");
          this.attackCooldown = this.attackRate;
        }
      }
    }

    this.mesh.position.set(this.position.x, 0, this.position.z);
    this.mesh.rotation.y = this.yaw;
    this._idleAnim(performance.now() * 0.008);

    this._updateProjectiles(dt, player, audio);
  }

  _move(dir, speed, dt) {
    const next = this.position.clone();
    next.x += dir.x * speed * dt;
    next.z += dir.z * speed * dt;
    const resolved = this.level.resolveCollision(next, this.radius * 0.85);
    this.position.x = resolved.x;
    this.position.z = resolved.z;
  }

  _fireProjectile(targetPos) {
    const shotY = this.flying ? (this.diving ? 1.1 : this.flyY) : 1.45;
    const origin = this.position.clone().add(new THREE.Vector3(0, shotY, 0));
    const dir = targetPos.clone().sub(origin).normalize();
    const isFlame = this.type === "flyer" || this.type === "goldflayer";
    const mesh = new THREE.Mesh(
      new THREE.SphereGeometry(isFlame ? 0.14 : 0.12, 6, 6),
      new THREE.MeshBasicMaterial({ color: isFlame ? 0xff8833 : 0xff4422 })
    );
    mesh.position.copy(origin);
    this.scene.add(mesh);
    this.projectiles.push({ mesh, dir, speed: this.flying ? 12 : 14, life: 2.5 });
  }

  _updateProjectiles(dt, player, audio) {
    for (let i = this.projectiles.length - 1; i >= 0; i--) {
      const p = this.projectiles[i];
      p.life -= dt;
      p.mesh.position.addScaledVector(p.dir, p.speed * dt);
      const g = this.level.worldToGrid(p.mesh.position.x, p.mesh.position.z);
      const hitWall = this.level.isWallAt(g.gx, g.gz);
      const hitPlayer =
        player.alive &&
        p.mesh.position.distanceTo(player.position) < 0.7;

      if (hitPlayer) {
        player.takeDamage(this.damage);
        audio?.play("hurt");
      }

      if (p.life <= 0 || hitWall || hitPlayer) {
        this.scene.remove(p.mesh);
        p.mesh.visible = false;
        Enemy._graveyard.push(p.mesh);
        this.projectiles.splice(i, 1);
      }
    }
  }

  dispose() {
    if (this.mesh || this.alive) this.kill();
    else this._clearProjectiles();
  }
}

export class EnemyManager {
  constructor(scene, level) {
    this.scene = scene;
    this.level = level;
    this.enemies = [];
  }

  /**
   * Spawn a wave from spawn positions.
   * @param {THREE.Vector3[]} spawnPositions
   * @param {number} wave 1–3
   */
  spawnWave(spawnPositions, wave = 1) {
    this.clear();
    if (!spawnPositions.length) return;

    let picks;
    if (wave === 1) {
      picks = spawnPositions.filter((_, i) => i % 3 === 0);
      if (picks.length < 4) picks = spawnPositions.slice(0, Math.min(6, spawnPositions.length));
    } else if (wave === 2) {
      picks = spawnPositions.filter((_, i) => i % 2 === 0);
      if (picks.length < 8) picks = spawnPositions.slice(0, Math.ceil(spawnPositions.length * 0.65));
    } else {
      picks = spawnPositions.slice();
    }

    picks.forEach((pos, i) => {
      let type;
      if (wave === 1) {
        // Mix: crawlers, sentries, flyers, occasional gold flayer
        if (i % 5 === 0) type = "flyer";
        else if (i % 4 === 0) type = "sentry";
        else if (i === 2) type = "goldflayer";
        else type = "crawler";
      } else if (wave === 2) {
        if (i % 4 === 0) type = "flyer";
        else if (i % 5 === 0) type = "brute";
        else if (i % 3 === 0) type = "goldflayer";
        else if (i % 2 === 0) type = "sentry";
        else type = "crawler";
      } else {
        if (i % 5 === 0) type = "flyer";
        else if (i % 4 === 0) type = "brute";
        else if (i % 3 === 0) type = "goldflayer";
        else if (i % 2 === 0) type = "sentry";
        else type = "crawler";
      }
      this.enemies.push(new Enemy(this.scene, this.level, type, pos));
    });
  }

  /** @deprecated use spawnWave */
  spawnAll(spawnPositions) {
    this.spawnWave(spawnPositions, 3);
  }

  clear() {
    for (const e of this.enemies) e.dispose();
    this.enemies.length = 0;
  }

  /** Call at the start of a frame, never in the same frame as a kill + bloom. */
  flushDead() {
    Enemy.flushGraveyard();
  }

  update(dt, player, audio) {
    for (const e of this.enemies) e.update(dt, player, audio);
  }

  get aliveCount() {
    return this.enemies.filter((e) => e.alive).length;
  }

  get list() {
    return this.enemies;
  }
}
