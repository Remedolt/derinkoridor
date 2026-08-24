/**
 * Original pixel-art FP weapons — gun only, no hands (classic 90s overlay)
 * Silhouette: barrel toward the crosshair, receiver/grip in the lower-right.
 */

function px(ctx, x, y, w, h, color) {
  ctx.fillStyle = color;
  ctx.fillRect(Math.round(x), Math.round(y), Math.round(w), Math.round(h));
}

/** Filled block with a 2px dark outline so the gun reads against any wall. */
function blk(ctx, x, y, w, h, color, outline = "#07070a") {
  px(ctx, x - 2, y - 2, w + 4, h + 4, outline);
  px(ctx, x, y, w, h, color);
}

function stripe(ctx, x, y, w, h, gap, color) {
  for (let i = 0; i < h; i += gap) px(ctx, x, y + i, w, 2, color);
}

/** Dual-barrel pump shotgun — FP 3/4 view, barrels up toward the sight. */
export function drawShotgunSprite() {
  const c = document.createElement("canvas");
  c.width = 560;
  c.height = 400;
  const ctx = c.getContext("2d");
  ctx.imageSmoothingEnabled = false;

  // Wooden stock (lower right)
  blk(ctx, 292, 268, 150, 92, "#2a1c12");
  px(ctx, 304, 280, 126, 70, "#5a3a22");
  px(ctx, 316, 292, 102, 46, "#7a5230");
  px(ctx, 328, 308, 78, 10, "#c8a070");
  px(ctx, 320, 336, 88, 12, "#1a1008");

  // Receiver
  blk(ctx, 176, 188, 230, 92, "#141418");
  px(ctx, 188, 196, 206, 28, "#6a6a78");
  px(ctx, 192, 194, 198, 8, "#d0d0dc");
  px(ctx, 196, 232, 190, 36, "#0c0c10");
  px(ctx, 250, 204, 44, 18, "#050508");
  px(ctx, 190, 202, 12, 22, "#ececf4");
  px(ctx, 360, 210, 26, 16, "#cc2233");
  px(ctx, 364, 214, 16, 8, "#ff8899");

  // Dual barrels pointing up
  blk(ctx, 198, 18, 46, 178, "#2a2a34");
  blk(ctx, 292, 18, 46, 178, "#2a2a34");
  px(ctx, 206, 4, 30, 28, "#121218");
  px(ctx, 300, 4, 30, 28, "#121218");
  px(ctx, 210, 0, 22, 10, "#050508");
  px(ctx, 304, 0, 22, 10, "#050508");
  px(ctx, 214, 2, 14, 6, "#000");
  px(ctx, 308, 2, 14, 6, "#000");
  px(ctx, 200, 28, 8, 150, "#9a9aac");
  px(ctx, 294, 28, 8, 150, "#9a9aac");
  px(ctx, 236, 28, 6, 150, "#08080c");
  px(ctx, 330, 28, 6, 150, "#08080c");
  stripe(ctx, 198, 36, 46, 150, 18, "#101014");
  stripe(ctx, 292, 36, 46, 150, 18, "#101014");
  // Rib + beads
  px(ctx, 248, 22, 38, 12, "#3a3a46");
  px(ctx, 256, 16, 22, 10, "#b0b0c0");
  px(ctx, 214, 0, 12, 6, "#f0f0f8");
  px(ctx, 308, 0, 12, 6, "#f0f0f8");
  px(ctx, 218, 1, 6, 4, "#ff2200");
  px(ctx, 312, 1, 6, 4, "#ff2200");

  // Pump forend
  blk(ctx, 168, 248, 220, 42, "#24180e");
  px(ctx, 180, 256, 196, 26, "#5a4028");
  px(ctx, 168, 248, 220, 6, "#c4a060");
  for (let i = 0; i < 10; i++) px(ctx, 188 + i * 18, 260, 12, 18, "#1a1008");

  // Trigger guard
  blk(ctx, 248, 268, 58, 28, "#18181e");
  px(ctx, 264, 276, 24, 14, "#050508");

  return c.toDataURL("image/png");
}

export function drawPistolSprite() {
  const c = document.createElement("canvas");
  c.width = 440;
  c.height = 320;
  const ctx = c.getContext("2d");
  ctx.imageSmoothingEnabled = false;

  // Grip
  blk(ctx, 168, 168, 72, 128, "#1a1410");
  px(ctx, 178, 178, 52, 108, "#4a3a2c");
  px(ctx, 184, 186, 40, 14, "#8a7a68");
  for (let i = 0; i < 7; i++) px(ctx, 184, 206 + i * 12, 40, 5, "#1a120c");
  px(ctx, 188, 276, 32, 10, "#24180e");

  // Slide
  blk(ctx, 72, 96, 236, 68, "#1c1c24");
  px(ctx, 84, 104, 212, 16, "#b8b8c8");
  px(ctx, 90, 132, 196, 20, "#101018");
  px(ctx, 86, 108, 12, 48, "#ececf8");
  for (let i = 0; i < 12; i++) px(ctx, 248 + i * 5, 112, 3, 40, "#0c0c12");

  // Barrel
  blk(ctx, 292, 116, 96, 30, "#14141a");
  px(ctx, 360, 120, 40, 22, "#07070c");
  px(ctx, 386, 124, 18, 14, "#030306");
  px(ctx, 294, 118, 6, 24, "#8a8a9c");

  // Rear sight
  blk(ctx, 170, 72, 34, 26, "#1a1a22");
  px(ctx, 178, 64, 16, 16, "#ff3344");
  px(ctx, 180, 66, 12, 10, "#ffaa88");

  // Mag well
  px(ctx, 176, 158, 48, 16, "#16161c");
  px(ctx, 184, 162, 32, 8, "#3a3a48");

  return c.toDataURL("image/png");
}

export function drawMachinegunSprite() {
  const c = document.createElement("canvas");
  c.width = 560;
  c.height = 380;
  const ctx = c.getContext("2d");
  ctx.imageSmoothingEnabled = false;

  blk(ctx, 28, 210, 112, 86, "#18140e");
  px(ctx, 40, 222, 90, 64, "#3a3024");
  px(ctx, 52, 236, 68, 40, "#5c4c38");
  px(ctx, 60, 252, 52, 12, "#1a1610");

  blk(ctx, 118, 148, 236, 104, "#16161e");
  px(ctx, 130, 158, 212, 28, "#6a6a7c");
  px(ctx, 134, 156, 204, 8, "#c8c8d8");
  px(ctx, 140, 196, 192, 42, "#0e0e14");
  px(ctx, 146, 164, 14, 24, "#ececf8");
  px(ctx, 214, 168, 48, 18, "#050508");

  blk(ctx, 338, 162, 168, 44, "#262630");
  px(ctx, 346, 168, 152, 12, "#9a9aac");
  for (let i = 0; i < 12; i++) px(ctx, 352 + i * 12, 184, 8, 18, "#0c0c12");
  px(ctx, 486, 168, 46, 30, "#14141c");
  px(ctx, 514, 174, 22, 18, "#040406");

  blk(ctx, 168, 236, 108, 108, "#14141c");
  px(ctx, 182, 250, 80, 80, "#3a3a4a");
  px(ctx, 206, 274, 34, 34, "#0c0c12");
  px(ctx, 192, 248, 60, 10, "#a8a8b8");
  for (let i = 0; i < 8; i++) {
    const a = (i / 8) * Math.PI * 2;
    px(ctx, 218 + Math.cos(a) * 28 - 4, 290 + Math.sin(a) * 28 - 4, 8, 8, "#08080e");
  }

  blk(ctx, 206, 112, 96, 18, "#262630");
  px(ctx, 242, 92, 26, 24, "#ff4422");
  px(ctx, 246, 96, 18, 14, "#ffaa66");

  px(ctx, 380, 206, 12, 36, "#3a3a48");
  px(ctx, 454, 206, 12, 36, "#3a3a48");
  px(ctx, 372, 238, 28, 6, "#2a2a34");
  px(ctx, 446, 238, 28, 6, "#2a2a34");

  return c.toDataURL("image/png");
}

export function drawPlasmaSprite() {
  const c = document.createElement("canvas");
  c.width = 540;
  c.height = 360;
  const ctx = c.getContext("2d");
  ctx.imageSmoothingEnabled = false;

  blk(ctx, 24, 176, 88, 96, "#101820");
  px(ctx, 36, 188, 64, 74, "#2a4050");
  px(ctx, 44, 198, 48, 26, "#33eebb");
  px(ctx, 48, 202, 40, 12, "#ccffe8");
  px(ctx, 44, 232, 48, 18, "#1a8866");

  blk(ctx, 100, 138, 252, 92, "#121a24");
  px(ctx, 114, 148, 226, 24, "#4a6880");
  px(ctx, 118, 146, 218, 8, "#a8d0ec");
  px(ctx, 124, 182, 206, 34, "#0c141c");
  px(ctx, 214, 160, 48, 18, "#050a10");

  px(ctx, 148, 158, 60, 28, "#060c14");
  px(ctx, 156, 162, 44, 20, "#22ffcc");
  px(ctx, 160, 166, 36, 10, "#aaffee");
  px(ctx, 168, 176, 18, 4, "#ffffff");

  blk(ctx, 336, 148, 138, 56, "#1a2836");
  px(ctx, 346, 156, 120, 12, "#44eedd");
  px(ctx, 350, 176, 112, 18, "#0a121a");
  for (let i = 0; i < 6; i++) px(ctx, 358 + i * 16, 180, 10, 10, "#1aaa88");

  blk(ctx, 460, 156, 52, 40, "#121c26");
  px(ctx, 482, 164, 28, 24, "#081018");
  px(ctx, 496, 168, 16, 16, "#44ffdd");
  px(ctx, 500, 172, 10, 10, "#ffffff");

  blk(ctx, 166, 108, 160, 16, "#203040");
  px(ctx, 230, 86, 44, 30, "#121c26");
  px(ctx, 238, 92, 28, 18, "#44ffaa");
  px(ctx, 242, 96, 18, 10, "#ccffee");

  blk(ctx, 196, 220, 52, 86, "#101820");
  px(ctx, 204, 228, 36, 70, "#2a3844");
  for (let i = 0; i < 5; i++) px(ctx, 208, 236 + i * 12, 28, 5, "#080e14");

  return c.toDataURL("image/png");
}

export function drawRocketSprite() {
  const c = document.createElement("canvas");
  c.width = 580;
  c.height = 380;
  const ctx = c.getContext("2d");
  ctx.imageSmoothingEnabled = false;

  blk(ctx, 20, 150, 108, 84, "#221810");
  px(ctx, 34, 162, 84, 62, "#4a3828");
  px(ctx, 46, 174, 62, 20, "#b09060");
  px(ctx, 50, 202, 54, 16, "#161008");
  px(ctx, 34, 224, 26, 10, "#ff4422");
  px(ctx, 66, 224, 26, 10, "#ff8844");

  blk(ctx, 116, 144, 320, 64, "#16161c");
  px(ctx, 128, 152, 296, 18, "#7a7a8c");
  px(ctx, 132, 150, 288, 8, "#c4c4d4");
  px(ctx, 140, 178, 272, 22, "#0a0a10");
  for (let i = 0; i < 9; i++) px(ctx, 154 + i * 30, 170, 20, 8, "#3a3a48");

  blk(ctx, 420, 134, 108, 80, "#24242e");
  px(ctx, 434, 146, 80, 16, "#a8a8b8");
  px(ctx, 464, 158, 52, 42, "#0e0e14");
  px(ctx, 488, 168, 28, 28, "#040406");
  px(ctx, 494, 174, 14, 14, "#ff6622");

  px(ctx, 458, 170, 36, 18, "#c03818");
  px(ctx, 482, 174, 14, 10, "#ff8844");

  blk(ctx, 236, 104, 88, 20, "#3a3028");
  px(ctx, 262, 84, 36, 28, "#ff4422");
  px(ctx, 268, 88, 22, 16, "#ffaa66");

  blk(ctx, 214, 208, 60, 86, "#16140e");
  px(ctx, 224, 216, 40, 70, "#3a3228");
  for (let i = 0; i < 5; i++) px(ctx, 226, 224 + i * 12, 34, 5, "#0c0a08");

  return c.toDataURL("image/png");
}

export function drawFlamethrowerSprite() {
  const c = document.createElement("canvas");
  c.width = 560;
  c.height = 380;
  const ctx = c.getContext("2d");
  ctx.imageSmoothingEnabled = false;

  blk(ctx, 40, 160, 90, 126, "#20160e");
  px(ctx, 52, 172, 66, 104, "#4a3828");
  px(ctx, 62, 186, 46, 30, "#ff6622");
  px(ctx, 66, 192, 38, 14, "#ffcc66");
  px(ctx, 62, 226, 46, 24, "#aa3310");
  px(ctx, 56, 270, 58, 14, "#141008");
  px(ctx, 72, 152, 24, 12, "#3a3028");

  px(ctx, 118, 208, 52, 16, "#181410");
  px(ctx, 158, 196, 38, 16, "#2a2420");
  px(ctx, 184, 184, 30, 16, "#181410");

  blk(ctx, 196, 144, 188, 82, "#1a161c");
  px(ctx, 208, 154, 164, 22, "#5a4a38");
  px(ctx, 212, 152, 156, 8, "#d0a050");
  px(ctx, 216, 184, 148, 30, "#100c14");
  px(ctx, 250, 164, 44, 14, "#08060a");

  blk(ctx, 368, 154, 118, 48, "#262018");
  px(ctx, 378, 164, 98, 12, "#ff8833");
  px(ctx, 388, 182, 84, 16, "#100c08");
  for (let i = 0; i < 5; i++) px(ctx, 396 + i * 14, 170, 10, 10, "#ff5500");

  blk(ctx, 472, 156, 62, 44, "#181208");
  px(ctx, 492, 164, 36, 28, "#ff6622");
  px(ctx, 508, 170, 22, 16, "#ffcc44");
  px(ctx, 518, 174, 12, 10, "#ffffff");

  blk(ctx, 250, 216, 52, 86, "#16140e");
  px(ctx, 258, 224, 36, 70, "#3a3028");
  for (let i = 0; i < 5; i++) px(ctx, 260, 232 + i * 12, 30, 5, "#0c0a08");

  px(ctx, 276, 114, 22, 22, "#ff4400");
  px(ctx, 280, 118, 14, 14, "#ffee88");
  px(ctx, 284, 122, 6, 6, "#ffffff");

  return c.toDataURL("image/png");
}

export function drawMuzzleFlash() {
  const c = document.createElement("canvas");
  c.width = 200;
  c.height = 140;
  const ctx = c.getContext("2d");
  ctx.imageSmoothingEnabled = false;

  const flash = (cx, cy) => {
    px(ctx, cx - 10, cy + 30, 20, 20, "#ffffff");
    px(ctx, cx - 20, cy + 16, 40, 40, "#ffe566");
    px(ctx, cx - 30, cy + 0, 60, 56, "#ff7722");
    px(ctx, cx - 8, cy - 16, 16, 32, "#ffaa33");
    px(ctx, cx - 34, cy + 28, 68, 12, "#ffcc55");
    px(ctx, cx - 24, cy - 8, 12, 20, "#ff4422");
    px(ctx, cx + 12, cy - 8, 12, 20, "#ff4422");
  };
  flash(60, 40);
  flash(140, 40);

  return c.toDataURL("image/png");
}

export function drawPlasmaFlash() {
  const c = document.createElement("canvas");
  c.width = 160;
  c.height = 120;
  const ctx = c.getContext("2d");
  ctx.imageSmoothingEnabled = false;

  px(ctx, 60, 40, 40, 40, "#ffffff");
  px(ctx, 48, 28, 64, 64, "#88ffee");
  px(ctx, 36, 16, 88, 80, "#33ddaa");
  px(ctx, 68, 8, 24, 36, "#aaffcc");
  px(ctx, 40, 48, 80, 16, "#66ffcc");

  return c.toDataURL("image/png");
}

const SPRITE_CACHE_VERSION = 16;
let _cache = null;
let _cacheVersion = -1;

export function getWeaponSprites() {
  if (_cache && _cacheVersion === SPRITE_CACHE_VERSION) return _cache;
  _cacheVersion = SPRITE_CACHE_VERSION;
  _cache = {
    pistol: drawPistolSprite(),
    shotgun: drawShotgunSprite(),
    machinegun: drawMachinegunSprite(),
    plasma: drawPlasmaSprite(),
    rocket: drawRocketSprite(),
    flamethrower: drawFlamethrowerSprite(),
    muzzle: drawMuzzleFlash(),
    muzzlePlasma: drawPlasmaFlash(),
  };
  return _cache;
}

export function clearWeaponSpriteCache() {
  _cache = null;
  _cacheVersion = -1;
}
