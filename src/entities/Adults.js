function texture(scene, who) {
  const key = `adult-${who}`; if (scene.textures.exists(key)) return key;
  const t = scene.textures.createCanvas(key, 32, 48), c = t.context;
  const r = (color,x,y,w,h) => { c.fillStyle=color; c.fillRect(x,y,w,h); };
  if (who === 'magnolia') {
    r('#d5d0bd',9,3,14,14); r('#e9dfca',7,7,18,7); r('#ddd9c6',19,1,7,7);
    r('#dab28e',10,9,12,12); r('#6e5355',10,12,5,4); r('#6e5355',17,12,5,4); r('#f5d49d',12,13,2,1); r('#f5d49d',18,13,2,1);
    r('#806476',8,22,16,17); r('#ad8e89',5,26,22,10); r('#dcd5bd',11,24,11,15); r('#e5c5a4',5,29,5,7); r('#e5c5a4',23,29,4,7);
    r('#786071',6,37,21,7); r('#443b48',9,44,5,4); r('#443b48',20,44,5,4);
    r('#906b4b',3,33,25,3); for (const x of [7,13,20]) { r('#e4b773',x,30,5,3); r('#a37549',x+1,30,1,1); }
  } else {
    r('#594238',8,1,16,17); r('#d8ac88',10,6,12,15); r('#493830',10,5,12,3); r('#382f3b',12,12,2,2); r('#382f3b',19,12,2,2); r('#af7770',15,18,4,1);
    r('#9c6675',8,22,16,18); r('#c3928b',11,24,10,15); r('#e1c8a7',13,21,6,5);
    r('#a46e7c',4,23,5,16); r('#a46e7c',23,23,5,16); r('#e2b794',4,37,5,4); r('#e2b794',23,37,5,4);
    r('#705564',7,39,18,5); r('#d1ac94',10,43,4,3); r('#d1ac94',19,43,4,3); r('#3d3441',8,46,7,2); r('#3d3441',18,46,7,2);
  }
  t.refresh(); return key;
}
export class MagnoliaDisplay {
  constructor(scene, house) { this.npc = scene.add.image(house.x - 15, 332, texture(scene,'magnolia')).setOrigin(0.5,1).setScale(1.65).setDepth(330).setVisible(false); }
  reveal() { this.npc.setVisible(true); }
}
export function createMother(scene, x, y) { return scene.add.image(x, y, texture(scene,'mother')).setOrigin(0.5,1).setScale(2).setDepth(y).setVisible(false); }
