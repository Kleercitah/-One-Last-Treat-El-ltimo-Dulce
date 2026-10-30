export class Dialogue {
  constructor(onChange) { this.onChange = onChange; this.lines = []; this.index = 0; }
  get active() { return this.index < this.lines.length; }
  start(lines, onComplete = () => {}) {
    if (this.active || !lines.length) return false;
    this.lines = lines;
    this.index = 0;
    this.onComplete = onComplete;
    this.onChange(this.lines[0], 1, lines.length);
    return true;
  }
  advance() {
    if (!this.active) return;
    this.index++;
    if (this.active) this.onChange(this.lines[this.index], this.index + 1, this.lines.length);
    else {
      const complete = this.onComplete;
      this.onComplete = null;
      this.onChange(null);
      complete?.();
    }
  }
}
