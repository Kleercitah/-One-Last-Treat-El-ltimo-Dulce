export const GamePhase = Object.freeze({
  INTRO: 'intro', EXPLORE: 'explore', MAGNOLIA: 'magnolia', COMPLETE: 'complete',
  BASILIO_INTRO: 'basilio_intro', BASILIO_OBSERVE: 'basilio_observe',
  BASILIO_LOOK_AWAY: 'basilio_look_away', BASILIO_COMPARE: 'basilio_compare', BASILIO_DONE: 'basilio_done',
  CARMESI_INTRO: 'carmesi_intro', CARMESI_QUIZ: 'carmesi_quiz', CARMESI_WARNING: 'carmesi_warning',
  CARMESI_LEAVE: 'carmesi_leave', CARMESI_DONE: 'carmesi_done',
  FAROLES_INTRO: 'faroles_intro', FAROLES_PUZZLE: 'faroles_puzzle', FAROLES_PHOTOS: 'faroles_photos',
  FAROLES_RULES: 'faroles_rules', FAROLES_DONE: 'faroles_done',
  ULTIMA: 'ultima', HOST_CHOICE: 'host_choice', HOST_BELLS: 'host_bells', HOST_REVEAL: 'host_reveal',
  HOST_ESCAPE: 'host_escape', CHASE: 'chase', EPILOGUE: 'epilogue', END: 'end',
});
const transitions = {
  intro: ['explore'], explore: ['magnolia'], magnolia: ['complete'], complete: ['basilio_intro'],
  basilio_intro: ['basilio_observe'], basilio_observe: ['basilio_look_away'],
  basilio_look_away: ['basilio_compare'], basilio_compare: ['basilio_done'], basilio_done: ['carmesi_intro'],
  carmesi_intro: ['carmesi_quiz'], carmesi_quiz: ['carmesi_warning'], carmesi_warning: ['carmesi_leave'],
  carmesi_leave: ['carmesi_done'], carmesi_done: ['faroles_intro'],
  faroles_intro: ['faroles_puzzle'], faroles_puzzle: ['faroles_photos'],
  faroles_photos: ['faroles_rules'], faroles_rules: ['faroles_done'], faroles_done: ['ultima'],
  ultima: ['host_choice'], host_choice: ['host_bells'], host_bells: ['host_reveal'],
  host_reveal: ['host_escape'], host_escape: ['chase'], chase: ['epilogue'], epilogue: ['end'], end: [],
};

export class Progress {
  constructor() {
    this.phase = GamePhase.INTRO;
    this.flags = new Set();
    this.clues = [];
    this.candies = 0;
  }
  transition(next) {
    if (!transitions[this.phase].includes(next)) return false;
    this.phase = next;
    return true;
  }
  addClue(clue) {
    if (this.clues.some(existing => existing.id === clue.id)) return false;
    this.clues.push(clue);
    return true;
  }
  completeBasilio(clues) {
    if (this.phase !== GamePhase.BASILIO_COMPARE || this.flags.has('basilioVisited')) return false;
    clues.forEach(clue => this.addClue(clue));
    this.flags.add('basilioVisited');
    this.transition(GamePhase.BASILIO_DONE);
    return true;
  }
  completeMagnolia(clue) {
    if (this.phase !== GamePhase.MAGNOLIA || this.flags.has('magnoliaVisited')) return false;
    this.flags.add('magnoliaVisited');
    this.candies += 3;
    this.clues.push(clue);
    this.transition(GamePhase.COMPLETE);
    return true;
  }
  completeCarmesi(clue) {
    if (this.phase !== GamePhase.CARMESI_WARNING || this.flags.has('carmesiVisited')) return false;
    this.addClue(clue);
    this.flags.add('carmesiVisited');
    this.transition(GamePhase.CARMESI_LEAVE);
    return true;
  }
  leaveCarmesi(clue) {
    if (this.phase !== GamePhase.CARMESI_LEAVE || !this.flags.has('carmesiVisited')) return false;
    this.flags.add('carmesiLightOut');
    this.addClue(clue);
    this.transition(GamePhase.CARMESI_DONE);
    return true;
  }
  solveFaroles(clue) {
    if (this.phase !== GamePhase.FAROLES_PUZZLE || this.flags.has('farolesSolved')) return false;
    this.flags.add('farolesSolved'); this.addClue(clue);
    this.transition(GamePhase.FAROLES_PHOTOS);
    return true;
  }
  readFarolesPhotos(clue) {
    if (this.phase !== GamePhase.FAROLES_PHOTOS || !this.flags.has('farolesSolved')) return false;
    this.flags.add('farolesPhotosRead'); this.addClue(clue);
    this.transition(GamePhase.FAROLES_RULES);
    return true;
  }
  completeFaroles(clues) {
    if (this.phase !== GamePhase.FAROLES_RULES || !this.flags.has('farolesPhotosRead')) return false;
    clues.forEach(clue => this.addClue(clue));
    this.flags.add('farolesVisited'); this.flags.add('lastHouseUnlocked'); this.flags.add('sidePassageKnown');
    this.transition(GamePhase.FAROLES_DONE);
    return true;
  }
  get objective() {
    const finalObjectives = { ultima: 'Examina la Última Casa · E', host_choice: 'Responde al anfitrión · E', host_bells: 'Las tres campanadas · E',
      host_reveal: 'La fiesta apenas comienza…', host_escape: 'Enciende el porche y deja que Allen abra la salida · E',
      chase: 'Vuelve a casa con Allen · Sigue las flechas', epilogue: 'Los dos de vuelta', end: 'Gracias por jugar' };
    if (finalObjectives[this.phase]) return finalObjectives[this.phase];
    if (this.phase === GamePhase.INTRO) return 'Una casa más antes de volver';
    if (this.phase === GamePhase.MAGNOLIA) return 'Habla con Magnolia';
    if (this.phase === GamePhase.COMPLETE) return this.flags.has('clueRead') ? 'Visita a Don Basilio · Casa 02' : 'Lee la tarjeta en el cuaderno · Tab';
    if (this.phase === GamePhase.BASILIO_INTRO) return 'Habla con Don Basilio';
    if (this.phase === GamePhase.BASILIO_OBSERVE) return 'Observa los dos muñecos · E en Basilio';
    if (this.phase === GamePhase.BASILIO_LOOK_AWAY) return 'Da la espalda al escaparate y camina hacia la calle';
    if (this.phase === GamePhase.BASILIO_COMPARE) return 'Vuelve al escaparate de Basilio · E';
    if (this.phase === GamePhase.BASILIO_DONE) return this.flags.has('basilioCluesRead') ? 'Visita a la señorita Carmesí · Casa 03' : 'Lee las nuevas pistas en el cuaderno · Tab';
    if (this.phase === GamePhase.CARMESI_INTRO) return 'Escucha a la señorita Carmesí';
    if (this.phase === GamePhase.CARMESI_QUIZ) return 'Recuerda las casas anteriores · E en Carmesí';
    if (this.phase === GamePhase.CARMESI_WARNING) return 'Escucha la advertencia de Carmesí';
    if (this.phase === GamePhase.CARMESI_LEAVE) return 'Sal del porche de Carmesí hacia la calle';
    if (this.phase === GamePhase.CARMESI_DONE) return this.flags.has('carmesiCluesRead') ? 'Visita Faroles · Casa 04' : 'Lee lo que Allen anotó al salir · Tab';
    if (this.phase === GamePhase.FAROLES_INTRO) return 'Examina el porche de los Faroles';
    if (this.phase === GamePhase.FAROLES_PUZZLE) return 'Enciende los tres faroles siguiendo el dintel · E';
    if (this.phase === GamePhase.FAROLES_PHOTOS) return 'Examina las fotografías bajo la repisa · E en Faroles';
    if (this.phase === GamePhase.FAROLES_RULES) return 'Lee la nota junto al álbum · E en Faroles';
    if (this.phase === GamePhase.FAROLES_DONE) return this.flags.has('lastHouseAppeared') ? 'Una casa donde no había nada · Acércate con Allen' : 'La calle está cambiando…';
    return 'Toca el timbre de Magnolia';
  }
}
