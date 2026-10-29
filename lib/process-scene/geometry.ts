import { normalize, type V3 } from "./math";

/**
 * Unit icosphere. Every vertex is just a direction: the vertex shader decides
 * how far out along it the surface sits, which is what lets one mesh morph
 * between a lumpy blob, a cut gem, a sphere and a cube.
 */
export function icosphere(subdivisions: number) {
  const t = (1 + Math.sqrt(5)) / 2;
  const verts: V3[] = (
    [
      [-1, t, 0], [1, t, 0], [-1, -t, 0], [1, -t, 0],
      [0, -1, t], [0, 1, t], [0, -1, -t], [0, 1, -t],
      [t, 0, -1], [t, 0, 1], [-t, 0, -1], [-t, 0, 1],
    ] as V3[]
  ).map(normalize);

  let faces: [number, number, number][] = [
    [0, 11, 5], [0, 5, 1], [0, 1, 7], [0, 7, 10], [0, 10, 11],
    [1, 5, 9], [5, 11, 4], [11, 10, 2], [10, 7, 6], [7, 1, 8],
    [3, 9, 4], [3, 4, 2], [3, 2, 6], [3, 6, 8], [3, 8, 9],
    [4, 9, 5], [2, 4, 11], [6, 2, 10], [8, 6, 7], [9, 8, 1],
  ];

  const cache = new Map<number, number>();
  const midpoint = (a: number, b: number) => {
    const key = a < b ? a * 65536 + b : b * 65536 + a;
    const hit = cache.get(key);
    if (hit !== undefined) return hit;
    const m = normalize([
      (verts[a][0] + verts[b][0]) / 2,
      (verts[a][1] + verts[b][1]) / 2,
      (verts[a][2] + verts[b][2]) / 2,
    ]);
    verts.push(m);
    cache.set(key, verts.length - 1);
    return verts.length - 1;
  };

  for (let s = 0; s < subdivisions; s++) {
    const next: [number, number, number][] = [];
    for (const [a, b, c] of faces) {
      const ab = midpoint(a, b);
      const bc = midpoint(b, c);
      const ca = midpoint(c, a);
      next.push([a, ab, ca], [b, bc, ab], [c, ca, bc], [ab, bc, ca]);
    }
    faces = next;
  }

  const positions = new Float32Array(verts.length * 3);
  verts.forEach((v, i) => positions.set(v, i * 3));
  const indices = new Uint16Array(faces.length * 3);
  faces.forEach((f, i) => indices.set(f, i * 3));
  return { positions, indices };
}

/** Radius that a frame’s `size` frames: roughly the core at its largest. */
export const FIT_RADIUS = 1.25;

/** Halo ring: a flat, thin annulus with a bevelled edge, lying in the XZ plane. */
export const RING = {
  radius: 1.58,
  halfWidth: 0.17,
  halfThick: 0.024,
  bevel: 0.014,
} as const;

/**
 * Interleaved: position(3) normal(3) profile(3), where profile is
 * (angle 0..1, across-the-width 0..1, face +1 top / -1 bottom / 0 edge).
 */
export const RING_STRIDE = 9;

export function ringBand(segments = 288) {
  const { radius, halfWidth: hw, halfThick: ht, bevel: b } = RING;
  const arc = 4;

  // Profile outline as (radial x, height y, normal nx, ny, across-the-width).
  const prof: [number, number, number, number, number][] = [];
  const corner = (cx: number, cy: number, from: number) => {
    for (let i = 0; i <= arc; i++) {
      const a = from + (i / arc) * (Math.PI / 2);
      const nx = Math.cos(a);
      const ny = Math.sin(a);
      prof.push([cx + nx * b, cy + ny * b, nx, ny, (cx + nx * b + hw) / (2 * hw)]);
    }
  };
  // Counter-clockwise from the outer top corner.
  corner(hw - b, ht - b, 0);
  corner(-hw + b, ht - b, Math.PI / 2);
  corner(-hw + b, -ht + b, Math.PI);
  corner(hw - b, -ht + b, (3 * Math.PI) / 2);

  const n = prof.length;
  const data = new Float32Array((segments + 1) * n * RING_STRIDE);
  let o = 0;
  for (let i = 0; i <= segments; i++) {
    const u = i / segments;
    const th = u * Math.PI * 2;
    const c = Math.cos(th);
    const s = Math.sin(th);
    for (const [x, y, nx, ny, across] of prof) {
      const r = radius + x;
      data[o++] = c * r;
      data[o++] = y;
      data[o++] = s * r;
      data[o++] = c * nx;
      data[o++] = ny;
      data[o++] = s * nx;
      data[o++] = u;
      data[o++] = across;
      data[o++] = ny > 0.999 ? 1 : ny < -0.999 ? -1 : 0;
    }
  }

  const indices = new Uint16Array(segments * n * 6);
  let k = 0;
  for (let i = 0; i < segments; i++) {
    for (let j = 0; j < n; j++) {
      const a = i * n + j;
      const bb = i * n + ((j + 1) % n);
      const c2 = (i + 1) * n + j;
      const d = (i + 1) * n + ((j + 1) % n);
      indices[k++] = a; indices[k++] = bb; indices[k++] = c2;
      indices[k++] = bb; indices[k++] = d; indices[k++] = c2;
    }
  }
  return { data, indices };
}

/** Forge sparks: four random numbers per point, consumed by the vertex shader. */
export function sparkSeeds(count: number) {
  const seeds = new Float32Array(count * 4);
  // Deterministic, so the field looks the same on every load.
  let s = 1337;
  const rand = () => {
    s = (s * 1664525 + 1013904223) >>> 0;
    return s / 4294967296;
  };
  for (let i = 0; i < seeds.length; i++) seeds[i] = rand();
  return seeds;
}
