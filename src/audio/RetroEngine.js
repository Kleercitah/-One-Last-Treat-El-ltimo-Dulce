// meSpeak 2.0.7 renders WAV data; playback belongs exclusively to VoiceController.
// No calls to meSpeak.play(), no browser/system speech service, no remote resources.
export class RetroEngine {
  constructor(base = import.meta.env.BASE_URL) { this.base = base; }
  load() {
    return this.ready ??= new Promise((resolve, reject) => {
      const timer = setTimeout(() => reject(new Error('Voice engine initialization timed out')), 8000);
      const finish = (ok, reason) => { clearTimeout(timer); ok ? resolve() : reject(new Error(String(reason))); };
      const script = document.createElement('script');
      script.src = `${this.base}vendor/mespeak/mespeak.js`;
      script.onerror = () => finish(false, 'Voice engine unavailable');
      script.onload = () => {
        try { this.api = window.meSpeak; this.api.loadVoice('es', finish); }
        catch (error) { finish(false, error.message); }
      };
      document.head.append(script);
    });
  }
  render(text, profile) {
    return new Promise((resolve, reject) => {
      const timer = setTimeout(() => reject(new Error('Voice rendering timed out')), 6000);
      this.api.speak(text, { voice: 'es', ...profile, rawdata: true }, (success, id, data) => {
        clearTimeout(timer);
        if (success && data?.byteLength) resolve(data); else reject(new Error('Voice rendering failed'));
      });
    });
  }
  cancel() { this.api?.stop(); }
}
