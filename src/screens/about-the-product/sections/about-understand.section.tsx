import { getTranslations } from "next-intl/server";

import { Link } from "@/i18n/navigation";
import { Picture } from "@/shared/components/ui/picture";

const species = ["kaluga", "russian", "hybrid", "amur", "baerii"] as const;
const speciesImages = ["species-kaluga-hybrid", "species-russian-sturgeon", "species-amur", "species-amur", "species-russian-sturgeon"] as const;

export async function AboutUnderstandSection() {
  const t = await getTranslations("aboutProduct.understand");

  return (
    <section data-plumb-id="frame-2085667094" aria-labelledby="understand-product-title" className="flex min-h-[2015px] items-center justify-center bg-canvas px-[10px] py-24 lg:py-[200px]">
      <div className="mx-auto w-full max-w-[1000px] px-6 md:px-0">
        <div className="mx-auto max-w-[700px] text-center">
          <Picture basePath="/images/about-brand/faq-caviar-tin" fallbackExtension="png" alt="" aria-hidden="true" width={262} height={160} sizes="100px" pictureClassName="mx-auto block h-20 w-[131px]" className="size-full object-contain" />
          <h2 data-plumb-id="lorem-ipsum-dolor-14" id="understand-product-title" className="mt-8 font-display text-[32px] leading-none">{t("title")}</h2>
          <p className="mx-auto mt-6 max-w-[560px] font-sans text-sm leading-[1.43] text-muted-ink">{t("description")}</p>
          <Link href="/products" className="mt-7 inline-flex min-h-11 items-center font-sans text-xs uppercase tracking-[0.12em] underline underline-offset-4">{t("select")}</Link>
        </div>

        <div className="mt-14 grid grid-cols-2 gap-3 sm:grid-cols-5">
          {species.map((item, index) => (
            <article key={item} className="border border-line p-3 text-center">
              <Picture basePath={`/images/about-product/${speciesImages[index]}`} fallbackExtension="png" alt={t(`${item}.imageAlt`)} width={600} height={600} sizes="180px" pictureClassName="block aspect-square w-full" className="size-full object-contain" />
              <h3 className="mt-2 font-display text-sm font-bold">{t(`${item}.name`)}</h3>
            </article>
          ))}
        </div>

        <div className="mt-14 grid overflow-hidden bg-warm md:grid-cols-2">
          <Picture basePath="/images/about-product/species-kaluga-hybrid" fallbackExtension="png" alt={t("featuredTinAlt")} width={600} height={600} sizes="(max-width: 767px) 100vw, 500px" pictureClassName="block aspect-square" className="size-full object-contain p-16" />
          <Picture basePath="/images/about-product/product-sturgeon" fallbackExtension="png" alt={t("featuredSturgeonAlt")} width={1000} height={1400} sizes="(max-width: 767px) 100vw, 500px" pictureClassName="block aspect-square" className="size-full object-cover" />
        </div>

        <div className="mt-12 grid gap-10 md:grid-cols-2">
          <div><h3 className="font-display text-[32px] leading-none">{t("featuredTitle")}</h3><p className="mt-6 font-sans text-sm leading-[1.43] text-muted-ink">{t("featuredDescription")}</p></div>
          <dl className="divide-y divide-line border-t border-line font-sans text-sm">
            {(["species", "grain", "colour", "taste"] as const).map((key) => <div key={key} className="flex justify-between gap-4 py-4"><dt className="font-bold uppercase">{t(`facts.${key}.label`)}</dt><dd>{t(`facts.${key}.value`)}</dd></div>)}
          </dl>
        </div>
      </div>
    </section>
  );
}
