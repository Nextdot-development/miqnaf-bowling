# Scientific and regulatory review

**Status: DRAFT. Not approved for release.**

All scientific copy in this build is supplied draft content. It must be checked by scientific/medical review and by regulatory before the game is used at an event. Nothing in this repository has been independently verified by the developers.

All copy lives in two files, so reviewers only need to check these:

- [`src/data/gameData.ts`](src/data/gameData.ts): balls, pin wording and short labels, outcome matrix, pre-roll question, footer and disclaimer
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

The pins are the attributes a CABP treatment should cover (client brief, revised). Wording below is as supplied, with spelling corrected.

| Location | Statement | Check |
|---|---|---|
| Pre-roll question | "Which options would you choose to knock off all the pins for treatment of CABP?" (supplied "knockoff", corrected to "knock off") | ☐ |
| Pin 1 | "MDR *S. pneumoniae* coverage" (supplied "S.Pnemoniae") | ☐ |
| Pin 2 | "Atypical coverage" | ☐ |
| Pin 3 | "Safety for paediatric and elderly" | ☐ |
| Pin 4 | "High lung levels" | ☐ |
| Pin 5 | "Bactericidal actions" | ☐ |
| Pin 6 | "PK/PD supporting short course therapy" | ☐ |
| Pin 7 | "Anti-inflammatory activity" | ☐ |
| Pin 8 | "Monotherapy" | ☐ |
| Short lane labels | MDR Spn, Atypicals, Safety, Lung levels, Bactericidal, Short course, Anti-inflam., Monotherapy (written by the developers to fit the lane tags; not supplied) | ☐ |
| Azithromycin result | Down: atypical coverage, safety, high lung levels, anti-inflammatory activity (4 of 8). Standing: 1, 5, 6, 8 | ☐ |
| Amox/clav result | Down: safety, bactericidal actions (2 of 8). Standing: 1, 2, 4, 6, 7, 8. **Discrepancy:** the brief says "(50% Down)", but 2 of 8 pins is 25%. Confirm which pins should fall | ☐ |
| Nafithromycin result | All 8 pins down | ☐ approved as a teaching model |
| Amox/clav ball | Name "Amox/clav", class "β-lactam/β-lactamase inhibitor", description "Amoxicillin with clavulanate, a β-lactamase inhibitor." (class and description written by the developers) | ☐ |
| Azithromycin card | "Macrolide approved in 1988. Resistance in pneumococci is high in several regions." | ☐ approval year |
| Nafithromycin card | "Designed for macrolide-resistant pneumococci. 3-day, once-daily course." | ☐ regimen vs prescribing information |

### Two-round scenarios (client brief, Scenario Design)

| Location | Statement | Check |
|---|---|---|
| Round 1, Azithromycin | Message: "Good coverage, but some critical respiratory challenges remain." Evidence paragraph (Paukner S et al., 2024; Berbel D et al., 2022; ICMR 65%) | ☐ message ☐ 63% / 57% / 0-1% ☐ 16–50%, 90%, 5.7% ☐ ICMR 65% |
| Round 1, Amox/clav | Message: "Not all respiratory challenges have been addressed." Evidence paragraph (Paukner S et al., 2024; Murphy ME et al., 2021; Nayar S et al., 2019; Owens RC Jr, 2008) | ☐ message ☐ >20% ☐ ~10% hypersensitivity ☐ paragraph opens with "They" (β-lactams), as supplied |
| Strike, round 1 Nafithromycin | "STRIKE!" · "All 8 pins down in a single throw." · "One Molecule. Multiple Respiratory Challenges Addressed." plus the Nafithromycin evidence paragraph | ☐ **Changed:** the brief says "All 7 pins"; the game keeps 8 pins (client decision), so the line reads "All 8 pins" |
| Strike, round 2 after Azithromycin | "Perfect Strike Through Comprehensive Coverage" plus the Nafithromycin evidence paragraph | ☐ evidence also shown here (the brief gives it under Scenario 3 only) |
| Strike, round 2 after Amox/clav | "All pins down" plus the Nafithromycin evidence paragraph | ☐ as above |
| Round 2 miss, Azithromycin then Amox/clav | "One additional pin down. Some critical challenges remain unresolved." Amox/clav takes Bactericidal actions in round 2 (5 of 8 down; 1, 6, 8 standing) | ☐ which pin falls (client chose Bactericidal) |
| Round 2 miss, Amox/clav then Azithromycin | "Some pins still standing" (4 of 8 down; 1, 5, 6, 8 standing) | ☐ |
| Azithromycin remaining pins | The brief lists 3 (MDR *S. pneumoniae*, Bactericidal, Short course). With 8 pins Monotherapy also stands, so the pop-up lists 4 | ☐ |
| Round 2 rule | A pin a ball half-knocks in round 1 (Amox/clav, Bactericidal) goes over when that ball is thrown in round 2 | ☐ approved as a teaching model |
| Corrections to supplied text | "S. pneumonie" corrected to *S. pneumoniae*; species and gene names set in italics | ☐ |

## 3. Content gaps (placeholders in the build)

- **"Why it matters in CABP"** (pin card, all 8 pins): no copy supplied. The card shows "Approved copy pending scientific review." Supply text in `whyItMatters` in `gameData.ts`, or approve leaving it out.
- **Basis / evidence lines**: the previous bacteria pins had supplied basis lines; the new attribute pins have none, so the card shows only the pin wording. Supply evidence lines per pin if wanted.
- **Discussion prompts** (`src/data/prompts.ts`): not shown anywhere in the game, and still written for the old bacteria pins. Update or remove.
- **Original blueprint**: `Nafithromycin_CABP_Bowling_Game_Blueprint.docx` was not available when this was built. Content was taken from the build brief. Compare against the blueprint and record differences in section 5.

## 4. Regulatory items

- ☐ **Footer** (every screen, two lines): final wording set by regulatory. Line 1: "For scientific discussion among healthcare professionals. Pin outcomes are a teaching model built from published in vitro and clinical data. They do not replace the prescribing information, local antibiograms or clinical judgement." Line 2: "Disclaimer: This material is intended for scientific and educational purposes only. Views expressed by healthcare professionals are based on their individual clinical experience and are not intended as medical advice or endorsement of any brand or company."
- ☐ **Intro tagline**: "Roll the right ball. Break the barriers." Promotional wording pending approval.
- ☐ **Pre-roll question** (shown on the lane while choosing a ball): "Which of these macrolides will be effective against the pinned bacteria?" Note: nafithromycin is a lactone ketolide, not strictly a macrolide; confirm the wording (e.g. "Which of these balls" or "macrolides and ketolides").
- ☐ **Game title**: "CABP Bowling Challenge".
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
