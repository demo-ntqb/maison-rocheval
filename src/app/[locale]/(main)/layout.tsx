import { ComingSoonHeroSection } from "@/screens/coming-soon";
import { Footer } from "@/shared/components/layout/footer";
import { Header } from "@/shared/components/layout/header/header";
import { RegionPreferenceGate } from "@/shared/components/layout/region-preference-gate";
import { isComingSoon } from "@/shared/lib/metadata";
import { NextIntlClientProvider } from "next-intl";
import { getMessages } from "next-intl/server";

export default async function LocaleLayout({
  children,
  params,
}: Readonly<{
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}>) {
  const { locale } = await params;

  const messages = await getMessages();

  // TODO: remove this when we launch the website
  if (isComingSoon()) {
    return <main id="main-content" className="w-full flex-1">
      <NextIntlClientProvider messages={null}>
        <div className="flex w-full flex-col" data-screen="coming-soon">
          <ComingSoonHeroSection />
        </div>
      </NextIntlClientProvider>
    </main>
  }

  return <>
    <a
      href="#main-content"
      className="sr-only z-100 rounded-brand bg-canvas px-4 py-3 text-ink focus:not-sr-only focus:fixed focus:left-4 focus:top-4"
    >
      Skip to content
    </a>
    <NextIntlClientProvider messages={{ header: messages.header, regionDialog: messages.regionDialog }}>
      <Header />
      <RegionPreferenceGate />
    </NextIntlClientProvider>
    <NextIntlClientProvider messages={null}>
      <main id="main-content" className="w-full flex-1">
        {children}
      </main>
      <Footer locale={locale} />
    </NextIntlClientProvider>
  </>;
}
