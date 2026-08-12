"use client";

import { useRef } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useTranslations } from "next-intl";

import { Link } from "@/i18n/navigation";
import { HOME_PRODUCTS } from "../constants/home.constant";
import { HomePicture } from "./home-picture";

export function HomeProductCarousel() {
  const t = useTranslations("home.products");
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  function scroll(direction: "left" | "right") {
    const container = scrollContainerRef.current;
    if (!container) return;

    container.scrollBy({
      behavior: "smooth",
      left: direction === "left" ? -316 : 316,
    });
  }

  return (
    <div className="relative flex w-full flex-col items-center" data-plumb-id="component-6-4">
      <button
        type="button"
        onClick={() => scroll("left")}
        className="absolute left-0 top-1/2 z-10 hidden size-12 -translate-y-1/2 items-center justify-center text-ink transition-opacity hover:opacity-60 focus-visible:outline-2 focus-visible:outline-offset-2 lg:flex"
        aria-label={t("previous")}
      >
        <ChevronLeft className="h-4 w-[11px]" strokeWidth={1.25} aria-hidden="true" data-plumb-id="vector-1308" />
      </button>

      <div
        ref={scrollContainerRef}
        className="flex w-full snap-x snap-mandatory gap-8 overflow-x-auto px-4 pb-2 [scrollbar-width:none] sm:px-6 lg:justify-center lg:overflow-visible lg:px-0 lg:pb-0 [&::-webkit-scrollbar]:hidden"
        data-plumb-id="frame-2085667045"
      >
        {HOME_PRODUCTS.map((product, index) => (
          <article
            key={product.id}
            className={`flex w-[284px] shrink-0 snap-center flex-col overflow-hidden rounded-brand border-0 border-line bg-canvas shadow-[inset_0_0_0_0.5px_var(--palette-gray-light)] ${index === 1 ? "h-[473px]" : "h-[488px]"}`}
            data-plumb-id={`component-${22 + index}`}
          >
            <Link
              href={`/products/${product.handle}`}
              className="flex h-[312px] items-end justify-center py-2 focus-visible:outline-2 focus-visible:outline-offset-[-2px]"
              aria-label={t(`cards.${product.id}.title`)}
              data-plumb-id={`frame-2085667163${index ? `-${index + 1}` : ""}`}
            >
              <HomePicture
                basePath={product.imagePath}
                fallbackExtension="png"
                alt={t(`cards.${product.id}.imageAlt`)}
                width={400}
                height={550}
                sizes="200px"
                pictureClassName="flex h-[275px] w-[200px] flex-col items-center"
                picturePlumbId={`frame-2085667138${index ? `-${index + 1}` : ""}`}
                className="h-[275px] w-[200px] object-contain"
                data-plumb-asset={product.imagePlumbId}
              />
            </Link>

            <div className={`flex flex-col gap-3 px-6 pb-8 pt-6 text-center ${index === 1 ? "h-[161px]" : "h-[176px]"}`} data-plumb-id={`frame-2085667164${index ? `-${index + 1}` : ""}`}>
              <div className="flex flex-col items-center gap-1" data-plumb-id={`frame-2085667136${index ? `-${index + 1}` : ""}`}>
                <h3 className="font-display text-xl font-bold leading-6 text-ink" data-plumb-id={`kaluga-caviar${index ? `-${index + 1}` : ""}`}>
                  {t(`cards.${product.id}.title`)}
                </h3>
                <p className="min-h-[15px] font-sans text-xs font-light leading-[15px] text-muted-ink" data-plumb-id={`huso-duricus${index ? `-${index + 1}` : ""}`}>
                  {t(`cards.${product.id}.species`)}
                </p>
              </div>
              <div className="h-0 w-full border-t-[0.5px] border-line" aria-hidden="true" data-plumb-id={`vector-1307${index ? `-${index + 1}` : ""}`} />
              <div className="flex flex-col gap-2 font-sans text-xs font-light leading-[15px] text-ink" data-plumb-id={`frame-2085667167${index ? `-${index + 1}` : ""}`}>
                <p data-plumb-id={`rich-creamy-long-finish${index ? `-${index + 1}` : ""}`}>{t(`cards.${product.id}.profile`)}</p>
                <p data-plumb-id={`lorem-ipsum-dolor-sit-amet-consectetur-a-${index + 6}`}>{t(`cards.${product.id}.description`)}</p>
              </div>
            </div>
          </article>
        ))}
      </div>

      <button
        type="button"
        onClick={() => scroll("right")}
        className="absolute right-0 top-1/2 z-10 hidden size-12 -translate-y-1/2 items-center justify-center text-ink transition-opacity hover:opacity-60 focus-visible:outline-2 focus-visible:outline-offset-2 lg:flex"
        aria-label={t("next")}
      >
        <ChevronRight className="h-4 w-[11px]" strokeWidth={1.25} aria-hidden="true" data-plumb-id="vector-1309" />
      </button>
    </div>
  );
}
