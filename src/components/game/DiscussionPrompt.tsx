import { MessageSquare } from "lucide-react";
import { PROMPTS } from "@/data/prompts";
import type { PromptId } from "@/types/game";

/** One supplied discussion prompt. Renders nothing when no prompt is due. */
export function DiscussionPrompt({ id, large = false }: { id: PromptId | null; large?: boolean }) {
  if (!id) return null;
  return (
    <aside className="rounded-2xl bg-surface-sunken px-5 py-4 sm:px-6 sm:py-5" aria-label="Discussion point">
      <p className="flex items-center gap-2 font-display text-lg font-black text-brand-navy">
        <MessageSquare className="h-5 w-5 fill-brand-navy" aria-hidden />
        Discussion point
      </p>
      <p
        className={`mt-2 font-semibold leading-snug text-brand-navy ${
          large ? "text-2xl sm:text-[1.75rem]" : "text-lg sm:text-xl"
        }`}
      >
        {PROMPTS[id].text}
      </p>
    </aside>
  );
}
