import { houses } from '../data/houses.js';
import { Typewriter } from '../systems/Typewriter.js';
import { spokenParts } from '../audio/VoiceController.js';
import { controlsControl, voiceModeControl, wirePreferences } from './Preferences.js';
import { toggleFullscreen } from './Viewport.js';

const faces = { Riliane: ['R', 'princess'], Allen: ['A', 'knight'], Magnolia: ['M', 'grandma'], 'Don Basilio': ['B', 'knight'], Muñeco: ['?', 'knight'], 'Señorita Carmesí': ['C', 'carmesi'] };

export class GameUI {
  constructor(actions) {
    this.root = document.querySelector('#ui');
    this.actions = actions;
    this.voice = actions.voice;
    this.writer = new Typewriter(); this.textTime = 0;
    this.root.innerHTML = `
      <div class="hud">
        <div class="chapter"><span class="eyebrow">31 DE OCTUBRE <span class="small-dot">·</span> LA CALLE</span><h1>Una casa más</h1><p id="objective"></p></div>
        <div class="inventory"><div class="candy-icon" aria-hidden="true">◆</div><span><b id="candy-count">0</b><small>CARAMELOS</small></span><button id="notebook-button" class="icon-button" aria-label="Abrir cuaderno de Allen">▤</button><button id="pause-button" class="icon-button" aria-label="Opciones y pausa">Ⅱ</button></div>
      </div>
      <div class="location-tag"><span>01</span><div>LA CALLE DE HALLOWEEN<small>Antes de medianoche</small></div></div>
      <div id="interaction" hidden></div>
      <div class="controls-strip"><span><kbd>W A S D</kbd> / <kbd>↑ ← ↓ →</kbd> Caminar</span><span><kbd>E</kbd> Interactuar</span><span><kbd>Tab</kbd> Cuaderno</span><span><kbd>Esc</kbd> Pausa</span></div>
      <div id="toast" role="status" hidden></div>
      <section id="dialogue" class="dialogue" role="dialog" aria-label="Conversación" hidden>
        <div id="portrait" class="portrait"></div><div class="dialogue-copy"><div class="dialogue-heading"><strong id="speaker"></strong><span id="line-number"></span></div><p id="dialogue-text"></p><button id="continue-dialogue" class="text-button">Continuar <kbd>E</kbd><span aria-hidden="true">→</span></button></div>
      </section>
      <div id="modal" class="modal" hidden></div>`;
    this.byId('notebook-button').onclick = actions.notebook;
    this.byId('pause-button').onclick = actions.pause;
    this.byId('continue-dialogue').onclick = actions.advance;
  }
  byId(id) { return this.root.querySelector(`#${id}`); }
  updateProgress(progress) {
    this.byId('objective').textContent = progress.objective;
    this.byId('candy-count').textContent = progress.candies;
  }
  dialogue(line, index, total) {
    const element = this.byId('dialogue');
    element.hidden = !line;
    this.audio?.stopText(); this.writer.reset(line?.text || '');
    this.voice?.stop();
    if (line) this.voice?.play([line], { blocking: true, priority: 80 });
    if (!line) return;
    const [letter, style] = faces[line.speaker] || ['?', 'grandma'];
    this.byId('portrait').className = `portrait ${style}`;
    this.byId('portrait').textContent = letter;
    this.byId('speaker').textContent = line.speaker;
    this.byId('line-number').textContent = `${String(index).padStart(2, '0')} / ${String(total).padStart(2, '0')}`;
    this.speaker = line.speaker;
    this.paintText();
  }
  paintText() {
    const text = this.byId('dialogue-text'); if (!text) return;
    text.textContent = this.writer.visible; text.dataset.typing = String(this.writer.typing);
  }
  revealDialogue() {
    if (!this.writer.typing) return false;
    this.writer.reveal(); this.audio?.stopText(); this.paintText(); return true;
  }
  updateText(delta, audio, paused = false) {
    this.audio = audio;
    if (paused) { audio.stopText(); return; }
    this.textTime += delta;
    const added = this.writer.tick(delta);
    if (added) { this.paintText(); const letter = [...added].find(c => /[\p{L}\p{N}]/u.test(c)); if (letter && !this.voice?.suppressBlips) audio.blip(letter, this.speaker, this.textTime); }
  }
  interaction(house, visited, lastHouseUnlocked = false) {
    const signature = `${house?.id || ''}:${visited}:${lastHouseUnlocked}`;
    if (this.interactionSignature === signature) return;
    this.interactionSignature = signature;
    const element = this.byId('interaction');
    element.hidden = !house;
    if (!house) return;
    element.replaceChildren();
    const key = document.createElement('kbd'); key.textContent = 'E';
    const text = document.createElement('span');
    text.textContent = ['magnolia', 'basilio', 'carmesi'].includes(house.id) ? `${visited ? 'Hablar con' : 'Tocar el timbre de'} ${house.name}` : house.name;
    if (house.id === 'faroles') text.textContent = 'Examinar el porche de los Faroles';
    if (house.id === 'ultima' && lastHouseUnlocked) text.textContent = 'Examinar la Última Casa';
    element.append(key, text);
  }
  showNotebook(progress) {
    this.voice?.update(0, true);
    const modal = this.byId('modal');
    modal.hidden = false;
    modal.innerHTML = `<section class="notebook panel" role="dialog" aria-modal="true" aria-labelledby="notebook-title">
      <div class="panel-top"><span class="eyebrow">APUNTES DE ALLEN AVADONIA</span><button class="close-button" aria-label="Cerrar cuaderno">×</button></div>
      <h2 id="notebook-title">El camino de vuelta</h2><p class="panel-intro">Para que una casa más no sea una casa de más.</p>
      <ol class="house-map">${houses.filter(h => h.id !== 'ultima' || progress.flags.has('lastHouseAppeared')).map(h => `<li class="${progress.flags.has(`${h.id}Visited`) ? 'visited' : ''}"><span class="map-house" aria-hidden="true"></span><b>${h.number}</b><small>${h.name}</small></li>`).join('')}</ol>
      <div class="notebook-entry"><span class="entry-label">${progress.clues.length ? 'PISTA 01 · MAGNOLIA' : 'NUESTRA PRIMERA PARADA'}</span><h3></h3><p></p></div>
      <nav class="notebook-pager" aria-label="Páginas de pistas"><button id="previous-clue" class="text-button">← Anterior</button><span id="clue-page"></span><button id="next-clue" class="text-button">Siguiente →</button></nav>
      <div class="notebook-bottom"><span>${progress.flags.has('farolesVisited') ? '✓ Faroles visitada · Última Casa desbloqueada' : progress.flags.has('carmesiLightOut') ? '✓ Carmesí visitada · Siguiente parada: Faroles' : progress.flags.has('carmesiVisited') ? '✓ Carmesí visitada · Volvamos a la calle' : progress.flags.has('basilioVisited') ? '✓ Basilio visitado · Siguiente parada: Carmesí' : progress.clues.length ? '✓ Magnolia visitada · Siguiente parada: Basilio' : 'Todavía no hay pistas. Busquemos una puerta iluminada.'}</span><button class="text-button close-notebook">Volver a la calle <kbd>Tab</kbd></button></div>
      </section>`;
    modal.querySelector('h3').textContent = progress.clues[0]?.title || 'La casa de Magnolia';
    modal.querySelector('.notebook-entry p').textContent = progress.clues[0]?.text || 'Mamá dijo que volviéramos antes de medianoche. Riliane quiere empezar por Magnolia: su porche está encendido y huele a galletas.';
    modal.querySelector('.close-button').onclick = this.actions.closeModal;
    modal.querySelector('.close-notebook').onclick = this.actions.closeModal;
    this.notebookProgress = progress;
    this.notebookIndex = Math.max(0, progress.clues.length - 1);
    modal.querySelector('#previous-clue').onclick = () => this.turnNotebookPage(-1);
    modal.querySelector('#next-clue').onclick = () => this.turnNotebookPage(1);
    this.turnNotebookPage(0);
  }
  turnNotebookPage(delta) {
    const clues = this.notebookProgress.clues;
    this.notebookIndex = Math.max(0, Math.min(Math.max(0, clues.length - 1), this.notebookIndex + delta));
    const clue = clues[this.notebookIndex];
    const entry = this.root.querySelector('.notebook-entry');
    if (clue) {
      entry.querySelector('.entry-label').textContent = `PISTA ${String(this.notebookIndex + 1).padStart(2, '0')} · ${clue.house || 'Magnolia'}`;
      entry.querySelector('h3').textContent = clue.title;
      entry.querySelector('p').textContent = clue.text;
    }
    entry.querySelector('.lamp-sketch')?.remove();
    if (clue?.kind === 'lamps') {
      const sketch = document.createElement('div'); sketch.className = 'lamp-sketch';
      sketch.setAttribute('role', 'img'); sketch.setAttribute('aria-label', 'Dibujo de farolas a lo largo de la calle. Magnolia y Basilio marcadas.');
      // Simple ink-like lamp silhouettes; not a revealed protection rule or route solution.
      sketch.innerHTML = houses.filter(h => h.id !== 'ultima' || this.notebookProgress.flags.has('lastHouseAppeared')).map(h => `<span><i aria-hidden="true"></i><small>${h.number}${['magnolia', 'basilio'].includes(h.id) ? ' ✓' : ''}</small></span>`).join('');
      entry.append(sketch);
    }
    this.byId('clue-page').textContent = clues.length ? `${this.notebookIndex + 1} / ${clues.length} · Teclas ← →` : 'Sin pistas todavía';
    this.byId('previous-clue').disabled = this.notebookIndex === 0;
    this.byId('next-clue').disabled = this.notebookIndex >= clues.length - 1;
  }
  showDolls({ comparing, princess, knight, onObserve, onAnswer }) {
    const modal = this.byId('modal'); modal.hidden = false;
    modal.innerHTML = `<section class="dolls-panel panel" role="dialog" aria-modal="true" aria-labelledby="dolls-title">
      <div class="panel-top"><span class="eyebrow">EL TALLER DE DON BASILIO</span><button class="close-button" aria-label="Cerrar escaparate">×</button></div>
      <h2 id="dolls-title">${comparing ? 'Algo ha cambiado.' : 'Se parecen a nosotros.'}</h2>
      <p>${comparing ? '¿Cuál de los dos muñecos ha cambiado? Compara con el dibujo de Allen en el cuaderno.' : 'Fíjate en las caras y la posición de los dos muñecos. Allen dibujará lo que ves.'}</p>
      <div class="doll-shelf"><figure><img src="${princess}" alt="Muñeca de princesa mirando de frente"><figcaption>1 · La princesa</figcaption></figure><figure><img src="${knight}" alt="Muñeco de caballero ${comparing ? 'de espaldas' : 'mirando de frente'}"><figcaption>2 · El caballero</figcaption></figure></div>
      <p id="doll-feedback" role="status">${comparing ? 'El cambio permanece visible. Puedes salir con Esc para consultar tus notas.' : 'Los dos miran hacia ti. Cuando estés listo, sal y camina hacia abajo, hasta la calle.'}</p>
      <div class="doll-actions">${comparing ? '<button data-answer="riliane">1 · La princesa</button><button data-answer="allen">2 · El caballero</button><button data-answer="neither">3 · Ninguno</button>' : '<button id="observe-dolls" class="primary-button">Guardar el dibujo y salir <kbd>E</kbd></button>'}</div>
      <small>Esc: volver a la calle · El juego espera mientras observas.</small>
    </section>`;
    modal.querySelector('.close-button').onclick = this.actions.closeModal;
    if (comparing) modal.querySelectorAll('[data-answer]').forEach(button => { button.onclick = () => onAnswer(button.dataset.answer); });
    else modal.querySelector('#observe-dolls').onclick = onObserve;
  }
  dollFeedback(text) {
    this.byId('doll-feedback').textContent = text;
    this.speakFeedback(text);
  }
  showRecallQuestion({ question, index, total, feedback, onAnswer }) {
    const modal = this.byId('modal'); modal.hidden = false;
    modal.innerHTML = `<section class="dolls-panel carmesi-panel panel" role="dialog" aria-modal="true" aria-labelledby="recall-title">
      <div class="panel-top"><span class="eyebrow">TRAS LAS CORTINAS ROJAS · <span id="recall-count"></span></span><button class="close-button" aria-label="Cerrar preguntas">×</button></div>
      <h2 id="recall-title">Tres recuerdos</h2><p id="recall-question"></p>
      <div class="doll-actions recall-actions"></div><p id="recall-feedback" role="status"></p>
      <small>1 / 2 / 3: responder · Esc: salir · Consulta el cuaderno con Tab desde la calle.</small>
    </section>`;
    this.byId('recall-count').textContent = `${index + 1} / ${total}`;
    this.byId('recall-question').textContent = question.text;
    this.recallFeedback(feedback);
    this.voice?.play([...spokenParts(feedback), { speaker: 'Señorita Carmesí', text: question.text }], { priority: 40, ttl: 16000 });
    question.options.forEach((option, i) => {
      const button = document.createElement('button');
      button.textContent = `${i + 1} · ${option.label}`;
      button.onclick = () => onAnswer(option.id);
      modal.querySelector('.recall-actions').append(button);
    });
    modal.querySelector('.close-button').onclick = this.actions.closeModal;
  }
  recallFeedback(text) { this.byId('recall-feedback').textContent = text; this.speakFeedback(text, 40); }
  showPause(audio, reducedMotion) {
    this.voice?.update(0, true);
    const modal = this.byId('modal');
    modal.hidden = false;
    modal.innerHTML = `<section class="pause-panel panel" role="dialog" aria-modal="true" aria-labelledby="pause-title">
      <span class="eyebrow">UN MOMENTO BAJO LA LUZ</span><h2 id="pause-title">La noche puede esperar.</h2>
      <p>La partida está en pausa.</p>
      <label class="setting">Volumen de efectos <input id="volume" aria-label="Volumen de efectos" type="range" min="0" max="1" step="0.05" value="${audio.volume}"></label>
      ${this.actions.music ? `<label class="setting">Volumen de música <input id="music-volume" aria-label="Volumen de música" type="range" min="0" max="1" step="0.05" value="${this.actions.music.volume}"></label>` : ''}
      <label class="setting">Silenciar la noche <input id="mute-sounds" aria-label="Silenciar efectos y música" type="checkbox" ${audio.volume <= 0 && (this.actions.music?.volume ?? 0) <= 0 ? 'checked' : ''}></label>
      <label class="setting">Reducir movimiento <input id="reduced-motion" type="checkbox" ${reducedMotion ? 'checked' : ''}></label>
      ${this.actions.intensity ? `<label class="setting">Reducir efectos intensos <input id="reduced-effects" type="checkbox" ${this.actions.intensity() ? 'checked' : ''}></label>` : ''}
      ${voiceModeControl()}${controlsControl()}
      <button id="fullscreen-pause" class="text-button">Pantalla completa</button>
      <button id="resume" class="primary-button">Seguir explorando <span>↗</span></button><button id="return-menu" class="text-button">Volver al menú y reiniciar</button>
      <small>El avance se conserva durante esta partida.</small>
      </section>`;
    wirePreferences(modal, this.voice);
    const volume = modal.querySelector('#volume'), music = modal.querySelector('#music-volume'), mute = modal.querySelector('#mute-sounds');
    const levels = { effects: audio.volume || .35, music: this.actions.music?.volume || .45 };
    const paintVolumes = () => { volume.value = String(audio.volume); if (music) music.value = String(this.actions.music.volume); };
    mute.onchange = e => {
      audio.volume = e.target.checked ? 0 : levels.effects;
      if (this.actions.music) this.actions.music.volume = e.target.checked ? 0 : levels.music;
      paintVolumes(); this.actions.settings();
    };
    volume.oninput = e => { audio.volume = Number(e.target.value); if (mute.checked && audio.volume > 0) mute.checked = false; this.actions.settings(); };
    modal.querySelector('#reduced-motion').onchange = e => this.actions.reduceMotion(e.target.checked);
    if (music) music.oninput = e => { this.actions.music.volume = Number(e.target.value); if (mute.checked && this.actions.music.volume > 0) mute.checked = false; };
    const intensity = modal.querySelector('#reduced-effects'); if (intensity) intensity.onchange = e => this.actions.intensity(e.target.checked);
    modal.querySelector('#resume').onclick = this.actions.closeModal;
    modal.querySelector('#return-menu').onclick = this.actions.menu;
    modal.querySelector('#fullscreen-pause').onclick = async e => { if (!await toggleFullscreen()) e.target.textContent = 'Vista ajustada a la pantalla'; };
  }
  closeModal() {
    if (!this.voice?.paused && !this.voice?.current?.blocking) this.voice?.stop();
    this.byId('modal').hidden = true; this.byId('modal').replaceChildren();
  }
  speakFeedback(text, priority = 20, ttl = 8000) {
    if (!this.voice?.paused) this.voice?.play(spokenParts(text), { priority, ttl });
  }
  toast(text) {
    this.speakFeedback(text, 10, 4500);
    const element = this.byId('toast');
    element.textContent = text;
    element.hidden = false;
    clearTimeout(this.toastTimer);
    this.toastTimer = setTimeout(() => { element.hidden = true; }, 4500);
  }
  destroy() { clearTimeout(this.toastTimer); this.voice?.stop(); this.audio?.stopText(); this.writer.reset(''); this.root.replaceChildren(); }
}
