import { CircleCheck, CircleDashed, CircleX } from "lucide-react";
import type { PinStatus } from "@/types/game";

const COPY: Record<PinStatus | "not-rolled", string> = {
  down: "Down",
  standing: "Standing",
  "not-rolled": "Not yet rolled",
};

/** Outcome indicator using icon + text, never colour alone. */
export function StatusBadge({ status, compact = false }: { status: PinStatus | "not-rolled"; compact?: boolean }) {
  const Icon = status === "down" ? CircleCheck : status === "standing" ? CircleX : CircleDashed;
  const tone =
    status === "down" ? "text-brand-navy" : status === "standing" ? "text-brand-red" : "text-ink-soft";
  return (
    <span className={`inline-flex items-center gap-1.5 font-bold ${tone} ${compact ? "text-sm" : ""}`}>
      <Icon className={compact ? "h-4 w-4" : "h-5 w-5"} aria-hidden strokeWidth={2.4} />
      <span className={status === "not-rolled" ? "font-semibold italic" : ""}>{COPY[status]}</span>
    </span>
  );
}
