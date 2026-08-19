"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import * as TabsPrimitive from "@radix-ui/react-tabs";
import { ChevronLeft, ChevronRight } from "lucide-react";

import type {
  CollectionCarouselLabels,
  CollectionCaviarContent,
} from "../types/about-the-product.type";
import { AboutCollectionCard } from "./about-collection-card";
import { AboutCollectionPanel } from "./about-collection-panel";

/**
 * The collection selector and its detail panel (Figma 409:18452 / 410:23379).
 *
 * Built on Radix Tabs rather than hand-rolled state so the strip gets roving
 * focus and the correct tab/tabpanel wiring for free. The shadcn `ui/tabs`
 * skin is deliberately bypassed: its defaults (fixed 32px list height, muted
 * pill background) are the opposite of this design, and they are not meant to
 * be restyled in place.
 *
 * On mobile the strip scrolls horizontally with snap points, and the caret
 * buttons below the panel page through the five caviars, keeping the selected
 * card centred in view.
 */
export function AboutCollectionCarousel({
  caviars,
  labels,
}: {
  caviars: CollectionCaviarContent[];
  labels: CollectionCarouselLabels;
}) {
  const [activeId, setActiveId] = useState(caviars[0].id);
  const listRef = useRef<HTMLDivElement>(null);

  const step = useCallback(
    (offset: number) => {
      const current = caviars.findIndex((caviar) => caviar.id === activeId);
      const next = (current + offset + caviars.length) % caviars.length;
      setActiveId(caviars[next].id);
    },
    [activeId, caviars],
  );

  useEffect(() => {
    const list = listRef.current;
    if (!list || list.scrollWidth <= list.clientWidth) return;

    // Deferred a frame: selecting a caviar swaps the whole detail panel, and
    // the relayout that follows cancels a smooth scroll started in the same
    // commit — the strip would silently snap back to the start.
    const frame = requestAnimationFrame(() => {
      const card = list.querySelector<HTMLElement>(`[data-caviar="${activeId}"]`);
      if (!card) return;

      // Centre by comparing rectangles rather than `offsetLeft`: the strip is
      // statically positioned, so `offsetLeft` is measured against a far-away
      // ancestor and would centre the wrong thing.
      const listBox = list.getBoundingClientRect();
      const cardBox = card.getBoundingClientRect();
      const delta = cardBox.left + cardBox.width / 2 - (listBox.left + listBox.width / 2);
      const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

      list.scrollBy({ left: delta, behavior: prefersReducedMotion ? "auto" : "smooth" });
    });

    return () => cancelAnimationFrame(frame);
  }, [activeId]);

  return (
    <TabsPrimitive.Root
      value={activeId}
      onValueChange={setActiveId}
      orientation="horizontal"
      className="flex w-full flex-col gap-[54px]"
    >
      <TabsPrimitive.List
        ref={listRef}
        aria-label={labels.selectorLabel}
        data-node-id="409:18456"
        className="flex snap-x snap-mandatory gap-4 overflow-x-auto [-ms-overflow-style:none] [scrollbar-width:none] lg:justify-center lg:overflow-x-visible [&::-webkit-scrollbar]:hidden"
      >
        {caviars.map((caviar) => (
          <AboutCollectionCard key={caviar.id} caviar={caviar} />
        ))}
      </TabsPrimitive.List>

      {/* `relative` so the unselected panels can be lifted out of flow and
          stacked underneath the selected one during the dissolve. */}
      <div className="relative w-full">
        {caviars.map((caviar) => (
          <AboutCollectionPanel
            key={caviar.id}
            caviar={caviar}
            atTableLabel={labels.atTable}
            isActive={caviar.id === activeId}
          />
        ))}
      </div>

      <div className="flex items-center justify-center gap-4 lg:hidden" data-node-id="410:25345">
        <button
          type="button"
          aria-label={labels.previous}
          onClick={() => step(-1)}
          /* The design draws 32px controls; the ::after box lifts the touch
             target to 48px without changing the visual size. */
          className="relative flex size-8 items-center justify-center rounded-[4px] text-ink transition-opacity after:absolute after:-inset-2 after:content-[''] hover:opacity-60 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ink"
        >
          <ChevronLeft className="size-6" strokeWidth={1.5} aria-hidden="true" />
        </button>
        <button
          type="button"
          aria-label={labels.next}
          onClick={() => step(1)}
          className="relative flex size-8 items-center justify-center rounded-[4px] text-ink transition-opacity after:absolute after:-inset-2 after:content-[''] hover:opacity-60 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ink"
        >
          <ChevronRight className="size-6" strokeWidth={1.5} aria-hidden="true" />
        </button>
      </div>
    </TabsPrimitive.Root>
  );
}
