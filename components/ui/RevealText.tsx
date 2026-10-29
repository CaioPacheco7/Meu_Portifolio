"use client";

import { useRef } from "react";
import { useGSAP } from "@gsap/react";
import { gsap, SplitText } from "@/lib/gsap";
import { cn } from "@/lib/utils";

interface RevealTextProps {
  children: string;
  className?: string;
  as?: "h1" | "h2" | "h3" | "p";
  splitBy?: "chars" | "words";
  delay?: number;
  triggerOnScroll?: boolean;
}

export function RevealText({
  children,
  className,
  as = "h2",
  splitBy = "words",
  delay = 0,
  triggerOnScroll = true,
}: RevealTextProps) {
  const ref = useRef<HTMLHeadingElement>(null);
  const Tag = as;

  useGSAP(
    () => {
      if (!ref.current) return;

      const split = new SplitText(ref.current, {
        type: splitBy,
        [splitBy]: `${splitBy}-line`,
      } as never);

      const targets = splitBy === "chars" ? split.chars : split.words;

      gsap.set(targets, { yPercent: 110, opacity: 0 });

      gsap.to(targets, {
        yPercent: 0,
        opacity: 1,
        duration: 1,
        delay,
        stagger: splitBy === "chars" ? 0.02 : 0.06,
        ease: "power3.out",
        scrollTrigger: triggerOnScroll
          ? {
              trigger: ref.current,
              start: "top 85%",
              toggleActions: "play none none reverse",
            }
          : undefined,
      });

      return () => split.revert();
    },
    { scope: ref, dependencies: [children, splitBy] },
  );

  return (
    <Tag ref={ref} className={cn("overflow-hidden", className)}>
      {children}
    </Tag>
  );
}
