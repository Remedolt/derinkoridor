/**
 * Health packs & ammo crates
 */

import * as THREE from "three";

function makePickupMesh(kind) {
  const g = new THREE.Group();
  if (kind === "health") {
    const box = new THREE.Mesh(
      new THREE.BoxGeometry(0.55, 0.55, 0.55),
      new THREE.MeshLambertMaterial({ color: 0xffffff })
    );
    g.add(box);
    const crossV = new THREE.Mesh(
      new THREE.BoxGeometry(0.15, 0.4, 0.12),
      new THREE.MeshBasicMaterial({ color: 0xff2244 })
    );
    const crossH = new THREE.Mesh(
      new THREE.BoxGeometry(0.4, 0.15, 0.12),
      new THREE.MeshBasicMaterial({ color: 0xff2244 })
    );
    crossV.position.z = 0.28;
    crossH.position.z = 0.28;
    g.add(crossV, crossH);
  } else {
    const box = new THREE.Mesh(
      new THREE.BoxGeometry(0.6, 0.4, 0.4),
      new THREE.MeshLambertMaterial({ color: 0xffaa33 })
    );
    g.add(box);
    const stripe = new THREE.Mesh(
      new THREE.BoxGeometry(0.62, 0.1, 0.42),
      new THREE.MeshBasicMaterial({ color: 0x222222 })
    );
    g.add(stripe);
  }
  return g;
}

export class PickupManager {
  constructor(scene) {
    this.scene = scene;
    this.items = [];
  }

  spawn(healthPositions, ammoPositions) {
    this.clear();
    for (const p of healthPositions) {
      const mesh = makePickupMesh("health");
      mesh.position.copy(p);
      this.scene.add(mesh);
      this.items.push({ kind: "health", mesh, amount: 25, taken: false });
    }
    for (const p of ammoPositions) {
      const mesh = makePickupMesh("ammo");
      mesh.position.copy(p);
      this.scene.add(mesh);
      this.items.push({ kind: "ammo", mesh, amount: 12, taken: false });
    }
  }

  clear() {
    for (const it of this.items) {
      this.scene.remove(it.mesh);
      it.mesh.traverse((o) => {
        if (o.geometry) o.geometry.dispose();
        if (o.material) {
          if (Array.isArray(o.material)) o.material.forEach((m) => m.dispose());
          else o.material.dispose();
        }
      });
    }
    this.items.length = 0;
  }

  update(dt, player, weapons, audio, ui) {
    const t = performance.now() * 0.003;
    for (const it of this.items) {
      if (it.taken) continue;
      it.mesh.rotation.y += dt * 1.5;
      it.mesh.position.y = 0.55 + Math.sin(t + it.mesh.position.x) * 0.12;

      if (it.mesh.position.distanceTo(player.position) < 1.2) {
        it.taken = true;
        this.scene.remove(it.mesh);
        if (it.kind === "health") {
          player.heal(it.amount);
          audio.play("pickup");
          ui?.flashPickup("SAĞLIK PAKETİ ALDIN!");
        } else {
          weapons.addAmmo(it.amount);
          audio.play("pickup");
          ui?.flashPickup("FİŞEK KUTUSU ALDIN!");
        }
      }
    }
  }
}
