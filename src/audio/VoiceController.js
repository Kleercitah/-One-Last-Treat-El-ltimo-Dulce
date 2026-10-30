import { validateVoiceMode } from '../config/audioConfig.js';
import { preferredVoiceMode } from '../config/voiceMode.js';
import { RetroEngine } from './RetroEngine.js';
import { RecordedEngine } from './RecordedEngine.js';

// These are eSpeak pitch/speed/variant controls, not actors or cloned identities.
export const VOICE_PROFILES = Object.freeze({
  Riliane: { pitch: 72, speed: 185, variant: 'f2' },
  Allen: { pitch: 53, speed: 165, variant: 'm3' },
  Magnolia: { pitch: 48, speed: 138, variant: 'f5', wordgap: 1 },
  'Don Basilio': { pitch: 61, speed: 157, variant: 'm2' },
  'Señorita Carmesí': { pitch: 32, speed: 135, variant: 'f1', wordgap: 1 },
  'Señor Sonrisas': { pitch: 36, speed: 162, variant: 'm4', wordgap: 1 },
  Mamá: { pitch: 54, speed: 153, variant: 'f2' },
  Muñeco: { pitch: 64, speed: 139, variant: 'm2' },
});

// Only named, quoted speech in existing feedback. Never read surrounding controls or narration.
export function spokenParts(text = '') {
  const parts = [];
  const names = Object.keys(VOICE_PROFILES).join('|');
  const pattern = new RegExp(`(Riliane y Allen|${names})(?: levanta el pestillo)?: «([^»]+)»`, 'gu');
  for (const match of text.matchAll(pattern)) {
    for (const speaker of match[1] === 'Riliane y Allen' ? ['Riliane', 'Allen'] : [match[1]]) parts.push({ speaker, text: match[2] });
  }
  return parts;
}

export class VoiceController {
  constructor({ mode = preferredVoiceMode(), engine } = {}) {
    this.token = 0; this.current = null; this.paused = false; this.starts = 0; this.cache = new Map();
    this.configure(validateVoiceMode(mode), engine);
  }
  // Builds the engine a mode needs and starts its lazy load. Every mode change goes through here, so
  // the old engine is left behind instead of blending two voice systems in the same line.
  configure(mode, engine) {
    this.mode = mode;
    this.engine = engine || (mode === 'recorded' ? new RecordedEngine() : mode === 'retro' ? new RetroEngine() : null);
    this.status = mode === 'typewriter' ? 'disabled' : 'loading';
    this.cache.clear(); // Buffers are engine-specific and must not survive a change of mode.
    this.ready = mode === 'typewriter' ? Promise.resolve() : Promise.resolve().then(() => this.engine.load()).then(() => { this.status = 'ready'; }).catch(() => this.fail());
  }
  // Called when the player picks another mode. The line that was playing is stopped first, never
  // finished off on top of the new one, and the dialogue text stays on screen either way.
  setMode(mode, engine) {
    const next = validateVoiceMode(mode);
    if (next === this.mode) return this.mode;
    this.stop();
    this.configure(next, engine);
    return this.mode;
  }
  bind(audio, music) { this.stop(); this.audio = audio; this.music = music; this.paused = false; }
  get usesRetro() { return this.mode === 'retro' && this.status !== 'failed'; }
  get usesRecorded() { return this.mode === 'recorded' && this.status !== 'failed'; }
  get usesVoices() { return this.usesRetro || this.usesRecorded; }
  // Recorded clips and synthesised speech must never overlap the letter sound.
  get suppressBlips() {
    if (this.usesRetro) return Boolean(this.current?.blocking);
    if (this.usesRecorded) return Boolean(this.current) && !this.current.unvoiced;
    return false;
  }
  fail() { this.status = 'failed'; this.stop(); }
  stop() {
    this.token++; this.engine?.cancel?.();
    this.disposeSource(); this.current = null;
    if (this.music) this.music.voiceDuck = 1;
  }
  disposeSource() {
    if (this.source) { this.source.onended = null; try { this.source.stop(); } catch {} this.source.disconnect(); this.source = null; }
    this.gain?.disconnect(); this.gain = null;
  }
  play(lines, { blocking = false, priority = 10, ttl = 8000 } = {}) {
    const valid = this.usesRecorded
      ? lines.filter(line => line.text && this.engine.has(line))
      : lines.filter(line => VOICE_PROFILES[line.speaker] && line.text);
    if (this.current && this.current.priority > priority) return false;
    this.stop();
    if (!this.usesVoices || !valid.length || !this.audio) return false;
    const token = this.token;
    this.current = { lines: valid, index: 0, blocking, priority, ttl, age: 0, offset: 0, buffer: null, completed: false };
    this.prepare(token); return true;
  }
  async prepare(token) {
    try {
      await this.ready;
      if (token !== this.token || !this.usesVoices) return;
      const line = this.current.lines[this.current.index], key = `${line.speaker}\n${line.text}`;
      let buffer = this.cache.get(key);
      if (!buffer) {
        const bytes = this.usesRecorded ? await this.engine.render(line) : await this.engine.render(line.text, VOICE_PROFILES[line.speaker]);
        if (token !== this.token) return;
        if (!bytes) {
          // No clip for this exact line: keep the text on screen and restore the letter sound.
          this.current.unvoiced = true; this.disposeSource();
          if (!this.current.blocking) this.stop();
          return;
        }
        this.audio.unlock();
        buffer = await this.audio.context.decodeAudioData(bytes.slice(0));
        if (token !== this.token) return;
        if (this.cache.size >= 24) this.cache.delete(this.cache.keys().next().value);
        this.cache.set(key, buffer);
      }
      if (token !== this.token) return;
      this.current.buffer = buffer; this.current.offset = 0; this.current.unvoiced = false;
      this.startSource(token);
    } catch { if (token === this.token) this.fail(); }
  }
  startSource(token = this.token) {
    const c = this.current, context = this.audio?.context;
    if (!c?.buffer || c.completed || this.paused || this.source || context?.state !== 'running' || this.audio.volume <= 0) return;
    const source = context.createBufferSource(), gain = context.createGain();
    source.buffer = c.buffer; gain.gain.value = this.audio.volume * 0.9;
    source.connect(gain).connect(context.destination);
    this.source = source; this.gain = gain; this.startedAt = context.currentTime; this.starts++;
    source.onended = () => {
      if (token !== this.token || this.source !== source) return;
      this.disposeSource();
      if (++c.index < c.lines.length) { c.buffer = null; this.prepare(token); }
      else { c.completed = true; if (!c.blocking) this.stop(); }
    };
    source.start(0, c.offset);
  }
  update(delta, paused = false) {
    const c = this.current;
    if (paused && !this.paused && c && this.source) {
      c.offset = Math.min(c.buffer.duration, c.offset + this.audio.context.currentTime - this.startedAt);
      this.disposeSource();
    }
    this.paused = paused;
    if (c && !paused) {
      c.age += Math.min(delta, 100);
      if (!c.blocking && c.age >= c.ttl) this.stop();
      else {
        if (this.audio.volume <= 0) {
          this.disposeSource(); c.completed = true;
        }
        this.startSource();
      }
    }
    if (this.gain) this.gain.gain.setTargetAtTime(this.audio.volume * 0.9, this.audio.context.currentTime, 0.025);
    if (this.music) this.music.voiceDuck = this.source && !paused ? 0.55 : 1;
  }
}

export function getVoices(game) {
  if (!game.voiceController) {
    game.voiceController = new VoiceController();
    game.events.once('destroy', () => game.voiceController.stop());
  }
  return game.voiceController;
}

export function bindVoices(scene) {
  const voice = getVoices(scene.game); voice.bind(scene.audioManager, scene.music); scene.voice = voice;
  const update = (time, delta) => voice.update(delta, document.hidden || document.querySelector('#rotate-screen')?.hidden === false || ['pause', 'notebook', 'ready', 'defeat'].includes(scene.modal));
  scene.events.on('preupdate', update);
  const unlock = event => { if (event.isTrusted) scene.audioManager.unlock(); };
  window.addEventListener('pointerdown', unlock); window.addEventListener('keydown', unlock);
  scene.events.once('shutdown', () => {
    scene.events.off('preupdate', update); window.removeEventListener('pointerdown', unlock); window.removeEventListener('keydown', unlock); voice.stop();
  });
  return voice;
}
