"use client";

import ReactDOM from "react-dom";

export function ShopifyResourceHints() {
  ReactDOM.preconnect("https://cdn.shopify.com", { crossOrigin: "anonymous" });
  ReactDOM.prefetchDNS("https://cdn.shopify.com");
  return null;
}
