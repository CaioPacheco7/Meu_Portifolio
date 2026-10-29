"use client";

import { useRef, type ReactNode } from "react";
import { useGSAP } from "@gsap/react";
import { gsap } from "@/lib/gsap";
import { cn } from "@/lib/utils";

interface RevealOnScrollProps {
  children: ReactNode;
  className?: string;
  y?: number;
  delay?: number;
  start?: string;
  as?: "div" | "span";
}

export function RevealOnScroll({
  children,
  className,
  y = 40,
  delay = 0,
  start = "top 85%",
  as = "div",
}: RevealOnScrollProps) {
  const ref = useRef<HTMLDivElement>(null);
  const Tag = as;

  useGSAP(
    () => {
      if (!ref.current) return;

      gsap.from(ref.current, {
        y,
        opacity: 0,
        duration: 1.1,
        delay,
        ease: "power3.out",
        scrollTrigger: {
          trigger: ref.current,
          start,
          toggleActions: "play none none reverse",
        },
      });
    },
    { scope: ref },
  );

  return (
    <Tag ref={ref} className={cn(className)}>
      {children}
    </Tag>
  );
}
