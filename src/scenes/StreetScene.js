import Phaser from 'phaser';
import { WORLD, SPAWN, INTERACTION_RADIUS } from '../config.js';
import { drawStreet } from '../assets/drawStreet.js';
import { houses, notebookClue } from '../data/houses.js';
import { introduction, magnoliaVisit, magnoliaRepeat } from '../data/dialogues.js';
import { Riliane } from '../entities/Riliane.js';
import { Allen } from '../entities/Allen.js';
import { Progress, GamePhase } from '../systems/Progress.js';
import { Controls } from '../systems/Controls.js';
import { Dialogue } from '../systems/Dialogue.js';
import { nearestInteraction } from '../systems/Interaction.js';
import { AudioManager } from '../audio/AudioManager.js';
import { GameUI } from '../ui/GameUI.js';
import { BasilioEncounter } from '../systems/BasilioEncounter.js';
import { CarmesiEncounter } from '../systems/CarmesiEncounter.js';
import { FarolesEncounter } from '../systems/FarolesEncounter.js';
import { FinalEncounter } from '../systems/FinalEncounter.js';
import { HouseApparition } from '../systems/HouseApparition.js';
import { HorrorDirector } from '../systems/HorrorDirector.js';
import { FamilyHouse } from '../entities/FamilyHouse.js';
import { MagnoliaDisplay } from '../entities/Adults.js';
import { getMusic } from '../audio/MusicManager.js';
import { bindVoices } from '../audio/VoiceController.js';
import { TouchControls } from '../ui/TouchControls.js';

export class StreetScene extends Phaser.Scene {
  constructor() { super('Street'); }
  create() {
    this.progress = new Progress();
    this.modal = null;
    this.resumeFaroles = false;
    this.resumeFinal = false;
    this.resumeApparition = false;
    this.target = null;
    this.reducedMotion = this.registry.get('reducedMotion') ?? window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    this.audioManager = new AudioManager();
    this.audioManager.volume = this.registry.get('effectsVolume') ?? 0.35;
    this.audioManager.unlock(); this.music=getMusic(this.game); this.music.select('Street','musica1.mp3',.55);
    this.physics.world.setBounds(28, 100, WORLD.width - 56, WORLD.height - 128);
    this.obstacles = this.physics.add.staticGroup();
    this.geometry = drawStreet(this,{omitFaroles:true,textureKey:'street-explore'});
    this.geometry.push({x:32,y:176,width:216,height:154}); this.home=new FamilyHouse(this);
    for (const rect of this.geometry) {
      const object = this.add.rectangle(rect.x + rect.width / 2, rect.y + rect.height / 2, rect.width, rect.height).setVisible(false);
      this.physics.add.existing(object, true);
      this.obstacles.add(object);
    }
    this.player = new Riliane(this, SPAWN.player);
    this.allen = new Allen(this, SPAWN.allen, SPAWN.player);
    this.physics.add.collider(this.player, this.obstacles);
    this.cameras.main.setBounds(0, 0, WORLD.width, WORLD.height);
    this.cameras.main.startFollow(this.player, true, 1, 0, 0, 35);
    this.lights = houses.filter(h => h.lit).map(h => this.add.ellipse(h.x, h.y + 12, 160, 74, 0xffce83, 0.12).setDepth(-5));
    this.dusk = this.add.rectangle(0, 0, 960, 540, 0x333c6c).setAlpha(0).setOrigin(0).setScrollFactor(0).setDepth(5000);
    houses.filter(h=>h.id!=='ultima').forEach(h => {
      this.add.text(h.x, 301, `${h.number}  ${h.name.toUpperCase()}`, { fontFamily: 'monospace', fontSize: '11px', color: '#ffe4b8', backgroundColor: '#433d4b', padding: { x: 6, y: 4 } }).setOrigin(0.5).setDepth(10);
    });
    this.ui = new GameUI({
      voice: bindVoices(this),
      music:this.music, intensity:value=> { if (value!==undefined) this.registry.set('reducedEffects',value); return this.registry.get('reducedEffects')??this.reducedMotion; },
      advance: () => this.advance(), notebook: () => this.toggleNotebook(), pause: () => this.pause(),
      closeModal: () => this.closeModal(), menu: () => this.scene.start('Menu'),
      settings: () => this.registry.set('effectsVolume', this.audioManager.volume),
      reduceMotion: value => {
        this.reducedMotion = value;
        this.registry.set('reducedMotion', value);
        if (value) {
          this.tweens.killTweensOf(this.dusk);
          this.dusk.setAlpha(this.progress.flags.has('carmesiLightOut') ? 0.12 : this.progress.flags.has('magnoliaVisited') ? 0.08 : 0);
          if (this.progress.flags.has('carmesiLightOut')) this.carmesi.display.finishTransition();
        }
      },
    });
    this.dialogue = new Dialogue((line, index, count) => this.ui.dialogue(line, index, count));
    this.basilio = new BasilioEncounter(this, houses.find(h => h.id === 'basilio'));
    this.carmesi = new CarmesiEncounter(this, houses.find(h => h.id === 'carmesi'));
    this.faroles = new FarolesEncounter(this, houses.find(h => h.id === 'faroles'));
    this.finale = new FinalEncounter(this, houses.find(h => h.id === 'ultima'));
    this.apparition = new HouseApparition(this,houses.find(h=>h.id==='ultima'));
    this.magnolia = new MagnoliaDisplay(this,houses[0]); this.horror=new HorrorDirector(this);
    this.controls = new Controls(code => this.handleAction(code), () => this.pause());
    this.touch = new TouchControls(this);
    this.dialogue.start(introduction, () => {
      this.progress.transition(GamePhase.EXPLORE);
      this.ui.updateProgress(this.progress);
    });
    this.ui.updateProgress(this.progress);
    // Sample after physics resolves collisions; Allen follows the actual safe path.
    this.events.on('postupdate', this.afterPhysics, this);
    this.events.once('shutdown', () => {
      this.events.off('postupdate', this.afterPhysics, this);
      this.controls.destroy();
      this.faroles.destroy();
      this.finale.destroy();
      this.horror.destroy();
      this.audioManager.destroy();
      this.ui.destroy();
    });
  }
  get blocked() { return Boolean(this.modal || this.dialogue.active); }
  handleAction(code) {
    this.audioManager.unlock();
    if (code === 'Escape') { this.modal ? this.closeModal() : this.pause(); return; }
    if (code === 'Tab') { this.toggleNotebook(); return; }
    if (this.modal === 'dolls') { this.basilio.handleKey(code); return; }
    if (this.modal === 'carmesi') { this.carmesi.handleKey(code); return; }
    if (this.modal === 'faroles') { this.faroles.handleKey(code); return; }
    if (this.modal === 'final') { this.finale.handleKey(code); return; }
    if (this.modal === 'notebook' && ['ArrowUp', 'ArrowDown'].includes(code)) {
      this.ui.root.querySelector('.notebook').scrollBy(0, code === 'ArrowDown' ? 70 : -70); return;
    }
    if (this.modal === 'notebook' && ['ArrowLeft', 'ArrowRight'].includes(code)) {
      this.ui.turnNotebookPage(code === 'ArrowLeft' ? -1 : 1); return;
    }
    if (this.modal) return;
    if (code === 'KeyE' || code === 'Space') {
      if (this.dialogue.active) this.advance();
      else if (code === 'KeyE') this.interact();
    }
  }
  advance() {
    if (!this.modal && this.dialogue.active && this.finale.canAdvance()) {
      if (this.ui.revealDialogue()) return;
      this.dialogue.advance(); this.finale.afterAdvance();
    }
  }
  interact() {
    const house = nearestInteraction(this.player, this.availableHouses, INTERACTION_RADIUS);
    if (!house || this.blocked) return;
    this.player.stop();
    if (house.id === 'basilio') { this.basilio.interact(); return; }
    if (house.id === 'carmesi') { this.carmesi.interact(); return; }
    if (house.id === 'faroles') { this.faroles.interact(); return; }
    if (house.id === 'ultima') {
      this.finale.interact();
      return;
    }
    if (house.id !== 'magnolia') {
      this.ui.toast('Sigamos las luces de los porches.');
      return;
    }
    this.audioManager.bell();
    this.magnolia.reveal();
    if (this.progress.flags.has('magnoliaVisited')) {
      this.dialogue.start(magnoliaRepeat);
      return;
    }
    if (!this.progress.transition(GamePhase.MAGNOLIA)) return;
    this.player.direction = 'up';
    this.dialogue.start(magnoliaVisit, () => {
      this.progress.completeMagnolia(notebookClue);
      this.ui.updateProgress(this.progress);
      this.ui.toast('+3 caramelos · Tarjeta guardada en el cuaderno de Allen [Tab]');
      if (this.reducedMotion) this.dusk.setAlpha(0.08);
      else this.tweens.add({ targets: this.dusk, alpha: 0.08, duration: 2400 });
    });
    this.ui.updateProgress(this.progress);
  }
  toggleNotebook() {
    if (this.modal === 'notebook') { this.closeModal(); return; }
    if (this.modal || this.dialogue.active) return;
    this.modal = 'notebook';
    this.player.stop();
    this.controls.clear();
    this.physics.world.pause();
    this.tweens.pauseAll();
    if (this.progress.flags.has('magnoliaVisited')) this.progress.flags.add('clueRead');
    if (this.progress.flags.has('basilioVisited')) this.progress.flags.add('basilioCluesRead');
    if (this.progress.flags.has('carmesiLightOut')) this.progress.flags.add('carmesiCluesRead');
    this.ui.showNotebook(this.progress);
    this.ui.updateProgress(this.progress);
  }
  pause() {
    if (this.modal && !['faroles', 'final','apparition'].includes(this.modal)) return;
    this.resumeFaroles = this.modal === 'faroles';
    this.resumeFinal = this.modal === 'final';
    this.resumeApparition = this.modal==='apparition';
    this.modal = 'pause';
    this.faroles.ambience.level(0);
    this.finale.audio.update(0, true);
    this.music.update(0,true); this.audioManager.stopText(); this.horror.clear();
    this.player.stop();
    this.controls.clear();
    this.physics.world.pause();
    this.tweens.pauseAll();
    this.ui.showPause(this.audioManager, this.reducedMotion);
  }
  closeModal() {
    if (!this.modal) return;
    if (this.modal==='apparition') { this.pause(); return; }
    if (this.modal === 'final' && this.finale.locked) { this.pause(); return; }
    const restoreFaroles = this.modal === 'pause' && this.resumeFaroles;
    const restoreFinal = this.modal === 'pause' && this.resumeFinal;
    const restoreApparition=this.modal==='pause' && this.resumeApparition;
    this.resumeFaroles = false;
    this.resumeFinal = false;
    this.resumeApparition=false;
    this.modal = null;
    this.controls.clear();
    this.ui.closeModal();
    if (restoreFaroles) { this.faroles.restoreView(); return; }
    if (restoreFinal) { this.finale.restoreView(); return; }
    if (restoreApparition) { this.modal='apparition'; return; }
    this.physics.world.resume();
    this.tweens.resumeAll();
  }
  afterPhysics() {
    // Keep roofs visible; only pan down when the player approaches the lower edge.
    this.cameras.main.scrollY = Math.max(0, this.player.y - 470);
    if (!this.blocked) this.allen.follow(this.player, this.time.now);
    else this.allen.animateMovement(0, 0, this.time.now);
    this.player.setDepth(this.player.y);
  }
  get availableHouses() { return houses.filter(h=>h.id!=='ultima' || this.progress.flags.has('lastHouseAppeared')); }
  update(time, delta) {
    if (!this.player) return;
    this.player.update(this.controls, this.blocked, time);
    this.basilio.update();
    this.carmesi.update();
    this.faroles.update(delta);
    this.finale.update(delta);
    this.apparition.update(delta); this.horror.update(delta);
    const paused=this.modal==='pause' || document.hidden;
    this.ui.updateText(delta,this.audioManager,paused);
    const song=this.progress.flags.has('lastHouseUnlocked')?'musica3.mp3':this.progress.flags.has('basilioVisited')?'musica2.mp3':'musica1.mp3';
    if (this.music.requested!==song) this.music.select('Street',song,song==='musica3.mp3'?.42:.55);
    const silence=this.apparition.active || ['opening','transform'].includes(this.finale.view) && this.modal==='final' || this.faroles.display.settled && !this.progress.flags.has('farolesVisited');
    this.music.update(delta,paused,silence?0:this.horror.duck);
    this.target = this.blocked ? null : nearestInteraction(this.player, this.availableHouses, INTERACTION_RADIUS);
    this.ui.interaction(this.target, this.progress.flags.has(`${this.target?.id}Visited`), this.progress.flags.has('lastHouseUnlocked'));
  }
}
