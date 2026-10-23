# Nafithromycin CABP Bowling Game

An interactive teaching model for scientific discussion among healthcare professionals at a medical conference. A participant picks one of three balls (azithromycin, clarithromycin, nafithromycin) and rolls it at eight pathogen pins on a 3D lane. The pins that fall come from a fixed, supplied outcome matrix. Then they review the result, open pathogen cards and compare the balls on a coverage board.

> **Draft scientific content.** Read [SCIENTIFIC_REVIEW.md](SCIENTIFIC_REVIEW.md) before any release.

## Requirements

- Node.js 20 or later (built and tested on Node 22)
- npm

No backend, database, API or network access is needed at runtime. Fonts and 3D assets are bundled or generated locally.

## Commands

```bash
npm install          # install dependencies
npm run dev          # development server at http://localhost:3000
npm test             # unit + interaction tests (Vitest)
npm run typecheck    # strict TypeScript check
npm run lint         # ESLint
npm run build        # production build
npm start            # serve the production build at http://localhost:3000
```

For a conference kiosk, run `npm run build && npm start` and open the page full-screen (F11) in Chrome or Edge, or use kiosk mode: `chrome --kiosk http://localhost:3000`.

**Touch screen (42", 37.5" × 21.1", 16:9).** Any landscape screen 1280px wide or more gets a fixed full-screen layout with no page scrolling, and the whole interface scales with the screen: 16px root text at 1920×1080, 32px at 3840×2160. A 1080p or a 4K panel therefore looks the same, just sharper. Touch handling: no double-tap zoom, no tap highlight, no long-press menu, no text selection, enlarged pin hit areas, and hover effects only on devices that can hover. Smaller or portrait screens get a scrolling, stacked layout.

Optional visual check (needs Chrome or Edge installed and the app running):

```bash
node scripts/visual-check.mjs http://localhost:3000 screenshots
```

This plays the full flow in a headless browser, saves screenshots of each state at desktop, tablet and mobile sizes, and reports console errors and horizontal overflow.

## How it works

**Game flow:** intro → pick a ball → swipe the ball up the lane → watch (about 2 s of ball travel, then the pins settle) → result → pathogen cards / coverage board → pick another ball. "Start new session" (the ↺ button in the header) is the only action that clears session history.

**Swipe to roll:** there is no ROLL button. The player swipes the ball up the lane with a finger (or drags with a mouse); the ball follows the finger and is released into the roll (`src/components/game/SwipeToRoll.tsx`). A tap, a short drag, or a sideways or downward swipe does not roll. The gesture only starts the roll: its strength never changes the ball's path, speed or the outcome. The small forward nudge while dragging fades out within 0.22 s of release (`aimOffset` in `rollAnimation.ts`). Keyboard users can focus the ball and press Enter or Space.

**Single source of truth:** every drug, pin, outcome, basis line, prompt and the disclaimer live in `src/data/`. The outcome matrix exists only in `PINS[].outcome` in `src/data/gameData.ts`. Counters, standing-pin lists, pin animations and the coverage board are all derived from it through `src/lib/gameLogic.ts`. `src/lib/outcomeValidation.ts` checks the expected totals (5 / 5 / 8) and standing pins (2, 3, 4).

**Deterministic animation:** the ball's path and timing come from `src/lib/rollAnimation.ts`, a pure function of time with no drug input. The roll timer lives in `useGameState`, not in the renderer. The 3D scene only shows the predetermined outcome; no physics engine decides anything.

**Discussion prompts:** `src/lib/promptLogic.ts` chooses at most one prompt per result. It uses the drug's own prompt first, then the 3-day-course prompt once all three balls have been rolled. It never repeats a prompt within a session, and shows nothing rather than repeat. The coverage-board prompt appears on the first visit only.

**Reveal rules:** pathogen cards and the default coverage board show a drug's outcomes only after that ball has been rolled. The board's "Full reference matrix" view shows everything, but only when the user explicitly picks it, and it is labelled as a reference view.

### Project layout

```
src/
  app/                 layout, page, global styles, interim fonts
  components/game/     GameShell (state wiring), IntroScreen, GameHeader, GameStage,
                       BowlingScene / BowlingLane / BowlingBall / PinDeck / PathogenPin (3D),
                       LaneFallback2D (no-WebGL lane + loading placeholder),
                       BallSelector / BallCard / RollButton, GameSidePanel / ResultPanel /
                       StandingPinsList / DiscussionPrompt, PathogenInfoDialog,
                       CoverageBoard, AccessiblePinList, SoundToggle, GameFooter
  components/ui/       Dialog (focus trap, Escape, focus return), RichText, StatusBadge
  data/                gameData.ts, prompts.ts  ← all supplied content
  hooks/               useGameState, useReducedMotion, useGameAudio, useWebGLSupport, useElementSize
  lib/                 gameReducer (state machine), gameLogic, promptLogic, outcomeValidation,
                       rollAnimation, laneLayout, projection, timing, brand, brandAssets, drugVisuals
  types/game.ts        shared types
```

## Branding

- **Colours:** the three brand colours (`#9A1F24` red, `#28397F` navy, `#E7A900` gold) and the neutral tones are defined once in `src/lib/brand.ts`. They are injected as CSS custom properties (`--brand-red`, `--brand-navy`, `--brand-gold`, …) and mapped to Tailwind (`bg-brand-gold`, `text-brand-navy`, …). Change a colour there and it updates everywhere, including the 3D scene.
- **Fonts:** brand fonts from `public/font/`: Acumin Variable Concept for headings, numbers and buttons (`--font-display`), Helvetica Neue for body text (`--font-body`). The browser loads Latin-subset `.woff2` copies from `public/font/web/` (see `src/app/fonts.css`). Check that the font licences allow web/kiosk embedding.
- **Favicon:** `public/favicon.ico` (16 to 256 px) and `public/apple-touch-icon.png` are the red, orange and yellow arrow mark from the MIQNAF logo (the full wordmark is unreadable at 16 px). They are linked with a version query (`?v=2`, set in `src/lib/brandAssets.ts`) because browsers cache favicons by URL; bump the version whenever the icon changes.
- **Logo:** the MIQNAF logo (`public/brand/miqnaf-logo.png`, set in `src/lib/brandAssets.ts`) appears in the header and on the intro screen. It is the supplied artwork with the background made transparent; swap in an official SVG/transparent export when available.

## Accessibility

- Every control is a real button and works from the keyboard, including the pin labels on the lane, ball cards, the ball itself (Enter or Space rolls it), coverage board rows and dialogs. Focus states are visible.
- Dialogs trap focus, close on Escape or a backdrop click, and return focus to where it was.
- A polite live region announces each roll and its result. A screen-reader-only list describes the pin deck.
- Outcomes are always shown with text and icons, never by colour alone.
- `prefers-reduced-motion: reduce` skips the roll animation and shows the end state immediately, with the same outcome and prompts.
- Sound is on by default (client request); the header switch turns it off. Browsers only allow audio after a user gesture, so audio starts on the first tap (START GAME on the kiosk). The game plays the supplied recordings in `public/soundeffects/`: the ball rolling from release, fading out as it reaches the pins, then the strike crash timed so its first hit lands exactly at impact (a little quieter when fewer pins fall). Timing lives in `src/lib/rollSound.ts`, from the same timeline as the animation. Sound is never needed to understand the result.
- Without WebGL, a 2D lane with the same outcomes, controls and timing replaces the 3D scene automatically. The same lane also covers a lost WebGL context.

## Tests

`npm test` covers:

- the outcome matrix: 8 unique pins, the supplied labels and rows, 5 / 5 / 8 pins down, standing pins 2, 3 and 4, and a cell-by-cell match to the supplied table
- verbatim ball cards and disclaimer
- the reducer: rolling locked until a ball is chosen, no double rolls, a ball change resets the lane but keeps history, stale timers ignored, reduced-motion rolls, new-session reset
- prompt logic: priority order, no repeats, prompt D eligibility, the coverage prompt shown once
- animation: the same path and timing for every drug, the expected end poses, and a bounded swipe offset that is gone shortly after release
- swipe gestures: an upward swipe rolls; a tap, short drag, sideways or downward swipe does not
- sound score: one knock per falling pin as it starts to fall and a thud as it lands, rattles only for standing pins, and the same ball timing for every drug
- the UI (jsdom, which runs the 2D fallback): disclaimer present on every screen, sound on by default and switchable off, the full roll flow, reduced motion, keyboard use, pathogen-card reveal rules, the coverage board's two views
