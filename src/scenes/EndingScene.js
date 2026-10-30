import Phaser from 'phaser';
import { drawStreet } from '../assets/drawStreet.js';
import { Character } from '../entities/Character.js';
import { Smiles } from '../entities/Smiles.js';
import { Controls } from '../systems/Controls.js';
import { Dialogue } from '../systems/Dialogue.js';
import { GameUI } from '../ui/GameUI.js';
import { AudioManager } from '../audio/AudioManager.js';
import { FinalAudio } from '../audio/FinalAudio.js';
import { finalLines, finalClues, credits } from '../data/finale.js';
import { FamilyHouse } from '../entities/FamilyHouse.js';
import { createMother } from '../entities/Adults.js';
import { getMusic } from '../audio/MusicManager.js';
import { bindVoices } from '../audio/VoiceController.js';
import { showCredits } from '../ui/Credits.js';

export class EndingScene extends Phaser.Scene {
  constructor() { super('Ending'); }
  init({ progress }) { this.progress = progress; }
  create() {
    this.modal = null; this.clock = 0; this.hold = 0; this.stage = 'farewell'; this.fade = 0;
    this.black = null; this.candy = null; this.note = null;
    this.reducedMotion = this.registry.get('reducedMotion') ?? window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    drawStreet(this); this.cameras.main.setScroll(0, 20);
    this.home = new FamilyHouse(this);
    this.door = this.home.door; this.lamp = this.home.lamp; this.halo = this.home.halo;
    this.add.rectangle(240, 405, 3, 95, 0xffdf8a, 0.8).setDepth(4);
    this.player = new Character(this, 158, 403, 'riliane').setDepth(403);
    this.allen = new Character(this, 122, 405, 'allen').setDepth(405);
    this.host = new Smiles(this, 350, 420, 1.2); this.host.pose(1, 0, true, true);
    this.mother = createMother(this, 140, 332);
    this.audioManager = new AudioManager(); this.audioManager.volume = this.registry.get('effectsVolume') ?? 0.35;
    this.audioManager.unlock(); this.music = getMusic(this.game); this.music.select('Ending', 'musica3.mp3', 0.3);
    this.audio = new FinalAudio(this.audioManager);
    this.ui = new GameUI({ advance: () => this.advance(), notebook: () => {}, pause: () => this.pause(), closeModal: () => this.resume(), menu: () => this.scene.start('Menu'),
      voice: bindVoices(this),
      music: this.music, intensity: v => { if (v !== undefined) this.registry.set('reducedEffects', v); return this.registry.get('reducedEffects') ?? this.reducedMotion; },
      settings: () => this.registry.set('effectsVolume', this.audioManager.volume), reduceMotion: v => { this.reducedMotion = v; this.registry.set('reducedMotion', v); } });
    // The epilogue is played with a finger too, so the options button stays. The chapter heading is
    // only made invisible so the inventory keeps its place at the right; the notebook is a no-op here.
    const hud = this.ui.root.querySelector('.hud');
    hud.querySelector('.chapter').style.visibility = 'hidden';
    for (const hidden of hud.querySelectorAll('#notebook-button, .candy-icon, .inventory > span')) hidden.hidden = true;
    this.ui.root.querySelector('.location-tag').hidden = true;
    this.ui.root.querySelector('.controls-strip').innerHTML = '<span><kbd>E</kbd> continuar · <kbd>Esc</kbd> pausa</span>';
    this.dialogue = new Dialogue((line, index, total) => this.ui.dialogue(line, index, total));
    this.controls = new Controls(code => {
      if (this.stage === 'credits') {
        if (code === 'Enter') (this.ui.root.querySelector('#dedication-next') || this.ui.root.querySelector('#credits-menu'))?.click();
        if (code === 'KeyN') this.ui.root.querySelector('#new-night')?.click();
        return;
      }
      if (code === 'Escape' || code === 'KeyP') { this.modal === 'pause' ? this.resume() : this.pause(); return; }
      if (code === 'KeyE' || code === 'Space') this.advance();
    }, () => this.pause());
    this.speak(finalLines.farewell, () => { this.stage = 'departure'; this.clock = 0; });
    this.progress.addClue(finalClues[2]);
    this.events.once('shutdown', () => { this.controls.destroy(); this.audio.destroy(); this.audioManager.destroy(); this.ui.destroy(); });
  }
  speak(lines, next) { this.dialogue.start(lines, next); this.hold = lines[0]?.hold || 0; }
  advance() {
    if (this.modal || this.hold > 0 || !this.dialogue.active) return;
    if (this.ui.revealDialogue()) return;
    this.audio.start();
    if (this.stage === 'farewell') this.audio.cue('cane');
    this.dialogue.advance(); this.hold = this.dialogue.lines[this.dialogue.index]?.hold || 0;
  }
  pause() {
    if (this.modal || this.stage === 'credits') return;
    this.modal = 'pause'; this.controls.clear(); this.audio.update(0, true); this.music.update(0, true); this.audioManager.stopText(); this.ui.showPause(this.audioManager, this.reducedMotion);
  }
  resume() { if (this.modal !== 'pause') return; this.modal = null; this.controls.clear(); this.ui.closeModal(); }
  showCandy() {
    this.stage = 'candy';
    this.candy = this.add.container(350, 393, [this.add.triangle(-10, 0, 0, 0, 0, 18, 15, 9, 0xd8ac4c), this.add.rectangle(10, 0, 25, 18, 0xf4d37c), this.add.triangle(30, 0, 15, 0, 15, 18, 0, 9, 0xd8ac4c)]).setDepth(450);
    this.note = this.add.text(365, 425, '¡Gracias por jugar!', { fontFamily: 'Georgia', fontSize: '10px', color: '#473b37', backgroundColor: '#ecd9a9', padding: { x: 5, y: 3 } }).setOrigin(0.5).setDepth(450);
    this.speak(finalLines.candy, () => { this.stage = 'blackout'; this.clock = 0; this.lamp.setFillStyle(0x49474b); this.halo.setAlpha(0); this.audio.cue('wood'); });
  }
  showCredits() {
    this.stage = 'credits'; this.progress.transition('end'); this.progress.flags.add('gameComplete');
    this.audio.mode = 'quiet'; this.audio.update(0, true);
    this.voice.stop();
    showCredits(this.ui.root, { menu: () => this.scene.start('Menu'), newGame: () => this.scene.start('Street') });
  }
  update(time, delta) {
    if (!this.ui) return;
    const paused = Boolean(this.modal) || document.hidden;
    this.ui.updateText(delta, this.audioManager, paused);
    this.music.update(delta, paused, ['candy', 'blackout', 'credits'].includes(this.stage) ? 0 : 1);
    this.audio.update(delta / 1000, paused); if (paused || this.stage === 'credits') return;
    this.clock += delta; this.hold = Math.max(0, this.hold - delta);
    if (this.stage === 'departure') {
      this.host.root.setAlpha(Math.max(0, 1 - this.clock / 1600)); this.host.shadow.setAlpha(Math.max(0, 0.6 * (1 - this.clock / 1600)));
      if (this.clock >= 1900) {
        this.host.setVisible(false); this.stage = 'arrival'; this.clock = 0;
        this.music.select('Ending', 'musica1.mp3', 0.25);
      }
    }
    if (this.stage === 'arrival') {
      this.home.open(Math.min(1, this.clock / 700)); this.mother.setVisible(this.clock > 400);
      const t = Math.min(1, Math.max(0, (this.clock - 500) / 1000));
      this.player.y = 403 - 48 * t; this.allen.y = 405 - 48 * t;
      this.player.animateMovement(0, t < 1 ? -1 : 0, time); this.allen.animateMovement(0, t < 1 ? -1 : 0, time);
      if (this.clock >= 1600) { this.stage = 'home'; this.speak(finalLines.home, () => { this.stage = 'street'; this.clock = 0; }); }
    }
    if (this.stage === 'street') {
      // A quiet view of the empty neighborhood; no moving decor, no threat logic.
      if (!this.reducedMotion) this.cameras.main.setScroll(Math.sin(Math.min(1, this.clock / 2200) * Math.PI) * 150, 20);
      if (this.clock >= 2400) { this.cameras.main.setScroll(0, 20); this.showCandy(); }
    }
    if (this.stage === 'candy' && !this.reducedMotion) this.candy?.setScale(Math.min(2, 1 + this.clock / 16000));
    if (this.stage === 'blackout') {
      if (!this.black) this.black = this.add.rectangle(0, 0, 960, 540, 0x080a10).setOrigin(0).setScrollFactor(0).setDepth(5000);
      this.black.setAlpha(Math.min(1, this.clock / 1200));
      if (this.clock >= 1800) this.showCredits();
    }
  }
}
