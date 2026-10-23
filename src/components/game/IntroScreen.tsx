"use client";

import { motion, useReducedMotion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import type { CSSProperties } from "react";
import { DRUG_ORDER, DRUGS, INTRO_TAGLINE, INTRO_TAGLINE_EMPHASIS } from "@/data/gameData";
import { BALL_COLORS } from "@/lib/drugVisuals";
import type { Pin } from "@/types/game";
import { GameStage } from "./GameStage";
import { ProductLogo } from "./ProductLogo";

interface IntroScreenProps {
  onStart: () => void;
  pinName: (pin: Pin) => string;
}

const noop = () => {};

const HOW_TO_PLAY = ["Pick a ball", "Tap ROLL", "Watch the pins"] as const;

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
            <ProductLogo priority className="h-14 sm:h-16 kiosk:h-[5rem]" />
          </motion.div>

          <div>
            <motion.h1 {...rise(0.06)} className="font-black leading-[0.98] tracking-tight text-brand-navy">
              <span className="block text-[2.6rem] sm:text-6xl kiosk:text-[5.2rem]">Nafithromycin</span>
              <span className="mt-2 block text-[1.9rem] uppercase sm:text-5xl kiosk:whitespace-nowrap kiosk:text-[3.7rem]">
                CABP Bowling <span className="text-brand-red">Game</span>
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
                className="btn-primary w-full px-10 py-5 text-2xl tracking-[0.06em] sm:w-auto sm:text-3xl kiosk:px-[3.5rem] kiosk:py-[1.6rem] kiosk:text-[2.2rem]"
              >
                Start game <ArrowRight className="h-8 w-8" strokeWidth={3} aria-hidden />
              </button>
            </motion.div>
          </div>

          <motion.div {...rise(0.24)}>
            <h2 className="eyebrow font-body">How to play</h2>
            <ol className="mt-3 grid gap-3 sm:grid-cols-3">
              {HOW_TO_PLAY.map((step, i) => (
                <li key={step} className="flex items-center gap-3 rounded-2xl border border-line bg-surface px-4 py-3 shadow-card">
                  <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-brand-navy font-display text-lg font-black text-white">
                    {i + 1}
                  </span>
                  <span className="font-bold leading-tight text-brand-navy">{step}</span>
                </li>
              ))}
            </ol>
          </motion.div>
        </section>

        {/* Right: the lane, edge to edge, with the three balls in the sky above the pins */}
        <motion.div
          {...(reduce ? {} : { initial: { opacity: 0 }, animate: { opacity: 1 }, transition: { duration: 0.5, delay: 0.1 } })}
          className="relative aspect-[4/3] w-full sm:aspect-[16/10] kiosk:aspect-auto kiosk:min-h-0 kiosk:flex-1"
        >
          <GameStage
            phase="intro"
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

          <div className="pointer-events-none absolute inset-x-0 top-0 z-20 flex flex-col items-center px-4 pt-6 sm:pt-10 kiosk:pt-[3.5rem]">
            <p className="text-center text-sm font-bold uppercase tracking-[0.2em] text-white/75 sm:text-base">
              Three balls · One lane · Eight pathogen pins
            </p>
            <ul className="mt-4 flex flex-wrap justify-center gap-3 sm:gap-4" aria-label="The three balls">
              {DRUG_ORDER.map((id) => (
                <li
                  key={id}
                  className="flex items-center gap-3 rounded-2xl bg-white/10 px-3 py-2 ring-1 ring-white/15 backdrop-blur-sm sm:px-4 sm:py-2.5"
                  style={{ "--ball": BALL_COLORS[id] } as CSSProperties}
                >
                  <span className="ball-swatch h-8 w-8 sm:h-10 sm:w-10" aria-hidden />
                  <span className="leading-tight">
                    <span className="block font-display text-base font-black text-white sm:text-xl">{DRUGS[id].name}</span>
                    <span className="hidden text-sm text-white/70 sm:block">{DRUGS[id].drugClass}</span>
                  </span>
                </li>
              ))}
            </ul>
          </div>
          <p className="sr-only">Preview of the bowling lane with eight pathogen pins.</p>
        </motion.div>
      </div>
    </main>
  );
}
