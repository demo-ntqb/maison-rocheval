import { routing } from "@/i18n/routing";
import { Footer } from "@/shared/components/layout/footer";
import { Header } from "@/shared/components/layout/header";
import { ShopifyResourceHints } from "@/shared/components/layout/shopify-resource-hints";
import { generateRootMetadata } from "@/shared/lib/metadata";
import type { Metadata } from "next";
import { hasLocale, NextIntlClientProvider } from "next-intl";
import { getMessages, getTranslations, setRequestLocale } from "next-intl/server";
import { Space_Grotesk } from "next/font/google";
import localFont from "next/font/local";
import { notFound } from "next/navigation";
import "../globals.css";

const optima = localFont({
  src: [
    {
      path: "../../../public/fonts/OPTIMA.woff",
      weight: "400",
      style: "normal",
    },
    {
      path: "../../../public/fonts/Optima_Italic.woff",
      weight: "400",
      style: "italic",
    },
    {
      path: "../../../public/fonts/Optima Medium.woff",
      weight: "500",
      style: "normal",
    },
    {
      path: "../../../public/fonts/OPTIMA_B.woff",
      weight: "700",
      style: "normal",
    },
  ],
  variable: "--font-display",
  display: "swap",
  preload: false,
});

const spaceGrotesk = Space_Grotesk({
  variable: "--font-sans",
  subsets: ["latin"],
  weight: ["300", "400", "500", "700"],
  display: "swap",
});

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "metadata.root" });
  return generateRootMetadata(locale, t("title"), t("description"));
}

export default async function LocaleLayout({
  children,
  params,
}: Readonly<{
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}>) {
  const { locale } = await params;

  if (!hasLocale(routing.locales, locale)) {
    notFound();
  }

  setRequestLocale(locale);
  const messages = await getMessages();

  return (
    <html
      lang={locale}
      data-scroll-behavior="smooth"
      className={`${optima.variable} ${spaceGrotesk.variable} h-full antialiased`}
    >
      <head>
        <meta name="theme-color" content="#16222e" />
        <ShopifyResourceHints />
      </head>
      <body
        data-plumb-id="shop"
        className="flex min-h-full flex-col items-center overflow-x-hidden bg-canvas font-sans"
      >
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
          <main id="main-content" className="w-full flex-1">{children}</main>
          <Footer />
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
