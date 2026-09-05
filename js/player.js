/**
 * First-person player controller
 */

import * as THREE from "three";

const EYE = 1.6;
const SPEED = 9;
const JUMP_V = 7.5;
const GRAVITY = 22;
const LOOK_SENS = 0.0022;
const MOBILE_LOOK_SENS = 2.4;

export class Player {
  constructor(camera, level) {
    this.camera = camera;
    this.level = level;
    this.yaw = 0;
    this.pitch = 0;
    this.velocityY = 0;
    this.onGround = true;
    this.hp = 100;
    this.maxHp = 100;
    this.armor = 0;
    this.maxArmor = 200;
    this.score = 0;
    this.alive = true;
    this.radius = 0.55;
    this.shake = 0;
    this.position = new THREE.Vector3();
    this._fwd = new THREE.Vector3();
    this._right = new THREE.Vector3();
    this._wish = new THREE.Vector3();
  }

  spawn(pos) {
    this.position.set(pos.x, EYE, pos.z);
    // Face into the labyrinth (+Z) instead of the outer wall
    this.yaw = Math.PI;
    this.pitch = 0;
    this.velocityY = 0;
    this.onGround = true;
    this.hp = this.maxHp;
    this.armor = 0;
    this.score = 0;
    this.alive = true;
    this.shake = 0;
    this._syncCamera();
  }

  takeDamage(amount) {
    if (!this.alive) return;
    let dmg = amount;
    if (this.armor > 0) {
      const soaked = Math.min(this.armor, dmg);
      this.armor -= soaked;
      dmg -= soaked;
    }
    if (dmg > 0) this.hp = Math.max(0, this.hp - dmg);
    this.shake = Math.min(1, this.shake + 0.45);
    if (this.hp <= 0) {
      this.alive = false;
      this.hp = 0;
    }
  }

  heal(amount) {
    this.hp = Math.min(this.maxHp, this.hp + amount);
  }

  addArmor(amount) {
    this.armor = Math.min(this.maxArmor, this.armor + amount);
  }

  update(dt, input) {
    if (!this.alive) return;

    const lookScale = input.isTouch ? MOBILE_LOOK_SENS * dt : LOOK_SENS;
    this.yaw -= input.lookX * lookScale;
    this.pitch -= input.lookY * lookScale;
    this.pitch = Math.max(-1.4, Math.min(1.4, this.pitch));

    this._fwd.set(-Math.sin(this.yaw), 0, -Math.cos(this.yaw));
    this._right.set(Math.cos(this.yaw), 0, -Math.sin(this.yaw));

    this._wish.set(0, 0, 0);
    this._wish.addScaledVector(this._right, input.moveX);
    this._wish.addScaledVector(this._fwd, -input.moveZ);
    if (this._wish.lengthSq() > 0) this._wish.normalize();

    const next = this.position.clone();
    next.x += this._wish.x * SPEED * dt;
    next.z += this._wish.z * SPEED * dt;

    const resolved = this.level.resolveCollision(next, this.radius);
    this.position.x = resolved.x;
    this.position.z = resolved.z;

    if (input.jumpPressed && this.onGround) {
      this.velocityY = JUMP_V;
      this.onGround = false;
    }

    this.velocityY -= GRAVITY * dt;
    this.position.y += this.velocityY * dt;
    if (this.position.y <= EYE) {
      this.position.y = EYE;
      this.velocityY = 0;
      this.onGround = true;
    }

    this.shake = Math.max(0, this.shake - dt * 2.5);
    this._syncCamera();
  }

  _syncCamera() {
    const sx = (Math.random() - 0.5) * this.shake * 0.12;
    const sy = (Math.random() - 0.5) * this.shake * 0.12;
    this.camera.position.set(this.position.x + sx, this.position.y + sy, this.position.z);
    this.camera.rotation.order = "YXZ";
    this.camera.rotation.y = this.yaw;
    this.camera.rotation.x = this.pitch;
  }

  getShootOrigin() {
    return this.camera.position.clone();
  }

  getShootDirection() {
    const dir = new THREE.Vector3(0, 0, -1);
    dir.applyQuaternion(this.camera.quaternion);
    return dir.normalize();
  }
}
