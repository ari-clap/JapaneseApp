// Kana → romaji conversion with particle detection.
// Exposes convertReading (plain, for kanji readings), convertKana (context-aware,
// for kana-only segments), PURE_PARTICLES, and addRomajiSpacing.

const ROMAJI_MAP = {
  'きゃ':'kya','きゅ':'kyu','きょ':'kyo','しゃ':'sha','しゅ':'shu','しょ':'sho',
  'ちゃ':'cha','ちゅ':'chu','ちょ':'cho','にゃ':'nya','にゅ':'nyu','にょ':'nyo',
  'ひゃ':'hya','ひゅ':'hyu','ひょ':'hyo','みゃ':'mya','みゅ':'myu','みょ':'myo',
  'りゃ':'rya','りゅ':'ryu','りょ':'ryo','ぎゃ':'gya','ぎゅ':'gyu','ぎょ':'gyo',
  'じゃ':'ja','じゅ':'ju','じょ':'jo','びゃ':'bya','びゅ':'byu','びょ':'byo',
  'ぴゃ':'pya','ぴゅ':'pyu','ぴょ':'pyo',
  'あ':'a','い':'i','う':'u','え':'e','お':'o',
  'か':'ka','き':'ki','く':'ku','け':'ke','こ':'ko',
  'さ':'sa','し':'shi','す':'su','せ':'se','そ':'so',
  'た':'ta','ち':'chi','つ':'tsu','て':'te','と':'to',
  'な':'na','に':'ni','ぬ':'nu','ね':'ne','の':'no',
  'は':'ha','ひ':'hi','ふ':'fu','へ':'he','ほ':'ho',
  'ま':'ma','み':'mi','む':'mu','め':'me','も':'mo',
  'や':'ya','ゆ':'yu','よ':'yo',
  'ら':'ra','り':'ri','る':'ru','れ':'re','ろ':'ro',
  'わ':'wa','を':'wo','ん':'n',
  'が':'ga','ぎ':'gi','ぐ':'gu','げ':'ge','ご':'go',
  'ざ':'za','じ':'ji','ず':'zu','ぜ':'ze','ぞ':'zo',
  'だ':'da','ぢ':'ji','づ':'zu','で':'de','ど':'do',
  'ば':'ba','び':'bi','ぶ':'bu','べ':'be','ぼ':'bo',
  'ぱ':'pa','ぴ':'pi','ぷ':'pu','ぺ':'pe','ぽ':'po',
};

// Plain kana→romaji, no particle detection (used for kanji readings)
export function convertReading(str) {
  const hira = str.replace(/[ァ-ヶ]/g, c => String.fromCharCode(c.charCodeAt(0) - 0x60));
  let result = '';
  let i = 0;
  while (i < hira.length) {
    if (hira[i] === 'っ') {
      const nxt = ROMAJI_MAP[hira.slice(i+1,i+3)] || ROMAJI_MAP[hira[i+1]] || '';
      result += nxt[0] || 't'; i++; continue;
    }
    if (hira[i] === 'ー') {
      const lastVowel = [...result.trimEnd()].reverse().find(c => 'aeiou'.includes(c));
      result += lastVowel || ''; i++; continue;
    }
    const two = ROMAJI_MAP[hira.slice(i, i+2)];
    if (two !== undefined) { result += two; i += 2; continue; }
    const one = ROMAJI_MAP[hira[i]];
    if (one !== undefined) { result += one; i++; continue; }
    result += hira[i]; i++;
  }
  return result;
}

// Kana→romaji WITH particle detection (used for kana-only segments)
export function convertKana(str, ctx) {
  const hira = str.replace(/[ァ-ヶ]/g, c => String.fromCharCode(c.charCodeAt(0) - 0x60));
  let result = '';
  let i = 0;
  while (i < hira.length) {
    if (hira[i] === 'っ') {
      const nxt = ROMAJI_MAP[hira.slice(i+1,i+3)] || ROMAJI_MAP[hira[i+1]] || '';
      result += nxt[0] || 't'; i++; continue;
    }
    if (hira[i] === 'ー') {
      const lastVowel = [...(ctx + result).trimEnd()].reverse().find(c => 'aeiou'.includes(c));
      result += lastVowel || ''; i++; continue;
    }
    // は → wa (particle) or ha (word-start / おはよう)
    if (hira[i] === 'は') {
      const prev = (ctx + result).slice(-1);
      const ahead = hira.slice(i + 1, i + 4);
      const isOhayou = prev === 'o' && /^よう?/.test(ahead);
      const isParticle = !isOhayou && (ctx + result).length > 0 && 'aeioun'.includes(prev);
      result += isParticle ? ' wa ' : 'ha';
      i++; continue;
    }
    // に → ni particle (only after vowel, not after n → avoids こんにちは issue)
    if (hira[i] === 'に') {
      const prev = (ctx + result).slice(-1);
      const isParticle = (ctx + result).length > 0 && 'aeiou'.includes(prev);
      result += isParticle ? ' ni ' : 'ni';
      i++; continue;
    }
    // を → always "o"
    if (hira[i] === 'を') { result += ' o '; i++; continue; }
    const two = ROMAJI_MAP[hira.slice(i, i+2)];
    if (two !== undefined) { result += two; i += 2; continue; }
    const one = ROMAJI_MAP[hira[i]];
    if (one !== undefined) { result += one; i++; continue; }
    result += hira[i]; i++;
  }
  return result;
}

// Single-char pure particles
export const PURE_PARTICLES = {'は':'wa','を':'o','が':'ga','に':'ni','で':'de','の':'no','と':'to','も':'mo','へ':'e','や':'ya'};

export function addRomajiSpacing(r) {
  // Specific が patterns before arimasu/amari rules run
  r = r.replace(/([a-z])(ga)( )/g, '$1 $2 ');
  // の possessive particle
  r = r.replace(/([aeioun])(no)([a-z])/g, '$1 no $3');
  // Verb endings
  r = r.replace(/([aeiou])(kudasai)/g, '$1 $2');
  r = r.replace(/([aeioun])(itadake)/g, '$1 $2');
  r = r.replace(/([aeioun])(gozaimasu)/g, '$1 $2');
  r = r.replace(/([aeioun])(onegai)/g, '$1 $2');
  r = r.replace(/([aeioun])(shimasu)/g, '$1 $2');
  r = r.replace(/([aeioun])(dekimasu)/g, '$1 $2');
  r = r.replace(/([aeioun])(arimasu)(ka)?(?![a-z])/g, (_, a, b, c) => `${a} ${b}${c ? ' ka' : ''}`);
  r = r.replace(/([aeioun])(arimasen)(ka)?(?![a-z])/g, (_, a, b, c) => `${a} ${b}${c ? ' ka' : ''}`);
  r = r.replace(/([aeioun])(imasu)(ka)?(?![a-z])/g, (_, a, b, c) => `${a} ${b}${c ? ' ka' : ''}`);
  r = r.replace(/([aeioun])(wakarimasen)/g, '$1 $2');
  r = r.replace(/([aeioun])(desu)(ka)?(?![a-z])/g, (_, a, b, c) => `${a} ${b}${c ? ' ka' : ''}`);
  r = r.replace(/([aeioun])(masu)(ka)?(?![a-z])/g, (_, a, b, c) => `${a} ${b}${c ? ' ka' : ''}`);
  r = r.replace(/([aeioun])(masen)(ka)?(?![a-z])/g, (_, a, b, c) => `${a} ${b}${c ? ' ka' : ''}`);
  r = r.replace(/([aeioun])(mashita)/g, '$1 $2');
  r = r.replace(/([aeioun])(mashou)/g, '$1 $2');
  // Common words
  r = r.replace(/([aeioun])(doko)/g, '$1 $2');
  r = r.replace(/([aeioun])(nanji)/g, '$1 $2');
  r = r.replace(/([aeioun])(amari)/g, '$1 $2');
  r = r.replace(/([aeioun])(itsu)/g, '$1 $2');
  return r.replace(/\s+/g, ' ').trim();
}
