export class LanternPuzzle {
  constructor(order) { this.order = [...order]; this.lit = []; }
  get complete() { return this.lit.length === this.order.length; }
  activate(id) {
    if (!this.order.includes(id)) return 'invalid';
    if (this.lit.includes(id)) return 'already';
    if (id !== this.order[this.lit.length]) return 'wrong';
    this.lit.push(id);
    return this.complete ? 'solved' : 'lit';
  }
}
