"use client";

import { useRef } from "react";
import Image from "next/image";
import { useTranslations } from "next-intl";
import { useGSAP } from "@gsap/react";
import { gsap } from "@/lib/gsap";
import { Button } from "@/components/ui/Button";
import { useLenis } from "@/hooks/useLenis";

const NAME = ["Caio", "Pacheco"];
/** Index of each word's first letter, for staggering the entrance across both words. */
const NAME_OFFSETS = NAME.map((_, w) => NAME.slice(0, w).join("").length);

export function Hero() {
  const t = useTranslations("hero");
  const { scrollTo } = useLenis();
  const sectionRef = useRef<HTMLElement>(null);
  const year = new Date().getFullYear();

  useGSAP(
    () => {
      const section = sectionRef.current;
      if (!section) return;

      const mm = gsap.matchMedia();
      mm.add("(prefers-reduced-motion: no-preference)", () => {
        gsap.from(".hero-photo-img", {
          opacity: 0,
          scale: 1.06,
          duration: 1.8,
          ease: "power3.out",
        });
        gsap.from(".hero-fade", {
          y: 24,
          opacity: 0,
          duration: 1,
          stagger: 0.12,
          delay: 0.5,
          ease: "power3.out",
        });

        // the portrait drifts slower than the page; the name comes apart letter by letter
        gsap.to(".hero-photo-img", {
          yPercent: 8,
          ease: "none",
          scrollTrigger: {
            trigger: section,
            start: "top top",
            end: "bottom top",
            scrub: true,
          },
        });
        gsap.to("[data-ch]", {
          yPercent: -45,
          opacity: 0,
          filter: "blur(10px)",
          stagger: 0.03,
          ease: "none",
          scrollTrigger: {
            trigger: section,
            start: "top top",
            end: "75% top",
            scrub: true,
          },
        });
      });
    },
    { scope: sectionRef },
  );

  return (
    <section
      ref={sectionRef}
      className="hero-stage relative h-svh min-h-[600px] w-full overflow-hidden"
    >
      {/* haze behind the portrait, vignette, film grain */}
      <div aria-hidden className="hero-haze pointer-events-none absolute inset-0" />

      <div className="hero-photo pointer-events-none">
        <div className="hero-photo-fade">
          <div className="hero-photo-img absolute inset-0 will-change-transform">
            <Image
              src="/images/profile/hero.png"
              alt={t("photoAlt")}
              fill
              preload
              quality={90}
              sizes="(max-width: 1024px) 100vw, 55vw"
              className="object-cover"
            />
          </div>
        </div>
      </div>

      <div
        aria-hidden
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            "radial-gradient(120% 90% at 50% 45%, transparent 55%, rgba(5,5,5,0.85) 100%)",
        }}
      />
      <div aria-hidden className="fx-grain pointer-events-none absolute inset-0" />

      <h1 className="hero-name font-serif font-light text-fg" aria-label={NAME.join(" ")}>
        {NAME.map((word, w) => (
          <span key={word} className="hero-name-word" aria-hidden>
            {Array.from(word).map((c, ci) => (
              <span key={ci} data-ch className="inline-block will-change-transform">
                <span
                  className="hero-char"
                  style={{ animationDelay: `${0.35 + (NAME_OFFSETS[w] + ci) * 0.07}s` }}
                >
                  {c}
                </span>
              </span>
            ))}
            {w < NAME.length - 1 ? " " : null}
          </span>
        ))}
      </h1>

      <p className="hero-fade hero-cover-meta flex items-center gap-3 text-[11px] uppercase tracking-[0.3em] text-fg-muted">
        <span className="size-1.5 rounded-full bg-accent" />
        {t("portfolio")} {year}
      </p>

      <div className="hero-cover-copy">
        <p className="hero-fade hero-role">{t("role")}</p>
        <p className="hero-fade hero-desc">{t("description")}</p>
        <div className="hero-fade mt-9">
          <Button onClick={() => scrollTo("#projetos")}>{t("cta")}</Button>
        </div>
      </div>

      <button
        type="button"
        onClick={() => scrollTo("#projetos")}
        className="hero-fade hero-cue text-xs uppercase tracking-widest text-fg-muted transition-colors hover:text-fg"
      >
        <span>{t("scroll")}</span>
        <span className="h-10 w-px animate-pulse bg-fg-muted" />
      </button>
    </section>
  );
}
