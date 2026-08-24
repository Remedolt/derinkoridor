/**
 * Flesh-Ripper (melee), Void-Stalker (ranged), Slag-Brute (tank),
 * Gold-Flayer (golden flame melee), Ember-Drone (flying fire)
 */

import * as THREE from "three";

const STATE = { PATROL: "patrol", CHASE: "chase", ATTACK: "attack", DEAD: "dead" };

function std(color, opts = {}) {
  return new THREE.MeshStandardMaterial({
    color,
    roughness: opts.roughness ?? 0.72,
    metalness: opts.metalness ?? 0.08,
    emissive: opts.emissive ?? 0x000000,
    emissiveIntensity: opts.emi ?? 0,
    flatShading: opts.flat ?? true,
  });
}

function glow(color, _intensity = 1.2) {
  // MeshBasicMaterial: bloom still picks up bright color, but no HDR
  // emissive + PointLight combo that freezes UnrealBloomPass on dispose.
  return new THREE.MeshBasicMaterial({ color });
}

/** Hunched quadruped predator — organic proportions */
function buildRipper() {
  const g = new THREE.Group();
  const hide = std(0x4a3020, { roughness: 0.88 });
  const flesh = std(0x6a3a28, { roughness: 0.78 });
  const bone = std(0xc8b090, { roughness: 0.55, metalness: 0.15 });
  const claw = std(0x1a1210, { roughness: 0.4, metalness: 0.35 });

  const torso = new THREE.Mesh(new THREE.CapsuleGeometry(0.38, 0.55, 4, 8), hide);
  torso.rotation.z = Math.PI / 2;
  torso.rotation.y = 0.12;
  torso.position.set(0, 0.78, 0.08);
  g.add(torso);

  const belly = new THREE.Mesh(new THREE.SphereGeometry(0.32, 8, 6), flesh);
  belly.scale.set(1.1, 0.7, 1.35);
  belly.position.set(0, 0.48, 0.12);
  g.add(belly);

  const spine = new THREE.Mesh(new THREE.BoxGeometry(0.14, 0.18, 1.0), bone);
  spine.position.set(0, 1.05, 0.02);
  g.add(spine);
  for (let i = 0; i < 5; i++) {
    const spike = new THREE.Mesh(new THREE.ConeGeometry(0.07, 0.28 + i * 0.02, 5), bone);
    spike.position.set((i % 2 ? 0.08 : -0.08), 1.22, -0.38 + i * 0.22);
    spike.rotation.x = -0.25;
    g.add(spike);
  }

  const neck = new THREE.Mesh(new THREE.CapsuleGeometry(0.16, 0.22, 3, 6), hide);
  neck.rotation.x = 0.55;
  neck.position.set(0, 0.92, -0.62);
  g.add(neck);

  const skull = new THREE.Mesh(new THREE.SphereGeometry(0.28, 8, 6), flesh);
  skull.scale.set(1.05, 0.85, 1.25);
  skull.position.set(0, 0.9, -1.0);
  g.add(skull);

  const jaw = new THREE.Mesh(new THREE.BoxGeometry(0.42, 0.12, 0.38), std(0x3a2018, { roughness: 0.9 }));
  jaw.position.set(0, 0.7, -1.08);
  jaw.name = "jaw";
  g.add(jaw);
  for (const sx of [-0.12, 0, 0.12]) {
    const fang = new THREE.Mesh(new THREE.ConeGeometry(0.035, 0.15, 4), bone);
    fang.rotation.x = Math.PI;
    fang.position.set(sx, 0.64, -1.24);
    g.add(fang);
  }

  const mawGlow = new THREE.Mesh(
    new THREE.SphereGeometry(0.1, 6, 6),
    glow(0xff3311, 1.4)
  );
  mawGlow.position.set(0, 0.78, -1.22);
  mawGlow.name = "maw";
  g.add(mawGlow);

  const eyeMat = glow(0xff2200, 1.6);
  const eyeL = new THREE.Mesh(new THREE.SphereGeometry(0.065, 6, 6), eyeMat);
  const eyeR = new THREE.Mesh(new THREE.SphereGeometry(0.065, 6, 6), eyeMat);
  eyeL.position.set(-0.13, 0.98, -1.22);
  eyeR.position.set(0.13, 0.98, -1.22);
  eyeL.name = "eyeL";
  eyeR.name = "eyeR";
  g.add(eyeL, eyeR);

  const placements = [
    [-0.4, 0.1, -0.42],
    [0.4, 0.1, -0.42],
    [-0.38, 0.08, 0.4],
    [0.38, 0.08, 0.4],
  ];
  const limbs = [];
  for (const [x, y, z] of placements) {
    const limb = new THREE.Group();
    limb.position.set(x, y, z);
    const thigh = new THREE.Mesh(new THREE.CapsuleGeometry(0.09, 0.28, 3, 5), hide);
    thigh.position.y = 0.32;
    limb.add(thigh);
    const shin = new THREE.Mesh(new THREE.CapsuleGeometry(0.07, 0.22, 3, 5), flesh);
    shin.position.set(0, 0.1, z < 0 ? -0.06 : 0.06);
    limb.add(shin);
    const foot = new THREE.Mesh(new THREE.BoxGeometry(0.14, 0.07, 0.26), claw);
    foot.position.set(0, 0.03, z < 0 ? -0.1 : 0.1);
    limb.add(foot);
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
  const hide = std(0x2a2438, { roughness: 0.82 });
  const plate = std(0x4a5568, { roughness: 0.38, metalness: 0.55 });
  const viscera = glow(0x7a2040, 0.7);

  const hips = new THREE.Mesh(new THREE.CapsuleGeometry(0.26, 0.12, 3, 6), hide);
  hips.position.y = 0.88;
  g.add(hips);

  const torso = new THREE.Mesh(new THREE.CapsuleGeometry(0.32, 0.55, 4, 8), hide);
  torso.position.y = 1.48;
  g.add(torso);

  const chest = new THREE.Mesh(new THREE.BoxGeometry(0.5, 0.4, 0.18), plate);
  chest.position.set(0, 1.58, 0.2);
  g.add(chest);

  const core = new THREE.Mesh(new THREE.SphereGeometry(0.12, 8, 8), viscera);
  core.position.set(0, 1.42, 0.26);
  core.name = "core";
  g.add(core);

  const head = new THREE.Mesh(new THREE.SphereGeometry(0.26, 8, 6), hide);
  head.scale.set(0.95, 1.15, 1.1);
  head.position.set(0, 2.18, -0.04);
  g.add(head);

  const crest = new THREE.Mesh(new THREE.ConeGeometry(0.1, 0.38, 5), plate);
  crest.position.set(0, 2.55, -0.04);
  g.add(crest);

  const maw = new THREE.Mesh(new THREE.BoxGeometry(0.26, 0.16, 0.2), glow(0xff4422, 1.5));
  maw.position.set(0, 2.04, -0.26);
  maw.name = "maw";
  g.add(maw);

  const eye = new THREE.Mesh(new THREE.SphereGeometry(0.075, 6, 6), glow(0x66ffe8, 1.8));
  eye.position.set(0, 2.24, -0.26);
  eye.name = "eye";
  g.add(eye);

  const arms = [];
  for (const sx of [-1, 1]) {
    const arm = new THREE.Group();
    arm.position.set(sx * 0.42, 1.7, 0);
    const upper = new THREE.Mesh(new THREE.CapsuleGeometry(0.07, 0.42, 3, 5), hide);
    upper.position.y = -0.28;
    upper.rotation.z = sx * 0.2;
    arm.add(upper);
    const clawMesh = new THREE.Mesh(new THREE.BoxGeometry(0.1, 0.2, 0.26), plate);
    clawMesh.position.set(sx * 0.08, -0.62, -0.06);
    arm.add(clawMesh);
    g.add(arm);
    arms.push(arm);
  }
  g.userData.arms = arms;

  const gun = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.08, 0.65, 6), plate);
  gun.rotation.x = Math.PI / 2;
  gun.position.set(0.52, 1.22, -0.22);
  g.add(gun);

  for (const sx of [-1, 1]) {
    const thigh = new THREE.Mesh(new THREE.CapsuleGeometry(0.09, 0.38, 3, 5), hide);
    thigh.position.set(sx * 0.18, 0.52, 0);
    g.add(thigh);
    const shin = new THREE.Mesh(new THREE.CapsuleGeometry(0.07, 0.28, 3, 5), plate);
    shin.position.set(sx * 0.18, 0.18, 0.02);
    g.add(shin);
  }

  g.userData.idleKind = "stalker";
  return g;
}

/** Heavy tank — Slag-Brute */
function buildBrute() {
  const g = new THREE.Group();
  const slag = std(0x3a3228, { roughness: 0.65, metalness: 0.35 });
  const iron = std(0x5a5850, { roughness: 0.32, metalness: 0.7 });
  const ember = glow(0xff6622, 1.1);

  const pelvis = new THREE.Mesh(new THREE.BoxGeometry(0.85, 0.4, 0.55), slag);
  pelvis.position.y = 0.95;
  g.add(pelvis);

  const torso = new THREE.Mesh(new THREE.BoxGeometry(1.05, 0.95, 0.65), slag);
  torso.position.y = 1.65;
  g.add(torso);

  const pauldronL = new THREE.Mesh(new THREE.BoxGeometry(0.35, 0.35, 0.45), iron);
  const pauldronR = new THREE.Mesh(new THREE.BoxGeometry(0.35, 0.35, 0.45), iron);
  pauldronL.position.set(-0.62, 2.0, 0);
  pauldronR.position.set(0.62, 2.0, 0);
  g.add(pauldronL, pauldronR);

  const furnace = new THREE.Mesh(new THREE.SphereGeometry(0.18, 8, 8), ember);
  furnace.position.set(0, 1.55, 0.32);
  furnace.name = "furnace";
  g.add(furnace);

  const head = new THREE.Mesh(new THREE.BoxGeometry(0.48, 0.42, 0.48), slag);
  head.position.set(0, 2.35, 0.05);
  g.add(head);

  const helm = new THREE.Mesh(new THREE.BoxGeometry(0.52, 0.18, 0.52), iron);
  helm.position.set(0, 2.55, 0.05);
  g.add(helm);

  const bruteEye = glow(0xffaa33, 1.8);
  const eyeL = new THREE.Mesh(new THREE.BoxGeometry(0.1, 0.08, 0.06), bruteEye);
  const eyeR = new THREE.Mesh(new THREE.BoxGeometry(0.1, 0.08, 0.06), bruteEye.clone());
  eyeL.position.set(-0.12, 2.38, -0.24);
  eyeR.position.set(0.12, 2.38, -0.24);
  eyeL.name = "eyeL";
  eyeR.name = "eyeR";
  g.add(eyeL, eyeR);

  const maw = new THREE.Mesh(new THREE.BoxGeometry(0.28, 0.12, 0.14), glow(0xff3300, 1.3));
  maw.position.set(0, 2.22, -0.24);
  maw.name = "maw";
  g.add(maw);

  const arms = [];
  for (const sx of [-1, 1]) {
    const arm = new THREE.Group();
    arm.position.set(sx * 0.7, 1.85, 0);
    const upper = new THREE.Mesh(new THREE.BoxGeometry(0.28, 0.7, 0.28), slag);
    upper.position.y = -0.3;
    arm.add(upper);
    const fist = new THREE.Mesh(new THREE.BoxGeometry(0.32, 0.32, 0.38), iron);
    fist.position.y = -0.75;
    arm.add(fist);
    g.add(arm);
    arms.push(arm);
  }
  g.userData.arms = arms;

  for (const sx of [-1, 1]) {
    const thigh = new THREE.Mesh(new THREE.BoxGeometry(0.28, 0.55, 0.3), slag);
    thigh.position.set(sx * 0.28, 0.55, 0);
    g.add(thigh);
    const boot = new THREE.Mesh(new THREE.BoxGeometry(0.3, 0.2, 0.4), iron);
    boot.position.set(sx * 0.28, 0.12, 0.05);
    g.add(boot);
  }

  g.userData.idleKind = "brute";
  return g;
}

/** Gold-Flayer — golden melee predator with living flame */
function buildGoldFlayer() {
  const g = new THREE.Group();
  const gold = std(0xd4a017, {
    roughness: 0.28,
    metalness: 0.85,
  });
  const bronze = std(0x8a5a12, { roughness: 0.4, metalness: 0.7 });
  const flame = glow(0xff7722, 1.6);

  const torso = new THREE.Mesh(new THREE.CapsuleGeometry(0.34, 0.7, 4, 8), gold);
  torso.position.y = 1.15;
  g.add(torso);

  const chest = new THREE.Mesh(new THREE.BoxGeometry(0.55, 0.45, 0.28), bronze);
  chest.position.set(0, 1.35, 0.12);
  g.add(chest);

  const core = new THREE.Mesh(new THREE.SphereGeometry(0.16, 8, 8), flame);
  core.position.set(0, 1.2, 0.22);
  core.name = "furnace";
  g.add(core);

  const head = new THREE.Mesh(new THREE.SphereGeometry(0.26, 8, 6), gold);
  head.position.set(0, 1.95, 0);
  g.add(head);

  const crown = new THREE.Mesh(new THREE.ConeGeometry(0.14, 0.32, 5), bronze);
  crown.position.set(0, 2.28, 0);
  g.add(crown);

  const eyeGlow = glow(0xffee66, 2);
  const eyeL = new THREE.Mesh(new THREE.SphereGeometry(0.06, 6, 6), eyeGlow);
  const eyeR = new THREE.Mesh(new THREE.SphereGeometry(0.06, 6, 6), eyeGlow.clone());
  eyeL.position.set(-0.1, 2.0, -0.22);
  eyeR.position.set(0.1, 2.0, -0.22);
  eyeL.name = "eyeL";
  eyeR.name = "eyeR";
  g.add(eyeL, eyeR);

  const maw = new THREE.Mesh(new THREE.BoxGeometry(0.22, 0.1, 0.14), glow(0xff4400, 1.5));
  maw.position.set(0, 1.82, -0.22);
  maw.name = "maw";
  g.add(maw);

  const flames = [];
  for (let i = 0; i < 5; i++) {
    const orb = new THREE.Mesh(
      new THREE.SphereGeometry(0.07 + Math.random() * 0.04, 5, 5),
      glow(i % 2 ? 0xffaa33 : 0xff5500, 1.8)
    );
    orb.position.set((i - 2) * 0.12, 1.5 + (i % 3) * 0.15, 0.28 + (i % 2) * 0.05);
    orb.name = `flame${i}`;
    g.add(orb);
    flames.push(orb);
  }
  g.userData.flames = flames;

  const arms = [];
  for (const sx of [-1, 1]) {
    const arm = new THREE.Group();
    arm.position.set(sx * 0.48, 1.45, 0);
    const upper = new THREE.Mesh(new THREE.CapsuleGeometry(0.08, 0.45, 3, 5), gold);
    upper.position.y = -0.25;
    arm.add(upper);
    const blade = new THREE.Mesh(new THREE.BoxGeometry(0.08, 0.55, 0.12), bronze);
    blade.position.set(sx * 0.05, -0.7, -0.05);
    arm.add(blade);
    const tip = new THREE.Mesh(new THREE.SphereGeometry(0.07, 5, 5), flame.clone());
    tip.position.set(sx * 0.05, -0.95, -0.05);
    arm.add(tip);
    g.add(arm);
    arms.push(arm);
  }
  g.userData.arms = arms;

  for (const sx of [-1, 1]) {
    const thigh = new THREE.Mesh(new THREE.CapsuleGeometry(0.1, 0.4, 3, 5), gold);
    thigh.position.set(sx * 0.2, 0.55, 0);
    g.add(thigh);
    const boot = new THREE.Mesh(new THREE.BoxGeometry(0.18, 0.14, 0.28), bronze);
    boot.position.set(sx * 0.2, 0.1, 0.04);
    g.add(boot);
  }

  g.userData.idleKind = "goldflayer";
  return g;
}

/** Ember-Drone — hovering fire drone */
function buildEmberDrone() {
  const g = new THREE.Group();
  const hull = std(0x3a2818, { roughness: 0.45, metalness: 0.55 });
  const gold = std(0xc9a227, { roughness: 0.3, metalness: 0.8 });
  const flame = glow(0xff6622, 1.7);

  const body = new THREE.Mesh(new THREE.SphereGeometry(0.38, 10, 8), hull);
  body.scale.set(1.15, 0.7, 1.0);
  body.position.y = 0;
  g.add(body);

  const ring = new THREE.Mesh(new THREE.TorusGeometry(0.42, 0.06, 6, 16), gold);
  ring.rotation.x = Math.PI / 2;
  ring.position.y = 0.05;
  g.add(ring);

  const core = new THREE.Mesh(new THREE.SphereGeometry(0.18, 8, 8), flame);
  core.position.set(0, 0, 0);
  core.name = "furnace";
  g.add(core);

  const eye = new THREE.Mesh(new THREE.SphereGeometry(0.09, 6, 6), glow(0xffee55, 2.2));
  eye.position.set(0, 0.05, -0.36);
  eye.name = "eye";
  g.add(eye);

  const flames = [];
  for (let i = 0; i < 6; i++) {
    const a = (i / 6) * Math.PI * 2;
    const orb = new THREE.Mesh(
      new THREE.SphereGeometry(0.06, 5, 5),
      glow(i % 2 ? 0xffaa44 : 0xff3300, 1.9)
    );
    orb.position.set(Math.cos(a) * 0.45, -0.15, Math.sin(a) * 0.45);
    g.add(orb);
    flames.push(orb);
  }
  g.userData.flames = flames;

  // Rotor blades (visual)
  const blades = new THREE.Group();
  blades.name = "rotors";
  for (let i = 0; i < 3; i++) {
    const blade = new THREE.Mesh(new THREE.BoxGeometry(0.7, 0.03, 0.08), gold);
    blade.rotation.y = (i / 3) * Math.PI * 2;
    blades.add(blade);
  }
  blades.position.y = 0.28;
  g.add(blades);
  g.userData.rotors = blades;

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
