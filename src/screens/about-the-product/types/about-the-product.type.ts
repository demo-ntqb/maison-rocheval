import type { CatalogProductProfile } from "@/shared/lib/shopify/catalog-mapper";

export type AboutUnderstandFactsLabels = Readonly<{
  color: string;
  commonName: string;
  pearlSize: string;
  salt: string;
  species: string;
  tastingNotes: string;
}>;

export type AboutUnderstandLabels = Readonly<{
  atTable: string;
  buyNow: string;
  facts: AboutUnderstandFactsLabels;
  selectorLabel: string;
  sturgeonAlt: string;
}>;

export type AboutUnderstandFactItem = Readonly<{
  label: string;
  labelPlumbId: string;
  rowPlumbId: string;
  value: string;
  valuePlumbId: string;
}>;

export type AboutUnderstandProductFactsProps = Readonly<{
  labels: AboutUnderstandFactsLabels;
  product: CatalogProductProfile;
}>;

export type AboutUnderstandProductPanelProps = Readonly<{
  labels: AboutUnderstandLabels;
  product: CatalogProductProfile;
}>;

export type AboutUnderstandProductTabsProps = Readonly<{
  labels: AboutUnderstandLabels;
  products: readonly CatalogProductProfile[];
}>;
