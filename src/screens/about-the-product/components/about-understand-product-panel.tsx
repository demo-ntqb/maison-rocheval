import { Link } from "@/i18n/navigation";
import { Picture } from "@/shared/components/ui/picture";
import { ShopifyImage } from "@/shared/components/ui/shopify-image";
import { TabsContent } from "@/shared/components/ui/tabs";
import type { CatalogProductProfile } from "@/shared/lib/shopify/catalog-mapper";
import { displayName, tastingProfile } from "../lib/about-the-product.utils";
import type { AboutUnderstandProductPanelProps } from "../types/about-the-product.type";
import { AboutUnderstandProductFacts } from "./about-understand-product-facts";

function ProductVisualGrid({
  image,
  sturgeonAlt,
}: {
  image: CatalogProductProfile["image"];
  sturgeonAlt: string;
}) {
  return (
    <div
      data-plumb-id="frame-2085667151"
      className="grid w-full items-center overflow-hidden md:grid-cols-2"
    >
      <div
        data-plumb-id="frame-2085667163"
        className="flex aspect-square items-center justify-center bg-sand p-[10px]"
      >
        {image ? (
          <span className="flex h-[280px] w-[275px] items-center justify-center">
            <ShopifyImage
              image={image}
              sizes="(max-width: 767px) 100vw, 500px"
              responsiveWidths={[320, 500, 800]}
              className="h-[272px] w-[270px] object-contain"
            />
          </span>
        ) : null}
      </div>
      <Picture
        basePath="/images/about-product/product-sturgeon"
        fallbackExtension="png"
        alt={sturgeonAlt}
        width={1000}
        height={1000}
        sizes="(max-width: 767px) 100vw, 500px"
        pictureClassName="block aspect-square"
        className="size-full object-cover"
        data-plumb-id="image-43"
        data-plumb-asset="a647f61dfecaa558375d27cc4656976232562975"
      />
    </div>
  );
}

function ProductStoryHeader({ product }: { product: CatalogProductProfile }) {
  return (
    <div data-plumb-id="frame-2085667168" className="flex flex-col gap-2">
      <p
        data-plumb-id="rich-creamy-cheesy"
        className="font-sans text-sm leading-[18px] text-ink"
      >
        {tastingProfile(product)}
      </p>
      <h3
        data-plumb-id="lorem-ipsum-dolor-4"
        className="font-display text-[32px] font-medium leading-none text-ink"
      >
        {displayName(product.title)}
      </h3>
      <p
        data-plumb-id="acipenser-schrenckii"
        className="font-sans text-sm leading-[18px] text-muted-ink"
      >
        {product.species}
      </p>
    </div>
  );
}

function ProductStoryBody({
  atTable,
  product,
}: {
  atTable: string;
  product: CatalogProductProfile;
}) {
  return (
    <div
      data-plumb-id="amour-opens-with-cream-then-butter-follo"
      className="flex flex-col gap-4 font-sans text-sm leading-5 text-ink"
    >
      <p>{product.description}</p>
      <p>{product.speciesDescription}</p>
      <p>
        <strong className="font-bold">{atTable}</strong>
        <br />
        {product.serving}
      </p>
    </div>
  );
}

function ProductStory({
  atTable,
  buyNow,
  product,
}: {
  atTable: string;
  buyNow: string;
  product: CatalogProductProfile;
}) {
  return (
    <div
      data-plumb-id="frame-2085667152"
      className="flex min-h-[450px] flex-col items-center justify-center p-6 lg:p-8"
    >
      <div
        data-plumb-id="component-7-2"
        className="flex w-full flex-col justify-center gap-8"
      >
        <div data-plumb-id="frame-2085667121" className="flex flex-col gap-4">
          <ProductStoryHeader product={product} />
          <ProductStoryBody atTable={atTable} product={product} />
        </div>

        <Link
          href={`/products/${product.handle}`}
          className="inline-flex min-h-11 w-fit items-center font-sans text-sm leading-5 text-ink underline underline-offset-4 transition-opacity hover:opacity-60 focus-visible:outline-2 focus-visible:outline-offset-4"
        >
          <span data-plumb-id="text-button-4" className="underline underline-offset-4">
            {buyNow}
          </span>
        </Link>
      </div>
    </div>
  );
}

export function AboutUnderstandProductPanel({
  labels,
  product,
}: AboutUnderstandProductPanelProps) {
  return (
    <TabsContent
      value={product.handle}
      data-plumb-id="frame-2085667154"
      className="m-0 flex w-full flex-col gap-8 outline-none"
    >
      <ProductVisualGrid image={product.image} sturgeonAlt={labels.sturgeonAlt} />
      <div
        data-plumb-id="frame-2085667153"
        className="grid w-full items-center justify-center md:grid-cols-2"
      >
        <ProductStory
          atTable={labels.atTable}
          buyNow={labels.buyNow}
          product={product}
        />
        <AboutUnderstandProductFacts labels={labels.facts} product={product} />
      </div>
    </TabsContent>
  );
}
