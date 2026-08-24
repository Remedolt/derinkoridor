/**
 * Game state machine & main loop — 3-wave progressive clear
 */

import * as THREE from "three";
import { Level } from "./level.js";
import { Input } from "./input.js";
import { Player } from "./player.js";
import { Weapons } from "./weapons.js";
import { EnemyManager } from "./enemies.js";
import { PickupManager } from "./pickups.js";
import { AudioSynth } from "./audio.js";
import { MobileControls } from "./mobile.js";
import { UI } from "./ui.js";

const MAX_WAVES = 3;
const WAVE_GAP = 2.4;

export class Game {
  constructor(canvas) {
    this.canvas = canvas;
    this.ui = new UI();
    this.audio = new AudioSynth();
    this.input = new Input(canvas);
    this.mobile = new MobileControls(this.input);

    this.renderer = new THREE.WebGLRenderer({
      canvas,
      antialias: false,
      powerPreference: "high-performance",
    });
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.25));
    this.renderer.setSize(window.innerWidth, window.innerHeight, false);
    this.renderer.outputColorSpace = THREE.SRGBColorSpace;
    this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
    this.renderer.toneMappingExposure = 1.12;
    this.renderer.setClearColor(0x1a1410);

    this.scene = new THREE.Scene();
    this.scene.fog = new THREE.FogExp2(0x1c1814, 0.012);

    this.camera = new THREE.PerspectiveCamera(
      70,
      window.innerWidth / window.innerHeight,
      0.1,
      140
    );

    const envScene = new THREE.Scene();
    envScene.add(new THREE.HemisphereLight(0xfff2e4, 0x3a2a18, 1));
    const pmrem = new THREE.PMREMGenerator(this.renderer);
    this.scene.environment = pmrem.fromScene(envScene, 0.1).texture;
    pmrem.dispose();

    this.level = new Level(this.scene);
    this.player = new Player(this.camera, this.level);
    this.enemies = new EnemyManager(this.scene, this.level);
    this.pickups = new PickupManager(this.scene);
    this.weapons = new Weapons(this.scene, this.player, this.level, this.audio, this.ui);

    this.state = "menu";
    this.wave = 1;
    this.waveCooldown = 0;
    this.awaitingNextWave = false;
    this.lastTime = 0;
    this.running = false;
    this._onResize = this._onResize.bind(this);
    this._frame = this._frame.bind(this);
    this._onEsc = this._onEsc.bind(this);
  }

  init() {
    this.input.detectTouch();
    this.input.attach();
    this.input.onUnlock = () => {
      if (this.state === "playing" && !this.input.isTouch) this.pause();
    };
    window.addEventListener("resize", this._onResize);
    window.addEventListener("keydown", this._onEsc);
    this.canvas.addEventListener("click", () => {
      if (this.state === "playing" && !this.input.isTouch) {
        this.input.requestPointerLock();
      }
    });

    this.ui.showStart(() => this.start());
    document.getElementById("btn-menu-fullscreen")?.addEventListener("click", () => {
      this._enterFullscreen();
    });
    this.running = true;
    this.lastTime = performance.now();
    requestAnimationFrame(this._frame);
    setTimeout(() => this._warmup(), 0);
  }

  _warmup() {
    if (this._warmed || this.state !== "menu") return;
    this.level.build();
    this._warmed = true;
    this._freshBuild = true;
    this.renderer.compile(this.scene, this.camera);
  }

  start() {
    this._enterFullscreen();
    this.audio.unlock();
    this.level.setAudio(this.audio);
    this._resetLevel();
    this.state = "playing";
    this.ui.showPlaying();
    requestAnimationFrame(() => this.audio.startMusic());
    if (this.input.isTouch) this.mobile.enable();
    else {
      this.mobile.disable();
      this.input.requestPointerLock();
    }
  }

  _resetLevel() {
    this.enemies.clear();
    this.pickups.clear();
    this.weapons.clearEffects();
    if (this._freshBuild) this._freshBuild = false;
    else this.level.build();
    this._warmed = true;
    this.player.spawn(this.level.spawnPoints.player);
    this.weapons.reset();
    this.pickups.spawn(
      this.level.spawnPoints.health,
      this.level.spawnPoints.ammo,
      this.level.spawnPoints.armor
    );
    this.wave = 1;
    this.waveCooldown = 0;
    this.awaitingNextWave = false;
    this.enemies.spawnWave(this.level.spawnPoints.enemies, this.wave);
    this.ui.showWaveBanner(this.wave, MAX_WAVES);
    this.ui.update(this.player);
  }

  _onWaveCleared() {
    if (this.wave >= MAX_WAVES) {
      this._endGame(true);
      return;
    }
    this.awaitingNextWave = true;
    this.waveCooldown = WAVE_GAP;
    this.ui.showWaveCleared(this.wave, MAX_WAVES);
    this.audio.play("win");
  }

  _spawnNextWave() {
    this.wave += 1;
    this.awaitingNextWave = false;
    this.enemies.spawnWave(this.level.spawnPoints.enemies, this.wave);
    this.ui.showWaveBanner(this.wave, MAX_WAVES);
    this.player.score += 50 * this.wave;
  }

  _endGame(win) {
    this.state = win ? "win" : "dead";
    this.awaitingNextWave = false;
    this.ui.hidePause();
    if (document.pointerLockElement) document.exitPointerLock();
    this.mobile.disable();
    this.audio.stopMusic();
    this.audio.play(win ? "win" : "lose");
    if (win) this.ui.showWin(this.player.score, () => this.start());
    else this.ui.showDead(this.player.score, () => this.start());
  }

  _onResize() {
    const w = window.innerWidth;
    const h = window.innerHeight;
    this.camera.aspect = w / h;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(w, h, false);
  }

  _onEsc(e) {
    if (e.code !== "Escape") return;
    if (this.state === "paused") {
      e.preventDefault();
      this.resume();
    }
  }

  pause() {
    if (this.state !== "playing") return;
    this.state = "paused";
    this.input.fire = false;
    this.input.moveX = 0;
    this.input.moveZ = 0;
    if (document.pointerLockElement) document.exitPointerLock();
    this.audio.pauseMusic();
    this.ui.showPause({
      onResume: () => this.resume(),
      onFullscreen: () => this._toggleFullscreen(),
      onQuit: () => this._quitToMenu(),
    });
  }

  resume() {
    if (this.state !== "paused") return;
    this.state = "playing";
    this.ui.hidePause();
    this.audio.resumeMusic();
    if (!this.input.isTouch) this.input.requestPointerLock();
  }

  _enterFullscreen() {
    const root = document.documentElement;
    if (document.fullscreenElement || document.webkitFullscreenElement) return;
    const req = root.requestFullscreen || root.webkitRequestFullscreen;
    try {
      const result = req?.call(root);
      if (result && typeof result.catch === "function") result.catch(() => {});
    } catch {
      /* tarayıcı reddettiyse oyunu yine de başlat */
    }
  }

  _toggleFullscreen() {
    if (document.fullscreenElement || document.webkitFullscreenElement) {
      document.exitFullscreen?.() || document.webkitExitFullscreen?.();
      return;
    }
    this._enterFullscreen();
  }

  _quitToMenu() {
    this.state = "menu";
    this.ui.hidePause();
    if (document.pointerLockElement) document.exitPointerLock();
    this.mobile.disable();
    this.audio.stopMusic();
    this.ui.showStart(() => this.start());
  }

  _frame(now) {
    if (!this.running) return;
    requestAnimationFrame(this._frame);

    const dt = Math.min(0.05, (now - this.lastTime) / 1000);
    this.lastTime = now;

    this.enemies.flushDead();
    this.input.beginFrame();

    if (this.input._pauseRequest) {
      this.input._pauseRequest = false;
      if (this.state === "playing") this.pause();
      else if (this.state === "paused") this.resume();
    }

    if (this.input._cycleWeapon) {
      this.weapons.cycle();
      this.input._cycleWeapon = false;
    }

    if (this.state === "playing") {
      this.player.update(dt, this.input);
      this.level.updateDoors(dt, this.player.position, this.input.interactPressed);
      this.weapons.update(dt, this.input, this.enemies.list);
      this.enemies.update(dt, this.player, this.audio);
      this.pickups.update(dt, this.player, this.weapons, this.audio, this.ui);

      const moving = Math.hypot(this.input.moveX, this.input.moveZ) > 0.15;
      this.ui.update(this.player, moving, dt);

      if (!this.player.alive) {
        this._endGame(false);
      } else if (this.awaitingNextWave) {
        this.waveCooldown -= dt;
        if (this.waveCooldown <= 0) this._spawnNextWave();
      } else if (this.enemies.aliveCount === 0) {
        this._onWaveCleared();
      }
    }

    if (this.state === "playing" || this.state === "paused") {
      this.renderer.render(this.scene, this.camera);
    }

    this.input.endFrame();
  }
}
