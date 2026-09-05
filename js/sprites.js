/**
 * High-quality procedural FP weapon sprites — gradient shading, specular
 * highlights, soft outlines. Original artwork, no commercial game assets.
 */

// ── Temel çizim yardımcıları ──────────────────────────────────────────────

function px(ctx, x, y, w, h, color) {
  ctx.fillStyle = color;
  ctx.fillRect(Math.round(x), Math.round(y), Math.round(w), Math.round(h));
}

/** Koyu dış kontur + dolgu (3-katmanlı: outline → mid → highlight) */
function blk(ctx, x, y, w, h, color, outline = "#05050a", highlight = null) {
  px(ctx, x - 2, y - 2, w + 4, h + 4, outline);
  px(ctx, x, y, w, h, color);
  if (highlight) px(ctx, x + 2, y + 2, w - 8, 3, highlight);
}

/** Radial gradient ile parlak yüzey noktası */
function shine(ctx, cx, cy, r, colorInner, colorOuter) {
  const g = ctx.createRadialGradient(cx - r * 0.3, cy - r * 0.3, r * 0.05, cx, cy, r);
  g.addColorStop(0, colorInner);
  g.addColorStop(1, colorOuter);
  ctx.fillStyle = g;
  ctx.beginPath();
  ctx.ellipse(cx, cy, r, r * 0.7, 0, 0, Math.PI * 2);
  ctx.fill();
}

/** Linear gradient ile geniş metal panel */
function panel(ctx, x, y, w, h, topColor, botColor, hlColor = null) {
  const g = ctx.createLinearGradient(x, y, x, y + h);
  g.addColorStop(0, topColor);
  g.addColorStop(1, botColor);
  ctx.fillStyle = g;
  ctx.fillRect(Math.round(x), Math.round(y), Math.round(w), Math.round(h));
  if (hlColor) {
    ctx.fillStyle = hlColor;
    ctx.fillRect(Math.round(x + 3), Math.round(y + 2), Math.round(w - 10), 3);
  }
}

/** Scanline trapezoid (perspektif namlu şekli) */
function trap(ctx, y0, y1, l0, r0, l1, r1, color) {
  const n = Math.max(1, Math.round(y1 - y0));
  for (let i = 0; i < n; i++) {
    const t = i / n;
    const l = l0 + (l1 - l0) * t;
    const r = r0 + (r1 - r0) * t;
    ctx.fillStyle = color;
    ctx.fillRect(Math.round(l), y0 + i, Math.max(1, Math.round(r - l)), 1);
  }
}

/** Gradient trapezoid — her satır ayrı renk (metalik yansıma) */
function trapGrad(ctx, y0, y1, l0, r0, l1, r1, colorTop, colorBot) {
  const n = Math.max(1, Math.round(y1 - y0));
  for (let i = 0; i < n; i++) {
    const t = i / n;
    const l = l0 + (l1 - l0) * t;
    const r = r0 + (r1 - r0) * t;
    const lerp = (a, b) => Math.round(a + (b - a) * t);
    const r1c = parseInt(colorTop.slice(1, 3), 16);
    const g1c = parseInt(colorTop.slice(3, 5), 16);
    const b1c = parseInt(colorTop.slice(5, 7), 16);
    const r2c = parseInt(colorBot.slice(1, 3), 16);
    const g2c = parseInt(colorBot.slice(3, 5), 16);
    const b2c = parseInt(colorBot.slice(5, 7), 16);
    ctx.fillStyle = `rgb(${lerp(r1c,r2c)},${lerp(g1c,g2c)},${lerp(b1c,b2c)})`;
    ctx.fillRect(Math.round(l), y0 + i, Math.max(1, Math.round(r - l)), 1);
  }
}

/** Çift namlu halkası — metalik bantlar */
function barrelRing(ctx, y, thick, grow, ll0, lr0, rl0, rr0, ll1, lr1, rl1, rr1) {
  const t = 0;
  const lL = ll0 + (ll1 - ll0) * t, lR = lr0 + (lr1 - lr0) * t;
  const rLr = rl0 + (rl1 - rl0) * t, rRr = rr0 + (rr1 - rr0) * t;
  trap(ctx, y,     y + thick,     lL - grow, lR + 1,     lL - grow, lR + 1,     "#1a1a22");
  trap(ctx, y,     y + thick,     rLr - 1,   rRr + grow, rLr - 1,   rRr + grow, "#1a1a22");
  trap(ctx, y + 1, y + thick - 1, lL - grow + 2, lR,     lL - grow + 2, lR,     "#5a5a68");
  trap(ctx, y + 1, y + thick - 1, rLr, rRr + grow - 2,   rLr, rRr + grow - 2,   "#5a5a68");
  trap(ctx, y + 2, y + 3,         lL - 1, lR - 4,        lL - 1, lR - 4,        "#c8c8d4");
  trap(ctx, y + 2, y + 3,         rLr + 4, rRr + 1,      rLr + 4, rRr + 1,      "#c8c8d4");
}

// ── Pompali Tüfek ─────────────────────────────────────────────────────────
export function drawShotgunSprite() {
  const c = document.createElement("canvas");
  c.width = 560; c.height = 440;
  const ctx = c.getContext("2d");
  ctx.imageSmoothingEnabled = true;

  // Dış kontur / gölge zemin
  ctx.shadowColor = "rgba(0,0,0,0.7)";
  ctx.shadowBlur = 18;
  ctx.shadowOffsetX = 4; ctx.shadowOffsetY = 6;

  // —— Namlu tüpleri (geniş perspektif gradient) ——
  trapGrad(ctx, 18, 178, 230, 262, 180, 255, "#8a8a96", "#4a4a58");
  trapGrad(ctx, 18, 178, 258, 292, 264, 342, "#8a8a96", "#4a4a58");

  // Namlu sol – parlak üst kenar
  trapGrad(ctx, 22, 172, 234, 256, 186, 246, "#d0d0dc", "#7a7a8a");
  trapGrad(ctx, 22, 172, 260, 288, 268, 336, "#d0d0dc", "#7a7a8a");

  // Namlu sol – karanlık alt kenar
  trap(ctx, 28, 170, 246, 256, 218, 240, "#2a2a34");
  trap(ctx, 28, 170, 268, 278, 306, 326, "#2a2a34");

  // Namlu iç karanlık çekirdek
  trap(ctx, 26, 168, 238, 252, 194, 228, "#505060");
  trap(ctx, 26, 168, 264, 278, 278, 314, "#505060");

  // Halka bantları
  for (const [ry, rth] of [[50,11],[88,11],[126,12],[162,13]]) {
    barrelRing(ctx, ry, rth, 5, 232, 258, 260, 290, 182, 250, 266, 340);
  }

  // Merkez nervür
  trapGrad(ctx, 22, 170, 255, 265, 244, 278, "#6a6a76", "#3a3a46");
  trap(ctx, 24, 80, 259, 261, 254, 264, "#e0e0ea");

  // Namlu delikleri
  const mh = (mx, my) => {
    px(ctx, mx, my, 22, 18, "#05050a");
    const g = ctx.createRadialGradient(mx + 11, my + 9, 1, mx + 11, my + 9, 9);
    g.addColorStop(0, "#000000"); g.addColorStop(1, "#1a1a22");
    ctx.fillStyle = g; ctx.fillRect(mx + 2, my + 2, 18, 14);
    px(ctx, mx + 2, my + 2, 5, 3, "#606068");
  };
  mh(236, 5); mh(264, 5);

  ctx.shadowBlur = 0; ctx.shadowOffsetX = 0; ctx.shadowOffsetY = 0;

  // —— Breech / alıcı (geniş kısım) ——
  panel(ctx, 174, 168, 174, 54, "#6e6e7c", "#3e3e4c", "#aaaab8");
  panel(ctx, 180, 174, 160, 30, "#c0c0cc", "#8a8a9a");
  px(ctx, 186, 178, 6, 26, "#e8e8f2");
  px(ctx, 234, 178, 50, 8, "#d4d4e0");
  px(ctx, 248, 192, 24, 8, "#18181e");

  // Sarı/pirinç mandal (breech lever)
  blk(ctx, 116, 172, 70, 20, "#4a3208", "#05050a", "#f4dc78");
  panel(ctx, 118, 174, 68, 16, "#f0c830", "#b88c18", "#fce870");
  blk(ctx, 110, 180, 30, 56, "#4a3208", "#05050a", "#f4dc78");
  panel(ctx, 112, 182, 26, 52, "#d8a020", "#9a6c0c", "#f4cc50");
  px(ctx, 116, 192, 18, 14, "#f8dc68");
  px(ctx, 112, 228, 26, 8, "#886010");
  px(ctx, 148, 178, 12, 24, "#6a4a08");
  shine(ctx, 124, 190, 8, "#fff3a0", "rgba(200,150,20,0)");

  // —— Ahşap dipçik (warm wood gradient) ——
  trap(ctx, 218, 268, 196, 328, 210, 322, "#05050a");
  trapGrad(ctx, 220, 266, 200, 324, 214, 318, "#b05828", "#7a3814");
  trapGrad(ctx, 224, 260, 214, 306, 224, 300, "#d07040", "#904820");
  px(ctx, 236, 234, 50, 6, "#e0906050");
  shine(ctx, 255, 242, 18, "rgba(255,200,140,0.3)", "rgba(0,0,0,0)");

  // Deri sarım — grip band
  trapGrad(ctx, 258, 344, 204, 324, 214, 314, "#1e0e08", "#0e0806");
  for (let i = 0; i < 10; i++) {
    const yy = 263 + i * 8;
    const t = (yy - 258) / 86;
    const l = 206 + 6 * t, r = 322 - 6 * t;
    px(ctx, l, yy, r - l, 5, "#16100a");
    px(ctx, l + 4, yy + 1, r - l - 10, 2, "#3a2418");
    shine(ctx, (l + r) / 2, yy + 2, 8, "rgba(80,50,30,0.18)", "rgba(0,0,0,0)");
  }

  // Alt yivli ahşap + gümüş pommel
  trapGrad(ctx, 338, 378, 212, 314, 228, 302, "#7a3414", "#4a1e08");
  trapGrad(ctx, 342, 372, 230, 298, 244, 286, "#a44c22", "#6a2c10");
  blk(ctx, 222, 368, 84, 38, "#242430", "#05050a");
  panel(ctx, 228, 370, 72, 30, "#aaaabc", "#686878", "#e0e0ec");
  px(ctx, 234, 374, 60, 10, "#d8d8e8");
  px(ctx, 250, 372, 20, 6, "#f0f0fc");
  shine(ctx, 266, 378, 16, "rgba(255,255,255,0.3)", "rgba(0,0,0,0)");

  return c.toDataURL("image/png");
}

// ── Tabanca ───────────────────────────────────────────────────────────────
export function drawPistolSprite() {
  const c = document.createElement("canvas");
  c.width = 460; c.height = 340;
  const ctx = c.getContext("2d");
  ctx.imageSmoothingEnabled = true;

  ctx.shadowColor = "rgba(0,0,0,0.65)";
  ctx.shadowBlur = 14; ctx.shadowOffsetX = 3; ctx.shadowOffsetY = 5;

  // Grip — plastik/kauçuk doku
  blk(ctx, 166, 170, 78, 134, "#100c08");
  panel(ctx, 170, 180, 62, 106, "#4a3c2e", "#2a201a", "#6a5848");
  // Grip yiv çizgileri
  for (let i = 0; i < 8; i++) px(ctx, 176, 200 + i * 12, 46, 6, "#1e1610");
  for (let i = 0; i < 8; i++) px(ctx, 178, 203 + i * 12, 42, 2, "#2e2418");
  px(ctx, 174, 272, 38, 12, "#201610");
  shine(ctx, 195, 210, 20, "rgba(150,120,90,0.2)", "rgba(0,0,0,0)");

  ctx.shadowBlur = 0; ctx.shadowOffsetX = 0; ctx.shadowOffsetY = 0;

  // Slide — ana gövde
  blk(ctx, 68, 94, 248, 78, "#16161e");
  panel(ctx, 80, 102, 224, 20, "#c8c8d8", "#8a8a9c", "#e8e8f4");
  panel(ctx, 80, 128, 224, 32, "#0e0e14", "#0a0a10");
  // Serrasyon çentikleri
  for (let i = 0; i < 14; i++) {
    px(ctx, 244 + i * 5, 108, 3, 44, "#060608");
    px(ctx, 245 + i * 5, 110, 1, 38, "#3a3a4a");
  }
  // Sol ejektör kanalı
  px(ctx, 82, 106, 14, 52, "#f0f0fc");
  px(ctx, 84, 108, 8, 44, "#d4d4e4");

  // Gez
  blk(ctx, 166, 68, 36, 28, "#18181e");
  px(ctx, 176, 60, 18, 18, "#ff2a44");
  px(ctx, 178, 62, 14, 12, "#ff8880");
  shine(ctx, 185, 67, 6, "rgba(255,180,180,0.6)", "rgba(200,0,30,0)");

  // Namlu
  blk(ctx, 290, 112, 108, 34, "#0e0e14");
  panel(ctx, 358, 116, 52, 26, "#07070c", "#040408");
  px(ctx, 380, 120, 22, 18, "#020204");
  px(ctx, 292, 114, 8, 28, "#9090a4");
  px(ctx, 302, 116, 6, 8, "#c8c8dc");
  shine(ctx, 358, 124, 10, "rgba(100,100,130,0.4)", "rgba(0,0,0,0)");

  // Tetik muhafazası + tetik
  blk(ctx, 166, 156, 48, 24, "#131318");
  panel(ctx, 176, 162, 30, 16, "#3a3a4a", "#1e1e28");
  px(ctx, 204, 164, 6, 22, "#888898");
  px(ctx, 206, 166, 4, 16, "#c0c0cc");

  // Şarjör
  px(ctx, 174, 156, 50, 18, "#14141a");
  px(ctx, 182, 160, 34, 10, "#36364a");

  // Üst ray — picatinny
  for (let i = 0; i < 8; i++) {
    px(ctx, 82 + i * 26, 92, 18, 5, "#252530");
    px(ctx, 85 + i * 26, 93, 12, 3, "#404050");
  }

  return c.toDataURL("image/png");
}

// ── Makineli Tüfek ────────────────────────────────────────────────────────
export function drawMachinegunSprite() {
  const c = document.createElement("canvas");
  c.width = 580; c.height = 400;
  const ctx = c.getContext("2d");
  ctx.imageSmoothingEnabled = true;

  ctx.shadowColor = "rgba(0,0,0,0.7)";
  ctx.shadowBlur = 16; ctx.shadowOffsetX = 4; ctx.shadowOffsetY = 6;

  // Dipçik
  blk(ctx, 24, 214, 118, 92, "#14100a");
  panel(ctx, 36, 226, 92, 68, "#3e3228", "#24180e", "#5e4c38");
  for (let i = 0; i < 4; i++) px(ctx, 46, 244 + i * 14, 68, 8, "#1a1208");
  for (let i = 0; i < 4; i++) px(ctx, 48, 247 + i * 14, 64, 3, "#2e2018");
  shine(ctx, 80, 254, 22, "rgba(120,90,60,0.22)", "rgba(0,0,0,0)");

  ctx.shadowBlur = 0; ctx.shadowOffsetX = 0; ctx.shadowOffsetY = 0;

  // Ana gövde / alıcı
  blk(ctx, 112, 150, 248, 112, "#121218");
  panel(ctx, 124, 160, 224, 32, "#707082", "#484858", "#b0b0c4");
  panel(ctx, 132, 156, 208, 8, "#d0d0e0", "#a0a0b4");
  panel(ctx, 140, 200, 200, 46, "#0a0a10", "#080810");
  // Alıcı üst detay
  px(ctx, 148, 166, 16, 26, "#f0f0fc");
  px(ctx, 150, 168, 10, 18, "#d4d4ec");
  // Şarjör yuvası
  panel(ctx, 218, 172, 50, 20, "#060608", "#030306");
  shine(ctx, 240, 168, 20, "rgba(80,80,120,0.2)", "rgba(0,0,0,0)");

  // Namlu
  blk(ctx, 344, 164, 182, 50, "#20202c");
  panel(ctx, 352, 170, 164, 14, "#9898b0", "#585870", "#c8c8e0");
  for (let i = 0; i < 9; i++) {
    px(ctx, 360 + i * 14, 188, 10, 20, "#0c0c12");
    px(ctx, 362 + i * 14, 189, 6, 16, "#1e1e28");
  }
  // Namlu ucu
  panel(ctx, 494, 162, 56, 34, "#0c0c10", "#060608");
  px(ctx, 520, 168, 28, 22, "#030305");
  shine(ctx, 520, 175, 10, "rgba(80,80,120,0.35)", "rgba(0,0,0,0)");

  // Şarjör (büyük yuvarlak — LMG tipi)
  blk(ctx, 168, 242, 112, 114, "#101018");
  panel(ctx, 180, 256, 86, 86, "#3a3a4e", "#22222e", "#5a5a70");
  px(ctx, 208, 280, 36, 36, "#0c0c12");
  panel(ctx, 184, 252, 64, 10, "#a8a8bc", "#7070888");
  // Daire çıkıntıları
  for (let i = 0; i < 8; i++) {
    const ang = (i / 8) * Math.PI * 2;
    const sx = 222 + Math.cos(ang) * 30 - 5, sy = 294 + Math.sin(ang) * 30 - 5;
    px(ctx, sx, sy, 10, 10, "#0a0a10");
    shine(ctx, sx + 5, sy + 5, 4, "rgba(100,100,140,0.3)", "rgba(0,0,0,0)");
  }

  // Yan dişli menteşe
  for (const lx of [380, 456]) {
    panel(ctx, lx, 208, 14, 38, "#3a3a4a", "#22222e");
    px(ctx, lx + 2, 240, 10, 6, "#28283a");
  }

  // Kırmızı nişan noktası
  blk(ctx, 200, 108, 100, 20, "#262632");
  px(ctx, 240, 86, 28, 30, "#ff3322");
  px(ctx, 244, 90, 20, 18, "#ff9966");
  shine(ctx, 254, 96, 9, "rgba(255,240,200,0.6)", "rgba(220,50,20,0)");

  return c.toDataURL("image/png");
}

// ── Plazma Tüfeği ─────────────────────────────────────────────────────────
export function drawPlasmaSprite() {
  const c = document.createElement("canvas");
  c.width = 560; c.height = 380;
  const ctx = c.getContext("2d");
  ctx.imageSmoothingEnabled = true;

  ctx.shadowColor = "rgba(0,180,140,0.55)";
  ctx.shadowBlur = 20; ctx.shadowOffsetX = 0; ctx.shadowOffsetY = 0;

  // Enerji hücresi
  blk(ctx, 22, 178, 92, 102, "#080e14");
  panel(ctx, 34, 190, 68, 78, "#1e3a4e", "#0c1e2e", "#3a6880");
  // Cam pencerecik
  const grd = ctx.createLinearGradient(44, 200, 44, 234);
  grd.addColorStop(0, "#44ffee"); grd.addColorStop(0.5, "#88fff4"); grd.addColorStop(1, "#1aaa88");
  ctx.fillStyle = grd; ctx.fillRect(44, 200, 52, 30);
  px(ctx, 46, 202, 48, 4, "#ccfffa");
  px(ctx, 44, 240, 52, 20, "#0e2030");
  shine(ctx, 70, 212, 14, "rgba(200,255,250,0.55)", "rgba(0,180,140,0)");

  ctx.shadowBlur = 8; ctx.shadowColor = "rgba(0,220,180,0.3)";

  // Ana gövde
  blk(ctx, 100, 140, 264, 100, "#0c1620");
  panel(ctx, 114, 150, 238, 28, "#4a6c86", "#283c52", "#80b0cc");
  panel(ctx, 118, 148, 230, 8, "#a8d8f0", "#6090b0");
  panel(ctx, 128, 188, 218, 38, "#080e18", "#050a10");
  // Plazma şarj ışığı kanalı
  const plc = ctx.createLinearGradient(148, 160, 318, 160);
  plc.addColorStop(0, "#00ffcc"); plc.addColorStop(0.5, "#44ffee"); plc.addColorStop(1, "#00cc99");
  ctx.fillStyle = plc; ctx.fillRect(148, 158, 170, 24);
  px(ctx, 150, 160, 166, 8, "#ccfffa");
  px(ctx, 160, 174, 148, 5, "rgba(0,255,200,0.3)");
  shine(ctx, 218, 162, 30, "rgba(255,255,255,0.35)", "rgba(0,200,150,0)");

  ctx.shadowBlur = 22; ctx.shadowColor = "rgba(0,255,200,0.6)";

  // Namlu ucu — parlak plazma hücresi
  blk(ctx, 350, 150, 148, 60, "#142030");
  panel(ctx, 360, 158, 128, 14, "#44ffee", "#1ab8a0");
  panel(ctx, 364, 180, 118, 22, "#08121c", "#040810");
  for (let i = 0; i < 7; i++) {
    const col = i % 2 === 0 ? "#1aeecc" : "#0aa888";
    px(ctx, 372 + i * 16, 184, 12, 12, col);
  }
  blk(ctx, 482, 158, 58, 44, "#0c1824");
  panel(ctx, 492, 166, 38, 28, "#050a10", "#020508");
  px(ctx, 502, 170, 22, 18, "#44ffee");
  px(ctx, 506, 174, 14, 12, "#ccfffa");
  shine(ctx, 512, 177, 8, "rgba(255,255,255,0.7)", "rgba(0,255,200,0)");

  ctx.shadowBlur = 0;

  // Üst optik
  blk(ctx, 162, 108, 168, 20, "#1a2c3e");
  px(ctx, 226, 84, 48, 36, "#0c1620");
  panel(ctx, 234, 90, 30, 22, "#44ffaa", "#1a9966", "#88ffcc");
  shine(ctx, 248, 97, 10, "rgba(220,255,240,0.6)", "rgba(0,180,100,0)");

  // Dipçik
  blk(ctx, 194, 226, 56, 92, "#08101a");
  panel(ctx, 202, 234, 40, 76, "#1e3040", "#0c1820", "#2e4860");
  for (let i = 0; i < 5; i++) px(ctx, 206, 244 + i * 14, 32, 6, "#060e14");

  return c.toDataURL("image/png");
}

// ── Roket Atar ────────────────────────────────────────────────────────────
export function drawRocketSprite() {
  const c = document.createElement("canvas");
  c.width = 600; c.height = 400;
  const ctx = c.getContext("2d");
  ctx.imageSmoothingEnabled = true;

  ctx.shadowColor = "rgba(0,0,0,0.65)";
  ctx.shadowBlur = 16; ctx.shadowOffsetX = 4; ctx.shadowOffsetY = 5;

  // Dipçik
  blk(ctx, 18, 152, 112, 90, "#1a1208");
  panel(ctx, 32, 164, 86, 66, "#4e3c2a", "#2c1e10", "#6e5440");
  for (let i = 0; i < 4; i++) px(ctx, 40, 178 + i * 13, 68, 8, "#1c1208");
  px(ctx, 32, 228, 28, 12, "#ff3c1a");
  shine(ctx, 32, 236, 10, "rgba(255,150,80,0.45)", "rgba(0,0,0,0)");
  px(ctx, 68, 228, 28, 12, "#ff8838");
  shine(ctx, 68, 236, 10, "rgba(255,200,100,0.45)", "rgba(0,0,0,0)");

  ctx.shadowBlur = 0; ctx.shadowOffsetX = 0; ctx.shadowOffsetY = 0;

  // Tüp gövde (ana namlu)
  blk(ctx, 114, 144, 336, 74, "#14141c");
  panel(ctx, 126, 152, 310, 22, "#7a7a8e", "#484858", "#aaaabe");
  panel(ctx, 130, 150, 302, 8, "#cecee0", "#9090a4");
  panel(ctx, 140, 184, 290, 26, "#080810", "#050508");
  // Tüp çevre şeritleri
  for (let i = 0; i < 10; i++) {
    px(ctx, 148 + i * 30, 172, 22, 10, "#2e2e3a");
    px(ctx, 150 + i * 30, 174, 18, 6, "#3e3e4e");
  }
  shine(ctx, 290, 160, 50, "rgba(200,200,240,0.14)", "rgba(0,0,0,0)");

  // Namlu ucu + alev
  blk(ctx, 428, 132, 120, 92, "#1c1c28");
  panel(ctx, 442, 148, 90, 18, "#aaaabc", "#646478");
  panel(ctx, 476, 158, 60, 50, "#08080e", "#040408");
  px(ctx, 504, 166, 30, 32, "#030305");
  // Alev turuncu halo
  const flg = ctx.createRadialGradient(512, 178, 2, 512, 178, 16);
  flg.addColorStop(0, "#ff7c2a"); flg.addColorStop(0.6, "#ff4808"); flg.addColorStop(1, "rgba(255,40,0,0)");
  ctx.fillStyle = flg; ctx.fillRect(496, 162, 34, 30);
  shine(ctx, 512, 178, 10, "rgba(255,220,140,0.55)", "rgba(255,60,0,0)");

  // Tetik grubu
  blk(ctx, 230, 100, 96, 22, "#303040");
  px(ctx, 258, 78, 38, 32, "#ff3c1a");
  px(ctx, 262, 82, 28, 22, "#ffaa66");
  shine(ctx, 276, 88, 12, "rgba(255,240,180,0.5)", "rgba(220,60,10,0)");

  // Dipçik kolu
  blk(ctx, 210, 212, 64, 96, "#12120e");
  panel(ctx, 220, 220, 44, 80, "#302e26", "#1a1810", "#464238");
  for (let i = 0; i < 5; i++) px(ctx, 222, 230 + i * 14, 38, 6, "#0c0c0a");

  return c.toDataURL("image/png");
}

// ── Alev Makinesi ─────────────────────────────────────────────────────────
export function drawFlamethrowerSprite() {
  const c = document.createElement("canvas");
  c.width = 580; c.height = 400;
  const ctx = c.getContext("2d");
  ctx.imageSmoothingEnabled = true;

  ctx.shadowColor = "rgba(255,100,20,0.45)";
  ctx.shadowBlur = 20;

  // Tank
  blk(ctx, 36, 158, 98, 138, "#18100a");
  panel(ctx, 50, 170, 72, 110, "#4e3620", "#2a1c0e", "#7a5434");
  // Tank alev kanalı
  const tg = ctx.createLinearGradient(60, 190, 60, 240);
  tg.addColorStop(0, "#ff8822"); tg.addColorStop(0.5, "#ffcc44"); tg.addColorStop(1, "#cc3300");
  ctx.fillStyle = tg; ctx.fillRect(60, 190, 50, 50);
  px(ctx, 62, 192, 46, 8, "#ffeeaa");
  px(ctx, 60, 244, 54, 26, "#8a2a0e");
  px(ctx, 54, 290, 60, 16, "#100806");
  px(ctx, 70, 150, 26, 14, "#3a2c20");
  shine(ctx, 82, 214, 16, "rgba(255,200,100,0.35)", "rgba(0,0,0,0)");

  ctx.shadowBlur = 6; ctx.shadowColor = "rgba(0,0,0,0.6)";

  // Bağlantı borular
  for (const [bx, by] of [[120, 208],[162, 196],[190, 182]]) {
    panel(ctx, bx, by, 42, 18, "#1c1610", "#100c08");
    px(ctx, bx + 4, by + 4, 34, 8, "#2a2018");
  }

  // Ana gövde
  blk(ctx, 194, 142, 200, 90, "#14121a");
  panel(ctx, 208, 152, 172, 28, "#5e4e3c", "#342e24", "#8a7a68");
  panel(ctx, 212, 150, 164, 8, "#c8a858", "#8a7030");
  panel(ctx, 218, 188, 156, 34, "#0e0c12", "#080610");
  px(ctx, 254, 162, 46, 16, "#06060a");
  shine(ctx, 298, 162, 24, "rgba(200,160,80,0.22)", "rgba(0,0,0,0)");

  // Namlu
  blk(ctx, 376, 150, 132, 54, "#1e1a14");
  panel(ctx, 388, 162, 110, 14, "#e89030", "#9a5810", "#ffcc66");
  panel(ctx, 398, 182, 90, 18, "#08060a", "#040408");
  for (let i = 0; i < 6; i++) px(ctx, 404 + i * 14, 172, 10, 10, "#ff4400");
  shine(ctx, 430, 168, 18, "rgba(255,200,80,0.3)", "rgba(255,60,0,0)");

  ctx.shadowBlur = 28; ctx.shadowColor = "rgba(255,140,0,0.7)";

  // Nozul + alev
  blk(ctx, 488, 152, 70, 52, "#140e06");
  panel(ctx, 498, 162, 42, 30, "#ff6618", "#cc3c08");
  px(ctx, 514, 168, 26, 18, "#ffcc44");
  px(ctx, 524, 172, 16, 12, "#fff4aa");
  px(ctx, 530, 175, 8, 8, "#ffffff");
  shine(ctx, 535, 178, 6, "rgba(255,255,255,0.85)", "rgba(255,160,30,0)");

  ctx.shadowBlur = 0;

  // Dipçik
  blk(ctx, 248, 222, 56, 92, "#12100a");
  panel(ctx, 258, 232, 38, 76, "#362e22", "#1c1610", "#504840");
  for (let i = 0; i < 5; i++) px(ctx, 260, 242 + i * 14, 32, 6, "#0c0a08");

  // Duman/alev tüyü — MeshBasicMaterial bloom için parlak noktalar
  for (const [fx, fy, fr] of [[278,110,12],[282,120,9],[285,128,6]]) {
    const flg2 = ctx.createRadialGradient(fx, fy, 1, fx, fy, fr);
    flg2.addColorStop(0, "#ff5500"); flg2.addColorStop(0.5, "#ff8830"); flg2.addColorStop(1, "rgba(255,80,0,0)");
    ctx.fillStyle = flg2; ctx.beginPath(); ctx.arc(fx, fy, fr, 0, Math.PI * 2); ctx.fill();
  }
  px(ctx, 272, 120, 24, 24, "#ff3800");
  px(ctx, 276, 124, 16, 16, "#ffcc44");
  px(ctx, 280, 128, 8, 8, "#ffffff");

  return c.toDataURL("image/png");
}

// ── Namlu Flaşları ────────────────────────────────────────────────────────
export function drawMuzzleFlash() {
  const c = document.createElement("canvas");
  c.width = 240; c.height = 160;
  const ctx = c.getContext("2d");
  ctx.imageSmoothingEnabled = true;

  const flash = (cx, cy, scale = 1) => {
    // Dış yumuşak halo
    const halo = ctx.createRadialGradient(cx, cy + 20, 2, cx, cy + 20, 38 * scale);
    halo.addColorStop(0, "rgba(255,220,100,0.85)");
    halo.addColorStop(0.5, "rgba(255,120,30,0.5)");
    halo.addColorStop(1, "rgba(255,60,0,0)");
    ctx.fillStyle = halo;
    ctx.beginPath(); ctx.ellipse(cx, cy + 20, 42 * scale, 34 * scale, 0, 0, Math.PI * 2); ctx.fill();

    // Çekirdek alev
    px(ctx, cx - 12, cy + 20, 24, 24, "#ffffff");
    px(ctx, cx - 22, cy + 6,  44, 44, "#ffe066");
    px(ctx, cx - 32, cy - 8,  64, 58, "#ff8822");
    px(ctx, cx - 10, cy - 22, 20, 36, "#ffbb33");
    px(ctx, cx - 36, cy + 18, 72, 14, "#ffcc55");
    px(ctx, cx - 26, cy - 14, 14, 24, "#ff3a18");
    px(ctx, cx + 12, cy - 14, 14, 24, "#ff3a18");
  };

  flash(68, 42, 1.0);
  flash(152, 42, 0.95);

  return c.toDataURL("image/png");
}

export function drawPlasmaFlash() {
  const c = document.createElement("canvas");
  c.width = 180; c.height = 140;
  const ctx = c.getContext("2d");
  ctx.imageSmoothingEnabled = true;

  const halo = ctx.createRadialGradient(90, 70, 4, 90, 70, 58);
  halo.addColorStop(0, "rgba(200,255,250,0.9)");
  halo.addColorStop(0.4, "rgba(0,255,200,0.65)");
  halo.addColorStop(1, "rgba(0,180,130,0)");
  ctx.fillStyle = halo;
  ctx.beginPath(); ctx.ellipse(90, 70, 62, 50, 0, 0, Math.PI * 2); ctx.fill();

  px(ctx, 64, 44, 52, 52, "#ffffff");
  px(ctx, 50, 30, 80, 80, "#88ffee");
  px(ctx, 36, 18, 108, 88, "#33ddaa");
  px(ctx, 72, 10, 36, 40, "#aaffcc");
  px(ctx, 38, 54, 104, 18, "#66ffcc");

  return c.toDataURL("image/png");
}

// ── Cache & Export ─────────────────────────────────────────────────────────
const SPRITE_CACHE_VERSION = 18;
let _cache = null;
let _cacheVersion = -1;

export function getWeaponSprites() {
  if (_cache && _cacheVersion === SPRITE_CACHE_VERSION) return _cache;
  _cacheVersion = SPRITE_CACHE_VERSION;
  _cache = {
    pistol:        drawPistolSprite(),
    shotgun:       drawShotgunSprite(),
    machinegun:    drawMachinegunSprite(),
    plasma:        drawPlasmaSprite(),
    rocket:        drawRocketSprite(),
    flamethrower:  drawFlamethrowerSprite(),
    muzzle:        drawMuzzleFlash(),
    muzzlePlasma:  drawPlasmaFlash(),
  };
  return _cache;
}

export function clearWeaponSpriteCache() {
  _cache = null;
  _cacheVersion = -1;
}
