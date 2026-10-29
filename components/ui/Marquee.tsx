import type { ComponentPropsWithoutRef } from "react";
import { cn } from "@/lib/utils";

interface MarqueeProps extends ComponentPropsWithoutRef<"div"> {
  /** Run the other way. */
  reverse?: boolean;
  /** Stop while the pointer is over it. */
  pauseOnHover?: boolean;
  /** Scroll up and down instead of sideways. */
  vertical?: boolean;
  /**
   * How many copies of the content run end to end. The loop is seamless as long as
   * the copies together are taller (or wider) than the window plus one copy.
   */
  repeat?: number;
}

/**
 * An endless loop of its children. Speed and spacing are set with the
 * `--duration` and `--gap` custom properties (`[--duration:40s]`).
 * Only the first copy is exposed to assistive tech; the rest are decoration.
 */
export function Marquee({
  className,
  reverse = false,
  pauseOnHover = false,
  vertical = false,
  repeat = 4,
  children,
  ...props
}: MarqueeProps) {
  return (
    <div
      {...props}
      data-slot="marquee"
      className={cn(
        "group flex overflow-hidden p-2 [--duration:40s] [--gap:1rem] [gap:var(--gap)]",
        vertical ? "flex-col" : "flex-row",
        className,
      )}
    >
      {Array.from({ length: repeat }, (_, i) => (
        <div
          key={i}
          aria-hidden={i > 0 ? true : undefined}
          className={cn(
            "flex shrink-0 justify-around [gap:var(--gap)] motion-reduce:animate-none",
            vertical ? "animate-marquee-vertical flex-col" : "animate-marquee flex-row",
            pauseOnHover && "group-hover:[animation-play-state:paused]",
            reverse && "[animation-direction:reverse]",
          )}
        >
          {children}
        </div>
      ))}
    </div>
  );
}
