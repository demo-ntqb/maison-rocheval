"use client";

import { useMounted } from "@/shared/hooks/use-mounted.hook";
import { useLocale } from "next-intl";
import { useSearchParams } from "next/navigation";
import dynamic from "next/dynamic";
import { useEffect, useSyncExternalStore } from "react";

import { usePathname, useRouter } from "@/i18n/navigation";
import { getCommerceContextOrDefault } from "@/shared/lib/commerce-context";
import {
  getRegionStorageSnapshot,
  getServerRegionStorageSnapshot,
  hasRegionRedirectedThisSession,
  markRegionRedirectedThisSession,
  parseRegionSnapshot,
  subscribeToRegionStorage,
} from "@/shared/lib/region-preference";
import type { RouteLocale, ShippingCountryCode } from "@/shared/types/region.type";
import type { CommerceContext } from "@/shared/types/commerce-context.type";

const RegionPreferenceDialog = dynamic(
  () =>
    import("./region-preference-dialog").then(
      (module) => module.RegionPreferenceDialog,
    ),
  { ssr: false },
);

function RegionPreferenceGateInner({ availableContexts }: { availableContexts: readonly CommerceContext[] }) {
  const activeRouteLocale = useLocale() as RouteLocale;
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const router = useRouter();

  const snapshot = useSyncExternalStore(
    subscribeToRegionStorage,
    getRegionStorageSnapshot,
    getServerRegionStorageSnapshot,
  );
  const { preference, dismissed } = parseRegionSnapshot(snapshot);
  const preferredRouteLocale = preference?.routeLocale;
  const hasAvailablePreference = Boolean(
    preferredRouteLocale && availableContexts.some((context) => context.routeLocale === preferredRouteLocale),
  );

  useEffect(() => {
    if (!hasAvailablePreference || !preferredRouteLocale || preferredRouteLocale === activeRouteLocale) {
      return;
    }

    if (hasRegionRedirectedThisSession()) {
      return;
    }
    markRegionRedirectedThisSession();

    const queryString = searchParams?.toString();
    const nextHref = queryString ? `${pathname}?${queryString}` : pathname;
    router.replace(nextHref, { locale: preferredRouteLocale });
  }, [hasAvailablePreference, preferredRouteLocale, activeRouteLocale, pathname, router, searchParams]);

  if (snapshot === null || (preference && hasAvailablePreference) || dismissed) {
    return null;
  }

  const { country, appLocale } = getCommerceContextOrDefault(activeRouteLocale);

  return (
    <RegionPreferenceDialog
      initialCountryCode={country as ShippingCountryCode}
      initialAppLocale={appLocale}
      availableContexts={availableContexts}
    />
  );
}

export function RegionPreferenceGate({ availableContexts }: { availableContexts: readonly CommerceContext[] }) {
  const mounted = useMounted();

  if (!mounted) {
    return null;
  }

  return <RegionPreferenceGateInner availableContexts={availableContexts} />;
}
