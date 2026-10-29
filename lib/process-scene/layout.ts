import { FIT_RADIUS, RING } from "./geometry";
import { clamp01 } from "./math";
import type { Placement } from "./frames";

export interface Rect {
  left: number;
  top: number;
  right: number;
  bottom: number;
}

const distanceToRect = (x: number, y: number, r: Rect) =>
  Math.hypot(Math.max(r.left - x, 0, x - r.right), Math.max(r.top - y, 0, y - r.bottom));

/**
 * The largest circle that fits inside `area` without touching any obstacle.
 * A coarse grid search, then one finer pass around the winner: cheap enough to
 * run on every resize, and it never needs to know which side the copy is on.
 *
 * Wide free bands make many circles equally large, so each candidate is nudged
 * towards `anchor` (where the frame would like the object): the radius decides,
 * the anchor only breaks ties.
 */
export function emptiestCircle(
  area: Rect,
  obstacles: Rect[],
  gap: number,
  anchor: { x: number; y: number },
) {
  const radiusAt = (x: number, y: number) => {
    let r = Math.min(x - area.left, area.right - x, y - area.top, area.bottom - y);
    for (const o of obstacles) r = Math.min(r, distanceToRect(x, y, o) - gap);
    return r;
  };

  let best = { x: (area.left + area.right) / 2, y: (area.top + area.bottom) / 2, r: -Infinity };
  let bestScore = -Infinity;
  const scan = (x0: number, x1: number, y0: number, y1: number, nx: number, ny: number) => {
    for (let i = 0; i <= nx; i++) {
      for (let j = 0; j <= ny; j++) {
        const x = x0 + ((x1 - x0) * i) / nx;
        const y = y0 + ((y1 - y0) * j) / ny;
        const r = radiusAt(x, y);
        const score = r - 0.1 * Math.hypot(x - anchor.x, y - anchor.y);
        if (score > bestScore) {
          bestScore = score;
          best = { x, y, r };
        }
      }
    }
  };

  scan(area.left, area.right, area.top, area.bottom, 56, 36);
  const sx = (area.right - area.left) / 56;
  const sy = (area.bottom - area.top) / 36;
  scan(best.x - sx, best.x + sx, best.y - sy, best.y + sy, 16, 16);
  return best;
}

/** Perspective makes the near side of the ring a touch larger than its nominal radius. */
const PERSPECTIVE = 1.1;

/**
 * Where the object goes in each frame: the emptiest spot left by that frame's
 * copy, sized so the whole assembly (ring included, at any angle) fits inside.
 * The ring is sized as a circle because it keeps turning: whatever its tilt,
 * it never leaves that circle.
 */
export function planPlacements(
  width: number,
  height: number,
  obstacles: Rect[][],
  keys: { ox: number; oy: number; ringScale: number }[],
): Placement[] {
  const minDim = Math.min(width, height);
  const sideMargin = Math.max(20, width * 0.03);
  const area: Rect = {
    left: sideMargin,
    right: width - sideMargin,
    // clear of the fixed navbar
    top: 84,
    bottom: height - Math.max(28, height * 0.05),
  };

  return obstacles.map((list, i) => {
    const anchor = {
      x: ((keys[i].ox + 1) / 2) * width,
      y: ((1 - keys[i].oy) / 2) * height,
    };
    const c = emptiestCircle(area, list, 18, anchor);
    const ring = ((RING.radius + RING.halfWidth) / FIT_RADIUS) * keys[i].ringScale * PERSPECTIVE;
    const size = clamp01((2 * Math.max(c.r, 40)) / (minDim * ring));
    return {
      ox: (c.x / width) * 2 - 1,
      oy: 1 - (c.y / height) * 2,
      size: Math.min(0.95, Math.max(0.2, size)),
    };
  });
}
