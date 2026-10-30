import Phaser from 'phaser';
import { VIEW } from './config.js';
import { BootScene } from './scenes/BootScene.js';
import { MenuScene } from './scenes/MenuScene.js';
import { StreetScene } from './scenes/StreetScene.js';
import { ChaseScene } from './scenes/ChaseScene.js';
import { EndingScene } from './scenes/EndingScene.js';
import './style.css';
import { installViewport } from './ui/Viewport.js';

const game = new Phaser.Game({
  type: Phaser.AUTO,
  parent: 'game',
  width: VIEW.width,
  height: VIEW.height,
  backgroundColor: '#252b36',
  pixelArt: true,
  roundPixels: true,
  antialias: false,
  scale: { mode: Phaser.Scale.FIT, autoCenter: Phaser.Scale.CENTER_BOTH },
  physics: { default: 'arcade', arcade: { gravity: { x: 0, y: 0 }, debug: false } },
  scene: [BootScene, MenuScene, StreetScene, ChaseScene, EndingScene],
});
installViewport(game);

// Deliberately absent from production builds; browser tests inspect real scene state.
if (import.meta.env.DEV) window.__OLT_GAME__ = game;
