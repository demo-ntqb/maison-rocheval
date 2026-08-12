type ShopifyImageOptions = {
  crop?: "bottom" | "center" | "left" | "right" | "top";
  height?: number;
  width?: number;
};

const SHOPIFY_IMAGE_HOSTS = ["cdn.shopify.com", "mock.shop"];

function isShopifyImageHost(hostname: string): boolean {
  return SHOPIFY_IMAGE_HOSTS.some(
    (host) => hostname === host || hostname.endsWith(`.${host}`),
  );
}

/** Add Shopify CDN sizing parameters without dropping existing query params. */
export function shopifyImageUrl(url: string, options: ShopifyImageOptions = {}): string {
  let parsedUrl: URL;

  try {
    parsedUrl = new URL(url);
  } catch {
    return url;
  }

  if (!isShopifyImageHost(parsedUrl.hostname)) return url;

  if (options.width) parsedUrl.searchParams.set("width", String(options.width));
  if (options.height) parsedUrl.searchParams.set("height", String(options.height));
  if (options.crop) parsedUrl.searchParams.set("crop", options.crop);

  return parsedUrl.toString();
}

/** Build a width-descriptor srcset for native `<img>`/`<picture>` rendering. */
export function shopifyImageSrcSet(url: string, widths: readonly number[]): string {
  return widths.map((width) => `${shopifyImageUrl(url, { width })} ${width}w`).join(", ");
}
