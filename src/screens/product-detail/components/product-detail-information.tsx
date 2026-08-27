"use client";

import { useTranslations } from "next-intl";

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/shared/components/ui/accordion";
import type { CatalogProductDetail } from "@/shared/types/catalog.type";
import { SpecRichText } from "./product-detail-spec-content";

/**
 * Figma keeps every row flush and quiet: a 20px rule, sans caps label and a
 * hairline plus. The `ui/accordion` primitive ships a much louder editorial
 * default, so the whole look is applied here at the call site.
 */
const TRIGGER_CLASS =
  "min-h-16 items-center border-b-[0.5px] border-stone py-5 font-sans text-sm font-normal leading-normal uppercase text-black **:data-[slot=accordion-trigger-icon]:mt-0 **:data-[slot=accordion-trigger-icon]:size-4.5 **:data-[slot=accordion-trigger-icon]:text-gray-icon";

const CONTENT_CLASS = "flex flex-col gap-6 py-5";

const RICH_TEXT_CLASS = "font-sans text-xs font-light leading-relaxed text-black";

export function ProductDetailInformation({ product }: { product: CatalogProductDetail }) {
  console.log(product);
  const t = useTranslations("productDetail");

  const hasProduct = Boolean(product.productRichText);
  const hasServing = Boolean(product.servingRichText);
  const hasDelivery = Boolean(product.deliveryRichText);
  const hasGifting = Boolean(product.giftingRichText);

  if (!hasProduct && !hasServing && !hasDelivery && !hasGifting) return null;

  return (
    <Accordion type="multiple" className="w-full">
      {hasProduct ? (
        <AccordionItem value="product">
          <AccordionTrigger indicator="plus" className={TRIGGER_CLASS}>
            {t("information.product")}
          </AccordionTrigger>
          <AccordionContent className={CONTENT_CLASS}>
            <SpecRichText data={product.productRichText} className={RICH_TEXT_CLASS} />
          </AccordionContent>
        </AccordionItem>
      ) : null}

      {hasServing ? (
        <AccordionItem value="serving">
          <AccordionTrigger indicator="plus" className={TRIGGER_CLASS}>
            {t("information.serving")}
          </AccordionTrigger>
          <AccordionContent className={CONTENT_CLASS}>
            <SpecRichText data={product.servingRichText} className={RICH_TEXT_CLASS} />
          </AccordionContent>
        </AccordionItem>
      ) : null}

      {hasDelivery ? (
        <AccordionItem value="delivery">
          <AccordionTrigger indicator="plus" className={TRIGGER_CLASS}>
            {t("information.delivery")}
          </AccordionTrigger>
          <AccordionContent className={CONTENT_CLASS}>
            <SpecRichText data={product.deliveryRichText} className={RICH_TEXT_CLASS} />
          </AccordionContent>
        </AccordionItem>
      ) : null}

      {hasGifting ? (
        <AccordionItem value="gifting">
          <AccordionTrigger indicator="plus" className={TRIGGER_CLASS}>
            {t("information.gifting")}
          </AccordionTrigger>
          <AccordionContent className={CONTENT_CLASS}>
            <SpecRichText data={product.giftingRichText} className={RICH_TEXT_CLASS} />
          </AccordionContent>
        </AccordionItem>
      ) : null}
    </Accordion>
  );
}
