/**
 * Single source of truth for all supplied scientific and game content.
 *
 * DRAFT CONTENT: every statement below is supplied copy pending scientific
 * and regulatory review (see SCIENTIFIC_REVIEW.md). Do not edit wording
 * without sign-off, and do not duplicate the outcome matrix elsewhere.
 */
import type { Drug, DrugId, Pin, RichText } from "@/types/game";

export const GAME_TITLE = "CABP Bowling Challenge";

export const INTRO_TAGLINE = [
  "Roll the right ball.",
  "Break the barriers.",
] as const;

/** Asked on the lane while the player chooses a ball, before the roll (client wording). */
export const PRE_ROLL_QUESTION = "Which options would you choose to knock off all the pins for treatment of CABP?";

/** Phrase emphasised in each tagline line (presentation only; wording above). */
export const INTRO_TAGLINE_EMPHASIS: Readonly<Record<(typeof INTRO_TAGLINE)[number], string>> = {
  "Roll the right ball.": "right ball",
  "Break the barriers.": "barriers",
};

export const FOOTER_NOTE =
  "For scientific discussion among healthcare professionals. Pin outcomes are a teaching model built from published in vitro and clinical data. They do not replace the prescribing information, local antibiograms or clinical judgement.";

export const DISCLAIMER =
  "Disclaimer: This material is intended for scientific and educational purposes only. Views expressed by healthcare professionals are based on their individual clinical experience and are not intended as medical advice or endorsement of any brand or company.";

export const DRUG_ORDER: readonly DrugId[] = ["azithromycin", "amoxclav", "nafithromycin"];

export const DRUGS: Readonly<Record<DrugId, Drug>> = {
  azithromycin: {
    id: "azithromycin",
    name: "Azithromycin",
    drugClass: "Azalide macrolide",
    description: "Macrolide approved in 1988. Resistance in pneumococci is high in several regions.",
  },
  amoxclav: {
    id: "amoxclav",
    name: "Amox/clav",
    drugClass: "β-lactam/β-lactamase inhibitor",
    description: "Amoxicillin with clavulanate, a β-lactamase inhibitor.",
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
/** Half-knocked: rocks but stays up (counts as standing). */
const W = "wobble" as const;

/**
 * The eight pins: what a CABP treatment should cover. `label` is the short
 * tag on the lane (written for space, pending review); `name` is the
 * supplied wording. Down/standing per ball from the supplied list:
 *   Azithromycin: atypicals, safety, lung levels, anti-inflammatory (4 of 8)
 *   Amox/clav:    safety down; bactericidal "50% down", so it wobbles and
 *                 stays up (1 of 8 down)
 *   Nafithromycin: all 8
 */
export const PINS: readonly Pin[] = [
  {
    number: 1,
    label: "MDR Spn",
    row: "front",
    name: ["MDR ", { em: "S. pneumoniae" }, " coverage"],
    mechanism: null,
    standingReason: null,
    basis: null,
    whyItMatters: null,
    outcome: { azithromycin: S, amoxclav: S, nafithromycin: D },
  },
  {
    number: 2,
    label: "Atypicals",
    row: "front",
    name: ["Atypical coverage"],
    mechanism: null,
    standingReason: null,
    basis: null,
    whyItMatters: null,
    outcome: { azithromycin: D, amoxclav: S, nafithromycin: D },
  },
  {
    number: 3,
    label: "Safety",
    row: "front",
    name: ["Safety for paediatric and elderly"],
    mechanism: null,
    standingReason: null,
    basis: null,
    whyItMatters: null,
    outcome: { azithromycin: D, amoxclav: D, nafithromycin: D },
  },
  {
    number: 4,
    label: "Lung levels",
    row: "front",
    name: ["High lung levels"],
    mechanism: null,
    standingReason: null,
    basis: null,
    whyItMatters: null,
    outcome: { azithromycin: D, amoxclav: S, nafithromycin: D },
  },
  {
    number: 5,
    label: "Bactericidal",
    row: "rear",
    name: ["Bactericidal actions"],
    mechanism: null,
    standingReason: null,
    basis: null,
    whyItMatters: null,
    outcome: { azithromycin: S, amoxclav: W, nafithromycin: D },
  },
  {
    number: 6,
    label: "Short course",
    row: "rear",
    name: ["PK/PD supporting short course therapy"],
    mechanism: null,
    standingReason: null,
    basis: null,
    whyItMatters: null,
    outcome: { azithromycin: S, amoxclav: S, nafithromycin: D },
  },
  {
    number: 7,
    label: "Anti-inflam.",
    row: "rear",
    name: ["Anti-inflammatory activity"],
    mechanism: null,
    standingReason: null,
    basis: null,
    whyItMatters: null,
    outcome: { azithromycin: D, amoxclav: S, nafithromycin: D },
  },
  {
    number: 8,
    label: "Monotherapy",
    row: "rear",
    name: ["Monotherapy"],
    mechanism: null,
    standingReason: null,
    basis: null,
    whyItMatters: null,
    outcome: { azithromycin: S, amoxclav: S, nafithromycin: D },
  },
];

/** Supplied copy with *asterisks* around italic words (species, genes). */
function rich(text: string): RichText {
  return text.split(/\*([^*]+)\*/).map((part, i) => (i % 2 ? { em: part } : part)).filter((part) => part !== "");
}

/**
 * Scenario copy (client brief). Each player gets up to two throws. Round 1
 * with nafithromycin is a strike; otherwise the round 1 feedback shows, the
 * fallen pins are cleared, and the player picks one of the two other balls.
 */
export type FirstMissDrug = Exclude<DrugId, "nafithromycin">;

export const ROUND_ONE_FEEDBACK: Readonly<Record<FirstMissDrug, { message: string; evidence: RichText }>> = {
  azithromycin: {
    message: "Good coverage, but some critical respiratory challenges remain.",
    evidence: rich(
      "Due to widespread use of macrolides, there is an emerging trend in macrolide resistance, particularly among isolates of *S. pneumoniae* and *S. aureus*. A substantial drop has been observed in macrolide susceptibility to multidrug-resistant (MDR) *S. pneumoniae*. Due to the high level of resistance to *S. pneumoniae*, macrolides are only prescribed in conjunction with β-lactam antibiotics for atypical respiratory infections. Based on a recent global surveillance study (2015–2021) across different regions (US, Europe, Latin America and APAC), the average susceptibility rate of azithromycin was found to drop considerably for *S. pneumoniae* (63%) and *S. aureus* (57%). Azithromycin showed poor susceptibility (0-1%) against MDR strains (Paukner S et al., 2024). Another review also demonstrated pneumococcal macrolide-resistance rates ranging from 16 to 50% across different continents, except in eastern Asia, where the rates were extremely high (90%) and in northern Europe, where the rates were significantly low (5.7%) (Berbel D et al., 2022). As per the Indian Council of Medical Research (ICMR) report, macrolide resistance in pneumococci in India is 65%.",
    ),
  },
  amoxclav: {
    message: "Not all respiratory challenges have been addressed.",
    evidence: rich(
      "They are not found to be effective against atypical respiratory pathogens and therefore have to be combined with macrolides or doxycycline for broader coverage. Even against typical respiratory pathogens, they have started to develop resistance mainly in the APAC nations (Paukner S et al., 2024). For oral cephalosporins such as cefpodoxime and cefuroxime, the pneumococcal resistance rate has exceeded 20%, while amoxicillin and amoxicillin/clavulanate have shown lower resistance (Murphy ME et al., 2021). In view of safety features, β-lactam carries a risk of hypersensitivity reactions, which can occasionally result in fatal anaphylactic reactions. The reported incidence rate for hypersensitive reactions is nearly 10% (Nayar S et al., 2019). Moreover, β-lactams have been linked to increased incidences of diarrhoea associated with *Clostridium* (Owens RC Jr, 2008).",
    ),
  },
};

/** Nafithromycin strike: heading, lines and the supporting evidence. */
export const STRIKE = {
  firstThrow: "All 8 pins down in a single throw.",
  tagline: "One Molecule. Multiple Respiratory Challenges Addressed.",
  evidence: rich(
    "Nafithromycin exhibits potent antibacterial activity against macrolide resistant pneumococci, which includes strains expressing *ermB* or *mefA* genes or both together. Nafithromycin also retained a higher degree of activity under hyper-*ermB*-induction conditions in *S. pneumoniae*, indicating a better target interaction with the methylated 23S rRNA. In *H. influenzae*, the production of β-lactamases had no impact on the antibacterial activity of Nafithromycin. The results of in vitro time-kill studies have shown Nafithromycin to be bactericidal against *S. pneumoniae* at clinically relevant concentrations. Moreover, in the in vitro studies, it showed a prolonged post-antibiotic effect against *S. pneumoniae*, an additional beneficial feature that would provide continued pharmacodynamic action and aid in sustained clinical response.",
  ),
} as const;

/** Round 2 result line, by the round 1 ball and then the round 2 ball. */
export const ROUND_TWO_MESSAGE: Readonly<Record<FirstMissDrug, Readonly<Partial<Record<DrugId, string>>>>> = {
  azithromycin: {
    nafithromycin: "Perfect Strike Through Comprehensive Coverage",
    amoxclav: "One additional pin down. Some critical challenges remain unresolved.",
  },
  amoxclav: {
    nafithromycin: "All pins down",
    azithromycin: "Some pins still standing",
  },
};
