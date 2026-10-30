// Shared, identifiable home in exploration, the chase and the epilogue.
export class FamilyHouse {
  constructor(scene, x = 140, { lit = true } = {}) {
    this.scene = scene; this.x = x;
    const key = 'family-house';
    if (!scene.textures.exists(key)) {
      const t = scene.textures.createCanvas(key, 118, 138), c = t.context;
      const r = (color, x, y, w, h) => { c.fillStyle = color; c.fillRect(x, y, w, h); };
      const poly = (color, points) => { c.fillStyle = color; c.beginPath(); points.forEach(([x,y], i) => i ? c.lineTo(x,y) : c.moveTo(x,y)); c.closePath(); c.fill(); };
      r('#35473e', 4, 117, 110, 20); r('#97a080', 6, 118, 106, 2);
      r('#c1b095', 44, 119, 30, 18); r('#a3957e', 47, 125, 24, 2);
      r('#d5bfa0', 10, 55, 98, 66); r('#91a6a0', 14, 58, 90, 59);
      for (let y = 62; y < 117; y += 7) r('#7c9490', 14, y, 90, 1);
      r('#a77863', 84, 25, 12, 29); r('#d0ad88', 82, 24, 16, 4);
      poly('#273b4a', [[2, 57],[59, 10],[117, 57]]); poly('#58716f', [[7,54],[59,15],[112,54]]);
      for (let y = 31; y < 55; y += 7) r('#78918a', 43 - (y - 31), y, 32 + (y - 31) * 2, 1);
      r('#e6d1a8', 7, 54, 105, 4);
      for (const x of [22, 77]) { r('#e6d1a8',x,70,20,25); r('#e8ba74',x+3,73,14,19); r('#fff0b0',x+6,76,8,12); r('#8a7770',x+9,72,2,21); r('#8a7770',x+2,82,16,2); r('#e6d1a8',x-2,95,24,3); }
      r('#dbc69e', 44, 77, 30, 44); r('#4e6d69', 47, 81, 24, 39); r('#78978b',50,85,18,22); r('#e4c486',65,108,2,2);
      r('#e1cba6', 42, 119, 34, 3); r('#e1cba6', 39, 123, 40, 3);
      // Two handmade decorations: a yellow crown and a blue shield identify the siblings.
      poly('#f2c45a', [[24,103],[27,108],[31,102],[35,108],[38,103],[37,113],[25,113]]);
      poly('#85b6ce', [[83,103],[95,103],[94,113],[89,117],[84,113]]); r('#e5e4bd',88,105,2,8);
      for (const x of [14,98]) { r('#d48945',x,120,9,8); r('#faad59',x+2,118,5,9); r('#3a3539',x+2,122,2,1); r('#3a3539',x+6,122,1,1); }
      for (let x=7; x<110; x+=8) if (x<39 || x>78) { r('#dfd3ba',x,124,3,12); r('#dfd3ba',x,128,8,2); }
      t.refresh();
    }
    this.image = scene.add.image(x, 350, key).setOrigin(0.5,1).setScale(2).setDepth(-1);
    this.opening = scene.add.rectangle(x, 279, 44, 74, 0xeac487).setDepth(1).setVisible(false);
    this.door = scene.add.rectangle(x - 22, 279, 44, 74, 0x4e6d69).setOrigin(0,0.5).setDepth(2);
    this.lamp = scene.add.rectangle(x, 224, 12, 18, 0xffdf93).setStrokeStyle(3,0x66584c).setDepth(3);
    this.halo = scene.add.ellipse(x, 365, 186, 86, 0xffda89, 0.22).setDepth(-2);
    this.label = scene.add.text(x, 202, 'RILIANE & ALLEN', { fontFamily:'monospace',fontSize:'10px',color:'#f8e4b4',backgroundColor:'#3d5356',padding:{x:5,y:3} }).setOrigin(0.5).setDepth(3);
    this.setLit(lit);
  }
  setLit(lit) { this.lit = lit; this.lamp.setFillStyle(lit ? 0xffe5a4 : 0x48535a); this.halo.setAlpha(lit ? 0.25 : 0); }
  open(amount) { this.opening.setVisible(amount > 0); this.door.setScale(1 - Math.min(1,amount) * 0.94, 1); }
}
