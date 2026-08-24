/**
 * Synthesized SFX — gunshot-style (bullet) sounds via Web Audio
 */

export class AudioSynth {
  constructor() {
    this.ctx = null;
    this.enabled = true;
    this.master = null;
    this.musicGain = null;
    this._musicNodes = [];
    this._musicOn = false;
  }

  unlock() {
    if (!this.ctx) {
      const AC = window.AudioContext || window.webkitAudioContext;
      if (!AC) {
        this.enabled = false;
        return;
      }
      this.ctx = new AC();
      this.master = this.ctx.createGain();
      this.master.gain.value = 0.9;
      this.master.connect(this.ctx.destination);
      this.musicGain = this.ctx.createGain();
      this.musicGain.gain.value = 0;
      this.musicGain.connect(this.master);
    }
    if (this.ctx.state === "suspended") this.ctx.resume();
  }

  play(name) {
    if (!this.enabled || !this.ctx) return;
    switch (name) {
      case "laser":
        this._pistolShot();
        break;
      case "shotgun":
        this._shotgunBlast();
        break;
      case "explosion":
        this._explode();
        break;
      case "hurt":
        this._hurt();
        break;
      case "pickup":
        this._pickup();
        break;
      case "reload":
        this._reload();
        break;
      case "empty":
        this._click();
        break;
      case "enemyShot":
        this._enemyZap();
        break;
      case "door":
        this._door();
        break;
      case "win":
        this._fanfare(true);
        break;
      case "lose":
        this._fanfare(false);
        break;
      default:
        break;
    }
  }

  _out() {
    return this.master || this.ctx.destination;
  }

  startMusic() {
    if (!this.enabled || !this.ctx || this._musicOn) return;
    this._musicOn = true;
    this.musicGain.gain.cancelScheduledValues(this.ctx.currentTime);
    this.musicGain.gain.setValueAtTime(this.musicGain.gain.value, this.ctx.currentTime);
    this.musicGain.gain.linearRampToValueAtTime(0.22, this.ctx.currentTime + 0.6);

    const bpm = 140;
    const beat = 60 / bpm;
    const bar = beat * 4;
    const t0 = this.ctx.currentTime + 0.05;

    this._loopNoiseDrums(t0, beat);
    this._loopBass(t0, beat);
    this._loopLead(t0, bar);
  }

  stopMusic() {
    if (!this._musicOn || !this.ctx) return;
    this._musicOn = false;
    clearTimeout(this._bassTimer);
    clearTimeout(this._leadTimer);
    const t = this.ctx.currentTime;
    this.musicGain.gain.cancelScheduledValues(t);
    this.musicGain.gain.setValueAtTime(this.musicGain.gain.value, t);
    this.musicGain.gain.linearRampToValueAtTime(0, t + 0.4);
    const nodes = this._musicNodes.slice();
    this._musicNodes.length = 0;
    setTimeout(() => {
      for (const n of nodes) {
        try {
          n.stop();
        } catch {
          /* already stopped */
        }
      }
    }, 450);
  }

  _keep(node) {
    this._musicNodes.push(node);
    return node;
  }

  _loopNoiseDrums(t0, beat) {
    const ctx = this.ctx;
    const dur = beat * 16;
    const len = Math.floor(ctx.sampleRate * dur);
    const buffer = ctx.createBuffer(1, len, ctx.sampleRate);
    const data = buffer.getChannelData(0);
    const sr = ctx.sampleRate;
    for (let i = 0; i < 16; i++) {
      const kick = i % 4 === 0;
      const snare = i % 4 === 2;
      const hat = true;
      const start = Math.floor((i * beat) * sr);
      if (kick) {
        for (let k = 0; k < sr * 0.12 && start + k < len; k++) {
          const env = Math.exp(-k / (sr * 0.05));
          const f = 90 * Math.exp(-k / (sr * 0.04));
          data[start + k] += Math.sin((k / sr) * f * Math.PI * 2) * env * 0.9;
        }
      }
      if (snare) {
        for (let k = 0; k < sr * 0.1 && start + k < len; k++) {
          const env = Math.exp(-k / (sr * 0.04));
          data[start + k] += (Math.random() * 2 - 1) * env * 0.45;
        }
      }
      if (hat) {
        for (let k = 0; k < sr * 0.03 && start + k < len; k++) {
          const env = Math.exp(-k / (sr * 0.012));
          data[start + k] += (Math.random() * 2 - 1) * env * 0.12;
        }
      }
    }
    const src = this._keep(ctx.createBufferSource());
    src.buffer = buffer;
    src.loop = true;
    const f = ctx.createBiquadFilter();
    f.type = "lowpass";
    f.frequency.value = 2200;
    src.connect(f);
    f.connect(this.musicGain);
    src.start(t0);
  }

  _loopBass(t0, beat) {
    const notes = [55, 55, 41, 55, 49, 49, 41, 37];
    const ctx = this.ctx;
    const osc = this._keep(ctx.createOscillator());
    const g = ctx.createGain();
    osc.type = "sawtooth";
    g.gain.value = 0.18;
    const f = ctx.createBiquadFilter();
    f.type = "lowpass";
    f.frequency.value = 420;
    osc.connect(f);
    f.connect(g);
    g.connect(this.musicGain);
    osc.start(t0);
    notes.forEach((n, i) => {
      osc.frequency.setValueAtTime(n, t0 + i * beat);
    });
    // Repeat the sequence via looping oscillator frequency schedule is finite;
    // use a second looped buffer for bass instead.
    osc.stop(t0 + notes.length * beat);
    const period = notes.length * beat;
    const loop = () => {
      if (!this._musicOn) return;
      this._loopBass(this.ctx.currentTime + 0.02, beat);
    };
    this._bassTimer = setTimeout(loop, period * 1000 - 30);
  }

  _loopLead(t0, bar) {
    const ctx = this.ctx;
    const seq = [220, 233, 196, 174, 220, 261, 196, 155];
    const osc = this._keep(ctx.createOscillator());
    const g = ctx.createGain();
    osc.type = "square";
    g.gain.value = 0.045;
    const f = ctx.createBiquadFilter();
    f.type = "bandpass";
    f.frequency.value = 900;
    osc.connect(f);
    f.connect(g);
    g.connect(this.musicGain);
    osc.start(t0);
    const step = bar / 4;
    seq.forEach((n, i) => {
      osc.frequency.setValueAtTime(n, t0 + i * step);
    });
    osc.stop(t0 + seq.length * step);
    const period = seq.length * step;
    this._leadTimer = setTimeout(() => {
      if (!this._musicOn) return;
      this._loopLead(this.ctx.currentTime + 0.02, bar);
    }, period * 1000 - 30);
  }

  /** Sharp pistol / bullet crack */
  _pistolShot() {
    const t = this.ctx.currentTime;
    // Transient crack
    this._noiseBurst(0.04, 0.55, 6000, 0);
    this._noiseBurst(0.12, 0.28, 1800, 0.01);
    // Body thump
    const osc = this.ctx.createOscillator();
    const g = this.ctx.createGain();
    osc.type = "sine";
    osc.frequency.setValueAtTime(180, t);
    osc.frequency.exponentialRampToValueAtTime(55, t + 0.08);
    g.gain.setValueAtTime(0.45, t);
    g.gain.exponentialRampToValueAtTime(0.001, t + 0.1);
    osc.connect(g);
    g.connect(this._out());
    osc.start(t);
    osc.stop(t + 0.12);
  }

  /** Heavy pump shotgun blast + rack */
  _shotgunBlast() {
    const t = this.ctx.currentTime;
    // Loud crack
    this._noiseBurst(0.06, 0.7, 5000, 0);
    // Body boom
    this._noiseBurst(0.28, 0.5, 900, 0.02);
    const osc = this.ctx.createOscillator();
    const g = this.ctx.createGain();
    osc.type = "triangle";
    osc.frequency.setValueAtTime(95, t);
    osc.frequency.exponentialRampToValueAtTime(28, t + 0.25);
    g.gain.setValueAtTime(0.55, t);
    g.gain.exponentialRampToValueAtTime(0.001, t + 0.28);
    osc.connect(g);
    g.connect(this._out());
    osc.start(t);
    osc.stop(t + 0.3);
    // Pump rack (cha-chunk) after blast
    setTimeout(() => {
      if (!this.ctx) return;
      this._tone(220, 0.04, "square", 0.08);
      this._noiseBurst(0.05, 0.12, 2500, 0);
      setTimeout(() => {
        this._tone(140, 0.06, "square", 0.1);
        this._noiseBurst(0.04, 0.1, 1800, 0);
      }, 70);
    }, 180);
  }

  _explode() {
    this._noiseBurst(0.4, 0.45, 700, 0);
    this._sweep(90, 28, 0.4, "sawtooth", 0.28);
  }

  _hurt() {
    this._sweep(280, 70, 0.22, "square", 0.2);
    this._noiseBurst(0.08, 0.12, 800, 0);
  }

  _pickup() {
    this._tone(480, 0.07, "sine", 0.14);
    this._tone(720, 0.09, "sine", 0.12, 0.07);
    this._tone(960, 0.1, "sine", 0.1, 0.14);
  }

  _reload() {
    this._tone(160, 0.05, "triangle", 0.1);
    this._noiseBurst(0.04, 0.08, 3000, 0.05);
    this._tone(200, 0.06, "triangle", 0.09, 0.1);
  }

  _click() {
    this._tone(70, 0.05, "square", 0.08);
  }

  _enemyZap() {
    this._sweep(700, 220, 0.14, "sawtooth", 0.12);
    this._noiseBurst(0.06, 0.07, 1800, 0);
  }

  _door() {
    this._noiseBurst(0.15, 0.18, 600, 0);
    this._tone(90, 0.2, "sawtooth", 0.08);
  }

  _fanfare(win) {
    if (win) {
      this._tone(440, 0.12, "square", 0.12);
      this._tone(554, 0.12, "square", 0.12, 0.12);
      this._tone(659, 0.25, "square", 0.14, 0.24);
    } else {
      this._sweep(260, 60, 0.55, "sawtooth", 0.2);
    }
  }

  _tone(freq, dur, type, gain, delay = 0) {
    const ctx = this.ctx;
    const osc = ctx.createOscillator();
    const g = ctx.createGain();
    osc.type = type;
    osc.frequency.value = freq;
    g.gain.setValueAtTime(gain, ctx.currentTime + delay);
    g.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + delay + dur);
    osc.connect(g);
    g.connect(this._out());
    osc.start(ctx.currentTime + delay);
    osc.stop(ctx.currentTime + delay + dur + 0.02);
  }

  _sweep(from, to, dur, type, gain) {
    const ctx = this.ctx;
    const osc = ctx.createOscillator();
    const g = ctx.createGain();
    osc.type = type;
    osc.frequency.setValueAtTime(from, ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(Math.max(1, to), ctx.currentTime + dur);
    g.gain.setValueAtTime(gain, ctx.currentTime);
    g.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + dur);
    osc.connect(g);
    g.connect(this._out());
    osc.start();
    osc.stop(ctx.currentTime + dur + 0.02);
  }

  _noiseBurst(dur, gain, cutoff, delay = 0) {
    const ctx = this.ctx;
    const len = Math.floor(ctx.sampleRate * dur);
    const buffer = ctx.createBuffer(1, len, ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < len; i++) {
      const env = Math.pow(1 - i / len, 1.4);
      data[i] = (Math.random() * 2 - 1) * env;
    }
    const src = ctx.createBufferSource();
    src.buffer = buffer;
    const g = ctx.createGain();
    const filter = ctx.createBiquadFilter();
    filter.type = "lowpass";
    filter.frequency.value = cutoff;
    filter.Q.value = 0.7;
    const t = ctx.currentTime + delay;
    g.gain.setValueAtTime(gain, t);
    g.gain.exponentialRampToValueAtTime(0.001, t + dur);
    src.connect(filter);
    filter.connect(g);
    g.connect(this._out());
    src.start(t);
  }
}
