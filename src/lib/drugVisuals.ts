/**
 * Ball colours are interface identifiers only. They say nothing about
 * potency. Drawn from the brand palette.
 */
import { BRAND } from "@/lib/brand";
import type { DrugId } from "@/types/game";

export const BALL_COLORS: Readonly<Record<DrugId, string>> = {
  azithromycin: BRAND.red,
  clarithromycin: BRAND.navy,
  nafithromycin: BRAND.gold,
};

/** Ball colour before any drug is selected. */
export const NEUTRAL_BALL_COLOR = "#7d89b8";

export function ballColor(drug: DrugId | null): string {
  return drug ? BALL_COLORS[drug] : NEUTRAL_BALL_COLOR;
}
