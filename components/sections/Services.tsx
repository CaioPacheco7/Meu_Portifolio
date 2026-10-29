"use client";

import { useTranslations } from "next-intl";
import { RevealOnScroll } from "@/components/ui/RevealOnScroll";
import { Container } from "@/components/ui/Container";

const SERVICE_KEYS = ["webDesign", "development", "uxui", "consulting"] as const;

export function Services() {
  const t = useTranslations("services");

  return (
    <section id="servicos" className="py-30 md:py-38">
      <Container>
        <RevealOnScroll>
          <h2 className="font-serif text-4xl sm:text-5xl">{t("title")}</h2>
        </RevealOnScroll>

        <div className="mt-14 divide-y divide-fg/10 border-y border-fg/10">
          {SERVICE_KEYS.map((key, index) => (
            <RevealOnScroll key={key} delay={index * 0.06} as="div">
              <div className="group flex flex-col justify-between gap-4 border-l-2 border-transparent px-2 py-10 transition-colors hover:border-accent hover:bg-bg-surface sm:flex-row sm:items-center sm:px-8">
                <h3 className="font-serif text-3xl transition-colors group-hover:text-accent">
                  {t(`items.${key}.title`)}
                </h3>
                <p className="max-w-md text-fg-muted">
                  {t(`items.${key}.description`)}
                </p>
              </div>
            </RevealOnScroll>
          ))}
        </div>
      </Container>
    </section>
  );
}
