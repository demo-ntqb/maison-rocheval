"use client";

import { useCallback, useSyncExternalStore } from "react";

import type { CarouselApi } from "@/shared/components/ui/carousel";

export function useProductDetailCarouselSelection(api: CarouselApi | undefined) {
  const subscribe = useCallback((notify: () => void) => {
    if (!api) return () => undefined;
    api.on("select", notify);
    return () => api.off("select", notify);
  }, [api]);
  const getSnapshot = useCallback(() => api?.selectedScrollSnap() ?? 0, [api]);
  const activeIndex = useSyncExternalStore(subscribe, getSnapshot, () => 0);

  return {
    activeIndex,
    selectImage: (index: number) => api?.scrollTo(index),
  };
}
