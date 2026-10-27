
import type { Drug, DrugId, Pin } from "@/types/game";

export const GAME_TITLE = "CABP Challenge";
export const GAME_SUBTITLE = "Conventional Therapy vs Novel Therapy";
export const GAME_TAGLINE = "Knock down the barriers";

export const FOOTER_NOTE =
  "For scientific discussion among healthcare professionals. Pin outcomes are a teaching model built from published in vitro and clinical data. They do not replace the prescribing information, local antibiograms or clinical judgement.";

export const DISCLAIMER =
  "Disclaimer: This material is intended for scientific and educational purposes only. Views expressed by healthcare professionals are based on their individual clinical experience and are not intended as medical advice or endorsement of any brand or company.";

/** Therapy selection (Screen 1, after the name). */
export const THERAPY_INTRO = [
  "Every CABP patient presents multiple treatment challenges beyond pathogen eradication.",
  "How effective is your preferred conventional treatment strategy at knocking down these barriers?",
] as const;
export const THERAPY_HEADING = "Choose Your Therapy";

/** The doctor picks one conventional combination for Frame 1. */
export const CONVENTIONAL_BALLS: readonly DrugId[] = ["amoxiclavAzithro", "amoxiclavClarithro"];
/** Frame 2: presented automatically; the doctor never chooses it. */
export const NOVEL_BALL: DrugId = "miqnaf";

export const DRUGS: Readonly<Record<DrugId, Drug>> = {
  amoxiclavAzithro: {
    id: "amoxiclavAzithro",
    name: "Amoxi-Clav + Azithromycin",
    drugClass: "Conventional therapy",
    description: "Amoxicillin/clavulanate with azithromycin.",
  },
  amoxiclavClarithro: {
    id: "amoxiclavClarithro",
    name: "Amoxi-Clav + Clarithromycin",
    drugClass: "Conventional therapy",
    description: "Amoxicillin/clavulanate with clarithromycin.",
  },
  miqnaf: {
    id: "miqnaf",
    name: "Nafithromycin",
    drugClass: "Novel therapy",
    description: "MIQNAF® (nafithromycin).",
  },
};

const D = "down" as const;
const S = "standing" as const;
/** The shaking pin: rocks but stays up (counts as standing, scored as half). */
const W = "wobble" as const;

export const PINS: readonly Pin[] = [
  { number: 1, label: "Susceptibility", name: ["Susceptibility Vs CABP Pathogens"], outcome: { amoxiclavAzithro: W, amoxiclavClarithro: W, miqnaf: D } },
  { number: 2, label: "Bactericidal", name: ["Bactericidal Activity"], outcome: { amoxiclavAzithro: D, amoxiclavClarithro: D, miqnaf: D } },
  { number: 3, label: "Compliance", name: ["Patient Compliance"], outcome: { amoxiclavAzithro: S, amoxiclavClarithro: S, miqnaf: D } },
  { number: 4, label: "GI side effects", name: ["GI Side Effects"], outcome: { amoxiclavAzithro: S, amoxiclavClarithro: S, miqnaf: D } },
  { number: 5, label: "QT prolongation", name: ["QT Prolongation"], outcome: { amoxiclavAzithro: S, amoxiclavClarithro: S, miqnaf: D } },
  { number: 6, label: "Atypicals", name: ["Atypical Coverage"], outcome: { amoxiclavAzithro: D, amoxiclavClarithro: D, miqnaf: D } },
  { number: 7, label: "Anti-inflam.", name: ["Anti-Inflammatory / Immunomodulatory Activity"], outcome: { amoxiclavAzithro: D, amoxiclavClarithro: D, miqnaf: D } },
  { number: 8, label: "AMR", name: ["Managing AMR"], outcome: { amoxiclavAzithro: S, amoxiclavClarithro: S, miqnaf: D } },
  { number: 9, label: "Lower DDI", name: ["Lower Drug-Drug Interaction"], outcome: { amoxiclavAzithro: D, amoxiclavClarithro: D, miqnaf: D } },
  { number: 10, label: "Potency", name: ["Potency"], outcome: { amoxiclavAzithro: S, amoxiclavClarithro: D, miqnaf: D } },
];

/**
 * Scores as supplied, configured explicitly (never calculated from the pins).
 * The final Frame 1 score (transition and scorecard) is the client's update of
 * 2026-10-27: Amoxi-Clav + Azithromycin 4.5/10, Amoxi-Clav + Clarithromycin 5.5/10.
 */
export const FIRST_THROW_SCORE: Readonly<Record<DrugId, number | null>> = {
  amoxiclavAzithro: 4.5,
  amoxiclavClarithro: 5.5,
  miqnaf: null,
};
export const FRAME_1_SCORE: Readonly<Record<DrugId, number | null>> = {
  amoxiclavAzithro: 4.5,
  amoxiclavClarithro: 5.5,
  miqnaf: null,
};
export const FRAME_2_SCORE = 10;
export const SCORE_OUT_OF = 10;

/** After the first throw (both scenarios). */
export const FIRST_THROW_COPY = {
  heading: "Good attempt!",
  body: "However, several treatment barriers remain standing.",
  ask: "Would you like another chance?",
  button: "Throw the ball",
} as const;

/** Between the frames. */
export const TRANSITION_COPY = {
  heading: "Nice Shot!",
  body: "Despite two attempts, several CABP treatment barriers are still standing.",
  rack: "A fresh rack of treatment challenges is now set.",
  next: "Let's see how a novel therapy performs.",
  button: "Continue",
} as const;

/** Frame 2: the novel therapy, presented automatically. */
export const NOVEL_COPY = {
  heading: "Novel Therapy Challenge",
  ball: "MIQNAF® (Nafithromycin)",
  button: "Throw ball",
} as const;

/** Frame 2 result (supplied, draft). */
export const STRIKE_COPY = {
  heading: "STRIKE!",
  body: "All 10 Pins Down",
  button: "See results",
} as const;

/** Final scorecard. */
export const SCORECARD_COPY = {
  heading: "CABP Challenge Results",
  frame1Therapy: "Conventional Therapy",
  frame2Therapy: "MIQNAF®",
  button: "Continue",
} as const;

/** "Why MIQNAF® Changes the Game": the three points supplied by the client (draft, pending approval). */
export const WHY_MIQNAF: { heading: string; points: readonly { title: string; text: readonly string[] }[] } | null = {
  heading: "Why MIQNAF® Changes the Game",
  points: [
    { title: "Safety", text: ["NO QT Prolongation, GI Safety"] },
    { title: "Compliance", text: ["Short Course Monotherapy"] },
    { title: "Efficacy", text: ["97% - 100% Sensitivity", "Vs CABP Pathogens"] },
  ],
};

/** Closing screen (supplied promotional copy, draft pending approval). */
export const CLOSING_COPY = {
  /** Followed by "Dr. [Name]," */
  salutation: "Dear",
  lines: [
    "Thank you for participating in the CABP Challenge!",
    "MIQNAF® is designed to overcome resistance and deliver compliance with a superior profile.",
    "Please use MIQNAF® to secure maximum therapeutic benefit for your CABP patients.",
  ],
  /** Back to the welcome screen for the next doctor. */
  button: "New Game",
} as const;
