import { RING } from "./geometry";

const WIDTH = 4096;

/**
 * The inscription engraved around the halo: a dial of tick marks on the outer
 * edge, the phrase (set in the site's serif) through the middle, and a
 * hairline on the inner edge. White on black; the shader reads the red channel.
 *
 * The canvas is sized so one texel covers the same area horizontally and
 * vertically on the ring, which keeps the lettering from looking stretched.
 */
export function makeRingTexture(phrase: string, fontFamily: string) {
  const circumference = 2 * Math.PI * RING.radius;
  const height = Math.round((WIDTH * (2 * RING.halfWidth)) / circumference);

  const canvas = document.createElement("canvas");
  canvas.width = WIDTH;
  canvas.height = height;
  const ctx = canvas.getContext("2d");
  if (!ctx) return canvas;

  ctx.fillStyle = "#000";
  ctx.fillRect(0, 0, WIDTH, height);
  ctx.fillStyle = "#fff";
  ctx.textBaseline = "middle";

  // Text zone: the middle of the band, leaving room for the dial and hairline.
  const fontSize = Math.round(height * 0.3);
  ctx.font = `500 ${fontSize}px ${fontFamily}`;
  const text = phrase.toUpperCase();
  const glyphs = Array.from(text);
  const natural = glyphs.map((g) => ctx.measureText(g).width);
  const naturalWidth = natural.reduce((a, b) => a + b, 0);

  // Whole repeats of the phrase, tracked out so they close the circle exactly.
  const repeats = Math.max(1, Math.round(WIDTH / (naturalWidth * 1.45)));
  const tracking = (WIDTH / repeats - naturalWidth) / glyphs.length;
  const y = height * 0.5;

  let x = 0;
  for (let r = 0; r < repeats; r++) {
    glyphs.forEach((g, i) => {
      ctx.fillText(g, x + tracking * 0.5, y);
      x += natural[i] + tracking;
    });
  }

  // Dial on the outer edge (top of the canvas = outside): a tick every 3°, longer every 30°.
  // Sparse on purpose, so it stays clean when the ring is small on screen.
  const ticks = 120;
  for (let i = 0; i < ticks; i++) {
    const tx = (i / ticks) * WIDTH;
    const major = i % 10 === 0;
    const len = height * (major ? 0.11 : 0.06);
    ctx.fillRect(tx, height * 0.06, major ? 3.2 : 2, len);
  }

  // Inner hairline and a sparse row of dots beneath it.
  ctx.fillRect(0, height * 0.9, WIDTH, 1.6);
  for (let i = 0; i < 72; i++) {
    const tx = (i / 72) * WIDTH;
    ctx.beginPath();
    ctx.arc(tx, height * 0.95, 1.8, 0, Math.PI * 2);
    ctx.fill();
  }

  return canvas;
}
