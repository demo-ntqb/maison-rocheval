import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { hasLocale } from "next-intl";
import { NextIntlClientProvider } from "next-intl";
import { getMessages, getTranslations, setRequestLocale } from "next-intl/server";
import { Space_Grotesk } from "next/font/google";
import localFont from "next/font/local";
import { Header, Footer } from "@/shared/components/layout";
import { generateRootMetadata } from "@/shared/lib/metadata";
import { routing } from "@/i18n/routing";
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
      className={`${optima.variable} ${spaceGrotesk.variable} h-full antialiased`}
    >
      <head>
        <meta name="theme-color" content="#16222e" />
      </head>
      <body className="min-h-full flex flex-col font-sans overflow-x-hidden">
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
          <main id="main-content" className="flex-1">{children}</main>
          <Footer />
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
