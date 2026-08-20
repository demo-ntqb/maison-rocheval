"use client";

import type { ComponentPropsWithoutRef, ElementType } from "react";

import { useInView } from "@/shared/hooks/use-in-view.hook";
import { cn } from "@/shared/lib/utils";

interface RevealProps extends ComponentPropsWithoutRef<"div"> {
  /** Render as a different element, e.g. `as="section"` for a landmark. */
  as?: ElementType;
  /** Stagger in milliseconds, for sibling reveals that should cascade. */
  delay?: number;
  /** Custom transition duration in ms (default: 800) */
  duration?: number;
  /** Custom translation offset in px (default: 32) */
  yOffset?: number;
  /** Fraction of the element that must be visible before it counts as in view. */
  threshold?: number;
  /** Margin around the root, e.g. "0px 0px -10% 0px" to fire slightly early. */
  rootMargin?: string;
}

/**
 * Fades and lifts its children into place the first time they scroll into
 * view. Children stay server-rendered — only this wrapper is a client leaf.
 *
 * The hidden state is behind `motion-safe:`, so readers who prefer reduced
 * motion get the fully visible content with no transition at all.
 */
export function Reveal({
  as,
  className,
  delay = 0,
  duration = 800,
  yOffset = 32,
  threshold = 0.05,
  rootMargin = "0px 0px -8% 0px",
  style,
  ...props
}: RevealProps) {
  const { ref, isInView } = useInView<HTMLDivElement>({ threshold, rootMargin });
  const Component = as ?? "div";

  return (
    <Component
      ref={ref}
      style={
        {
          ...style,
          "--reveal-delay": `${delay}ms`,
          "--reveal-duration": `${duration}ms`,
          "--reveal-y": `${yOffset}px`,
        } as React.CSSProperties
      }
      className={cn(
        "motion-safe:transition-[opacity,transform] motion-safe:duration-(--reveal-duration,800ms) motion-safe:delay-(--reveal-delay,0ms) motion-safe:ease-[cubic-bezier(0.215,0.61,0.355,1)]",
        isInView
          ? "motion-safe:translate-y-0 motion-safe:opacity-100"
          : "motion-safe:translate-y-(--reveal-y,32px) motion-safe:opacity-0",
        className,
      )}
      {...props}
    />
  );
}
