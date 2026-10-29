"use client";

import { useTranslations } from "next-intl";
import { Container } from "@/components/ui/Container";
import { RevealOnScroll } from "@/components/ui/RevealOnScroll";

const STEPS = ["briefing", "strategy", "design", "development", "delivery"] as const;

/**
 * "Meu Processo" for small screens: the five steps as a short timeline. The scroll-driven
 * 3D scene (ProcessScene) is too heavy and too tall to read well on a phone.
 */
export function ProcessList() {
  const t = useTranslations("process");

  return (
    <section id="processo" aria-labelledby="processo-title" className="py-20 md:py-28">
      <Container>
        <RevealOnScroll>
          <h2 id="processo-title" className="font-serif text-4xl sm:text-5xl">
            {t("title")}
          </h2>
        </RevealOnScroll>

        <ol className="relative mt-12 max-w-2xl space-y-10 border-l border-fg/15 pl-8 sm:pl-10">
          {STEPS.map((id, index) => (
            <li key={id} className="relative">
              {/* the dot sits on the timeline */}
              <span
                aria-hidden
                className="absolute -left-[calc(2rem+0.5px+0.5rem)] top-0.5 flex size-4 items-center justify-center rounded-full border border-accent bg-bg sm:-left-[calc(2.5rem+0.5px+0.5rem)]"
              >
                <span className="size-1.5 rounded-full bg-accent" />
              </span>

              <RevealOnScroll delay={0.04}>
                <p className="text-[11px] uppercase tracking-[0.25em] text-fg-muted">
                  <span className="text-accent">{String(index + 1).padStart(2, "0")}</span> —{" "}
                  {t(`scene.frames.${id}.kicker`)}
                </p>
                <h3 className="mt-2 font-serif text-3xl leading-tight">{t(`steps.${id}.title`)}</h3>
                <p className="mt-2 leading-relaxed text-fg-muted">{t(`steps.${id}.description`)}</p>

                <ul className="mt-4 flex flex-wrap gap-2">
                  {(t.raw(`scene.frames.${id}.tags`) as string[]).map((tag) => (
                    <li
                      key={tag}
                      className="rounded-full border border-fg/15 px-3 py-1 text-[11px] uppercase tracking-[0.14em] text-fg-muted"
                    >
                      {tag}
                    </li>
                  ))}
                </ul>
              </RevealOnScroll>
            </li>
          ))}
        </ol>
      </Container>
    </section>
  );
}
