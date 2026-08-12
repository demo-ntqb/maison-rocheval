import {
  ShopFaqSection,
  ShopFeaturedSection,
  ShopHeroSection,
  ShopProductsSection,
} from "@/screens/shop";
import { setRequestLocale } from "next-intl/server";

export default async function ProductsPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);

  return (
    <div className="flex flex-col w-full bg-white">
      <ShopHeroSection />
      <div data-plumb-id="frame-2085667045" className="flex h-[3646px] flex-col items-center gap-[200px] pb-[200px] pt-[100px]">
        <ShopProductsSection />
        <ShopFeaturedSection />
        <ShopFaqSection />
      </div>
    </div>
  );
}
