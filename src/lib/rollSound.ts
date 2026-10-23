/**
 * Sound plan for a roll, using the supplied recordings in
 * public/soundeffects/. Pure: says which file plays when and how loud, timed
 * from the same fixed timeline as the animation. useGameAudio plays it.
 */
import { FRONT_ROW_Z } from "@/lib/laneLayout";
import { ballArrivalSeconds } from "@/lib/rollAnimation";

export const SOUND_FILES = {
  /** Ball set down on the lane, then rolling (4.5 s, no pin crash). */
  roll: "/soundeffects/freesound_community-bowling-ball-90863.mp3",
  /** Pins being struck and scattering (1.4 s). */
  strike: "/soundeffects/freesound_community-bowling-strike-40456.mp3",
} as const;

export type SoundName = keyof typeof SOUND_FILES;

/**
 * Where the first audible sound starts inside each file (seconds), measured
 * from the recordings. Used to line them up with the animation.
 */
export const SOUND_ONSETS: Readonly<Record<SoundName, number>> = {
  roll: 0.125,
  strike: 0.198,
};

export interface SoundCue {
  sound: SoundName;
  /** Seconds after the roll starts at which the file's onset should be heard. */
  at: number;
  /** Peak gain 0..1. */
  gain: number;
  /** If set, fade out over [fadeFrom, fadeTo] (seconds after roll start). */
  fadeFrom?: number;
  fadeTo?: number;
}

/** Seconds from release until the ball meets the front row of pins. */
export const IMPACT_SECONDS = ballArrivalSeconds(FRONT_ROW_Z);

/**
 * The roll sound plays from release and fades out as the ball reaches the
 * pins; the strike's first hit lands at impact. The crash is a little quieter
 * when fewer pins fall. Reduced-motion rolls skip the roll and play the strike
 * straight away.
 */
export function buildSoundCues(pinsDown: number, totalPins: number, instant = false): SoundCue[] {
  const strikeGain = 0.55 + 0.45 * Math.max(0, Math.min(1, pinsDown / totalPins));
  if (instant) return [{ sound: "strike", at: 0.05, gain: strikeGain }];
  return [
    { sound: "roll", at: 0, gain: 0.9, fadeFrom: IMPACT_SECONDS - 0.15, fadeTo: IMPACT_SECONDS + 0.12 },
    { sound: "strike", at: IMPACT_SECONDS, gain: strikeGain },
  ];
}
