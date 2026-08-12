import { getTranslations } from "next-intl/server";

import { Picture } from "@/shared/components/ui/picture";

export async function AboutHistorySection() {
  const t = await getTranslations("aboutProduct.history");

  return (
    <section data-plumb-id="frame-2085667065" aria-labelledby="sturgeon-journey-title" className="flex min-h-[1274px] flex-col items-center justify-center bg-canvas py-24 lg:py-[200px]">
      <div data-plumb-id="component-6" className="mx-auto flex w-full max-w-[1000px] flex-col items-center gap-[54px] px-6 md:px-0">
        <div className="max-w-[760px] text-center">
          <h2 data-plumb-id="lorem-ipsum-dolor-4" id="sturgeon-journey-title" className="font-display text-[32px] leading-none">{t("title")}</h2>
          <p className="mx-auto mt-6 max-w-[650px] font-sans text-sm leading-[1.43] text-muted-ink">{t("description")}</p>
        </div>
        <Picture basePath="/images/about-product/sturgeon-journey" fallbackExtension="jpg" alt={t("imageAlt")} width={2000} height={1400} sizes="(max-width: 1000px) 100vw, 1000px" pictureClassName="block w-full overflow-hidden" className="aspect-[10/7] size-full rounded-brand object-cover" data-plumb-id="rectangle-4878" />
      </div>
    </section>
  );
}
