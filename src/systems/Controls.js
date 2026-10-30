const captured = new Set(['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'Space', 'Tab', 'Escape', 'KeyW', 'KeyA', 'KeyS', 'KeyD', 'KeyE']);

export class Controls {
  constructor(onAction, onBlur) {
    this.held = new Set(); this.touchHeld = new Set(); this.onAction = onAction;
    this.onKeyDown = event => {
      // Keep sliders accessible with their native arrows in the pause screen.
      if (event.target instanceof HTMLInputElement && event.code !== 'Escape') return;
      if (captured.has(event.code)) event.preventDefault();
      this.held.add(event.code);
      if (!event.repeat) onAction(event.code);
    };
    this.onKeyUp = event => this.held.delete(event.code);
    this.onBlur = () => { this.clear(); onBlur(); };
    this.onVisibility = () => { if (document.hidden) this.onBlur(); };
    window.addEventListener('keydown', this.onKeyDown);
    window.addEventListener('keyup', this.onKeyUp);
    window.addEventListener('blur', this.onBlur);
    document.addEventListener('visibilitychange', this.onVisibility);
  }
  down(...keys) { return keys.some(key => this.held.has(key) || this.touchHeld.has(key)); }
  clear() { this.held.clear(); this.touchHeld.clear(); this.onClear?.(); }
  destroy() {
    window.removeEventListener('keydown', this.onKeyDown);
    window.removeEventListener('keyup', this.onKeyUp);
    window.removeEventListener('blur', this.onBlur);
    document.removeEventListener('visibilitychange', this.onVisibility);
  }
}
