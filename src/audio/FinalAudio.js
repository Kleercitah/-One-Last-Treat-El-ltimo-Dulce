// Original procedural cues. All scheduling is driven by scene time, and paused explicitly.
export class FinalAudio {
  constructor(manager) { this.manager = manager; this.nodes = new Set(); this.mode = 'quiet'; this.clock = 0; this.beat = 0; }
  start() {
    try {
      this.manager.context ??= new (window.AudioContext || window.webkitAudioContext)();
      this.manager.context.resume().catch(() => {});
      if (!this.gain) { this.gain = this.manager.context.createGain(); this.gain.connect(this.manager.context.destination); }
      this.gain.gain.value = this.manager.volume;
    } catch { /* Silent play remains fully functional. */ }
  }
  tone(hz, duration = 0.15, volume = 0.09, type = 'sine') {
    if (!this.gain) return;
    const c = this.manager.context;
    if (c.state === 'closed') return;
    const o = c.createOscillator(), g = c.createGain();
    o.type = type; o.frequency.setValueAtTime(hz, c.currentTime);
    g.gain.setValueAtTime(Math.max(0.001, volume), c.currentTime);
    g.gain.exponentialRampToValueAtTime(0.001, c.currentTime + duration);
    o.connect(g).connect(this.gain); this.nodes.add(o);
    o.onended = () => { o.disconnect(); g.disconnect(); this.nodes.delete(o); };
    o.start(); o.stop(c.currentTime + duration);
  }
  cue(name, index = 0) {
    const cues = { cane: [105, 0.09, 0.16, 'triangle'], wood: [66, 0.35, 0.1, 'sawtooth'], door: [45, 0.7, 0.14, 'triangle'],
      bell: [[392, 523, 659][index % 3], 0.8, 0.12, 'sine'], light: [880, 0.32, 0.07, 'sine'],
      capture: [57, 1, 0.15, 'sawtooth'], clock: [220, 1.2, 0.09, 'sine'] };
    this.tone(...(cues[name] || cues.cane));
  }
  update(dt, paused = false) {
    if (this.gain) this.gain.gain.value = paused ? 0 : this.manager.volume;
    // Songs belong exclusively to MusicManager. Only footsteps/cane remain procedural.
    if (paused || this.mode !== 'chase') return;
    this.clock += dt;
    const interval = 0.65;
    if (this.clock < interval) return;
    this.clock = 0;
    this.cue('cane');
  }
  destroy() { for (const o of this.nodes) { try { o.stop(); } catch {} o.disconnect(); } this.nodes.clear(); this.gain?.disconnect(); }
}
