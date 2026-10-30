import { CHASE } from '../data/finale.js';
export const EnemyState = Object.freeze({ INTRO: 'INTRO', CHASE: 'CHASE', STUNNED: 'STUNNED', RECOVERING: 'RECOVERING', CAPTURE: 'CAPTURE', END: 'END' });
export class ChaseModel {
  constructor(config = CHASE) {
    this.config = config; this.state = EnemyState.INTRO; this.clock = 0; this.elapsed = 0;
    this.lights = new Set(); this.rescued = false; this.fallen = false; this.fallClock = 0;
  }
  start() { if (this.state === EnemyState.INTRO) this.state = EnemyState.CHASE; }
  get running() { return ['CHASE', 'STUNNED', 'RECOVERING'].includes(this.state); }
  ignite(id) {
    if (!this.running || this.lights.has(id)) return false;
    this.lights.add(id); this.state = EnemyState.STUNNED; this.clock = this.config.stunSeconds; return true;
  }
  fall() { if (!this.running || this.fallen) return false; this.fallen = true; this.fallClock = this.config.rescueWindow; return true; }
  rescue() { if (!this.fallen || this.rescued || !this.running) return false; this.rescued = true; return true; }
  tick(dt, paused = false) {
    if (paused || !this.running) return;
    this.elapsed += dt;
    if (this.fallen && !this.rescued) this.fallClock = Math.max(0, this.fallClock - dt);
    if (['STUNNED', 'RECOVERING'].includes(this.state)) {
      this.clock -= dt;
      if (this.clock <= 0) {
        if (this.state === EnemyState.STUNNED) { this.state = EnemyState.RECOVERING; this.clock = this.config.recoverySeconds; }
        else this.state = EnemyState.CHASE;
      }
    }
  }
  contact(distance, protectedByLight) {
    if (!this.running || protectedByLight || this.state === EnemyState.STUNNED) return false;
    if (distance > this.config.captureRadius) return false;
    this.state = EnemyState.CAPTURE; return true;
  }
  win() {
    if (!this.running || !this.rescued || !this.lights.has('home')) return false;
    this.state = EnemyState.END; return true;
  }
}

const inside = (p, r) => p.x > r.x && p.x < r.x + r.width && p.y > r.y && p.y < r.y + r.height;
export function clearSegment(a, b, rectangles) {
  // Slab intersection, allowing travel exactly along the expanded rectangle edge.
  return !rectangles.some(r => {
    if (inside(a, r) || inside(b, r)) return true;
    let low = 0, high = 1;
    for (const axis of ['x', 'y']) {
      const d = b[axis] - a[axis], min = r[axis] + 0.01, max = r[axis] + (axis === 'x' ? r.width : r.height) - 0.01;
      if (Math.abs(d) < 0.0001) { if (a[axis] <= min || a[axis] >= max) return false; }
      else { let t1 = (min - a[axis]) / d, t2 = (max - a[axis]) / d; if (t1 > t2) [t1, t2] = [t2, t1]; low = Math.max(low, t1); high = Math.min(high, t2); }
      if (low > high) return false;
    }
    return low <= high;
  });
}
export function findPath(start, target, obstacles, minY = 357, maxY = 532) {
  // A small visibility graph around nearby static obstacles, expanded for BOTH characters' feet.
  const rects = obstacles.filter(r => r.x + r.width > Math.min(start.x, target.x) - 120 && r.x < Math.max(start.x, target.x) + 120)
    .map(r => ({ x: r.x - 18, y: r.y - 19, width: r.width + 36, height: r.height + 38 }));
  // Physics can leave feet in the navigation margin, which is wider than the body.
  // Walk OUT of that margin; never teleport or route through the real obstacle.
  const project = point => {
    let p = { ...point };
    for (const r of rects) if (inside(p, r)) {
      const options = [{ x: r.x - 1, y: p.y }, { x: r.x + r.width + 1, y: p.y },
        { x: p.x, y: r.y - 1 }, { x: p.x, y: r.y + r.height + 1 }]
        .filter(q => q.y >= minY && q.y <= maxY && clearSegment(p, q, obstacles) && !rects.some(other => inside(q, other)))
        .sort((a, b) => Math.hypot(a.x-p.x,a.y-p.y)-Math.hypot(b.x-p.x,b.y-p.y));
      if (!options.length) return null;
      p = options[0];
    }
    return p;
  };
  const source = project(start), destination = project(target);
  if (!source || !destination) return [];
  if (source.x !== start.x || source.y !== start.y) return [source];
  target = destination;
  if (clearSegment(start, target, rects)) return [target];
  const nodes = [start, target];
  for (const r of rects) for (const x of [r.x - 1, r.x + r.width + 1]) for (const y of [r.y - 1, r.y + r.height + 1]) {
    const p = { x, y }; if (y >= minY && y <= maxY && !rects.some(other => inside(p, other))) nodes.push(p);
  }
  const cost = nodes.map(() => Infinity), previous = [], done = new Set(); cost[0] = 0;
  for (let step = 0; step < nodes.length; step++) {
    let current = -1;
    nodes.forEach((_, i) => { if (!done.has(i) && (current < 0 || cost[i] < cost[current])) current = i; });
    if (current < 0 || !Number.isFinite(cost[current])) break;
    if (current === 1) { const path = []; for (let i = 1; i !== 0; i = previous[i]) path.unshift(nodes[i]); return path; }
    done.add(current);
    nodes.forEach((p, i) => {
      if (done.has(i) || !clearSegment(nodes[current], p, rects)) return;
      const next = cost[current] + Math.hypot(p.x - nodes[current].x, p.y - nodes[current].y);
      if (next < cost[i]) { cost[i] = next; previous[i] = current; }
    });
  }
  return []; // Stop safely instead of crossing a solid when no route exists.
}
