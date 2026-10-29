"use client";

import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

interface FilterTabsProps<T extends string> {
  options: { value: T; label: string }[];
  value: T;
  onChange: (value: T) => void;
}

export function FilterTabs<T extends string>({
  options,
  value,
  onChange,
}: FilterTabsProps<T>) {
  return (
    <div className="flex flex-wrap gap-x-6 border-b border-fg/10">
      {options.map((option) => (
        <button
          key={option.value}
          type="button"
          onClick={() => onChange(option.value)}
          className={cn(
            "relative py-3 text-sm transition-colors",
            value === option.value
              ? "text-fg"
              : "text-fg-muted hover:text-fg",
          )}
        >
          {option.label}
          {value === option.value && (
            <motion.span
              layoutId="filter-underline"
              className="absolute -bottom-px left-0 right-0 h-px bg-accent"
              transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
            />
          )}
        </button>
      ))}
    </div>
  );
}
