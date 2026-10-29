"use client";

import Image from "next/image";
import { MapPin } from "lucide-react";
import { useTranslations } from "next-intl";
import { CredentialsStrip } from "@/components/sections/CredentialsStrip";
import { Container } from "@/components/ui/Container";
import { RevealOnScroll } from "@/components/ui/RevealOnScroll";
import { RevealText } from "@/components/ui/RevealText";
import { FORJA_PORTFOLIO_URL } from "@/lib/constants";
import { credentials } from "@/lib/credentials";
import { projects } from "@/lib/projects";

// Only facts that can be checked. The counts come from the site's own data, so they cannot drift
// into something untrue when a project or a certificate is added or removed.
const GRADUATION_YEAR = credentials.find((c) => c.kind === "degree")?.year;
const FACTS = [
  { value: String(GRADUATION_YEAR ?? ""), key: "graduated" },
  { value: String(credentials.filter((c) => c.kind !== "degree").length), key: "certifications" },
  { value: String(projects.length), key: "projects" },
] as const;

export function About() {
  const t = useTranslations("about");

  return (
    <section id="sobre" className="py-36 md:py-48">
      {/* Two columns from laptop width up. The photo and the text share one card on the right and span both
          rows; the headline and the education strip sit together in the middle of the left column. The
          gutter is kept short, so the card stays close to what it belongs with. */}
      <Container className="grid max-w-[1500px] gap-x-12 gap-y-14 lg:gap-y-16 lg:grid-cols-[minmax(0,1fr)_25rem] lg:gap-x-16 xl:grid-cols-[minmax(0,1fr)_30rem] xl:gap-x-24">
        <div className="lg:col-start-1 lg:row-start-1 lg:self-end">
          <p className="mb-8 flex items-center gap-3 text-[11px] uppercase tracking-[0.3em] text-accent">
            <span className="size-1.5 rounded-full bg-accent" />
            {t("eyebrow")}
          </p>

          <RevealText as="h2" className="pb-1 font-serif text-[clamp(1.6rem,9.2vw,3rem)] leading-[1.05] max-sm:whitespace-nowrap sm:text-6xl lg:text-5xl xl:text-7xl">
            {t("heading.line1")}
          </RevealText>
          <RevealText
            as="p"
            delay={0.1}
            className="pb-3 font-serif text-[clamp(1.6rem,9.2vw,3rem)] italic leading-[1.05] text-accent max-sm:whitespace-nowrap sm:text-6xl lg:text-5xl xl:text-7xl"
          >
            {t("heading.line2")}
          </RevealText>

          <RevealOnScroll className="mt-16 grid max-w-lg grid-cols-3 divide-x divide-fg/15" delay={0.1}>
            {FACTS.map(({ value, key }) => (
              <div key={key} className="px-4 first:pl-0 sm:px-8">
                <p className="font-serif text-4xl text-fg">{value}</p>
                <p className="mt-1 text-sm text-fg-muted">{t(`stats.${key}`)}</p>
              </div>
            ))}
          </RevealOnScroll>
        </div>

        <RevealOnScroll className="lg:col-start-2 lg:row-span-2 lg:row-start-1 lg:self-center">
          <div className="mx-auto max-w-xl rounded-2xl border border-fg/10 bg-bg-surface p-3 sm:p-4 md:max-w-none md:max-lg:flex md:max-lg:items-stretch md:max-lg:gap-6 lg:mx-0 lg:max-w-none">
            <div className="relative aspect-[440/422] w-full overflow-hidden rounded-xl bg-bg-elevated md:max-lg:aspect-auto md:max-lg:min-h-[22rem] md:max-lg:w-[44%] md:max-lg:shrink-0">
              <Image
                src="/images/profile/about.jpg"
                alt={t("photoAlt")}
                fill
                quality={90}
                sizes="(max-width: 768px) 100vw, (max-width: 1024px) 40vw, 30rem"
                className="object-cover"
                style={{ objectPosition: "50% 40%" }}
              />
            </div>

            <div className="px-2 pb-3 pt-7 sm:px-3 md:max-lg:flex md:max-lg:flex-col md:max-lg:justify-center md:max-lg:py-4">
              <div className="space-y-4 text-[15px] leading-relaxed text-fg/70">
                <p>{t("bio.p1")}</p>
                <p>{t("bio.p2")}</p>
                <p>
                  {t.rich("bio.p3", {
                    link: (chunks) => (
                      <a
                        href={FORJA_PORTFOLIO_URL}
                        target="_blank"
                        rel="noreferrer"
                        className="text-accent underline decoration-accent/40 underline-offset-4 transition-colors hover:decoration-accent"
                      >
                        {chunks}
                      </a>
                    ),
                  })}
                </p>
                <p>{t("bio.p4")}</p>
              </div>

              <p className="mt-6 flex items-center gap-2 border-t border-fg/10 pt-5 text-xs text-fg-muted">
                <MapPin size={14} aria-hidden className="text-accent" />
                {t("location")}
              </p>
            </div>
          </div>
        </RevealOnScroll>

        {/* last in the markup so it follows the card on small screens; right under the headline from laptop width up */}
        <RevealOnScroll className="min-w-0 lg:col-start-1 lg:row-start-2 lg:self-start" delay={0.1}>
          <CredentialsStrip />
        </RevealOnScroll>
      </Container>
    </section>
  );
}
