/**
 * Procedural retro textures (original — not from any commercial game)
 */

import * as THREE from "three";

function canvas(size = 256) {
  const c = document.createElement("canvas");
  c.width = c.height = size;
  return { c, ctx: c.getContext("2d") };
}

function toTex(c, repeat = 1) {
  const tex = new THREE.CanvasTexture(c);
  tex.magFilter = THREE.NearestFilter;
  tex.minFilter = THREE.NearestMipmapLinearFilter;
  tex.generateMipmaps = true;
  tex.anisotropy = 4;
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.wrapS = tex.wrapT = THREE.RepeatWrapping;
  tex.repeat.set(repeat, repeat);
  tex.needsUpdate = true;
  return tex;
}

function rng(seed) {
  let s = seed | 0;
  return () => {
    s = (Math.imul(s ^ (s >>> 15), 1 | s) + 0x6d2b79f5) | 0;
    const t = Math.imul(s ^ (s >>> 7), s | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function noise(ctx, size, amount = 28, seed = 1) {
  const r = rng(seed);
  const img = ctx.getImageData(0, 0, size, size);
  for (let i = 0; i < img.data.length; i += 4) {
    const n = (r() - 0.5) * amount;
    img.data[i] = Math.max(0, Math.min(255, img.data[i] + n));
    img.data[i + 1] = Math.max(0, Math.min(255, img.data[i + 1] + n));
    img.data[i + 2] = Math.max(0, Math.min(255, img.data[i + 2] + n));
  }
  ctx.putImageData(img, 0, 0);
}

function rgb(r, g, b) {
  return `rgb(${r | 0},${g | 0},${b | 0})`;
}

/** Offset brick / sandstone wall with mortar, chips, skirting */
export function makeStoneWallTexture() {
  const size = 256;
  const { c, ctx } = canvas(size);
  const r = rng(42);
  ctx.fillStyle = "#3a2a1c";
  ctx.fillRect(0, 0, size, size);

  const bh = 28;
  const bw = 52;
  for (let row = 0; row < size / bh + 1; row++) {
    const y = row * bh;
    const ox = row % 2 ? bw * 0.45 : 0;
    for (let x = -bw; x < size + bw; x += bw) {
      const px = x + ox;
      const shade = 118 + r() * 42;
      ctx.fillStyle = rgb(shade + 28, shade - 8, shade - 42);
      ctx.fillRect(px + 2, y + 2, bw - 4, bh - 4);
      ctx.fillStyle = rgb(shade + 48, shade + 8, shade - 28);
      ctx.fillRect(px + 3, y + 3, bw - 10, 3);
      if (r() > 0.72) {
        ctx.fillStyle = `rgba(40,22,12,${0.25 + r() * 0.3})`;
        ctx.fillRect(px + 8 + r() * 20, y + 8, 6 + r() * 14, 3);
      }
    }
  }

  ctx.fillStyle = "rgba(18,12,8,0.55)";
  ctx.fillRect(0, size * 0.78, size, size * 0.22);
  ctx.fillStyle = "#5a4634";
  ctx.fillRect(0, size * 0.78, size, 6);
  ctx.fillStyle = "#2a1c12";
  ctx.fillRect(0, size * 0.8, size, 3);

  for (let y = 10; y < size * 0.78; y += bh) {
    for (let x = 8; x < size; x += bw) {
      ctx.fillStyle = "#1a120c";
      ctx.fillRect(x, y, 5, 5);
      ctx.fillStyle = "#d0b090";
      ctx.fillRect(x + 1, y + 1, 2, 2);
    }
  }

  noise(ctx, size, 16, 42);
  return toTex(c, 1);
}

/** Dark metal tech panel with seams, vents, hazard tape */
export function makeMetalWallTexture() {
  const size = 256;
  const { c, ctx } = canvas(size);
  ctx.fillStyle = "#3c4048";
  ctx.fillRect(0, 0, size, size);

  ctx.fillStyle = "#23262c";
  ctx.fillRect(0, 0, 28, size);
  ctx.fillRect(size - 28, 0, 28, size);
  ctx.fillStyle = "#6a7078";
  ctx.fillRect(28, 0, 5, size);
  ctx.fillRect(size - 33, 0, 5, size);

  ctx.strokeStyle = "#15171a";
  ctx.lineWidth = 3;
  for (let y = 0; y <= size; y += 64) {
    ctx.beginPath();
    ctx.moveTo(34, y);
    ctx.lineTo(size - 34, y);
    ctx.stroke();
  }
  ctx.beginPath();
  ctx.moveTo(size / 2, 0);
  ctx.lineTo(size / 2, size);
  ctx.stroke();

  ctx.fillStyle = "#2a2e34";
  ctx.fillRect(48, 20, size - 96, 36);
  for (let x = 56; x < size - 56; x += 10) {
    ctx.fillStyle = "#111318";
    ctx.fillRect(x, 24, 5, 28);
    ctx.fillStyle = "#4a5058";
    ctx.fillRect(x + 1, 26, 2, 10);
  }

  ctx.fillStyle = "#c4a024";
  ctx.fillRect(42, 118, size - 84, 22);
  ctx.fillStyle = "#16120a";
  for (let x = 46; x < size - 46; x += 16) {
    ctx.beginPath();
    ctx.moveTo(x, 118);
    ctx.lineTo(x + 10, 118);
    ctx.lineTo(x, 140);
    ctx.fill();
  }

  ctx.fillStyle = "#2e3238";
  ctx.fillRect(52, 168, 70, 58);
  ctx.fillStyle = "#8a9098";
  ctx.strokeStyle = "#111";
  ctx.strokeRect(56, 172, 62, 50);
  for (let i = 0; i < 4; i++) {
    ctx.fillStyle = "#1a1c20";
    ctx.fillRect(62 + i * 14, 180, 10, 34);
  }

  for (const [x, y] of [
    [40, 16],
    [size - 48, 16],
    [40, size - 24],
    [size - 48, size - 24],
  ]) {
    ctx.fillStyle = "#111";
    ctx.fillRect(x, y, 8, 8);
    ctx.fillStyle = "#c8ccd0";
    ctx.fillRect(x + 2, y + 2, 4, 4);
  }

  noise(ctx, size, 14, 7);
  return toTex(c, 1);
}

/** Rusted plate wall */
export function makeRustWallTexture() {
  const size = 256;
  const { c, ctx } = canvas(size);
  const r = rng(99);
  ctx.fillStyle = "#4a3024";
  ctx.fillRect(0, 0, size, size);

  for (let i = 0; i < 70; i++) {
    const x = r() * size;
    const y = r() * size;
    ctx.fillStyle = `rgba(${90 + r() * 50},${36 + r() * 24},16,${0.2 + r() * 0.35})`;
    ctx.fillRect(x, y, 10 + r() * 28, 5 + r() * 16);
  }

  ctx.strokeStyle = "#1e120c";
  ctx.lineWidth = 5;
  ctx.strokeRect(8, 8, size - 16, size - 16);
  ctx.strokeStyle = "#8a6a48";
  ctx.lineWidth = 2;
  ctx.strokeRect(16, 16, size - 32, size - 32);

  ctx.fillStyle = "#2a1c14";
  ctx.fillRect(0, 0, size, 18);
  ctx.fillRect(0, size - 18, size, 18);
  for (let x = 24; x < size; x += 48) {
    ctx.fillStyle = "#1a100c";
    ctx.fillRect(x, 6, 7, 7);
    ctx.fillRect(x, size - 13, 7, 7);
    ctx.fillStyle = "#c4a070";
    ctx.fillRect(x + 2, 8, 3, 3);
    ctx.fillRect(x + 2, size - 11, 3, 3);
  }

  noise(ctx, size, 22, 99);
  return toTex(c, 1);
}

export function makeFloorTexture() {
  const size = 256;
  const { c, ctx } = canvas(size);
  const r = rng(21);
  ctx.fillStyle = "#2a241c";
  ctx.fillRect(0, 0, size, size);

  const tile = 64;
  for (let y = 0; y < size; y += tile) {
    for (let x = 0; x < size; x += tile) {
      const shade = 78 + ((x * 3 + y * 5) % 36) + r() * 10;
      ctx.fillStyle = rgb(shade + 16, shade, shade - 14);
      ctx.fillRect(x + 2, y + 2, tile - 4, tile - 4);
      ctx.fillStyle = rgb(shade + 36, shade + 16, shade);
      ctx.fillRect(x + 4, y + 4, tile - 18, 3);
      ctx.strokeStyle = "#1a1610";
      ctx.lineWidth = 3;
      ctx.strokeRect(x + 1, y + 1, tile - 2, tile - 2);
      if (r() > 0.55) {
        ctx.fillStyle = `rgba(20,16,10,${0.12 + r() * 0.2})`;
        ctx.fillRect(x + 10 + r() * 20, y + 14, 8 + r() * 18, 4);
      }
    }
  }
  noise(ctx, size, 12, 21);
  return toTex(c, 1);
}

export function makeGrassTexture() {
  const size = 256;
  const { c, ctx } = canvas(size);
  const r = rng(5);
  ctx.fillStyle = "#243a1c";
  ctx.fillRect(0, 0, size, size);
  for (let i = 0; i < 2200; i++) {
    const x = r() * size;
    const y = r() * size;
    const g = 78 + r() * 110;
    ctx.fillStyle = rgb(28 + r() * 40, g, 18 + r() * 28);
    ctx.fillRect(x, y, 1, 2 + r() * 5);
  }
  for (let i = 0; i < 18; i++) {
    ctx.fillStyle = `rgba(70,50,28,${0.15 + r() * 0.2})`;
    ctx.beginPath();
    ctx.ellipse(r() * size, r() * size, 8 + r() * 16, 5 + r() * 10, r() * 3, 0, Math.PI * 2);
    ctx.fill();
  }
  noise(ctx, size, 14, 5);
  return toTex(c, 1);
}

export function makeCeilingTexture() {
  const size = 256;
  const { c, ctx } = canvas(size);
  ctx.fillStyle = "#1c1a16";
  ctx.fillRect(0, 0, size, size);
  for (let y = 0; y < size; y += 64) {
    for (let x = 0; x < size; x += 64) {
      ctx.fillStyle = "#141210";
      ctx.fillRect(x + 4, y + 4, 56, 56);
      ctx.fillStyle = "#2e2a24";
      ctx.fillRect(x + 8, y + 8, 48, 48);
      ctx.fillStyle = "#3a342c";
      ctx.fillRect(x + 22, y + 22, 20, 20);
      ctx.fillStyle = "#0e0c0a";
      ctx.fillRect(x + 26, y + 26, 12, 12);
      ctx.fillStyle = "#4a443c";
      ctx.fillRect(x + 28, y + 28, 8, 8);
    }
  }
  noise(ctx, size, 12, 3);
  return toTex(c, 1);
}

export function makeDirtTexture() {
  const size = 256;
  const { c, ctx } = canvas(size);
  const r = rng(12);
  ctx.fillStyle = "#4a3828";
  ctx.fillRect(0, 0, size, size);
  for (let i = 0; i < 380; i++) {
    const x = r() * size;
    const y = r() * size;
    ctx.fillStyle = `rgba(${50 + r() * 40},${32 + r() * 20},${16 + r() * 12},0.45)`;
    ctx.fillRect(x, y, 2 + r() * 7, 1 + r() * 5);
  }
  for (let i = 0; i < 40; i++) {
    ctx.fillStyle = rgb(90 + r() * 40, 70 + r() * 20, 48);
    ctx.fillRect(r() * size, r() * size, 2, 2);
  }
  noise(ctx, size, 18, 12);
  return toTex(c, 1);
}

export function makeBarkTexture() {
  const size = 128;
  const { c, ctx } = canvas(size);
  const r = rng(33);
  ctx.fillStyle = "#4a3018";
  ctx.fillRect(0, 0, size, size);
  for (let x = 0; x < size; x += 6) {
    ctx.fillStyle = rgb(58 + r() * 30, 36 + r() * 16, 16);
    ctx.fillRect(x, 0, 3 + r() * 3, size);
  }
  noise(ctx, size, 20, 33);
  return toTex(c, 1);
}

export function makeLeafTexture() {
  const size = 128;
  const { c, ctx } = canvas(size);
  const r = rng(18);
  ctx.fillStyle = "#2a5a24";
  ctx.fillRect(0, 0, size, size);
  for (let i = 0; i < 80; i++) {
    ctx.fillStyle = rgb(30 + r() * 40, 90 + r() * 80, 24 + r() * 30);
    ctx.beginPath();
    ctx.ellipse(r() * size, r() * size, 6 + r() * 10, 3 + r() * 6, r() * 4, 0, Math.PI * 2);
    ctx.fill();
  }
  noise(ctx, size, 14, 18);
  return toTex(c, 1);
}
