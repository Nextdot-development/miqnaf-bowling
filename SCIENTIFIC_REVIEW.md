# Scientific and regulatory review

**Status: DRAFT. Not approved for release.**

All scientific copy in this build is supplied draft content. It must be checked by scientific/medical review and by regulatory before the game is used at an event. Nothing in this repository has been independently verified by the developers.

All copy lives in two files, so reviewers only need to check these:

- [`src/data/gameData.ts`](src/data/gameData.ts): drug cards, pin labels, organism names, outcome matrix, basis lines, standing-pin reasons, disclaimer
- [`src/data/prompts.ts`](src/data/prompts.ts): the four discussion prompts

## 1. References (pending verification)

The supplied brief lists these sources. None has been checked against the statements below.

| # | Source | Status |
|---|--------|--------|
| 1 | https://pmc.ncbi.nlm.nih.gov/articles/PMC5700335 | ☐ Pending verification |
| 2 | https://www.ncbi.nlm.nih.gov/pmc/articles/PMC9549737/ | ☐ Pending verification |
| 3 | https://pmc.ncbi.nlm.nih.gov/articles/PMC6879255 | ☐ Pending verification |
| 4 | https://www.ncbi.nlm.nih.gov/pmc/articles/PMC12494923/ | ☐ Pending verification |

For each reference, the reviewer should confirm which statement(s) it supports and record any discrepancy in section 5. **Do not change supplied wording in code to resolve a discrepancy.** Record it here for a human decision.

## 2. Statements to verify

| Location | Supplied statement | Check |
|---|---|---|
| Pin 2 basis | "Efflux strains are macrolide-resistant. Nafithromycin inhibited all 1,911 global pneumococci in a 2014 surveillance set at 0.25 mg/L or below, including resistant subsets." | ☐ n = 1,911 ☐ year 2014 ☐ ≤ 0.25 mg/L |
| Pin 3 basis | "Methylation strains are macrolide-resistant. In 920 Chinese isolates, over 95% resistant to azithromycin, nafithromycin MIC50/90 was 0.03/0.06 mg/L." | ☐ n = 920 ☐ > 95% ☐ 0.03/0.06 mg/L |
| Pin 4 basis | "Nafithromycin inhibited high-level erm(B) S. pyogenes in vitro (MIC90 0.015 mg/L for the species)." | ☐ 0.015 mg/L |
| Pin 1 basis | "Wild type." | ☐ |
| Pin 5 basis | "Nafithromycin MIC50/90 0.12/0.25 mg/L." | ☐ 0.12/0.25 mg/L |
| Pin 6 basis | "Atypical pathogen, macrolide class activity." | ☐ |
| Pin 7 basis | "Atypical pathogen. Nafithromycin MIC50/90 0.03/0.25 mg/L." | ☐ 0.03/0.25 mg/L |
| Pin 8 basis | "Atypical pathogen. Nafithromycin showed intracellular killing in a macrophage model." | ☐ |
| Azithromycin card | "Macrolide approved in 1988. Resistance in pneumococci is high in several regions." | ☐ approval year |
| Clarithromycin card | "Macrolide approved in 1991. Shares azithromycin's resistance mechanisms." | ☐ approval year |
| Nafithromycin card | "Designed for macrolide-resistant pneumococci. 3-day, once-daily course." | ☐ regimen vs prescribing information |
| Prompt A | "…The Phase 3 trial enrolled mostly lower-risk patients and few pneumococcal cases…" | ☐ trial characterisation |
| Prompt D | "A 3-day once-daily course against 5 to 7 days…" | ☐ comparator durations |
| Outcome matrix | Pins 2, 3 and 4 standing for azithromycin and clarithromycin, all pins down for nafithromycin | ☐ approved as a teaching model |
| Standing reasons | Pin 2 "mef(A) efflux, macrolide resistance." · Pin 3 "erm(B) methylation, macrolide resistance." · Pin 4 "Macrolide-resistant erm mechanism." | ☐ (see discrepancy log: punctuation changed) |

## 3. Content gaps (placeholders in the build)

- **"Why it matters in CABP"** (pathogen card, all 8 pins): the brief supplies no approved copy. The card shows "Approved copy pending scientific review." Supply text in `whyItMatters` in `gameData.ts`, or approve leaving it out.
- **Resistance mechanism**: shown only for pins 2–4, using the mechanism named in the supplied organism description. Confirm this is acceptable.
- **Original blueprint**: `Nafithromycin_CABP_Bowling_Game_Blueprint.docx` was not available when this was built. Content was taken from the build brief. Compare against the blueprint and record differences in section 5.

## 4. Regulatory items

- ☐ **Footer** (every screen, two lines): final wording set by regulatory. Line 1: "For scientific discussion among healthcare professionals. Pin outcomes are a teaching model built from published in vitro and clinical data. They do not replace the prescribing information, local antibiograms or clinical judgement." Line 2: "Disclaimer: This material is intended for scientific and educational purposes only. Views expressed by healthcare professionals are based on their individual clinical experience and are not intended as medical advice or endorsement of any brand or company."
- ☐ **Intro tagline**: "Roll the right ball. Break the barriers." Promotional wording pending approval.
- ☐ **Game title**: "Nafithromycin CABP Bowling Game".
- ☐ **Logo**: the Wockhardt Respiratory logo (supplied artwork) appears in the header and on the intro screen, and its red "W" is the browser icon. The MIQNAF® logo ("Nafithromycin tablet 400 mg") appears only on the end pop-ups: "You have won the game / Thank you for playing" and "Unfortunately pins are still up / Thanks for attempting". Confirm placement, and that showing it next to the comparator content is acceptable.
- ☐ **Sound effects**: `public/soundeffects/` holds two recordings named `freesound_community-…` (bowling ball roll, bowling strike). Confirm their licence covers use at the event and whether attribution is needed.
- ☐ **End-of-game sounds**: the win (confetti pops and a rising chime) and lose (soft descending "wah-wah") sounds are generated in code, not recordings, so no licence applies. Confirm the lose sound suits the event.
- ☐ **Sound on by default**: the original brief asked for sound OFF by default; the client asked for it ON. Audio still only starts after the first tap, and the header switch turns it off.
- ☐ **Fonts**: confirm the Acumin and Helvetica Neue licences cover embedding in this web/kiosk build.
- ☐ **Ball colours**: interface identifiers only (brand palette). Confirm they do not imply potency.

## 5. Discrepancies log

| Date | Item | Observed discrepancy | Reviewer | Decision |
|------|------|----------------------|----------|----------|
| 2026-10-23 | Pin 2 and pin 3 standing reasons | Supplied copy used an em dash ("mef(A) efflux [em dash] macrolide resistance."). At the client's request the UI uses no em dashes, so it now reads "mef(A) efflux, macrolide resistance." (pin 3 likewise). Wording otherwise unchanged. | | Pending approval |

## Sign-off

| Role | Name | Date |
|------|------|------|
| Scientific / medical review | | |
| Regulatory | | |
