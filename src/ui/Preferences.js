// Shared markup and wiring for the two preferences the player can change: the voice mode and the
// control scheme. The same block is reused in the first menu, in its options panel and in the pause
// panel, so labels and stored values can never drift apart. Labels are the player-facing names;
// the stored values stay internal: typewriter / retro / recorded and keyboard / touch.
import { VOICE_MODE_CHOICES, preferredVoiceMode, setPreferredVoiceMode } from '../config/voiceMode.js';
import { touchPreferred, setTouchEnabled } from './TouchControls.js';

export function voiceModeControl() {
  const choices = VOICE_MODE_CHOICES.map(choice =>
    `<button type="button" class="pref-choice" data-voice="${choice.mode}" title="${choice.hint}">${choice.label}</button>`).join('');
  return `<div class="setting pref-row"><span class="pref-label">Modo de voz</span><span class="pref-choices">${choices}</span></div>`;
}

export function controlsControl() {
  return `<div class="setting pref-row"><span class="pref-label">Controles</span><span class="pref-choices">
    <button type="button" class="pref-choice" data-controls="keyboard" title="Teclado y ratón">⌨ Teclado</button>
    <button type="button" class="pref-choice" data-controls="touch" title="Palanca y botón en pantalla">✥ Táctil</button></span></div>`;
}

// Marks the choice that is actually in use right now, including the automatic touch detection.
export function paintPreferences(root) {
  const mode = preferredVoiceMode(), touch = touchPreferred();
  for (const button of root.querySelectorAll('[data-voice]')) {
    const on = button.dataset.voice === mode;
    button.classList.toggle('selected', on); button.setAttribute('aria-pressed', String(on));
  }
  for (const button of root.querySelectorAll('[data-controls]')) {
    const on = (button.dataset.controls === 'touch') === touch;
    button.classList.toggle('selected', on); button.setAttribute('aria-pressed', String(on));
  }
}

// `voices` is the shared VoiceController: changing the mode stops whatever was speaking and rebuilds
// the engine, while the dialogue text already on screen stays untouched.
export function wirePreferences(root, voices) {
  for (const button of root.querySelectorAll('[data-voice]')) {
    button.onclick = () => { setPreferredVoiceMode(button.dataset.voice); voices?.setMode(button.dataset.voice); paintPreferences(root); };
  }
  for (const button of root.querySelectorAll('[data-controls]')) {
    button.onclick = () => { setTouchEnabled(button.dataset.controls === 'touch'); paintPreferences(root); };
  }
  paintPreferences(root);
}
