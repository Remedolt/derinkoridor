/**
 * Keyboard / mouse / unified action state
 */

export class Input {
  constructor(canvas) {
    this.canvas = canvas;
    this.keys = Object.create(null);
    this.mouseDelta = { x: 0, y: 0 };
    this.pointerLocked = false;
    this.isTouch = false;

    // Unified axes (desktop + mobile merge into these)
    this.moveX = 0;
    this.moveZ = 0;
    this.lookX = 0;
    this.lookY = 0;
    this.fire = false;
    this.firePressed = false;
    this.jump = false;
    this.jumpPressed = false;
    this.reload = false;
    this.reloadPressed = false;
    this.interact = false;
    this.interactPressed = false;
    this.weaponSlot = null;
    this._cycleWeapon = false;

    this._fireWas = false;
    this._jumpWas = false;
    this._reloadWas = false;
    this._interactWas = false;

    this._onKeyDown = this._onKeyDown.bind(this);
    this._onKeyUp = this._onKeyUp.bind(this);
    this._onMouseMove = this._onMouseMove.bind(this);
    this._onMouseDown = this._onMouseDown.bind(this);
    this._onMouseUp = this._onMouseUp.bind(this);
    this._onPointerLockChange = this._onPointerLockChange.bind(this);
    this.onUnlock = null;
  }

  detectTouch() {
    // Desktop WASD + mouse only. Touch laptops report maxTouchPoints > 0
    // and would otherwise enable virtual joysticks and ignore the keyboard.
    this.isTouch = false;
    document.body.classList.remove("is-touch");
    return false;
  }

  attach() {
    window.addEventListener("keydown", this._onKeyDown);
    window.addEventListener("keyup", this._onKeyUp);
    document.addEventListener("mousemove", this._onMouseMove);
    document.addEventListener("mousedown", this._onMouseDown);
    document.addEventListener("mouseup", this._onMouseUp);
    document.addEventListener("pointerlockchange", this._onPointerLockChange);
  }

  detach() {
    window.removeEventListener("keydown", this._onKeyDown);
    window.removeEventListener("keyup", this._onKeyUp);
    document.removeEventListener("mousemove", this._onMouseMove);
    document.removeEventListener("mousedown", this._onMouseDown);
    document.removeEventListener("mouseup", this._onMouseUp);
    document.removeEventListener("pointerlockchange", this._onPointerLockChange);
    if (document.pointerLockElement) document.exitPointerLock();
  }

  requestPointerLock() {
    this.canvas.requestPointerLock?.();
  }

  _onPointerLockChange() {
    const wasLocked = this.pointerLocked;
    this.pointerLocked = document.pointerLockElement === this.canvas;
    if (wasLocked && !this.pointerLocked) this.onUnlock?.();
  }

  _onKeyDown(e) {
    this.keys[e.code] = true;
    if (e.code === "Digit1") this.weaponSlot = 0;
    if (e.code === "KeyR") {
      e.preventDefault();
      this.reload = true;
    }
    if (e.code === "KeyE") {
      e.preventDefault();
      this.interact = true;
    }
    if (["Space", "ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight"].includes(e.code)) {
      e.preventDefault();
    }
  }

  _onKeyUp(e) {
    this.keys[e.code] = false;
    if (e.code === "KeyR") this.reload = false;
    if (e.code === "KeyE") this.interact = false;
  }

  _onMouseMove(e) {
    if (!this.pointerLocked) return;
    this.mouseDelta.x += e.movementX || 0;
    this.mouseDelta.y += e.movementY || 0;
  }

  _onMouseDown(e) {
    if (e.button === 0) this.fire = true;
  }

  _onMouseUp(e) {
    if (e.button === 0) this.fire = false;
  }

  /** Call once per frame after reading edges */
  beginFrame() {
    let mx = 0;
    let mz = 0;
    if (this.keys["KeyW"] || this.keys["ArrowUp"]) mz -= 1;
    if (this.keys["KeyS"] || this.keys["ArrowDown"]) mz += 1;
    if (this.keys["KeyA"] || this.keys["ArrowLeft"]) mx -= 1;
    if (this.keys["KeyD"] || this.keys["ArrowRight"]) mx += 1;

    this.moveX = mx;
    this.moveZ = mz;
    this.lookX = this.mouseDelta.x;
    this.lookY = this.mouseDelta.y;

    const len = Math.hypot(this.moveX, this.moveZ);
    if (len > 1) {
      this.moveX /= len;
      this.moveZ /= len;
    }

    const fireHeld = this.fire || this.keys["KeyF"];
    this.firePressed = fireHeld && !this._fireWas;
    this._fireWas = fireHeld;

    const jumpHeld = this.jump || this.keys["Space"];
    this.jumpPressed = jumpHeld && !this._jumpWas;
    this._jumpWas = jumpHeld;

    const reloadHeld = !!(this.reload || this.keys["KeyR"]);
    this.reloadPressed = reloadHeld && !this._reloadWas;
    this._reloadWas = reloadHeld;

    const interactHeld = this.interact || this.keys["KeyE"];
    this.interactPressed = interactHeld && !this._interactWas;
    this._interactWas = interactHeld;
  }

  endFrame() {
    this.mouseDelta.x = 0;
    this.mouseDelta.y = 0;
    this.lookX = 0;
    this.lookY = 0;
    this.weaponSlot = null;
  }
}
