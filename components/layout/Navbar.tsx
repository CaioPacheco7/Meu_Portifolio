"use client";

import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import { AnimatePresence, motion } from "framer-motion";
import { Menu, X } from "lucide-react";
import { Container } from "@/components/ui/Container";
import { Logo } from "@/components/ui/Logo";
import { LocaleSwitcher } from "@/components/ui/LocaleSwitcher";
import { NAV_LINKS } from "@/lib/constants";
import { useScrollDirection } from "@/hooks/useScrollDirection";
import { cn } from "@/lib/utils";

export function Navbar() {
  const t = useTranslations("nav");
  const { isScrolled } = useScrollDirection();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  // with the menu open the page behind it must not scroll
  useEffect(() => {
    if (!isMenuOpen) return;
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = previous;
    };
  }, [isMenuOpen]);

  return (
    <>
      <motion.header
        className={cn(
          "fixed inset-x-0 top-0 z-50 transition-[background-color,backdrop-filter,padding] duration-500",
          isScrolled || isMenuOpen
            ? "bg-bg/80 py-3 backdrop-blur-md"
            : "bg-transparent py-6",
        )}
      >
        <Container className="flex items-center justify-between">
          <Logo />

          <nav className="hidden items-center gap-8 md:flex">
            {NAV_LINKS.map((link) => (
              <a
                key={link.key}
                href={link.href}
                className="-my-3 py-3 text-sm text-fg-muted transition-colors hover:text-fg"
              >
                {t(link.key)}
              </a>
            ))}
          </nav>

          <div className="hidden md:block">
            <LocaleSwitcher />
          </div>

          <button
            type="button"
            onClick={() => setIsMenuOpen((open) => !open)}
            aria-label={isMenuOpen ? t("menuClose") : t("menuOpen")}
            aria-expanded={isMenuOpen}
            className="-mr-3 flex size-11 items-center justify-center text-fg md:hidden"
          >
            {isMenuOpen ? <X size={22} /> : <Menu size={22} />}
          </button>
        </Container>
      </motion.header>

      <AnimatePresence>
        {isMenuOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.4 }}
            className="fixed inset-0 z-40 flex flex-col justify-center bg-bg md:hidden"
          >
            <nav className="flex flex-col items-center gap-8">
              {NAV_LINKS.map((link) => (
                <a
                  key={link.key}
                  href={link.href}
                  onClick={() => setIsMenuOpen(false)}
                  className="font-serif text-3xl text-fg transition-colors hover:text-accent"
                >
                  {t(link.key)}
                </a>
              ))}
            </nav>

            <div className="mt-12 flex justify-center">
              <LocaleSwitcher />
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
