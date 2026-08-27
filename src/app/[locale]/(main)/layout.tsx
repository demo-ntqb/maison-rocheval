import { CartDrawer, CartProvider } from "@/shared/components/cart";
import { Footer } from "@/shared/components/layout/footer";
import { Header } from "@/shared/components/layout/header/header";
import { RegionPreferenceGate } from "@/shared/components/layout/region-preference-gate";
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
    <CartProvider>
      <NextIntlClientProvider
        messages={{ cart: messages.cart, header: messages.header, regionDialog: messages.regionDialog }}
      >
        <Header />
        <CartDrawer />
        <Suspense fallback={null}>
          <RegionPreferenceGate />
        </Suspense>
      </NextIntlClientProvider>
      <NextIntlClientProvider messages={null}>
        <main id="main-content" className="w-full flex-1">
          {children}
        </main>
        <Footer locale={locale} />
      </NextIntlClientProvider>
    </CartProvider>
  </>;
}
