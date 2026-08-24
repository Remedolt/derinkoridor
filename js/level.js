/**
 * Derin Koridorlar — procedural labyrinth + E-key doors
 * Grid: 0 empty, 1 wall, 2 spawn, 3 enemy, 4 health, 5 ammo, 6 door, 7 garden
 */

import * as THREE from "three";
import {
  makeStoneWallTexture,
  makeMetalWallTexture,
  makeRustWallTexture,
  makeFloorTexture,
  makeCeilingTexture,
  makeGrassTexture,
  makeDirtTexture,
} from "./textures.js";

export const CELL = 4;

const MAP = [
  [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],
  [1,2,0,0,0,0,1,0,3,0,0,0,3,0,1,0,0,3,0,4,1,1,1,1,1],
  [1,0,1,1,1,0,1,0,1,1,1,1,1,0,1,0,1,1,1,0,1,1,1,1,1],
  [1,0,1,3,0,0,0,0,0,0,5,0,1,0,0,0,0,3,1,0,1,1,1,1,1],
  [1,0,1,0,1,1,1,1,1,0,1,0,1,1,1,1,1,0,1,0,1,1,1,1,1],
  [1,0,0,3,0,0,0,0,1,0,1,0,0,3,0,0,0,0,3,0,1,1,1,1,1],
  [1,1,1,1,6,1,1,0,1,0,1,1,1,0,1,1,6,1,1,1,1,1,1,1,1],
  [1,0,3,0,0,1,4,0,0,3,0,0,0,0,3,1,0,0,3,0,6,7,7,7,1],
  [1,0,1,1,1,1,1,1,1,1,6,1,1,1,1,1,1,1,1,0,1,7,7,7,1],
  [1,0,0,0,3,0,0,0,0,0,3,0,0,3,0,0,0,0,0,0,1,7,7,7,1],
  [1,0,1,1,1,0,1,1,1,1,1,1,1,1,1,0,1,1,1,0,1,7,3,7,1],
  [1,3,0,5,1,0,3,0,0,3,0,0,3,0,0,0,1,4,0,3,1,7,7,7,1],
  [1,1,1,6,1,1,1,0,1,1,0,1,1,0,1,1,1,6,1,1,1,7,7,7,1],
  [1,0,0,0,3,0,0,0,1,0,3,0,1,0,0,3,0,0,0,0,6,7,7,7,1],
  [1,0,1,1,1,1,1,0,1,0,1,0,1,0,1,1,1,1,1,0,1,1,1,1,1],
  [1,0,0,3,0,0,1,0,3,0,1,0,0,0,1,0,0,3,0,0,1,1,1,1,1],
  [1,1,1,1,1,6,1,1,1,0,1,1,1,0,1,6,1,1,1,1,1,1,1,1,1],
  [1,5,0,3,0,0,0,0,0,3,0,3,0,0,0,0,3,0,0,5,1,1,1,1,1],
  [1,0,1,1,1,1,0,1,1,1,3,1,1,1,0,1,1,1,1,0,1,1,1,1,1],
  [1,4,0,0,3,0,3,0,0,0,0,0,0,3,3,0,0,0,0,4,1,1,1,1,1],
  [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],
];

function makeDoorTexture() {
  const size = 128;
  const c = document.createElement("canvas");
  c.width = c.height = size;
  const ctx = c.getContext("2d");
  ctx.fillStyle = "#3a4048";
  ctx.fillRect(0, 0, size, size);
  ctx.fillStyle = "#2a3038";
  ctx.fillRect(8, 8, size - 16, size - 16);
  for (let y = 16; y < size - 16; y += 20) {
    for (let x = 16; x < size - 16; x += 20) {
      ctx.fillStyle = "#1a1e22";
      ctx.fillRect(x, y, 5, 5);
      ctx.fillStyle = "#7a8490";
      ctx.fillRect(x + 1, y + 1, 2, 2);
    }
  }
  ctx.fillStyle = "#88ccff";
  ctx.fillRect(size * 0.35, size * 0.2, size * 0.3, 10);
  ctx.fillStyle = "#cceeff";
  ctx.fillRect(size * 0.38, size * 0.22, size * 0.24, 4);
  ctx.fillStyle = "#c8a040";
  ctx.fillRect(size * 0.72, size * 0.48, 14, 6);

  const tex = new THREE.CanvasTexture(c);
  tex.magFilter = THREE.NearestFilter;
  tex.minFilter = THREE.NearestFilter;
  tex.colorSpace = THREE.SRGBColorSpace;
  return tex;
}

export class Level {
  constructor(scene) {
    this.scene = scene;
    this.rows = MAP.length;
    this.cols = MAP[0].length;
    this.grid = MAP.map((r) => r.slice());
    this.wallBoxes = [];
    this.doors = [];
    this.spawnPoints = { player: null, enemies: [], health: [], ammo: [] };
    this.spawnPoints = this.spawnPoints;
    this.group = new THREE.Group();
    this.scene.add(this.group);
    this._audio = null;
  }

  setAudio(audio) {
    this._audio = audio;
  }

  build() {
    while (this.group.children.length) {
      const ch = this.group.children[0];
      this.group.remove(ch);
      ch.traverse((o) => {
        if (o.geometry) o.geometry.dispose();
        if (o.material) {
          if (Array.isArray(o.material)) o.material.forEach((m) => m.dispose());
          else o.material.dispose();
        }
      });
    }
    this.wallBoxes.length = 0;
    this.doors.length = 0;
    this.spawnPoints = { player: null, enemies: [], health: [], ammo: [] };
    this.spawnPoints = this.spawnPoints;

    const stoneTex = makeStoneWallTexture();
    const metalTex = makeMetalWallTexture();
    const rustTex = makeRustWallTexture();
    const floorTex = makeFloorTexture();
    const ceilTex = makeCeilingTexture();
    const grassTex = makeGrassTexture();
    const dirtTex = makeDirtTexture();
    const doorTex = makeDoorTexture();
    floorTex.repeat.set(this.cols, this.rows);
    ceilTex.repeat.set(this.cols, this.rows);
    grassTex.repeat.set(3, 7);
    dirtTex.repeat.set(2, 2);

    const wallMatA = new THREE.MeshLambertMaterial({ map: stoneTex });
    const wallMatB = new THREE.MeshStandardMaterial({
      map: metalTex,
      metalness: 0.55,
      roughness: 0.42,
      envMapIntensity: 0.65,
    });
    const wallMatC = new THREE.MeshStandardMaterial({
      map: rustTex,
      metalness: 0.25,
      roughness: 0.72,
      envMapIntensity: 0.4,
    });
    const floorMat = new THREE.MeshLambertMaterial({ map: floorTex });
    const ceilMat = new THREE.MeshLambertMaterial({ map: ceilTex });
    const grassMat = new THREE.MeshLambertMaterial({ map: grassTex });
    const dirtMat = new THREE.MeshLambertMaterial({ map: dirtTex });
    const barkMat = new THREE.MeshLambertMaterial({ color: 0x4a3420 });
    const leafMat = new THREE.MeshLambertMaterial({ color: 0x2f6a2a });
    const leafDarkMat = new THREE.MeshLambertMaterial({ color: 0x1e4a1c });
    const flowerMats = [
      new THREE.MeshLambertMaterial({ color: 0xc45a7a }),
      new THREE.MeshLambertMaterial({ color: 0xd4a018 }),
      new THREE.MeshLambertMaterial({ color: 0x6a8ad4 }),
    ];
    const doorMat = new THREE.MeshStandardMaterial({
      map: doorTex,
      metalness: 0.7,
      roughness: 0.35,
      envMapIntensity: 0.8,
    });

    const worldW = this.cols * CELL;
    const worldD = this.rows * CELL;

    const floor = new THREE.Mesh(new THREE.PlaneGeometry(worldW, worldD), floorMat);
    floor.rotation.x = -Math.PI / 2;
    floor.position.set(worldW / 2 - CELL / 2, 0, worldD / 2 - CELL / 2);
    this.group.add(floor);

    const indoorCols = 21;
    const ceilW = indoorCols * CELL;
    const ceil = new THREE.Mesh(new THREE.PlaneGeometry(ceilW, worldD), ceilMat);
    ceil.rotation.x = Math.PI / 2;
    ceil.position.set(ceilW / 2 - CELL / 2, CELL * 0.95, worldD / 2 - CELL / 2);
    this.group.add(ceil);

    const gardenCells = [];
    const boxGeo = new THREE.BoxGeometry(CELL, CELL, CELL);
    const doorGeo = new THREE.BoxGeometry(CELL * 0.92, CELL * 0.88, 0.35);

    for (let z = 0; z < this.rows; z++) {
      for (let x = 0; x < this.cols; x++) {
        const cell = this.grid[z][x];
        const wx = x * CELL;
        const wz = z * CELL;

        if (cell === 1) {
          const kind = (x + z) % 5;
          const mat = kind === 0 ? wallMatB : kind === 2 ? wallMatC : wallMatA;
          const wall = new THREE.Mesh(boxGeo, mat);
          wall.position.set(wx, CELL / 2, wz);
          wall.frustumCulled = true;
          this.group.add(wall);

          if ((x + z) % 5 === 0) {
            const bracket = new THREE.Mesh(
              new THREE.BoxGeometry(0.15, 0.35, 0.15),
              new THREE.MeshLambertMaterial({ color: 0x444450 })
            );
            bracket.position.set(wx + CELL * 0.45, CELL * 0.55, wz);
            this.group.add(bracket);

            const flame = new THREE.Mesh(
              new THREE.SphereGeometry(0.2, 6, 6),
              new THREE.MeshBasicMaterial({ color: 0xffcc88 })
            );
            flame.position.set(wx + CELL * 0.48, CELL * 0.72, wz);
            this.group.add(flame);

            const light = new THREE.PointLight(0xffaa66, 0.9, CELL * 5, 1.8);
            light.position.copy(flame.position);
            this.group.add(light);
          }
        } else if (cell === 6) {
          const frameMat = new THREE.MeshStandardMaterial({
            color: 0x2a2e34,
            metalness: 0.6,
            roughness: 0.45,
            envMapIntensity: 0.5,
          });
          const frameL = new THREE.Mesh(new THREE.BoxGeometry(0.35, CELL, 0.45), frameMat);
          const frameR = frameL.clone();
          const frameT = new THREE.Mesh(new THREE.BoxGeometry(CELL, 0.3, 0.45), frameMat);
          frameL.position.set(wx - CELL * 0.4, CELL / 2, wz);
          frameR.position.set(wx + CELL * 0.4, CELL / 2, wz);
          frameT.position.set(wx, CELL * 0.92, wz);
          this.group.add(frameL, frameR, frameT);

          const wallL = this.grid[z]?.[x - 1] === 1;
          const wallR = this.grid[z]?.[x + 1] === 1;
          const wallU = this.grid[z - 1]?.[x] === 1;
          const wallD = this.grid[z + 1]?.[x] === 1;
          const alongZ = wallU && wallD && !(wallL && wallR);
          if (alongZ) {
            frameL.position.set(wx, CELL / 2, wz - CELL * 0.4);
            frameR.position.set(wx, CELL / 2, wz + CELL * 0.4);
            frameL.rotation.y = Math.PI / 2;
            frameR.rotation.y = Math.PI / 2;
            frameT.rotation.y = Math.PI / 2;
          }

          const mesh = new THREE.Mesh(doorGeo, doorMat);
          mesh.position.set(wx, CELL * 0.44, wz);
          if (alongZ || (!wallL && !wallR)) mesh.rotation.y = Math.PI / 2;
          this.group.add(mesh);

          this.doors.push({
            gx: x,
            gz: z,
            mesh,
            baseY: CELL * 0.44,
            open: 0,
            target: 0,
            wasOpen: false,
          });
        } else if (cell === 2) {
          this.spawnPoints.player = new THREE.Vector3(wx, 1.6, wz);
        } else if (cell === 3) {
          this.spawnPoints.enemies.push(new THREE.Vector3(wx, 0, wz));
        } else if (cell === 4) {
          this.spawnPoints.health.push(new THREE.Vector3(wx, 0.6, wz));
        } else if (cell === 5) {
          this.spawnPoints.ammo.push(new THREE.Vector3(wx, 0.5, wz));
        } else if (cell === 7) {
          gardenCells.push({ wx, wz, x, z });
        }
      }
    }

    if (!this.spawnPoints.player) {
      this.spawnPoints.player = new THREE.Vector3(CELL, 1.6, CELL);
    }

    if (gardenCells.length) {
      this._buildGarden(gardenCells, grassMat, dirtMat, barkMat, leafMat, leafDarkMat, flowerMats);
    }

    const amb = new THREE.AmbientLight(0xc0b098, 0.95);
    this.group.add(amb);
    const fill = new THREE.DirectionalLight(0xfff0e0, 0.6);
    fill.position.set(20, 40, 12);
    this.group.add(fill);
    const hemi = new THREE.HemisphereLight(0xffe8d0, 0x3a3020, 0.45);
    this.group.add(hemi);

    const lampSpots = [
      [3, 3], [10, 5], [16, 3], [5, 9], [15, 9], [3, 13], [10, 13], [17, 13], [5, 17], [15, 17],
    ];
    for (const [x, z] of lampSpots) {
      if (z >= this.rows || x >= this.cols) continue;
      if (this.grid[z][x] === 1 || this.grid[z][x] === 7) continue;
      const lamp = new THREE.PointLight(0xffe2b8, 1.0, CELL * 7, 1.5);
      lamp.position.set(x * CELL, CELL * 0.82, z * CELL);
      this.group.add(lamp);
      const bulb = new THREE.Mesh(
        new THREE.BoxGeometry(0.35, 0.1, 0.35),
        new THREE.MeshBasicMaterial({ color: 0xffe8c0 })
      );
      bulb.position.copy(lamp.position);
      this.group.add(bulb);
    }
  }

  _buildGarden(cells, grassMat, dirtMat, barkMat, leafMat, leafDarkMat, flowerMats) {
    const minX = Math.min(...cells.map((c) => c.wx));
    const maxX = Math.max(...cells.map((c) => c.wx));
    const minZ = Math.min(...cells.map((c) => c.wz));
    const maxZ = Math.max(...cells.map((c) => c.wz));
    const w = maxX - minX + CELL;
    const d = maxZ - minZ + CELL;
    const cx = (minX + maxX) / 2;
    const cz = (minZ + maxZ) / 2;

    const grass = new THREE.Mesh(new THREE.PlaneGeometry(w, d), grassMat);
    grass.rotation.x = -Math.PI / 2;
    grass.position.set(cx, 0.04, cz);
    this.group.add(grass);

    const path = new THREE.Mesh(new THREE.PlaneGeometry(CELL * 0.7, d * 0.92), dirtMat);
    path.rotation.x = -Math.PI / 2;
    path.position.set(minX, 0.05, cz);
    this.group.add(path);

    const sun = new THREE.DirectionalLight(0xfff4d2, 0.75);
    sun.position.set(cx + 8, 18, cz - 6);
    this.group.add(sun);
    const skyHemi = new THREE.HemisphereLight(0xa8c8e8, 0x3a5a28, 0.55);
    skyHemi.position.set(cx, 6, cz);
    this.group.add(skyHemi);

    // Sky only over the garden opening — a large sphere clipped through indoor walls.
    const sky = new THREE.Mesh(
      new THREE.PlaneGeometry(w + 1.2, d + 1.2),
      new THREE.MeshBasicMaterial({
        color: 0x6a8eb4,
        side: THREE.DoubleSide,
        fog: false,
        depthWrite: false,
      })
    );
    sky.rotation.x = Math.PI / 2;
    sky.position.set(cx, 18, cz);
    sky.renderOrder = -1;
    this.group.add(sky);

    const addTree = (x, z, scale) => {
      const trunk = new THREE.Mesh(
        new THREE.CylinderGeometry(0.12 * scale, 0.18 * scale, 1.15 * scale, 6),
        barkMat
      );
      trunk.position.set(x, 0.55 * scale, z);
      const crown = new THREE.Mesh(new THREE.SphereGeometry(0.62 * scale, 7, 6), leafMat);
      crown.position.set(x, 1.35 * scale, z);
      const crown2 = new THREE.Mesh(new THREE.SphereGeometry(0.42 * scale, 6, 5), leafDarkMat);
      crown2.position.set(x + 0.22 * scale, 1.15 * scale, z + 0.12 * scale);
      this.group.add(trunk, crown, crown2);
    };

    const addBush = (x, z, scale) => {
      const bush = new THREE.Mesh(
        new THREE.SphereGeometry(0.38 * scale, 6, 5),
        Math.random() > 0.5 ? leafMat : leafDarkMat
      );
      bush.position.set(x, 0.28 * scale, z);
      bush.scale.y = 0.7;
      this.group.add(bush);
    };

    addTree(maxX - 0.4, minZ + 0.5, 1.15);
    addTree(maxX - 0.55, maxZ - 0.45, 1.0);
    addTree(minX + CELL * 0.85, cz - CELL * 0.9, 0.85);
    addBush(minX + 1.1, minZ + 1.2, 1.1);
    addBush(maxX - 0.9, cz, 1.3);
    addBush(minX + 1.4, maxZ - 1.1, 0.95);
    addBush(cx + 0.8, minZ + 1.4, 0.8);
    addBush(cx - 0.2, maxZ - 1.3, 1.05);

    for (const cell of cells) {
      if (cell.x === 22 && cell.z === 10) continue;
      if ((cell.x + cell.z) % 2 !== 0) continue;
      if (Math.abs(cell.wx - minX) < 0.8) continue;
      const fm = flowerMats[(cell.x + cell.z) % flowerMats.length];
      const stem = new THREE.Mesh(
        new THREE.CylinderGeometry(0.02, 0.02, 0.22, 4),
        leafDarkMat
      );
      stem.position.set(cell.wx + 0.7, 0.14, cell.wz - 0.6);
      const bloom = new THREE.Mesh(new THREE.SphereGeometry(0.07, 5, 4), fm);
      bloom.position.set(cell.wx + 0.7, 0.28, cell.wz - 0.6);
      this.group.add(stem, bloom);
    }

    const bench = new THREE.Mesh(new THREE.BoxGeometry(1.4, 0.12, 0.42), barkMat);
    bench.position.set(cx + 0.35, 0.38, cz + 1.1);
    const legL = new THREE.Mesh(new THREE.BoxGeometry(0.1, 0.32, 0.1), barkMat);
    const legR = legL.clone();
    legL.position.set(cx - 0.2, 0.18, cz + 1.1);
    legR.position.set(cx + 0.9, 0.18, cz + 1.1);
    this.group.add(bench, legL, legR);
  }

  /**
   * Animate doors toward target. Press E when near to toggle.
   */
  updateDoors(dt, playerPos, interactPressed = false) {
    for (const d of this.doors) {
      const dx = playerPos.x - d.gx * CELL;
      const dz = playerPos.z - d.gz * CELL;
      const near = Math.hypot(dx, dz) < CELL * 1.85;

      if (interactPressed && near) {
        d.target = d.target >= 0.5 ? 0 : 1;
        this._audio?.play("door");
      }

      d.open += (d.target - d.open) * Math.min(1, dt * 5);
      d.mesh.position.y = d.baseY + d.open * CELL * 0.95;
      d.wasOpen = d.open > 0.55;
    }
  }

  isDoorBlocking(gx, gz) {
    const door = this.doors.find((d) => d.gx === gx && d.gz === gz);
    if (!door) return false;
    return door.open < 0.55;
  }

  worldToGrid(x, z) {
    return {
      gx: Math.round(x / CELL),
      gz: Math.round(z / CELL),
    };
  }

  isWallAt(gx, gz) {
    if (gz < 0 || gz >= this.rows || gx < 0 || gx >= this.cols) return true;
    const c = this.grid[gz][gx];
    if (c === 1) return true;
    if (c === 6) return this.isDoorBlocking(gx, gz);
    return false;
  }

  resolveCollision(pos, radius = 0.55) {
    const out = pos.clone();
    const { gx, gz } = this.worldToGrid(out.x, out.z);

    for (let dz = -1; dz <= 1; dz++) {
      for (let dx = -1; dx <= 1; dx++) {
        const cx = gx + dx;
        const cz = gz + dz;
        if (!this.isWallAt(cx, cz)) continue;

        const minX = cx * CELL - CELL / 2;
        const maxX = cx * CELL + CELL / 2;
        const minZ = cz * CELL - CELL / 2;
        const maxZ = cz * CELL + CELL / 2;

        const nearestX = Math.max(minX, Math.min(out.x, maxX));
        const nearestZ = Math.max(minZ, Math.min(out.z, maxZ));
        const ox = out.x - nearestX;
        const oz = out.z - nearestZ;
        const distSq = ox * ox + oz * oz;

        if (distSq < radius * radius) {
          if (distSq === 0) {
            const left = out.x - minX;
            const right = maxX - out.x;
            const top = out.z - minZ;
            const bottom = maxZ - out.z;
            const m = Math.min(left, right, top, bottom);
            if (m === left) out.x = minX - radius;
            else if (m === right) out.x = maxX + radius;
            else if (m === top) out.z = minZ - radius;
            else out.z = maxZ + radius;
          } else {
            const dist = Math.sqrt(distSq);
            const push = (radius - dist) / dist;
            out.x += ox * push;
            out.z += oz * push;
          }
        }
      }
    }
    return out;
  }

  hasLineOfSight(from, to, step = 0.5) {
    const dx = to.x - from.x;
    const dz = to.z - from.z;
    const dist = Math.hypot(dx, dz);
    if (dist < 0.01) return true;
    const steps = Math.ceil(dist / step);
    for (let i = 1; i < steps; i++) {
      const t = i / steps;
      const x = from.x + dx * t;
      const z = from.z + dz * t;
      const { gx, gz } = this.worldToGrid(x, z);
      if (this.isWallAt(gx, gz)) return false;
    }
    return true;
  }
}
