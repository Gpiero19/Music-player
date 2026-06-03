# Drum Pad

A browser-based drum pad and metronome built with React. Play eight drum sounds via keyboard or mouse, record your performance, and replay it with accurate timing.

![Drum Pad Screenshot](./src/assets/Screenshot-Music-player.png)

---

## Live Demo

[https://Gpiero19.github.io/Music-player/](https://Gpiero19.github.io/Music-player/)

---

## Features

- 8 drum pad keys mapped to keyboard shortcuts (A S D F H J K L)
- Metronome with adjustable BPM (40–240), visual running indicator
- Record a performance and replay it with the original timing
- Stores up to 5 recent recordings — persisted across page refreshes via localStorage
- Responsive layout — works on desktop and mobile
- Accessible: ARIA labels on all interactive controls, respects `prefers-reduced-motion`

---

## Tech Stack

- [React 19](https://react.dev/) — functional components, hooks (useState, useEffect, useRef, useMemo, useCallback)
- [Vite 7](https://vitejs.dev/) — build tooling and dev server
- Web Audio API — HTMLAudioElement with pre-created audio pools for low-latency playback
- localStorage — lightweight persistence for recordings and session counter
- [gh-pages](https://github.com/tschaub/gh-pages) — deployment to GitHub Pages

---

## Getting Started

```bash
git clone https://github.com/Gpiero19/Music-player.git
cd Music-player
npm install
npm run dev
```

Open [http://localhost:5173](http://localhost:5173) in your browser.

---

## Available Scripts

| Script | Description |
|--------|-------------|
| `npm run dev` | Start the development server |
| `npm run build` | Build for production |
| `npm run lint` | Run ESLint |
| `npm run deploy` | Build and deploy to GitHub Pages |

---

## What I Learned

- **React hooks in practice** — managing audio state, recording timers, and playback with `useRef`, `useCallback`, and `useMemo` without unnecessary re-renders.
- **Audio performance** — pre-creating `HTMLAudioElement` objects at mount time rather than on every keypress to avoid latency and GC pressure.
- **Async playback with cancellation** — driving a timed playback loop with `setTimeout` promises and a ref-based abort flag so playback can be stopped mid-sequence.
- **localStorage persistence** — serializing and restoring structured state (recording history) across sessions with safe JSON parsing.
- **Accessibility** — adding ARIA labels to non-descriptive controls and respecting the `prefers-reduced-motion` media query for animations.
