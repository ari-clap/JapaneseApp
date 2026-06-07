import { useState, useEffect, useRef } from "react";
import { CATS } from "./data/phrases.js";
import { convertReading, convertKana, PURE_PARTICLES, addRomajiSpacing } from "./lib/romaji.js";
import { speak, stopSpeech, isSpeechSupported, getJapaneseVoices } from "./lib/speech.js";
import { supabase, isSupabaseConfigured } from "./lib/supabase.js";
import { signInWithGoogle, signOut } from "./lib/auth.js";
import { loadPhrases, addPhrase, removePhrase, migrateLocalToCloud } from "./lib/phrasesStore.js";
import { initFurigana, textToSegs, isFuriganaReady } from "./lib/furigana.js";

const GearIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="3"/>
    <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/>
  </svg>
);

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

function PhraseCard({ phrase, readingMode, deletable, onDelete, voiceName }) {
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
      voiceName,
    });
  };

  return (
    <div style={{
      background: "var(--color-background-primary)",
      border: "0.5px solid var(--color-border-tertiary)",
      borderRadius: "var(--border-radius-lg)",
      padding: "var(--spacing-card)",
      marginBottom: "8px",
      display: "flex",
      alignItems: "flex-start",
      justifyContent: "space-between",
      gap: "12px"
    }}>
      <div style={{ flex: 1, minWidth: 0 }}>
        {/* Ghost (furigana) always rendered to lock the card height.
            Active reading overlays it so the card never shifts. */}
        <div style={{ position: 'relative', fontSize: "var(--font-phrase)", color: "var(--color-text-primary)" }}>
          <div style={{ visibility: 'hidden', lineHeight: '2.4', pointerEvents: 'none', userSelect: 'none' }} aria-hidden="true">
            <Ruby segs={phrase.segs} readingMode="furigana" />
          </div>
          <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center' }}>
            <Ruby segs={phrase.segs} readingMode={readingMode} />
          </div>
        </div>
        <div style={{ fontSize: "var(--font-body)", color: "var(--color-text-secondary)", marginTop: "2px" }}>{phrase.en}</div>
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
    <div className="app-header" style={{
      background: "var(--color-background-primary, #ffffff)",
      borderBottom: "1px solid var(--color-border-tertiary, #e5e5e5)",
      boxShadow: "0 1px 8px rgba(0,0,0,0.06)",
      padding: "var(--spacing-header)",
      display: "flex", alignItems: "center", justifyContent: "space-between",
    }}>
      <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
        {onBack && (
          <button onClick={onBack} style={{
            background: "none", border: "none", cursor: "pointer",
            color: "var(--color-text-secondary)", fontSize: "var(--font-header-title)", padding: "0 4px", lineHeight: 1
          }}>←</button>
        )}
        <div>
          <div style={{ fontSize: "var(--font-header-title)", fontWeight: 500, color: "var(--color-text-primary)" }}>{title}</div>
          {subtitle && (
            <div style={{ fontFamily: "'Noto Sans JP', sans-serif", fontSize: "var(--font-label)", color: "var(--color-text-secondary)", fontWeight: 300 }}>
              {subtitle}
            </div>
          )}
        </div>
      </div>
      {right && <div>{right}</div>}
    </div>
  );
}

const GoogleIcon = () => (
  <svg width="16" height="16" viewBox="0 0 48 48">
    <path fill="#4285F4" d="M45.12 24.5c0-1.56-.14-3.06-.4-4.5H24v8.51h11.84c-.51 2.75-2.06 5.08-4.39 6.64v5.52h7.11c4.16-3.83 6.56-9.47 6.56-16.17z"/>
    <path fill="#34A853" d="M24 46c5.94 0 10.92-1.97 14.56-5.33l-7.11-5.52c-1.97 1.32-4.49 2.1-7.45 2.1-5.73 0-10.58-3.87-12.31-9.07H4.34v5.7C7.96 41.07 15.4 46 24 46z"/>
    <path fill="#FBBC05" d="M11.69 28.18C11.25 26.86 11 25.45 11 24s.25-2.86.69-4.18v-5.7H4.34C2.85 17.09 2 20.45 2 24s.85 6.91 2.34 9.88l7.35-5.7z"/>
    <path fill="#EA4335" d="M24 10.75c3.23 0 6.13 1.11 8.41 3.29l6.31-6.31C34.91 4.18 29.93 2 24 2 15.4 2 7.96 6.93 4.34 14.12l7.35 5.7c1.73-5.2 6.58-9.07 12.31-9.07z"/>
  </svg>
);

// Sign-in banner (signed out) / account info (signed in). Only shows if Supabase
// is configured; otherwise the app just runs on local storage as before.
function AccountBar({ session }) {
  if (!isSupabaseConfigured()) return null;

  if (!session) {
    return (
      <div style={{
        background: "var(--color-background-info)",
        border: "0.5px solid var(--color-border-info)",
        borderRadius: "var(--border-radius-lg)",
        padding: "var(--spacing-card)",
        marginBottom: "12px",
        display: "flex", alignItems: "center", justifyContent: "space-between", gap: "12px"
      }}>
        <div style={{ fontSize: "var(--font-body)", color: "var(--color-text-info)" }}>
          Sign in to save your phrases and sync them across devices.
        </div>
        <button onClick={signInWithGoogle} style={{
          display: "flex", alignItems: "center", gap: "8px", flexShrink: 0,
          background: "#fff", border: "0.5px solid var(--color-border-secondary)",
          borderRadius: "var(--border-radius-md)", padding: "8px 14px",
          cursor: "pointer", fontSize: "var(--font-body)", fontWeight: 500,
          color: "var(--color-text-primary)"
        }}>
          <GoogleIcon /> Sign in
        </button>
      </div>
    );
  }

  return (
    <div style={{
      display: "flex", alignItems: "center", justifyContent: "space-between", gap: "12px",
      marginBottom: "12px", padding: "0 4px"
    }}>
      <div style={{ fontSize: "var(--font-label)", color: "var(--color-text-tertiary)", minWidth: 0, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
        {session.user?.email}
      </div>
      <button onClick={signOut} style={{
        flexShrink: 0, background: "none", border: "0.5px solid var(--color-border-tertiary)",
        borderRadius: "var(--border-radius-md)", padding: "4px 12px",
        cursor: "pointer", fontSize: "var(--font-label)", color: "var(--color-text-secondary)"
      }}>
        Sign out
      </button>
    </div>
  );
}

function FuriganaBanner({ visible, bannerState, dlProgress, onDownload, onDismiss }) {
  const done = bannerState === 'complete';
  const accentColor = done ? "var(--color-border-success)" : "var(--color-border-info)";
  const iconBg     = done ? "var(--color-background-success)" : "var(--color-background-info)";
  const iconBorder = done ? "0.5px solid var(--color-border-success)" : "0.5px solid var(--color-border-info)";
  return (
    <div className={`furigana-banner-wrap${visible ? ' visible' : ''}`}>
      <div style={{
        background: "var(--color-background-primary)",
        border: "0.5px solid var(--color-border-tertiary)",
        borderLeft: `4px solid ${accentColor}`,
        borderRadius: "var(--border-radius-lg)",
        boxShadow: "0 4px 20px rgba(0,0,0,.11), 0 1px 4px rgba(0,0,0,.05)",
        padding: "13px 15px 13px 14px",
        display: "flex", flexDirection: "column", gap: "10px",
        minHeight: "82px", justifyContent: "center",
        transition: "border-left-color .5s"
      }}>
        <div style={{ display: "flex", alignItems: "flex-start", gap: "10px" }}>
          {/* Icon square */}
          <div style={{
            width: "32px", height: "32px", borderRadius: "8px",
            background: iconBg, border: iconBorder, flexShrink: 0,
            display: "flex", alignItems: "center", justifyContent: "center",
            transition: "background .5s, border-color .5s"
          }}>
            {done ? (
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor"
                strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"
                style={{ color: "var(--color-text-success)" }}>
                <polyline points="20 6 9 17 4 12"/>
              </svg>
            ) : (
              <span style={{ fontSize: "16px" }}>📚</span>
            )}
          </div>
          {/* Body */}
          <div style={{ flex: 1, minWidth: 0 }}>
            {bannerState === 'offer' && (
              <>
                <div style={{ fontSize: "var(--font-body)", fontWeight: 600, color: "var(--color-text-primary)" }}>
                  Add furigana to your phrases
                </div>
                <div style={{ fontSize: "var(--font-label)", color: "var(--color-text-tertiary)", marginTop: "2px", lineHeight: "1.4" }}>
                  One-time download · ~7 MB · works offline after
                </div>
                <div style={{ display: "flex", gap: "6px", marginTop: "8px" }}>
                  <button onClick={onDismiss} style={{
                    background: "none", border: "0.5px solid var(--color-border-secondary)",
                    borderRadius: "var(--border-radius-md)", padding: "6px 12px",
                    cursor: "pointer", fontSize: "var(--font-label)", color: "var(--color-text-secondary)", fontFamily: "inherit"
                  }}>Not now</button>
                  <button onClick={onDownload} style={{
                    background: "var(--color-background-info)", border: "0.5px solid var(--color-border-info)",
                    borderRadius: "var(--border-radius-md)", padding: "6px 14px",
                    cursor: "pointer", fontSize: "var(--font-label)", fontWeight: 600,
                    color: "var(--color-text-info)", fontFamily: "inherit"
                  }}>Download</button>
                </div>
              </>
            )}
            {bannerState === 'downloading' && (
              <>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "6px" }}>
                  <span style={{ fontSize: "var(--font-body)", fontWeight: 500, color: "var(--color-text-secondary)" }}>Downloading…</span>
                  <span style={{ fontSize: "var(--font-body)", fontWeight: 700, color: "var(--color-text-info)" }}>{dlProgress}%</span>
                </div>
                <div style={{ height: "8px", background: "#E9E9EB", borderRadius: "99px", overflow: "hidden" }}>
                  <div className="furigana-progress-fill" style={{
                    width: `${dlProgress}%`,
                    ...(dlProgress >= 100 ? { background: "linear-gradient(90deg,#7BB33A,#3B6D11)" } : {})
                  }}/>
                </div>
              </>
            )}
            {done && (
              <>
                <div style={{ fontSize: "var(--font-body)", fontWeight: 600, color: "var(--color-text-success)" }}>
                  Furigana ready
                </div>
                <div style={{ fontSize: "var(--font-label)", color: "var(--color-text-tertiary)", marginTop: "2px" }}>
                  Phrases you add will now show readings automatically.
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default function App() {
  const [view, setView] = useState("home");
  const [selectedCat, setSelectedCat] = useState(null);
  const [customPhrases, setCustomPhrases] = useState([]);
  const [readingMode, setReadingMode] = useState('furigana');
  const [jaInput, setJaInput] = useState("");
  const [enInput, setEnInput] = useState("");
  const [session, setSession] = useState(null);
  const [selectedVoice, setSelectedVoice] = useState(() => localStorage.getItem('jp_voice') || '');
  const [voices, setVoices] = useState([]);
  const [furiganaReady, setFuriganaReady] = useState(false);
  const [computedSegs, setComputedSegs] = useState(null);
  const [bannerState, setBannerState] = useState('hidden'); // hidden|offer|downloading|complete|dismissed
  const downloadSourceRef = useRef('banner'); // 'banner' | 'settings'
  const [dlProgress, setDlProgress] = useState(0);

  // Track the signed-in session (only if Supabase is configured).
  useEffect(() => {
    if (!supabase) return;
    supabase.auth.getSession().then(({ data }) => setSession(data.session));
    const { data: sub } = supabase.auth.onAuthStateChange((_event, newSession) => {
      setSession(newSession);
    });
    return () => sub.subscription.unsubscribe();
  }, []);

  // Load phrases whenever the session changes (signed in → cloud, out → local).
  // Migrating first is a no-op unless there are local phrases to push up.
  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        if (supabase && session) await migrateLocalToCloud(session);
        const phrases = await loadPhrases(session);
        if (!cancelled) setCustomPhrases(phrases);
      } catch {
        if (!cancelled) setCustomPhrases([]);
      }
    })();
    return () => { cancelled = true; };
  }, [session]);

  // Load available Japanese voices. speechSynthesis.getVoices() is async on some
  // browsers — it returns [] initially then fires voiceschanged when ready.
  useEffect(() => {
    if (!isSpeechSupported()) return;
    const load = () => {
      const jv = getJapaneseVoices();
      setVoices(jv);
      // Auto-select the first female voice (or first available) if nothing is stored yet
      if (jv.length > 0 && !localStorage.getItem('jp_voice')) {
        const firstFemale = jv.find(v => /ayumi|haruka|sayaka|kyoko|o-ren/.test(v.name.toLowerCase()));
        const pick = firstFemale || jv[0];
        setSelectedVoice(pick.name);
        localStorage.setItem('jp_voice', pick.name);
      }
    };
    load();
    window.speechSynthesis.addEventListener('voiceschanged', load);
    return () => window.speechSynthesis.removeEventListener('voiceschanged', load);
  }, []);

  // Show the offer banner the first time the user opens the Add view.
  useEffect(() => {
    if (view !== "chat") return;
    if (isFuriganaReady()) { setFuriganaReady(true); return; }
    if (bannerState === 'hidden') setBannerState('offer');
  }, [view]);

  const handleBannerDownload = () => {
    setBannerState('downloading');
    setDlProgress(0);
    // Simulate progress while kuromoji fetches its dictionary (~7 MB).
    // On localhost the dict is served from disk and loads in < 200 ms, so we
    // enforce a minimum visible animation of 2 s so the progress bar always
    // plays out. On production it loads over the network and takes longer.
    const MIN_MS = 2000;
    const startedAt = Date.now();
    let sim = 0;
    const timer = setInterval(() => {
      sim = Math.min(88, sim + Math.max(0.4, (88 - sim) * 0.055));
      setDlProgress(Math.round(sim));
    }, 180);
    initFurigana()
      .then(() => {
        const elapsed = Date.now() - startedAt;
        const remaining = Math.max(0, MIN_MS - elapsed);
        setTimeout(() => {
          clearInterval(timer);
          setDlProgress(100);
          setTimeout(() => {
            setBannerState('complete');
            setFuriganaReady(true);
            setTimeout(() => setBannerState('dismissed'), 3500);
          }, 350);
        }, remaining);
      })
      .catch(err => {
        clearInterval(timer);
        console.warn('Furigana download failed:', err);
        setBannerState('hidden');
      });
  };

  const handleBannerDismiss = () => setBannerState('dismissed');

  // Recompute segs 300 ms after the user stops typing.
  useEffect(() => {
    if (!furiganaReady || !jaInput.trim()) { setComputedSegs(null); return; }
    const t = setTimeout(() => {
      try { setComputedSegs(textToSegs(jaInput.trim())); }
      catch { setComputedSegs([{ t: jaInput.trim() }]); }
    }, 300);
    return () => clearTimeout(t);
  }, [jaInput, furiganaReady]);

  const handleVoiceChange = (name) => {
    setSelectedVoice(name);
    localStorage.setItem('jp_voice', name);
  };

  const deletePhrase = async (id) => {
    setCustomPhrases(prev => prev.filter(p => p.id !== id));
    try { await removePhrase(session, id); }
    catch { setCustomPhrases(await loadPhrases(session)); }
  };

  const savePhrase = async (phrase) => {
    const saved = await addPhrase(session, phrase);
    setCustomPhrases(prev => [...prev, saved]);
  };

  const resetForm = () => { setJaInput(""); setEnInput(""); setComputedSegs(null); };

  const handleAddPhrase = async () => {
    if (!jaInput.trim()) return;
    // Use kuromoji segs if ready, otherwise fall back to a plain segment.
    const segs = computedSegs ?? [{ t: jaInput.trim() }];
    await savePhrase({ en: enInput.trim(), segs });
    resetForm();
    setView("myphrases");
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

  const fromSettings = downloadSourceRef.current === 'settings';
  const bannerVisible =
    (bannerState === 'offer' && view === 'chat') ||
    (bannerState === 'downloading' && !fromSettings) ||
    (bannerState === 'complete'   && !fromSettings);

  const banner = (
    <FuriganaBanner
      visible={bannerVisible}
      bannerState={bannerState}
      dlProgress={dlProgress}
      onDownload={handleBannerDownload}
      onDismiss={handleBannerDismiss}
    />
  );

  // ── Home ──────────────────────────────────────────────────────────────────
  if (view === "home") return (
    <div style={{ minHeight: "100vh", background: "var(--color-background-tertiary)" }}>
      <div style={{
        background: "var(--color-background-primary)",
        borderBottom: "0.5px solid var(--color-border-tertiary)",
        padding: "var(--spacing-header)",
        textAlign: "center",
        position: "relative"
      }}>
        <div style={{
          fontFamily: "'Noto Sans JP', sans-serif", fontWeight: 300,
          fontSize: "var(--font-title-ja)", color: "var(--color-text-primary)", letterSpacing: "0.12em"
        }}>日本語</div>
        <div style={{
          fontSize: "var(--font-label)", color: "var(--color-text-tertiary)",
          letterSpacing: "0.2em", textTransform: "uppercase", marginTop: "2px"
        }}>Phrase Guide</div>
        <button onClick={() => setView("settings")} title="Settings" style={{
          position: "absolute", right: "var(--spacing-page-x)", top: "50%", transform: "translateY(-50%)",
          background: "none", border: "0.5px solid var(--color-border-tertiary)",
          borderRadius: "var(--border-radius-md)", padding: "7px 8px",
          cursor: "pointer", color: "var(--color-text-secondary)",
          display: "flex", alignItems: "center", justifyContent: "center"
        }}>
          <GearIcon />
        </button>
      </div>

      <div className="category-grid">
        {CATS.map(cat => (
          <button key={cat.id} onClick={() => { setSelectedCat(cat); setView("category"); }} style={{
            background: "var(--color-background-primary)",
            border: "0.5px solid var(--color-border-tertiary)",
            borderTop: `3px solid ${cat.accent}`,
            borderRadius: "var(--border-radius-lg)",
            padding: "var(--spacing-page-y) var(--spacing-page-x)",
            cursor: "pointer",
            textAlign: "left",
            display: "flex", flexDirection: "column", gap: "3px",
            transition: "border-color 0.15s"
          }}>
            <span style={{ fontSize: "var(--cat-icon-size)", lineHeight: 1, marginBottom: "4px" }}>{cat.icon}</span>
            <span style={{ fontSize: "var(--font-body)", fontWeight: 500, color: "var(--color-text-primary)" }}>{cat.title}</span>
            <span style={{
              fontFamily: "'Noto Sans JP', sans-serif", fontSize: "var(--font-label)",
              color: "var(--color-text-secondary)", fontWeight: 300
            }}>{cat.ja}</span>
            <span style={{ fontSize: "var(--font-label)", color: "var(--color-text-tertiary)", marginTop: "2px" }}>
              {cat.phrases.length} phrases
            </span>
          </button>
        ))}
      </div>

      <div style={{ padding: "0 var(--spacing-page-x) 2rem" }}>
        <button onClick={() => setView("myphrases")} style={{
          width: "100%",
          background: "var(--color-background-primary)",
          border: "0.5px solid var(--color-border-secondary)",
          borderRadius: "var(--border-radius-lg)",
          padding: "var(--spacing-card)",
          cursor: "pointer",
          display: "flex", alignItems: "center", justifyContent: "space-between"
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <span style={{ fontSize: "var(--font-body)", fontWeight: 500, color: "var(--color-text-primary)" }}>My Phrases</span>
            <span style={{ fontSize: "var(--font-label)", color: "var(--color-text-tertiary)", fontFamily: "'Noto Sans JP', sans-serif" }}>
              マイフレーズ
            </span>
          </div>
          <span style={{ fontSize: "var(--font-label)", color: "var(--color-text-tertiary)" }}>
            {customPhrases.length} saved →
          </span>
        </button>
      </div>
      {banner}
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
      <div style={{ padding: "var(--spacing-page-y) var(--spacing-page-x)" }}>
        {selectedCat.phrases.map(p => (
          <PhraseCard key={p.id} phrase={p} readingMode={readingMode} deletable={false} voiceName={selectedVoice} />
        ))}
      </div>
      {banner}
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
            <button onClick={() => { resetForm(); setView("chat"); }} style={{
              background: "var(--color-background-primary)",
              border: "0.5px solid var(--color-border-secondary)",
              borderRadius: "var(--border-radius-md)",
              padding: "5px 12px", cursor: "pointer",
              fontSize: "var(--font-body)", fontWeight: 500, color: "var(--color-text-primary)"
            }}>+ Add</button>
          </div>
        }
      />
      <div style={{ padding: "var(--spacing-page-y) var(--spacing-page-x)" }}>
        <AccountBar session={session} />
        {customPhrases.length === 0 ? (
          <div style={{ textAlign: "center", padding: "3rem 1rem" }}>
            <div style={{
              fontFamily: "'Noto Sans JP', sans-serif", fontSize: "var(--font-phrase)",
              color: "var(--color-text-tertiary)", marginBottom: "10px", fontWeight: 300
            }}>まだありません</div>
            <div style={{ fontSize: "var(--font-body)", color: "var(--color-text-tertiary)", lineHeight: "1.6" }}>
              No custom phrases yet.<br />Tap <strong>+ Add</strong> to save your own.
            </div>
          </div>
        ) : (
          customPhrases.map(p => (
            <PhraseCard key={p.id} phrase={p} readingMode={readingMode} deletable={true} onDelete={() => deletePhrase(p.id)} voiceName={selectedVoice} />
          ))
        )}
      </div>
      {banner}
    </div>
  );

  // ── Add a phrase (manual) ───────────────────────────────────────────────────
  if (view === "chat") {
    const inputStyle = {
      width: "100%", border: "none", outline: "none", resize: "none",
      fontSize: "var(--font-body)", lineHeight: "1.6", color: "var(--color-text-primary)",
      background: "transparent", fontFamily: "inherit", boxSizing: "border-box"
    };
    const fieldStyle = {
      background: "var(--color-background-primary)",
      border: "0.5px solid var(--color-border-tertiary)",
      borderRadius: "var(--border-radius-lg)",
      padding: "var(--spacing-card)"
    };
    const labelStyle = {
      fontSize: "var(--font-label)", color: "var(--color-text-tertiary)",
      textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: "10px"
    };
    return (
    <div style={{ minHeight: "100vh", background: "var(--color-background-tertiary)", display: "flex", flexDirection: "column" }}>
      <Header
        onBack={() => { resetForm(); setView("myphrases"); }}
        title="Add a phrase"
        subtitle="Type a Japanese phrase to save"
      />

      <div style={{ flex: 1, padding: "var(--spacing-page-y) var(--spacing-page-x)", display: "flex", flexDirection: "column", gap: "12px" }}>
        {/* Japanese phrase */}
        <div style={fieldStyle}>
          <div style={labelStyle}>Japanese phrase</div>
          <textarea
            value={jaInput}
            onChange={e => setJaInput(e.target.value)}
            placeholder="例: ありがとうございます"
            rows={2}
            style={{ ...inputStyle, fontFamily: "'Noto Sans JP', sans-serif" }}
          />
        </div>

        {/* English meaning (optional) */}
        <div style={fieldStyle}>
          <div style={labelStyle}>English meaning <span style={{ textTransform: "none", letterSpacing: 0 }}>(optional)</span></div>
          <input
            value={enInput}
            onChange={e => setEnInput(e.target.value)}
            placeholder="e.g. Thank you very much"
            style={inputStyle}
            onKeyDown={e => { if (e.key === "Enter") { e.preventDefault(); handleAddPhrase(); } }}
          />
        </div>

        {/* Live preview */}
        {jaInput.trim() && (
          <div style={{ ...fieldStyle, borderTop: "3px solid var(--color-border-info)" }}>
            <div style={{ display: "flex", alignItems: "center", marginBottom: "8px" }}>
              <div style={{ ...labelStyle, color: "var(--color-text-info)", marginBottom: 0 }}>Preview</div>
            </div>
            <div style={{ fontSize: "var(--font-phrase-generated)", lineHeight: "2.6", color: "var(--color-text-primary)" }}>
              <Ruby segs={computedSegs ?? [{ t: jaInput.trim() }]} readingMode={readingMode} />
            </div>
            {enInput.trim() && (
              <div style={{ fontSize: "var(--font-body)", color: "var(--color-text-secondary)", marginTop: "4px" }}>
                {enInput.trim()}
              </div>
            )}
          </div>
        )}

        <button
          onClick={handleAddPhrase}
          disabled={!jaInput.trim()}
          style={{
            background: jaInput.trim() ? "var(--color-background-primary)" : "var(--color-background-secondary)",
            border: "0.5px solid var(--color-border-secondary)",
            color: jaInput.trim() ? "var(--color-text-primary)" : "var(--color-text-tertiary)",
            borderRadius: "var(--border-radius-md)",
            padding: "12px", cursor: jaInput.trim() ? "pointer" : "default",
            fontSize: "var(--font-body)", fontWeight: 500
          }}
        >
          Save phrase
        </button>
      </div>
      {banner}
    </div>
    );
  }

  // ── Settings ───────────────────────────────────────────────────────────────
  if (view === "settings") {
    const femaleVoices = voices.filter(v => /ayumi|haruka|sayaka|kyoko|o-ren/.test(v.name.toLowerCase()));
    const maleVoices   = voices.filter(v => /ichiro|keita|otoya|hattori/.test(v.name.toLowerCase()));

    const currentGender = maleVoices.some(v => v.name === selectedVoice) ? 'male' : 'female';
    const voicesOfGender = currentGender === 'female' ? femaleVoices : maleVoices;
    const voiceIdx = Math.max(0, voicesOfGender.findIndex(v => v.name === selectedVoice));

    const onGenderChange = (gender) => {
      const list = gender === 'female' ? femaleVoices : maleVoices;
      if (list.length > 0) handleVoiceChange(list[0].name);
    };

    // Short display name: "Microsoft Haruka - Japanese (Japan)" → "Haruka"
    const friendlyName = selectedVoice
      ? ((selectedVoice.match(/Microsoft\s+(\w+)/) || [])[1] || selectedVoice.split(/[\s\-]/)[0])
      : '';

    const CTRL_H = "38px";
    const segBtn = (active, disabled = false, width = "52px") => ({
      background: active ? "white" : "transparent",
      color: disabled ? "#ccc" : active ? "#000" : "#555",
      border: "none",
      borderRadius: "7px",
      padding: "0",
      cursor: disabled ? "default" : "pointer",
      fontFamily: "inherit",
      fontSize: "var(--font-body)",
      fontWeight: active ? 600 : 400,
      boxShadow: active ? "0 1px 4px rgba(0,0,0,0.15), 0 0.5px 1px rgba(0,0,0,0.08)" : "none",
      transition: "all 0.2s ease",
      width,
      height: "100%",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      flexShrink: 0,
    });

    return (
      <div style={{ minHeight: "100vh", background: "var(--color-background-tertiary)" }}>
        <Header onBack={() => setView("home")} title="Settings" />
        <div style={{ padding: "var(--spacing-page-y) var(--spacing-page-x)", display: "flex", flexDirection: "column", gap: "16px" }}>

          <div style={{
            background: "var(--color-background-primary)",
            border: "0.5px solid var(--color-border-tertiary)",
            borderRadius: "var(--border-radius-lg)",
            padding: "var(--spacing-card)"
          }}>
            {/* Header row: label + selected voice name */}
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
              <div style={{ fontSize: "var(--font-label)", color: "var(--color-text-tertiary)", textTransform: "uppercase", letterSpacing: "0.1em" }}>
                Voice
              </div>
              {friendlyName && (
                <div style={{ fontSize: "var(--font-body)", color: "var(--color-text-secondary)", fontWeight: 500 }}>
                  {friendlyName}
                </div>
              )}
            </div>

            {!isSpeechSupported() ? (
              <div style={{ fontSize: "var(--font-body)", color: "var(--color-text-secondary)" }}>
                Text-to-speech is not supported in this browser.
              </div>
            ) : voices.length === 0 ? (
              <div style={{ fontSize: "var(--font-body)", color: "var(--color-text-secondary)", lineHeight: "1.6" }}>
                No Japanese voices found on this device.
              </div>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>

                {/* Gender row */}
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", height: CTRL_H }}>
                  <span style={{ fontSize: "var(--font-label)", color: "var(--color-text-tertiary)", textTransform: "uppercase", letterSpacing: "0.08em" }}>Gender</span>
                  <div style={{ display: "inline-flex", background: "#E9E9EB", borderRadius: "9px", padding: "2px", height: "100%" }}>
                    {[['female', '👩'], ['male', '👨']].map(([gender, emoji]) => {
                      const hasVoices = (gender === 'female' ? femaleVoices : maleVoices).length > 0;
                      return (
                        <button key={gender}
                          onClick={() => hasVoices && onGenderChange(gender)}
                          style={{ ...segBtn(currentGender === gender, !hasVoices, "52px"), fontSize: "1.3em" }}
                        >
                          {emoji}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Type row */}
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", height: CTRL_H }}>
                  <span style={{ fontSize: "var(--font-label)", color: "var(--color-text-tertiary)", textTransform: "uppercase", letterSpacing: "0.08em" }}>Type</span>
                  <div style={{ display: "inline-flex", background: "#E9E9EB", borderRadius: "9px", padding: "2px", height: "100%" }}>
                    {voicesOfGender.map((v, i) => (
                      <button key={v.name} onClick={() => handleVoiceChange(v.name)}
                        style={segBtn(voiceIdx === i, false, "44px")}
                      >
                        {i + 1}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Test voice — full width */}
                <button onClick={() => speak('こんにちは', { voiceName: selectedVoice || undefined })} style={{
                  width: "100%", height: CTRL_H,
                  background: "#E9E9EB", border: "none",
                  borderRadius: "var(--border-radius-md)",
                  cursor: "pointer", fontSize: "var(--font-body)", color: "var(--color-text-secondary)",
                  fontWeight: 500,
                  display: "flex", alignItems: "center", justifyContent: "center", gap: "6px"
                }}>
                  <SpeakerIcon playing={false} /> Test voice
                </button>

              </div>
            )}
          </div>

        {/* ── Furigana card ── */}
          <div style={{
            background: "var(--color-background-primary)",
            border: "0.5px solid var(--color-border-tertiary)",
            borderRadius: "var(--border-radius-lg)",
            padding: "var(--spacing-card)"
          }}>
            {/* Header row */}
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: furiganaReady ? "0" : "20px" }}>
              <div style={{ fontSize: "var(--font-label)", color: "var(--color-text-tertiary)", textTransform: "uppercase", letterSpacing: "0.1em" }}>
                Furigana
              </div>
              {furiganaReady && (
                <div style={{ display: "flex", alignItems: "center", gap: "6px", fontSize: "var(--font-body)", color: "var(--color-text-success)", fontWeight: 500 }}>
                  <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                    <circle cx="7" cy="7" r="6.5" stroke="var(--color-border-success)" strokeWidth="1"/>
                    <path d="M4 7l2.2 2.2L10 5" stroke="var(--color-text-success)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                  Ready
                </div>
              )}
            </div>

            {!furiganaReady && bannerState !== 'downloading' && (
              <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
                <div style={{ fontSize: "var(--font-body)", color: "var(--color-text-secondary)", lineHeight: "1.5" }}>
                  Download the Japanese dictionary to add furigana (reading hints) to phrases you type.
                </div>
                <button
                  onClick={() => { downloadSourceRef.current = 'settings'; handleBannerDownload(); }}
                  style={{
                    width: "100%", height: CTRL_H,
                    background: "var(--color-border-info)", border: "none",
                    borderRadius: "var(--border-radius-md)",
                    cursor: "pointer", fontSize: "var(--font-body)", fontWeight: 500, color: "#fff",
                    display: "flex", alignItems: "center", justifyContent: "center", gap: "6px",
                  }}
                >
                  Download (~7 MB)
                </button>
              </div>
            )}

            {/* Inline progress — only shown when download was triggered from this card */}
            {!furiganaReady && bannerState === 'downloading' && downloadSourceRef.current === 'settings' && (
              <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <span style={{ fontSize: "var(--font-body)", color: "var(--color-text-secondary)" }}>Downloading…</span>
                  <span style={{ fontSize: "var(--font-body)", fontWeight: 700, color: "var(--color-text-info)" }}>{dlProgress}%</span>
                </div>
                <div style={{ height: "8px", background: "#E9E9EB", borderRadius: "99px", overflow: "hidden" }}>
                  <div className="furigana-progress-fill" style={{
                    width: `${dlProgress}%`,
                    ...(dlProgress >= 100 ? { background: "linear-gradient(90deg,#7BB33A,#3B6D11)" } : {})
                  }} />
                </div>
              </div>
            )}
          </div>

        </div>
        {banner}
      </div>
    );
  }

  return null;
}
