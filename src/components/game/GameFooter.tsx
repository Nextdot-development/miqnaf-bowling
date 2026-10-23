import { DISCLAIMER } from "@/data/gameData";

/** Mandatory scientific disclaimer, rendered on every screen and state. */
export function GameFooter() {
  return (
    <footer className="border-t border-line bg-surface px-4 py-3 sm:px-8 lg:px-12" data-testid="disclaimer">
      <p className="text-sm leading-snug text-ink-muted sm:text-[0.95rem]">{DISCLAIMER}</p>
    </footer>
  );
}
