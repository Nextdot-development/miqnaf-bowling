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
    <main className="welcome-stage relative flex flex-1 flex-col overflow-hidden">
      <div className="tricolour-rule relative z-10 h-1.5 shrink-0" aria-hidden />
      <div className="flex flex-1 flex-col short:min-h-0 short:flex-row kiosk:min-h-0 kiosk:flex-row">
        {/* Left: brand, title, call to action, on the dark arena that runs into the lane. */}
        <section className="relative z-10 flex flex-col gap-10 px-6 py-8 sm:px-10 short:w-[48%] short:shrink-0 short:justify-center short:gap-4 short:px-6 short:py-4 kiosk:w-[44%] kiosk:shrink-0 kiosk:justify-center kiosk:gap-[min(3.25rem,4.4vh)] kiosk:px-[5.5rem] kiosk:py-[min(4rem,5vh)]">
          {/* The logo stays top left, on a white plate so its artwork reads on the dark arena. */}
          <motion.div {...rise(0)} className="self-start kiosk:absolute kiosk:left-[5.5rem] kiosk:top-[min(3.5rem,4.5vh)]">
            <span className="inline-flex rounded-2xl bg-white px-5 py-3 shadow-lift short:rounded-xl short:px-3 short:py-1.5 kiosk:px-[1.6rem] kiosk:py-[1rem]">
              <BrandLogo priority className="h-12 sm:h-14 short:h-8 kiosk:h-[4.25rem]" />
            </span>
          </motion.div>

          <div>
            <motion.h1 {...rise(0.06)} className="welcome-title font-display font-black uppercase leading-[0.95] tracking-tight">
              <span className="block whitespace-nowrap text-[2.6rem] text-white sm:text-6xl short:text-[2.4rem] kiosk:text-[5.2rem]">CABP</span>
              <span className="game-stamp block whitespace-nowrap text-[2.6rem] text-brand-gold sm:text-6xl short:text-[2.4rem] kiosk:text-[5.2rem]">Challenge</span>
            </motion.h1>

            <motion.p
              {...rise(0.12)}
              className="mt-7 text-xl font-medium leading-snug sm:text-2xl short:mt-3 short:text-base kiosk:mt-[min(2.25rem,3vh)] kiosk:text-[1.9rem]"
            >
              <span className="block font-bold text-white">{GAME_SUBTITLE}</span>
              <span className="mt-2 block italic text-white/70">&ldquo;{GAME_TAGLINE}&rdquo;</span>
            </motion.p>

            <motion.div {...rise(0.18)} className="mt-10 short:mt-4 kiosk:mt-[3rem]">
              <button
                type="button"
                onClick={onStart}
                className="btn-primary btn-blink w-full px-12 py-7 text-3xl tracking-[0.06em] sm:w-auto sm:text-4xl short:px-7 short:py-3 short:text-xl kiosk:px-[4.75rem] kiosk:py-[2.3rem] kiosk:text-[3rem]"
              >
                Start game <ArrowRight className="h-10 w-10 short:h-6 short:w-6 kiosk:h-[3rem] kiosk:w-[3rem]" strokeWidth={3} aria-hidden />
              </button>
            </motion.div>
          </div>
        </section>

        {/* Right: the lane, edge to edge, with the two named balls lined up at the start.
            On the kiosk the empty sky above the lane is cropped off the top. */}
        <motion.div
          {...(reduce ? {} : { initial: { opacity: 0 }, animate: { opacity: 1 }, transition: { duration: 0.5, delay: 0.1 } })}
          className="relative aspect-[4/3] w-full overflow-hidden sm:aspect-[16/10] short:aspect-auto short:min-h-0 short:flex-1 kiosk:aspect-auto kiosk:min-h-0 kiosk:flex-1"
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
          {/* Blends the lane into the arena on its left. */}
          <div className="pointer-events-none absolute inset-y-0 left-0 hidden w-[18%] bg-gradient-to-r from-[#070b22] to-transparent short:block kiosk:block" aria-hidden />

          <p className="sr-only">Preview of the bowling lane with ten pins.</p>
        </motion.div>
      </div>
    </main>
  );
}
