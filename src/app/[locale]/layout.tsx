import { HeadAnalytics } from "@/app/(head)/analytics";
import { routing } from "@/i18n/routing";
import { ShopifyResourceHints } from "@/shared/components/layout/shopify-resource-hints";
import { generateOrganizationJsonLd, generateRootMetadata, isComingSoon } from "@/shared/lib/metadata";
import { Analytics } from "@vercel/analytics/next";
import type { Metadata } from "next";
import { hasLocale } from "next-intl";
import { getTranslations } from "next-intl/server";
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
  const namespace = isComingSoon() ? "metadata.comingSoon" : "metadata.root";
  const t = await getTranslations({ locale, namespace });
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
  // TODO: Tạm ẩn fr
  if (locale === "fr") {
    return notFound();
  }

  if (!hasLocale(routing.locales, locale)) {
    notFound();
  }

  return (
    <html
      lang={locale}
      data-scroll-behavior="smooth"
      className={`${optima.variable} ${spaceGrotesk.variable} h-full antialiased`}
      suppressHydrationWarning
    >
      <head>
        <meta name="theme-color" content="#16222e" />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: generateOrganizationJsonLd() }}
        />
        <ShopifyResourceHints />
        <HeadAnalytics />
      </head>
      <body
        data-plumb-id="shop"
        className="flex min-h-full flex-col items-center bg-canvas font-sans"
      >
        {children}
        <Analytics />
      </body>
    </html>
  );
}
