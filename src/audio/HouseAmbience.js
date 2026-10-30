// Original filtered noise and a low oscillator; shared context, no external audio files.
export class HouseAmbience {
  constructor(audio) { this.audio = audio; this.sources = []; this.gain = null; }
  start() {
    if (this.gain) return;
    try {
      const context = this.audio.context ??= new (window.AudioContext || window.webkitAudioContext)();
      context.resume().catch(() => {});
      const gain = context.createGain(); gain.gain.value = 0;
      const filter = context.createBiquadFilter(); filter.type = 'lowpass'; filter.frequency.value = 160;
      filter.connect(gain); gain.connect(context.destination);
      const hum = context.createOscillator(); hum.frequency.value = 48; hum.type = 'sine'; hum.connect(filter);
      const noise = context.createBufferSource();
      const buffer = context.createBuffer(1, context.sampleRate * 2, context.sampleRate);
      const samples = buffer.getChannelData(0);
      let seed = 1812;
      for (let i = 0; i < samples.length; i++) { seed = (seed * 1664525 + 1013904223) >>> 0; samples[i] = ((seed / 4294967296) * 2 - 1) * 0.3; }
      noise.buffer = buffer; noise.loop = true; noise.connect(filter);
      this.gain = gain; this.filter = filter; this.sources = [hum, noise];
      hum.start(); noise.start();
    } catch { this.destroy(); /* Optional ambience must never prevent play. */ }
  }
  level(value) {
    if (!this.gain) return;
    const context = this.audio.context;
    const volume = Math.max(0, Math.min(1, this.audio.volume)) * Math.max(0, Math.min(1, value)) * 0.06;
    this.gain.gain.cancelScheduledValues(context.currentTime);
    if (volume === 0) this.gain.gain.setValueAtTime(0, context.currentTime);
    else this.gain.gain.setTargetAtTime(volume, context.currentTime, 0.12);
  }
  destroy() {
    for (const source of this.sources) { try { source.stop(); } catch {} source.disconnect(); }
    this.sources = [];
    this.filter?.disconnect(); this.gain?.disconnect(); this.gain = null;
  }
}
