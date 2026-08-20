import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";

import { ContactHeroSection } from "@/screens/contact";
import { generateComingSoonMetadata, generatePageMetadata, isComingSoon } from "@/shared/lib/metadata";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  if (isComingSoon()) return generateComingSoonMetadata(locale);

  const t = await getTranslations({ locale, namespace: "metadata.contact" });

  return generatePageMetadata(locale, t("title"), t("description"), {
    canonical: "/contact",
  });
}

export default function ContactPage() {
  return (
    <div className="flex w-full flex-col bg-warm" data-screen="contact">
      <ContactHeroSection />
    </div>
  );
}
