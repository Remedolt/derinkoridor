/**
 * Virtual dual joysticks + action buttons for touch devices
 */

export class MobileControls {
  constructor(input) {
    this.input = input;
    this.root = document.getElementById("mobile-ui");
    this.moveZone = document.getElementById("stick-move");
    this.lookZone = document.getElementById("stick-look");
    this.moveKnob = this.moveZone.querySelector(".stick-knob");
    this.lookKnob = this.lookZone.querySelector(".stick-knob");
    this.btnFire = document.getElementById("btn-fire");
    this.btnJump = document.getElementById("btn-jump");
    this.btnReload = document.getElementById("btn-reload");
    this.btnDoor = document.getElementById("btn-door");
    this.btnWeapon = document.getElementById("btn-weapon");

    this._moveId = null;
    this._lookId = null;
    this._bound = false;
  }

  enable() {
    this.root.classList.remove("hidden");
    this.root.setAttribute("aria-hidden", "false");
    if (this._bound) return;
    this._bound = true;

    this.moveZone.addEventListener("pointerdown", (e) => this._stickDown(e, "move"));
    this.lookZone.addEventListener("pointerdown", (e) => this._stickDown(e, "look"));
    window.addEventListener("pointermove", (e) => this._stickMove(e));
    window.addEventListener("pointerup", (e) => this._stickUp(e));
    window.addEventListener("pointercancel", (e) => this._stickUp(e));

    const hold = (btn, set) => {
      btn.addEventListener("pointerdown", (e) => {
        e.preventDefault();
        btn.setPointerCapture(e.pointerId);
        btn.classList.add("active");
        set(true);
      });
      const off = (e) => {
        btn.classList.remove("active");
        set(false);
      };
      btn.addEventListener("pointerup", off);
      btn.addEventListener("pointercancel", off);
    };

    hold(this.btnFire, (v) => {
      this.input.fire = v;
    });
    hold(this.btnJump, (v) => {
      this.input.jump = v;
    });
    this.btnReload.addEventListener("pointerdown", (e) => {
      e.preventDefault();
      this.input.reload = true;
      setTimeout(() => {
        this.input.reload = false;
      }, 80);
    });
    this.btnDoor?.addEventListener("pointerdown", (e) => {
      e.preventDefault();
      this.input.interact = true;
      setTimeout(() => {
        this.input.interact = false;
      }, 80);
    });
    this.btnWeapon.addEventListener("pointerdown", (e) => {
      e.preventDefault();
      this.input._cycleWeapon = true;
    });
  }

  disable() {
    this.root.classList.add("hidden");
    this.root.setAttribute("aria-hidden", "true");
    this.input.moveX = 0;
    this.input.moveZ = 0;
    this.input.lookX = 0;
    this.input.lookY = 0;
  }

  _stickDown(e, which) {
    e.preventDefault();
    e.stopPropagation();
    const zone = which === "move" ? this.moveZone : this.lookZone;
    zone.setPointerCapture(e.pointerId);
    if (which === "move") this._moveId = e.pointerId;
    else this._lookId = e.pointerId;
    this._applyStick(e, which);
  }

  _stickMove(e) {
    if (e.pointerId === this._moveId) this._applyStick(e, "move");
    if (e.pointerId === this._lookId) this._applyStick(e, "look");
  }

  _stickUp(e) {
    if (e.pointerId === this._moveId) {
      this._moveId = null;
      this.input.moveX = 0;
      this.input.moveZ = 0;
      this.moveKnob.style.transform = "translate(0,0)";
    }
    if (e.pointerId === this._lookId) {
      this._lookId = null;
      this.input.lookX = 0;
      this.input.lookY = 0;
      this.lookKnob.style.transform = "translate(0,0)";
    }
  }

  _applyStick(e, which) {
    const zone = which === "move" ? this.moveZone : this.lookZone;
    const knob = which === "move" ? this.moveKnob : this.lookKnob;
    const rect = zone.getBoundingClientRect();
    const cx = rect.left + rect.width / 2;
    const cy = rect.top + rect.height / 2;
    const max = rect.width * 0.35;
    let dx = e.clientX - cx;
    let dy = e.clientY - cy;
    const len = Math.hypot(dx, dy);
    if (len > max) {
      dx = (dx / len) * max;
      dy = (dy / len) * max;
    }
    knob.style.transform = `translate(${dx}px, ${dy}px)`;
    const nx = dx / max;
    const ny = dy / max;

    if (which === "move") {
      this.input.moveX = nx;
      this.input.moveZ = ny;
    } else {
      this.input.lookX = nx * 55;
      this.input.lookY = ny * 40;
    }
  }
}
