const STEPS = ["Pick a ball", "Roll", "Watch", "Read result"] as const;

/** Four-step progress; `current` is 1-based. */
export function StepIndicator({ current }: { current: 1 | 2 | 3 | 4 }) {
  return (
    <ol className="grid grid-cols-4 gap-2" aria-label="Game steps">
      {STEPS.map((label, i) => {
        const n = i + 1;
        const state = n < current ? "done" : n === current ? "current" : "todo";
        return (
          <li key={label} aria-current={state === "current" ? "step" : undefined}>
            <span
              className={`block h-1.5 rounded-full ${
                state === "current" ? "bg-brand-navy" : state === "done" ? "bg-brand-navy/40" : "bg-surface-sunken"
              }`}
              aria-hidden
            />
            <span
              className={`mt-2 block text-xs sm:text-sm ${
                state === "current" ? "font-bold text-brand-navy" : "font-semibold text-ink-soft"
              }`}
            >
              {n} · {label}
              {state === "done" && <span className="sr-only"> (done)</span>}
            </span>
          </li>
        );
      })}
    </ol>
  );
}
