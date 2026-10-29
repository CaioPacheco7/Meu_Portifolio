"use client";

import type { ReactNode } from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

interface ButtonProps {
  children: ReactNode;
  variant?: "primary" | "accent" | "ghost";
  className?: string;
  type?: "button" | "submit" | "reset";
  disabled?: boolean;
  onClick?: () => void;
  /** Renders a link instead of a button. Web addresses open in a new tab. */
  href?: string;
}

export function Button({
  children,
  variant = "primary",
  className,
  href,
  ...props
}: ButtonProps) {
  const shared = {
    whileHover: { scale: 1.02 },
    whileTap: { scale: 0.98 },
    transition: { duration: 0.4, ease: [0.16, 1, 0.3, 1] as const },
    className: cn(
      "inline-flex items-center gap-2 rounded-full px-8 py-4 text-sm font-medium tracking-wide transition-colors",
      variant === "primary" && "bg-fg text-bg hover:bg-accent hover:text-fg",
      // the brand colour: the one that should catch the eye (the mirror of "primary" on hover)
      variant === "accent" &&
        "bg-accent text-bg shadow-[0_10px_30px_-10px_rgba(108,123,255,0.7)] hover:bg-fg",
      variant === "ghost" && "border border-fg/20 text-fg hover:border-accent hover:text-accent",
      className,
    ),
  };

  if (href) {
    const external = /^https?:/.test(href);
    return (
      <motion.a
        href={href}
        {...(external ? { target: "_blank", rel: "noreferrer" } : {})}
        {...shared}
      >
        {children}
      </motion.a>
    );
  }

  return (
    <motion.button {...shared} {...props}>
      {children}
    </motion.button>
  );
}
