/**
 * Single source of truth for all supplied scientific and game content.
 *
 * DRAFT CONTENT: every statement below is supplied copy pending scientific
 * and regulatory review (see SCIENTIFIC_REVIEW.md). Do not edit wording
 * without sign-off, and do not duplicate the outcome matrix elsewhere.
 */
import type { Drug, DrugId, Pin } from "@/types/game";

export const GAME_TITLE = "CABP Bowling Game";

export const INTRO_TAGLINE = [
  "Roll the right ball.",
  "Break the barriers.",
] as const;

/** Phrase emphasised in each tagline line (presentation only; wording above). */
export const INTRO_TAGLINE_EMPHASIS: Readonly<Record<(typeof INTRO_TAGLINE)[number], string>> = {
  "Roll the right ball.": "right ball",
  "Break the barriers.": "barriers",
};

export const FOOTER_NOTE =
  "For scientific discussion among healthcare professionals. Pin outcomes are a teaching model built from published in vitro and clinical data. They do not replace the prescribing information, local antibiograms or clinical judgement.";

export const DISCLAIMER =
  "Disclaimer: This material is intended for scientific and educational purposes only. Views expressed by healthcare professionals are based on their individual clinical experience and are not intended as medical advice or endorsement of any brand or company.";

export const DRUG_ORDER: readonly DrugId[] = ["azithromycin", "clarithromycin", "nafithromycin"];

export const DRUGS: Readonly<Record<DrugId, Drug>> = {
  azithromycin: {
    id: "azithromycin",
    name: "Azithromycin",
    drugClass: "Azalide macrolide",
    description: "Macrolide approved in 1988. Resistance in pneumococci is high in several regions.",
  },
  clarithromycin: {
    id: "clarithromycin",
    name: "Clarithromycin",
    drugClass: "Macrolide",
    description: "Macrolide approved in 1991. Shares azithromycin's resistance mechanisms.",
  },
  nafithromycin: {
    id: "nafithromycin",
    name: "Nafithromycin",
    drugClass: "Lactone ketolide",
    description: "Designed for macrolide-resistant pneumococci. 3-day, once-daily course.",
  },
};

const D = "down" as const;
const S = "standing" as const;

export const PINS: readonly Pin[] = [
  {
    number: 1,
    label: "Spn",
    row: "front",
    organism: [{ em: "Streptococcus pneumoniae" }, ", macrolide-susceptible"],
    mechanism: null,
    standingReason: null,
    basis: "Wild type.",
    whyItMatters: null,
    outcome: { azithromycin: D, clarithromycin: D, nafithromycin: D },
  },
  {
    number: 2,
    label: "Spn-mef",
    row: "front",
    organism: [{ em: "S. pneumoniae" }, " with ", { em: "mef" }, "(A) efflux"],
    mechanism: [{ em: "mef" }, "(A) efflux"],
    standingReason: [{ em: "mef" }, "(A) efflux, macrolide resistance."],
    basis:
      "Efflux strains are macrolide-resistant. Nafithromycin inhibited all 1,911 global pneumococci in a 2014 surveillance set at 0.25 mg/L or below, including resistant subsets.",
    whyItMatters: null,
    outcome: { azithromycin: S, clarithromycin: S, nafithromycin: D },
  },
  {
    number: 3,
    label: "Spn-erm",
    row: "front",
    organism: [{ em: "S. pneumoniae" }, " with ", { em: "erm" }, "(B) methylation"],
    mechanism: [{ em: "erm" }, "(B) methylation"],
    standingReason: [{ em: "erm" }, "(B) methylation, macrolide resistance."],
    basis:
      "Methylation strains are macrolide-resistant. In 920 Chinese isolates, over 95% resistant to azithromycin, nafithromycin MIC50/90 was 0.03/0.06 mg/L.",
    whyItMatters: null,
    outcome: { azithromycin: S, clarithromycin: S, nafithromycin: D },
  },
  {
    number: 4,
    label: "Spy-erm",
    row: "front",
    organism: [{ em: "S. pyogenes" }, ", macrolide-resistant (", { em: "erm" }, ")"],
    mechanism: [{ em: "erm" }, " (macrolide-resistant)"],
    standingReason: ["Macrolide-resistant ", { em: "erm" }, " mechanism."],
    basis:
      "Nafithromycin inhibited high-level erm(B) S. pyogenes in vitro (MIC90 0.015 mg/L for the species).",
    whyItMatters: null,
    outcome: { azithromycin: S, clarithromycin: S, nafithromycin: D },
  },
  {
    number: 5,
    label: "Mc",
    row: "rear",
    organism: [{ em: "Moraxella catarrhalis" }],
    mechanism: null,
    standingReason: null,
    basis: "Nafithromycin MIC50/90 0.12/0.25 mg/L.",
    whyItMatters: null,
    outcome: { azithromycin: D, clarithromycin: D, nafithromycin: D },
  },
  {
    number: 6,
    label: "Mp",
    row: "rear",
    organism: [{ em: "Mycoplasma pneumoniae" }],
    mechanism: null,
    standingReason: null,
    basis: "Atypical pathogen, macrolide class activity.",
    whyItMatters: null,
    outcome: { azithromycin: D, clarithromycin: D, nafithromycin: D },
  },
  {
    number: 7,
    label: "Cp",
    row: "rear",
    organism: [{ em: "Chlamydophila pneumoniae" }],
    mechanism: null,
    standingReason: null,
    basis: "Atypical pathogen. Nafithromycin MIC50/90 0.03/0.25 mg/L.",
    whyItMatters: null,
    outcome: { azithromycin: D, clarithromycin: D, nafithromycin: D },
  },
  {
    number: 8,
    label: "Lp",
    row: "rear",
    organism: [{ em: "Legionella pneumophila" }],
    mechanism: null,
    standingReason: null,
    basis: "Atypical pathogen. Nafithromycin showed intracellular killing in a macrophage model.",
    whyItMatters: null,
    outcome: { azithromycin: D, clarithromycin: D, nafithromycin: D },
  },
];

/** Placeholder shown where the brief supplies no approved copy. */
export const PENDING_REVIEW_COPY = "Approved copy pending scientific review.";
