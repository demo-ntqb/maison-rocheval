import type { Metadata } from "next";
import { permanentRedirect } from "next/navigation";

import { localizedPath } from "@/shared/lib/metadata";
import { ROUTES } from "@/shared/constants/route.constant";

export const metadata: Metadata = { robots: { index: false, follow: true } };

export default async function ProductsPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  permanentRedirect(localizedPath(locale, ROUTES.PRODUCT_CATEGORY("caviar")));
}
