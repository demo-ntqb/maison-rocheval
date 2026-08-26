"use client";

import { useTranslations } from "next-intl";

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/shared/components/ui/accordion";
import type { CatalogProductDetail } from "@/shared/lib/shopify/catalog-mapper";
import { SpecBlock, SpecRichText, SpecRow } from "./product-detail-spec-content";

/**
 * Figma keeps every row flush and quiet: a 20px rule, sans caps label and a
 * hairline plus. The `ui/accordion` primitive ships a much louder editorial
 * default, so the whole look is applied here at the call site.
 */
const TRIGGER_CLASS =
  "min-h-16 items-center border-b-[0.5px] border-stone py-5 font-sans text-sm font-normal leading-normal uppercase text-black **:data-[slot=accordion-trigger-icon]:mt-0 **:data-[slot=accordion-trigger-icon]:size-4.5 **:data-[slot=accordion-trigger-icon]:text-gray-icon";

const CONTENT_CLASS = "flex flex-col gap-6 pt-0 pb-5";

export function ProductDetailInformation({ product }: { product: CatalogProductDetail }) {
  const t = useTranslations("productDetail");

  const hasProduct = Boolean(
    product.descriptionHtml ||
    product.specs?.pearlSize ||
    product.specs?.salt ||
    product.specs?.color ||
    product.specs?.tastingNotes ||
    product.specs?.ingredients ||
    product.specs?.nutritionalData,
  );
  const hasServing = Boolean(product.shelfLife || product.storage || product.serving);
  const hasDelivery = Boolean(product.delivery?.shipping || product.delivery?.duration);
  const hasGifting = Boolean(
    product.gifting?.box || product.gifting?.message || product.gifting?.addOns,
  );

  if (!hasProduct && !hasServing && !hasDelivery && !hasGifting) return null;

  return (
    <Accordion type="multiple" className="w-full">
      {hasProduct ? (
        <AccordionItem value="product">
          <AccordionTrigger indicator="plus" className={TRIGGER_CLASS}>
            {t("information.product")}
          </AccordionTrigger>
          <AccordionContent className={CONTENT_CLASS}>
            {product.descriptionHtml ? (
              <SpecRichText
                data={product.descriptionHtml}
                className="font-sans text-xs font-light leading-relaxed text-black"
              />
            ) : null}
            <dl className="flex flex-col gap-6">
              <SpecRow label={t("specs.pearlSize")} value={product.specs?.pearlSize} />
              <SpecRow label={t("specs.salt")} value={product.specs?.salt} />
              <SpecRow label={t("specs.color")} value={product.specs?.color} />
              <SpecRow label={t("specs.tastingNotes")} value={product.specs?.tastingNotes} />
              <SpecBlock label={t("specs.ingredients")} value={product.specs?.ingredients} />
              <SpecBlock label={t("specs.nutritionalData")} value={product.specs?.nutritionalData} />
            </dl>
          </AccordionContent>
        </AccordionItem>
      ) : null}

      {hasServing ? (
        <AccordionItem value="serving">
          <AccordionTrigger indicator="plus" className={TRIGGER_CLASS}>
            {t("information.serving")}
          </AccordionTrigger>
          <AccordionContent className={CONTENT_CLASS}>
            <dl className="flex flex-col gap-6">
              <SpecBlock label={t("specs.shelfLife")} value={product.shelfLife} />
              <SpecBlock label={t("specs.storage")} value={product.storage} />
              <SpecBlock label={t("specs.recommendation")} value={product.serving} />
            </dl>
          </AccordionContent>
        </AccordionItem>
      ) : null}

      {hasDelivery ? (
        <AccordionItem value="delivery">
          <AccordionTrigger indicator="plus" className={TRIGGER_CLASS}>
            {t("information.delivery")}
          </AccordionTrigger>
          <AccordionContent className={CONTENT_CLASS}>
            <dl className="flex flex-col gap-6">
              <SpecBlock label={t("specs.shipping")} value={product.delivery?.shipping} />
              <SpecBlock label={t("specs.duration")} value={product.delivery?.duration} />
            </dl>
          </AccordionContent>
        </AccordionItem>
      ) : null}

      {hasGifting ? (
        <AccordionItem value="gifting">
          <AccordionTrigger indicator="plus" className={TRIGGER_CLASS}>
            {t("information.gifting")}
          </AccordionTrigger>
          <AccordionContent className={CONTENT_CLASS}>
            <dl className="flex flex-col gap-6">
              <SpecBlock label={t("specs.box")} value={product.gifting?.box} />
              <SpecBlock label={t("specs.message")} value={product.gifting?.message} />
              <SpecBlock label={t("specs.addOns")} value={product.gifting?.addOns} />
            </dl>
          </AccordionContent>
        </AccordionItem>
      ) : null}
    </Accordion>
  );
}
