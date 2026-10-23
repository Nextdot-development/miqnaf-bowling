"use client";

import { motion, useReducedMotion } from "framer-motion";
import type { CSSProperties } from "react";
import { BALL_COLORS } from "@/lib/drugVisuals";
import type { Drug } from "@/types/game";

export type BallCardBadge =
  | { kind: "selected" }
  | { kind: "current"; pinsDown: number; total: number }
  | { kind: "previous"; pinsDown: number; total: number };

interface BallCardProps {
  drug: Drug;
  selected: boolean;
  /** Highlighted as the ball the lane is currently showing. */
  emphasised: boolean;
  badge: BallCardBadge | null;
  disabled: boolean;
  muted: boolean;
  onSelect: () => void;
}

/** Text colour for each ball's class line and badge (contrast-checked). */
const ACCENT_TEXT: Record<Drug["id"], string> = {
  azithromycin: "text-brand-red",
  clarithromycin: "text-brand-navy",
  nafithromycin: "text-[color-mix(in_srgb,var(--brand-gold)_45%,black)]",
};
const BADGE_STYLE: Record<Drug["id"], string> = {
  azithromycin: "bg-brand-red text-white",
  clarithromycin: "bg-brand-navy text-white",
  nafithromycin: "bg-brand-gold text-brand-navy",
};

export function BallCard({ drug, selected, emphasised, badge, disabled, muted, onSelect }: BallCardProps) {
  const reduce = useReducedMotion();
  const style = { "--ball": BALL_COLORS[drug.id], "--accent": BALL_COLORS[drug.id] } as CSSProperties;

  const badgeText =
    badge?.kind === "selected"
      ? "Selected"
      : badge
        ? `Rolled · ${badge.pinsDown} of ${badge.total}${badge.kind === "current" ? " down" : ""}`
        : null;

  return (
    <motion.button
      type="button"
      onClick={onSelect}
      disabled={disabled}
      aria-pressed={selected}
      aria-label={`${drug.name}, ${drug.drugClass}. ${drug.description}${badgeText ? ` ${badgeText}.` : ""}`}
      style={style}
      whileHover={disabled || reduce ? undefined : { y: -3 }}
      whileTap={disabled || reduce ? undefined : { scale: 0.985 }}
      className={`relative flex h-full w-full flex-col rounded-2xl border-[3px] bg-surface p-4 text-left shadow-card transition-[border-color,opacity] sm:p-5 ${
        emphasised ? "border-[var(--accent)]" : "border-transparent"
      } ${muted ? "opacity-60" : ""} ${disabled ? "cursor-not-allowed" : "cursor-pointer"}`}
    >
      {badgeText && (
        <span
          className={`absolute -top-3.5 right-4 rounded-full px-3 py-1 text-xs font-bold shadow-sm sm:text-sm ${
            badge?.kind === "previous" ? "bg-surface-sunken text-ink-muted" : BADGE_STYLE[drug.id]
          }`}
        >
          {badgeText}
        </span>
      )}
      <span className="flex items-center gap-3 sm:gap-4">
        <span className="ball-swatch h-12 w-12 sm:h-16 sm:w-16" aria-hidden />
        <span className="min-w-0">
          <span className="block font-display text-xl font-medium leading-tight text-brand-navy lg:text-2xl 2xl:text-[1.6rem]">
            {drug.name}
          </span>
          <span className={`block font-bold ${ACCENT_TEXT[drug.id]}`}>{drug.drugClass}</span>
        </span>
      </span>
      <span className="mt-3 block text-[0.95rem] leading-snug text-ink-muted sm:text-base">{drug.description}</span>
    </motion.button>
  );
}
