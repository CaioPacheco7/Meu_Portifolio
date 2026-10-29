"use client";

import { useSyncExternalStore } from "react";

/**
 * Whether a CSS media query currently matches. The server and the first client render
 * answer `false`, so markup built from it is always the small-screen version; it settles
 * into the real answer straight after hydration.
 */
export function useMediaQuery(query: string) {
  return useSyncExternalStore(
    (notify) => {
      const mq = window.matchMedia(query);
      mq.addEventListener("change", notify);
      return () => mq.removeEventListener("change", notify);
    },
    () => window.matchMedia(query).matches,
    () => false,
  );
}
