/**
 * Game state machine & main loop — 3-wave progressive clear
 */

import * as THREE from "three";
import { EffectComposer } from "three/addons/postprocessing/EffectComposer.js";
import { RenderPass } from "three/addons/postprocessing/RenderPass.js";
import { UnrealBloomPass } from "three/addons/postprocessing/UnrealBloomPass.js";
import { OutputPass } from "three/addons/postprocessing/OutputPass.js";
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
      antialias: true,
      powerPreference: "high-performance",
    });
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
    this.renderer.setSize(window.innerWidth, window.innerHeight, false);
    this.renderer.outputColorSpace = THREE.SRGBColorSpace;
    this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
    this.renderer.toneMappingExposure = 1.28;
    this.renderer.setClearColor(0x0e0a08);
    // Gölge ayarları
    this.renderer.shadowMap.enabled = true;
    this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;

    this.scene = new THREE.Scene();
    this.scene.fog = new THREE.FogExp2(0x0e0a08, 0.028);

    this.camera = new THREE.PerspectiveCamera(
      68,
      window.innerWidth / window.innerHeight,
      0.1,
      110
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

    // Post-processing
    this._composer = null;
    this._setupComposer();

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
      if (this.state === "playing") this.pause();
    };
    window.addEventListener("resize", this._onResize);
    window.addEventListener("keydown", this._onEsc);
    this.canvas.addEventListener("click", () => {
      if (this.state === "playing") this.input.requestPointerLock();
    });

    this.ui.showStart(() => this.start());
    document.getElementById("btn-start")?.addEventListener(
      "click",
      () => this._enterFullscreen(),
      true
    );
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
    const fs = this._enterFullscreen();
    this.audio.unlock();
    this.level.setAudio(this.audio);
    this._resetLevel();
    this.state = "playing";
    this.ui.showPlaying();
    requestAnimationFrame(() => this.audio.startMusic());
    this.mobile.disable();
    const lock = () => {
      if (this.state === "playing") this.input.requestPointerLock();
    };
    if (fs && typeof fs.then === "function") fs.then(lock).catch(lock);
    else lock();
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
    if (this._composer) {
      this._composer.setSize(w, h);
      if (this._bloomPass) {
        this._bloomPass.resolution.set(w, h);
      }
    }
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
    this.input.requestPointerLock();
  }

  _enterFullscreen() {
    const root = document.getElementById("game-root") || document.documentElement;
    if (document.fullscreenElement || document.webkitFullscreenElement) {
      return Promise.resolve();
    }
    const req = root.requestFullscreen || root.webkitRequestFullscreen;
    if (!req) return Promise.resolve();
    try {
      const result = req.call(root, { navigationUI: "hide" });
      if (result && typeof result.catch === "function") {
        return result.catch(() => {});
      }
    } catch {
      /* tarayıcı reddettiyse oyunu yine de başlat */
    }
    return Promise.resolve();
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
      if (this._composer) {
        this._composer.render();
      } else {
        this.renderer.render(this.scene, this.camera);
      }
    }

    this.input.endFrame();
  }

  _setupComposer() {
    const w = window.innerWidth;
    const h = window.innerHeight;
    this._composer = new EffectComposer(this.renderer);

    const renderPass = new RenderPass(this.scene, this.camera);
    this._composer.addPass(renderPass);

    // Bloom — ateş, lamba ve parlak nesneler için yumuşak parıltı
    this._bloomPass = new UnrealBloomPass(
      new THREE.Vector2(w, h),
      0.55,   // strength
      0.42,   // radius
      0.76    // threshold
    );
    this._composer.addPass(this._bloomPass);

    // Renk uzayı dönüşümü
    const outputPass = new OutputPass();
    this._composer.addPass(outputPass);
  }
}
