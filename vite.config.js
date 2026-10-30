import { defineConfig } from 'vite';
import { existsSync, readFileSync, rmSync } from 'node:fs';
import { resolve } from 'node:path';
import { AUDIO_CONFIG, validateVoiceMode } from './src/config/audioConfig.js';

validateVoiceMode(AUDIO_CONFIG.dialogueVoiceMode);

// The two README.md inside public/ explain how to drop in your own music and credits picture.
// They are development notes, so the published site drops them after the copy step.
function distributionOnly() {
  let outDir = 'dist';
  return {
    name: 'distribution-only',
    configResolved(config) { outDir = resolve(config.root, config.build.outDir); },
    closeBundle() {
      for (const file of ['assets/audio/README.md', 'assets/credits/README.md']) rmSync(resolve(outDir, file), { force: true });
    },
  };
}

function optionalCredits() {
  let root;
  const manifest = () => ({ image: existsSync(resolve(root, 'public/assets/credits/imagen.png')) });
  return {
    name: 'optional-credits-image',
    configResolved(config) { root = config.root; },
    configureServer(server) {
      server.middlewares.use((req, res, next) => {
        if (req.url?.split('?')[0] !== '/credits-manifest.json') return next();
        res.setHeader('Content-Type', 'application/json'); res.setHeader('Cache-Control', 'no-store'); res.end(JSON.stringify(manifest()));
      });
    },
    generateBundle() {
      this.emitFile({ type: 'asset', fileName: 'credits-manifest.json', source: JSON.stringify(manifest()) });
      this.emitFile({ type: 'asset', fileName: 'build-info.json', source: JSON.stringify({ dialogueVoiceMode: AUDIO_CONFIG.dialogueVoiceMode }) });
    },
  };
}

function optionalMusic() {
  let root;
  const manifest = () => ['musica1.mp3', 'musica2.mp3', 'musica3.mp3'].filter(name => existsSync(resolve(root, 'public/assets/audio', name)));
  return {
    name: 'optional-local-music',
    configResolved(config) { root = config.root; },
    configureServer(server) {
      server.middlewares.use((req, res, next) => {
        if (req.url?.split('?')[0] !== '/audio-manifest.json') return next();
        res.setHeader('Content-Type', 'application/json'); res.setHeader('Cache-Control', 'no-store'); res.end(JSON.stringify(manifest()));
      });
    },
    generateBundle() { this.emitFile({ type: 'asset', fileName: 'audio-manifest.json', source: JSON.stringify(manifest()) }); },
  };
}

function optionalVoices() {
  let root;
  // The generator writes public/assets/voices/manifest.json. This always answers 200 so the
  // runtime never logs a 404 when no clips have been produced yet.
  const manifest = () => {
    try {
      const file = resolve(root, 'public/assets/voices/manifest.json');
      if (!existsSync(file)) return { lines: [] };
      const data = JSON.parse(readFileSync(file, 'utf8'));
      return { lines: Array.isArray(data.lines) ? data.lines : [] };
    } catch { return { lines: [] }; }
  };
  return {
    name: 'optional-recorded-voices',
    configResolved(config) { root = config.root; },
    configureServer(server) {
      server.middlewares.use((req, res, next) => {
        if (req.url?.split('?')[0] !== '/voices-manifest.json') return next();
        res.setHeader('Content-Type', 'application/json'); res.setHeader('Cache-Control', 'no-store'); res.end(JSON.stringify(manifest()));
      });
    },
    generateBundle() { this.emitFile({ type: 'asset', fileName: 'voices-manifest.json', source: JSON.stringify(manifest()) }); },
  };
}

export default defineConfig({
  base: './',
  plugins: [optionalMusic(), optionalCredits(), optionalVoices(), distributionOnly()],
  build: {
    rollupOptions: { output: { manualChunks: { phaser: ['phaser'] } } },
    chunkSizeWarningLimit: 1500,
  },
});
