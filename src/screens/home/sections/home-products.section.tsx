import { getTranslations } from "next-intl/server";

import { Picture } from "@/shared/components/ui/picture";
import { Reveal } from "@/shared/components/ui/reveal";
import { SplitText } from "@/shared/components/ui/split-text";
import { HomeProductList } from "../components/home-product-list";

export async function HomeProductsSection({ locale }: { locale: string }) {
  const t = await getTranslations({ locale, namespace: "home.products" });

  // TODO: Đổ dữ liệu thật từ Shopify sau. Hiện tại lấy dữ liệu tĩnh từ translation files (home.products.cards)
  const rawCards = t.raw("cards") as Record<
    string,
    { eyebrow: string; title: string; species: string; profile: string; description: string; imageAlt: string }
  >;

  const products = Object.entries(rawCards).map(([key, card]) => ({
    id: key,
    handle: key,
    availableForSale: true,
    title: card.title,
    eyebrow: card.eyebrow,
    species: card.species,
    profile: card.profile,
    description: card.description,
    price: {
      amount: "0",
      currencyCode: "EUR",
    },
    image: {
      url: `/images/caviar/${key}.png`,
      altText: card.imageAlt,
      width: 600,
      height: 600,
    },
  }));

  return (
    <section
      aria-labelledby="home-products-title"
      className="flex w-full flex-col items-center bg-transparent py-[150px] lg:px-0 lg:py-[200px]"
      data-plumb-id="frame-2085667107"
    >
      <div className="flex w-full flex-col items-center gap-16" data-plumb-id="frame-2085667108">
        <div className="flex flex-col items-center gap-16 w-full">
          <Reveal>
            <Picture
              basePath="/images/home/presented-sturgeon-illustration"
              fallbackExtension="png"
              alt=""
              aria-hidden="true"
              width={232}
              height={100}
              sizes="(max-width: 1023px) 148px, 232px"
              pictureClassName="block w-[148px] h-[64px] lg:w-[232px] lg:h-[100px]"
              className="size-full object-contain"
              data-plumb-id="chatgpt-image-jul-30-2026-02-46-36-pm-1"
              data-plumb-asset="e5a9cdc2971cfe09bb809242295d1e936320d799"
            />
          </Reveal>

          <div className="flex max-w-[396px] lg:max-w-[640px] flex-col items-center gap-8 text-center px-4 lg:px-0" data-plumb-id="component-8">
            <div className="flex flex-col items-center gap-4" data-plumb-id="frame-2085667118-3">
              <div data-plumb-id="lorem-ipsum-dolor-9">
                <SplitText
                  as="h2"
                  id="home-products-title"
                  className="font-display text-[32px] leading-none text-ink"
                  data-plumb-id="lorem-ipsum-dolor-10"
                  by="words"
                  stagger={40}
                >
                  {t("title")}
                </SplitText>
              </div>
              <div className="flex flex-col items-center" data-plumb-id="frame-2085667119-3">
                <SplitText
                  as="p"
                  className="font-sans text-sm leading-[18px] text-ink whitespace-pre-line"
                  data-plumb-id="lorem-ipsum-dolor-sit-amet-consectetur-a-5"
                  by="words"
                  stagger={10}
                >
                  {t("description")}
                </SplitText>
              </div>
            </div>
            {/* <Reveal delay={120}>
              <TextButton asChild className="-my-3 min-h-11 inline-flex items-center">
                <Link
                  href={ROUTES.PRODUCTS}
                  data-plumb-id="text-button-5"
                >
                  {t("shopNow")}
                </Link>
              </TextButton>
            </Reveal> */}
          </div>
        </div>

        <Reveal className="w-full min-w-0 lg:w-auto" delay={120}>
          <HomeProductList products={products} />
        </Reveal>
      </div>
    </section>
  );
}
