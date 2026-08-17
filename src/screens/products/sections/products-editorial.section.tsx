import { getTranslations } from "next-intl/server";

import { Link } from "@/i18n/navigation";
import { Picture } from "@/shared/components/ui/picture";
import { ROUTES } from "@/shared/constants/route.constant";

export async function ProductsEditorialSection() {
  const t = await getTranslations("products.editorial");

  return (
    <section
      data-plumb-id="component-7-2"
      aria-labelledby="products-editorial-title"
      className="products-editorial-deferred flex w-full max-w-content flex-col items-center gap-[54px] px-4 text-center sm:px-6 lg:px-0"
    >
      <div className="flex w-full max-w-[500px] flex-col items-center gap-8">
        <div className="flex flex-col gap-4">
          <h2
            id="products-editorial-title"
            data-plumb-id="lorem-ipsum-dolor-2"
            className="font-display text-section-title leading-none text-ink"
          >
            {t("title")}
          </h2>
          <p
            data-plumb-id="lorem-ipsum-dolor-sit-amet-consectetur-a"
            className="min-h-[54px] font-sans text-sm leading-[18px] text-ink"
          >
            {t("description")}
          </p>
        </div>
        <Link
          href={ROUTES.ABOUT_PRODUCT}
          className="-my-3 inline-flex min-h-11 items-center font-sans text-sm leading-5 text-ink underline underline-offset-4 transition-opacity hover:opacity-60 focus-visible:outline-2 focus-visible:outline-offset-4"
        >
          {t("link")}
        </Link>
      </div>

      <Picture
        basePath="/images/home/source-ritual-table"
        fallbackExtension="png"
        alt={t("imageAlt")}
        width={2000}
        height={1400}
        sizes="(max-width: 1023px) calc(100vw - 32px), 1000px"
        responsiveWidths={[640, 1000]}
        pictureClassName="block aspect-[10/7] w-full overflow-hidden rounded-brand"
        className="size-full rounded-brand object-cover"
        data-plumb-id="rectangle-4878"
      />
    </section>
  );
}
