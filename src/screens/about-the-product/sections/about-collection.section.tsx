import { getTranslations } from "next-intl/server";
import { Suspense } from "react";

import { Link } from "@/i18n/navigation";
import { Picture } from "@/shared/components/ui/picture";
import { Reveal } from "@/shared/components/ui/reveal";
import { SplitText } from "@/shared/components/ui/split-text";
import { TextButton } from "@/shared/components/ui/text-button";
import { ROUTES } from "@/shared/constants/route.constant";
import { AboutCollectionCarousel } from "../components/about-collection-carousel";
import {
  COLLECTION_CAVIARS,
  COLLECTION_IMAGES,
} from "../constants/about-the-product.constant";
import type { CollectionCaviarContent } from "../types/about-the-product.type";

export async function AboutCollectionSection() {
  const t = await getTranslations("aboutProduct.collection");

  const caviars: CollectionCaviarContent[] = COLLECTION_CAVIARS.map((caviar) => ({
    ...caviar,
    name: t(`products.${caviar.id}.name`),
    latinName: t(`products.${caviar.id}.latinName`),
    note: t(`products.${caviar.id}.note`),
    tastingNotes: t(`products.${caviar.id}.tastingNotes`),
    description: t(`products.${caviar.id}.description`),
    descriptionSecondary: t(`products.${caviar.id}.descriptionSecondary`),
    atTable: t(`products.${caviar.id}.atTable`),
    tinAlt: t(`products.${caviar.id}.tinAlt`),
    dishAlt: t(`products.${caviar.id}.dishAlt`),
  }));

  return (
    <section

      data-slot="about-product-collection"
      data-node-id="409:18452"
      aria-labelledby="about-product-collection-title"
      className="w-full bg-canvas py-[200px]"
    >
      <div className="mx-auto flex w-full max-w-content flex-col items-center gap-[54px] px-4 lg:px-0">
        <div className="flex w-full flex-col items-center gap-[54px]" data-node-id="409:18453">
          <Reveal>
            <Picture
              basePath={COLLECTION_IMAGES.tin}
              fallbackExtension="png"
              alt={t("tinAlt")}
              width={296}
              height={180}
              sizes="148px"
              pictureClassName="block h-[90px] w-[148px]"
              className="block size-full object-contain"
            />
          </Reveal>
          <div className="flex w-full max-w-[640px] flex-col items-center gap-8 px-8 text-center lg:px-0">
            <div className="flex flex-col items-center gap-4">
              <SplitText
                as="h2"
                id="about-product-collection-title"
                className="font-display text-[32px] leading-none text-ink h-8"
                by="words"
                stagger={40}
              >
                {t("title")}
              </SplitText>
              <SplitText
                as="p"
                className="font-sans text-sm leading-5 text-ink"
                by="words"
                stagger={10}
              >
                {t("description")}
              </SplitText>
            </div>
            <Reveal delay={120}>
              <TextButton asChild className="inline-flex min-h-11 items-center">
                <Link
                  href={ROUTES.PRODUCTS}
                  data-plumb-id="text-button"
                >
                  {t("shop")}
                </Link>
              </TextButton>
            </Reveal>
          </div>
        </div>

        <Suspense fallback={null}>
          <AboutCollectionCarousel
            caviars={caviars}
            labels={{
              atTable: t("atTable"),
              next: t("next"),
              previous: t("previous"),
              selectorLabel: t("selectorLabel"),
            }}
          />
        </Suspense>
      </div>
    </section>
  );
}
