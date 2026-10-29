"use client";

import { useId, useState, type ChangeEvent, type FormEvent, type ReactNode } from "react";
import { useTranslations } from "next-intl";
import { ChevronDown } from "lucide-react";
import { RevealOnScroll } from "@/components/ui/RevealOnScroll";
import { whatsappLink } from "@/lib/constants";
import { cn } from "@/lib/utils";

const SERVICES = ["site", "landing", "store", "system", "app", "redesign", "other"] as const;

const EMPTY = {
  name: "",
  company: "",
  site: "",
  service: "",
  challenge: "",
};
type Fields = typeof EMPTY;

const inputClass =
  "w-full rounded-lg border border-fg/10 bg-bg-surface px-4 py-3 text-base text-fg outline-none transition-colors placeholder:text-fg-muted/50 focus:border-accent sm:text-sm";

function Field({
  id,
  label,
  error,
  children,
}: {
  id: string;
  label: string;
  error?: string;
  children: ReactNode;
}) {
  return (
    <div className="space-y-2">
      <label htmlFor={id} className="block text-xs font-medium leading-snug text-fg-muted">
        {label}
      </label>
      {children}
      {error && (
        <p id={`${id}-error`} role="alert" className="text-sm text-red-400">
          {error}
        </p>
      )}
    </div>
  );
}

const invalidClass = "border-red-400/70 focus:border-red-400";

/**
 * The project brief. There is no server behind it: the answers are written into a
 * WhatsApp message and the chat opens with it already typed, ready to send.
 */
export function ContactForm() {
  const t = useTranslations("contactForm");
  const uid = useId();
  const [fields, setFields] = useState<Fields>(EMPTY);
  const [sent, setSent] = useState(false);
  // errors only show once someone has tried to send, so an untouched form stays calm
  const [attempted, setAttempted] = useState(false);

  const set =
    (key: keyof Fields) =>
    (event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
      const { value } = event.target;
      setFields((current) => ({ ...current, [key]: value }));
      setSent(false);
    };

  // WhatsApp already shows who is writing, so only a name and what they need are required.
  const nameOk = fields.name.trim().length >= 2;
  const serviceOk = fields.service !== "";
  const errors = {
    name: attempted && !nameOk ? t("errors.name") : undefined,
    service: attempted && !serviceOk ? t("errors.service") : undefined,
  };

  const onSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!nameOk || !serviceOk) {
      setAttempted(true);
      // take the person straight to what is missing
      const target = !nameOk ? "name" : "service";
      document.getElementById(`${uid}-${target}`)?.focus();
      return;
    }

    const line = (label: string, value: string) => `*${label}:* ${value.trim()}`;
    const text = [
      t("message.intro"),
      "",
      line(t("message.name"), fields.name),
      fields.company.trim() ? line(t("message.company"), fields.company) : null,
      fields.site.trim() ? line(t("message.site"), fields.site) : null,
      line(t("message.service"), t(`services.${fields.service}`)),
      fields.challenge.trim() ? line(t("message.challenge"), fields.challenge) : null,
    ]
      .filter((l): l is string => l !== null)
      .join("\n");

    const url = whatsappLink(text);
    const opened = window.open(url, "_blank");
    if (opened) opened.opener = null;
    else window.location.href = url;
    setSent(true);
  };

  return (
    <div className="mx-auto mt-16 grid max-w-5xl gap-10 border-t border-fg/10 pt-14 text-left md:mt-24 md:gap-12 md:pt-20 lg:grid-cols-[5fr_6fr] lg:gap-20">
      <RevealOnScroll>
        <p className="mb-8 flex items-center gap-3 text-[11px] uppercase tracking-[0.3em] text-fg-muted">
          <span className="size-1.5 rounded-full bg-accent" />
          {t("eyebrow")}
        </p>
        <h3 className="font-serif text-4xl leading-[1.05] sm:text-5xl">{t("title")}</h3>
        <div className="my-7 h-px w-full bg-fg/15" />
        <p className="max-w-md leading-relaxed text-fg-muted">{t("text")}</p>
      </RevealOnScroll>

      <RevealOnScroll delay={0.1}>
        <form onSubmit={onSubmit} noValidate className="space-y-5">
          <Field id={`${uid}-name`} label={t("fields.name.label")} error={errors.name}>
            <input
              id={`${uid}-name`}
              type="text"
              autoComplete="name"
              autoCapitalize="words"
              required
              aria-invalid={errors.name ? true : undefined}
              aria-describedby={errors.name ? `${uid}-name-error` : undefined}
              value={fields.name}
              onChange={set("name")}
              placeholder={t("fields.name.placeholder")}
              className={cn(inputClass, errors.name && invalidClass)}
            />
          </Field>

          <Field id={`${uid}-company`} label={t("fields.company.label")}>
            <input
              id={`${uid}-company`}
              type="text"
              autoComplete="organization"
              value={fields.company}
              onChange={set("company")}
              placeholder={t("fields.company.placeholder")}
              className={inputClass}
            />
          </Field>

          <Field id={`${uid}-site`} label={t("fields.site.label")}>
            <input
              id={`${uid}-site`}
              type="text"
              inputMode="url"
              autoComplete="url"
              autoCapitalize="none"
              autoCorrect="off"
              spellCheck={false}
              value={fields.site}
              onChange={set("site")}
              placeholder={t("fields.site.placeholder")}
              className={inputClass}
            />
          </Field>

          <Field id={`${uid}-service`} label={t("fields.service.label")} error={errors.service}>
            <div className="relative">
              <select
                id={`${uid}-service`}
                required
                aria-invalid={errors.service ? true : undefined}
                aria-describedby={errors.service ? `${uid}-service-error` : undefined}
                value={fields.service}
                onChange={set("service")}
                className={cn(
                  inputClass,
                  "appearance-none pr-10",
                  fields.service === "" && "text-fg-muted/50",
                  errors.service && invalidClass,
                )}
              >
                <option value="" disabled>
                  {t("fields.service.placeholder")}
                </option>
                {SERVICES.map((key) => (
                  <option key={key} value={key} className="bg-bg-surface text-fg">
                    {t(`services.${key}`)}
                  </option>
                ))}
              </select>
              <ChevronDown
                aria-hidden
                size={16}
                className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-fg-muted"
              />
            </div>
          </Field>

          <Field id={`${uid}-challenge`} label={t("fields.challenge.label")}>
            <textarea
              id={`${uid}-challenge`}
              rows={4}
              value={fields.challenge}
              onChange={set("challenge")}
              placeholder={t("fields.challenge.placeholder")}
              className={cn(inputClass, "resize-none")}
            />
          </Field>

          <button
            type="submit"
            className="min-h-14 w-full rounded-full bg-fg px-6 py-4 text-base font-medium tracking-wide text-bg transition-colors hover:bg-accent hover:text-fg active:bg-accent active:text-fg sm:text-sm"
          >
            {t("submit")}
          </button>

          <p role="status" aria-live="polite" className="min-h-5 text-sm text-accent">
            {sent ? t("sent") : ""}
          </p>
        </form>
      </RevealOnScroll>
    </div>
  );
}
