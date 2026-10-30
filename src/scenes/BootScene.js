import Phaser from 'phaser';
import { createTextures } from '../assets/createTextures.js';

export class BootScene extends Phaser.Scene {
  constructor() { super('Boot'); }
  create() { createTextures(this); this.scene.start('Menu'); }
}
