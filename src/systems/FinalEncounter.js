import { LanternPuzzle } from './LanternPuzzle.js';
import { FinalPanel } from '../ui/FinalPanel.js';
import { Smiles } from '../entities/Smiles.js';
import { FinalAudio } from '../audio/FinalAudio.js';
import { bellOrder, bellSymbols, finalLines as lines, finalClues } from '../data/finale.js';

// Time a reader needs for a piece of text when there is no clip to listen to. Used only as the
// fallback for automatic beats, never to delay a line that is actually being spoken.
const readingTime = text => Math.min(7000, Math.max(1400, [...String(text ?? '')].length * 38));

export class FinalEncounter {
  constructor(scene, house) {
    this.scene = scene; this.house = house; this.puzzle = new LanternPuzzle(bellOrder);
    this.view = 'porch'; this.clock = 0; this.errors = 0; this.transformation = 0; this.hold = 0; this.wait = null;
    this.audio = new FinalAudio(scene.audioManager);
    this.host = new Smiles(scene, house.x + 42, 354); this.host.setVisible(false);
    this.glow = scene.add.ellipse(house.x, 358, 180, 80, 0xffdc91, 0).setDepth(2);
    this.windows = [-68, 68].map(dx => scene.add.rectangle(house.x + dx, 245, 32, 48, 0xffd77b, 0.8).setDepth(1));
    this.sign = scene.add.text(house.x, 149, '¡HAN GANADO!\nEL CARAMELO DE ORO', { fontFamily: 'monospace', fontSize: '11px', align: 'center', color: '#ffe2a3', backgroundColor: '#332c40', padding: { x: 9, y: 8 } }).setOrigin(0.5).setDepth(2);
    this.panel = new FinalPanel(scene.ui, { choose: i => this.choose(i), pause: () => scene.pause(), close: () => scene.closeModal() });
    this.appear(0);
  }
  appear(alpha) {
    this.sign.setVisible(alpha>0).setAlpha(alpha);
    this.windows.forEach(w=>w.setVisible(alpha>0).setAlpha(alpha*.8));
    this.glow.setVisible(alpha>0);
  }
  refresh() { this.scene.ui.updateProgress(this.scene.progress); }
  interact() {
    const s = this.scene;
    if (!s.progress.flags.has('lastHouseAppeared')) return;
    this.audio.start();
    if (s.progress.phase === 'faroles_done') {
      s.progress.transition('ultima'); this.audio.cue('clock');
      s.dialogue.start(lines.arrival, () => { this.audio.mode = 'party'; this.open('porch'); });
    } else this.open(this.view);
    this.refresh();
  }
  open(view, feedback = '') {
    const s = this.scene; this.view = view; this.feedback = feedback;
    s.modal = 'final'; s.player.stop(); s.controls.clear(); s.physics.world.pause();
    this.panel.show(view, this.puzzle, feedback, s.reducedMotion);
  }
  get locked() { return ['opening', 'transform', 'escape'].includes(this.view); }
  restoreView() { this.open(this.view, this.feedback); }
  leave() {
    const s = this.scene; s.modal = null; s.ui.closeModal(); s.controls.clear(); s.physics.world.resume();
  }
  speak(dialogues, then) {
    this.wait = null; this.leave(); this.scene.dialogue.start(dialogues, then); this.hold = dialogues[0]?.hold || 0;
  }
  // Automatic beats wait for the clip that is playing instead of a fixed delay, so a spoken line is
  // never cut. When nothing is spoken (missing clip, typewriter mode, failed engine) the beat waits
  // for the reading time, and `safety` guarantees the encounter can never stay blocked forever.
  armVoiceWait(text, minimum = 0) {
    this.wait = { elapsed: 0, target: Math.max(minimum, readingTime(text)), safety: 16000 };
  }
  voiceWait(delta) {
    const wait = this.wait; if (!wait) return false;
    wait.elapsed += delta;
    if (this.scene.voice?.current && wait.elapsed < wait.safety) return true; // The clip is still playing.
    if (wait.elapsed < wait.target) return true;                              // Nothing spoken: let the text be read.
    this.wait = null; return false;
  }
  canAdvance() { return this.hold <= 0; }
  afterAdvance() { this.hold = this.scene.dialogue.lines[this.scene.dialogue.index]?.hold || 0; }
  choose(i) {
    const s = this.scene;
    if (s.modal !== 'final' || !Number.isInteger(i)) return;
    if (this.view === 'porch') {
      if (i === 0) { this.audio.cue('wood'); this.open('porch', 'La alfombra dice: «La fiesta no termina si nadie se va». Allen: «Han borrado la palabra bienvenidos».'); }
      if (i === 1) this.open('porch', 'Las calabazas miran a la puerta. Ninguna mira a la calle. Riliane: «Qué maleducadas…».');
      if (i === 2) { this.audio.mode = 'quiet'; this.audio.cue('bell'); this.clock = 0; const cue = 'Riliane y Allen: «¡Dulce o truco!» · Dentro, algo deja de cantar.'; this.open('opening', cue); this.armVoiceWait(cue, 2200); }
    } else if (this.view === 'choice' && lines.choices[i]) {
      s.progress.flags.add(`hostChoice${i}`);
      this.speak([...lines.choices[i], ...lines.game], () => { s.progress.transition('host_bells'); this.open('bells', 'Lee el friso de izquierda a derecha. Cada campana conserva su sonido.'); this.refresh(); });
    } else if (this.view === 'bells' && bellSymbols[i]) {
      const result = this.puzzle.activate(bellSymbols[i]); this.audio.cue('bell', i);
      if (result === 'wrong') { this.errors++; this.open('bells', `Allen: «${this.errors === 1 ? 'La luz debe proteger el umbral antes de recibir invitados.' : `Ahora toca ${bellOrder[this.puzzle.lit.length].toLowerCase()}.`} Lo que hicimos bien sigue sonando».`); }
      else if (result === 'already') this.open('bells', 'Esa campana ya sonó en su lugar. Allen asiente.');
      else if (result === 'solved') {
        s.progress.addClue(finalClues[0]); s.progress.transition('host_reveal');
        this.speak(lines.betrayal, () => { this.clock = 0; this.audio.mode = 'warped'; this.audio.cue('door'); const cue = 'La puerta se cierra. La sombra sigue bailando cuando él se detiene.'; this.open('transform', cue); this.armVoiceWait(cue, 4000); }); this.refresh();
      } else this.open('bells', `${this.puzzle.lit.length} / 3 campanadas. La sonrisa se queda un poco más quieta.`);
    } else if (this.view === 'escape' && i === 0 && !this.escaping) {
      this.escaping = true; this.clock = 0; this.audio.cue('light'); this.glow.setFillStyle(0xffdc91, 0.45);
      const cue = 'La luz dibuja un límite. El anfitrión retrocede. Allen levanta el pestillo: «¡Por aquí!»';
      this.open('escape', cue); this.armVoiceWait(cue, 1400);
    }
  }
  handleKey(code) {
    if (code === 'KeyP') this.scene.pause();
    if (/^Digit[123]$/.test(code)) this.choose(Number(code.at(-1)) - 1);
    if (code === 'KeyE' && this.view === 'porch') this.choose(2);
    if (code === 'KeyE' && this.view === 'escape') this.choose(0);
    if (['ArrowUp', 'ArrowDown'].includes(code)) this.scene.ui.root.querySelector('.final-panel')?.scrollBy(0, code === 'ArrowDown' ? 70 : -70);
  }
  update(delta) {
    const s = this.scene, active = !['pause', 'notebook'].includes(s.modal) && !document.hidden;
    const engaged = s.apparition?.active || s.horror?.current || s.progress.flags.has('lastHouseUnlocked') && Math.abs(s.player.x - this.house.x) < 330;
    this.audio.update(delta / 1000, !active || !engaged);
    if (!active || !engaged) return;
    this.hold = Math.max(0, this.hold - delta);
    this.host.pose(this.transformation, s.time.now, s.reducedMotion, this.escaping);
    if (this.errors && this.view === 'bells') this.windows.forEach(w => w.setAlpha(0.7 - Math.min(this.errors, 5) * 0.06));
    if (s.modal !== 'final') return;
    this.clock += delta;
    if (this.view === 'opening') {
      this.host.setVisible(this.clock > 500); this.host.root.setAlpha(Math.min(1, Math.max(0, (this.clock - 500) / 1700)));
      if (!this.voiceWait(delta)) { this.audio.cue('cane'); s.progress.transition('host_choice'); this.speak(lines.welcome, () => this.open('choice')); this.refresh(); }
    }
    if (this.view === 'transform') {
      this.transformation = Math.min(1, this.clock / 4000);
      s.dusk.setFillStyle(0x5a223b).setAlpha(0.12 + this.transformation * 0.13);
      this.windows.forEach(w => w.setFillStyle(0xc96e64).setAlpha(0.7 + (s.reducedMotion ? 0 : Math.sin(this.clock / 650) * 0.13)));
      if (!this.voiceWait(delta)) { s.progress.transition('host_escape'); this.speak(lines.revelation, () => this.open('escape', 'Allen se ocupa del pestillo. Enciende la luz con E o con la palanca.')); this.refresh(); }
    }
    if (this.view === 'escape' && this.escaping) {
      this.host.setPosition(this.house.x + 42 + Math.min(1, this.clock / 1300) * 90, 354);
      if (!this.voiceWait(delta)) {
        this.escaping = false;
        s.progress.flags.add('ultimaVisited'); s.progress.addClue(finalClues[1]);
        this.speak(lines.escape, () => { s.progress.transition('chase'); s.scene.start('Chase', { progress: s.progress }); });
      }
    }
  }
  destroy() { this.audio.destroy(); }
}
