import { RichText } from "@shopify/hydrogen-react";

import { Link } from "@/i18n/navigation";
import { Picture } from "@/shared/components/ui/picture";
import { ShopifyImage } from "@/shared/components/ui/shopify-image";
import { ROUTES } from "@/shared/constants/route.constant";
import { TabsContent } from "@/shared/components/ui/tabs";
import type { CatalogProductProfile } from "@/shared/lib/shopify/catalog-mapper";
import { displayName, tastingProfile } from "../lib/about-the-product.utils";
import type { AboutUnderstandProductPanelProps } from "../types/about-the-product.type";
import { AboutUnderstandProductFacts } from "./about-understand-product-facts";

function isRichTextAst(data?: string): boolean {
  if (!data) return false;
  try {
    const parsed: unknown = JSON.parse(data);
    return Boolean(
      parsed &&
      typeof parsed === "object" &&
      "type" in parsed &&
      parsed.type === "root" &&
      "children" in parsed &&
      Array.isArray(parsed.children),
    );
  } catch {
    return false;
  }
}

function ProductVisualGrid({
  image,
  speciesImage,
  sturgeonAlt,
}: {
  image: CatalogProductProfile["image"];
  speciesImage: CatalogProductProfile["speciesImage"];
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
      {speciesImage ? (
        <ShopifyImage
          image={speciesImage}
          sizes="(max-width: 767px) 100vw, 500px"
          responsiveWidths={[320, 500, 800, 1000]}
          className="size-full aspect-square object-cover"
          data-plumb-id="image-43"
          data-plumb-asset="a647f61dfecaa558375d27cc4656976232562975"
        />
      ) : (
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
      )}
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

function ProductStoryBody({ product }: { product: CatalogProductProfile }) {
  if (!product.speciesDescription) return null;

  if (isRichTextAst(product.speciesDescription)) {
    return (
      <RichText
        data={product.speciesDescription}
        as="div"
        data-plumb-id="amour-opens-with-cream-then-butter-follo"
        className="flex flex-col gap-4 font-sans text-sm leading-relaxed text-ink"
        components={{
          root: ({ node }) => <>{node.children}</>,
          link: ({ node }) => (
            <Link
              href={node.url}
              className="text-palette-accent underline transition-opacity hover:opacity-80"
            >
              {node.children}
            </Link>
          ),
          list: ({ node }) => <ul className="my-1 list-disc space-y-1 pl-4 leading-relaxed">{node.children}</ul>,
          listItem: ({ node }) => <li className="leading-relaxed">{node.children}</li>,
          paragraph: ({ node }) => <p className="leading-relaxed leading-none">{node.children}</p>,
          heading: ({ node }) => (
            <p className="leading-relaxed">
              <strong className="font-bold">{node.children}</strong>
            </p>
          ),
          text: ({ node }) => {
            let content: React.ReactNode = node.value;
            if (node.bold) content = <strong className="font-bold">{content}</strong>;
            if (node.italic) content = <em className="italic">{content}</em>;
            return content;
          },
        }}
      />
    );
  }

  const paragraphs =
    typeof product.speciesDescription === "string"
      ? product.speciesDescription.split(/\n\n+/u).filter(Boolean)
      : [];

  return (
    <div
      data-plumb-id="amour-opens-with-cream-then-butter-follo"
      className="flex flex-col gap-4 font-sans text-sm leading-relaxed text-ink"
    >
      {paragraphs.map((paragraph, index) => (
        <p key={index} className="leading-relaxed">
          {paragraph}
        </p>
      ))}
    </div>
  );
}

function ProductStory({
  buyNow,
  product,
}: {
  buyNow: string;
  product: CatalogProductProfile;
}) {
  return (
    <div
      data-plumb-id="frame-2085667152"
      className="flex flex-col p-6 lg:p-8"
    >
      <div
        data-plumb-id="component-7-2"
        className="flex w-full flex-col justify-center gap-8"
      >
        <div data-plumb-id="frame-2085667121" className="flex flex-col gap-4">
          <ProductStoryHeader product={product} />
          <ProductStoryBody product={product} />
        </div>

        <Link
          href={ROUTES.PRODUCT_DETAIL(product.handle)}
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
      <ProductVisualGrid
        image={product.image}
        speciesImage={product.speciesImage}
        sturgeonAlt={labels.sturgeonAlt}
      />
      <div
        data-plumb-id="frame-2085667153"
        className="grid w-full md:grid-cols-2"
      >
        <ProductStory
          buyNow={labels.buyNow}
          product={product}
        />
        <AboutUnderstandProductFacts labels={labels.facts} product={product} />
      </div>
    </TabsContent>
  );
}
