"use client";

import { useState, type ReactNode } from "react";
import { usePathname } from "next/navigation";
import { motion } from "framer-motion";

/**
 * Fades each new page in.
 *
 * There is deliberately no exit animation. With the App Router the incoming page replaces the
 * outgoing one immediately, so an exit animation runs on the *new* page: it either never
 * finishes (the page stays invisible, with only the menu showing) or fades the new page out.
 */
export function PageTransition({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  // the page that arrived from the server is shown as it is; it must not start out invisible
  const [firstPath] = useState(pathname);

  return (
    <motion.div
      key={pathname}
      initial={pathname === firstPath ? false : { opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.55, ease: [0.16, 1, 0.3, 1] }}
    >
      {children}
    </motion.div>
  );
}
