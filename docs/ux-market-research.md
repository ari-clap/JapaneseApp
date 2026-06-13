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

> ⚠️ **Read with [§8](#8-traveler-behavior-research--what-tourists-actually-do-2026-06-13).**
> The personas below were first sketched partly from the app's personal seed content.
> §8 is the *market-based, evidence-backed* revision and supersedes the framing here
> where they conflict. The real reachable core market is the **"effort traveler"**
> (wants to say a few things warmly), with **specific-need travelers** as the
> differentiated wedge — not the general translator-using majority.

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

### 5.3 Direct competitors — apps chasing the *same* audience

Zooming in from the broad three-camp map (§5.1) to the apps that target **our exact
user: the traveler who wants to *say things themselves* in Japanese.** This excludes
pure translators and full fluency courses, and focuses on travel-phrase / situational-
speaking apps. (Added 2026-06-13.)

| App | What it is | Pros | Cons (vs. our user's job) | Threat level |
|---|---|---|---|---|
| **SakuraSpeak** | AI speaking partner; travel role-play (order food, directions); "speak from day 1" | Modern; AI feedback on pronunciation/grammar; real travel scenarios; free to start; well-rated (4.4★); explicitly Japan-trip-positioned | It's a **practice/tutor** tool (pre-trip prep), not in-the-moment lookup; needs connectivity; no saved personal phrase deck; audio/UI rough edges | 🔴 **Highest** — closest modern overlap |
| **Falou** | AI scenario speaking app, 20+ langs, "useful on day one" | Gets you talking immediately; all lessons scenario/traveler-based | AI inconsistent for non-European langs (incl. Japanese); practice-focused, not a field phrasebook; generic across many languages | 🟠 High |
| **uTalk** | Phrasebook + speaking practice, 100+ langs, travel themes | Huge native-audio library; **record-yourself & compare**; offline mode; real-life topics (shopping, etc.) | No grammar/context; repetitive games; breadth-over-depth across 100+ langs = shallow per language; not Japan-specific | 🟠 High |
| **Bravolol — Learn Japanese / Travel Phrasebook** | Classic category phrasebook | Native audio; play-aloud to staff; offline; font resize; keyword search | **Intrusive full-screen ads** (free tier); generic, static content; can make you sound rude (no politeness nuance); dated feel | 🟡 Medium |
| **"Japanese Phrases for Travelers" / Simply Learn (many clones)** | Pre-translated phrase lists by category | Cheap/free; offline; broad coverage (700–1000+) | Static & impersonal; synthetic/uneven audio; volume-over-quality; weak/no save-your-own; inconsistent furigana/romaji control | 🟡 Medium |
| **Drops** | Visual vocab via word-image, travel topics | Beautiful UX; fun; travel/food vocab | **Words, not phrases**; can't form real sentences to say; time-gated free tier | 🟢 Low |
| **Mondly** | Scenario lessons + phrasebook, 33 langs | Conversation scenarios; built-in phrasebook; cheaper than majors (~$75/yr) | Course-paced; generic multi-language template; not trip-in-the-moment | 🟢 Low |
| **Pimsleur (survival/travel units)** | Audio-first spoken lessons | Excellent for *speaking & retention*; natural phrases | Slow, linear, expensive; audio course ≠ quick field lookup | 🟢 Low |
| **JapanesePod101 — Survival Phrases** | Podcast-style travel-phrase series | Lots of cultural context; Japan-specific; survival-focused | Passive listening; weak retention (heard 1–2×); not a quick-reference tool | 🟢 Low |

### 5.4 Insights from the direct-competitor table

1. **The lane splits into two jobs — and they're different from each other.**
   - **"Practice speaking *before* the trip"** → SakuraSpeak, Falou, uTalk, Pimsleur,
     JapanesePod101. AI tutors and audio courses. You rehearse at home.
   - **"Find & say the *right phrase during* the trip"** → Bravolol & the phrasebook
     clones. In-the-moment, offline — but **static and dumb.**
   TabiGO's slot is the **second job done modern + personalized** — and almost nobody
   occupies it well.

2. **The biggest gap nobody fills:** an **offline, in-the-moment phrasebook that is
   also smart** — AI that **generates *your* exact phrase and saves it to a reusable
   personal deck**, with a clean furigana/romaji toggle. The AI apps do AI
   *conversation practice*; none do AI *"give me the phrase I need right now and let me
   keep it."* **This is TabiGO's whitespace.**

3. **The most dangerous competitor is SakuraSpeak**, not Google. It's modern, AI-
   powered, travel-scenario-based, free, and explicitly markets to Japan-trip-takers —
   the same emotional "speak with confidence" pitch. **Differentiate hard:** TabiGO is
   *in-the-field reference + personal saved phrases + offline*, not a chat tutor. Don't
   try to out-tutor it; own the moment of *use*, not just *practice*.

4. **Recurring competitor weaknesses = TabiGO's checklist of things to nail:**
   intrusive ads (Bravolol), generic one-size content, **no politeness awareness**
   ("sounding like a rude foreigner"), shallow breadth-over-depth across dozens of
   languages, and dated UX. TabiGO can win on **clean ad-free UX, politeness-correct
   curated phrases, Japan-only depth, and offline reliability.**

5. **Volume is a trap.** Competitors compete on "1000+ phrases." Our research (§8)
   says travelers want a *small set they'll actually say*. Curation + warmth + audio
   confidence beats a bigger list.

6. **Pricing whitespace:** the field is barbell-shaped — free-with-ads phrasebooks vs.
   $75+/yr subscription courses. A **clean freemium** (free curated phrasebook; paid AI
   generation + unlimited saved phrases) fits the gap. (Validate retention first — §8.)

**Sources:** [SakuraSpeak](https://sakuraspeak.app/) ·
[Falou review (BullishLang)](https://bullishlang.com/falou-review/) ·
[uTalk review (FluentU)](https://www.fluentu.com/blog/reviews/utalk/) ·
[Bravolol Travel Phrasebook](https://bravolol.com/travel-phrasebook/) ·
[Drops review (Tofugu)](https://www.tofugu.com/japanese-learning-resources-database/drops/) ·
[Mondly review (Educational App Store)](https://www.educationalappstore.com/app/mondly-learn-33-languages) ·
[Pimsleur Japanese review (FluentU)](https://www.fluentu.com/blog/reviews/pimsleur-japanese/) ·
[JapanesePod101 Survival Phrases](https://www.japanesepod101.com/lesson-library/survival-phrases)

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

## 8. Traveler behavior research — what tourists actually do (2026-06-13)

> Added after a deliberate pass to look beyond the app's original (personal) seed
> content and understand the **broad tourist population**. This section is the
> evidence base; where it challenges earlier assumptions, the evidence wins.

### 8.1 The hard numbers
- **42.7M** international visitors in 2025 (record); structural growth + weak yen.
- **English proficiency in Japan is "Very Low"** — ranked **96th of 123** countries
  in the 2025 EF EPI. Spoken English is genuinely limited, even in big cities.
- **Communication is the #1 reported problem** for visitors (Japan Tourism Agency
  survey, 4,189 travelers, Jul–Dec 2024): **15.2%** struggled to communicate with
  restaurant/shop/station/hotel staff; **10.8%** had trouble with multilingual
  signage; only 6.1% cited Wi-Fi. Language > everything else.
- **But you *can* get by** in Tokyo/Kyoto/Osaka and tourist hotspots (bilingual
  signage, some staff English). **Rural Japan = barely any English.**

### 8.2 What tourists actually do (behavior segmentation)
The honest reality: most tourists are **task-oriented, not learning-oriented.** Ranked
by how common the behavior is:

| Behavior | How common | What it's used for | Tool |
|---|---|---|---|
| **Point the phone / translate** | **Dominant default** | Menus, signs, complex requests, anything hard | Google Translate (camera + voice), Papago, VoiceTra |
| **Speak English slowly + gestures + smile** | Very common | Quick interactions in tourist areas where staff have some English | None |
| **Workarounds to avoid talking** | Common | Taxis (written address cards), trains (IC/Suica cards), pointing at menus | Suica, screenshots |
| **Learn a *handful* of courtesy phrases** | Minority but meaningful | Greetings, "please/thank you/excuse me/sorry" | Phrasebook / app / blog list |
| **Actually study the language for the trip** | Small | Genuine effort, usually enthusiasts | Duolingo, etc. |

### 8.3 The key behavioral insight (and the honest tension)
- **Do most people want to "learn phrases"? No.** For *functional* communication, the
  default is **translation apps** — free, camera-based, good enough, owned by Google.
  This is a brutal incumbent for the "translate everything" job. **TabiGO should not
  try to beat Google Translate at translation.**
- **But there is a real, repeatedly-documented desire to say a *few* things
  themselves** — greetings, thanks, politeness, a food order. The motivation is
  **emotional/social, not functional**: Japanese people respond warmly to visible
  *effort*, and travelers want to **connect and show respect**. The mantra across
  sources is **"effort over fluency"** — it doesn't matter if it's perfect.
- These two behaviors are **not competitors — travelers do both**: courtesy phrases
  for warmth, translator for the hard stuff. The job TabiGO can own is the **"say it
  myself, warmly and correctly"** job that translators serve badly (pointing a screen
  is the *opposite* of connection) and learning apps over-serve (too slow, too much).

### 8.4 Revised audience model (market-based, not personal)
Replaces the personal-seed assumption as the primary lens. Three real segments:

| Segment | Size / willingness | What they want | TabiGO fit |
|---|---|---|---|
| **Pure translators** | Huge | Get tasks done, zero effort | ❌ Owned by Google Translate — don't fight here |
| **"Effort travelers"** (the target) | Meaningful minority, emotionally invested | A curated set of phrases they can *confidently say* to connect/show respect — greetings, courtesy, ordering, key moments | ✅ **Core market.** Pronunciation confidence (audio), reading support, "say it right" |
| **Specific-need travelers** | Niche but high-pain, high-loyalty | Reliable, **reusable** way to convey recurring specifics (diet/allergy/family/medical) that translators botch every time | ✅ **Differentiated wedge** — AI-generate once → save → reuse offline |

The original personal seed content turns out to be a vivid example of the
**specific-need** segment (vegetarian, soy-milk coffee, "this is my wife") — keep it as
*a* persona, but the **"effort traveler" is the larger reachable market.**

### 8.5 Implications for TabiGO (what the evidence changes)
1. **Reposition away from "translation" and toward "speak with confidence & respect."**
   The pitch is connection and courtesy, not utility. ("Say it yourself" was right;
   "replace your translator" would be wrong.)
2. **Pronunciation confidence is the real product value.** People fear mispronouncing.
   Audio + the ability to *practice/hear* matters more than phrase quantity. Consider
   shadowing/record-yourself later.
3. **Curation > volume.** Don't chase "1000+ phrases" like the incumbent phrasebooks.
   A tight, high-quality, *genuinely-useful-and-warm* set beats a dump. Lead with
   greetings/courtesy/food — the phrases people actually *want to say*.
4. **Two moments, two contexts:** acquisition often happens **pre-trip at home**
   (desktop/planning, learning a few phrases before departure) while use happens **on
   the street** (mobile, offline). Both UIs matter; offline is non-negotiable.
5. **The specific-need wedge (AI-generate + save) is the strongest *unique* value** —
   it's the one job neither Google nor static phrasebooks do. Protect and feature it.
6. **Don't over-invest in being comprehensive** for functional translation — link out
   to / coexist with Google Translate rather than competing with it.

### 8.6 Honest risks & what still needs primary research
- The **"effort traveler" segment may be smaller / lower willingness-to-pay** than
  hoped. This is the central commercial risk and is **not yet validated** — it needs
  primary research (traveler interviews/surveys), not just secondary reading.
- **Google Translate is free and excellent** at the functional job; any feature that
  competes head-on will lose.
- Open question to test with real users: *when people say they "want to learn a few
  phrases," will they actually open an app to do it — or just Google a list once and
  forget?* Retention is the thing to prove.

**Sources:** [Japan 2025 record visitors (Nippon.com)](https://www.nippon.com/en/japan-data/h02673/) ·
[JTA communication survey (SoraNews24)](https://soranews24.com/2025/05/08/survey-asks-foreign-tourists-what-bothered-them-in-japan-more-than-half-gave-same-answer/) ·
[Travel Voice: communication is #1 problem](https://www.travelvoice.jp/english/the-most-troublesome-thing-for-international-visitors-in-japan-is-communication-japan-tourism-agency-survey) ·
[EF English Proficiency / Japan very low (The Navigatio)](https://thenavigatio.com/do-people-in-japan-speak-english/) ·
[Travel without Japanese — effort over fluency (The Real Japan)](https://www.therealjapan.com/how-to-travel-in-japan-without-speaking-japanese/) ·
[E-Housing: navigating the language barrier](https://e-housing.jp/post/english-in-japan-where-its-spoken-and-how-to-navigate-language-barriers)

---

*Append findings, user-interview notes, and decisions below this line over time.*
