/**
 * Weapons, projectiles, ray hits, muzzle / particles
 */

import * as THREE from "three";

export const WEAPONS = [
  {
    id: "shotgun",
    name: "POMPALI TÜFEK",
    damage: 14,
    pellets: 8,
    spread: 0.11,
    fireRate: 0.85,
    reloadTime: 1.7,
    magSize: 8,
    infiniteReserve: false,
    startReserve: 32,
    className: "weapon-shotgun",
    spriteKey: "shotgun",
    sound: "shotgun",
    shake: 0.35,
    pickupMsg: "POMPALI TÜFEK ALDIN!",
  },
  {
    id: "pistol",
    name: "TABANCA",
    damage: 18,
    pellets: 1,
    spread: 0.018,
    fireRate: 0.22,
    reloadTime: 1.0,
    magSize: 12,
    infiniteReserve: true,
    className: "weapon-pistol",
    spriteKey: "pistol",
    sound: "laser",
    shake: 0.12,
  },
  {
    id: "machinegun",
    name: "MAKİNELİ TÜFEK",
    damage: 9,
    pellets: 1,
    spread: 0.055,
    fireRate: 0.09,
    reloadTime: 2.0,
    magSize: 40,
    infiniteReserve: false,
    startReserve: 80,
    className: "weapon-machinegun",
    spriteKey: "machinegun",
    sound: "laser",
    shake: 0.1,
    pickupMsg: "MAKİNELİ TÜFEK ALDIN!",
  },
  {
    id: "plasma",
    name: "PLAZMA TÜFEĞİ",
    damage: 42,
    pellets: 1,
    spread: 0.012,
    fireRate: 0.48,
    reloadTime: 1.5,
    magSize: 15,
    infiniteReserve: false,
    startReserve: 30,
    className: "weapon-plasma",
    spriteKey: "plasma",
    sound: "shotgun",
    shake: 0.22,
    hitColor: 0x44ffcc,
    pickupMsg: "PLAZMA TÜFEĞİ ALDIN!",
  },
  {
    id: "rocket",
    name: "ROKET FIRLATICI",
    damage: 95,
    pellets: 1,
    spread: 0.02,
    fireRate: 1.15,
    reloadTime: 2.2,
    magSize: 4,
    infiniteReserve: false,
    startReserve: 12,
    className: "weapon-rocket",
    spriteKey: "rocket",
    sound: "explosion",
    shake: 0.48,
    hitColor: 0xff6622,
    maxRange: 55,
    splash: 2.4,
    pickupMsg: "ROKET FIRLATICI ALDIN!",
  },
  {
    id: "flamethrower",
    name: "ATEŞ PÜSKÜRTÜCÜ",
    damage: 7,
    pellets: 5,
    spread: 0.16,
    fireRate: 0.07,
    reloadTime: 1.8,
    magSize: 60,
    infiniteReserve: false,
    startReserve: 120,
    className: "weapon-flamethrower",
    spriteKey: "flamethrower",
    sound: "laser",
    shake: 0.08,
    hitColor: 0xff8833,
    maxRange: 7.5,
    pickupMsg: "ATEŞ PÜSKÜRTÜCÜ ALDIN!",
  },
];

export class Weapons {
  constructor(scene, player, level, audio, ui) {
    this.scene = scene;
    this.player = player;
    this.level = level;
    this.audio = audio;
    this.ui = ui;
    this.index = 0;
    this.cooldown = 0;
    this.reloading = false;
    this.reloadTimer = 0;
    this.mags = WEAPONS.map((w) => w.magSize);
    this.reserves = WEAPONS.map((w) => (w.infiniteReserve ? Infinity : w.startReserve || 0));
    this.projectiles = [];
    this.particles = [];
    this.flashLight = new THREE.PointLight(0xffcc66, 0, 8, 2);
    this.scene.add(this.flashLight);
    this.flashTimer = 0;
    this.raycaster = new THREE.Raycaster();
  }

  reset() {
    this.index = 0;
    this.cooldown = 0;
    this.reloading = false;
    this.reloadTimer = 0;
    this.mags = WEAPONS.map((w) => w.magSize);
    this.reserves = WEAPONS.map((w) => (w.infiniteReserve ? Infinity : w.startReserve || 0));
    this.clearEffects();
    this.ui.setWeapon(this.current);
    this.ui.setAmmo(this.mags[this.index], this.reserves[this.index]);
  }

  get current() {
    return WEAPONS[this.index];
  }

  switchTo(slot) {
    if (slot < 0 || slot >= WEAPONS.length || slot === this.index) return;
    this.index = slot;
    this.reloading = false;
    this.reloadTimer = 0;
    this.ui.setWeapon(this.current);
    this.ui.setAmmo(this.mags[this.index], this.reserves[this.index]);
    this.ui.pulseWeaponSprite(this.current);
    if (this.current.pickupMsg) {
      this.ui.flashPickup(this.current.pickupMsg);
    }
  }

  cycle() {
    this.switchTo((this.index + 1) % WEAPONS.length);
  }

  addAmmo(amount) {
    for (let i = 0; i < WEAPONS.length; i++) {
      if (!WEAPONS[i].infiniteReserve) {
        this.reserves[i] += amount;
      }
    }
    this.ui.setAmmo(this.mags[this.index], this.reserves[this.index]);
  }

  tryReload() {
    const w = this.current;
    if (this.reloading || this.mags[this.index] >= w.magSize) return;
    if (!w.infiniteReserve && this.reserves[this.index] <= 0) return;
    this.reloading = true;
    this.reloadTimer = w.reloadTime;
    this.audio.play("reload");
    this.ui.flashPickup("ŞARJÖR DEĞİŞTİRİLİYOR");
  }

  tryFire(enemies) {
    if (this.cooldown > 0 || this.reloading || !this.player.alive) return;
    const w = this.current;
    if (this.mags[this.index] <= 0) {
      this.tryReload();
      this.audio.play("empty");
      return;
    }

    this.mags[this.index]--;
    this.cooldown = w.fireRate;
    this.player.shake = Math.min(1, this.player.shake + (w.shake || 0.12));
    this.audio.play(w.sound || "laser");
    this.ui.recoil(w.id === "plasma" || w.id === "flamethrower");
    this._muzzleFlash(w);

    const origin = this.player.getShootOrigin();
    const baseDir = this.player.getShootDirection();
    const hitColor = w.hitColor || 0xff4422;
    const maxRange = w.maxRange || 60;

    for (let p = 0; p < w.pellets; p++) {
      const dir = baseDir.clone();
      dir.x += (Math.random() - 0.5) * w.spread;
      dir.y += (Math.random() - 0.5) * w.spread;
      dir.z += (Math.random() - 0.5) * w.spread;
      dir.normalize();
      this._rayHit(origin, dir, w.damage, enemies, hitColor, maxRange, w);
    }

    this.ui.setAmmo(this.mags[this.index], this.reserves[this.index]);
    if (this.mags[this.index] <= 0) this.tryReload();
  }

  _rayHit(origin, dir, damage, enemies, hitColor = 0xff4422, maxDist = 60, weapon = null) {
    let wallHit = null;
    let wallDist = maxDist;
    const step = 0.35;
    for (let d = step; d < maxDist; d += step) {
      const x = origin.x + dir.x * d;
      const y = origin.y + dir.y * d;
      const z = origin.z + dir.z * d;
      if (y < 0 || y > 4) {
        wallDist = d;
        wallHit = new THREE.Vector3(x, Math.max(0.05, Math.min(3.9, y)), z);
        break;
      }
      const g = this.level.worldToGrid(x, z);
      if (this.level.isWallAt(g.gx, g.gz)) {
        wallDist = d;
        wallHit = new THREE.Vector3(x, y, z);
        break;
      }
    }

    let bestEnemy = null;
    let bestDist = wallDist;
    for (const e of enemies) {
      if (!e.alive) continue;
      const to = e.position.clone().add(new THREE.Vector3(0, e.hitHeight, 0)).sub(origin);
      const proj = to.dot(dir);
      if (proj < 0 || proj > bestDist) continue;
      const closest = origin.clone().addScaledVector(dir, proj);
      const dist = closest.distanceTo(e.position.clone().add(new THREE.Vector3(0, e.hitHeight, 0)));
      if (dist < e.radius) {
        bestDist = proj;
        bestEnemy = e;
      }
    }

    const impactPos = bestEnemy
      ? origin.clone().addScaledVector(dir, bestDist)
      : wallHit;

    if (bestEnemy) {
      bestEnemy.takeDamage(damage, impactPos);
      this._spawnHitParticles(impactPos, hitColor);
      this.player.score += Math.floor(damage);
      if (!bestEnemy.alive) {
        this.player.score += bestEnemy.scoreValue;
        this.audio.play("explosion");
      }
    } else if (wallHit) {
      this._spawnHitParticles(wallHit, hitColor === 0xff4422 ? 0x88ffcc : hitColor);
    }

    // Rocket splash damage
    if (weapon?.splash && impactPos) {
      this._spawnHitParticles(impactPos, 0xff4400);
      this._spawnHitParticles(impactPos, 0xffaa33);
      for (const e of enemies) {
        if (!e.alive || e === bestEnemy) continue;
        const ey = e.position.clone().add(new THREE.Vector3(0, e.hitHeight, 0));
        const sd = ey.distanceTo(impactPos);
        if (sd < weapon.splash) {
          const falloff = 1 - sd / weapon.splash;
          const dmg = Math.floor(damage * 0.55 * falloff);
          if (dmg > 0) {
            e.takeDamage(dmg, impactPos);
            this.player.score += Math.floor(dmg);
            if (!e.alive) {
              this.player.score += e.scoreValue;
              this.audio.play("explosion");
            }
          }
        }
      }
    }
  }

  _muzzleFlash(w) {
    const origin = this.player.getShootOrigin();
    const dir = this.player.getShootDirection();
    this.flashLight.position.copy(origin).addScaledVector(dir, 0.8);
    if (w.id === "plasma") {
      this.flashLight.color.setHex(0x44ffcc);
      this.flashLight.intensity = 5;
    } else if (w.id === "flamethrower" || w.id === "rocket") {
      this.flashLight.color.setHex(0xff7722);
      this.flashLight.intensity = w.id === "rocket" ? 6 : 4.5;
    } else {
      this.flashLight.color.setHex(0xffcc66);
      this.flashLight.intensity = 4;
    }
    this.flashTimer = w.id === "flamethrower" ? 0.04 : 0.05;
  }

  _spawnHitParticles(pos, color) {
    if (!pos) return;
    for (let i = 0; i < 6; i++) {
      const geo = new THREE.SphereGeometry(0.06, 4, 4);
      const mat = new THREE.MeshBasicMaterial({ color });
      const mesh = new THREE.Mesh(geo, mat);
      mesh.position.copy(pos);
      this.scene.add(mesh);
      this.particles.push({
        mesh,
        vel: new THREE.Vector3(
          (Math.random() - 0.5) * 4,
          Math.random() * 3,
          (Math.random() - 0.5) * 4
        ),
        life: 0.35 + Math.random() * 0.2,
      });
    }
  }

  update(dt, input, enemies) {
    this.cooldown = Math.max(0, this.cooldown - dt);

    if (this.flashTimer > 0) {
      this.flashTimer -= dt;
      if (this.flashTimer <= 0) this.flashLight.intensity = 0;
    }

    if (this.reloading) {
      this.reloadTimer -= dt;
      if (this.reloadTimer <= 0) {
        const w = this.current;
        const need = w.magSize - this.mags[this.index];
        if (w.infiniteReserve) {
          this.mags[this.index] = w.magSize;
        } else {
          const take = Math.min(need, this.reserves[this.index]);
          this.mags[this.index] += take;
          this.reserves[this.index] -= take;
        }
        this.reloading = false;
        this.reloadTimer = 0;
        this.ui.setAmmo(this.mags[this.index], this.reserves[this.index]);
      }
    }

    if (input.weaponSlot !== null) this.switchTo(input.weaponSlot);
    if (input.reloadPressed) this.tryReload();
    if (input.fire || input.firePressed) this.tryFire(enemies);

    for (let i = this.particles.length - 1; i >= 0; i--) {
      const p = this.particles[i];
      p.life -= dt;
      p.vel.y -= 9 * dt;
      p.mesh.position.addScaledVector(p.vel, dt);
      p.mesh.scale.multiplyScalar(0.96);
      if (p.life <= 0) {
        this.scene.remove(p.mesh);
        p.mesh.geometry.dispose();
        p.mesh.material.dispose();
        this.particles.splice(i, 1);
      }
    }
  }

  clearEffects() {
    for (const p of this.particles) {
      this.scene.remove(p.mesh);
      p.mesh.geometry.dispose();
      p.mesh.material.dispose();
    }
    this.particles.length = 0;
    this.flashLight.intensity = 0;
  }
}
