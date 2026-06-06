import { useState, useEffect } from "react";
import { CATS } from "./data/phrases.js";
import { store } from "./lib/store.js";
import { convertReading, convertKana, PURE_PARTICLES, addRomajiSpacing } from "./lib/romaji.js";
import { speak, stopSpeech, isSpeechSupported } from "./lib/speech.js";

const CopyIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="9" y="9" width="13" height="13" rx="2"/>
    <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/>
  </svg>
);

const SpeakerIcon = ({ playing }) => playing ? (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
    <path d="M3 9v6h4l5 5V4L7 9H3zm13.5 3c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02z"/>
  </svg>
) : (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"/>
    <path d="M19.07 4.93a10 10 0 0 1 0 14.14"/>
    <path d="M15.54 8.46a5 5 0 0 1 0 7.07"/>
  </svg>
);

function Ruby({ segs, readingMode = 'furigana' }) {
  if (readingMode === 'romaji') {
    let acc = '';
    for (const seg of segs) {
      if (seg.r) {
        // Kanji reading — never contains particles, plain conversion
        acc += convertReading(seg.r);
      } else {
        const hira = seg.t.replace(/[ァ-ヶ]/g, c => String.fromCharCode(c.charCodeAt(0) - 0x60));
        // Single-char pure particle segment → space on both sides
        if (hira.length === 1 && PURE_PARTICLES[hira]) {
          acc = acc.trimEnd() + ' ' + PURE_PARTICLES[hira] + ' ';
        } else {
          // Multi-char kana — use context-aware conversion
          acc += convertKana(seg.t, acc);
        }
      }
    }
    const spaced = addRomajiSpacing(acc.replace(/\s+/g, ' ').trim());
    return <span style={{ fontFamily: "inherit", letterSpacing: "0.01em" }}>{spaced}</span>;
  }
  return (
    <span style={{ fontFamily: "'Noto Sans JP', sans-serif" }}>
      {segs.map((s, i) =>
        s.r ? (
          <ruby key={i}>
            {s.t}
            <rt style={{ fontSize: "0.46em", color: "var(--color-text-secondary)", letterSpacing: "0.02em" }}>{s.r}</rt>
          </ruby>
        ) : (
          <span key={i}>{s.t}</span>
        )
      )}
    </span>
  );
}

function PhraseCard({ phrase, readingMode, deletable, onDelete }) {
  const [copied, setCopied] = useState(false);
  const [playing, setPlaying] = useState(false);

  const copy = () => {
    const text = phrase.segs.map(s => s.t).join("");
    navigator.clipboard?.writeText(text).catch(() => {});
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  const handleSpeak = () => {
    if (playing) {
      stopSpeech();
      setPlaying(false);
      return;
    }
    const text = phrase.segs.map(s => s.t).join("");
    speak(text, {
      onStart: () => setPlaying(true),
      onEnd: () => setPlaying(false),
    });
  };

  return (
    <div style={{
      background: "var(--color-background-primary)",
      border: "0.5px solid var(--color-border-tertiary)",
      borderRadius: "var(--border-radius-lg)",
      padding: "1rem 1.25rem",
      marginBottom: "8px",
      display: "flex",
      alignItems: "flex-start",
      justifyContent: "space-between",
      gap: "12px"
    }}>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontSize: "1.35rem", lineHeight: readingMode === 'romaji' ? "1.5" : "2.4", color: "var(--color-text-primary)" }}>
          <Ruby segs={phrase.segs} readingMode={readingMode} />
        </div>
        <div style={{ fontSize: "13px", color: "var(--color-text-secondary)", marginTop: "2px" }}>{phrase.en}</div>
      </div>
      <div style={{ display: "flex", gap: "6px", flexShrink: 0, paddingTop: "6px" }}>
        {isSpeechSupported() && (
          <button onClick={handleSpeak} title="Hear pronunciation" style={{
            background: playing ? "var(--color-background-info)" : "none",
            border: "0.5px solid var(--color-border-tertiary)",
            borderRadius: "var(--border-radius-md)",
            cursor: "pointer", padding: "4px 6px",
            color: playing ? "var(--color-text-info)" : "var(--color-text-secondary)",
            display: "flex", alignItems: "center", justifyContent: "center",
            transition: "all 0.15s"
          }}>
            <SpeakerIcon playing={playing} />
          </button>
        )}
        <button onClick={copy} title="Copy Japanese" style={{
          background: copied ? "var(--color-background-success)" : "none",
          border: "0.5px solid var(--color-border-tertiary)",
          borderRadius: "var(--border-radius-md)",
          cursor: "pointer", padding: "4px 6px",
          color: copied ? "var(--color-text-success)" : "var(--color-text-secondary)",
          display: "flex", alignItems: "center", justifyContent: "center"
        }}>
          {copied ? <span style={{ fontSize: "12px" }}>✓</span> : <CopyIcon />}
        </button>
        {deletable && (
          <button onClick={onDelete} title="Remove" style={{
            background: "none", border: "0.5px solid var(--color-border-tertiary)",
            borderRadius: "var(--border-radius-md)",
            cursor: "pointer", padding: "4px 8px",
            color: "var(--color-text-secondary)", fontSize: "12px"
          }}>✕</button>
        )}
      </div>
    </div>
  );
}

function Header({ onBack, title, subtitle, right }) {
  return (
    <div style={{
      background: "var(--color-background-primary, #ffffff)",
      borderBottom: "1px solid var(--color-border-tertiary, #e5e5e5)",
      boxShadow: "0 1px 8px rgba(0,0,0,0.06)",
      padding: "0.875rem 1.25rem",
      display: "flex", alignItems: "center", justifyContent: "space-between",
      position: "sticky", top: 0, zIndex: 10
    }}>
      <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
        {onBack && (
          <button onClick={onBack} style={{
            background: "none", border: "none", cursor: "pointer",
            color: "var(--color-text-secondary)", fontSize: "18px", padding: "0 4px", lineHeight: 1
          }}>←</button>
        )}
        <div>
          <div style={{ fontSize: "15px", fontWeight: 500, color: "var(--color-text-primary)" }}>{title}</div>
          {subtitle && (
            <div style={{ fontFamily: "'Noto Sans JP', sans-serif", fontSize: "11px", color: "var(--color-text-secondary)", fontWeight: 300 }}>
              {subtitle}
            </div>
          )}
        </div>
      </div>
      {right && <div>{right}</div>}
    </div>
  );
}

export default function App() {
  const [view, setView] = useState("home");
  const [selectedCat, setSelectedCat] = useState(null);
  const [customPhrases, setCustomPhrases] = useState([]);
  const [readingMode, setReadingMode] = useState('furigana');
  const [chatInput, setChatInput] = useState("");
  const [chatLoading, setChatLoading] = useState(false);
  const [generated, setGenerated] = useState(null);
  const [chatError, setChatError] = useState("");

  useEffect(() => {
    store.get("jp_custom_phrases").then(v => {
      if (v) { try { setCustomPhrases(JSON.parse(v)); } catch {} }
    });
  }, []);

  const persistPhrases = (phrases) => {
    setCustomPhrases(phrases);
    store.set("jp_custom_phrases", JSON.stringify(phrases));
  };

  const deletePhrase = (id) => persistPhrases(customPhrases.filter(p => p.id !== id));

  const resetChat = () => { setGenerated(null); setChatInput(""); setChatError(""); };

  const generatePhrase = async () => {
    if (!chatInput.trim() || chatLoading) return;
    setChatLoading(true);
    setChatError("");
    setGenerated(null);
    try {
      // NOTE: This calls Anthropic directly, which only works inside the Claude
      // preview environment. In production this will move behind a serverless
      // function (see the auth/AI phase) so the API key stays secret.
      const res = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          model: "claude-sonnet-4-20250514",
          max_tokens: 1000,
          system: `You are a Japanese phrase assistant for N5-N4 learners. Given an English description or phrase, return ONLY a valid JSON object with no markdown fences, no preamble, no explanation — just raw JSON:
{"en":"English translation","segs":[{"t":"text segment","r":"furigana (omit if kana only)"}]}
Rules:
- Include "r" only for kanji or kanji compounds that need furigana
- Omit "r" entirely for hiragana or katakana segments
- Split text so each kanji/compound gets its own segment with "r"
- Pure kana sequences can be single segments without "r"
- Keep vocabulary at N5-N4 level
- Return ONLY the JSON object`,
          messages: [{ role: "user", content: chatInput }]
        })
      });
      const data = await res.json();
      const raw = (data.content?.[0]?.text ?? "").replace(/```json|```/g, "").trim();
      setGenerated(JSON.parse(raw));
    } catch {
      setChatError("Could not generate a phrase. Please try again.");
    }
    setChatLoading(false);
  };

  const readingToggle = (
    <div style={{
      display: "flex",
      background: "#E9E9EB",
      borderRadius: "9px",
      padding: "2px",
      gap: "0px",
      position: "relative"
    }}>
      {[['furigana','ふりがな'],['romaji','romaji']].map(([mode, label]) => (
        <button key={mode} onClick={() => setReadingMode(mode)} style={{
          background: readingMode === mode
            ? "white"
            : "transparent",
          color: readingMode === mode ? "#000" : "#555",
          border: "none",
          borderRadius: "7px",
          padding: "4px 12px",
          cursor: "pointer",
          fontSize: "11px",
          fontFamily: mode === 'furigana' ? "'Noto Sans JP', sans-serif" : "inherit",
          fontWeight: readingMode === mode ? 600 : 400,
          boxShadow: readingMode === mode
            ? "0 1px 4px rgba(0,0,0,0.15), 0 0.5px 1px rgba(0,0,0,0.08)"
            : "none",
          transition: "all 0.2s ease",
          whiteSpace: "nowrap",
          zIndex: readingMode === mode ? 1 : 0,
          position: "relative"
        }}>{label}</button>
      ))}
    </div>
  );

  // ── Home ──────────────────────────────────────────────────────────────────
  if (view === "home") return (
    <div style={{ minHeight: "100vh", background: "var(--color-background-tertiary)" }}>
      <div style={{
        background: "var(--color-background-primary)",
        borderBottom: "0.5px solid var(--color-border-tertiary)",
        padding: "1.25rem 1.25rem 1rem",
        textAlign: "center"
      }}>
        <div style={{
          fontFamily: "'Noto Sans JP', sans-serif", fontWeight: 300,
          fontSize: "1.6rem", color: "var(--color-text-primary)", letterSpacing: "0.12em"
        }}>日本語</div>
        <div style={{
          fontSize: "11px", color: "var(--color-text-tertiary)",
          letterSpacing: "0.2em", textTransform: "uppercase", marginTop: "2px"
        }}>Phrase Guide</div>
      </div>

      <div style={{ padding: "1rem", display: "grid", gridTemplateColumns: "repeat(2, minmax(0, 1fr))", gap: "8px" }}>
        {CATS.map(cat => (
          <button key={cat.id} onClick={() => { setSelectedCat(cat); setView("category"); }} style={{
            background: "var(--color-background-primary)",
            border: "0.5px solid var(--color-border-tertiary)",
            borderTop: `3px solid ${cat.accent}`,
            borderRadius: "var(--border-radius-lg)",
            padding: "1rem",
            cursor: "pointer",
            textAlign: "left",
            display: "flex", flexDirection: "column", gap: "3px",
            transition: "border-color 0.15s"
          }}>
            <span style={{ fontSize: "20px", lineHeight: 1, marginBottom: "4px" }}>{cat.icon}</span>
            <span style={{ fontSize: "14px", fontWeight: 500, color: "var(--color-text-primary)" }}>{cat.title}</span>
            <span style={{
              fontFamily: "'Noto Sans JP', sans-serif", fontSize: "11px",
              color: "var(--color-text-secondary)", fontWeight: 300
            }}>{cat.ja}</span>
            <span style={{ fontSize: "11px", color: "var(--color-text-tertiary)", marginTop: "2px" }}>
              {cat.phrases.length} phrases
            </span>
          </button>
        ))}
      </div>

      <div style={{ padding: "0 1rem 2rem" }}>
        <button onClick={() => setView("myphrases")} style={{
          width: "100%",
          background: "var(--color-background-primary)",
          border: "0.5px solid var(--color-border-secondary)",
          borderRadius: "var(--border-radius-lg)",
          padding: "1rem 1.25rem",
          cursor: "pointer",
          display: "flex", alignItems: "center", justifyContent: "space-between"
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <span style={{ fontSize: "14px", fontWeight: 500, color: "var(--color-text-primary)" }}>My Phrases</span>
            <span style={{ fontSize: "11px", color: "var(--color-text-tertiary)", fontFamily: "'Noto Sans JP', sans-serif" }}>
              マイフレーズ
            </span>
          </div>
          <span style={{ fontSize: "12px", color: "var(--color-text-tertiary)" }}>
            {customPhrases.length} saved →
          </span>
        </button>
      </div>
    </div>
  );

  // ── Category ──────────────────────────────────────────────────────────────
  if (view === "category" && selectedCat) return (
    <div style={{ minHeight: "100vh", background: "var(--color-background-tertiary)" }}>
      <Header
        onBack={() => setView("home")}
        title={`${selectedCat.icon} ${selectedCat.title}`}
        subtitle={selectedCat.ja}
        right={readingToggle}
      />
      <div style={{ padding: "1rem" }}>
        {selectedCat.phrases.map(p => (
          <PhraseCard key={p.id} phrase={p} readingMode={readingMode} deletable={false} />
        ))}
      </div>
    </div>
  );

  // ── My Phrases ─────────────────────────────────────────────────────────────
  if (view === "myphrases") return (
    <div style={{ minHeight: "100vh", background: "var(--color-background-tertiary)" }}>
      <Header
        onBack={() => setView("home")}
        title="My Phrases"
        subtitle={`${customPhrases.length} saved`}
        right={
          <div style={{ display: "flex", gap: "8px" }}>
            {readingToggle}
            <button onClick={() => { resetChat(); setView("chat"); }} style={{
              background: "var(--color-background-primary)",
              border: "0.5px solid var(--color-border-secondary)",
              borderRadius: "var(--border-radius-md)",
              padding: "5px 12px", cursor: "pointer",
              fontSize: "13px", fontWeight: 500, color: "var(--color-text-primary)"
            }}>+ Add</button>
          </div>
        }
      />
      <div style={{ padding: "1rem" }}>
        {customPhrases.length === 0 ? (
          <div style={{ textAlign: "center", padding: "3rem 1rem" }}>
            <div style={{
              fontFamily: "'Noto Sans JP', sans-serif", fontSize: "1.5rem",
              color: "var(--color-text-tertiary)", marginBottom: "10px", fontWeight: 300
            }}>まだありません</div>
            <div style={{ fontSize: "13px", color: "var(--color-text-tertiary)", lineHeight: "1.6" }}>
              No custom phrases yet.<br />Tap <strong>+ Add</strong> to generate one with AI.
            </div>
          </div>
        ) : (
          customPhrases.map(p => (
            <PhraseCard key={p.id} phrase={p} readingMode={readingMode} deletable={true} onDelete={() => deletePhrase(p.id)} />
          ))
        )}
      </div>
    </div>
  );

  // ── Chat / Generate ────────────────────────────────────────────────────────
  if (view === "chat") return (
    <div style={{ minHeight: "100vh", background: "var(--color-background-tertiary)", display: "flex", flexDirection: "column" }}>
      <Header
        onBack={() => { resetChat(); setView("myphrases"); }}
        title="Add a phrase"
        subtitle="Describe what you want to say in English"
      />

      <div style={{ flex: 1, padding: "1rem", display: "flex", flexDirection: "column", gap: "12px" }}>
        <div style={{
          background: "var(--color-background-primary)",
          border: "0.5px solid var(--color-border-tertiary)",
          borderRadius: "var(--border-radius-lg)",
          padding: "1rem 1.25rem"
        }}>
          <div style={{
            fontSize: "11px", color: "var(--color-text-tertiary)",
            textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: "10px"
          }}>What do you want to say?</div>
          <textarea
            value={chatInput}
            onChange={e => setChatInput(e.target.value)}
            placeholder={'e.g. "How do I ask to send my luggage to another hotel?"'}
            rows={3}
            style={{
              width: "100%", border: "none", outline: "none", resize: "none",
              fontSize: "14px", lineHeight: "1.6", color: "var(--color-text-primary)",
              background: "transparent", fontFamily: "inherit",
              boxSizing: "border-box"
            }}
            onKeyDown={e => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); generatePhrase(); } }}
          />
          <div style={{ display: "flex", justifyContent: "flex-end", marginTop: "8px" }}>
            <button
              onClick={generatePhrase}
              disabled={chatLoading || !chatInput.trim()}
              style={{
                background: chatLoading || !chatInput.trim()
                  ? "var(--color-background-secondary)"
                  : "var(--color-background-primary)",
                border: "0.5px solid var(--color-border-secondary)",
                color: chatLoading || !chatInput.trim()
                  ? "var(--color-text-tertiary)"
                  : "var(--color-text-primary)",
                borderRadius: "var(--border-radius-md)",
                padding: "6px 16px", cursor: chatLoading ? "wait" : "pointer",
                fontSize: "13px", fontWeight: 500
              }}
            >
              {chatLoading ? "Generating…" : "Generate →"}
            </button>
          </div>
        </div>

        {chatError && (
          <div style={{
            fontSize: "13px", color: "var(--color-text-danger)", textAlign: "center",
            padding: "8px", background: "var(--color-background-danger)",
            borderRadius: "var(--border-radius-md)"
          }}>{chatError}</div>
        )}

        {generated && (
          <div style={{
            background: "var(--color-background-primary)",
            border: "0.5px solid var(--color-border-tertiary)",
            borderTop: "3px solid var(--color-border-info)",
            borderRadius: "var(--border-radius-lg)",
            padding: "1.25rem"
          }}>
            <div style={{
              fontSize: "11px", color: "var(--color-text-info)",
              textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: "14px"
            }}>Generated phrase</div>
            <div style={{ fontSize: "1.45rem", lineHeight: "2.6", color: "var(--color-text-primary)", marginBottom: "4px" }}>
              <Ruby segs={generated.segs} readingMode={readingMode} />
            </div>
            <div style={{ fontSize: "13px", color: "var(--color-text-secondary)", marginBottom: "16px" }}>
              {generated.en}
            </div>
            <div style={{ display: "flex", gap: "8px" }}>
              <button
                onClick={() => {
                  persistPhrases([...customPhrases, { ...generated, id: "c_" + Date.now() }]);
                  resetChat();
                  setView("myphrases");
                }}
                style={{
                  flex: 1,
                  background: "var(--color-background-primary)",
                  border: "0.5px solid var(--color-border-secondary)",
                  borderRadius: "var(--border-radius-md)",
                  padding: "10px", cursor: "pointer",
                  fontSize: "13px", fontWeight: 500, color: "var(--color-text-primary)"
                }}
              >Save phrase</button>
              <button
                onClick={resetChat}
                style={{
                  flex: 1,
                  background: "var(--color-background-secondary)",
                  border: "0.5px solid var(--color-border-tertiary)",
                  borderRadius: "var(--border-radius-md)",
                  padding: "10px", cursor: "pointer",
                  fontSize: "13px", color: "var(--color-text-secondary)"
                }}
              >Discard</button>
            </div>
          </div>
        )}
      </div>
    </div>
  );

  return null;
}
