/**
 * Procedural retro textures (original — not from any commercial game)
 */

import * as THREE from "three";

function canvas(size = 128) {
  const c = document.createElement("canvas");
  c.width = c.height = size;
  return { c, ctx: c.getContext("2d") };
}

function toTex(c, repeat = 1) {
  const tex = new THREE.CanvasTexture(c);
  tex.magFilter = THREE.NearestFilter;
  tex.minFilter = THREE.NearestFilter;
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.wrapS = tex.wrapT = THREE.RepeatWrapping;
  tex.repeat.set(repeat, repeat);
  return tex;
}

function noise(ctx, size, amount = 28) {
  const img = ctx.getImageData(0, 0, size, size);
  for (let i = 0; i < img.data.length; i += 4) {
    const n = (Math.random() - 0.5) * amount;
    img.data[i] = Math.max(0, Math.min(255, img.data[i] + n));
    img.data[i + 1] = Math.max(0, Math.min(255, img.data[i + 1] + n));
    img.data[i + 2] = Math.max(0, Math.min(255, img.data[i + 2] + n));
  }
  ctx.putImageData(img, 0, 0);
}

/** Vertical grain stone / tech-slab wall */
export function makeStoneWallTexture() {
  const size = 128;
  const { c, ctx } = canvas(size);
  ctx.fillStyle = "#8a6a48";
  ctx.fillRect(0, 0, size, size);

  // Vertical streaks
  for (let x = 0; x < size; x++) {
    const shade = 95 + ((x * 17) % 45);
    ctx.fillStyle = `rgb(${shade + 35},${shade + 5},${shade - 20})`;
    if (x % 7 < 3) ctx.fillRect(x, 0, 1, size);
  }

  // Horizontal mortar lines
  ctx.strokeStyle = "rgba(40,28,16,0.45)";
  ctx.lineWidth = 2;
  for (let y = 16; y < size; y += 32) {
    ctx.beginPath();
    ctx.moveTo(0, y + (Math.random() * 3 - 1));
    ctx.lineTo(size, y);
    ctx.stroke();
  }

  // Rivets / bolts
  for (let y = 8; y < size; y += 32) {
    for (let x = 10; x < size; x += 28) {
      ctx.fillStyle = "#2a2218";
      ctx.fillRect(x, y, 4, 4);
      ctx.fillStyle = "#c8a878";
      ctx.fillRect(x + 1, y + 1, 2, 2);
    }
  }

  noise(ctx, size, 18);
  return toTex(c, 1);
}

/** Dark metal tech panel with seams */
export function makeMetalWallTexture() {
  const size = 128;
  const { c, ctx } = canvas(size);
  ctx.fillStyle = "#3a3e44";
  ctx.fillRect(0, 0, size, size);

  // Pillar strips
  ctx.fillStyle = "#2a2e34";
  ctx.fillRect(0, 0, 18, size);
  ctx.fillRect(size - 18, 0, 18, size);

  ctx.fillStyle = "#555a62";
  ctx.fillRect(18, 0, 4, size);
  ctx.fillRect(size - 22, 0, 4, size);

  // Panel grid
  ctx.strokeStyle = "#1a1c20";
  ctx.lineWidth = 2;
  for (let y = 0; y <= size; y += 32) {
    ctx.beginPath();
    ctx.moveTo(22, y);
    ctx.lineTo(size - 22, y);
    ctx.stroke();
  }
  ctx.beginPath();
  ctx.moveTo(size / 2, 0);
  ctx.lineTo(size / 2, size);
  ctx.stroke();

  // Warning stripe
  ctx.fillStyle = "#8a6020";
  ctx.fillRect(30, 56, size - 60, 14);
  ctx.fillStyle = "#1a1408";
  for (let x = 32; x < size - 32; x += 12) {
    ctx.beginPath();
    ctx.moveTo(x, 56);
    ctx.lineTo(x + 6, 56);
    ctx.lineTo(x, 70);
    ctx.fill();
  }

  noise(ctx, size, 18);
  return toTex(c, 1);
}

/** Rusted / brown tech slab */
export function makeRustWallTexture() {
  const size = 128;
  const { c, ctx } = canvas(size);
  ctx.fillStyle = "#5a3a28";
  ctx.fillRect(0, 0, size, size);

  for (let i = 0; i < 40; i++) {
    const x = Math.random() * size;
    const y = Math.random() * size;
    ctx.fillStyle = `rgba(${90 + Math.random() * 40},${40 + Math.random() * 20},20,0.35)`;
    ctx.fillRect(x, y, 8 + Math.random() * 20, 4 + Math.random() * 10);
  }

  ctx.strokeStyle = "#2a1810";
  ctx.lineWidth = 3;
  ctx.strokeRect(6, 6, size - 12, size - 12);
  ctx.strokeStyle = "#886644";
  ctx.lineWidth = 1;
  ctx.strokeRect(10, 10, size - 20, size - 20);

  noise(ctx, size, 26);
  return toTex(c, 1);
}

export function makeFloorTexture() {
  const size = 128;
  const { c, ctx } = canvas(size);
  ctx.fillStyle = "#4a4238";
  ctx.fillRect(0, 0, size, size);

  const tile = 32;
  for (let y = 0; y < size; y += tile) {
    for (let x = 0; x < size; x += tile) {
      const shade = 70 + ((x + y) % 50);
      ctx.fillStyle = `rgb(${shade + 10},${shade},${shade - 12})`;
      ctx.fillRect(x + 1, y + 1, tile - 2, tile - 2);
      ctx.strokeStyle = "#2a241c";
      ctx.strokeRect(x, y, tile, tile);
    }
  }
  noise(ctx, size, 14);
  return toTex(c, 1);
}

export function makeGrassTexture() {
  const size = 128;
  const { c, ctx } = canvas(size);
  ctx.fillStyle = "#2a4a22";
  ctx.fillRect(0, 0, size, size);
  for (let i = 0; i < 900; i++) {
    const x = Math.random() * size;
    const y = Math.random() * size;
    const g = 70 + Math.random() * 90;
    ctx.fillStyle = `rgb(${30 + Math.random() * 40},${g},${20 + Math.random() * 30})`;
    ctx.fillRect(x, y, 1, 2 + Math.random() * 4);
  }
  noise(ctx, size, 16);
  return toTex(c, 1);
}

export function makeCeilingTexture() {
  const size = 128;
  const { c, ctx } = canvas(size);
  ctx.fillStyle = "#2a2620";
  ctx.fillRect(0, 0, size, size);
  for (let y = 0; y < size; y += 32) {
    for (let x = 0; x < size; x += 32) {
      ctx.fillStyle = "#221e18";
      ctx.fillRect(x + 4, y + 4, 24, 24);
      ctx.fillStyle = "#3a342c";
      ctx.fillRect(x + 10, y + 10, 12, 12);
    }
  }
  noise(ctx, size, 14);
  return toTex(c, 1);
}

export function makeDirtTexture() {
  const size = 128;
  const { c, ctx } = canvas(size);
  ctx.fillStyle = "#4a3828";
  ctx.fillRect(0, 0, size, size);
  for (let i = 0; i < 220; i++) {
    const x = Math.random() * size;
    const y = Math.random() * size;
    ctx.fillStyle = `rgba(${50 + Math.random() * 40},${32 + Math.random() * 20},${16 + Math.random() * 12},0.45)`;
    ctx.fillRect(x, y, 2 + Math.random() * 6, 1 + Math.random() * 4);
  }
  noise(ctx, size, 20);
  return toTex(c, 1);
}
