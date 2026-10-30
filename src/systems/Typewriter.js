export class Typewriter {
  constructor(interval = 18) { this.interval = interval; this.reset(''); }
  reset(text) { this.text = Array.from(text); this.index = 0; this.elapsed = 0; }
  get typing() { return this.index < this.text.length; }
  get visible() { return this.text.slice(0, this.index).join(''); }
  tick(delta, paused = false) {
    if (paused || !this.typing) return '';
    this.elapsed += Math.min(delta, 100);
    const count = Math.floor(this.elapsed / this.interval); this.elapsed %= this.interval;
    const before = this.index; this.index = Math.min(this.text.length, this.index + count);
    return this.text.slice(before, this.index).join('');
  }
  reveal() { const wasTyping = this.typing; this.index = this.text.length; this.elapsed = 0; return wasTyping; }
}
