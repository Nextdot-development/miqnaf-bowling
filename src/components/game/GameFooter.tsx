import { DISCLAIMER, FOOTER_NOTE } from "@/data/gameData";

export function GameFooter() {
  return (
    <footer className="border-t border-line bg-surface px-4 py-3 sm:px-8 lg:px-12" data-testid="disclaimer">
      <p className="text-sm leading-snug text-ink-muted sm:text-[0.95rem]">{FOOTER_NOTE}</p>
      <p className="mt-1 text-sm leading-snug text-ink-muted sm:text-[0.95rem]">{DISCLAIMER}</p>
    </footer>
  );
}
