"use client";

import { motion, useReducedMotion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import { GAME_SUBTITLE, GAME_TAGLINE } from "@/data/gameData";
import { laneBefore } from "@/lib/gameLogic";
import type { Pin } from "@/types/game";
import { GameStage } from "./GameStage";
import { BrandLogo } from "./BrandLogo";

interface IntroScreenProps {
  onStart: () => void;
  pinName: (pin: Pin) => string;
}

const noop = () => {};

/** All ten pins up on the preview lane. */
const INTRO_LANE = laneBefore();


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
        <section className="relative flex flex-col gap-10 px-6 py-8 sm:px-10 kiosk:w-[44%] kiosk:shrink-0 kiosk:justify-center kiosk:gap-[min(3.25rem,4.4vh)] kiosk:px-[5.5rem] kiosk:py-[min(4rem,5vh)]">
          {/* The logo stays top left; the title and the button are centred below it. */}
          <motion.div {...rise(0)} className="kiosk:absolute kiosk:left-[5.5rem] kiosk:top-[min(4rem,5vh)]">
            <BrandLogo priority className="h-14 sm:h-16 kiosk:h-[5rem]" />
          </motion.div>

          <div>
            <motion.h1 {...rise(0.06)} className="font-black leading-[0.98] tracking-tight text-brand-navy">
              <span className="block whitespace-nowrap text-[2.4rem] uppercase sm:text-6xl kiosk:text-[4.8rem]">
                CABP
                <span className="block text-brand-red">Challenge</span>
              </span>
            </motion.h1>

            <motion.p
              {...rise(0.12)}
              className="mt-8 space-y-1 text-xl font-medium leading-snug text-ink-muted sm:text-2xl kiosk:mt-[min(2.5rem,3.2vh)] kiosk:text-[1.9rem]"
            >
              <span className="block font-bold text-brand-navy">{GAME_SUBTITLE}</span>
              <span className="mt-2 block italic">&ldquo;{GAME_TAGLINE}&rdquo;</span>
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

        </section>

        {/* Right: the lane, edge to edge, with the two named balls lined up at the start.
            On the kiosk the empty sky above the lane is cropped off the top. */}
        <motion.div
          {...(reduce ? {} : { initial: { opacity: 0 }, animate: { opacity: 1 }, transition: { duration: 0.5, delay: 0.1 } })}
          className="relative aspect-[4/3] w-full overflow-hidden sm:aspect-[16/10] kiosk:aspect-auto kiosk:min-h-0 kiosk:flex-1"
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
            wrapperClassName="absolute inset-x-0 bottom-0 top-0 kiosk:top-[-22%]"
            className="h-full w-full"
          />

          <p className="sr-only">Preview of the bowling lane with ten pins.</p>
        </motion.div>
      </div>
    </main>
  );
}
