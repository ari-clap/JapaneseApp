// Auto-furigana via kuromoji (runs entirely in the browser, no API needed).
// We load kuromoji's pre-built browser bundle (/kuromoji.js) via a <script>
// tag to avoid Vite bundling it (which breaks its internal path/zlib handling).

let _tokenizer = null;
let _initPromise = null;

// Bump this if the dictionary files are ever regenerated. It's appended to the
// dict request URLs so the browser treats them as fresh resources — this also
// sidesteps any poisoned cache entry (e.g. a stale 304 returning bytes that
// were auto-decompressed when the server still sent Content-Encoding: gzip).
const DICT_VERSION = '1';

/**
 * Patch XMLHttpRequest.open ONCE so kuromoji's internal dict requests carry a
 * version query param. Only URLs matching /dict/*.gz are touched; every other
 * XHR in the app is left exactly as-is. Idempotent.
 */
function installDictCacheBuster() {
  if (XMLHttpRequest.prototype.__dictBusterInstalled) return;
  const origOpen = XMLHttpRequest.prototype.open;
  XMLHttpRequest.prototype.open = function (method, url, ...rest) {
    if (typeof url === 'string' && /\/dict\/[^?]*\.gz$/.test(url)) {
      url += (url.includes('?') ? '&' : '?') + 'v=' + DICT_VERSION;
    }
    return origOpen.call(this, method, url, ...rest);
  };
  XMLHttpRequest.prototype.__dictBusterInstalled = true;
}

/** Inject the kuromoji <script> tag and resolve when it has executed. */
function loadKuromojiScript() {
  return new Promise((resolve, reject) => {
    if (window.kuromoji) { resolve(); return; }
    const existing = document.querySelector('script[data-kuromoji]');
    if (existing) {
      existing.addEventListener('load', resolve);
      existing.addEventListener('error', reject);
      return;
    }
    const s = document.createElement('script');
    s.src = '/kuromoji.js';
    s.dataset.kuromoji = '1';
    s.onload = resolve;
    s.onerror = () => reject(new Error('Failed to load /kuromoji.js'));
    document.head.appendChild(s);
  });
}

/** Call once to load the dictionary. Safe to call multiple times. */
export function initFurigana() {
  if (_tokenizer) return Promise.resolve();
  if (_initPromise) return _initPromise;

  installDictCacheBuster();

  _initPromise = loadKuromojiScript().then(() =>
    new Promise((resolve, reject) => {
      window.kuromoji.builder({ dicPath: '/dict' }).build((err, tokenizer) => {
        if (err) { reject(err); return; }
        _tokenizer = tokenizer;
        resolve();
      });
    })
  );

  return _initPromise;
}

export const isFuriganaReady = () => _tokenizer !== null;

// ── helpers ──────────────────────────────────────────────────────────────────

function hasKanji(str) {
  return /[一-龯㐀-䶿豈-﫿]/.test(str);
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
