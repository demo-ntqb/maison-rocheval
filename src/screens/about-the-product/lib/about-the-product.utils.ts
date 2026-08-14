import type { CatalogProductProfile } from "@/shared/lib/shopify/catalog-mapper";
import type {
  AboutUnderstandFactItem,
  AboutUnderstandFactsLabels,
} from "../types/about-the-product.type";

export function displayName(title: string): string {
  return title;
}

export function flavourCharacter(product: CatalogProductProfile): string {
  const character = product.specs.tastingNotes.split(" · ").at(-1) || product.eyebrow;
  return character === "Cheese" ? "Cheesy" : character;
}

export function tastingProfile(product: CatalogProductProfile): string {
  return product.specs.tastingNotes;
}

const FACT_KEYS = [
  { key: "species", labelKey: "species", plumb: "frame-2085667039", valKey: "species", valPlumb: "acipenser-schrenckii-2" },
  { key: "commonName", labelKey: "commonName", plumb: "frame-2085667039-2", valKey: "commonName", valPlumb: "amour" },
  { key: "pearlSize", labelKey: "pearlSize", plumb: "frame-2085667043", valKey: "pearlSize", valPlumb: "3-2mm-3-8mm" },
  { key: "salt", labelKey: "salt", plumb: "frame-2085667042", valKey: "salt", valPlumb: "3-0-3-5" },
  { key: "color", labelKey: "color", plumb: "frame-2085667041", valKey: "color", valPlumb: "golden" },
  { key: "tastingNotes", labelKey: "tastingNotes", plumb: "frame-2085667044", valKey: "tastingNotes", valPlumb: "rich-creamy-long-finish" },
] as const;

export function createProductFacts(
  labels: AboutUnderstandFactsLabels,
  product: CatalogProductProfile,
): readonly AboutUnderstandFactItem[] {
  const values: Record<string, string> = {
    color: product.specs.color,
    commonName: displayName(product.title),
    pearlSize: product.specs.pearlSize,
    salt: product.specs.salt,
    species: product.species,
    tastingNotes: product.specs.tastingNotes,
  };

  return FACT_KEYS.map((item) => ({
    label: labels[item.labelKey as keyof AboutUnderstandFactsLabels],
    labelPlumbId: item.key,
    rowPlumbId: item.plumb,
    value: values[item.valKey] ?? "",
    valuePlumbId: item.valPlumb,
  }));
}
