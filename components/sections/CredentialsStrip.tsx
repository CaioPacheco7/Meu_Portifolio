"use client";

import { useFormatter, useLocale, useTranslations } from "next-intl";
import { Marquee } from "@/components/ui/Marquee";
import { whatsappLink } from "@/lib/constants";
import { credentials } from "@/lib/credentials";

/**
 * Education and certifications as a strip that slides by on its own and stops under
 * the pointer. It lives inside the "Sobre mim" section and fills the width of its column.
 */
export function CredentialsStrip() {
  const t = useTranslations("credentials");
  const format = useFormatter();
  const locale = useLocale() as "pt" | "en";

  return (
    <div className="min-w-0">
      <h3 className="font-serif text-2xl sm:text-3xl">{t("title")}</h3>

      <div className="mt-5 [mask-image:linear-gradient(to_right,transparent,#000_6%,#000_94%,transparent)]">
        <Marquee
          pauseOnHover
          repeat={4}
          // with reduced motion it stops sliding, so let it scroll by hand and drop the copies
          className="-mx-2 [--duration:50s] [--gap:1rem] motion-reduce:overflow-x-auto motion-reduce:[&>div:not(:first-child)]:hidden"
        >
          {credentials.map((item) => {
            // UTC, so the month never slips to the neighbouring one in another timezone
            const month = format.dateTime(new Date(Date.UTC(item.year, item.month - 1, 1)), {
              month: "long",
              timeZone: "UTC",
            });

            return (
              <article
                key={item.id}
                className="flex w-60 shrink-0 flex-col rounded-2xl border border-fg/10 bg-bg-surface p-4 transition-colors hover:border-accent/60 sm:w-64"
              >
                <div className="flex items-baseline justify-between gap-3">
                  <p className="font-serif text-xl text-accent">{item.year}</p>
                  <p className="text-right text-[10px] uppercase tracking-[0.14em] text-fg-muted">
                    {t(`kinds.${item.kind}`)}
                  </p>
                </div>

                <h4 className="mt-3 font-serif text-xl leading-tight">{item.title[locale]}</h4>

                {item.topics && (
                  <p className="mt-2 line-clamp-2 text-[11px] leading-relaxed text-fg-muted">
                    {item.topics.map((topic) => topic[locale]).join(" · ")}
                  </p>
                )}

                <div className="mt-auto pt-4">
                  <p className="text-sm text-fg">{item.issuer}</p>
                  <p className="mt-0.5 text-xs text-fg-muted">
                    {month}
                    {item.hours ? ` · ${format.number(item.hours)} h` : ""}
                  </p>
                </div>
              </article>
            );
          })}
        </Marquee>
      </div>

      <p className="mt-4 text-sm text-fg-muted sm:text-xs">
        {t("onRequest")}{" "}
        <a
          href={whatsappLink(t("requestMessage"))}
          target="_blank"
          rel="noreferrer"
          className="-my-3 inline-block py-3 text-fg underline decoration-accent underline-offset-4 transition-colors hover:text-accent"
        >
          {t("requestLink")}
        </a>
      </p>
    </div>
  );
}
