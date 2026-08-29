import "server-only";

import { cookies } from "next/headers";

import { DEFAULT_COUNTRY, SUPPORTED_COUNTRIES } from "@/shared/constants/commerce-context.constant";
import type { SupportedCountry } from "@/shared/types/commerce-context.type";

const REGION_COOKIE = "mr_country";

export async function getRequestCountry(): Promise<SupportedCountry> {
  const value = (await cookies()).get(REGION_COOKIE)?.value?.toUpperCase();
  return SUPPORTED_COUNTRIES.includes(value as SupportedCountry)
    ? (value as SupportedCountry)
    : DEFAULT_COUNTRY;
}

export async function setRequestCountry(country: SupportedCountry): Promise<void> {
  (await cookies()).set({
    name: REGION_COOKIE,
    value: country,
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
  });
}
