"use client";

import type { ComponentPropsWithoutRef, ElementType } from "react";

import { useInView } from "@/shared/hooks/use-in-view.hook";
import { cn } from "@/shared/lib/utils";

interface RevealProps extends ComponentPropsWithoutRef<"div"> {
  /** Render as a different element, e.g. `as="section"` for a landmark. */
  as?: ElementType;
  /** Stagger in milliseconds, for sibling reveals that should cascade. */
  delay?: number;
}

/**
 * Fades and lifts its children into place the first time they scroll into
 * view. Children stay server-rendered — only this wrapper is a client leaf.
 *
 * The hidden state is behind `motion-safe:`, so readers who prefer reduced
 * motion get the fully visible content with no transition at all.
 */
export function Reveal({ as, className, delay = 0, style, ...props }: RevealProps) {
  const { ref, isInView } = useInView<HTMLDivElement>();
  const Component = as ?? "div";

  return (
    <Component
      ref={ref}
      style={delay ? { ...style, transitionDelay: `${delay}ms` } : style}
      className={cn(
        "motion-safe:transition-[opacity,transform] motion-safe:duration-700 motion-safe:ease-out",
        isInView
          ? "motion-safe:translate-y-0 motion-safe:opacity-100"
          : "motion-safe:translate-y-6 motion-safe:opacity-0",
        className,
      )}
      {...props}
    />
  );
}
