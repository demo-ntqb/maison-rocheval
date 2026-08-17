import { ComingSoonHeroSection } from "@/screens/coming-soon";
import { Footer } from "@/shared/components/layout/footer";
import { Header } from "@/shared/components/layout/header";
import { NextIntlClientProvider } from "next-intl";
import { getMessages, setRequestLocale } from "next-intl/server";

export default async function LocaleLayout({
  children,
  params,
}: Readonly<{
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}>) {
  const { locale } = await params;

  setRequestLocale(locale);
  const messages = await getMessages();

  // TODO: remove this when we launch the website
  const isComingSoon = process.env.NEXT_PUBLIC_COMING_SOON === "true";
  if (isComingSoon) {
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
      className="sr-only z-[100] rounded-brand bg-canvas px-4 py-3 text-ink focus:not-sr-only focus:fixed focus:left-4 focus:top-4"
    >
      Skip to content
    </a>
    <NextIntlClientProvider messages={{ header: messages.header }}>
      <Header />
    </NextIntlClientProvider>
    <NextIntlClientProvider messages={null}>
      <main id="main-content" className="w-full flex-1">
        {children}
      </main>
      <Footer locale={locale} />
    </NextIntlClientProvider>
  </>;
}
