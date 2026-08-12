import { setRequestLocale } from "next-intl/server";

import {
  ProductDetailAssistanceSection,
  ProductDetailHeroSection,
  ProductDetailRelatedSection,
} from "@/screens/product-detail";

const productHandles = [
  "caviar-amur",
  "caviar-kaluga",
  "caviar-russian-hybrid",
  "amour",
  "expression",
  "harmonie",
] as const;

export function generateStaticParams() {
  return productHandles.map((handle) => ({ handle }));
}

export default async function ProductPage({
  params,
}: {
  params: Promise<{ locale: string; handle: string }>;
}) {
  const { locale, handle } = await params;
  setRequestLocale(locale);

  return (
    <main className="flex flex-col items-center gap-[120px] pb-[120px] pt-12 sm:gap-[160px] sm:pb-[160px] sm:pt-16 lg:gap-[200px] lg:pb-[200px] lg:pt-[100px]">
      <ProductDetailHeroSection handle={handle} />
      <ProductDetailAssistanceSection />
      <ProductDetailRelatedSection currentHandle={handle} />
    </main>
  );
}
