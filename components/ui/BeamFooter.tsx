"use client";

/**
 * A closing section crossed by a slow diagonal shaft of light, with the name set
 * as a giant, bottom-cropped wordmark that the light runs through. Every letter
 * paints the same beam and pointer glow as the backdrop, aligned to the
 * footer's own coordinates, so the light reads as one shaft passing behind the
 * columns and through the letters.
 *
 * The beam drifts on its own and leans toward the pointer; the pointer carries
 * a soft glow that lights the letters it passes; letters lift on hover and hop
 * when clicked. Adapted from the "Beam Wordmark Footer" on 21st.dev; the colours
 * and the typeface come from the site, so it follows the theme.
 *
 * Styles live in globals.css under `bwf-`.
 */

import {
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
  type CSSProperties,
  type MouseEvent,
  type ReactNode,
} from "react";
import { useReducedMotion } from "@/hooks/useReducedMotion";
import { approach, baselineAt, beamTarget, drift, fitSize, wordHeight } from "@/lib/beam";

export interface BeamFooterSocial {
  label: string;
  href: string;
  /** An svg; it is sized and coloured by the footer. */
  icon: ReactNode;
}

export interface BeamFooterLink {
  label: string;
  href: string;
}

export interface BeamFooterColumn {
  title: string;
  links: BeamFooterLink[];
}

/** One credit line: `lead` muted, `label` bright (a link when it has an `href`), `tail` muted. */
export interface BeamFooterCredit {
  lead?: string;
  label?: string;
  href?: string;
  tail?: string;
}

interface BeamFooterProps {
  /** What the giant wordmark spells. */
  wordmark: string;
  /** The line over the first hairline. */
  label: string;
  socials: BeamFooterSocial[];
  credits: BeamFooterCredit[];
  columns: BeamFooterColumn[];
  /** Where the bottom edge cuts the wordmark, in em below its baseline. Negative cuts into the letters. */
  cut?: number;
}

const external = (href: string) =>
  /^https?:/.test(href) ? { target: "_blank", rel: "noreferrer" } : {};

/** A staggered entrance: each piece waits `n` steps. */
const step = (n: number) => ({ "--bwf-d": `${n * 70}ms` }) as CSSProperties;

/** Baseline of the wordmark's actual font, read off a canvas. */
const measureBaseline = (family: string, weight: string, text: string) => {
  try {
    const ctx = document.createElement("canvas").getContext("2d");
    if (!ctx) return 0.8;
    ctx.font = `${weight} 100px ${family}`;
    const m = ctx.measureText(text);
    return baselineAt(m.fontBoundingBoxAscent, m.fontBoundingBoxDescent);
  } catch {
    return 0.8;
  }
};

const Arrow = () => (
  <svg viewBox="0 0 12 12" aria-hidden="true">
    <path
      d="M2.5 9.5l7-7M4 2.5h5.5V8"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.4"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

export function BeamFooter({
  wordmark,
  label,
  socials,
  credits,
  columns,
  cut = 0.02,
}: BeamFooterProps) {
  const reduced = useReducedMotion();
  const letters = useMemo(() => Array.from(wordmark), [wordmark]);

  const rootRef = useRef<HTMLElement>(null);
  const wordRef = useRef<HTMLDivElement>(null);
  const innerRef = useRef<HTMLDivElement>(null);
  const [seen, setSeen] = useState(false);
  const [visible, setVisible] = useState(false);

  // The pointer lives in a ref and reaches the page as CSS variables, so the
  // beam never re-renders React.
  const ptr = useRef({ u: 0.5, x: 0, y: 0, inside: false });

  // Fit the wordmark to the content width, then tell every letter where it sits
  // inside the footer so its slice of the beam lines up with the backdrop.
  useLayoutEffect(() => {
    const root = rootRef.current;
    const box = wordRef.current;
    const inner = innerRef.current;
    if (!root || !box || !inner) return;

    let frame = 0;
    let alive = true;

    const place = () => {
      const r = root.getBoundingClientRect();
      root.style.setProperty("--bwf-rw", `${r.width}px`);
      root.style.setProperty("--bwf-rh", `${r.height}px`);

      let top = 0;
      inner.querySelectorAll<HTMLElement>(".bwf-l").forEach((letter, i) => {
        // offsetLeft/offsetTop ignore the entrance translate, so the beam is
        // already aligned while the letters are still rising.
        let x = 0;
        let y = 0;
        let el: HTMLElement | null = letter;
        while (el && el !== root) {
          x += el.offsetLeft;
          y += el.offsetTop;
          el = el.offsetParent as HTMLElement | null;
        }
        letter.style.setProperty("--bwf-x", `${x}px`);
        letter.style.setProperty("--bwf-y", `${y}px`);
        if (i === 0) top = y;
      });
      root.style.setProperty("--bwf-top", `${top}px`);
      root.style.setProperty(
        "--bwf-bot",
        `${top + (parseFloat(inner.style.fontSize) || 0) * 0.92}px`,
      );
    };

    const fit = () => {
      const wrap = inner.parentElement ?? box;
      const pad = parseFloat(getComputedStyle(wrap).paddingLeft) || 0;
      const target = wrap.clientWidth - pad * 2;

      inner.style.fontSize = "100px";
      const measured = inner.offsetWidth;
      const style = getComputedStyle(inner);
      const baseline = measureBaseline(style.fontFamily, style.fontWeight, wordmark);

      const size = fitSize(measured, target, target * 0.42);
      inner.style.fontSize = `${size}px`;
      box.style.height = `${wordHeight(size, baseline, cut)}px`;
      place();
    };

    const schedule = () => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(fit);
    };

    fit();
    const ro = new ResizeObserver(schedule);
    ro.observe(root);
    // The serif arrives after first paint, and it changes every measurement.
    const fonts = document.fonts;
    fonts?.addEventListener?.("loadingdone", schedule);
    void fonts?.ready.then(() => {
      if (alive) schedule();
    });

    return () => {
      alive = false;
      cancelAnimationFrame(frame);
      ro.disconnect();
      fonts?.removeEventListener?.("loadingdone", schedule);
    };
  }, [wordmark, cut]);

  // Reveal once, the first time the footer is on screen; the beam runs only while it is.
  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;
    const io = new IntersectionObserver(
      ([entry]) => {
        setVisible(entry.isIntersecting);
        if (entry.isIntersecting) setSeen(true);
      },
      { threshold: 0.12 },
    );
    io.observe(root);
    return () => io.disconnect();
  }, []);

  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;

    const paint = (beam: number, x: number, y: number, glow: number) => {
      root.style.setProperty("--bwf-b", `${beam.toFixed(2)}%`);
      root.style.setProperty("--bwf-px", `${x.toFixed(1)}px`);
      root.style.setProperty("--bwf-py", `${y.toFixed(1)}px`);
      root.style.setProperty("--bwf-g", glow.toFixed(3));
    };

    const track = (e: PointerEvent) => {
      const r = root.getBoundingClientRect();
      const p = ptr.current;
      p.x = e.clientX - r.left;
      p.y = e.clientY - r.top;
      p.u = r.width ? p.x / r.width : 0.5;
      p.inside = e.type !== "pointerleave";
      // With the beam held still, the glow still answers: it only moves when you do.
      if (reduced) paint(58, p.x, p.y, p.inside ? 1 : 0);
    };
    root.addEventListener("pointermove", track);
    root.addEventListener("pointerenter", track);
    root.addEventListener("pointerleave", track);

    let raf = 0;
    if (!reduced && visible) {
      let last = performance.now();
      let t = last / 1000;
      let beam = 58;
      let x = ptr.current.x;
      let y = ptr.current.y;
      let glow = 0;

      const tick = (now: number) => {
        const dt = Math.min(0.1, (now - last) / 1000);
        last = now;
        t += dt;
        const p = ptr.current;
        const idle = drift(t);
        beam = approach(beam, p.inside ? beamTarget(p.u) * 0.75 + idle * 0.25 : idle, 0.035, dt);
        x = approach(x, p.x, 0.16, dt);
        y = approach(y, p.y, 0.16, dt);
        glow = approach(glow, p.inside ? 1 : 0, 0.06, dt);
        paint(beam, x, y, glow);
        raf = requestAnimationFrame(tick);
      };
      raf = requestAnimationFrame(tick);
    }

    return () => {
      cancelAnimationFrame(raf);
      root.removeEventListener("pointermove", track);
      root.removeEventListener("pointerenter", track);
      root.removeEventListener("pointerleave", track);
    };
  }, [reduced, visible]);

  const hop = (e: MouseEvent<HTMLSpanElement>) => {
    if (reduced) return;
    const el = e.currentTarget;
    el.classList.remove("is-hop");
    void el.offsetWidth; // restart the animation
    el.classList.add("is-hop");
  };

  return (
    <footer ref={rootRef} className="bwf" data-in={seen || reduced ? "true" : "false"}>
      <noscript>
        <style>{".bwf .bwf-fade{opacity:1!important;translate:none!important}.bwf .bwf-lw{translate:none!important}"}</style>
      </noscript>
      <div className="bwf-rule" aria-hidden="true" />
      <div className="bwf-sky" aria-hidden="true">
        <div className="bwf-wash" />
        <div className="bwf-bands" />
        <div className="bwf-beam" />
        <div className="bwf-glow" />
        <div className="bwf-grain fx-grain" />
      </div>

      <div className="bwf-inner">
        <div className="bwf-col">
          <p className="bwf-label" style={step(1)}>
            {label}
          </p>

          {socials.length > 0 && (
            <ul className="bwf-socials">
              {socials.map((s, i) => (
                <li key={s.label} className="bwf-fade" style={step(2 + i)}>
                  <a className="bwf-soc" href={s.href} aria-label={s.label} {...external(s.href)}>
                    {s.icon}
                    <span className="bwf-tip" aria-hidden="true">
                      {s.label}
                    </span>
                  </a>
                </li>
              ))}
            </ul>
          )}

          {credits.length > 0 && (
            <div className="bwf-credits">
              {credits.map((c, i) => (
                <p key={i} className="bwf-fade" style={step(3 + socials.length + i)}>
                  {c.lead}
                  {c.label &&
                    (c.href ? (
                      <a href={c.href} {...external(c.href)}>
                        {c.label}
                      </a>
                    ) : (
                      <b>{c.label}</b>
                    ))}
                  {c.tail}
                </p>
              ))}
            </div>
          )}
        </div>

        {columns.map((col, ci) => (
          <nav key={col.title} className="bwf-col" aria-label={col.title}>
            <p className="bwf-label" style={step(2 + ci * 2)}>
              {col.title}
            </p>
            <ul className="bwf-links">
              {col.links.map((link, li) => (
                <li key={link.label} className="bwf-fade" style={step(3 + ci * 2 + li)}>
                  <a className="bwf-link" href={link.href} {...external(link.href)}>
                    <span className="bwf-link-t">{link.label}</span>
                    <Arrow />
                  </a>
                </li>
              ))}
            </ul>
          </nav>
        ))}
      </div>

      <div
        ref={wordRef}
        className="bwf-word"
        style={{ height: `calc(${(0.8 + cut) * 26}cqw)` }}
      >
        <p className="sr-only">{wordmark}</p>
        <div className="bwf-word-box">
          <div ref={innerRef} className="bwf-word-in" aria-hidden="true">
            {letters.map((ch, i) => (
              <span
                key={i}
                className="bwf-lw"
                style={{ "--bwf-d": `${260 + i * 75}ms` } as CSSProperties}
              >
                <span
                  className="bwf-l"
                  onClick={hop}
                  onAnimationEnd={(e) => e.currentTarget.classList.remove("is-hop")}
                >
                  {ch === " " ? " " : ch}
                </span>
              </span>
            ))}
          </div>
        </div>
        <div className="bwf-foot" aria-hidden="true" />
      </div>
    </footer>
  );
}
