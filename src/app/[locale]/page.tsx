import { setRequestLocale } from "next-intl/server";
import {
  HomeHeroSection,
  HomeIntroSection,
  HomeAboutSection,
  HomeProductsSection,
  HomeFaqSection,
} from "@/screens/home";

export default async function Home({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);

  return (
    <div className="flex flex-col w-full">
      <HomeHeroSection />
      <HomeIntroSection />
      <HomeAboutSection />
      <HomeProductsSection />
      <HomeFaqSection />
    </div>
  );
}
