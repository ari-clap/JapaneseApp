# 日本語 Phrase Guide

A Japanese phrase-learning web app: browse phrases by category with furigana/romaji
toggle, save your own phrases, and generate new ones with AI.

## Tech stack

- **React 18** + **Vite** — fast build, instant dev reload
- Plans (in progress): **Supabase** (Google login + database), **Vercel** (hosting),
  text-to-speech, and a Japanese dictionary API

## Getting started

```bash
npm install      # one time
npm run dev      # start dev server → http://localhost:5173
```

Other commands:

```bash
npm run build    # production build into dist/
npm run preview  # preview the production build locally
```

## Project structure

```
index.html            App shell + global styles / CSS variables
src/
  main.jsx            React entry point
  App.jsx             Main app + screens (home, category, my phrases, add)
  data/phrases.js     Built-in phrase categories
  lib/romaji.js       Kana → romaji conversion (with particle detection)
  lib/store.js        Key/value persistence (localStorage; → Supabase later)
```

## Deploying to Vercel

1. Push this repo to GitHub.
2. On [vercel.com](https://vercel.com), **New Project → Import** the GitHub repo.
3. Vercel auto-detects Vite (build: `npm run build`, output: `dist`). Click **Deploy**.
4. Every `git push` redeploys automatically.

> Secrets (API keys) must **never** be committed. They go in Vercel's
> Environment Variables and are used only by serverless functions — see the roadmap.

## Roadmap

1. ✅ **Foundation** — Vite build + deploy to a live URL
2. **Voice** — free browser text-to-speech for every phrase
3. **Accounts** — Supabase Google login; sync "My Phrases" to a database
4. **Dictionary** — Japanese word lookups (Jotoba / JMdict)
5. **Monetization** — Stripe + premium features
