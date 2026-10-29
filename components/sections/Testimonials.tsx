"use client";

import type { CSSProperties } from "react";
import { useLocale, useTranslations } from "next-intl";
import { Marquee } from "@/components/ui/Marquee";
import { RevealOnScroll } from "@/components/ui/RevealOnScroll";
import { Container } from "@/components/ui/Container";

const TESTIMONIALS = [
  {
    quote: {
      pt: "Que perfeição. Tô apaixonada. Vc arrasou muito.",
      en: "Such perfection. I'm in love. You totally nailed it.",
    },
    name: "Bruna",
    role: { pt: "Cliente", en: "Client" },
  },
  {
    // Said informally in a chat; written in a more formal register at the site owner's request.
    quote: {
      pt: "Parabéns pelo trabalho, Caio. Ficou muito bom o que você me enviou.",
      en: "Congratulations on the work, Caio. What you sent me turned out very well.",
    },
    name: "Paulo",
    role: { pt: "Cliente", en: "Client" },
  },
  {
    quote: {
      pt: "O trabalho elevou completamente nossa marca. Profissionalismo e atenção aos detalhes do início ao fim.",
      en: "The work completely elevated our brand. Professionalism and attention to detail from start to finish.",
    },
    name: "Lauro Martins",
    role: { pt: "CEO, Zero7", en: "CEO, Zero7" },
  },
  {
    quote: {
      pt: "Profissional dedicado, com uma visão clara de design e resultado. Entregou muito mais do que esperávamos.",
      en: "A dedicated professional with a clear vision for design and results. Delivered far more than we expected.",
    },
    name: "Mariana Coser",
    role: { pt: "Advogada", en: "Attorney" },
  },
];

/** Each column drifts at its own speed, and neighbours go in opposite directions. */
const COLUMNS = [
  { offset: 0, reverse: false, duration: "46s" },
  { offset: 1, reverse: true, duration: "54s" },
  { offset: 0, reverse: false, duration: "50s" },
  { offset: 1, reverse: true, duration: "58s" },
] as const;

interface Testimonial {
  quote: string;
  name: string;
  role: string;
}

function TestimonialCard({ quote, name, role }: Testimonial) {
  return (
    <figure className="tm-card">
      <span aria-hidden className="tm-mark">
        &ldquo;
      </span>
      <blockquote className="tm-quote">{quote}</blockquote>
      <figcaption className="tm-by">
        <span className="tm-name">{name}</span>
        <span className="tm-role">{role}</span>
      </figcaption>
    </figure>
  );
}

/** Small screens: a plain card, so every testimonial can be read at once instead of one at a time. */
function ListCard({ quote, name, role }: Testimonial) {
  return (
    <figure className="rounded-2xl border border-fg/10 bg-bg-surface p-6">
      <span aria-hidden className="block font-serif text-4xl leading-none text-accent">
        &ldquo;
      </span>
      <blockquote className="mt-1 font-serif text-xl leading-snug text-fg">{quote}</blockquote>
      <figcaption className="mt-5 border-t border-fg/10 pt-4">
        <span className="block text-sm text-fg">{name}</span>
        <span className="block text-xs text-fg-muted">{role}</span>
      </figcaption>
    </figure>
  );
}

/** Rotates the list so neighbouring columns do not show the same card side by side. */
function rotate<T>(list: T[], by: number) {
  const n = by % list.length;
  return [...list.slice(n), ...list.slice(0, n)];
}

export function Testimonials() {
  const t = useTranslations("testimonials");
  const locale = useLocale() as "pt" | "en";

  const items: Testimonial[] = TESTIMONIALS.map((item) => ({
    quote: item.quote[locale],
    name: item.name,
    role: item.role[locale],
  }));
  // Few quotes need more copies to fill a column; more quotes need fewer.
  const repeat = Math.max(4, Math.ceil(10 / items.length));

  return (
    <section className="py-30 md:py-38">
      <Container>
        <RevealOnScroll>
          <h2 className="text-center font-serif text-4xl sm:text-5xl">{t("title")}</h2>
        </RevealOnScroll>

        {/* phones: all of them, one under the other */}
        <div className="mx-auto mt-10 flex max-w-xl flex-col gap-4 md:hidden">
          {items.map((item, index) => (
            <RevealOnScroll key={item.name} delay={index * 0.05}>
              <ListCard {...item} />
            </RevealOnScroll>
          ))}
        </div>

        {/* tablets and up: the tilted wall of cards */}
        <RevealOnScroll className="mx-auto mt-14 hidden max-w-5xl md:block">
          <div className="tm-stage">
            <div className="tm-plane">
              {COLUMNS.map((column, index) => (
                <Marquee
                  key={index}
                  vertical
                  pauseOnHover
                  reverse={column.reverse}
                  repeat={repeat}
                  // the same cards run in every column, so only the first is read aloud
                  aria-hidden={index > 0 ? true : undefined}
                  style={
                    {
                      "--duration": column.duration,
                      "--gap": "calc(var(--s) * 16px)",
                    } as CSSProperties
                  }
                >
                  {rotate(items, column.offset).map((item) => (
                    <TestimonialCard key={item.name} {...item} />
                  ))}
                </Marquee>
              ))}
            </div>

            <div aria-hidden className="tm-fade tm-fade--top" />
            <div aria-hidden className="tm-fade tm-fade--bottom" />
            <div aria-hidden className="tm-fade tm-fade--left" />
            <div aria-hidden className="tm-fade tm-fade--right" />
          </div>
        </RevealOnScroll>
      </Container>
    </section>
  );
}
