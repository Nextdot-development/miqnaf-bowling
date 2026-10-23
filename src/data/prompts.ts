/** Supplied discussion prompts (draft, pending scientific review). */
import type { DiscussionPrompt, PromptId } from "@/types/game";

export const PROMPTS: Readonly<Record<PromptId, DiscussionPrompt>> = {
  A: {
    id: "A",
    trigger: "Nafithromycin rolled",
    text: "All eight pins fell. The Phase 3 trial enrolled mostly lower-risk patients and few pneumococcal cases. What evidence would you want in sicker patients?",
  },
  B: {
    id: "B",
    trigger: "Azithromycin or clarithromycin rolled",
    text: "Pins 2, 3 and 4 are still standing. How often do you meet macrolide-resistant pneumococci, and how does that shape your first choice?",
  },
  C: {
    id: "C",
    trigger: "Coverage board opened",
    text: "Looking at the grid, which gap matters most for the patients you see?",
  },
  D: {
    id: "D",
    trigger: "A roll occurs after all three drugs have been used",
    text: "A 3-day once-daily course against 5 to 7 days: what would that change for adherence and stewardship in your clinic?",
  },
};
