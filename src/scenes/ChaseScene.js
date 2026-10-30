import Phaser from 'phaser';
import { WORLD } from '../config.js';
import { houseLayer } from '../assets/drawStreet.js';
import { Riliane } from '../entities/Riliane.js';
import { Allen } from '../entities/Allen.js';
import { Smiles } from '../entities/Smiles.js';
import { Trail } from '../systems/Trail.js';
import { Controls } from '../systems/Controls.js';
import { GameUI } from '../ui/GameUI.js';
import { AudioManager } from '../audio/AudioManager.js';
import { FinalAudio } from '../audio/FinalAudio.js';
import { ChaseModel, EnemyState, findPath } from '../systems/ChaseModel.js';
import { CHASE, chaseObstacles } from '../data/finale.js';
import { houses } from '../data/houses.js';
import { FamilyHouse } from '../entities/FamilyHouse.js';
import { getMusic } from '../audio/MusicManager.js';
import { bindVoices } from '../audio/VoiceController.js';
import { TouchControls } from '../ui/TouchControls.js';

export class ChaseScene extends Phaser.Scene {
  constructor() { super('Chase'); }
  init({ progress, attempt = 1 }) { this.progress = progress; this.attempt = attempt; }
  create() {
    this.model = new ChaseModel(); this.modal = null; this.holdTime = 0; this.pointerHeld = false;
    this.elapsed = 0; this.captureTime = 0; this.pathClock = 0; this.path = []; this.actionTarget = null;
    this.loopNoted = false; this.exitNoted = false; this.actionId = null; this.speechTime = 0;
    this.reducedMotion = this.registry.get('reducedMotion') ?? window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    this.physics.world.setBounds(28, 342, CHASE.width - 56, 205);
    this.obstacles = this.physics.add.staticGroup(); this.solids = []; this.gates = [];
    this.lastHouse = null;
    for (let i = 0; i < 3; i++) {
      const offset = i * WORLD.width;
      this.add.image(offset, 0, 'street').setOrigin(0).setScale(2).setDepth(-10);
      // The host extinguishes the street. Previously warm windows no longer imply a safe porch.
      for (const h of houses) {
        if (h.id === 'ultima') {
          if (!this.progress.flags.has('lastHouseAppeared')) continue;
          // The base map omits this house. Restore it beside its windows in EVERY repeat.
          this.lastHouse = houseLayer(this, h).setPosition(offset + h.x, 350).setDepth(-3);
        }
        for (const dx of [-68, 64]) this.add.rectangle(offset + h.x + dx, 245, 34, 50, 0x252b3c).setDepth(1);
        this.add.rectangle(offset + h.x, 209, 12, 16, 0x35394a).setDepth(1);
      }
    }
    this.tint = this.add.rectangle(0, 0, 960, 540, 0x233047, 0.15).setOrigin(0).setScrollFactor(0).setDepth(800);
    // Only a handful of visible, identical collision rectangles; no random spawning.
    for (const r of chaseObstacles) {
      this.solid(r);
      this.add.rectangle(r.x + r.width / 2, r.y + r.height / 2, r.width, r.height, 0x755b52).setStrokeStyle(3, 0xc3a47c).setDepth(350);
      for (let y = r.y + 10; y < r.y + r.height; y += 20) this.add.rectangle(r.x + 19, y, 31, 4, 0xc49d69).setDepth(351);
      const gapY = r.y < 400 ? 500 : 386;
      this.label(r.x + 90, gapY, '←', '#ffe3a1', 26);
    }
    this.porches = CHASE.porches.map((p, index) => {
      const zone = { x: p.x - 100, y: 342, width: 200, height: 88 };
      const halo = this.add.rectangle(p.x, 386, 200, 88, 0xffd58a, index === 0 ? 0.2 : 0.025).setStrokeStyle(2, 0xf3c981, index === 0 ? 0.8 : 0.2).setDepth(2);
      const lamp = this.add.rectangle(p.x, 333, 16, 23, index === 0 ? 0xffdf94 : 0x77745f).setStrokeStyle(3, 0xc2a474).setDepth(3);
      const sign = this.label(p.x, 290, index === 0 ? 'FAROLES · ABRIR PASO LATERAL' : 'CARMESÍ · ENCENDER PORCHE', '#ffe3ad', 12);
      const r = { x: p.gate, y: 340, width: 22, height: 210 };
      const gate = this.solid(r);
      gate.setVisible(true).setFillStyle(0x594d64, 0.9).setStrokeStyle(2, 0xc2a474).setDepth(400);
      this.label(p.gate, 320, 'PESTILLO →', '#dec8a4', 10);
      const result = { ...p, id: String(index), zone, halo, lamp, sign, gate, solid: r, on: index === 0 };
      this.gates.push(result); return result;
    });
    this.home = new FamilyHouse(this, 140, { lit: false });
    this.homeHalo = this.home.halo; this.homeLamp = this.home.lamp;
    this.label(4830, 380, '← LA CALLE SE REPITE', '#c2c5dc', 13);
    this.label(2430, 380, '← EL PASO LATERAL · CASA', '#c2c5dc', 13);
    for (let x = 300; x < CHASE.width; x += 400) this.label(x, 536, '← CASA', '#c4b994', 11);
    this.leaves = Array.from({ length: 28 }, (_, i) => this.add.rectangle(150 + i * 250, 390 + i % 4 * 34, 6, 2, 0xbb9870, 0.6).setDepth(5));
    this.player = new Riliane(this, CHASE.start);
    this.allen = new Allen(this, { x: CHASE.start.x + 32, y: CHASE.start.y }, CHASE.start);
    this.allen.trail.lag = 32;
    this.physics.add.collider(this.player, this.obstacles);
    this.enemy = this.add.rectangle(CHASE.enemyStart.x, CHASE.enemyStart.y, 18, 16).setOrigin(0.5, 1).setVisible(false);
    this.physics.add.existing(this.enemy); this.enemy.body.setCollideWorldBounds(true);
    this.physics.add.collider(this.enemy, this.obstacles);
    this.lightBarriers = this.physics.add.staticGroup();
    for (const p of this.porches) {
      p.barrier = this.add.rectangle(p.x, 386, 200, 88).setVisible(false);
      this.physics.add.existing(p.barrier, true); this.lightBarriers.add(p.barrier); p.barrier.body.enable = p.on;
    }
    this.physics.add.collider(this.enemy, this.lightBarriers);
    this.host = new Smiles(this, this.enemy.x, this.enemy.y, 1.2);
    this.cameras.main.setBounds(0, 0, CHASE.width, 720).startFollow(this.player, true, 1, 0, 0, 35);
    this.audioManager = new AudioManager(); this.audioManager.volume = this.registry.get('effectsVolume') ?? 0.35;
    this.audioManager.unlock(); this.music = getMusic(this.game); this.music.select('Chase', 'musica3.mp3', 0.8);
    this.audio = new FinalAudio(this.audioManager);
    this.ui = new GameUI({ advance: () => {}, notebook: () => this.notebook(), pause: () => this.pause(), closeModal: () => this.closeModal(),
      voice: bindVoices(this),
      menu: () => this.scene.start('Menu'), settings: () => this.registry.set('effectsVolume', this.audioManager.volume),
      music: this.music, intensity: v => { if (v !== undefined) this.registry.set('reducedEffects', v); return this.registry.get('reducedEffects') ?? this.reducedMotion; },
      reduceMotion: v => { this.reducedMotion = v; this.registry.set('reducedMotion', v); } });
    this.ui.root.querySelector('.chapter h1').textContent = 'No sueltes mi mano';
    this.ui.root.querySelector('.location-tag').innerHTML = '<span>23:59</span><div>EL CAMINO DE VUELTA<small>El anfitrión está detrás de vosotros</small></div>';
    this.ui.root.querySelector('.controls-strip').innerHTML = '<span><kbd>W A S D</kbd> / flechas: correr</span><span><kbd>E</kbd> mantener: luz / ayudar</span><span><kbd>Esc</kbd> pausa · <kbd>Tab</kbd> cuaderno</span>';
    this.ui.updateProgress(this.progress);
    this.speech = document.createElement('p'); this.speech.className = 'chase-speech'; this.speech.setAttribute('role', 'status'); this.ui.root.append(this.speech);
    this.controls = new Controls(code => this.handleAction(code), () => this.pause());
    this.touch = new TouchControls(this);
    this.showReady();
    this.events.on('postupdate', this.afterPhysics, this);
    this.events.once('shutdown', () => {
      this.events.off('postupdate', this.afterPhysics, this); this.controls.destroy(); this.audio.destroy(); this.audioManager.destroy(); this.ui.destroy();
    });
  }
  solid(r) {
    const object = this.add.rectangle(r.x + r.width / 2, r.y + r.height / 2, r.width, r.height).setVisible(false);
    this.physics.add.existing(object, true); this.obstacles.add(object); this.solids.push(r); return object;
  }
  label(x, y, text, color, fontSize) { return this.add.text(x, y, text, { fontFamily: 'monospace', fontSize: `${fontSize}px`, color, backgroundColor: '#202533', padding: { x: 5, y: 4 }, align: 'center' }).setOrigin(0.5).setDepth(4); }
  showReady() {
    this.modal = 'ready'; this.physics.world.pause();
    const m = this.ui.byId('modal'); m.hidden = false;
    m.innerHTML = '<section class="pause-panel panel"><span class="eyebrow">23:59 · EL CAMINO SE DOBLA</span><h2>Volvamos juntos.</h2><p>Corre hacia la izquierda. Rodea las vallas por las flechas. Los rectángulos dorados son refugios: mantén E junto a sus interruptores para abrir los pestillos.</p><p>Allen señalará el paso lateral. Si tropieza, vuelve a su lado y mantén E. Puedes pausar en cualquier momento.</p><button id="begin-chase" class="primary-button">Correr juntos <kbd>E</kbd></button></section>';
    m.querySelector('button').onclick = () => this.begin();
  }
  begin() {
    if (this.model.state !== EnemyState.INTRO) return;
    this.modal = null; this.ui.closeModal(); this.controls.clear(); this.physics.world.resume();
    this.model.start(); this.audio.start(); this.audio.mode = 'chase';
    this.voice.update(0, false);
    this.say('Allen: «Dentro del rectángulo de Faroles estamos a salvo. Abre el pestillo; al salir volverá a seguirnos».', 7);
  }
  say(text, duration = 5, priority = 50) { this.speech.textContent = text; this.speech.hidden = false; this.speechTime = duration; this.ui.speakFeedback(text, priority, duration * 1000); }
  handleAction(code) {
    this.audioManager.unlock();
    if (this.modal === 'ready' && ['KeyE', 'Space'].includes(code)) { this.begin(); return; }
    if (this.modal === 'defeat' && code === 'KeyE') { this.retry(); return; }
    if (code === 'Escape' || code === 'KeyP') { if (['pause', 'notebook'].includes(this.modal)) this.closeModal(); else this.pause(); return; }
    if (code === 'Tab') { this.notebook(); return; }
    if (this.modal === 'notebook' && ['ArrowLeft', 'ArrowRight'].includes(code)) this.ui.turnNotebookPage(code === 'ArrowLeft' ? -1 : 1);
  }
  freeze() { this.player.stop(); this.enemy.body.stop(); this.controls.clear(); this.pointerHeld = false; this.physics.world.pause(); this.audio.update(0, true); this.music.update(0, true); }
  pause() {
    if (this.modal || !this.model.running) return;
    this.modal = 'pause'; this.freeze(); this.ui.showPause(this.audioManager, this.reducedMotion);
  }
  notebook() {
    if (this.modal === 'notebook') { this.closeModal(); return; }
    if (this.modal || !this.model.running) return;
    this.modal = 'notebook'; this.freeze(); this.ui.showNotebook(this.progress);
  }
  closeModal() {
    if (!['pause', 'notebook'].includes(this.modal)) return;
    this.modal = null; this.controls.clear(); this.pointerHeld = false; this.ui.closeModal(); this.physics.world.resume();
  }
  protectedAt(p) {
    return this.porches.some(z => z.on && p.x >= z.zone.x && p.x <= z.zone.x + z.zone.width && p.y >= 342 && p.y <= 430)
      || this.model.lights.has('home') && p.x >= 80 && p.x <= 280 && p.y <= 430;
  }
  targetAction() {
    const near = p => Math.hypot(this.player.x - p.x, this.player.y - p.y) < 66;
    if (this.model.fallen && !this.model.rescued && near(this.allen)) return { id: 'allen', x: this.allen.x, y: this.allen.y, text: 'Ayudar a Allen', duration: CHASE.rescueHold };
    for (const p of this.porches) if (!this.model.lights.has(p.id) && near(p)) return { ...p, text: p.id === '0' ? 'Abrir el paso de Faroles' : 'Encender el porche', duration: CHASE.lightHold };
    if (this.model.rescued && near(CHASE.home)) return { ...CHASE.home, id: 'home', text: 'Encender nuestra luz', duration: CHASE.homeHold };
    return null;
  }
  renderAction(target) {
    const element = this.ui.byId('interaction'); element.hidden = !target || Boolean(this.modal) || !this.model.running;
    if (!target) { this.actionId = null; return; }
    if (target.id !== this.actionId) {
      this.actionId = target.id;
      element.innerHTML = '<button class="hold-action"></button><progress max="1" value="0" aria-label="Progreso de la interacción"></progress>';
      const b = element.querySelector('button'); b.textContent = `Mantén E · ${target.text}`;
      b.onpointerdown = e => { b.setPointerCapture(e.pointerId); this.pointerHeld = true; this.audio.start(); };
      b.onpointerup = b.onpointercancel = b.onlostpointercapture = () => { this.pointerHeld = false; };
    }
    element.querySelector('progress').value = this.holdTime / target.duration;
  }
  activate(target) {
    this.holdTime = 0; this.pointerHeld = false;
    if (target.id === 'allen') {
      if (!this.model.rescue()) return;
      this.allen.setRotation(0); this.allen.trail = new Trail({ x: this.allen.x, y: this.allen.y }, { x: this.player.x, y: this.player.y }, 32);
      this.rescueGate.body.enable = false; this.rescueGate.destroy(); this.solids = this.solids.filter(r => r !== this.rescueSolid);
      this.say('Riliane: «¡No pienso dejarte aquí!» Allen: «Entonces… juntos. ¡Nuestra luz está al final!»', 7);
      return;
    }
    if (!this.model.ignite(target.id)) return;
    this.audio.cue('light'); this.pathClock = 0;
    if (target.id === 'home') {
      this.home.setLit(true);
      this.homeHalo.setFillStyle(0xffdc94, 0.34); this.homeLamp.setFillStyle(0xffe09c);
      if (this.model.win()) this.victory();
    } else {
      const p = this.porches.find(p => p.id === target.id); p.on = true; p.halo.setFillStyle(0xffdc94, 0.32).setStrokeStyle(2, 0xfbe4b6); p.lamp.setFillStyle(0xffe09c);
      p.barrier.body.enable = true;
      p.gate.body.enable = false; p.gate.setVisible(false); this.solids = this.solids.filter(r => r !== p.solid);
      p.sign.setText('LUZ ENCENDIDA · UMBRAL SEGURO');
      this.say('Señor Sonrisas: «¡Ay, qué luces tan desagradables! ¡Arruinan toda la decoración!»', 5);
    }
  }
  fall() {
    if (!this.model.fall()) return;
    this.allen.setRotation(-0.65);
    this.rescueSolid = { x: 985, y: 340, width: 20, height: 210 };
    this.rescueGate = this.solid(this.rescueSolid).setVisible(true).setFillStyle(0x685763, 0.8).setStrokeStyle(2, 0xd7b47f).setDepth(400);
    this.say('Allen: «¡Riliane, sigue sin mí!» · Vuelve a su lado y mantén E para levantarlo. El pestillo necesita a los dos.', 9);
    this.audio.cue('wood');
  }
  steerEnemy(dt) {
    const state = this.model.state;
    if (!this.model.running) { this.enemy.body.stop(); return; }
    if (state === EnemyState.STUNNED) { this.enemy.body.setVelocity(38, 0); return; }
    const protectedPlayer = this.protectedAt(this.player);
    const target = protectedPlayer ? { x: this.player.x + 155, y: 465 } : { x: this.player.x, y: this.player.y };
    // Lit thresholds are real navigation obstacles even when the player is not inside one.
    const barriers = [...this.solids, ...this.porches.filter(p => p.on).map(p => p.zone)];
    this.pathClock -= dt;
    if (this.pathClock <= 0) { this.path = findPath({ x: this.enemy.x, y: this.enemy.y }, target, barriers); this.pathClock = 0.25; }
    while (this.path.length && Math.hypot(this.path[0].x - this.enemy.x, this.path[0].y - this.enemy.y) < (this.path.length === 1 ? 0.5 : 5)) this.path.shift();
    const next = this.path[0];
    if (!next) { this.enemy.body.stop(); return; }
    const dx = next.x - this.enemy.x, dy = next.y - this.enemy.y, length = Math.hypot(dx, dy);
    const gap = Math.hypot(this.player.x - this.enemy.x, this.player.y - this.enemy.y);
    let speed = gap > 430 ? CHASE.recoverySpeed : gap < 150 ? CHASE.nearSpeed : CHASE.speed;
    if (state === EnemyState.RECOVERING) speed = 90;
    // Allen's fall has a readable rescue window; danger stays visible and resumes afterwards.
    if (this.model.fallen && !this.model.rescued && this.model.fallClock > 0 && gap < 190) speed = 24;
    speed = Math.min(speed, length / Math.max(dt, 0.001));
    this.enemy.body.setVelocity(dx / length * speed, dy / length * speed);
  }
  afterPhysics() {
    if (this.player) this.cameras.main.scrollY = Math.max(0, this.player.y - 470);
    if (!this.player || this.modal || !this.model.running) return;
    if (!this.model.fallen || this.model.rescued) this.allen.follow(this.player, this.time.now);
    this.host.setPosition(this.enemy.x, this.enemy.y);
    const safe = this.protectedAt(this.player);
    if (this.model.contact(Math.hypot(this.enemy.x - this.player.x, this.enemy.y - this.player.y), safe)) this.capture();
  }
  capture() {
    this.player.stop(); this.enemy.body.stop(); this.physics.world.pause(); this.audio.mode = 'quiet'; this.audio.cue('capture'); this.controls.clear(); this.pointerHeld = false;
    this.say('Señor Sonrisas: «¡Te encontré! ¡Ahora te toca quedarte!»', 3, 100);
    this.ui.byId('interaction').hidden = true;
    if (!this.reducedMotion) this.cameras.main.shake(220, 0.003);
  }
  defeat() {
    if (this.modal === 'defeat') return;
    this.modal = 'defeat'; this.audio.update(0, true);
    this.voice.stop();
    const m = this.ui.byId('modal'); m.hidden = false;
    m.innerHTML = '<section class="pause-panel panel defeat-panel"><span class="eyebrow">EL TELÓN TODAVÍA NO HA CAÍDO</span><h2>La fiesta te encontró.</h2><p>El anfitrión os alcanzó fuera de la luz. Puedes repetir la huida; las visitas y las pistas están conservadas.</p><button id="retry-chase" class="primary-button">Reintentar la persecución <kbd>E</kbd></button><button id="defeat-menu" class="text-button">Volver al menú</button></section>';
    m.querySelector('#retry-chase').onclick = () => this.retry(); m.querySelector('#defeat-menu').onclick = () => this.scene.start('Menu');
  }
  retry() { if (this.modal === 'defeat') this.scene.restart({ progress: this.progress, attempt: this.attempt + 1 }); }
  victory() {
    this.player.stop(); this.enemy.body.stop(); this.physics.world.pause(); this.controls.clear(); this.pointerHeld = false; this.audio.mode = 'quiet';
    this.progress.flags.add('escapedTogether'); this.progress.transition('epilogue');
    this.registry.set('lastChaseSeconds', this.model.elapsed);
    this.scene.start('Ending', { progress: this.progress });
  }
  update(time, delta) {
    if (!this.player) return;
    const dt = Math.min(delta / 1000, 0.05), paused = Boolean(this.modal) || document.hidden;
    this.music.update(delta, paused, this.model.state === EnemyState.CAPTURE ? 0 : 1);
    this.audio.update(dt, paused); this.player.update(this.controls, paused || !this.model.running, time);
    if (paused) return;
    if (this.model.state === EnemyState.CAPTURE) { this.captureTime += dt; this.host.root.setScale(1.2 + Math.min(this.captureTime, 1) * 0.35); if (this.captureTime > 1.2) this.defeat(); return; }
    if (!this.model.running) return;
    this.model.tick(dt); this.elapsed += dt;
    this.speechTime -= dt; if (this.speechTime <= 0) this.speech.hidden = true;
    if (this.player.x < CHASE.fallAt && !this.model.fallen) this.fall();
    if (this.player.x < 4800 && !this.loopNoted) { this.loopNoted = true; this.say('Allen: «¡Ese tejado otra vez! No sigas las puertas: sigue las marcas del paso lateral».', 6); }
    if (this.player.x < 2400 && !this.exitNoted) { this.exitNoted = true; this.say('Riliane: «¡El tejado verde! ¡Mi corona!» Allen: «Nuestro escudo sigue ahí. ¡Enciende la luz de la puerta!»', 6); }
    const target = this.targetAction();
    if (target?.id !== this.actionTarget?.id) this.holdTime = 0;
    this.actionTarget = target;
    if (target && (this.controls.down('KeyE') || this.pointerHeld)) {
      this.player.stop(); this.holdTime += dt;
      if (this.holdTime >= target.duration) this.activate(target);
    } else this.holdTime = 0;
    if (!this.model.running) return;
    this.renderAction(this.targetAction());
    const next = this.porches.find(p => !this.model.lights.has(p.id));
    this.ui.byId('objective').textContent = this.model.fallen && !this.model.rescued ? 'Vuelve junto a Allen · Mantén E para ayudarlo' : next ? `← ${next.name} · Busca el interruptor dorado` : '← Nuestra casa · Enciende la última luz';
    this.steerEnemy(dt);
    this.host.pose(1, time, this.reducedMotion, this.model.state === EnemyState.STUNNED);
    if (!this.reducedMotion) this.leaves.forEach((leaf, i) => { leaf.y = 390 + i % 4 * 34 + Math.sin(this.elapsed + i) * 3; });
  }
}
