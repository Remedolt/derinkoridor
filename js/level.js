/**
 * Derin Koridorlar — procedural labyrinth + E-key doors
 * Grid: 0 empty, 1 wall, 2 spawn, 3 enemy, 4 health, 5 ammo, 6 door, 7 garden, 8 armor
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
  makeBarkTexture,
  makeLeafTexture,
} from "./textures.js";

export const CELL = 4;

const MAP = [
  [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],
  [1,2,0,0,0,0,1,0,3,0,0,0,3,0,1,0,0,3,0,4,1,1,1,1,1,1,1,1,1,1,1,1,1],
  [1,0,1,1,1,0,1,0,1,1,1,1,1,0,1,0,1,1,1,0,1,1,1,1,1,1,1,1,1,1,1,1,1],
  [1,0,1,3,0,0,0,0,0,0,5,0,1,0,0,0,0,3,1,0,1,1,1,1,1,1,1,1,1,1,1,1,1],
  [1,0,1,0,1,1,1,1,1,0,1,0,1,1,1,1,1,0,1,0,1,1,1,1,1,1,1,1,1,1,1,1,1],
  [1,0,0,3,0,0,0,0,1,0,1,0,0,3,0,0,0,0,3,0,1,1,1,1,1,1,1,1,1,1,1,1,1],
  [1,1,1,1,6,1,1,0,1,0,1,1,1,0,1,1,6,1,1,1,1,7,7,7,7,7,7,7,7,7,7,7,1],
  [1,0,3,0,0,1,8,0,0,3,0,0,0,0,3,1,0,0,3,0,6,7,7,7,7,7,7,7,7,7,7,7,1],
  [1,0,1,1,1,1,1,1,1,1,6,1,1,1,1,1,1,1,1,0,1,7,7,7,7,7,7,7,7,7,7,7,1],
  [1,0,0,0,3,0,0,0,0,0,3,0,0,3,0,0,0,0,0,0,1,7,7,7,4,7,7,7,7,7,7,7,1],
  [1,0,1,1,1,0,1,1,1,1,1,1,1,1,1,0,1,1,1,0,6,7,7,3,7,7,3,7,7,7,7,7,1],
  [1,3,0,5,1,0,3,0,0,3,0,0,3,0,0,0,1,8,0,3,1,7,7,7,7,7,7,7,7,7,7,7,1],
  [1,1,1,6,1,1,1,0,1,1,0,1,1,0,1,1,1,6,1,1,1,7,7,7,7,7,7,7,7,7,7,7,1],
  [1,0,0,0,3,0,0,0,1,0,3,0,1,0,0,3,0,0,0,8,6,7,7,7,7,7,7,7,7,7,7,7,1],
  [1,0,1,1,1,1,1,0,1,0,1,0,1,0,1,1,1,1,1,0,1,7,7,7,7,7,7,7,7,7,7,7,1],
  [1,0,0,3,0,0,1,0,3,0,1,0,0,0,1,0,0,3,0,0,1,7,7,7,5,7,7,7,7,7,7,7,1],
  [1,1,1,1,1,6,1,1,1,0,1,1,1,0,1,6,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],
  [1,5,0,3,0,0,0,0,0,3,0,3,0,0,0,0,3,0,0,5,1,1,1,1,1,1,1,1,1,1,1,1,1],
  [1,0,1,1,1,1,0,1,1,1,3,1,1,1,0,1,1,1,1,0,1,1,1,1,1,1,1,1,1,1,1,1,1],
  [1,4,0,0,3,0,3,0,0,0,0,0,0,3,3,0,0,0,0,8,1,1,1,1,1,1,1,1,1,1,1,1,1],
  [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],
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

function makeBahceWallTexture(arrowLeft = false) {
  const c = document.createElement("canvas");
  c.width = 512;
  c.height = 160;
  const ctx = c.getContext("2d");
  ctx.fillStyle = "#3a2410";
  ctx.fillRect(0, 0, 512, 160);
  ctx.fillStyle = "#6a4420";
  ctx.fillRect(10, 10, 492, 140);
  ctx.strokeStyle = "#e0c070";
  ctx.lineWidth = 8;
  ctx.strokeRect(16, 16, 480, 128);

  const drawArrow = (tipX, dir) => {
    const baseX = tipX - dir * 118;
    ctx.beginPath();
    ctx.moveTo(tipX, 80);
    ctx.lineTo(baseX, 32);
    ctx.lineTo(baseX, 128);
    ctx.closePath();
    ctx.fillStyle = "#f0d040";
    ctx.fill();
    ctx.fillStyle = "#3a2410";
    ctx.fillRect(Math.min(tipX, baseX) + 24, 68, 70, 24);
  };

  ctx.fillStyle = "#f4e2b0";
  ctx.font = "bold 72px monospace";
  ctx.textBaseline = "middle";
  ctx.textAlign = "left";
  if (arrowLeft) {
    drawArrow(48, -1);
    ctx.fillStyle = "#f4e2b0";
    ctx.fillText("BAHÇE", 168, 84);
  } else {
    ctx.fillText("BAHÇE", 36, 84);
    drawArrow(478, 1);
  }

  const tex = new THREE.CanvasTexture(c);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.anisotropy = 4;
  tex.needsUpdate = true;
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
    this.spawnPoints = { player: null, enemies: [], health: [], ammo: [], armor: [] };
    this.spawnPoints = this.spawnPoints;
    this.group = new THREE.Group();
    this.scene.add(this.group);
    this._audio = null;
    this._assets = null;
  }

  setAudio(audio) {
    this._audio = audio;
  }

  _ensureAssets() {
    if (this._assets) return this._assets;

    const stoneTex = makeStoneWallTexture();
    const metalTex = makeMetalWallTexture();
    const rustTex = makeRustWallTexture();
    const floorTex = makeFloorTexture();
    const ceilTex = makeCeilingTexture();
    const grassTex = makeGrassTexture();
    const dirtTex = makeDirtTexture();
    const barkTex = makeBarkTexture();
    const leafTex = makeLeafTexture();
    const doorTex = makeDoorTexture();
    floorTex.repeat.set(this.cols, this.rows);
    ceilTex.repeat.set(this.cols, this.rows);
    grassTex.repeat.set(11, 10);
    dirtTex.repeat.set(2, 2);

    this._assets = {
      boxGeo: new THREE.BoxGeometry(CELL, CELL, CELL),
      // PBR materyal — roughness/metalness ile daha gerçekçi yüzey
      wallMatA: new THREE.MeshStandardMaterial({ map: stoneTex, roughness: 0.88, metalness: 0.04 }),
      wallMatB: new THREE.MeshStandardMaterial({ map: metalTex, roughness: 0.38, metalness: 0.72 }),
      wallMatC: new THREE.MeshStandardMaterial({ map: rustTex,  roughness: 0.92, metalness: 0.28 }),
      floorMat: new THREE.MeshStandardMaterial({ map: floorTex, roughness: 0.82, metalness: 0.06 }),
      ceilMat:  new THREE.MeshStandardMaterial({ map: ceilTex,  roughness: 0.95, metalness: 0.02 }),
      grassMat: new THREE.MeshStandardMaterial({ map: grassTex, roughness: 0.96, metalness: 0.0  }),
      dirtMat:  new THREE.MeshStandardMaterial({ map: dirtTex,  roughness: 0.98, metalness: 0.0  }),
      barkMat:  new THREE.MeshStandardMaterial({ map: barkTex,  roughness: 0.94, metalness: 0.0  }),
      leafMat:  new THREE.MeshStandardMaterial({ map: leafTex,  roughness: 0.85, metalness: 0.0, side: THREE.DoubleSide }),
      leafDarkMat: new THREE.MeshStandardMaterial({ color: 0x1e4a1c, map: leafTex, roughness: 0.88, metalness: 0.0, side: THREE.DoubleSide }),
      flowerMats: [
        new THREE.MeshStandardMaterial({ color: 0xd4607e, roughness: 0.75, metalness: 0.0 }),
        new THREE.MeshStandardMaterial({ color: 0xe8b020, roughness: 0.72, metalness: 0.0 }),
        new THREE.MeshStandardMaterial({ color: 0x7a9ae0, roughness: 0.78, metalness: 0.0 }),
      ],
      doorMat:    new THREE.MeshStandardMaterial({ map: doorTex, roughness: 0.55, metalness: 0.45 }),
      frameMat:   new THREE.MeshStandardMaterial({ color: 0x2a2e34, roughness: 0.5,  metalness: 0.6  }),
      bracketMat: new THREE.MeshStandardMaterial({ color: 0x5a6068, roughness: 0.4,  metalness: 0.7  }),
      // MeshBasicMaterial kalsın — bloom etkisi için emit rengi bozulmasın
      flameMat: new THREE.MeshBasicMaterial({ color: 0xff9944 }),
      bulbMat:  new THREE.MeshBasicMaterial({ color: 0xfffae8 }),
      shadeMat: new THREE.MeshStandardMaterial({ color: 0x1e1810, roughness: 0.85, metalness: 0.1  }),
      signMatR: new THREE.MeshStandardMaterial({ map: makeBahceWallTexture(false), roughness: 0.75, metalness: 0.0 }),
      signMatL: new THREE.MeshStandardMaterial({ map: makeBahceWallTexture(true),  roughness: 0.75, metalness: 0.0 }),
      signWood: new THREE.MeshStandardMaterial({ color: 0x4a3018, roughness: 0.9,  metalness: 0.0  }),
      waterMat: new THREE.MeshPhysicalMaterial({
        color: 0x2a7a9a,
        transparent: true,
        opacity: 0.72,
        roughness: 0.08,
        metalness: 0.0,
        transmission: 0.2,
        depthWrite: false,
      }),
      stoneRim: new THREE.MeshStandardMaterial({ color: 0x8a8274, roughness: 0.88, metalness: 0.05 }),
      poolBed:  new THREE.MeshStandardMaterial({ color: 0x2a3a28, roughness: 0.95, metalness: 0.0  }),
    };
    return this._assets;
  }

  build() {
    const shared = this._assets?.boxGeo;
    while (this.group.children.length) {
      const ch = this.group.children[0];
      this.group.remove(ch);
      ch.traverse((o) => {
        if (o.geometry && o.geometry !== shared) o.geometry.dispose();
      });
    }
    this.wallBoxes.length = 0;
    this.doors.length = 0;
    this.spawnPoints = { player: null, enemies: [], health: [], ammo: [], armor: [] };

    const {
      boxGeo,
      wallMatA,
      wallMatB,
      wallMatC,
      floorMat,
      ceilMat,
      grassMat,
      dirtMat,
      barkMat,
      leafMat,
      leafDarkMat,
      flowerMats,
      doorMat,
      frameMat,
      bracketMat,
      flameMat,
      bulbMat,
      shadeMat,
    } = this._ensureAssets();

    const worldW = this.cols * CELL;
    const worldD = this.rows * CELL;

    const floor = new THREE.Mesh(new THREE.PlaneGeometry(worldW, worldD), floorMat);
    floor.rotation.x = -Math.PI / 2;
    floor.position.set(worldW / 2 - CELL / 2, 0, worldD / 2 - CELL / 2);
    floor.receiveShadow = true;
    this.group.add(floor);

    const indoorCols = 21;
    const ceilW = indoorCols * CELL;
    const ceil = new THREE.Mesh(new THREE.PlaneGeometry(ceilW, worldD), ceilMat);
    ceil.rotation.x = Math.PI / 2;
    ceil.position.set(ceilW / 2 - CELL / 2, CELL * 0.95, worldD / 2 - CELL / 2);
    ceil.receiveShadow = true;
    this.group.add(ceil);

    const gardenCells = [];
    const leafW = CELL * 0.86;
    const leafH = CELL * 0.86;
    const leafT = 0.16;

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
          wall.castShadow = true;
          wall.receiveShadow = true;
          wall.frustumCulled = true;
          this.group.add(wall);

          if ((x + z) % 8 === 0) {
            const bracket = new THREE.Mesh(
              new THREE.BoxGeometry(0.15, 0.35, 0.15),
              bracketMat
            );
            bracket.position.set(wx + CELL * 0.45, CELL * 0.55, wz);
            bracket.castShadow = true;
            const flame = new THREE.Mesh(new THREE.SphereGeometry(0.22, 8, 8), flameMat);
            flame.position.set(wx + CELL * 0.48, CELL * 0.72, wz);
            this.group.add(bracket, flame);
          }
        } else if (cell === 6) {
          const frameL = new THREE.Mesh(new THREE.BoxGeometry(0.42, CELL * 0.92, 0.42), frameMat);
          const frameR = frameL.clone();
          const frameT = new THREE.Mesh(new THREE.BoxGeometry(CELL, 0.55, CELL), wallMatA);
          frameL.position.set(wx - CELL * 0.42, CELL * 0.46, wz);
          frameR.position.set(wx + CELL * 0.42, CELL * 0.46, wz);
          frameT.position.set(wx, CELL * 0.975, wz);
          this.group.add(frameL, frameR, frameT);

          const wallL = this.grid[z]?.[x - 1] === 1;
          const wallR = this.grid[z]?.[x + 1] === 1;
          const wallU = this.grid[z - 1]?.[x] === 1;
          const wallD = this.grid[z + 1]?.[x] === 1;
          const alongZ = wallU && wallD && !(wallL && wallR);
          if (alongZ) {
            frameL.position.set(wx, CELL * 0.46, wz - CELL * 0.42);
            frameR.position.set(wx, CELL * 0.46, wz + CELL * 0.42);
          }

          const pivot = new THREE.Group();
          pivot.position.set(wx, CELL * 0.44, wz);
          const mesh = alongZ
            ? new THREE.Mesh(new THREE.BoxGeometry(leafT, leafH, leafW), doorMat)
            : new THREE.Mesh(new THREE.BoxGeometry(leafW, leafH, leafT), doorMat);
          pivot.add(mesh);
          this.group.add(pivot);

          this.doors.push({
            gx: x,
            gz: z,
            mesh,
            pivot,
            alongZ,
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
        } else if (cell === 8) {
          this.spawnPoints.armor.push(new THREE.Vector3(wx, 0.55, wz));
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
      this._addGardenWallSigns();
    }

    // Ortam ışığı — biraz daha karanlık, kontrast artırır
    const amb = new THREE.AmbientLight(0x3a2e24, 0.55);
    this.group.add(amb);

    // Ana yön ışığı — soluk, gölge döküyor
    const fill = new THREE.DirectionalLight(0xfff4e8, 0.45);
    fill.position.set(20, 40, 12);
    fill.castShadow = true;
    fill.shadow.mapSize.width  = 1024;
    fill.shadow.mapSize.height = 1024;
    fill.shadow.camera.near = 1;
    fill.shadow.camera.far  = 120;
    fill.shadow.camera.left   = -80;
    fill.shadow.camera.right  =  80;
    fill.shadow.camera.top    =  80;
    fill.shadow.camera.bottom = -80;
    fill.shadow.bias = -0.002;
    this.group.add(fill);

    // Hemisphere — hafif gökyüzü-zemin renk tonlaması
    const hemi = new THREE.HemisphereLight(0xffe8d0, 0x1a1008, 0.32);
    this.group.add(hemi);

    const lampSpots = [
      [3, 3], [10, 5], [16, 3], [5, 9], [15, 9], [3, 13], [10, 13], [17, 13],
    ];

    // Her lamba için biraz farklı renk tonu — sıcak turuncu / sarı
    const lampColors = [0xffd090, 0xffb860, 0xffc870, 0xffaa50, 0xffd080, 0xffb850, 0xffc060, 0xffaa40];

    for (let li = 0; li < lampSpots.length; li++) {
      const [x, z] = lampSpots[li];
      if (z >= this.rows || x >= this.cols) continue;
      if (this.grid[z][x] === 1 || this.grid[z][x] === 7) continue;

      const col = lampColors[li % lampColors.length];

      // Ana nokta ışığı — gölge döküyor
      const lamp = new THREE.PointLight(col, 2.2, CELL * 10, 1.6);
      lamp.position.set(x * CELL, CELL * 0.78, z * CELL);
      lamp.castShadow = true;
      lamp.shadow.mapSize.width  = 256;
      lamp.shadow.mapSize.height = 256;
      lamp.shadow.camera.near = 0.2;
      lamp.shadow.camera.far  = CELL * 10;
      lamp.shadow.bias = -0.004;
      this.group.add(lamp);

      // Tavan diffüzörü — yumuşak geniş ışık
      const ambient2 = new THREE.PointLight(col, 0.55, CELL * 6, 2.0);
      ambient2.position.set(x * CELL, CELL * 0.9, z * CELL);
      this.group.add(ambient2);

      // Dekoratif armatür
      const shade = new THREE.Mesh(new THREE.CylinderGeometry(0.22, 0.42, 0.2, 10), shadeMat);
      shade.position.set(x * CELL, CELL * 0.92, z * CELL);
      shade.castShadow = true;

      const bulb = new THREE.Mesh(new THREE.SphereGeometry(0.1, 8, 8), bulbMat);
      bulb.position.set(x * CELL, CELL * 0.8, z * CELL);

      // Meşale alev küresi — daha büyük, bloom için parlak
      const flame = new THREE.Mesh(new THREE.SphereGeometry(0.18, 8, 8), flameMat);
      flame.position.set(x * CELL + CELL * 0.46, CELL * 0.74, z * CELL);

      this.group.add(shade, bulb, flame);
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

    const path = new THREE.Mesh(new THREE.PlaneGeometry(CELL * 0.78, d * 0.92), dirtMat);
    path.rotation.x = -Math.PI / 2;
    path.position.set(minX, 0.05, cz);
    this.group.add(path);
    const pathArm = new THREE.Mesh(new THREE.PlaneGeometry(w * 0.55, CELL * 0.55), dirtMat);
    pathArm.rotation.x = -Math.PI / 2;
    pathArm.position.set(cx, 0.05, cz);
    this.group.add(pathArm);

    const sun = new THREE.DirectionalLight(0xfff4d2, 1.15);
    sun.position.set(cx + 8, 18, cz - 6);
    sun.castShadow = true;
    sun.shadow.mapSize.width  = 512;
    sun.shadow.mapSize.height = 512;
    sun.shadow.camera.near = 1;
    sun.shadow.camera.far  = 60;
    sun.shadow.camera.left   = -30;
    sun.shadow.camera.right  =  30;
    sun.shadow.camera.top    =  30;
    sun.shadow.camera.bottom = -30;
    sun.shadow.bias = -0.003;
    this.group.add(sun);
    const skyHemi = new THREE.HemisphereLight(0xb8d8f8, 0x3a5a28, 0.75);
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
        new THREE.CylinderGeometry(0.12 * scale, 0.18 * scale, 1.15 * scale, 7),
        barkMat
      );
      trunk.position.set(x, 0.55 * scale, z);
      trunk.castShadow = true;
      trunk.receiveShadow = true;
      const crown = new THREE.Mesh(new THREE.SphereGeometry(0.62 * scale, 8, 7), leafMat);
      crown.position.set(x, 1.35 * scale, z);
      crown.castShadow = true;
      crown.receiveShadow = true;
      const crown2 = new THREE.Mesh(new THREE.SphereGeometry(0.42 * scale, 7, 6), leafDarkMat);
      crown2.position.set(x + 0.22 * scale, 1.15 * scale, z + 0.12 * scale);
      crown2.castShadow = true;
      const crown3 = new THREE.Mesh(new THREE.SphereGeometry(0.36 * scale, 7, 6), leafMat);
      crown3.position.set(x - 0.2 * scale, 1.22 * scale, z - 0.14 * scale);
      crown3.castShadow = true;
      this.group.add(trunk, crown, crown2, crown3);
    };

    const addBush = (x, z, scale) => {
      const bush = new THREE.Mesh(
        new THREE.SphereGeometry(0.38 * scale, 7, 6),
        Math.random() > 0.5 ? leafMat : leafDarkMat
      );
      bush.position.set(x, 0.28 * scale, z);
      bush.scale.y = 0.7;
      bush.castShadow = true;
      bush.receiveShadow = true;
      this.group.add(bush);
    };

    addTree(maxX - 0.4, minZ + 0.5, 1.15);
    addTree(maxX - 0.55, maxZ - 0.45, 1.0);
    addTree(minX + CELL * 0.85, cz - CELL * 0.9, 0.85);
    addTree(cx + CELL, minZ + CELL * 0.6, 0.95);
    addTree(cx + CELL * 1.6, cz + CELL, 1.05);
    addTree(maxX - CELL * 0.7, cz, 1.22);
    addTree(cx + CELL * 2.1, maxZ - CELL * 0.55, 0.9);
    addTree(maxX - CELL * 0.45, cz + CELL * 1.55, 1.08);
    addBush(minX + 1.1, minZ + 1.2, 1.1);
    addBush(maxX - 0.9, cz, 1.3);
    addBush(minX + 1.4, maxZ - 1.1, 0.95);
    addBush(cx + 0.8, minZ + 1.4, 0.8);
    addBush(cx - 0.2, maxZ - 1.3, 1.05);
    addBush(cx + CELL * 1.2, cz - CELL * 0.4, 1.15);
    addBush(maxX - 1.2, minZ + CELL, 0.9);
    addBush(maxX - 0.7, cz + CELL, 1.2);
    addBush(cx + CELL * 2.4, minZ + CELL * 0.8, 0.85);
    addBush(maxX - CELL * 1.4, minZ + CELL * 1.8, 1.05);

    const poolCx = cx + CELL * 2.15;
    const poolCz = cz - CELL * 1.85;
    const poolW = CELL * 1.55;
    const poolD = CELL * 1.2;
    const { stoneRim, waterMat, poolBed } = this._ensureAssets();
    const bed = new THREE.Mesh(new THREE.PlaneGeometry(poolW, poolD), poolBed);
    bed.rotation.x = -Math.PI / 2;
    bed.position.set(poolCx, 0.045, poolCz);
    const water = new THREE.Mesh(new THREE.PlaneGeometry(poolW * 0.92, poolD * 0.88), waterMat);
    water.rotation.x = -Math.PI / 2;
    water.position.set(poolCx, 0.1, poolCz);
    const rimN = new THREE.Mesh(new THREE.BoxGeometry(poolW + 0.32, 0.16, 0.22), stoneRim);
    const rimS = rimN.clone();
    rimN.position.set(poolCx, 0.12, poolCz - poolD / 2);
    rimS.position.set(poolCx, 0.12, poolCz + poolD / 2);
    const rimW = new THREE.Mesh(new THREE.BoxGeometry(0.22, 0.16, poolD + 0.12), stoneRim);
    const rimE = rimW.clone();
    rimW.position.set(poolCx - poolW / 2, 0.12, poolCz);
    rimE.position.set(poolCx + poolW / 2, 0.12, poolCz);
    this.group.add(bed, water, rimN, rimS, rimW, rimE);

    for (const cell of cells) {
      if (cell.x <= 22 && Math.abs(cell.z - 10) < 1) continue;
      if ((cell.x + cell.z) % 2 !== 0) continue;
      if (Math.abs(cell.wx - minX) < 0.8) continue;
      if (Math.abs(cell.wx - poolCx) < poolW * 0.7 && Math.abs(cell.wz - poolCz) < poolD * 0.7) continue;
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

  _addGardenWallSigns() {
    const { signMatR, signMatL, signWood } = this._ensureAssets();
    const mounts = [
      { gx: 8, gz: 8, face: "s" },
      { gx: 15, gz: 8, face: "s" },
      { gx: 19, gz: 6, face: "s" },
      { gx: 17, gz: 14, face: "n" },
    ];
    for (const m of mounts) {
      if (this.grid[m.gz]?.[m.gx] !== 1) continue;
      const mat = m.face === "n" || m.face === "e" ? signMatL : signMatR;
      this._mountWallPlaque(m.gx, m.gz, m.face, mat, signWood);
    }
  }

  _mountWallPlaque(gx, gz, face, boardMat, woodMat) {
    const wx = gx * CELL;
    const wz = gz * CELL;
    const y = 1.68;
    const inset = CELL / 2 + 0.06;
    let px = wx;
    let pz = wz;
    if (face === "s") pz = wz + inset;
    else if (face === "n") pz = wz - inset;
    else if (face === "e") px = wx + inset;
    else px = wx - inset;

    const plaque = new THREE.Mesh(new THREE.BoxGeometry(2.2, 0.7, 0.08), [
      woodMat,
      woodMat,
      woodMat,
      woodMat,
      boardMat,
      woodMat,
    ]);
    plaque.position.set(px, y, pz);
    plaque.lookAt(wx, y, wz);
    this.group.add(plaque);
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

      d.open += (d.target - d.open) * Math.min(1, dt * 7);
      const slide = d.open * CELL * 0.95;
      if (d.alongZ) d.mesh.position.z = slide;
      else d.mesh.position.x = slide;
      d.mesh.visible = d.open < 0.88;
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
