"use client";

/**
 * "Meu Processo", as a scroll-scrubbed scene. The section is several screens
 * tall and the stage inside it is sticky, so scroll position is a timeline: a
 * liquid-chrome core is forged through the five steps of the process (raw
 * metal, cut gem, polished sphere, lattice cube, the finished brand dot) while
 * the copy of each step changes around it.
 *
 * The technique (sticky stage, scroll as timeline, camera keyframes, type that
 * morphs between layouts) follows the "Lycoris Specimen" component on 21st.dev;
 * the scene, shaders and copy here are this site’s own.
 */

import { useEffect, useRef, useState, type CSSProperties } from "react";
import { useTranslations } from "next-intl";
import { useReducedMotion } from "@/hooks/useReducedMotion";
import {
  FRAME_COUNT,
  FRAME_IDS,
  HOLD,
  KEYS,
  keyAt,
  progressFrom,
  reveal,
  sceneCoord,
  type Placement,
} from "@/lib/process-scene/frames";
import { planPlacements, type Rect } from "@/lib/process-scene/layout";
import { clamp01, smoothstep, type V3 } from "@/lib/process-scene/math";
import type { SceneRenderer } from "@/lib/process-scene/renderer";

/** Stage-heights of scroll per frame. */
const SCENE_SCROLL = 1;

type Fx = "rise" | "clip" | "line" | "fade";

/** Everything that belongs to one frame registers itself through these attributes. */
const sc = (scene: number, fx: Fx = "rise", delay = 0) => ({
  "data-sc": scene,
  "data-fx": fx,
  "data-d": delay,
});

// Every frame starts hidden; the loop owns them from the first tick.
const HIDDEN = { opacity: 0, visibility: "hidden" } as const;

const pad = (n: number) => String(n).padStart(2, "0");

function FrameCopy({
  scene,
  side,
  kicker,
  title,
  text,
  tags,
}: {
  scene: number;
  side: "left" | "right";
  kicker: string;
  title: string;
  text: string;
  tags: string[];
}) {
  return (
    <div data-zone={scene} className={`scene-block scene-block--${side}`}>
      <div className="flex items-center gap-4">
        <span
          {...sc(scene, "line")}
          style={HIDDEN}
          className="block h-px w-14 origin-left bg-accent"
        />
        <p {...sc(scene, "rise", 0.05)} style={HIDDEN} className="scene-kicker">
          <span className="text-accent">{pad(scene + 1)}</span> — {kicker}
        </p>
      </div>
      <h2
        {...sc(scene, "clip", 0.1)}
        // a title is one word, so it cannot wrap: its size follows its length (see .scene-title)
        style={{ ...HIDDEN, "--w": title.length * 0.43 } as CSSProperties}
        className="scene-title"
      >
        {title}
      </h2>
      <p {...sc(scene, "rise", 0.25)} style={HIDDEN} className="scene-text">
        {text}
      </p>
      <ul
        {...sc(scene, "rise", 0.4)}
        style={HIDDEN}
        className="mt-8 flex flex-wrap gap-2"
      >
        {tags.map((tag) => (
          <li key={tag} className="scene-tag">
            {tag}
          </li>
        ))}
      </ul>
    </div>
  );
}

export function ProcessScene() {
  const t = useTranslations("process");
  const reduced = useReducedMotion();

  const rootRef = useRef<HTMLElement>(null);
  const stageRef = useRef<HTMLDivElement>(null);
  const hostRef = useRef<HTMLDivElement>(null);
  const glowRef = useRef<HTMLDivElement>(null);
  const barRef = useRef<HTMLDivElement>(null);
  const live = useRef({ reduced });
  const [active, setActive] = useState(0);

  const ringText = t("scene.ringText");

  useEffect(() => {
    live.current.reduced = reduced;
  }, [reduced]);

  useEffect(() => {
    const root = rootRef.current;
    const stage = stageRef.current;
    const host = hostRef.current;
    const glow = glowRef.current;
    const bar = barRef.current;
    if (!root || !stage || !host || !glow || !bar) return;

    const coarse = window.matchMedia("(pointer: coarse)").matches;
    const detail = coarse || (navigator.hardwareConcurrency ?? 8) <= 4 ? 5 : 6;
    const accent =
      getComputedStyle(stage).getPropertyValue("--color-accent").trim() || "#6c7bff";

    let disposed = false;
    let renderer: SceneRenderer | null = null;
    let canvas: HTMLCanvasElement | null = null;
    let ready = false;

    let W = 1;
    let H = 1;
    let dpr = 1;
    let dprCap = coarse ? 1.75 : 2;

    // Where the object goes in each frame comes from the copy as laid out, not
    // from numbers tuned on one screen: it takes the emptiest spot the copy leaves.
    let placements: Placement[] | undefined;
    const zone = (name: string) => stage.querySelector<HTMLElement>(`[data-zone="${name}"]`);
    const planFrames = () => {
      const s = stage.getBoundingClientRect();
      const rel = (el: Element | null, trim = 0): Rect | null => {
        if (!el) return null;
        const r = el.getBoundingClientRect();
        if (r.width === 0 || r.height === 0) return null;
        return {
          left: r.left - s.left,
          right: r.right - s.left,
          top: r.top - s.top + r.height * trim,
          bottom: r.bottom - s.top,
        };
      };
      const shared = [rel(zone("hud")), rel(zone("nav")), rel(zone("eyebrow"))];
      const obstacles = FRAME_IDS.map((_, i) =>
        [...shared, rel(zone(String(i)))].filter((r): r is Rect => r !== null),
      );
      return planPlacements(W, H, obstacles, KEYS);
    };

    const measure = () => {
      const r = stage.getBoundingClientRect();
      W = Math.max(1, r.width);
      H = Math.max(1, r.height);
      dpr = Math.min(window.devicePixelRatio || 1, dprCap);
      renderer?.resize(W, H, dpr);
      placements = planFrames();
    };
    const ro = new ResizeObserver(measure);
    ro.observe(stage);
    measure();
    // Text metrics change once the serif loads, which moves the copy.
    const fonts = document.fonts;
    fonts?.addEventListener?.("loadingdone", measure);
    void fonts?.ready.then(() => {
      if (!disposed) measure();
    });

    // -- WebGL, created lazily so the copy is on screen before any of it loads --
    let bakeToken = 0;
    const bakeRing = async (r: SceneRenderer) => {
      const token = ++bakeToken;
      const { makeRingTexture } = await import("@/lib/process-scene/ring-texture");
      const serif = getComputedStyle(document.documentElement)
        .getPropertyValue("--font-cormorant")
        .trim();
      const stack = serif ? `${serif}, Georgia, serif` : "Georgia, serif";
      try {
        await document.fonts.load(`500 48px ${stack}`, ringText);
      } catch {
        // fall back to whatever face is already available
      }
      if (disposed || token !== bakeToken || renderer !== r) return;
      r.setRingTexture(makeRingTexture(ringText, stack));
    };

    const build = async (cv: HTMLCanvasElement) => {
      const { createRenderer } = await import("@/lib/process-scene/renderer");
      if (disposed) return;
      const r = createRenderer(cv, { accent, detail });
      if (!r) return;
      renderer = r;
      r.resize(W, H, dpr);
      void bakeRing(r);
    };

    const onLost = (e: Event) => {
      e.preventDefault();
      renderer = null;
    };
    const onRestored = () => {
      if (canvas) void build(canvas);
    };

    const boot = async () => {
      const cv = document.createElement("canvas");
      cv.className = "scene-canvas";
      cv.addEventListener("webglcontextlost", onLost);
      cv.addEventListener("webglcontextrestored", onRestored);
      host.appendChild(cv);
      canvas = cv;
      await build(cv);
      if (!renderer) {
        cv.remove();
        canvas = null;
      }
    };
    void boot();

    // -- stage elements ------------------------------------------------------
    const items = Array.from(stage.querySelectorAll<HTMLElement>("[data-sc]")).map(
      (el) => ({
        el,
        scene: Number(el.dataset.sc),
        fx: el.dataset.fx as Fx,
        delay: Number(el.dataset.d) || 0,
        last: -1,
      }),
    );

    // -- input ---------------------------------------------------------------
    const pointer = { x: 0, y: 0, tx: 0, ty: 0, inside: false };
    let spin = 0;
    let spinVel = 0;
    let drag: { id: number; x: number; y: number; at: number; moved: number } | null = null;
    let poke: V3 = [0, 1, 0];
    let pokeAge = 99;
    let hover: V3 = [0, 1, 0];
    let hoverAmt = 0;
    let cursor = "";
    const setCursor = (value: string) => {
      if (value === cursor) return;
      cursor = value;
      stage.style.cursor = value;
    };

    const track = (e: PointerEvent) => {
      const r = stage.getBoundingClientRect();
      pointer.tx = ((e.clientX - r.left) / r.width) * 2 - 1;
      pointer.ty = ((e.clientY - r.top) / r.height) * 2 - 1;
      pointer.inside = true;
    };
    const onMove = (e: PointerEvent) => {
      track(e);
      if (drag && drag.id === e.pointerId) {
        const dx = e.clientX - drag.x;
        drag.moved += Math.abs(dx) + Math.abs(e.clientY - drag.y);
        drag.x = e.clientX;
        drag.y = e.clientY;
        spinVel += dx * 0.0022;
      }
    };
    const onDown = (e: PointerEvent) => {
      if (e.pointerType === "mouse" && e.button !== 0) return;
      if ((e.target as HTMLElement).closest("a,button")) return;
      track(e);
      drag = { id: e.pointerId, x: e.clientX, y: e.clientY, at: performance.now(), moved: 0 };
      setCursor("grabbing");
    };
    const onUp = (e: PointerEvent) => {
      if (!drag || drag.id !== e.pointerId) return;
      const click = drag.moved < 6 && performance.now() - drag.at < 500;
      drag = null;
      setCursor("");
      if (click && renderer && !live.current.reduced) {
        track(e);
        const hit = renderer.pick(pointer.tx, -pointer.ty);
        if (hit) {
          poke = hit;
          pokeAge = 0;
        }
      }
    };
    const onLeave = () => {
      pointer.inside = false;
    };
    stage.addEventListener("pointermove", onMove);
    stage.addEventListener("pointerdown", onDown);
    stage.addEventListener("pointerleave", onLeave);
    window.addEventListener("pointerup", onUp);
    window.addEventListener("pointercancel", onUp);

    // -- the loop --------------------------------------------------------------
    let raf = 0;
    let running = false;
    let visible = true;
    let last = performance.now();
    const born = last;
    let time = 0;
    let prog = -1;
    let shown = -1;
    let ema = 16;

    const applyFx = (it: (typeof items)[number], q: number, dir: number, still: boolean) => {
      const s = it.el.style;
      s.visibility = q <= 0 ? "hidden" : "";
      if (it.fx === "line") {
        s.opacity = String(Math.min(1, q * 2));
        s.transform = still ? "" : `scaleX(${q})`;
        return;
      }
      s.opacity = String(q);
      if (still || it.fx === "fade") return;
      if (it.fx === "clip") {
        if (q >= 0.999) {
          s.clipPath = "";
          s.transform = "";
          return;
        }
        const hid = ((1 - q) * 100).toFixed(1);
        s.clipPath = dir > 0 ? `inset(0 0 ${hid}% 0)` : `inset(${hid}% 0 0 0)`;
        s.transform = `translateY(${((1 - q) * 0.4 * dir).toFixed(3)}em)`;
        return;
      }
      s.transform = q >= 0.999 ? "" : `translateY(${((1 - q) * 34 * dir).toFixed(1)}px)`;
      s.filter = q > 0.995 ? "" : `blur(${((1 - q) * 8).toFixed(1)}px)`;
    };

    const frame = (now: number) => {
      raf = requestAnimationFrame(frame);
      const dt = Math.min(0.05, (now - last) / 1000);
      last = now;
      const still = live.current.reduced;
      const moving = !still;
      if (moving) time += dt;

      // Step the resolution down if the device can't hold the frame rate.
      ema += (dt * 1000 - ema) * 0.04;
      if (ema > 30 && dprCap > 1) {
        dprCap = Math.max(1, dprCap - 0.25);
        ema = 16;
        measure();
      }

      const rect = root.getBoundingClientRect();
      const p = progressFrom(rect.top, rect.height, H);
      prog = prog < 0 || still ? p : prog + (p - prog) * (1 - Math.exp(-dt * 9));
      const coord = sceneCoord(prog, FRAME_COUNT, HOLD);
      const scene = Math.round(coord);
      if (scene !== shown) {
        shown = scene;
        setActive(scene);
      }
      bar.style.transform = `scaleX(${prog.toFixed(4)})`;

      // pointer, drag inertia, hover magnet
      const ease = 1 - Math.exp(-dt * 5);
      pointer.x += (pointer.tx - pointer.x) * ease;
      pointer.y += (pointer.ty - pointer.y) * ease;
      if (moving) {
        spin += spinVel + dt * 0.08;
        spinVel *= Math.exp(-dt * 2.6);
        pokeAge += dt;
      } else {
        spin += spinVel;
        spinVel = 0;
      }
      const px = moving ? pointer.x : 0;
      const py = moving ? pointer.y : 0;

      let hit: V3 | null = null;
      if (renderer && moving && pointer.inside && !drag) {
        hit = renderer.pick(pointer.tx, -pointer.ty);
      }
      if (hit) hover = hit;
      hoverAmt += ((hit ? 1 : 0) - hoverAmt) * (1 - Math.exp(-dt * 6));
      if (!drag) setCursor(hoverAmt > 0.5 ? "grab" : "");

      // scene
      const k = keyAt(coord, placements);
      const off = coord - Math.round(coord);
      const burst = smoothstep(0, 0.42, Math.abs(off));
      const intro = moving ? clamp01((now - born) / 2600) : 1;
      const grow = 1 - Math.pow(1 - intro, 3);
      const minDim = Math.min(W, H);
      const size = k.size * (1 - 0.05 * burst);

      if (renderer) {
        renderer.render({
          time,
          width: W,
          height: H,
          spin: k.spin + spin + px * 0.18,
          elevation: k.el + py * 6,
          size,
          offsetX: k.ox,
          offsetY: k.oy,
          tiltX: py * 0.06,
          intro,
          rough: k.rough,
          gem: k.gem,
          cube: k.cube,
          grid: k.grid,
          irid: k.irid,
          tint: k.tint,
          ringTilt: k.ringTilt,
          ringYaw: k.ringYaw + (1 - grow) * 1.6,
          ringScale: k.ringScale * (1 + 0.9 * (1 - grow)),
          ringScroll: time * 0.012 + coord * 0.22,
          burst: moving ? Math.max(burst, 1 - intro) : 0,
          pointer: [pointer.x, -pointer.y],
          poke,
          pokeAge,
          hover,
          hoverAmt,
        });
        if (!ready && canvas) {
          ready = true;
          canvas.style.opacity = "1";
        }
      }

      // the haze behind the object follows it
      const gr = size * minDim * 1.35;
      const gx = (0.5 + k.ox / 2) * W;
      const gy = (0.5 - k.oy / 2) * H;
      glow.style.width = glow.style.height = `${gr * 2}px`;
      glow.style.transform = `translate(${(gx - gr).toFixed(1)}px,${(gy - gr).toFixed(1)}px)`;

      // frame copy
      for (const it of items) {
        const v = reveal(coord, it.scene, it.delay);
        const q = Math.round(v * 500) / 500;
        if (q === it.last) continue;
        it.last = q;
        applyFx(it, q, coord < it.scene ? 1 : -1, still);
      }

    };

    const start = () => {
      if (running || !visible || document.hidden) return;
      running = true;
      last = performance.now();
      raf = requestAnimationFrame(frame);
    };
    const stop = () => {
      running = false;
      cancelAnimationFrame(raf);
    };
    const io = new IntersectionObserver(([entry]) => {
      visible = entry.isIntersecting;
      if (visible) start();
      else stop();
    });
    io.observe(root);
    const onVisibility = () => (document.hidden ? stop() : start());
    document.addEventListener("visibilitychange", onVisibility);
    start();

    return () => {
      disposed = true;
      stop();
      io.disconnect();
      ro.disconnect();
      fonts?.removeEventListener?.("loadingdone", measure);
      document.removeEventListener("visibilitychange", onVisibility);
      stage.removeEventListener("pointermove", onMove);
      stage.removeEventListener("pointerdown", onDown);
      stage.removeEventListener("pointerleave", onLeave);
      window.removeEventListener("pointerup", onUp);
      window.removeEventListener("pointercancel", onUp);
      canvas?.removeEventListener("webglcontextlost", onLost);
      canvas?.removeEventListener("webglcontextrestored", onRestored);
      renderer?.dispose();
      canvas?.remove();
    };
  }, [ringText]);

  const jump = (index: number) => {
    const root = rootRef.current;
    const stage = stageRef.current;
    if (!root || !stage) return;
    const r = root.getBoundingClientRect();
    const travel = r.height - stage.clientHeight;
    const delta = (index / (FRAME_COUNT - 1)) * travel + r.top;
    window.scrollBy({ top: delta, behavior: reduced ? "auto" : "smooth" });
  };

  const tags = (id: (typeof FRAME_IDS)[number]) =>
    t.raw(`scene.frames.${id}.tags`) as string[];

  return (
    <section
      ref={rootRef}
      id="processo"
      aria-labelledby="processo-title"
      className="relative w-full"
      style={{ height: `calc(100svh * ${1 + (FRAME_COUNT - 1) * SCENE_SCROLL})` }}
    >
      <div
        ref={stageRef}
        className="scene-stage sticky top-0 h-svh w-full touch-pan-y select-none overflow-hidden"
      >
        {/* atmosphere: haze that follows the object, vignette, film grain */}
        <div aria-hidden className="scene-fade-bottom pointer-events-none absolute inset-0">
          <div
            ref={glowRef}
            className="absolute left-0 top-0 rounded-full will-change-transform"
            style={{
              background:
                "radial-gradient(closest-side, rgba(108,123,255,0.22), rgba(108,123,255,0.07) 48%, transparent 100%)",
            }}
          />
        </div>
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0"
          style={{
            background:
              "radial-gradient(120% 90% at 50% 45%, transparent 55%, rgba(5,5,5,0.85) 100%)",
          }}
        />

        <div ref={hostRef} aria-hidden className="scene-fade-bottom absolute inset-0" />

        <div aria-hidden className="fx-grain pointer-events-none absolute inset-0" />

        <h2
          id="processo-title"
          data-zone="eyebrow"
          className="scene-eyebrow pointer-events-none flex items-center gap-3 text-[11px] font-normal uppercase tracking-[0.3em] text-fg-muted"
        >
          <span className="size-1.5 rounded-full bg-accent" />
          {t("title")}
        </h2>

        {/* the five steps, with the copy alternating sides */}
        <div className="pointer-events-none absolute inset-0">
          {FRAME_IDS.map((id, i) => (
            <FrameCopy
              key={id}
              scene={i}
              side={i % 2 === 0 ? "left" : "right"}
              kicker={t(`scene.frames.${id}.kicker`)}
              title={t(`steps.${id}.title`)}
              text={t(`steps.${id}.description`)}
              tags={tags(id)}
            />
          ))}
        </div>

        {/* chrome: hint, counter, frame ticks, progress */}
        <div data-zone="hud" className="scene-hud pointer-events-none">
          <p {...sc(0, "rise", 0.6)} style={HIDDEN} className="scene-hint">
            {t("scene.hint")}
          </p>
          <p className="mt-3 text-[11px] uppercase tracking-[0.3em] text-fg-muted">
            <span className="text-accent">{pad(active + 1)}</span> / {pad(FRAME_COUNT)} —{" "}
            {t(`steps.${FRAME_IDS[active]}.title`)}
          </p>
        </div>

        <nav aria-label={t("scene.navLabel")} data-zone="nav" className="scene-nav text-fg-muted">
          {FRAME_IDS.map((id, i) => (
            <button
              key={id}
              type="button"
              onClick={() => jump(i)}
              aria-current={active === i ? "step" : undefined}
              className={active === i ? "text-fg" : undefined}
            >
              <span className="scene-lab text-[10px] uppercase tracking-[0.25em]">
                {t(`steps.${id}.title`)}
              </span>
              <span className="scene-tick" />
            </button>
          ))}
        </nav>

        <div
          ref={barRef}
          aria-hidden
          className="absolute bottom-0 left-0 h-px w-full origin-left scale-x-0 bg-accent"
        />
      </div>
    </section>
  );
}
