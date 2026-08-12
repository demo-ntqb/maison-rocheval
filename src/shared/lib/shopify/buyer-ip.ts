const FIRST_FORWARDED_IP_INDEX = 0;

export function getBuyerIp(headers: Pick<Headers, "get">): string {
  const forwardedFor = headers.get("x-forwarded-for");
  const buyerIp = forwardedFor?.split(",")[FIRST_FORWARDED_IP_INDEX]?.trim();

  if (buyerIp) return buyerIp;
  if (process.env.NODE_ENV !== "production") return "127.0.0.1";

  throw new Error("x-forwarded-for is required for buyer-scoped Shopify requests.");
}
