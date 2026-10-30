import { GamePhase } from './Progress.js';
import { LanternPuzzle } from './LanternPuzzle.js';
import { FarolesDisplay } from '../entities/FarolesDisplay.js';
import { FarolesPanel } from '../ui/FarolesPanel.js';
import { HouseAmbience } from '../audio/HouseAmbience.js';
import { lanterns, lanternOrder, farolesDialogues as lines, farolesClues as clues } from '../data/faroles.js';

export class FarolesEncounter {
  constructor(scene, house) {
    this.scene = scene; this.house = house; this.view = 'porch';
    this.puzzle = new LanternPuzzle(lanternOrder);
    this.display = new FarolesDisplay(scene, house);
    this.ambience = new HouseAmbience(scene.audioManager);
    this.panel = new FarolesPanel(scene.ui, {
      close: () => scene.closeModal(), pause: () => scene.pause(), activate: id => this.activate(id),
      photos: () => this.showPhotos(), rules: () => this.showRules(),
      finishPhotos: () => this.finishPhotos(), finishRules: () => this.finishRules(),
    });
  }
  refresh() { this.scene.ui.updateProgress(this.scene.progress); }
  interact() {
    const s = this.scene;
    if (!s.progress.flags.has('carmesiLightOut')) { s.dialogue.start(lines.locked); return; }
    this.ambience.start();
    if (s.progress.phase === GamePhase.CARMESI_DONE) {
      s.progress.transition(GamePhase.FAROLES_INTRO);
      s.dialogue.start(lines.intro, () => {
        s.progress.transition(GamePhase.FAROLES_PUZZLE);
        s.progress.addClue(clues.inscription);
        this.showPorch(); this.refresh();
      });
    } else if (s.progress.flags.has('farolesVisited') || [GamePhase.FAROLES_PUZZLE, GamePhase.FAROLES_PHOTOS, GamePhase.FAROLES_RULES, GamePhase.FAROLES_DONE].includes(s.progress.phase)) this.showPorch();
    this.refresh();
  }
  open(view) {
    const s = this.scene;
    this.view = view; s.modal = 'faroles';
    s.player.stop(); s.controls.clear(); s.physics.world.pause(); s.tweens.pauseAll();
  }
  showPorch(feedback) {
    this.open('porch');
    const s = this.scene;
    this.panel.porch({ lit: this.puzzle.lit, solved: this.puzzle.complete, settled:this.display.settled, photosRead: s.progress.flags.has('farolesPhotosRead'), reducedMotion: s.reducedMotion,
      feedback: feedback || (this.puzzle.complete ? 'Los faroles siguen encendidos. El cajón bajo la repisa está abierto.' : 'Allen: «Sigamos la inscripción del dintel. Cada farol tiene un símbolo distinto».') });
  }
  restoreView() {
    if (this.view === 'photos') this.showPhotos();
    else if (this.view === 'rules') this.showRules();
    else this.showPorch();
  }
  activate(id) {
    const s = this.scene;
    if (s.modal !== 'faroles' || this.view !== 'porch') return;
    const result = this.puzzle.activate(id);
    if (result === 'invalid') return;
    if (result === 'already') { this.panel.feedback('Allen: «Ese farol ya está encendido. Dejémoslo así».'); return; }
    if (result === 'wrong') {
      const next = lanterns.find(l => l.id === lanternOrder[this.puzzle.lit.length]);
      this.panel.feedback(`Allen: «Relee la inscripción: ahora corresponde ${next.name.toLowerCase()}. Los que encendimos bien siguen encendidos».`);
      return;
    }
    this.display.refresh(this.puzzle.lit);
    if (result === 'solved') s.progress.solveFaroles(clues.solved);
    this.showPorch(result === 'solved' ? 'La casa toma una última bocanada. Espera… Bajo la repisa se está abriendo un cajón.' : 'La llama prende. Riliane: «¿Has oído eso? Parece que la casa está respirando…».');
    this.refresh();
  }
  showPhotos() {
    if (!this.puzzle.complete || !this.display.settled) return;
    this.open('photos'); this.panel.photos(this.scene.reducedMotion);
  }
  finishPhotos() {
    const s = this.scene;
    if (s.modal !== 'faroles' || this.view !== 'photos') return;
    if (s.progress.flags.has('farolesPhotosRead')) { this.showPorch(); return; }
    s.closeModal();
    s.dialogue.start(lines.photos, () => {
      s.progress.readFarolesPhotos(clues.photos);
      this.showPorch('Allen: «Leamos la hoja junto al álbum antes de irnos». Pulsa 5.'); this.refresh();
    });
  }
  showRules() {
    if (!this.scene.progress.flags.has('farolesPhotosRead')) return;
    this.open('rules'); this.panel.rules(this.scene.reducedMotion);
  }
  finishRules() {
    const s = this.scene;
    if (s.modal !== 'faroles' || this.view !== 'rules') return;
    if (s.progress.flags.has('farolesVisited')) { this.showPorch(); return; }
    s.closeModal();
    s.dialogue.start(lines.rules, () => {
      s.progress.completeFaroles([clues.rules, clues.map]);
      this.refresh();
      s.apparition.start();
    });
  }
  handleKey(code) {
    if (code === 'KeyP') { this.scene.pause(); return; }
    if (['ArrowUp', 'ArrowDown'].includes(code)) {
      this.scene.ui.root.querySelector('.faroles-panel').scrollBy(0, code === 'ArrowDown' ? 70 : -70); return;
    }
    if (this.view === 'porch') {
      const lamp = lanterns.find(l => `Digit${l.key}` === code);
      if (lamp) this.activate(lamp.id);
      if (code === 'Digit4') this.showPhotos();
      if (code === 'Digit5') this.showRules();
    } else if (['KeyE', 'Space'].includes(code)) this.view === 'photos' ? this.finishPhotos() : this.finishRules();
  }
  update(delta) {
    const s = this.scene;
    const near = Math.abs(s.player.x - this.house.x) < 330;
    const active = near && !['pause', 'notebook'].includes(s.modal) && !document.hidden;
    const wave = this.display.update(delta, this.puzzle.lit, active, s.reducedMotion) ?? 0;
    if (s.modal==='faroles' && this.view==='porch') this.panel.breathe(wave,this.display.facade.scaleX,this.display.chair.rotation,this.display.settled,s.reducedMotion);
    const distance = Math.max(0, 1 - Math.abs(s.player.x - this.house.x) / 330);
    this.ambience.level(active && !this.display.settled ? distance * (0.25 + wave * 0.75) * (0.45 + this.puzzle.lit.length * 0.15) : 0);
  }
  destroy() { this.ambience.destroy(); }
}
