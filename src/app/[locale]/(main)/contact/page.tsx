import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";

import { ContactHeroSection } from "@/screens/contact";
import { ROUTES } from "@/shared/constants/route.constant";
import { generatePageMetadata } from "@/shared/lib/metadata";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;

  const t = await getTranslations({ locale, namespace: "metadata.contact" });

  return await generatePageMetadata(locale, t("title"), t("description"), {
    canonical: ROUTES.CONTACT,
  });
}

export default function ContactPage() {
  return (
    <div className="flex w-full flex-col bg-white" data-screen="contact">
      <ContactHeroSection />
    </div>
  );
}
