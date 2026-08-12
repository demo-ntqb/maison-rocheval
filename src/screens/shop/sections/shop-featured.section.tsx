import { getTranslations } from "next-intl/server";

import { Link } from "@/i18n/navigation";
import { Picture } from "@/shared/components/ui/picture";

export async function ShopFeaturedSection() {
  const t = await getTranslations("shop.featured");
  return <section className="flex h-[900px] flex-col items-center text-center"><h2 className="font-display text-[32px]">{t("title")}</h2><p className="mt-5 max-w-[500px] font-sans text-sm text-muted-ink">{t("description")}</p><Link href="/about-the-product" className="mt-6 min-h-11 font-sans text-xs uppercase underline underline-offset-4">{t("link")}</Link><Picture basePath="/images/home/source-ritual-table" fallbackExtension="png" alt={t("imageAlt")} width={2000} height={1400} sizes="(max-width:1000px) 100vw, 1000px" pictureClassName="mt-8 block w-full max-w-[1000px]" className="aspect-[10/7] size-full object-cover" /></section>;
}
