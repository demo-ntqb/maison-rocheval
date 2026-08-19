"use client";

import useEmblaCarousel from "embla-carousel-react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useCallback, useEffect, useState } from "react";

import { Link } from "@/i18n/navigation";
import { ROUTES } from "@/shared/constants/route.constant";

type Venue = {
  alt: string;
  assetId: string;
  city: string;
  description: string;
  image: string;
  name: string;
  plumbId: string;
  stars: number;
};

const STAR_COLORS = ["#a1a1a1", "#a1a1a1", "#a1a1a1", "#a1a1a1", "#a1a1a1"];

function StarRow({ count, plumbId }: { count: number; plumbId: string }) {
  return (
    <span
      data-plumb-id={plumbId}
      aria-label={`${count} Michelin stars`}
      className="mt-5 flex items-center gap-1 font-display text-sm font-bold"
    >
      <span>
        {[...Array(count)].map((_, i) => (
          <span
            key={i}
            aria-hidden="true"
            style={{ color: STAR_COLORS[i] || "#a1a1a1" }}
            className="mr-0.5"
          >
            ★
          </span>
        ))}
      </span>
      <span className="ml-2 text-ink">
        {count} Michelin {count === 1 ? "Star" : "Stars"}
      </span>
    </span>
  );
}

export function AboutVenuesCarousel({ venues }: { venues: Venue[] }) {
  const [ref, api] = useEmblaCarousel({
    align: "center",
    containScroll: "trimSnaps",
  });
  const [canScroll, setCanScroll] = useState([false, false]);
  const sync = useCallback(
    () =>
      setCanScroll([
        api?.canScrollPrev() ?? false,
        api?.canScrollNext() ?? false,
      ]),
    [api],
  );

  useEffect(() => {
    if (!api) return;
    api.on("select", sync).on("reInit", sync);
    const timer = window.setTimeout(sync, 0);
    return () => {
      window.clearTimeout(timer);
      api.off("select", sync).off("reInit", sync);
    };
  }, [api, sync]);

  return (
    <div role="region" aria-roledescription="carousel" aria-label="Restaurant partners">
      <div ref={ref} className="overflow-hidden">
        <div className="flex gap-6 md:gap-8">
          {venues.map((venue) => (
            <article
              key={venue.name}
              role="group"
              aria-roledescription="slide"
              className="min-w-0 flex-[0_0_86%] md:flex-[0_0_500px]"
              data-plumb-id={venue.plumbId}
            >
              <img
                src={venue.image}
                alt={venue.alt}
                loading="lazy"
                decoding="async"
                width={500}
                height={700}
                sizes="(max-width: 767px) 86vw, 500px"
                className="aspect-[.72] w-full rounded-[2px] object-cover"
                data-plumb-asset={venue.assetId}
              />
              <div className="px-8 py-8">
                <h3 className="font-display text-[32px] leading-none">
                  {venue.name}
                </h3>
                <p className="mt-5 font-display text-sm font-bold text-ink">
                  {venue.city}
                </p>
                <StarRow count={venue.stars} plumbId={`${venue.plumbId}-stars`} />
                <p className="mt-4 font-sans text-sm leading-[1.43] text-muted-ink">
                  {venue.description}
                </p>
                <Link
                  href={ROUTES.ABOUT_PRODUCT}
                  className="mt-8 inline-flex min-h-11 items-center font-sans text-xs uppercase underline underline-offset-4"
                >
                  Discover {venue.name}
                </Link>
              </div>
            </article>
          ))}
        </div>
      </div>
      <div className="mt-14 flex justify-center gap-4">
        <button
          type="button"
          onClick={() => api?.scrollPrev()}
          disabled={!canScroll[0]}
          aria-label="Previous restaurant"
          data-plumb-id="icon-button"
          className="inline-flex size-8 items-center justify-center rounded-[4px] disabled:opacity-30"
        >
          <ChevronLeft className="size-5" aria-hidden="true" />
        </button>
        <button
          type="button"
          onClick={() => api?.scrollNext()}
          disabled={!canScroll[1]}
          aria-label="Next restaurant"
          data-plumb-id="icon-button-2"
          className="inline-flex size-8 items-center justify-center rounded-[4px] disabled:opacity-30"
        >
          <ChevronRight className="size-5" aria-hidden="true" />
        </button>
      </div>
    </div>
  );
}
