const distance = (a, b) => Math.hypot(b.x - a.x, b.y - a.y);

// A bounded polyline of the player's resolved positions, not a direct chase vector.
// Keeping the intervening corners prevents Allen from cutting through buildings.
export class Trail {
  constructor(start, leader, lag = 48) {
    this.points = [{ ...start }, { ...leader }];
    this.length = distance(start, leader);
    this.lag = lag;
  }
  record(position) {
    const last = this.points.at(-1);
    const step = distance(last, position);
    if (step < 0.01) return { ...this.points[0] };
    this.points.push({ x: position.x, y: position.y });
    this.length += step;
    let excess = this.length - this.lag;
    while (excess > 0 && this.points.length > 1) {
      const a = this.points[0];
      const b = this.points[1];
      const segment = distance(a, b);
      if (segment <= excess + 1e-7) {
        this.points.shift();
        this.length -= segment;
        excess -= segment;
      } else {
        const fraction = excess / segment;
        this.points[0] = { x: a.x + (b.x - a.x) * fraction, y: a.y + (b.y - a.y) * fraction };
        this.length -= excess;
        excess = 0;
      }
    }
    return { ...this.points[0] };
  }
}
