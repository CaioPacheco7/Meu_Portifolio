"use client";

import { useTranslations } from "next-intl";
import { RevealText } from "@/components/ui/RevealText";
import { Button } from "@/components/ui/Button";
import { Container } from "@/components/ui/Container";
import { ContactForm } from "@/components/sections/ContactForm";
import { RevealOnScroll } from "@/components/ui/RevealOnScroll";
import { SocialLinks } from "@/components/ui/SocialLinks";
import { whatsappLink } from "@/lib/constants";

export function CtaSection() {
  const t = useTranslations("cta");

  return (
    <section
      id="contato"
      className="relative flex min-h-[80vh] items-center justify-center overflow-hidden py-30"
    >
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 opacity-40"
        style={{
          background:
            "radial-gradient(60% 60% at 50% 50%, rgba(108,123,255,0.18), transparent 70%)",
        }}
      />

      <Container className="relative text-center">
        <RevealText
          as="h2"
          className="mx-auto max-w-3xl font-serif text-5xl leading-tight sm:text-6xl lg:text-7xl"
        >
          {t("title")}
        </RevealText>

        <div className="mt-12">
          <Button href={whatsappLink(t("whatsappMessage"))}>{t("button")}</Button>
        </div>

        <ContactForm />

        <RevealOnScroll className="mt-24" delay={0.1}>
          <p className="mb-6 text-xs uppercase tracking-[0.3em] text-fg-muted">
            {t("social")}
          </p>
          <SocialLinks className="mx-auto max-w-2xl" />
        </RevealOnScroll>
      </Container>
    </section>
  );
}
