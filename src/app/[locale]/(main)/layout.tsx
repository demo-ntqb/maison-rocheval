import { CartDrawer, CartProvider } from "@/shared/components/cart";
import { Footer } from "@/shared/components/layout/footer";
import { Header } from "@/shared/components/layout/header/header";
import { RegionPreferenceGate } from "@/shared/components/layout/region-preference-gate";
import { getDiscoveredMarkets } from "@/shared/lib/shopify/localization";
import { TooltipProvider } from "@/shared/components/ui/tooltip";
import { NextIntlClientProvider } from "next-intl";
import { getMessages } from "next-intl/server";
import { Suspense } from "react";

export default async function LocaleLayout({
  children,
  params,
}: Readonly<{
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}>) {
  const { locale } = await params;

  const messages = await getMessages();
  const { availableContexts, availableRouteLocales } = await getDiscoveredMarkets();

  return <>
    <a
      href="#main-content"
      className="sr-only z-100 rounded-brand bg-canvas px-4 py-3 text-ink focus:not-sr-only focus:fixed focus:left-4 focus:top-4"
    >
      Skip to content
    </a>
    {/* CartProvider wraps both blocks below — it's plain React context, not
        i18n, so it can sit above either NextIntlClientProvider and still let
        product pages (rendered via `children`, outside the `cart` messages
        scope) call useCart() to add lines and open the drawer. */}
    <CartProvider routeLocale={locale}>
      <TooltipProvider>
        <NextIntlClientProvider
          messages={{ cart: messages.cart, header: messages.header, regionDialog: messages.regionDialog }}
        >
          <Header availableRouteLocales={availableRouteLocales} />
          <CartDrawer />
          <Suspense fallback={null}>
            <RegionPreferenceGate availableContexts={availableContexts} />
          </Suspense>
        </NextIntlClientProvider>
        <NextIntlClientProvider messages={null}>
          <main id="main-content" className="w-full flex-1">
            {children}
          </main>
          <Footer locale={locale} />
        </NextIntlClientProvider>
      </TooltipProvider>
    </CartProvider>
  </>;
}
