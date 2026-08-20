import { locale as rootLocale } from "next/root-params";
import { hasLocale } from "next-intl";

import { routing } from "./routing";

export type RouteLocale = (typeof routing.locales)[number];

export async function getRouteLocale(): Promise<RouteLocale> {
  const locale = await rootLocale();

  return hasLocale(routing.locales, locale) ? locale : routing.defaultLocale;
}
