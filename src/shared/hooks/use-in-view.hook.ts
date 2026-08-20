"use client";

import { useEffect, useRef, useState } from "react";

interface UseInViewOptions {
  /** Fraction of the element that must be visible before it counts as in view. */
  threshold?: number;
  /** Margin around the root, e.g. "0px 0px -10% 0px" to fire slightly early. */
  rootMargin?: string;
}

/**
 * Reports the first time an element scrolls into the viewport, then stops
 * observing. Used for one-shot entrance animations, so a small
 * IntersectionObserver beats pulling in a scroll-animation library.
 *
 * Falls back to "in view" wherever IntersectionObserver is unavailable, so the
 * content is never left hidden.
 */
export function useInView<T extends HTMLElement = HTMLDivElement>({
  threshold = 0.05,
  rootMargin = "0px 0px -8% 0px",
}: UseInViewOptions = {}) {
  const ref = useRef<T>(null);
  const [isInView, setIsInView] = useState(false);

  useEffect(() => {
    const element = ref.current;

    if (!element || typeof IntersectionObserver === "undefined") {
      setIsInView(true);
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries.some((entry) => entry.isIntersecting)) {
          setIsInView(true);
          observer.disconnect();
        }
      },
      { threshold, rootMargin },
    );

    observer.observe(element);

    return () => observer.disconnect();
  }, [rootMargin, threshold]);

  return { ref, isInView };
}
