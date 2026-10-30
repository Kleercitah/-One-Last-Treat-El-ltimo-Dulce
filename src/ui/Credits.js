import { credits } from '../data/finale.js';
import { CREDITS_CONFIG } from '../config/creditsConfig.js';

export function showCredits(root, { menu, newGame }) {
  root.innerHTML = `<section class="credits-screen"><span class="eyebrow">HASTA EL PRÓXIMO HALLOWEEN</span><h1>One Last <em>Treat</em></h1><dl>${credits.map(([role, name]) => `<div><dt>${role}</dt><dd>${name}</dd></div>`).join('')}<div><dt>Voces sintetizadas</dt><dd>meSpeak.js · Norbert Landsteiner / eSpeak · GPL v3</dd></div></dl><div class="final-actions"><button id="dedication-next" class="primary-button">Para Allen →</button></div></section>`;
  root.querySelector('#dedication-next').onclick = () => showDedication(root, { menu, newGame });
}
export function showDedication(root, { menu, newGame }) {
  root.innerHTML = '<section class="credits-screen dedication-screen"><h2></h2><p></p><div class="dedication-image" hidden></div><div class="final-actions"><button id="credits-menu" class="primary-button">Volver al menú principal</button><button id="new-night" class="text-button">Comenzar una nueva partida</button></div></section>';
  root.querySelector('h2').textContent = CREDITS_CONFIG.dedication; root.querySelector('p').textContent = CREDITS_CONFIG.thanks;
  root.querySelector('#credits-menu').onclick = menu; root.querySelector('#new-night').onclick = newGame;
  const holder = root.querySelector('.dedication-image');
  fetch(`${import.meta.env.BASE_URL}credits-manifest.json`).then(r => r.ok ? r.json() : {}).then(data => {
    if (!data.image || !holder.isConnected) return;
    const img = new Image(); img.alt = 'Dedicatoria para Allen';
    img.onload = () => { if (holder.isConnected) { holder.hidden = false; holder.append(img); } };
    img.src = `${import.meta.env.BASE_URL}${CREDITS_CONFIG.image}`;
  }).catch(() => {});
}
