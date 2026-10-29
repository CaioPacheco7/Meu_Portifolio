// Pure maths behind the footer's beam of light and its fitted wordmark.

export const clamp = (v: number, lo: number, hi: number) => (v < lo ? lo : v > hi ? hi : v);

/**
 * Font size (px) that makes a word measured at 100px span `target` px. A short
 * word would grow into a tower, so it is capped at `cap` px. Bad input is 0.
 */
export const fitSize = (measuredAt100: number, target: number, cap: number) => {
  if (!(measuredAt100 > 0) || !(target > 0)) return 0;
  const size = (100 * target) / measuredAt100;
  return cap > 0 ? Math.min(size, cap) : size;
};

/** Where the beam sits (% across the footer) for a pointer at `u` (0 → 1 across). */
export const beamTarget = (u: number, lo = 30, hi = 82) =>
  lo + (hi - lo) * clamp(Number.isFinite(u) ? u : 0.5, 0, 1);

/** The beam's idle sway: two slow, unrelated sines so it never visibly loops. */
export const drift = (t: number, centre = 58, amp = 9) =>
  centre + amp * (0.7 * Math.sin(t * 0.21) + 0.3 * Math.sin(t * 0.077 + 1.3));

/** Frame-rate independent ease toward a target: `k` is the fraction closed per 1/60s. */
export const approach = (from: number, to: number, k: number, dt: number) =>
  to + (from - to) * Math.pow(1 - clamp(k, 0, 1), clamp(dt, 0, 0.1) * 60);

/**
 * Where the baseline sits in a `line-height: 1` box, as a fraction of the font
 * size, from the font's ascent and descent at 100px. The line box is 100px; the
 * content area is centred in it. Missing metrics fall back to a typical 0.8.
 */
export const baselineAt = (ascent: number, descent: number) => {
  if (!(ascent > 0) || !(descent >= 0)) return 0.8;
  return clamp(((100 - ascent - descent) / 2 + ascent) / 100, 0.5, 1.2);
};

/** Visible wordmark height: down to the baseline, plus `cut` em below it (negative cuts into the letters). */
export const wordHeight = (fontSize: number, baseline: number, cut: number) =>
  Math.max(0, fontSize * (baseline + clamp(Number.isFinite(cut) ? cut : 0, -0.4, 0.4)));
