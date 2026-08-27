import { routing } from "@/i18n/routing";
import { SHIPPING_COUNTRIES } from "@/shared/constants/region.constant";
import type {
  AppLocale,
  RegionPreference,
  ShippingCountryCode,
} from "@/shared/types/region.type";

/** localStorage: lựa chọn đã xác nhận — tồn tại vĩnh viễn trên thiết bị. */
export const PREFERENCE_KEY = "mr:region-preference";

/** sessionStorage: người dùng đóng popup mà không chọn — chỉ im lặng phiên này. */
const DISMISSED_KEY = "mr:region-preference-dismissed";

/** sessionStorage: gate đã tự redirect theo preference một lần trong phiên này. */
const REDIRECTED_KEY = "mr:region-redirected";

/** Ký tự phân tách hai giá trị trong snapshot (không xuất hiện trong JSON). */
const SNAPSHOT_SEPARATOR = "\u0000";

const isAppLocale = (value: unknown): value is AppLocale =>
  typeof value === "string" && (routing.locales as readonly string[]).includes(value);

const isShippingCountryCode = (value: unknown): value is ShippingCountryCode =>
  typeof value === "string" && SHIPPING_COUNTRIES.some((country ) => country.code === value);

/**
 * Snapshot của cả hai storage dưới dạng chuỗi — `useSyncExternalStore` yêu cầu
 * getSnapshot trả về giá trị so sánh được bằng `Object.is`, nên không trả object.
 */
export function getRegionStorageSnapshot(): string {
  try {
    const preference = window.localStorage.getItem(PREFERENCE_KEY) ?? "";
    const dismissed = window.sessionStorage.getItem(DISMISSED_KEY) ?? "";
    return `${preference}${SNAPSHOT_SEPARATOR}${dismissed}`;
  } catch {
    // Storage bị chặn (Safari private mode / quota) — coi như chưa có lựa chọn.
    return SNAPSHOT_SEPARATOR;
  }
}

/**
 * Trên server không có storage. Trả `null` để lượt render đầu (và lượt hydrate)
 * không hiện gì cả, tránh lệch markup giữa server và client.
 */
export function getServerRegionStorageSnapshot(): null {
  return null;
}

/** Đồng bộ khi người dùng đổi lựa chọn ở tab khác. */
export function subscribeToRegionStorage(onStoreChange: () => void): () => void {
  window.addEventListener("storage", onStoreChange);
  return () => window.removeEventListener("storage", onStoreChange);
}

/**
 * Tách snapshot thành lựa chọn đã lưu + cờ đã đóng popup trong phiên.
 * `preference` là `null` nếu chưa có, dữ liệu hỏng, hoặc quốc gia/ngôn ngữ đã
 * lưu không còn được hỗ trợ — khi đó popup sẽ hỏi lại.
 */
export function parseRegionSnapshot(snapshot: string | null): {
  preference: RegionPreference | null;
  dismissed: boolean;
} {
  if (snapshot === null) {
    return { preference: null, dismissed: false };
  }

  const separatorIndex = snapshot.indexOf(SNAPSHOT_SEPARATOR);
  const rawPreference = snapshot.slice(0, separatorIndex);
  const dismissed = snapshot.slice(separatorIndex + 1) === "1";

  return { preference: parseRegionPreference(rawPreference), dismissed };
}

function parseRegionPreference(raw: string): RegionPreference | null {
  if (!raw) {
    return null;
  }

  try {
    const parsed: unknown = JSON.parse(raw);
    if (typeof parsed !== "object" || parsed === null) {
      return null;
    }

    const { countryCode, locale } = parsed as Partial<RegionPreference>;
    if (!isShippingCountryCode(countryCode) || !isAppLocale(locale)) {
      return null;
    }

    return { countryCode, locale };
  } catch {
    return null;
  }
}

/** Đọc lựa chọn đã lưu ngoài luồng render (event handler). */
function readRegionPreference(): RegionPreference | null {
  if (typeof window === "undefined") {
    return null;
  }

  return parseRegionSnapshot(getRegionStorageSnapshot()).preference;
}

export function writeRegionPreference(preference: RegionPreference): void {
  if (typeof window === "undefined") {
    return;
  }

  try {
    window.localStorage.setItem(PREFERENCE_KEY, JSON.stringify(preference));
  } catch {
    // Storage bị chặn — không chặn luồng người dùng, popup sẽ hỏi lại lần sau.
  }
}

/**
 * Cập nhật riêng ngôn ngữ nếu người dùng đã có lựa chọn (ví dụ khi bấm FR / EN
 * trên header) — giữ nguyên quốc gia giao hàng đã chọn. Không tạo mới bản ghi
 * để người chưa từng thấy popup vẫn được hỏi.
 */
export function updateRegionPreferenceLocale(locale: AppLocale): void {
  const stored = readRegionPreference();
  if (!stored) {
    return;
  }

  writeRegionPreference({ ...stored, locale });
}

export function markRegionPromptDismissed(): void {
  if (typeof window === "undefined") {
    return;
  }

  try {
    window.sessionStorage.setItem(DISMISSED_KEY, "1");
  } catch {
    // Xem ghi chú ở `writeRegionPreference`.
  }
}

/**
 * Gate chỉ tự redirect theo preference đã lưu một lần mỗi phiên — sau đó để
 * user tự điều hướng (toggle ngôn ngữ, mở URL trực tiếp) mà không bị đánh bật.
 */
export function hasRegionRedirectedThisSession(): boolean {
  if (typeof window === "undefined") {
    return false;
  }

  try {
    return window.sessionStorage.getItem(REDIRECTED_KEY) === "1";
  } catch {
    return false;
  }
}

export function markRegionRedirectedThisSession(): void {
  if (typeof window === "undefined") {
    return;
  }

  try {
    window.sessionStorage.setItem(REDIRECTED_KEY, "1");
  } catch {
    // Xem ghi chú ở `writeRegionPreference`.
  }
}
