import { WORLD } from '../config.js';
import { houses } from '../data/houses.js';

// Original temporary pixel scenery. World geometry and collision footprints share coordinates.
export function drawStreet(scene, { includeUltima = false, omitFaroles = false, textureKey = 'street', render = true } = {}) {
  const texture = scene.textures.exists(textureKey) ? scene.textures.get(textureKey) : scene.textures.createCanvas(textureKey, WORLD.width / 2, WORLD.height / 2);
  const c = texture.context;
  c.save();
  c.scale(0.5, 0.5);
  const box = (color, x, y, w, h) => { c.fillStyle = color; c.fillRect(x, y, w, h); };
  const polygon = (color, points) => {
    c.fillStyle = color; c.beginPath(); points.forEach(([x, y], i) => i ? c.lineTo(x, y) : c.moveTo(x, y)); c.closePath(); c.fill();
  };
  const hex = n => `#${n.toString(16).padStart(6, '0')}`;
  const obstacles = [];
  box('#303f40', 0, 0, WORLD.width, WORLD.height);
  box('#323647', 0, 0, WORLD.width, 112);
  for (let x = 0; x < WORLD.width; x += 64) {
    box('#292e40', x + 22, 14 + (x % 5) * 6, 8, 136);
    polygon('#293a40', [[x - 28, 136], [x + 26, 20 + (x % 3) * 8], [x + 84, 136]]);
    polygon('#324248', [[x - 12, 144], [x + 26, 62], [x + 64, 144]]);
  }
  box('#576160', 0, 340, WORLD.width, 54);
  box('#333e49', 0, 396, WORLD.width, 152);
  box('#444b54', 0, 396, WORLD.width, 6);
  box('#27343e', 0, 542, WORLD.width, 8);
  box('#666764', 0, 550, WORLD.width, 52);
  box('#8b8171', 0, 550, WORLD.width, 4);
  for (let x = 0; x < WORLD.width; x += 40) {
    box('#424d50', x, 344, 2, 46);
    box('#555d5b', x + 20, 556, 2, 44);
    box('#8d8b79', x, 390, 34, 4);
    box('#89816b', x, 550, 34, 4);
    if (x % 120 === 0) box('#746e66', x, 470, 48, 4);
  }
  // Seeded-looking distribution: stable on every launch, with no gameplay randomness.
  for (let i = 0; i < 950; i++) {
    const x = (i * 137 + 37) % WORLD.width;
    const y = (i * 89 + 21) % WORLD.height;
    if (y > 135 && y < 336 || y > 608) box(i % 2 ? '#42524b' : '#3a4846', x, y, 6, 2);
    if (y > 410 && y < 536 && i % 3 === 0) box('#3d4650', x, y, 4, 2);
  }
  function pumpkin(x, y, size = 1) {
    box('#263238', x - 3, y + 14 * size, 26 * size, 5);
    box('#ae5a3e', x, y + 3, 20 * size, 14 * size);
    box('#d58a4c', x + 4, y, 12 * size, 18 * size);
    box('#edab5c', x + 6, y + 2, 3 * size, 12 * size);
    box('#68754a', x + 9, y - 4, 4, 5);
    box('#603f3b', x + 4, y + 6, 4, 3);
    box('#603f3b', x + 13, y + 6, 3, 3);
    box('#603f3b', x + 8, y + 12, 6, 2);
  }
  for (const house of houses) {
    if (house.id === 'ultima' && !includeUltima) continue;
    if (house.id === 'faroles' && omitFaroles) { obstacles.push({ x: house.x - 126, y: 172, width: 252, height: 158 }); continue; }
    const x = house.x;
    box('#263638', x - 130, 178, 278, 162);
    box(hex(house.wall), x - 120, 178, 240, 148);
    box('#745f60', x - 124, 316, 248, 16);
    for (let y = 196; y < 316; y += 16) box('#45405224', x - 118, y, 236, 2);
    box('#483d4c', x + 62, 112, 28, 54);
    box('#ab8276', x + 58, 110, 36, 10);
    polygon('#342e42', [[x - 142, 188], [x - 94, 112], [x + 94, 112], [x + 142, 188]]);
    polygon(hex(house.roof), [[x - 138, 180], [x - 92, 108], [x + 92, 108], [x + 138, 180]]);
    for (let y = 124; y < 178; y += 14) box('#a4868d44', x - 84 - (y - 124) / 2, y, 168 + y - 124, 2);
    box('#d1ae92', x - 128, 180, 256, 8);
    for (const wx of [x - 88, x + 44]) {
      box('#5b4b55', wx - 6, 218, 50, 64);
      box('#d7b28c', wx - 2, 216, 42, 60);
      box(house.lit ? '#e9b16d' : '#434a59', wx + 2, 220, 34, 50);
      if (house.lit) box('#f9d294', wx + 6, 224, 24, 42);
      box(house.id === 'carmesi' ? '#993e55' : '#aa7371', wx + 2, 220, 8, 46);
      box(house.id === 'carmesi' ? '#993e55' : '#aa7371', wx + 28, 220, 8, 46);
      box('#ac8d7e', wx + 18, 220, 4, 50);
      box('#ac8d7e', wx + 2, 244, 34, 4);
      box('#e1baa0', wx - 6, 274, 50, 6);
    }
    box('#e0b89a', x - 28, 238, 56, 88);
    box('#594a54', x - 22, 244, 44, 82);
    box('#735660', x - 16, 252, 32, 62);
    box('#987174', x - 12, 258, 24, 22);
    box('#d6b06f', x + 10, 288, 4, 4);
    box('#d4ac85', x - 38, 326, 76, 8);
    box('#a8957e', x - 44, 334, 88, 8);
    box('#bea58a', x - 48, 342, 96, 8);
    box('#bca78c', x - 38, 354, 76, 30);
    for (let py = 358; py < 384; py += 12) box('#9c917e', x - 38, py, 76, 2);
    box('#574955', x + 36, 257, 8, 14);
    box('#e4c37f', x + 38, 261, 4, 4);
    box('#4b4149', x - 8, 198, 16, 22);
    box(house.lit ? '#ffe2a3' : '#727468', x - 6, 202, 12, 14);
    for (let dx = -108; dx <= 108; dx += 24) {
      box('#514653', x + dx, 192 + Math.round(Math.abs(dx) / 20), 2, 10);
      box(dx % 48 === 0 ? '#e6ad64' : '#cda18b', x + dx - 2, 202 + Math.round(Math.abs(dx) / 20), 6, 6);
    }
    pumpkin(x - 65, 316);
    if (house.id === 'magnolia') pumpkin(x + 65, 314, 1.25);
    obstacles.push({ x: x - 126, y: 172, width: 252, height: 158 });
  }
  // Trees below the pavement stay out of the main navigation corridor.
  for (let x = 70; x < WORLD.width; x += 270) {
    box('#253437', x - 38, 660, 104, 12);
    box('#69534c', x, 602, 14, 66);
    polygon('#79534c', [[x - 50, 630], [x - 34, 592], [x - 42, 568], [x - 12, 542], [x + 28, 548], [x + 58, 582], [x + 50, 628]]);
    box('#a97455', x - 30, 566, 54, 12);
    box('#95624f', x - 46, 594, 94, 18);
    box('#bd885a', x - 20, 560, 30, 6);
    obstacles.push({ x: x - 50, y: 552, width: 108, height: 116 });
  }
  for (let i = 0; i < 120; i++) {
    const x = (i * 193) % WORLD.width;
    const y = 350 + (i * 53) % 242;
    box(['#c18b5c', '#976657', '#b7a17a'][i % 3], x, y, 6, 2);
    box('#846b59', x + 2, y + 2, 2, 2);
  }
  c.restore();
  texture.refresh();
  if (render) scene.add.image(0, 0, textureKey).setOrigin(0).setScale(2).setDepth(-10);
  return obstacles;
}

// The reference canvas is never displayed. Dynamic houses have independent visibility and geometry.
export function houseLayer(scene, house) {
  if (!scene.textures.exists('street-reference')) drawStreet(scene, { includeUltima:true, textureKey:'street-reference', render:false });
  const key = `house-layer-${house.id}`;
  if (!scene.textures.exists(key)) {
    const t = scene.textures.createCanvas(key, 150, 130);
    t.context.drawImage(scene.textures.get('street-reference').getSourceImage(), (house.x - 150) / 2, 45, 150, 130, 0, 0, 150, 130); t.refresh();
  }
  return scene.add.image(house.x, 350, key).setOrigin(0.5,1).setScale(2).setDepth(-3);
}
