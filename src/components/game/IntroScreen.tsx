"use client";

import { motion, useReducedMotion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import { INTRO_TAGLINE, INTRO_TAGLINE_EMPHASIS } from "@/data/gameData";
import { laneBefore } from "@/lib/gameLogic";
import type { Pin } from "@/types/game";
import { GameStage } from "./GameStage";
import { BrandLogo } from "./BrandLogo";

interface IntroScreenProps {
  onStart: () => void;
  pinName: (pin: Pin) => string;
}

const noop = () => {};

/** All eight pins up on the preview lane. */
const INTRO_LANE = laneBefore([]);

const HOW_TO_PLAY = [
  { label: "Pick a ball", hint: "Choose one of the three" },
  { label: "Swipe it up", hint: "Send it down the lane" },
  { label: "Watch the pins", hint: "See which ones fall" },
] as const;

export function IntroScreen({ onStart, pinName }: IntroScreenProps) {
  const reduce = useReducedMotion();
  const rise = (delay: number) =>
    reduce
      ? {}
      : { initial: { opacity: 0, y: 12 }, animate: { opacity: 1, y: 0 }, transition: { duration: 0.4, delay } };

  return (
    <main className="flex flex-1 flex-col">
      <div className="tricolour-rule h-1.5 shrink-0" aria-hidden />
      <div className="flex flex-1 flex-col kiosk:min-h-0 kiosk:flex-row">
        {/* Left: brand, title, call to action, how to play */}
        <section className="flex flex-col gap-10 px-6 py-8 sm:px-10 kiosk:w-[44%] kiosk:shrink-0 kiosk:justify-between kiosk:gap-[2rem] kiosk:px-[5.5rem] kiosk:py-[4rem]">
          <motion.div {...rise(0)}>
            <BrandLogo priority className="h-14 sm:h-16 kiosk:h-[5rem]" />
          </motion.div>

          <div>
            <motion.h1 {...rise(0.06)} className="font-black leading-[0.98] tracking-tight text-brand-navy">
              <span className="block whitespace-nowrap text-[2.4rem] uppercase sm:text-6xl kiosk:text-[4.8rem]">
                CABP Bowling
                <span className="block text-brand-red">Challenge</span>
              </span>
            </motion.h1>

            <motion.p
              {...rise(0.12)}
              className="mt-8 space-y-1 text-xl font-medium leading-snug text-ink-muted sm:text-2xl kiosk:mt-[2.5rem] kiosk:text-[1.9rem]"
            >
              {INTRO_TAGLINE.map((line) => {
                const key = INTRO_TAGLINE_EMPHASIS[line];
                const at = line.indexOf(key);
                return (
                  <span key={line} className="block">
                    {at < 0 ? (
                      line
                    ) : (
                      <>
                        {line.slice(0, at)}
                        <strong className="font-bold text-brand-navy">{key}</strong>
                        {line.slice(at + key.length)}
                      </>
                    )}
                  </span>
                );
              })}
            </motion.p>

            <motion.div {...rise(0.18)} className="mt-10 kiosk:mt-[3rem]">
              <button
                type="button"
                onClick={onStart}
                className="btn-primary btn-blink w-full px-12 py-7 text-3xl tracking-[0.06em] sm:w-auto sm:text-4xl kiosk:px-[4.75rem] kiosk:py-[2.3rem] kiosk:text-[3rem]"
              >
                Start game <ArrowRight className="h-10 w-10 kiosk:h-[3rem] kiosk:w-[3rem]" strokeWidth={3} aria-hidden />
              </button>
            </motion.div>
          </div>

          {/* How to play: three numbered steps joined by a line. Kept quiet (no fill,
              no gold) so the Start game button stays the strongest thing on the screen. */}
          <motion.section {...rise(0.24)} aria-labelledby="how-to-play">
            <h2 id="how-to-play" className="eyebrow font-body kiosk:text-base">
              How to play
            </h2>
            <ol className="relative mt-4 grid gap-5 sm:grid-cols-3 sm:gap-4 kiosk:mt-[1.4rem]">
              {HOW_TO_PLAY.map(({ label, hint }, i) => (
                <li key={label} className="relative flex items-start gap-4 sm:flex-col sm:gap-3">
                  {/* Connector to the next step (desktop rows only). */}
                  {i < HOW_TO_PLAY.length - 1 && (
                    <span
                      className="absolute left-[3.25rem] right-[-1rem] top-[1.375rem] hidden h-px bg-line sm:block kiosk:left-[3.75rem] kiosk:top-[1.625rem]"
                      aria-hidden
                    />
                  )}
                  <span className="relative flex h-11 w-11 shrink-0 items-center justify-center rounded-full border-2 border-brand-navy/70 bg-surface-page font-display text-xl font-black text-brand-navy kiosk:h-[3.25rem] kiosk:w-[3.25rem] kiosk:text-[1.6rem]">
                    {i + 1}
                  </span>
                  <span className="min-w-0">
                    <span className="block whitespace-nowrap text-lg font-bold leading-tight text-brand-navy kiosk:text-[1.35rem]">{label}</span>
                    <span className="mt-1 block text-sm leading-snug text-ink-muted kiosk:text-[1rem]">{hint}</span>
                  </span>
                </li>
              ))}
            </ol>
          </motion.section>
        </section>

        {/* Right: the lane, edge to edge, with the three named balls lined up at the start */}
        <motion.div
          {...(reduce ? {} : { initial: { opacity: 0 }, animate: { opacity: 1 }, transition: { duration: 0.5, delay: 0.1 } })}
          className="relative aspect-[4/3] w-full sm:aspect-[16/10] kiosk:aspect-auto kiosk:min-h-0 kiosk:flex-1"
        >
          <GameStage
            phase="intro"
            lane={INTRO_LANE}
            selectedDrug={null}
            result={null}
            rollStartedAt={null}
            interactive={false}
            showLabels={false}
            variant="bleed"
            pinName={pinName}
            onPinSelect={noop}
            wrapperClassName="absolute inset-0"
            className="h-full w-full"
          />

          <p className="sr-only">Preview of the bowling lane with eight pathogen pins.</p>
        </motion.div>
      </div>
    </main>
  );
}
