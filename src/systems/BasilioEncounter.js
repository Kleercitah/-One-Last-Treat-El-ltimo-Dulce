import { GamePhase } from './Progress.js';
import { basilioDialogues as lines, basilioClues as clues } from '../data/basilio.js';
import { BasilioDisplay } from '../entities/BasilioDisplay.js';

export class BasilioEncounter {
  constructor(scene, house) {
    this.scene = scene;
    this.house = house;
    this.display = new BasilioDisplay(scene, house);
  }
  refresh() { this.scene.ui.updateProgress(this.scene.progress); }
  interact() {
    const s = this.scene;
    if (!s.progress.flags.has('magnoliaVisited')) { s.dialogue.start(lines.locked); return; }
    this.display.reveal();
    if (s.progress.flags.has('basilioVisited')) { s.dialogue.start(lines.repeat); return; }
    switch (s.progress.phase) {
      case GamePhase.COMPLETE:
        s.progress.transition(GamePhase.BASILIO_INTRO);
        s.audioManager.bell();
        s.dialogue.start(lines.intro, () => {
          s.progress.transition(GamePhase.BASILIO_OBSERVE);
          this.showDolls(); this.refresh();
        });
        break;
      case GamePhase.BASILIO_OBSERVE:
      case GamePhase.BASILIO_COMPARE: this.showDolls(); break;
      case GamePhase.BASILIO_LOOK_AWAY: s.ui.toast('Da la espalda al escaparate y camina hacia el centro de la calle.'); break;
    }
    this.refresh();
  }
  showDolls() {
    const s = this.scene;
    const comparing = s.progress.phase === GamePhase.BASILIO_COMPARE;
    s.modal = 'dolls';
    s.player.stop(); s.controls.clear(); s.physics.world.pause(); s.tweens.pauseAll();
    const source = key => s.textures.get(key).getSourceImage().toDataURL();
    s.ui.showDolls({ comparing, princess: source('riliane-down-0'), knight: source(comparing ? 'allen-up-0' : 'allen-down-0'),
      onObserve: () => this.observe(), onAnswer: answer => this.answer(answer) });
  }
  observe() {
    const s = this.scene;
    if (s.modal !== 'dolls' || !s.progress.transition(GamePhase.BASILIO_LOOK_AWAY)) return;
    s.progress.addClue(clues.reference);
    s.closeModal(); this.refresh();
    s.ui.toast('Allen ha dibujado los muñecos en el cuaderno. Camina hacia abajo, hasta la calle.');
  }
  update() {
    const s = this.scene;
    if (s.blocked || s.progress.phase !== GamePhase.BASILIO_LOOK_AWAY) return;
    // A spatial, deterministic trigger: pausing, reading or waiting cannot advance it.
    if (s.player.y < 440 || s.player.direction !== 'down' || Math.abs(s.player.x - this.house.x) > 160) return;
    s.player.stop();
    s.progress.transition(GamePhase.BASILIO_COMPARE);
    s.progress.flags.add('dollsChanged');
    this.display.change();
    s.audioManager.bell();
    s.dialogue.start(lines.changed);
    this.refresh();
  }
  answer(choice) {
    const s = this.scene;
    if (s.modal !== 'dolls' || s.progress.phase !== GamePhase.BASILIO_COMPARE) return;
    if (choice !== 'allen') {
      s.ui.dollFeedback('Allen: «Los dibujé a los dos de frente. Fíjate en cuál ya no nos enseña la cara. Podemos intentarlo otra vez».');
      return;
    }
    s.closeModal();
    s.dialogue.start(lines.solved, () => {
      s.progress.completeBasilio([clues.anomaly, clues.lamps]);
      this.refresh();
      s.ui.toast('Nuevas pistas: el susurro del juguete y el dibujo de las farolas · Tab');
    });
  }
  handleKey(code) {
    if (this.scene.progress.phase === GamePhase.BASILIO_OBSERVE && ['KeyE', 'Space'].includes(code)) this.observe();
    const choices = { Digit1: 'riliane', Digit2: 'allen', Digit3: 'neither' };
    if (choices[code]) this.answer(choices[code]);
  }
}
