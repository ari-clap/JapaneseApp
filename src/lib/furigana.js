// Auto-furigana via kuromoji (runs entirely in the browser, no API needed).
// Dictionary files (~7 MB) are fetched once from /dict and then cached.

let _tokenizer = null;
let _initPromise = null;

/** Call once to load the dictionary. Safe to call multiple times. */
export function initFurigana() {
  if (_tokenizer) return Promise.resolve();
  if (_initPromise) return _initPromise;

  _initPromise = import('kuromoji').then(m => {
    const kuromoji = m.default ?? m;
    return new Promise((resolve, reject) => {
      kuromoji.builder({ dicPath: '/dict' }).build((err, tokenizer) => {
        if (err) { reject(err); return; }
        _tokenizer = tokenizer;
        resolve();
      });
    });
  });

  return _initPromise;
}

export const isFuriganaReady = () => _tokenizer !== null;

// ── helpers ──────────────────────────────────────────────────────────────────

function hasKanji(str) {
  return /[一-龯㐀-䶿豈-﫿]/.test(str);
}

function toHiragana(str) {
  return str.replace(/[ァ-ヶ]/g, c => String.fromCharCode(c.charCodeAt(0) - 0x60));
}

/**
 * Tokenize `text` and return segs: { t, r? }[]
 * Segments with kanji get an `r` (hiragana reading); pure-kana/punct don't.
 */
export function textToSegs(text) {
  if (!_tokenizer) throw new Error('Furigana not ready — call initFurigana() first');
  return _tokenizer
    .tokenize(text)
    .filter(t => t.surface_form)
    .map(t => {
      if (t.reading && hasKanji(t.surface_form)) {
        return { t: t.surface_form, r: toHiragana(t.reading) };
      }
      return { t: t.surface_form };
    });
}
