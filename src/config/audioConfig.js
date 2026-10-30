// Internal build setting only. Keep the original typewriter permanently available.
// 'recorded' -> pre-generated Fish Audio MP3s (falls back to the letter sound when a clip is absent).
// 'retro'   -> meSpeak synthesis in the browser.  'typewriter' -> letter sound only.
export const AUDIO_CONFIG = Object.freeze({
  dialogueVoiceMode: 'recorded', // Exactly 'recorded', 'retro' or 'typewriter'. Rebuild after editing.
});

export const VOICE_MODES = Object.freeze(['recorded', 'retro', 'typewriter']);

export function validateVoiceMode(mode) {
  if (!VOICE_MODES.includes(mode)) throw new Error(`Invalid dialogueVoiceMode: ${mode}`);
  return mode;
}
