import { Character } from './Character.js';
import { PLAYER_SPEED } from '../config.js';

export class Riliane extends Character {
  constructor(scene, position) {
    super(scene, position.x, position.y, 'riliane');
    scene.physics.add.existing(this);
    this.body.setSize(12, 8).setOffset(6, 24);
    this.body.setCollideWorldBounds(true);
  }
  update(controls, blocked, time) {
    const x = blocked ? 0 : Number(controls.down('KeyD', 'ArrowRight')) - Number(controls.down('KeyA', 'ArrowLeft'));
    const y = blocked ? 0 : Number(controls.down('KeyS', 'ArrowDown')) - Number(controls.down('KeyW', 'ArrowUp'));
    const length = Math.hypot(x, y) || 1;
    this.body.setVelocity(x / length * PLAYER_SPEED, y / length * PLAYER_SPEED);
    this.animateMovement(x, y, time);
  }
  stop() { this.body.setVelocity(0); }
}
