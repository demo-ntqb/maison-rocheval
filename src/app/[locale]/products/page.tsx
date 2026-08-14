import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";

import {
  ProductsCatalogSection,
  ProductsEditorialSection,
  ProductsFaqSection,
  ProductsHeroSection,
} from "@/screens/products";
import { generatePageMetadata } from "@/shared/lib/metadata";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "metadata.products" });

  return generatePageMetadata(locale, t("title"), t("description"), {
    canonical: "/products",
  });
}

export default async function ProductsPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);

  return (
    <div className="flex w-full flex-col bg-canvas">
      <ProductsHeroSection />
      <div
        data-plumb-id="frame-2085667045"
        className="flex w-full flex-col items-center gap-24 pb-24 pt-16 lg:justify-center lg:gap-[115px] lg:pb-[200px] lg:pt-[100px]"
      >
        <div
          data-plumb-id="frame-2085667111"
          className="flex w-full max-w-content flex-col items-center gap-24 lg:gap-[200px]"
        >
          <ProductsCatalogSection locale={locale} />
          <ProductsEditorialSection />
          <ProductsFaqSection />
        </div>
      </div>
    </div>
  );
}
