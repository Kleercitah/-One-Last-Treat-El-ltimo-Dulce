import { GamePhase } from './Progress.js';
import { RecallPuzzle } from './RecallPuzzle.js';
import { CarmesiDisplay } from '../entities/CarmesiDisplay.js';
import { carmesiDialogues as lines, carmesiQuestions, carmesiClues as clues } from '../data/carmesi.js';

export class CarmesiEncounter {
  constructor(scene, house) {
    this.scene = scene; this.house = house;
    this.puzzle = new RecallPuzzle(carmesiQuestions);
    this.display = new CarmesiDisplay(scene, house);
  }
  refresh() { this.scene.ui.updateProgress(this.scene.progress); }
  interact() {
    const s = this.scene;
    if (!s.progress.flags.has('magnoliaVisited')) { s.dialogue.start(lines.lockedMagnolia); return; }
    if (!s.progress.flags.has('basilioVisited')) { s.dialogue.start(lines.lockedBasilio); return; }
    this.display.reveal();
    if (s.progress.flags.has('carmesiVisited')) { s.dialogue.start(lines.repeat); return; }
    if (s.progress.phase === GamePhase.BASILIO_DONE) {
      s.progress.transition(GamePhase.CARMESI_INTRO);
      s.audioManager.bell();
      s.dialogue.start(lines.intro, () => {
        s.progress.transition(GamePhase.CARMESI_QUIZ);
        this.showQuestion(); this.refresh();
      });
    } else if (s.progress.phase === GamePhase.CARMESI_QUIZ) this.showQuestion();
    this.refresh();
  }
  showQuestion(feedback = 'Puedes salir con Esc y consultar las pistas con Tab. Tus respuestas correctas se conservan.') {
    const s = this.scene;
    s.modal = 'carmesi';
    s.player.stop(); s.controls.clear(); s.physics.world.pause(); s.tweens.pauseAll();
    s.ui.showRecallQuestion({ question: this.puzzle.current, index: this.puzzle.index, total: carmesiQuestions.length,
      feedback, onAnswer: id => this.answer(id) });
  }
  answer(id) {
    const s = this.scene;
    if (s.modal !== 'carmesi' || s.progress.phase !== GamePhase.CARMESI_QUIZ) return;
    const question = this.puzzle.current;
    if (!this.puzzle.answer(id)) { s.ui.recallFeedback(question.hint); return; }
    if (!this.puzzle.complete) { this.showQuestion(question.reaction); return; }
    s.closeModal();
    // Separate the final dialogue from the quiz so neither rewards nor the warning can be skipped.
    s.progress.transition(GamePhase.CARMESI_WARNING);
    s.dialogue.start(lines.warning, () => {
      s.progress.completeCarmesi(clues.warning);
      this.refresh();
      s.ui.toast('Allen ha anotado la advertencia. Alejaos del porche hacia la calle.');
    });
    this.refresh();
  }
  handleKey(code) {
    const index = { Digit1: 0, Digit2: 1, Digit3: 2 }[code];
    const option = this.puzzle.current?.options[index];
    if (option) this.answer(option.id);
  }
  update() {
    const s = this.scene;
    if (s.blocked || s.progress.phase !== GamePhase.CARMESI_LEAVE) return;
    if (Math.hypot(s.player.x - this.house.x, s.player.y - this.house.y) < 100) return;
    s.player.stop();
    s.progress.leaveCarmesi(clues.light);
    this.display.darken();
    s.dialogue.start(lines.outside);
    this.refresh();
  }
}
