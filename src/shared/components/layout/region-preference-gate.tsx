"use client";

import { useEffect, useSyncExternalStore } from "react";
import dynamic from "next/dynamic";
import { useLocale } from "next-intl";

import { usePathname, useRouter } from "@/i18n/navigation";
import {
  DEFAULT_SHIPPING_COUNTRY,
  SHIPPING_COUNTRIES,
} from "@/shared/constants/region.constant";
import {
  getRegionStorageSnapshot,
  getServerRegionStorageSnapshot,
  hasRegionRedirectedThisSession,
  markRegionRedirectedThisSession,
  parseRegionSnapshot,
  subscribeToRegionStorage,
} from "@/shared/lib/region-preference";
import type { AppLocale, ShippingCountryCode } from "@/shared/types/region.type";

// Radix Dialog chỉ tải khi thực sự cần hỏi — khách quay lại (đã có lựa chọn
// trong localStorage) không phải tải thêm JS nào.
const RegionPreferenceDialog = dynamic(
  () =>
    import("./region-preference-dialog").then(
      (module) => module.RegionPreferenceDialog,
    ),
  { ssr: false },
);

/** Gợi ý quốc gia từ locale đang hoạt động (đã qua negotiation của next-intl). */
const countryForLocale = (locale: AppLocale): ShippingCountryCode =>
  SHIPPING_COUNTRIES.find((country) => country.defaultLocale === locale)?.code ??
  DEFAULT_SHIPPING_COUNTRY;

/**
 * Quyết định có hiện popup chọn vùng/ngôn ngữ hay không:
 *
 * - Chưa có lựa chọn nào trong localStorage và chưa đóng popup trong phiên này
 *   → hiện popup.
 * - Đã có lựa chọn → không hỏi lại, và nếu ngôn ngữ đang xem khác ngôn ngữ đã
 *   lưu thì chuyển sang ngôn ngữ mặc định của thiết bị này.
 *
 * Snapshot trên server là `null` nên lượt hydrate đầu tiên không render gì —
 * không có nguy cơ lệch markup.
 */
export function RegionPreferenceGate() {
  const activeLocale = useLocale() as AppLocale;
  const pathname = usePathname();
  const router = useRouter();

  const snapshot = useSyncExternalStore(
    subscribeToRegionStorage,
    getRegionStorageSnapshot,
    getServerRegionStorageSnapshot,
  );
  const { preference, dismissed } = parseRegionSnapshot(snapshot);
  const preferredLocale = preference?.locale;

  useEffect(() => {
    if (!preferredLocale || preferredLocale === activeLocale) {
      return;
    }

    // Chỉ tự redirect một lần khi bắt đầu phiên (vd. vào site qua URL tiếng
    // Anh nhưng đã lưu preference tiếng Pháp). Không đánh bật các lần điều
    // hướng chủ đích của user sau đó (toggle FR/EN, URL trực tiếp).
    if (hasRegionRedirectedThisSession()) {
      return;
    }
    markRegionRedirectedThisSession();

    router.replace(pathname, { locale: preferredLocale });
  }, [preferredLocale, activeLocale, pathname, router]);

  if (snapshot === null || preference || dismissed) {
    return null;
  }

  return <RegionPreferenceDialog initialCountryCode={countryForLocale(activeLocale)} />;
}
