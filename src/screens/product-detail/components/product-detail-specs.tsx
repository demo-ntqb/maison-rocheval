"use client";

import { useTranslations } from "next-intl";

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/shared/components/ui/accordion";
import type { DetailedProduct, ProductAccordionItem } from "../types/product-detail.type";

export interface ProductDetailSpecsProps {
  product: DetailedProduct;
  items?: ProductAccordionItem[];
}

export function ProductDetailSpecs({ product, items }: ProductDetailSpecsProps) {
  const t = useTranslations("productDetail");

  const fallbackItems: ProductAccordionItem[] = [
    {
      id: "specification",
      title: t("specs.specificationTitle"),
      content: `<p class="mb-6 text-sm leading-relaxed">${product.specsDescription}</p>
<div class="flex flex-col gap-4">
  <div class="flex items-center justify-between gap-4 pb-4">
    <span class="font-display text-xs font-bold uppercase text-black">${t("specs.pearlSize")}</span>
    <span class="font-sans text-xs text-black">${product.specs.pearlSize}</span>
  </div>
  <div class="flex items-center justify-between gap-4 pb-4">
    <span class="font-display text-xs font-bold uppercase text-black">${t("specs.salt")}</span>
    <span class="font-sans text-xs text-black">${product.specs.salt}</span>
  </div>
  <div class="flex items-center justify-between gap-4 pb-4">
    <span class="font-display text-xs font-bold uppercase text-black">${t("specs.color")}</span>
    <span class="font-sans text-xs text-black">${product.specs.color}</span>
  </div>
  <div class="flex items-center justify-between gap-4 pb-4">
    <span class="font-display text-xs font-bold uppercase text-black">${t("specs.tastingNotes")}</span>
    <span class="font-sans text-xs text-black">${product.specs.tastingNotes}</span>
  </div>
  <div class="flex flex-col gap-1 pb-4">
    <span class="font-display text-xs font-bold uppercase text-black">${t("specs.ingredients")}</span>
    <span class="font-sans text-xs text-black">${product.specs.ingredients}</span>
  </div>
  <div class="flex flex-col gap-1">
    <span class="font-display text-xs font-bold uppercase text-black">${t("specs.nutritionalData")}</span>
    <span class="font-sans text-xs text-black">${product.specs.nutritionalData}</span>
  </div>
</div>`,
    },
    {
      id: "serving",
      title: t("specs.servingTitle"),
      content: `<div class="flex flex-col gap-4">
  <div class="flex flex-col gap-1 pb-4">
    <span class="font-display text-xs font-bold uppercase text-black">${t("specs.shelfLife")}</span>
    <span class="font-sans text-xs text-black">${product.servingInfo.shelfLife}</span>
  </div>
  <div class="flex flex-col gap-1">
    <span class="font-display text-xs font-bold uppercase text-black">${t("specs.recommendation")}</span>
    <p class="whitespace-pre-line font-sans text-xs text-black">${product.servingInfo.recommendation}</p>
  </div>
</div>`,
    },
    {
      id: "delivery",
      title: t("specs.deliveryTitle"),
      content: `<div class="flex flex-col gap-4">
  <div class="flex flex-col gap-1 pb-4">
    <span class="font-display text-xs font-bold uppercase text-black">${t("specs.shipping")}</span>
    <span class="font-sans text-xs text-black">${product.deliveryInfo.shipping}</span>
  </div>
  <div class="flex flex-col gap-1">
    <span class="font-display text-xs font-bold uppercase text-black">${t("specs.deliveryTime")}</span>
    <span class="font-sans text-xs text-black">${product.deliveryInfo.deliveryTime}</span>
  </div>
</div>`,
    },
    {
      id: "gifting",
      title: t("specs.giftingTitle"),
      content: `<div class="flex flex-col gap-4">
  <div class="flex flex-col gap-1 pb-4">
    <span class="font-display text-xs font-bold uppercase text-black">${t("specs.giftWrapping")}</span>
    <span class="font-sans text-xs text-black">${product.giftingInfo.wrapping}</span>
  </div>
  <div class="flex flex-col gap-1">
    <span class="font-display text-xs font-bold uppercase text-black">${t("specs.messageCard")}</span>
    <span class="font-sans text-xs text-black">${product.giftingInfo.message}</span>
  </div>
</div>`,
    },
  ];

  const accordionList = items ?? product.accordionItems ?? fallbackItems;
  const defaultValues = accordionList.length > 0 ? [accordionList[0].id] : ["specification"];

  return (
    <div className="ml-auto w-full max-w-[500px]">
      <Accordion type="multiple" defaultValue={defaultValues} className="w-full gap-4">
        {accordionList.map((item) => (
          <AccordionItem key={item.id} value={item.id}>
            <AccordionTrigger className="font-display text-base font-bold uppercase tracking-wider text-black pt-0 pb-4">
              {item.title}
            </AccordionTrigger>
            <AccordionContent className="font-sans text-sm leading-relaxed text-black py-4">
              <div
                className="rich-text-content space-y-4 text-sm leading-relaxed text-black [&_a]:underline [&_a]:hover:text-black/70 [&_strong]:font-semibold [&_ul]:list-disc [&_ul]:pl-5 [&_ol]:list-decimal [&_ol]:pl-5"
                dangerouslySetInnerHTML={{ __html: item.content }}
              />
            </AccordionContent>
          </AccordionItem>
        ))}
      </Accordion>
    </div>
  );
}
