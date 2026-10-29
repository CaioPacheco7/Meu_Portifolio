"use client";

import { useParams } from "next/navigation";
import { useLocale } from "next-intl";
import { usePathname, useRouter } from "@/i18n/navigation";
import { routing } from "@/i18n/routing";
import { cn } from "@/lib/utils";

export function LocaleSwitcher({ className }: { className?: string }) {
  const locale = useLocale();
  const pathname = usePathname();
  const params = useParams();
  const router = useRouter();

  return (
    <div className={cn("flex items-center gap-2 text-sm", className)}>
      {routing.locales.map((loc, index) => (
        <span key={loc} className="flex items-center gap-2">
          {index > 0 && <span className="text-fg-muted">|</span>}
          <button
            type="button"
            onClick={() =>
              router.replace(
                // @ts-expect-error -- pathname may contain a dynamic segment,
                // params supplies the values for it when present
                { pathname, params },
                { locale: loc },
              )
            }
            className={cn(
              "uppercase tracking-wide transition-colors",
              loc === locale
                ? "text-fg"
                : "text-fg-muted hover:text-fg",
            )}
            aria-current={loc === locale}
          >
            {loc}
          </button>
        </span>
      ))}
    </div>
  );
}
