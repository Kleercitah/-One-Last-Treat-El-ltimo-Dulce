// Source of pre-generated Fish Audio clips. Playback belongs exclusively to VoiceController,
// exactly like RetroEngine: this class only resolves a line to its MP3 bytes.
// The manifest is emitted by the Vite plugin from public/assets/voices/manifest.json, so the
// request always succeeds and an empty manifest simply means "no recorded audio yet".
export class RecordedEngine {
  constructor(base = import.meta.env.BASE_URL, fetchImpl = url => fetch(url)) {
    this.base = base; this.fetch = fetchImpl; this.index = new Map(); this.status = 'loading';
    this.ready = null;
  }
  get url() { return `${this.base}voices-manifest.json`; }
  get lines() { return [...this.index.values()]; }
  load() {
    return this.ready ??= this.fetch(this.url)
      .then(response => response.ok ? response.json() : { lines: [] })
      .then(data => {
        for (const line of Array.isArray(data?.lines) ? data.lines : []) {
          if (line?.speaker && line?.text && line?.file) this.index.set(`${line.speaker}\n${line.text}`, line);
        }
        this.status = this.index.size ? 'ready' : 'empty';
      })
      .catch(() => { this.status = 'empty'; });
  }
  has(line) { return Boolean(line) && this.index.has(`${line.speaker}\n${line.text}`); }
  async render(line) {
    const entry = this.index.get(`${line.speaker}\n${line.text}`);
    if (!entry) return null;
    try {
      const response = await this.fetch(`${this.base}${entry.file}`);
      if (!response.ok) return null;
      const bytes = await response.arrayBuffer();
      return bytes.byteLength ? bytes : null;
    } catch { return null; }
  }
  cancel() {}
}
