import { bellSymbols, bellHint } from '../data/finale.js';
import { hostSvg, manorSvg } from '../assets/finalArt.js';

export class FinalPanel {
  constructor(ui, action) { this.ui = ui; this.action = action; }
  show(view, puzzle, feedback, reduced) {
    const titles = { porch: 'Una invitación demasiado perfecta', opening: 'La puerta se abre…', choice: 'Dos caramelos. Una invitación.', bells: 'Las tres campanadas', transform: 'La fiesta apenas comienza', escape: 'La luz todavía puede protegernos' };
    const modal = this.ui.byId('modal'); modal.hidden = false;
    const buttons = view === 'porch' ? ['Examinar la alfombra', 'Mirar las calabazas', 'Tocar el timbre']
      : view === 'choice' ? ['Intentar aceptar el Caramelo de Oro', 'Rechazarlo amablemente', 'Preguntar por nuestros nombres']
      : view === 'bells' ? bellSymbols : view === 'escape' ? ['Encender el porche'] : [];
    modal.innerHTML = `<section class="final-panel panel ${reduced ? 'is-still' : ''} ${view === 'transform' ? 'transforming' : ''} ${view === 'opening' ? 'opening-door' : ''}" role="dialog" aria-modal="true" aria-label="Última Casa">
      <div class="panel-top"><span class="eyebrow">05 · LA ÚLTIMA FUNCIÓN</span><div><button data-pause aria-label="Pausar la función">Ⅱ</button><button data-close aria-label="Cerrar la función">×</button></div></div>
      <h2>${titles[view]}</h2>
      ${view === 'porch' || view === 'opening' ? `<div class="manor-art">${manorSvg}</div><p class="prize-sign">¡FELICIDADES, PEQUEÑOS INVITADOS! ¡HAN GANADO EL CARAMELO DE ORO!</p>` : `<div class="host-stage"><div class="host-figure">${hostSvg(view === 'escape' || view === 'transform')}</div><div class="host-table">${view === 'choice' ? '<div class="candy-tray"><span>◆<small>Caramelo normal</small></span><span class="gold-candy">◆<small>Caramelo de Oro</small></span></div><p>Allen mantiene una mano cerca de la tuya. Aún no has aceptado nada.</p>' : `<div class="bell-frieze" aria-label="Friso: vela, calabaza, luna"><span>♜<small>Vela · Umbral</small></span><b>→</b><span>◉<small>Calabaza · Invitados</small></span><b>→</b><span>☾<small>Luna · Despedida</small></span></div><p>${bellHint}</p>`}</div></div>`}
      <div class="final-actions">${buttons.map((b, i) => `<button data-final="${i}" ${view === 'bells' ? `aria-pressed="${puzzle.lit.includes(b)}"` : ''}>${i + 1} · ${b}${view === 'bells' && puzzle.lit.includes(b) ? ' ✓' : ''}</button>`).join('')}</div>
      <p id="final-feedback" role="status"></p><small>${view === 'porch' ? 'E: tocar el timbre · ' : ''}1 / 2 / 3: elegir · Esc: ${['opening', 'transform', 'escape'].includes(view) ? 'pausa' : 'volver a la calle'} · P: pausa</small>
    </section>`;
    modal.querySelector('#final-feedback').textContent = feedback || '';
    this.ui.speakFeedback(feedback, 40);
    modal.querySelectorAll('[data-final]').forEach(b => b.onclick = () => this.action.choose(Number(b.dataset.final)));
    modal.querySelector('[data-pause]').onclick = this.action.pause;
    modal.querySelector('[data-close]').onclick = this.action.close;
  }
}
