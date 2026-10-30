const colors = {
  riliane: { hair: '#f0c878', shade: '#bf8c48', outfit: '#e7b951', dark: '#ac713c', cape: '#f4d785' },
  allen: { hair: '#e4bb71', shade: '#ab7a4d', outfit: '#a7b7bb', dark: '#627a8c', cape: '#648b91' },
};

function character(scene, who, direction, frame) {
  const texture = scene.textures.createCanvas(`${who}-${direction}-${frame}`, 24, 32);
  const c = texture.context;
  const p = colors[who];
  const rect = (color, x, y, w, h) => { c.fillStyle = color; c.fillRect(x, y, w, h); };
  const bob = frame ? 1 : 0;
  rect('#19252e80', 4, 29, 17, 3);
  rect('#352f3c', 7, 25, 4, 5 - frame);
  rect('#352f3c', 14, 25, 4, 4 + frame);
  rect(p.dark, 6, 16 + bob, 13, 11);
  if (who === 'riliane') {
    rect(p.outfit, 5, 18 + bob, 15, 7);
    rect(p.outfit, 3, 23, 19, 4);
    rect(p.cape, 6, 25, 13, 2);
    rect('#fbdf9d', 9, 17 + bob, 4, 8);
  } else {
    rect(p.cape, 5, 16 + bob, 15, 11);
    rect(p.outfit, 8, 17 + bob, 9, 8);
    rect('#dce1cc', 11, 18 + bob, 2, 7);
    rect('#ad7c53', 20, 17, 2, 12);
    rect('#d4b17a', 18, 21, 5, 2);
  }
  rect('#f2c4a0', 4, 18 + bob, 3, 5);
  rect('#f2c4a0', 18, 18 + bob, 3, 5);
  rect(p.shade, 6, 5 + bob, 13, 12);
  rect(p.hair, 5, 4 + bob, 14, 9);
  if (direction !== 'up') {
    rect('#f2c4a0', 8, 9 + bob, 9, 7);
    rect(p.hair, 7, 7 + bob, 6, 4);
    if (direction !== 'left') rect('#343345', 15, 11 + bob, 2, 2);
    if (direction !== 'right') rect('#343345', 9, 11 + bob, 2, 2);
    rect('#d98e82', 12, 15 + bob, 3, 1);
  } else {
    rect(p.hair, 7, 9 + bob, 11, 7);
    rect(p.shade, 9, 14 + bob, 8, 2);
  }
  if (who === 'riliane') {
    rect('#fff0ac', 6, 4 + bob, 13, 3);
    for (const x of [6, 11, 17]) rect('#edc157', x, 1 + bob, 2, 4);
    rect('#be7771', 11, 4 + bob, 2, 2);
    rect('#cb703f', 20, 23, 4, 5);
    rect('#f1a75b', 20, 24, 3, 3);
  }
  texture.refresh();
}

export function createTextures(scene) {
  for (const who of ['riliane', 'allen']) {
    for (const direction of ['up', 'down', 'left', 'right']) {
      for (const frame of [0, 1]) character(scene, who, direction, frame);
    }
  }
}
