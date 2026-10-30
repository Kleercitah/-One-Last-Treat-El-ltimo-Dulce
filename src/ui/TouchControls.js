export function touchPreferred() {
  const choice = localStorage.getItem('olt-touch');
  return choice === null ? matchMedia('(pointer: coarse)').matches || navigator.maxTouchPoints > 0 && innerWidth < 1100 : choice === 'true';
}
export function setTouchEnabled(enabled) {
  localStorage.setItem('olt-touch', String(enabled));
  window.dispatchEvent(new Event('olt-touch-change'));
}
export function joystickKeys(x, y) {
  if (Math.hypot(x, y) < 0.23) return [];
  const keys = [];
  if (Math.abs(x) > 0.35 * Math.hypot(x, y)) keys.push(x < 0 ? 'KeyA' : 'KeyD');
  if (Math.abs(y) > 0.35 * Math.hypot(x, y)) keys.push(y < 0 ? 'KeyW' : 'KeyS');
  return keys;
}
export class TouchControls {
  constructor(scene) {
    this.scene = scene; this.controls = scene.controls;
    this.root = document.createElement('div'); this.root.className = 'touch-controls';
    this.root.innerHTML = '<div class="joystick" role="group" aria-label="Palanca de movimiento"><span></span></div><button class="touch-action" aria-label="Interactuar o mantener para ayudar">E<span>Interactuar</span></button>';
    scene.ui.root.append(this.root);
    this.stick = this.root.querySelector('.joystick'); this.button = this.root.querySelector('button');
    this.refresh = () => { this.enabled = touchPreferred(); scene.ui.root.classList.toggle('touch-ui', this.enabled); this.reset(); };
    this.refresh(); window.addEventListener('olt-touch-change', this.refresh);
    this.stick.onpointerdown = e => {
      if (this.pointer !== undefined) return;
      e.preventDefault(); this.pointer = e.pointerId; this.stick.setPointerCapture(e.pointerId); this.move(e);
    };
    this.stick.onpointermove = e => { if (e.pointerId === this.pointer) this.move(e); };
    this.stick.onpointerup = this.stick.onpointercancel = this.stick.onlostpointercapture = e => { if (e.pointerId === this.pointer) this.releaseStick(); };
    this.button.onpointerdown = e => {
      if (this.actionPointer !== undefined) return;
      e.preventDefault(); this.actionPointer = e.pointerId; this.button.setPointerCapture(e.pointerId);
      this.controls.touchHeld.add('KeyE'); this.controls.onAction('KeyE');
    };
    this.button.onpointerup = this.button.onpointercancel = this.button.onlostpointercapture = e => {
      if (e.pointerId === this.actionPointer) { this.actionPointer = undefined; this.controls.touchHeld.delete('KeyE'); }
    };
    this.onClear = () => this.reset(); this.controls.onClear = this.onClear;
    this.update = () => {
      const s = this.scene, hidden = !this.enabled || Boolean(s.modal || s.dialogue?.active) || s.model && !s.model.running;
      if (hidden && !this.root.hidden) this.reset();
      this.root.hidden = hidden;
      const label = s.actionTarget?.text || 'Interactuar';
      if (this.label !== label) { this.label = label; this.button.querySelector('span').textContent = label; }
    };
    scene.events.on('postupdate', this.update); this.update();
    scene.events.once('shutdown', () => this.destroy());
  }
  move(e) {
    const r = this.stick.getBoundingClientRect(), radius = r.width / 2;
    const x = (e.clientX - r.left - radius) / radius, y = (e.clientY - r.top - radius) / radius;
    for (const k of ['KeyW', 'KeyA', 'KeyS', 'KeyD']) this.controls.touchHeld.delete(k);
    for (const k of joystickKeys(x, y)) this.controls.touchHeld.add(k);
    const length = Math.max(1, Math.hypot(x, y));
    this.stick.firstElementChild.style.transform = `translate(${x / length * 28}px, ${y / length * 28}px)`;
  }
  releaseStick() { this.pointer = undefined; for (const k of ['KeyW', 'KeyA', 'KeyS', 'KeyD']) this.controls.touchHeld.delete(k); this.stick.firstElementChild.style.transform = ''; }
  reset() { this.releaseStick(); this.actionPointer = undefined; this.controls.touchHeld.clear(); }
  destroy() { this.reset(); window.removeEventListener('olt-touch-change', this.refresh); this.scene.events.off('postupdate', this.update); this.controls.onClear = null; this.root.remove(); }
}
