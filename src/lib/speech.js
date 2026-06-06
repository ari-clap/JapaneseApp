export const isSpeechSupported = () => 'speechSynthesis' in window;

export function speak(text, { onStart, onEnd } = {}) {
  if (!isSpeechSupported()) return;
  window.speechSynthesis.cancel();
  const utterance = new SpeechSynthesisUtterance(text);
  utterance.lang = 'ja-JP';
  utterance.rate = 0.85; // slightly slower for clarity
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
