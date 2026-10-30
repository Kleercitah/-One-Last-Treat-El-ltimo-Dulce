import { lanterns, lanternRiddle, hostRules } from '../data/faroles.js';
import { symbolSvg, porchArt, photoSvg } from '../assets/farolesArt.js';

export class FarolesPanel {
  constructor(ui, actions) { this.ui = ui; this.actions = actions; }
  shell(title, content, reducedMotion = false) {
    const modal = this.ui.byId('modal'); modal.hidden = false;
    modal.innerHTML = `<section class="faroles-panel panel ${reducedMotion ? 'is-still' : ''}" role="dialog" aria-modal="true" aria-labelledby="faroles-title">
      <div class="panel-top"><span class="eyebrow">04 · CASA DE LOS FAROLES</span><div><button class="faroles-pause" aria-label="Pausar el porche">Ⅱ</button><button class="close-button" aria-label="Salir del porche">×</button></div></div>
      <h2 id="faroles-title">${title}</h2>${content}
      <small class="faroles-help">Esc: volver a la calle · P: pausa · Consulta el cuaderno con Tab desde la calle.</small></section>`;
    modal.querySelector('.close-button').onclick = this.actions.close;
    modal.querySelector('.faroles-pause').onclick = this.actions.pause;
    return modal;
  }
  porch({ lit, solved, settled, photosRead, reducedMotion, feedback }) {
    const modal = this.shell('La casa respira', `
      <div class="faroles-room" style="--breath-duration:${6 - lit.length * 0.5}s">${porchArt}
        <div class="porch-lanterns">${lanterns.map(l => `<button class="porch-lantern ${lit.includes(l.id) ? 'is-lit' : ''}" data-lantern="${l.id}" aria-pressed="${lit.includes(l.id)}" aria-label="Farol ${l.name}"><span class="lantern-glass">${symbolSvg(l.id)}</span><b>${l.key} · ${l.name}</b><small>${lit.includes(l.id) ? 'Encendido' : 'Apagado'}</small></button>`).join('')}</div>
      </div><div class="porch-inscription"><span class="eyebrow">NOTA JUNTO AL DINTEL</span><p>${lanternRiddle}</p></div>
      <p id="faroles-feedback" role="status"></p>
      <div class="faroles-discoveries"><button id="faroles-photos" ${solved && settled ? '' : 'disabled'}>4 · Examinar fotografías</button><button id="faroles-rules" ${photosRead ? '' : 'disabled'}>5 · Leer la nota y el plano</button><span id="lantern-count">${lit.length} / 3 faroles</span></div>`, reducedMotion);
    modal.querySelectorAll('[data-lantern]').forEach(button => { button.onclick = () => this.actions.activate(button.dataset.lantern); });
    modal.querySelector('#faroles-photos').onclick = this.actions.photos;
    modal.querySelector('#faroles-rules').onclick = this.actions.rules;
    this.feedback(feedback);
  }
  feedback(text) { this.ui.byId('faroles-feedback').textContent = text; this.ui.speakFeedback(text); }
  breathe(wave, scale, chair, settled, reduced) {
    const art=this.ui.root.querySelector('.porch-art'); if (!art) return;
    art.style.transform=`scale(${reduced ? 1 : scale})`; art.style.transformOrigin='50% 100%';
    const windows=art.querySelector('.breathing-windows'); if (windows) { windows.style.animation='none'; windows.style.opacity=String(settled?.12:reduced?.25:.15+wave*.8); }
    const rocking=art.querySelector('.rocking-chair'); if (rocking) { rocking.style.animation='none'; rocking.style.transform=`rotate(${reduced?0:chair*180/Math.PI}deg)`; }
    const button=this.ui.byId('faroles-photos'); if (button && settled) button.disabled=false;
  }
  photos(reducedMotion) {
    const modal = this.shell('El mismo hombre. Tres épocas.', `
      <p class="faroles-intro">Un álbum escondido bajo la repisa. Las fechas son distintas; el sombrero, los guantes y la sonrisa no cambian.</p>
      <div class="old-photos">${[1912, 1956, 1998].map((year, i) => `<figure><img src="${photoSvg(year, i)}" alt="Fiesta de Halloween de ${year}: el mismo hombre alto con traje de gala, sombrero de copa, guantes blancos y sonrisa fija"><figcaption>${year}</figcaption></figure>`).join('')}</div>
      <p class="album-caption">Al pie del álbum: «Nuestro anfitrión: el Señor Sonrisas».</p>
      <button id="faroles-continue" class="primary-button">Comentar las fotografías <kbd>E</kbd></button>`, reducedMotion);
    modal.querySelector('#faroles-continue').onclick = this.actions.finishPhotos;
  }
  rules(reducedMotion) {
    const modal = this.shell('Para los que quieran volver', `
      <div class="host-note"><span class="eyebrow">HOJA DOBLADA DENTRO DEL ÁLBUM</span><ol>${hostRules.map(rule => `<li>${rule}</li>`).join('')}</ol>
      <div class="side-map" role="img" aria-label="Plano: Casa de los Faroles, paso lateral, portón de casa"><span>FAROLES</span><span>┄ Paso lateral ┄</span><span>NUESTRO PORTÓN</span></div><p>Una anotación señala un paso lateral hacia casa. Allen puede copiarlo para reconocerlo después.</p></div>
      <button id="faroles-continue" class="primary-button">Guardar la nota y el plano <kbd>E</kbd></button>`, reducedMotion);
    modal.querySelector('#faroles-continue').onclick = this.actions.finishRules;
  }
}
