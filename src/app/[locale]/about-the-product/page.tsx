import {
  AboutFaqSection,
  AboutHeroSection,
  AboutHistorySection,
  AboutCultivationSection,
  AboutUnderstandSection,
  AboutSelectionSection,
} from "@/screens/about-the-product";
import { setRequestLocale } from "next-intl/server";

export default async function AboutPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);

  return (
    <div className="flex flex-col w-full">
      <AboutHeroSection />
      <AboutHistorySection />
      <AboutCultivationSection />
      <AboutUnderstandSection />
      <AboutSelectionSection />
      <AboutFaqSection />
    </div>
  );
}
