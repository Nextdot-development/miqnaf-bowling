import { FRONT_ROW_Z } from "@/lib/laneLayout";
import { ballArrivalSeconds } from "@/lib/rollAnimation";

export const SOUND_FILES = {
  /** Ball set down on the lane, then rolling (4.5 s, no pin crash). */
  roll: "/soundeffects/freesound_community-bowling-ball-90863.mp3",
  /** Pins being struck and scattering (1.4 s). */
  strike: "/soundeffects/freesound_community-bowling-strike-40456.mp3",
} as const;

export type SoundName = keyof typeof SOUND_FILES;

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

export function buildSoundCues(pinsDown: number, totalPins: number, instant = false): SoundCue[] {
  const strikeGain = 0.55 + 0.45 * Math.max(0, Math.min(1, pinsDown / totalPins));
  if (instant) return [{ sound: "strike", at: 0.05, gain: strikeGain }];
  return [
    { sound: "roll", at: 0, gain: 0.9, fadeFrom: IMPACT_SECONDS - 0.15, fadeTo: IMPACT_SECONDS + 0.12 },
    { sound: "strike", at: IMPACT_SECONDS, gain: strikeGain },
  ];
}
