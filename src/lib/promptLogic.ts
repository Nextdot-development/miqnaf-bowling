/**
 * Deterministic discussion-prompt selection. A prompt is never repeated in a
 * session; if nothing eligible is unused, no prompt is shown.
 */
import { DRUG_ORDER } from "@/data/gameData";
import type { DrugId, PromptId } from "@/types/game";

export function allDrugsRolled(rolled: readonly DrugId[]): boolean {
  return DRUG_ORDER.every((d) => rolled.includes(d));
}

/** Prompts eligible after a roll, in priority order. */
export function eligibleRollPrompts(drug: DrugId, rolledIncludingThis: readonly DrugId[]): PromptId[] {
  const drugPrompt: PromptId = drug === "nafithromycin" ? "A" : "B";
  const eligible: PromptId[] = [drugPrompt];
  // Trigger D: once all three balls have been used, the result of that roll
  // (and any later roll) may carry the course-length prompt.
  if (allDrugsRolled(rolledIncludingThis)) eligible.push("D");
  return eligible;
}

export function selectRollPrompt(
  drug: DrugId,
  rolledIncludingThis: readonly DrugId[],
  used: readonly PromptId[],
): PromptId | null {
  return eligibleRollPrompts(drug, rolledIncludingThis).find((id) => !used.includes(id)) ?? null;
}

export function selectCoveragePrompt(used: readonly PromptId[]): PromptId | null {
  return used.includes("C") ? null : "C";
}
