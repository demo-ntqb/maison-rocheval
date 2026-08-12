import { getTranslations } from "next-intl/server";

import { Link } from "@/i18n/navigation";
import { Picture } from "@/shared/components/ui/picture";

export async function ProductDetailAssistanceSection() {
  const t = await getTranslations("productDetail.assistance");

  return (
    <section className="flex w-full max-w-[1000px] flex-col items-center px-6 text-center lg:px-0">
      <div className="flex max-w-[520px] flex-col items-center">
        <h2 className="font-display text-3xl font-normal text-black sm:text-[32px]">
          {t("title")}
        </h2>
        <p className="mt-4 font-sans text-sm leading-relaxed text-muted-ink">
          {t("description")}
        </p>
        <Link
          href="/about-the-brand"
          className="mt-6 inline-flex min-h-11 items-center font-sans text-xs uppercase tracking-widest text-black underline underline-offset-4 transition-opacity hover:opacity-70"
        >
          {t("cta")}
        </Link>
      </div>

      <div className="mt-10 aspect-[10/7] w-full overflow-hidden rounded-sm">
        <Picture
          basePath="/images/about-product/sturgeon-journey"
          fallbackExtension="jpg"
          alt={t("imageAlt")}
          width={2000}
          height={1400}
          sizes="(max-width: 1000px) 100vw, 1000px"
          pictureClassName="block size-full"
          className="size-full object-cover"
        />
      </div>
    </section>
  );
}
