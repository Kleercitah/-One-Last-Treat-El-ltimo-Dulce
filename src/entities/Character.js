import Phaser from 'phaser';

export class Character extends Phaser.GameObjects.Sprite {
  constructor(scene, x, y, who) {
    super(scene, x, y, `${who}-down-0`);
    scene.add.existing(this);
    this.who = who;
    this.direction = 'down';
    this.setOrigin(0.5, 1).setScale(2);
  }
  animateMovement(dx, dy, time) {
    const moving = Math.hypot(dx, dy) > 0.05;
    if (moving) this.direction = Math.abs(dx) > Math.abs(dy) ? dx > 0 ? 'right' : 'left' : dy > 0 ? 'down' : 'up';
    const frame = moving ? Math.floor(time / 170) % 2 : 0;
    this.setTexture(`${this.who}-${this.direction}-${frame}`);
    this.setDepth(this.y);
  }
}
