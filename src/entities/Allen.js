import { Character } from './Character.js';
import { Trail } from '../systems/Trail.js';
import { FOLLOW_DISTANCE } from '../config.js';

export class Allen extends Character {
  constructor(scene, position, leader) {
    super(scene, position.x, position.y, 'allen');
    this.trail = new Trail(position, leader, FOLLOW_DISTANCE);
  }
  follow(leader, time) {
    const next = this.trail.record(leader);
    const dx = next.x - this.x;
    const dy = next.y - this.y;
    this.setPosition(next.x, next.y);
    this.animateMovement(dx, dy, time);
  }
}
