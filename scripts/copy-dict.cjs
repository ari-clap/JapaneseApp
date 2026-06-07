// Copies kuromoji assets into public/ so they're served as static assets.
const { cpSync, copyFileSync, mkdirSync } = require('fs');
const path = require('path');

// Dict files → public/dict/
const dictSrc  = path.join(__dirname, '..', 'node_modules', 'kuromoji', 'dict');
const dictDest = path.join(__dirname, '..', 'public', 'dict');
mkdirSync(dictDest, { recursive: true });
cpSync(dictSrc, dictDest, { recursive: true });
console.log('✓ Kuromoji dict → public/dict');

// Pre-built browser bundle → public/kuromoji.js
const bundleSrc  = path.join(__dirname, '..', 'node_modules', 'kuromoji', 'build', 'kuromoji.js');
const bundleDest = path.join(__dirname, '..', 'public', 'kuromoji.js');
copyFileSync(bundleSrc, bundleDest);
console.log('✓ Kuromoji browser bundle → public/kuromoji.js');
