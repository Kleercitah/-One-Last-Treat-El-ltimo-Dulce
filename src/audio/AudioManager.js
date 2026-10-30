// A tiny original two-note doorbell. No downloads, loops or autoplay dependency.
export class AudioManager {
  constructor() { this.volume = 0.35; this.context = null; this.textNodes = new Set(); this.lastBlip = -Infinity; this.blipsPlayed = 0; }
  unlock() {
    try { this.context ??= new (window.AudioContext || window.webkitAudioContext)(); this.context.resume().catch(() => {}); } catch {}
  }
  blip(character, speaker, time) {
    if (!/[\p{L}\p{N}]/u.test(character) || time - this.lastBlip < 65 || this.volume <= 0 || this.context?.state !== 'running') return;
    this.lastBlip = time;
    const c = this.context, oscillator = c.createOscillator(), gain = c.createGain();
    oscillator.type = speaker === 'Señor Sonrisas' ? 'sawtooth' : 'triangle';
    const pitch = { Riliane: 510, Allen: 350, Magnolia: 290, 'Don Basilio': 220, 'Señorita Carmesí': 320, 'Señor Sonrisas': 145, Mamá: 360 }[speaker] || 300;
    oscillator.frequency.setValueAtTime(pitch + character.codePointAt(0) % 4 * 12, c.currentTime);
    oscillator.frequency.exponentialRampToValueAtTime(pitch * 0.85, c.currentTime + 0.035);
    gain.gain.setValueAtTime(this.volume * 0.035, c.currentTime); gain.gain.exponentialRampToValueAtTime(0.001, c.currentTime + 0.04);
    oscillator.connect(gain).connect(c.destination); this.textNodes.add(oscillator); this.blipsPlayed++;
    oscillator.onended = () => { oscillator.disconnect(); gain.disconnect(); this.textNodes.delete(oscillator); };
    oscillator.start(); oscillator.stop(c.currentTime + 0.045);
  }
  stopText() { for (const n of this.textNodes) { try { n.stop(); } catch {} n.disconnect(); } this.textNodes.clear(); }
  bell() {
    if (this.volume === 0) return;
    try {
      this.context ??= new (window.AudioContext || window.webkitAudioContext)();
      this.context.resume().catch(() => {});
      [660, 523.25].forEach((frequency, index) => {
        const oscillator = this.context.createOscillator();
        const gain = this.context.createGain();
        const start = this.context.currentTime + index * 0.19;
        oscillator.type = 'sine';
        oscillator.frequency.value = frequency;
        gain.gain.setValueAtTime(this.volume * 0.17, start);
        gain.gain.exponentialRampToValueAtTime(0.001, start + 0.5);
        oscillator.connect(gain).connect(this.context.destination);
        oscillator.start(start);
        oscillator.stop(start + 0.5);
      });
    } catch { /* Audio is optional; browser policies must never block progression. */ }
  }
  destroy() { this.stopText(); this.context?.close().catch(() => {}); }
}
