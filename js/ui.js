/**
 * HUD + overlay ekranları + skor tablosu + silah sprite'ları
 */

import { getWeaponSprites } from "./sprites.js";

const SCORE_KEY = "derin-koridorlar-scores";
const MAX_SCORES = 10;

export function loadScores() {
  try {
    const raw = localStorage.getItem(SCORE_KEY);
    const list = raw ? JSON.parse(raw) : [];
    return Array.isArray(list) ? list : [];
  } catch {
    return [];
  }
}

export function saveScore(name, score) {
  const entry = {
    name: (name || "Oyuncu").trim().slice(0, 16) || "Oyuncu",
    score: Math.max(0, Math.floor(score)),
    date: new Date().toISOString(),
  };
  const list = loadScores();
  list.push(entry);
  list.sort((a, b) => b.score - a.score || a.date.localeCompare(b.date));
  const top = list.slice(0, MAX_SCORES);
  try {
    localStorage.setItem(SCORE_KEY, JSON.stringify(top));
  } catch {
    /* ignore quota */
  }
  return top;
}

function formatDate(iso) {
  try {
    const d = new Date(iso);
    return `${String(d.getDate()).padStart(2, "0")}.${String(d.getMonth() + 1).padStart(2, "0")}`;
  } catch {
    return "";
  }
}

export class UI {
  constructor() {
    this.hud = document.getElementById("hud");
    this.overlay = document.getElementById("overlay");
    this.title = document.getElementById("overlay-title");
    this.sub = document.getElementById("overlay-sub");
    this.msg = document.getElementById("overlay-msg");
    this.btn = document.getElementById("btn-start");
    this.hpEl = document.getElementById("hp-value");
    this.armorEl = document.getElementById("armor-value");
    this.ammoEl = document.getElementById("ammo-value");
    this.weaponEl = document.getElementById("weapon-value");
    this.scoreEl = document.getElementById("score-value");
    this.vignette = document.getElementById("damage-vignette");
    this.weaponView = document.getElementById("weapon-view");
    this.weaponSprite = document.getElementById("weapon-sprite");
    this.muzzleFlash = document.getElementById("muzzle-flash");
    this.face = document.getElementById("hud-face");
    this.pickupMsg = document.getElementById("pickup-msg");
    this.nameInput = document.getElementById("player-name");
    this.scoreboardEl = document.getElementById("scoreboard");
    this.nameRow = document.getElementById("name-row");
    this._lastHp = 100;
    this._lastArmor = 0;
    this._bobT = 0;
    this._sprites = getWeaponSprites();
    this.muzzleFlash.src = this._sprites.muzzle;
    this.weaponSprite.src = this._sprites.shotgun;
    this.playerName = "Oyuncu";
    this.pauseOverlay = document.getElementById("pause-overlay");
    this.btnResume = document.getElementById("btn-resume");
    this.btnFullscreen = document.getElementById("btn-fullscreen");
    this.btnQuit = document.getElementById("btn-quit");
  }

  getPlayerName() {
    const v = this.nameInput?.value?.trim();
    this.playerName = v || "Oyuncu";
    if (this.nameInput && !this.nameInput.value.trim()) {
      this.nameInput.value = "Oyuncu";
    }
    return this.playerName;
  }

  _renderScoreboard(highlightScore = null) {
    const scores = loadScores();
    if (!this.scoreboardEl) return;
    if (!scores.length) {
      this.scoreboardEl.innerHTML = `
        <div class="scoreboard-title">SKOR TABLOSU</div>
        <p class="scoreboard-empty">Henüz kayıt yok. İlk skoru sen yaz!</p>
      `;
      return;
    }
    const rows = scores
      .map((s, i) => {
        const hi =
          highlightScore != null && s.score === highlightScore && s.name === this.playerName
            ? " highlight"
            : "";
        return `<div class="score-row${hi}">
          <span class="rank">${i + 1}.</span>
          <span class="sname">${escapeHtml(s.name)}</span>
          <span class="sscore">${s.score}</span>
          <span class="sdate">${formatDate(s.date)}</span>
        </div>`;
      })
      .join("");
    this.scoreboardEl.innerHTML = `
      <div class="scoreboard-title">SKOR TABLOSU</div>
      <div class="score-head">
        <span></span><span>İSİM</span><span>SKOR</span><span></span>
      </div>
      ${rows}
    `;
  }

  showStart(onStart) {
    this.hud.classList.add("hidden");
    this.overlay.classList.remove("hidden");
    this.overlay.classList.add("start-screen");
    this.title.textContent = "DERİN KORİDOR";
    if (this.sub) {
      this.sub.textContent = "";
      this.sub.classList.add("hidden");
    }
    this.msg.innerHTML = `
      Üç dalga düşmanı temizle. Tesis labirentinden sağ çık.<br />
      <span class="desktop-hint">WASD hareket · Fare bakış · Sol tık ateş · R şarjör · Boşluk zıpla · E kapı · ESC duraklat</span>
    `;
    if (this.nameRow) this.nameRow.classList.remove("hidden");
    if (this.nameInput && !this.nameInput.value) this.nameInput.value = "Oyuncu";
    this._renderScoreboard();
    if (this.scoreboardEl) this.scoreboardEl.classList.remove("hidden");
    this.btn.textContent = "TESİSE GİR";
    this.btn.onclick = () => {
      this.getPlayerName();
      onStart();
    };
  }

  showPlaying() {
    this.overlay.classList.add("hidden");
    this.overlay.classList.remove("start-screen");
    this.hud.classList.remove("hidden");
    this.hidePause();
  }

  showPause(handlers) {
    if (!this.pauseOverlay) return;
    this.pauseOverlay.classList.remove("hidden");
    this.pauseOverlay.setAttribute("aria-hidden", "false");
    if (this.btnResume) this.btnResume.onclick = () => handlers?.onResume?.();
    if (this.btnFullscreen) this.btnFullscreen.onclick = () => handlers?.onFullscreen?.();
    if (this.btnQuit) this.btnQuit.onclick = () => handlers?.onQuit?.();
    this.btnResume?.focus();
  }

  hidePause() {
    if (!this.pauseOverlay) return;
    this.pauseOverlay.classList.add("hidden");
    this.pauseOverlay.setAttribute("aria-hidden", "true");
  }

  showWaveBanner(wave, maxWaves) {
    this.flashPickup(`DALGA ${wave} / ${maxWaves}`);
  }

  showWaveCleared(wave, maxWaves) {
    this.flashPickup(`DALGA ${wave} TEMİZLENDİ!`);
  }

  showDead(score, onRestart) {
    this.getPlayerName();
    saveScore(this.playerName, score);
    this.overlay.classList.remove("hidden");
    this.overlay.classList.remove("start-screen");
    this.title.textContent = "SİSTEM ARIZASI";
    if (this.sub) {
      this.sub.classList.remove("hidden");
      this.sub.textContent = "OPERATÖR DÜŞTÜ";
    }
    this.msg.innerHTML = `Skor: <strong>${score}</strong><br />Tesis bir birimi daha yuttu.`;
    if (this.nameRow) this.nameRow.classList.add("hidden");
    this._renderScoreboard(score);
    if (this.scoreboardEl) this.scoreboardEl.classList.remove("hidden");
    this.btn.textContent = "YENİDEN BAŞLA";
    this.btn.onclick = () => onRestart();
  }

  showWin(score, onRestart) {
    this.getPlayerName();
    saveScore(this.playerName, score);
    this.overlay.classList.remove("hidden");
    this.overlay.classList.remove("start-screen");
    this.title.textContent = "BÖLGE TEMİZLENDİ";
    if (this.sub) {
      this.sub.classList.remove("hidden");
      this.sub.textContent = "ÜÇ DALGA TAMAMLANDI";
    }
    this.msg.innerHTML = `Son skor: <strong>${score}</strong><br />Tahliye koridoru açıldı.`;
    if (this.nameRow) this.nameRow.classList.add("hidden");
    this._renderScoreboard(score);
    if (this.scoreboardEl) this.scoreboardEl.classList.remove("hidden");
    this.btn.textContent = "TEKRAR OYNA";
    this.btn.onclick = () => onRestart();
  }

  update(player, moving = false, dt = 0.016) {
    this.hpEl.textContent = String(Math.max(0, Math.ceil(player.hp)));
    if (this.armorEl) this.armorEl.textContent = String(Math.max(0, Math.ceil(player.armor)));
    this.scoreEl.textContent = String(player.score);

    let pain = 0;
    if (player.hp < 20) pain = 4;
    else if (player.hp < 40) pain = 3;
    else if (player.hp < 60) pain = 2;
    else if (player.hp < 80) pain = 1;
    this.face.dataset.pain = String(pain);

    if (player.hp < this._lastHp || player.armor < this._lastArmor) {
      this.vignette.style.opacity = "1";
      this.face.classList.add("ouch");
      clearTimeout(this._vigTimer);
      this._vigTimer = setTimeout(() => {
        this.vignette.style.opacity = "0";
        this.face.classList.remove("ouch");
      }, 180);
    }
    this._lastHp = player.hp;
    this._lastArmor = player.armor;

    if (moving && !this.weaponView.classList.contains("recoil")) {
      this._bobT += dt * 10;
      const bx = Math.sin(this._bobT) * 6;
      const by = Math.abs(Math.cos(this._bobT)) * 5;
      this.weaponView.style.setProperty("--bob-x", `${bx}px`);
      this.weaponView.style.setProperty("--bob-y", `${by}px`);
      this.weaponView.classList.add("bob");
    } else if (!this.weaponView.classList.contains("recoil")) {
      this.weaponView.classList.remove("bob");
      this.weaponView.style.setProperty("--bob-x", "0px");
      this.weaponView.style.setProperty("--bob-y", "0px");
    }
  }

  setWeapon(weapon) {
    this.weaponEl.textContent = weapon.name;
    this.pulseWeaponSprite(weapon);
  }

  setAmmo(mag, reserve) {
    if (reserve == null || !Number.isFinite(reserve)) {
      this.ammoEl.textContent = String(mag);
    } else {
      this.ammoEl.textContent = `${mag}/${reserve}`;
    }
  }

  pulseWeaponSprite(weaponOrClass) {
    const weapon =
      typeof weaponOrClass === "string"
        ? { className: weaponOrClass, spriteKey: weaponOrClass.replace("weapon-", "") }
        : weaponOrClass;
    this.weaponSprite.className = weapon.className || "weapon-shotgun";
    const key = weapon.spriteKey || "shotgun";
    this.weaponSprite.src = this._sprites[key] || this._sprites.shotgun;
  }

  recoil(plasma = false) {
    this.weaponView.classList.remove("bob");
    this.weaponView.classList.add("recoil", "muzzle");
    this.muzzleFlash.src = plasma ? this._sprites.muzzlePlasma : this._sprites.muzzle;
    clearTimeout(this._recoilTimer);
    this._recoilTimer = setTimeout(() => {
      this.weaponView.classList.remove("recoil", "muzzle");
    }, 90);
  }

  flashPickup(text) {
    this.pickupMsg.textContent = text;
    this.pickupMsg.classList.add("show");
    clearTimeout(this._pickupTimer);
    this._pickupTimer = setTimeout(() => {
      this.pickupMsg.classList.remove("show");
    }, 1600);
  }
}

function escapeHtml(str) {
  return String(str)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}
