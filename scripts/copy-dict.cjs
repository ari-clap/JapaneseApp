// Copies kuromoji dictionary files into public/dict so they're served
// as static assets (needed by the browser-side tokenizer).
const { cpSync, mkdirSync } = require('fs');
const path = require('path');

const src  = path.join(__dirname, '..', 'node_modules', 'kuromoji', 'dict');
const dest = path.join(__dirname, '..', 'public', 'dict');

mkdirSync(dest, { recursive: true });
cpSync(src, dest, { recursive: true });
console.log('✓ Kuromoji dict → public/dict');
