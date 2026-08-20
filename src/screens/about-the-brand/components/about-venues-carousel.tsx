"use client";

import Autoplay from "embla-carousel-autoplay";
import useEmblaCarousel from "embla-carousel-react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useCallback, useEffect, useState } from "react";

import { MichelinRating } from "@/shared/components/ui/michelin-rating";
import { Picture } from "@/shared/components/ui/picture";

type Venue = {
  alt: string;
  assetId: string;
  city: string;
  description: string;
  imageBasePath: string;
  name: string;
  plumbId: string;
  stars: number;
  url: string;
};

export function AboutVenuesCarousel({ venues }: { venues: Venue[] }) {
  const [ref, api] = useEmblaCarousel(
    {
      align: "center",
      containScroll: "trimSnaps",
      dragFree: true,
      loop: false,
    },
    [
      Autoplay({
        delay: 3000,
        stopOnInteraction: false,
        stopOnMouseEnter: true,
      }),
    ]
  );
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
              <Picture
                basePath={venue.imageBasePath}
                fallbackExtension="jpg"
                alt={venue.alt}
                loading="lazy"
                responsiveWidths={[500, 1000]}
                sizes="(max-width: 767px) 86vw, 500px"
                width={500}
                height={700}
                className="aspect-7/10 md:aspect-5/7 w-full rounded-[2px] object-cover"
                data-plumb-asset={venue.assetId}
              />
              <div className="p-8 flex flex-col gap-6">
                <MichelinRating
                  count={venue.stars}
                  data-plumb-id={`${venue.plumbId}-stars`}
                  aria-label={`${venue.stars} Michelin ${venue.stars === 1 ? "star" : "stars"}`}
                  className="gap-3"
                  starClassName="size-6 text-black"
                />
                <div className="flex flex-col gap-8">
                  <div className="flex flex-col gap-4">
                    <h3 className="font-display text-2xl leading-[1.33] text-ink">
                      {venue.name}
                    </h3>
                    <div className="flex flex-col gap-3">
                      <p className="font-display text-base font-bold text-ink">
                        {venue.city}
                      </p>
                      <p className="font-sans text-sm leading-[1.43] text-muted-ink">
                        {venue.description}
                      </p>
                    </div>
                  </div>
                  <div>
                    <a
                      href={venue.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex min-h-11 items-center font-sans text-sm uppercase underline underline-offset-4 text-ink hover:opacity-80 transition-opacity"
                    >
                      Discover {venue.name.split(" | ")[0]}
                    </a>
                  </div>
                </div>
              </div>
            </article>
          ))}
        </div>
      </div>
      <div className="mt-13 flex justify-center gap-4">
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
