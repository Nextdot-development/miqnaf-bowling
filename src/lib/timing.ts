/** Release to the head pin: a long lane and an unhurried roll. */
export const BALL_TRAVEL_MS = 2700;

/** Time after impact for pins to tip, slide and settle. */
export const PIN_SETTLE_MS = 3400;

/** When the result is revealed (end of the animated roll). */
export const ROLL_TOTAL_MS = BALL_TRAVEL_MS + PIN_SETTLE_MS;

/**
 * A strike: the result pops up straight after the hit, while the pins are
 * still flying (the whole rack goes off at once), without waiting for the
 * ball to roll on into the pit.
 */
export const STRIKE_RESULT_MS = BALL_TRAVEL_MS + 400;

/** Transition: old pins clear, then a fresh rack drops into place. */
export const RACK_RESET_MS = 2900;
