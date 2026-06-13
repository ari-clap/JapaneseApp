# TabiGO たびご — UX & Market Research

> Living document. Last updated: **2026-06-13**.
> This is the strategic source of truth for TabiGO. Product, content, and design
> decisions should trace back to the audience and positioning defined here.

---

## 0. What TabiGO is (one sentence)

**A situational Japanese phrasebook for travelers who want to *say it themselves* —
with furigana/romaji reading support, native-style audio, AI-generated phrases for
your exact situation, and a personal saved-phrase deck.**

It is **not** a language course (Duolingo) and **not** a raw translator (Google
Translate). It lives in the gap between them — see [§5](#5-market-research).

---

## 1. Who is the audience?

### Macro context (why now)
- Japan hit a **record 42.7M international visitors in 2025** (+15.8% YoY; first
  time over 40M; ~10M above the 2019 pre-pandemic peak). Inbound tourism is
  structurally booming.
- The **weak yen** (~¥150/USD vs ~¥110 in 2019) keeps driving demand and
  repeat visits.
- Spending splits: **accommodation ~37%, shopping ~25%, food & beverage ~22%** —
  i.e. the exact situations TabiGO's categories cover (Hotel, Shopping, Food).
- Demographics skew toward **younger travelers (notably women under 30)** favoring
  flexible solo travel, plus a strong **family-vacation** segment.
- Top *source* markets are Korea & China (served by their own-language tools).
  The **English ↔ Japanese** wedge serves Western + global-English travelers — a
  large segment underserved by *good UX* (most English phrasebooks are dated).

### Primary persona — "The considerate independent traveler"
- English-speaking, ~25–45, traveling independently (not a tour group).
- Wants to **attempt speaking Japanese**, not hold a phone screen at a waiter.
- Politeness-conscious — wants to be respectful (the built-in content is full of
  *"May I…?" / "…please"* forms, which is a deliberate, defining trait).
- Uses the app **in the moment, on the street, often offline or on flaky data.**

### Embedded persona (visible in the seed content) — "The particular/repeat traveler"
The seed phrases reveal a real, specific user: a **couple** traveling together
("this is my wife", "we are from…") with **specific recurring needs** —
vegetarian/pescatarian dining, "no beef/pork/chicken, fish is ok", and very
particular **coffee orders** (americano, soy milk on the side, iced/hot). This is
the killer use case: **people whose needs are specific and repeated**, for whom a
generic phrasebook is useless and a translator is slow and error-prone every single
time. They want to **save their phrases once and reuse them.**

### Secondary personas
| Persona | Need | Fit |
|---|---|---|
| **Short-term resident / digital nomad / exchange student** | Survival Japanese, not JLPT | Save-your-own + situational categories |
| **Pre-trip dabbler** | A handful of phrases before departure | Browse + listen on desktop while planning |
| **Dietary-restricted traveler** (vegan, allergy, religious) | Reliable, reusable way to communicate restrictions | AI-generate once → save → speak/show every meal |

### Explicitly NOT the audience (for now)
- Serious language learners pursuing fluency / JLPT (→ Duolingo, LingoDeer, Anki).
- People who just want a machine to translate arbitrary text (→ Google Translate).
- Business/professional interpreters needing accuracy guarantees.

---

## 2. What content do I *want* the app to have? (full vision)

**A. Situational phrase library** (the spine of the product)
- Categories matched to real travel moments. Current 6: Help, Directions, Food,
  Shopping, Greetings, Hotel.
- Wishlist additions: **Transport/Trains** (huge in Japan — IC cards, platforms,
  reserved seats), **Money/Payment** (cash vs card, tax-free), **Health/Pharmacy**,
  **Convenience store/Konbini**, **Temples & etiquette**, **Nightlife/Izakaya**,
  **With kids / family**, **Connectivity (SIM/Wi-Fi)**.

**B. Reading & pronunciation support** (the differentiator)
- Furigana ⇄ romaji ⇄ kana-off toggle (already built via kuromoji, offline).
- Native-style **text-to-speech** on every phrase; ideally adjustable speed.
- (Future) record-yourself / shadowing to build speaking confidence.

**C. Personalization** (the moat)
- **AI phrase generation** for the user's exact situation.
- **Save-your-own** personal deck ("My Phrases"), synced across devices.
- (Future) phrase variables/blanks (name, country, number) and quick-edit.

**D. Confidence & context (future)**
- Politeness-level awareness (casual vs polite — already politeness-leaning).
- "Show this to staff" large-text / show-screen mode as a fallback when speaking fails.
- Cultural micro-tips per category (e.g. how to pay, bowing, slurping is fine).

**E. Accounts & sync**
- Optional Google login; cloud sync of saved phrases & settings (Supabase).

---

## 3. What content do I *need* for the MVP?

Ship the **smallest thing that proves the wedge**: "I can confidently say the right
thing in a real situation, offline, in my own words."

### MVP — must have
- [x] **Core situational categories** (the existing 6 cover survival well).
- [x] **Furigana / romaji toggle** (offline, already working).
- [x] **Text-to-speech** on every phrase.
- [x] **Save-your-own / My Phrases.**
- [x] **AI phrase generation** (online-only — acknowledge the constraint).
- [x] **Optional Google login + cloud sync.**
- [ ] **Full offline support for the built-in phrasebook + saved phrases** ← critical
      for travelers; verify TTS/furigana work without data. AI generation can stay
      online-only as long as that's clear in the UI.
- [ ] **Installable PWA** (add-to-home-screen, app icon, offline shell).
- [ ] Add **Transport/Trains** and **Money/Payment** categories (highest-frequency
      gaps for the persona).

### MVP — nice to have (cut if needed)
- Adjustable TTS speed.
- "Show to staff" large-text mode.
- Phrase search across all categories.

### Defer past MVP
- SRS / quizzes / learning progression (that's a different product).
- Dictionary word-lookup.
- Live conversation/translation mode.
- Social, sharing, community decks.
- Monetization (validate retention first).

---

## 4. General layout (platform & UI structure)

### Platform
- **PWA, mobile-first, installable.** Web removes app-store friction and works
  cross-platform from one codebase (already the chosen path: React + Vite + Vercel).
- **Offline is a first-class requirement**, not a nice-to-have — the primary use is
  on Japanese streets with limited data. Built-in dictionary (kuromoji) is already
  local; the phrasebook and saved phrases must work fully offline.
- **Desktop/tablet matters too** for the *pre-trip planning* moment (browse + listen
  while planning the trip from home).

### UI structure (current direction — keep)
- **Mobile:** bottom nav bar (planned in code) — Phrases · My Phrases · Add/Generate ·
  Settings/Profile. Big tap targets, one-hand use, fast.
- **Desktop/tablet (≥700px):** persistent **left sidebar** (just built) with logo,
  nav, and profile.
- **Views:** Home (category grid) → Category (phrase list) · My Phrases · Add/Generate ·
  Settings · Profile.
- **Phrase card** is the atomic unit: Japanese (with toggle) + English + 🔊 audio +
  save/delete. Keep it clean, legible, fast.

### Design language
- Calm, trustworthy, slightly premium "travel companion" feel (warm off-white,
  vermillion/hanko-seal accent — the TabiGO たびご brand). Avoid the gamified,
  loud, cartoon aesthetic of learning apps — the user is a traveler, not a student.

---

## 5. Market research

The market splits into **three camps**. TabiGO's opportunity is to sit deliberately
between them.

### 5.1 Competitor map

| Product | Camp | What it is | Pros | Cons (for *our* traveler) | Price |
|---|---|---|---|---|---|
| **Google Translate** | Translator | Universal text/voice/camera translation | Free; camera & conversation mode; offline packs; shows kanji+kana+romaji | Robotic/awkward mid-conversation; **errors on nuanced/polite requests**; you point a phone instead of speaking; no learning or personal deck | Free |
| **DeepL** | Translator | High-quality text translation | More natural phrasing than most | Weaker mobile/travel UX; no real phrasebook/audio-for-travel flow; online-leaning | Free / Pro |
| **Papago (Naver)** | Translator | Asian-language translator | Often more natural for JA/KO; conversation mode | Same translator drawbacks; less known to Western users | Free |
| **"Japanese Phrasebook / Phrases for Travelers" apps** (many) | Phrasebook | Pre-translated lists, 700–1000+ phrases by category, native/synthetic audio | Cheap/free; offline; broad coverage; native audio | **Static & generic** (can't fit *your* situation); often **dated UIs**; no AI; weak/no save-your-own; inconsistent furigana/romaji control | Free + Pro |
| **Duolingo** | Learning | Gamified course | Free; habit-forming; huge brand | **Too much kanji too early, no furigana toggle**; unnatural sentences; not situational; **won't make you trip-ready in time** | Free / Super |
| **LingoDeer** | Learning | Structured beginner course | Better grammar structure than Duolingo; good for JA/KO | **No conversation/speaking practice**; plateaus ~N4; course pace ≠ trip-ready | Subscription |
| **Pimsleur** | Learning (audio) | Audio-first spoken courses | Strong for **speaking/listening**; natural phrases | Slow; expensive; not situational lookup; not a phrasebook | Subscription |
| **Rosetta Stone / Busuu / Rocket** | Learning | Full courses | Comprehensive | Overkill, slow, costly for a traveler | Subscription |
| **Anki / Memrise** | Learning (SRS) | Flashcard memorization | Powerful retention | DIY, steep, not in-the-moment | Free / Paid |
| **Phrasebook *books*** (Lonely Planet etc.) | Print | Paper phrasebook | No battery/data; trustworthy | No audio; slow to find; no personalization | One-off |

### 5.2 Camp-level insight

| Camp | Core promise | Where it fails our traveler | TabiGO's counter |
|---|---|---|---|
| **Translators** | "Translate anything, now" | Generic, error-prone on nuance, encourages screen-pointing over speaking, weak learning/recall | Curated + AI-tailored phrases you **rehearse and own**, with reading + audio so you can **say it** |
| **Phrasebooks** | "Common phrases, ready offline" | Static, can't fit *your* specifics, dated UX, weak personalization | **AI-generate for your exact need + save it**, modern UX, clean furigana/romaji toggle |
| **Learning apps** | "Become able to speak (eventually)" | Too slow for a trip, gamified, kanji-heavy, not situational | **Trip-ready instantly**, situational, confidence-first, no grind |

---

## 6. Strategic positioning & differentiation

**Positioning statement:**
> For independent travelers to Japan who want to *speak for themselves* rather than
> point at a translation screen, **TabiGO** is a situational phrasebook that pairs
> curated, polite, real-life phrases with furigana/romaji reading support, native
> audio, and **AI-generated, savable phrases for your exact situation** — so you walk
> in already knowing what to say.

**The defensible wedge (do these better than anyone):**
1. **AI-generated + saved personal deck** — the bridge translators and static
   phrasebooks both lack. Built for the *specific, repeated* need (vegetarian, soy
   milk, allergies, "this is my wife").
2. **Reading scaffolding done right** — furigana ⇄ romaji ⇄ off toggle that learning
   apps (notably Duolingo) and many phrasebooks get wrong.
3. **Confidence to speak** — audio + clean cards so the user *says it*, not shows it.
4. **Offline-first PWA** — works on the street, no app-store friction.
5. **Calm, premium travel-companion design** — not a gamified classroom.

**One-line elevator pitch:** *"Say it yourself in Japan — a smart phrasebook that
speaks your situation."*

---

## 7. Open questions / decisions to revisit

- **Offline AI?** AI generation needs a network. Confirm graceful UX when offline
  (queue? clear messaging? cache generated phrases for offline reuse — yes, once
  saved they must be offline).
- **Monetization model** — freemium (free phrasebook, paid AI generation / unlimited
  saves)? Decide *after* validating retention, not before.
- **Politeness levels** — expose casual vs polite explicitly, or stay polite-only for
  MVP? (Lean polite-only for MVP.)
- **Which categories next** beyond Transport & Money — validate with target users.
- **Audio source** — browser TTS (free, current) vs higher-quality voices (cost) —
  quality is a differentiator vs synthetic-audio phrasebooks; revisit.
- **Localization of the *source* language** — English-first now; Korea/China are the
  biggest inbound markets long-term.

---

*Append findings, user-interview notes, and decisions below this line over time.*
