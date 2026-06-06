export const isSpeechSupported = () => 'speechSynthesis' in window;

// Returns all voices whose lang starts with "ja". May be empty on first call
// in some browsers — listen for the voiceschanged event to repopulate.
export function getJapaneseVoices() {
  if (!isSpeechSupported()) return [];
  return window.speechSynthesis.getVoices().filter(v => v.lang.startsWith('ja'));
}

export function speak(text, { onStart, onEnd, voiceName } = {}) {
  if (!isSpeechSupported()) return;
  window.speechSynthesis.cancel();
  const utterance = new SpeechSynthesisUtterance(text);
  utterance.lang = 'ja-JP';
  utterance.rate = 0.85; // slightly slower for clarity
  if (voiceName) {
    const voice = window.speechSynthesis.getVoices().find(v => v.name === voiceName);
    if (voice) utterance.voice = voice;
  }
  if (onStart) utterance.onstart = onStart;
  if (onEnd) {
    utterance.onend = onEnd;
    utterance.onerror = onEnd;
  }
  window.speechSynthesis.speak(utterance);
}

export function stopSpeech() {
  if (isSpeechSupported()) window.speechSynthesis.cancel();
}
