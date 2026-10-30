// The player's voice-mode choice. Labels are what someone reads on screen; the stored value is the
// internal one, so the two can be worded freely without renaming anything in the audio layer.
import { AUDIO_CONFIG, VOICE_MODES, validateVoiceMode } from './audioConfig.js';

export const VOICE_MODE_CHOICES = Object.freeze([
  { mode: 'typewriter', label: 'Clásico', hint: 'Solo el sonido de las letras' },
  { mode: 'retro', label: '8 bits', hint: 'Voz sintetizada en el navegador' },
  { mode: 'recorded', label: 'Hablado', hint: 'Voces grabadas de la historia' },
]);

const STORAGE_KEY = 'olt-voice-mode';

// Stored preference when the browser allows it; audioConfig.js stays the build default in code.
export function preferredVoiceMode() {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (VOICE_MODES.includes(stored)) return stored;
  } catch { /* Private mode or blocked storage: the build default still applies. */ }
  return validateVoiceMode(AUDIO_CONFIG.dialogueVoiceMode);
}

export function setPreferredVoiceMode(mode) {
  validateVoiceMode(mode);
  try { localStorage.setItem(STORAGE_KEY, mode); } catch { /* Preference is optional. */ }
  window.dispatchEvent(new Event('olt-voice-mode-change'));
  return mode;
}
