"use client";

import { useTranslations } from "next-intl";

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/shared/components/ui/accordion";
import type { CatalogProductDetail } from "@/shared/lib/shopify/catalog-mapper";

function SpecRow({ label, value }: { label: string; value: string }) {
  if (!value) return null;
  return (
    <div className="flex items-start justify-between gap-6 border-b border-line/60 pb-4 last:border-0">
      <dt className="font-display text-xs font-bold uppercase">{label}</dt>
      <dd className="max-w-[60%] text-right font-sans text-xs">{value}</dd>
    </div>
  );
}

export function ProductDetailSpecs({ product }: { product: CatalogProductDetail }) {
  const t = useTranslations("productDetail.specs");

  return (
    <div className="ml-auto w-full max-w-[500px]">
      <Accordion type="multiple" defaultValue={["specification"]} className="w-full gap-4">
        <AccordionItem value="specification">
          <AccordionTrigger className="pb-4 pt-0 font-display text-base font-bold uppercase tracking-wider">
            {t("specificationTitle")}
          </AccordionTrigger>
          <AccordionContent className="space-y-6 py-4">
            {product.specsDescription ? (
              <p className="font-sans text-sm leading-relaxed">{product.specsDescription}</p>
            ) : null}
            <dl className="flex flex-col gap-4">
              <SpecRow label={t("pearlSize")} value={product.specs.pearlSize} />
              <SpecRow label={t("salt")} value={product.specs.salt} />
              <SpecRow label={t("color")} value={product.specs.color} />
              <SpecRow label={t("tastingNotes")} value={product.specs.tastingNotes} />
              <SpecRow label={t("ingredients")} value={product.specs.ingredients} />
              <SpecRow label={t("nutritionalData")} value={product.specs.nutritionalData} />
            </dl>
          </AccordionContent>
        </AccordionItem>

        <AccordionItem value="serving">
          <AccordionTrigger className="pb-4 pt-0 font-display text-base font-bold uppercase tracking-wider">
            {t("servingTitle")}
          </AccordionTrigger>
          <AccordionContent className="py-4">
            <dl className="flex flex-col gap-4">
              <SpecRow label={t("shelfLife")} value={product.shelfLife} />
              <SpecRow label={t("storage")} value={product.storage} />
              <SpecRow label={t("recommendation")} value={product.serving} />
            </dl>
          </AccordionContent>
        </AccordionItem>
      </Accordion>
    </div>
  );
}
