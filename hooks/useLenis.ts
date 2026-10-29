"use client";

import { useCallback } from "react";

export function useLenis() {
  const scrollTo = useCallback((target: string) => {
    document.querySelector(target)?.scrollIntoView({ behavior: "smooth" });
  }, []);

  return { scrollTo };
}
