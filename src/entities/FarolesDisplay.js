import { lanterns } from '../data/faroles.js';
import { houseLayer } from '../assets/drawStreet.js';

export class FarolesDisplay {
  constructor(scene, house) {
    this.clock = 0;
    this.deepClock=0; this.settled=false; this.deepStarted=false;
    const x = house.x;
    const layer=houseLayer(scene,house);
    const damage = scene.add.graphics().setDepth(11);
    damage.fillStyle(0x354044, 0.75).fillRect(x - 118, 188, 236, 130);
    damage.lineStyle(2, 0x202a36, 0.8);
    damage.beginPath(); damage.moveTo(x - 106, 190); damage.lineTo(x - 88, 206); damage.lineTo(x - 96, 235); damage.lineTo(x - 79, 249); damage.strokePath();
    damage.beginPath(); damage.moveTo(x + 82, 192); damage.lineTo(x + 95, 217); damage.lineTo(x + 78, 228); damage.strokePath();
    for (const wx of [x - 86, x + 46]) {
      damage.fillStyle(0x1a2432).fillRect(wx, 220, 34, 50);
      damage.fillStyle(0x706250).fillRect(wx - 6, 247, 46, 8);
    }
    damage.fillStyle(0x433b3c).fillRect(x - 19, 246, 38, 80);
    damage.lineStyle(1, 0xb4af98, 0.4);
    for (let n = 0; n < 4; n++) damage.lineBetween(x - 118, 186, x - 115 + n * 14, 218 + n * 5);
    damage.lineStyle(2, 0x88785b).lineBetween(x - 106, 196, x + 106, 201);
    for (let n = 0; n < 6; n++) damage.fillStyle(0x916d51).fillTriangle(x - 95 + n * 35, 198, x - 80 + n * 35, 199, x - 90 + n * 35, 213);
    this.windows = [x - 70, x + 62].map(wx => scene.add.rectangle(wx, 236, 22, 28, 0x9290aa).setDepth(12).setAlpha(0.025));
    this.chair = scene.add.container(x - 91, 335).setDepth(336);
    const chair = scene.add.graphics();
    chair.lineStyle(3, 0xab8b65).strokeRect(-12, -36, 22, 27);
    chair.lineBetween(-9, -34, -9, -12); chair.lineBetween(0, -34, 0, -12);
    chair.lineBetween(-14, -9, 14, -9); chair.lineBetween(-10, -9, -15, 4); chair.lineBetween(10, -9, 16, 4);
    chair.lineStyle(3, 0x8d755f).strokeEllipse(0, 3, 43, 9);
    this.chair.add(chair);
    this.glass = lanterns.map(l => {
      const frame = scene.add.rectangle(x + l.x, 282, 22, 30, 0x252632).setStrokeStyle(2, 0xa08a66).setDepth(333);
      const glass = scene.add.rectangle(x + l.x, 282, 14, 20, 0x494957).setDepth(334);
      const label=scene.add.text(x + l.x, 265, l.name, { fontFamily: 'monospace', fontSize: '9px', color: '#ddd0a7', backgroundColor: '#28313a', padding:{x:2,y:2} }).setOrigin(0.5).setDepth(335);
      return { id: l.id, frame, glass, label, halo: scene.add.ellipse(x + l.x, 346, 76, 48, 0xffd08a).setDepth(-4).setAlpha(0) };
    });
    this.drawer = scene.add.rectangle(x + 80, 326, 35, 9, 0x9f8c6b).setDepth(334).setVisible(false);
    this.facade=scene.add.container(x,350).setDepth(11);
    for (const item of [layer,damage,...this.windows,...this.glass.flatMap(l=>[l.frame,l.glass,l.label]),this.drawer]) {
      item.setPosition(item.x-x,item.y-350); this.facade.add(item);
    }
  }
  refresh(lit) {
    for (const lamp of this.glass) lamp.glass.setFillStyle(lit.includes(lamp.id) ? 0xf7d997 : 0x494957);
    this.drawer.setVisible(lit.length === 3);
  }
  update(delta, lit, active, reducedMotion) {
    if (!active) return;
    if (!reducedMotion) this.clock += Math.min(delta, 100) / 1000;
    const solved = lit.length === 3;
    if (solved && !this.settled) { this.deepStarted=true; this.deepClock+=Math.min(delta,100)/1000; if (this.deepClock>=3.6) this.settled=true; }
    const wave = this.settled ? 0 : solved ? Math.sin(Math.min(1,this.deepClock/3.6)*Math.PI) : (Math.sin(this.clock * Math.PI * 2 / (4.8 - lit.length * .55)) + 1) / 2;
    this.wave=wave;
    const strength=solved ? .042 : .012+lit.length*.008;
    this.facade.setScale(reducedMotion ? 1 : 1+wave*strength, reducedMotion ? 1 : 1+wave*strength*1.2);
    this.chair.rotation = reducedMotion || this.settled ? 0 : Math.sin(this.clock * 1.4) * .09;
    this.windows.forEach(window => window.setAlpha(this.settled ? .04 : reducedMotion ? .14 : .1+wave*.52));
    for (const lamp of this.glass) lamp.halo.setAlpha(lit.includes(lamp.id) ? this.settled || reducedMotion ? .18 : .1+wave*.23 : 0);
    return wave;
  }
}
