#!/usr/bin/env node
/**
 * Сканирует папки с оптимизированными ассетами и создаёт data/manifest.js —
 * файл с глобальной переменной window.PORTFOLIO_DATA, чтобы сайт работал
 * даже при открытии index.html напрямую (file://) без веб-сервера.
 */
const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');
const IMG_DIR = path.join(ROOT, 'assets', 'img');
const OUT_FILE = path.join(ROOT, 'data', 'manifest.js');

const CATEGORIES = [
  { key: 'art', title: 'Арт' },
  { key: 'decor', title: 'Декоративка' },
];

function listImages(key) {
  const dir = path.join(IMG_DIR, key);
  if (!fs.existsSync(dir)) return [];
  return fs
    .readdirSync(dir)
    .filter((f) => /\.(jpe?g|png)$/i.test(f))
    .sort()
    .map((file) => ({
      type: 'image',
      category: key,
      full: `assets/img/${key}/${file}`,
      thumb: `assets/img/${key}/thumbs/${file}`,
    }));
}

const items = [];
for (const { key } of CATEGORIES) {
  items.push(...listImages(key));
}

const data = {
  generatedAt: new Date().toISOString(),
  categories: CATEGORIES,
  items,
};

const banner = '// Файл сгенерирован автоматически: scripts/generate-manifest.js\n';
fs.writeFileSync(
  OUT_FILE,
  banner + 'window.PORTFOLIO_DATA = ' + JSON.stringify(data, null, 2) + ';\n',
  'utf8'
);

const counts = CATEGORIES.map(
  (c) => `${c.title}: ${items.filter((i) => i.category === c.key).length}`
).join(', ');
console.log(`Манифест записан (${items.length} элементов). ${counts}`);
