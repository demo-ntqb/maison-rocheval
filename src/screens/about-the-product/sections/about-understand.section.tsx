import { getTranslations } from "next-intl/server";

import { Link } from "@/i18n/navigation";
import { Picture } from "@/shared/components/ui/picture";
import { getCollectionProductProfiles } from "@/shared/lib/shopify/catalog";
import { AboutUnderstandProductTabs } from "../components/about-understand-product-tabs";

export async function AboutUnderstandSection({ locale }: { locale: string }) {
  const [products, t] = await Promise.all([
    getCollectionProductProfiles(locale, "our-caviar", 5),
    getTranslations({ locale, namespace: "aboutProduct.understand" }),
  ]);

  return (
    <section
      data-slot="about-product-understand"
      aria-labelledby="understand-product-title"
      className="flex min-h-[2015px] items-center justify-center bg-canvas px-[10px] py-24 lg:py-[200px]"
    >
      <div
        data-plumb-id="frame-2085667094"
        className="mx-auto flex w-full max-w-[1000px] flex-col items-center gap-[54px] px-6 md:px-0"
      >
        <div
          data-plumb-id="frame-2085667141"
          className="mx-auto flex w-full max-w-[500px] flex-col items-center gap-[54px] text-center"
        >
          <Picture
            basePath="/images/about-brand/faq-caviar-tin"
            fallbackExtension="png"
            alt=""
            aria-hidden="true"
            width={262}
            height={160}
            sizes="148px"
            pictureClassName="block h-[90px] w-[148px]"
            className="size-full object-contain"
            data-plumb-id="chatgpt-image-jul-30-2026-02-51-23-pm-1"
            data-plumb-asset="f732404e70437716f159cad01b617b4ff1721e02"
          />
          <div data-plumb-id="component-7" className="flex w-full flex-col items-center gap-8">
            <div data-plumb-id="frame-2085667118" className="flex w-full flex-col items-center gap-4">
              <h2
                data-plumb-id="lorem-ipsum-dolor-2"
                id="understand-product-title"
                className="font-display text-[32px] leading-none text-ink"
              >
                {t("title")}
              </h2>
              <p
                data-plumb-id="lorem-ipsum-dolor-sit-amet-consectetur-a"
                className="font-sans text-sm leading-[1.43] text-ink"
              >
                {t("description")}
              </p>
            </div>
            <Link
              href="/products"
              className="-my-1.5 inline-flex min-h-11 items-center font-sans text-sm leading-5 text-ink underline underline-offset-4 transition-opacity hover:opacity-60 focus-visible:outline-2 focus-visible:outline-offset-4"
            >
              <span data-plumb-id="text-button-2" className="underline underline-offset-4">
                {t("select")}
              </span>
            </Link>
          </div>
        </div>

        <AboutUnderstandProductTabs
          products={products}
          labels={{
            atTable: t("atTable"),
            buyNow: t("buyNow"),
            facts: {
              color: t("facts.color"),
              commonName: t("facts.commonName"),
              pearlSize: t("facts.pearlSize"),
              salt: t("facts.salt"),
              species: t("facts.species"),
              tastingNotes: t("facts.tastingNotes"),
            },
            selectorLabel: t("selectorLabel"),
            sturgeonAlt: t("sturgeonAlt"),
          }}
        />
      </div>
    </section>
  );
}
