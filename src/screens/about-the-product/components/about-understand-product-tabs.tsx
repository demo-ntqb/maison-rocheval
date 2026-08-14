"use client";

import { ShopifyImage } from "@/shared/components/ui/shopify-image";
import {
  Tabs,
  TabsList,
  TabsTrigger,
} from "@/shared/components/ui/tabs";
import type { CatalogProductProfile } from "@/shared/lib/shopify/catalog-mapper";
import { displayName, flavourCharacter } from "../lib/about-the-product.utils";
import type {
  AboutUnderstandLabels,
  AboutUnderstandProductTabsProps,
} from "../types/about-the-product.type";
import { AboutUnderstandProductPanel } from "./about-understand-product-panel";

export type { AboutUnderstandLabels };

function ProductTabThumb({ image }: { image: CatalogProductProfile["image"] }) {
  if (!image) return null;
  return (
    <span
      className="flex h-[82px] w-20 items-center justify-center"
      aria-hidden="true"
    >
      <ShopifyImage
        image={image}
        sizes="80px"
        responsiveWidths={[80, 160]}
        className="h-[79px] w-20 object-contain"
        aria-hidden="true"
      />
    </span>
  );
}

function ProductTabLabel({ flavour, name }: { flavour: string; name: string }) {
  return (
    <span className="flex w-full flex-col items-center gap-1 text-center">
      <span className="font-sans text-xs font-normal leading-[15px]">{flavour}</span>
      <span className="font-display text-sm font-bold leading-[17px]">{name}</span>
    </span>
  );
}

function ProductTabTrigger({
  isFirst,
  product,
}: {
  isFirst: boolean;
  product: CatalogProductProfile;
}) {
  const name = displayName(product.title);

  return (
    <TabsTrigger
      value={product.handle}
      data-plumb-id={isFirst ? "component-29" : undefined}
      aria-label={name}
      className="group h-[209px] w-[150px] flex-none flex-col justify-start gap-3 rounded-brand border-[0.5px] border-line bg-canvas px-3 py-6 text-ink! shadow-none hover:text-ink data-[state=active]:bg-warm data-[state=active]:text-ink data-[state=active]:shadow-none"
    >
      <ProductTabThumb image={product.image} />
      <ProductTabLabel flavour={flavourCharacter(product)} name={name} />
    </TabsTrigger>
  );
}

export function AboutUnderstandProductTabs({
  labels,
  products,
}: AboutUnderstandProductTabsProps) {
  const firstProduct = products[0];
  if (!firstProduct) return null;

  return (
    <Tabs
      defaultValue={firstProduct.handle}
      className="w-full flex-col items-center gap-[54px]"
      activationMode="automatic"
    >
      <TabsList
        data-plumb-id="frame-2085667155"
        aria-label={labels.selectorLabel}
        className="flex h-auto w-full max-w-[814px] justify-start gap-4 overflow-x-auto rounded-none bg-transparent p-0 text-ink lg:justify-center"
      >
        {products.map((product, index) => (
          <ProductTabTrigger
            key={product.id}
            isFirst={index === 0}
            product={product}
          />
        ))}
      </TabsList>

      {products.map((product) => (
        <AboutUnderstandProductPanel
          key={product.id}
          labels={labels}
          product={product}
        />
      ))}
    </Tabs>
  );
}
