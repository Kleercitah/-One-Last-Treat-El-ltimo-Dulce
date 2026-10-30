export class CarmesiDisplay {
  constructor(scene, house) {
    this.scene = scene;
    this.house = house;
    if (!scene.textures.exists('carmesi')) {
      const texture = scene.textures.createCanvas('carmesi', 24, 32);
      const c = texture.context;
      const rect = (color, x, y, w, h) => { c.fillStyle = color; c.fillRect(x, y, w, h); };
      rect('#302d3e', 5, 2, 15, 21);
      rect('#c9b4ad', 9, 6, 8, 12); rect('#34313f', 8, 4, 11, 5);
      rect('#454054', 10, 10, 2, 2); rect('#454054', 15, 10, 2, 2);
      rect('#976875', 12, 15, 4, 1);
      rect('#773c55', 7, 18, 14, 14); rect('#bfa291', 11, 18, 5, 3);
      rect('#573247', 4, 26, 19, 6); rect('#c9b4ad', 8, 25, 4, 3);
      texture.refresh();
    }
    this.figure = scene.add.image(house.x + 61, 270, 'carmesi').setOrigin(0.5, 1).setScale(1.25).setDepth(11).setVisible(false);
    // Cover the lamp's baked-in bright pixels as well as fading its ground halo.
    this.lampCover = scene.add.rectangle(house.x, 209, 12, 14, 0x525568).setDepth(12).setAlpha(0);
    this.curtains = scene.add.graphics().setDepth(12).setAlpha(0);
    this.curtains.fillStyle(0x813c51);
    for (const offset of [-86, 46]) {
      this.curtains.fillRect(house.x + offset, 220, 34, 50);
      this.curtains.fillStyle(0x602f43);
      for (const stripe of [6, 16, 26]) this.curtains.fillRect(house.x + offset + stripe, 220, 2, 50);
      this.curtains.fillStyle(0x813c51);
    }
    this.light = scene.lights.find(light => light.x === house.x);
  }
  reveal() { if (!this.scene.progress.flags.has('carmesiLightOut')) this.figure.setVisible(true); }
  finishTransition() {
    const s = this.scene;
    s.tweens.killTweensOf([this.lampCover, this.curtains, this.light]);
    this.lampCover.setAlpha(1); this.curtains.setAlpha(1); this.light.setAlpha(0);
    this.figure.setVisible(false);
  }
  darken() {
    const s = this.scene;
    s.tweens.killTweensOf(s.dusk);
    if (s.reducedMotion) { this.finishTransition(); s.dusk.setAlpha(0.12); return; }
    s.tweens.add({ targets: [this.lampCover, this.curtains], alpha: 1, duration: 1200, onComplete: () => this.figure.setVisible(false) });
    s.tweens.add({ targets: this.light, alpha: 0, duration: 1200 });
    s.tweens.add({ targets: s.dusk, alpha: 0.12, duration: 1800 });
  }
}
