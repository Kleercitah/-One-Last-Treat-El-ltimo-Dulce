import Phaser from 'phaser';
import { drawStreet } from '../assets/drawStreet.js';
import { Character } from '../entities/Character.js';
import { FamilyHouse } from '../entities/FamilyHouse.js';
import { getMusic } from '../audio/MusicManager.js';
import { getVoices } from '../audio/VoiceController.js';
import { controlsControl, voiceModeControl, wirePreferences } from '../ui/Preferences.js';
import { toggleFullscreen } from '../ui/Viewport.js';
import { showCredits } from '../ui/Credits.js';

export class MenuScene extends Phaser.Scene {
  constructor() { super('Menu'); }
  create() {
    drawStreet(this);
    new FamilyHouse(this); this.music=getMusic(this.game); this.music.select('Menu','musica1.mp3',.55);
    getVoices(this.game).stop();
    this.cameras.main.setScroll(-120, 5);
    this.add.rectangle(0, 0, 960, 540, 0x171b2b, 0.38).setOrigin(0).setScrollFactor(0).setDepth(1000);
    new Character(this, 550, 460, 'riliane').setDepth(1001).setScale(2.5);
    new Character(this, 495, 466, 'allen').setDepth(1001).setScale(2.5);
    const ui = document.querySelector('#ui'); this.menuRoot = ui;
    this.renderMenu();
    const onKey = event => {
      if (event.code === 'Enter' && event.target === document.body && ui.querySelector('#start-game')) { event.preventDefault(); this.scene.start('Street'); }
    };
    window.addEventListener('keydown', onKey);
    this.events.once('shutdown', () => { window.removeEventListener('keydown', onKey); ui.replaceChildren(); });
  }
  renderMenu() {
    const ui = this.menuRoot;
    ui.classList.remove('touch-ui');
    ui.innerHTML = `<div class="menu-shade"></div><section class="menu-screen">
      <span class="eyebrow">EL ÚLTIMO DULCE</span>
      <h1>One Last<br><em>Treat</em><span class="title-star" aria-hidden="true">✧</span></h1>
      <p>Solo una casa más.<br>Luego volvemos a casa. Lo prometo.</p>
      <button id="start-game" class="primary-button">Empezar la noche <span>↗</span></button>
      <nav class="menu-actions"><button id="menu-options" class="text-button">Opciones</button><button id="menu-credits" class="text-button">Créditos</button><button id="menu-fullscreen" class="text-button">Pantalla completa</button></nav>
      <button id="enable-music" class="text-button">♫ Escuchar la noche</button>
      <div class="menu-prefs">${voiceModeControl()}${controlsControl()}</div>
      <div class="menu-keys"><kbd>W A S D</kbd> Caminar <span>·</span> <kbd>E</kbd> Interactuar</div>
    </section><div class="menu-caption"><span class="tiny-line"></span>01 / MAGNOLIA<small>Una luz encendida. Un olor a galletas.</small></div>
    <div class="prototype-label">31 DE OCTUBRE <span>Antes de medianoche</span></div>`;
    wirePreferences(ui, getVoices(this.game));
    const begin = () => { ui.replaceChildren(); this.scene.start('Street'); };
    ui.querySelector('#start-game').onclick = begin;
    ui.querySelector('#enable-music').onclick=()=>{this.music.unlock(); ui.querySelector('#enable-music').textContent='♫ La noche te espera';};
    ui.querySelector('#menu-credits').onclick = () => showCredits(ui, { menu: () => this.renderMenu(), newGame: begin });
    ui.querySelector('#menu-options').onclick = () => this.showOptions();
    ui.querySelector('#menu-fullscreen').onclick = async e => { if (!await toggleFullscreen()) e.target.textContent = 'Vista ajustada a la pantalla'; };
  }
  showOptions() {
    const overlay = document.createElement('div'); overlay.className = 'modal';
    overlay.innerHTML = `<section class="panel pause-panel"><h2>Antes de salir</h2><p>Sonidos inquietantes y escenas de tensión.</p>
      <label class="setting">Volumen de efectos <input id="menu-effects" type="range" min="0" max="1" step="0.05" value="${this.registry.get('effectsVolume') ?? .35}"></label>
      <label class="setting">Volumen de música <input id="menu-music" type="range" min="0" max="1" step="0.05" value="${this.music.volume}"></label>
      ${voiceModeControl()}
      ${controlsControl()}
      <label class="setting">Reducir movimiento y efectos <input id="menu-reduce" type="checkbox" ${(this.registry.get('reducedMotion') ?? matchMedia('(prefers-reduced-motion: reduce)').matches) ? 'checked' : ''}></label>
      <button class="primary-button">Volver</button></section>`;
    this.menuRoot.append(overlay);
    wirePreferences(overlay, getVoices(this.game));
    overlay.querySelector('#menu-effects').oninput = e => this.registry.set('effectsVolume', Number(e.target.value));
    overlay.querySelector('#menu-music').oninput = e => { this.music.volume = Number(e.target.value); this.music.unlock(); };
    overlay.querySelector('#menu-reduce').onchange = e => { this.registry.set('reducedMotion', e.target.checked); this.registry.set('reducedEffects', e.target.checked); };
    overlay.querySelector('.primary-button').onclick = () => overlay.remove();
  }
  update(time,delta) { this.music?.update(delta,document.hidden); }
}
