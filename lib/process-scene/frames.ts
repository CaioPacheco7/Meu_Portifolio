import { clamp01, easeInOut, lerp } from "./math";

/**
 * Everything the scroll timeline drives, for one frame. Between two frames
 * every field is interpolated, so adding a frame is adding a row.
 */
export interface Key {
  // placement
  spin: number;
  el: number;
  size: number;
  ox: number;
  oy: number;
  // core form
  rough: number;
  gem: number;
  cube: number;
  grid: number;
  irid: number;
  tint: number;
  // ring
  ringTilt: number;
  ringYaw: number;
  ringScale: number;
}

export const FRAME_IDS = ["briefing", "strategy", "design", "development", "delivery"] as const;
export const FRAME_COUNT = FRAME_IDS.length;

/** Fraction of each frame's slot the timeline rests before the next morph. */
export const HOLD = 0.34;

/**
 * One form per step of the process: 0 briefing, raw liquid metal · 1 strategy,
 * a cut gem · 2 design, a polished sphere · 3 development, a cube with a
 * lattice · 4 delivery, the dot: a clean sphere in the brand colour, closed by
 * the ring. The x offsets alternate with the copy, which alternates sides.
 */
export const KEYS: Key[] = [
  {
    spin: 0.3, el: 9, size: 0.54, ox: 0.44, oy: 0,
    rough: 1, gem: 0, cube: 0, grid: 0, irid: 0.2, tint: 0.25,
    ringTilt: 1.08, ringYaw: 0.35, ringScale: 1,
  },
  {
    spin: 1.7, el: 34, size: 0.54, ox: -0.46, oy: 0,
    rough: 0, gem: 1, cube: 0, grid: 0, irid: 0.1, tint: 0.2,
    ringTilt: 0.3, ringYaw: 1.2, ringScale: 1,
  },
  {
    spin: 2.7, el: 3, size: 0.56, ox: 0.44, oy: 0,
    rough: 0, gem: 0, cube: 0, grid: 0, irid: 1, tint: 0.15,
    ringTilt: 1.3, ringYaw: -0.4, ringScale: 1,
  },
  {
    spin: 3.9, el: 22, size: 0.54, ox: -0.46, oy: 0,
    rough: 0, gem: 0, cube: 1, grid: 1, irid: 0, tint: 0.45,
    ringTilt: 0.62, ringYaw: 2.1, ringScale: 1.08,
  },
  {
    spin: 5.0, el: 12, size: 0.46, ox: 0.44, oy: 0,
    rough: 0, gem: 0, cube: 0, grid: 0, irid: 0.35, tint: 0.8,
    ringTilt: 0.35, ringYaw: 0.1, ringScale: 0.92,
  },
];

/** Where the object sits in a frame, measured from the layout rather than keyed by hand. */
export type Placement = Pick<Key, "ox" | "oy" | "size">;

/**
 * Interpolated key at `coord`. `placements` (one per frame, from the measured
 * layout) replace the hand-written position and size; the keys above are the
 * fallback until the first measurement.
 */
export function keyAt(coord: number, placements?: Placement[]): Key {
  const last = FRAME_COUNT - 1;
  const i = Math.max(0, Math.min(last, Math.floor(coord)));
  const j = Math.min(last, i + 1);
  const f = coord - i;
  const a = { ...KEYS[i], ...placements?.[i] };
  const b = { ...KEYS[j], ...placements?.[j] };
  const out = {} as Key;
  for (const k of Object.keys(a) as (keyof Key)[]) out[k] = lerp(a[k], b[k], f);
  return out;
}

/** 0 while the root's top sits at the stage's top, 1 when its bottom does. */
export function progressFrom(top: number, height: number, viewport: number) {
  const travel = height - viewport;
  if (travel <= 0) return 0;
  return clamp01(-top / travel);
}

/**
 * Scroll progress → a continuous frame coordinate in 0..n-1. Integers are the
 * frames; each one holds for `hold` of its slot so the copy can be read
 * before the next morph begins.
 */
export function sceneCoord(p: number, n: number, hold: number) {
  if (n <= 1) return 0;
  const t = clamp01(p) * (n - 1);
  const i = Math.min(Math.floor(t), n - 2);
  const h = hold / 2;
  return i + easeInOut(clamp01((t - i - h) / (1 - 2 * h)));
}

/**
 * How present one element of frame `scene` is at `coord`. `delay` (0..1)
 * staggers it: late on the way in and, mirrored, late on the way out.
 */
export function reveal(coord: number, scene: number, delay: number) {
  const d = coord - scene;
  const lag = d < 0 ? delay : 1 - delay;
  return clamp01((0.6 - Math.abs(d) - lag * 0.2) / 0.25);
}
