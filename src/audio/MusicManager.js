export const MUSIC_FILES = Object.freeze(['musica1.mp3', 'musica2.mp3', 'musica3.mp3']);

// One owner per GAME, not per scene. HTMLAudio preserves playback time across scene changes.
export class MusicManager {
  constructor({ base = import.meta.env.BASE_URL, createAudio = () => new Audio(), load = url => fetch(url) } = {}) {
    this.base = base; this.createAudio = createAudio; this.tracks = new Map(); this.failed = new Set();
    this.volume = 0.45; this.level = 0.6; this.duck = 1; this.requested = null; this.unlocked = false; this.paused = false;
    this.available = []; this.status = 'loading'; this.owner = '';
    this.ready = load(`${base}audio-manifest.json`).then(r => r.ok ? r.json() : []).then(files => {
      this.available = Array.isArray(files) ? files.filter(f => MUSIC_FILES.includes(f)) : [];
      this.status = this.available.length ? 'ready' : 'missing'; this.ensure();
    }).catch(() => { this.status = 'missing'; });
  }
  select(owner, file, level = 0.6) {
    this.owner = owner; this.requested = file;
    this.level = file === MUSIC_FILES[0] ? level * 0.1 : file === MUSIC_FILES[1] ? level * 0.5 : level;
    this.duck = 1; this.paused = false;
    this.ensure();
  }
  unlock() { this.unlocked = true; this.ensure(); }
  ensure() {
    const file = this.requested;
    if (!this.unlocked || this.paused || !file || !this.available.includes(file) || this.failed.has(file)) return;
    let track = this.tracks.get(file);
    if (!track) {
      const audio = this.createAudio(); audio.loop = true; audio.preload = 'auto'; audio.volume = 0;
      audio.src = `${this.base}assets/audio/${file}`;
      track = { audio, gain: 0, starting: false, starts: 0 }; this.tracks.set(file, track);
      audio.onerror = () => { this.failed.add(file); audio.pause(); track.starting = false; };
    }
    if (track.audio.paused && !track.starting) {
      track.starting = true; track.starts++;
      Promise.resolve(track.audio.play()).catch(() => {}).finally(() => {
        track.starting = false;
        if (this.paused) track.audio.pause();
        else if (track.resumeRequested) { track.resumeRequested = false; this.ensure(); }
      });
    }
  }
  update(delta, paused = false, duck = 1) {
    const wasPaused = this.paused; this.paused = paused; this.duck = Math.max(0, Math.min(1, duck));
    if (wasPaused && !paused) {
      const pending = this.tracks.get(this.requested);
      if (pending?.starting) pending.resumeRequested = true;
      this.ensure();
    }
    const step = Math.min(delta / 1000, 0.1) / 1.2;
    for (const [file, track] of this.tracks) {
      if (paused) { track.audio.volume = 0; track.audio.pause(); continue; }
      const target = file === this.requested ? this.volume * this.level * this.duck * (this.voiceDuck ?? 1) : 0;
      // Silences are immediate, scene/song changes crossfade over approximately 1.2 seconds.
      track.gain = this.duck === 0 ? 0 : track.gain + Math.max(-step, Math.min(step, target - track.gain));
      track.audio.volume = Math.max(0, Math.min(1, track.gain));
      if (track.gain <= 0.001 && file !== this.requested) track.audio.pause();
    }
  }
  destroy() { for (const { audio } of this.tracks.values()) { audio.pause(); audio.removeAttribute('src'); audio.load(); } this.tracks.clear(); }
}

export function getMusic(game) {
  if (!game.musicManager) {
    const music = game.musicManager = new MusicManager();
    const unlock = event => { if (event.isTrusted) music.unlock(); };
    window.addEventListener('pointerdown', unlock); window.addEventListener('keydown', unlock);
    game.events.once('destroy', () => { music.destroy(); window.removeEventListener('pointerdown', unlock); window.removeEventListener('keydown', unlock); });
  }
  return game.musicManager;
}
