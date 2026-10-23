/**
 * Roll timing. Identical for every drug: the ball's path and speed never
 * depend on the selection.
 */

/** Ball travel from the foul line to the pin deck. */
export const BALL_TRAVEL_MS = 2000;

/** Time after impact for pins to tip, slide and settle. */
export const PIN_SETTLE_MS = 1250;

/** When the result is revealed (end of the animated roll). */
export const ROLL_TOTAL_MS = BALL_TRAVEL_MS + PIN_SETTLE_MS;
