"use client";

import { useTranslations } from "next-intl";

import { RichText } from "@shopify/hydrogen-react";

import { Link } from "@/i18n/navigation";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/shared/components/ui/accordion";
import type { CatalogProductDetail } from "@/shared/lib/shopify/catalog-mapper";

function SpecRow({ label, value }: { label: string; value?: string }) {
  if (!value) return null;
  return (
    <div className="flex items-start justify-between gap-6">
      <dt className="font-display text-xs font-normal uppercase tracking-wider text-black">{label}</dt>
      <dd className="text-right font-sans text-xs text-black font-light">{value}</dd>
    </div>
  );
}

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

function SpecBlock({
  label,
  value,
  children,
}: {
  label: string;
  value?: string;
  children?: React.ReactNode;
}) {
  if (!value && !children) return null;
  return (
    <div className="flex flex-col gap-2">
      <dt className="font-display text-xs uppercase tracking-wider text-black">{label}</dt>
      <dd className="font-sans text-xs text-black font-light leading-relaxed">
        {children ? (
          children
        ) : isRichTextAst(value) ? (
          <RichText
            data={value!}
            as="div"
            components={{
              link: ({ node }) => (
                <Link
                  href={node.url}
                  className="text-palette-accent underline transition-opacity hover:opacity-80"
                >
                  {node.children}
                </Link>
              ),
              list: ({ node }) => <ul className="my-1 list-disc space-y-1 pl-4">{node.children}</ul>,
              listItem: ({ node }) => <li className="leading-relaxed">{node.children}</li>,
              paragraph: ({ node }) => <p className="mb-2 leading-relaxed">{node.children}</p>,
              text: ({ node }) => {
                let content: React.ReactNode = node.value;
                if (node.bold) content = <strong className="font-medium text-black">{content}</strong>;
                if (node.italic) content = <em className="italic">{content}</em>;
                return content;
              },
            }}
          />
        ) : (
          <span className="whitespace-pre-line">{value}</span>
        )}
      </dd>
    </div>
  );
}

export function ProductDetailSpecs({ product }: { product: CatalogProductDetail }) {
  const t = useTranslations("productDetail.specs");

  return (
    <div className="ml-auto w-full max-w-[500px]">
      <Accordion type="multiple" defaultValue={["specification"]} className="w-full gap-4">
        {/* Specification */}
        <AccordionItem value="specification">
          <AccordionTrigger className="pb-4 pt-0 font-display text-base font-bold uppercase tracking-wider">
            {t("specificationTitle")}
          </AccordionTrigger>
          <AccordionContent className="space-y-6 py-4">
            {product.specsDescription ? (
              <p className="font-sans text-xs leading-relaxed text-black/80">{product.specsDescription}</p>
            ) : null}
            <dl className="flex flex-col gap-6">
              <SpecRow label={t("pearlSize")} value={product.specs.pearlSize} />
              <SpecRow label={t("salt")} value={product.specs.salt} />
              <SpecRow label={t("color")} value={product.specs.color} />
              <SpecRow label={t("tastingNotes")} value={product.specs.tastingNotes} />
              <SpecBlock label={t("ingredients")} value={product.specs.ingredients} />
              <SpecBlock label={t("nutritionalData")} value={product.specs.nutritionalData} />
            </dl>
          </AccordionContent>
        </AccordionItem>

        {/* Serving Info */}
        <AccordionItem value="serving">
          <AccordionTrigger className="pb-4 pt-0 font-display text-base font-bold uppercase tracking-wider">
            {t("servingTitle")}
          </AccordionTrigger>
          <AccordionContent className="py-4">
            <dl className="flex flex-col gap-6">
              <SpecBlock label={t("shelfLife")} value={product.shelfLife} />
              {product.storage ? <SpecBlock label={t("storage")} value={product.storage} /> : null}
              <SpecBlock label={t("recommendation")} value={product.serving} />
            </dl>
          </AccordionContent>
        </AccordionItem>

        {/* Delivery Info */}
        <AccordionItem value="delivery">
          <AccordionTrigger className="pb-4 pt-0 font-display text-base font-bold uppercase tracking-wider">
            {t("deliveryTitle")}
          </AccordionTrigger>
          <AccordionContent className="py-4">
            <dl className="flex flex-col gap-6">
              <SpecBlock label={t("shipping")} value={product.delivery?.shipping} />
              <SpecBlock label={t("duration")} value={product.delivery?.duration} />
            </dl>
          </AccordionContent>
        </AccordionItem>

        {/* Gifting */}
        <AccordionItem value="gifting">
          <AccordionTrigger className="pb-4 pt-0 font-display text-base font-bold uppercase tracking-wider">
            {t("giftingTitle")}
          </AccordionTrigger>
          <AccordionContent className="py-4">
            <dl className="flex flex-col gap-6">
              <SpecBlock label={t("box")} value={product.gifting?.box} />
              <SpecBlock label={t("message")} value={product.gifting?.message} />
              <SpecBlock label={t("addOns")} value={product.gifting?.addOns} />
            </dl>
          </AccordionContent>
        </AccordionItem>
      </Accordion>
    </div>
  );
}
