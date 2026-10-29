import Image from "next/image";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { cn } from "@/lib/utils";

/** The CP symbol (transparent, cut from the artwork in public/images/logos) beside the site name. */
export function Logo({ className }: { className?: string }) {
  const t = useTranslations("nav");

  return (
    <Link
      href="/"
      className={cn(
        "inline-flex items-center gap-3 whitespace-nowrap font-serif text-xl tracking-wide text-fg transition-opacity hover:opacity-70",
        className,
      )}
    >
      <Image
        src="/images/logos/symbol.png"
        alt=""
        width={160}
        height={162}
        sizes="34px"
        quality={90}
        className="h-[34px] w-auto"
      />
      {t("brand")}
    </Link>
  );
}
