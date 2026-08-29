export function getBuyerIp(request: Request): string | undefined {
  const forwarded = request.headers.get("x-forwarded-for");
  const firstForwarded = forwarded?.split(",")[0]?.trim();
  if (firstForwarded) {
    return firstForwarded;
  }

  const realIp = request.headers.get("x-real-ip")?.trim();
  return realIp || undefined;
}
