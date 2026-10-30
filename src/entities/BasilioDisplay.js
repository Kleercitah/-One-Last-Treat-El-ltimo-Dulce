// Provisional original shopkeeper; the dolls reuse the brothers' existing sprites.
export class BasilioDisplay {
  constructor(scene, house) {
    if (!scene.textures.exists('basilio')) {
      const texture = scene.textures.createCanvas('basilio', 24, 32);
      const c = texture.context;
      const rect = (color, x, y, w, h) => { c.fillStyle = color; c.fillRect(x, y, w, h); };
      rect('#302e39', 6, 26, 5, 5); rect('#302e39', 14, 26, 5, 5);
      rect('#586979', 4, 15, 17, 13); rect('#b39569', 8, 17, 9, 11);
      rect('#e1b997', 3, 20, 3, 5); rect('#e1b997', 20, 20, 3, 5);
      rect('#b7b8af', 5, 3, 15, 12); rect('#e1b997', 7, 6, 11, 10);
      rect('#d7d5bd', 6, 3, 13, 4); rect('#434854', 7, 9, 5, 3); rect('#434854', 14, 9, 4, 3);
      rect('#d7d5bd', 9, 13, 8, 3); rect('#ead1a1', 11, 20, 3, 3);
      texture.refresh();
    }
    this.npc = scene.add.image(house.x, 330, 'basilio').setOrigin(0.5, 1).setScale(2).setDepth(329).setVisible(false);
    this.princess = scene.add.image(house.x - 71, 270, 'riliane-down-0').setOrigin(0.5, 1).setScale(1.25).setTint(0xdecba8).setDepth(11);
    this.knight = scene.add.image(house.x + 61, 270, 'allen-down-0').setOrigin(0.5, 1).setScale(1.25).setTint(0xdecba8).setDepth(11);
  }
  reveal() { this.npc.setVisible(true); }
  change() { this.knight.setTexture('allen-up-0'); }
}
