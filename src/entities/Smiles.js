// A poseable silhouette: the same hat, suit, cane and smile survive the transformation.
export class Smiles {
  constructor(scene, x, y, scale = 1) {
    const rect = (x, y, w, h, c) => scene.add.rectangle(x, y, w, h, c);
    this.root = scene.add.container(x, y).setScale(scale).setDepth(y);
    this.shadow = scene.add.ellipse(x + 15, y, 115, 20, 0x141322, 0.6).setDepth(y - 1);
    this.legs = scene.add.container(0, -27, [rect(-12, 0, 12, 56, 0x292334), rect(13, 0, 12, 56, 0x292334)]);
    this.body = scene.add.container(0, -70, [rect(0, 0, 43, 63, 0x50365e), rect(0, -5, 18, 46, 0xc19a52)]);
    for (const x of [-17, -11, 12, 18]) this.body.add(rect(x, 0, 2, 58, 0x957084));
    this.arms = scene.add.container(0, -78, [rect(-29, 16, 10, 58, 0x51385d), rect(29, 16, 10, 58, 0x51385d), rect(-29, 47, 13, 12, 0xf4e5cc), rect(29, 47, 13, 12, 0xf4e5cc)]);
    this.cane = scene.add.container(39, -34, [rect(0, 0, 4, 70, 0xc4a064), scene.add.arc(-4, -34, 6, 180, 360, false, 0xc4a064)]);
    this.head = scene.add.container(0, -115);
    this.face = scene.add.ellipse(0, 0, 35, 44, 0xe5dabd);
    this.mouth = scene.add.arc(0, 4, 12, 0, 180, false, 0x322334);
    this.teeth = scene.add.rectangle(0, 7, 21, 3, 0xffedc9);
    this.head.add([this.face, this.mouth, this.teeth, rect(-7, -5, 3, 4, 0xffe5a3), rect(7, -5, 3, 4, 0xffe5a3), rect(0, -24, 51, 7, 0x171923), rect(0, -44, 32, 36, 0x171923), rect(0, -30, 32, 5, 0xc49b59)]);
    this.root.add([this.legs, this.body, this.arms, this.cane, this.head, scene.add.triangle(0, -97, -13, -4, 13, -4, 0, 5, 0xe3b863)]);
    this.amount = 0;
  }
  pose(amount, time, reduced = false, recoil = false) {
    this.amount = amount;
    const wave = reduced ? 0 : Math.sin(time / 340);
    this.head.setRotation(amount * 0.42 + wave * 0.035);
    this.head.y = -115 - amount * 28;
    this.arms.setScale(1 + amount * 0.25, 1 + amount * 0.5);
    this.mouth.setScale(1 + amount * 0.7, 1 + amount * 0.25);
    this.body.setScale(1, 1 + amount * 0.22);
    this.legs.setRotation(wave * amount * 0.035);
    this.root.setRotation(recoil ? -0.14 : wave * amount * 0.012);
    this.shadow.setPosition(this.root.x + 15 + wave * amount * 22, this.root.y - 2).setScale(1 + amount * 0.35, 1);
    this.root.setDepth(this.root.y); this.shadow.setDepth(this.root.y - 1);
  }
  setPosition(x, y) { this.root.setPosition(x, y); this.shadow.setPosition(x + 15, y); }
  setVisible(value) { this.root.setVisible(value); this.shadow.setVisible(value); }
  destroy() { this.root.destroy(); this.shadow.destroy(); }
}
