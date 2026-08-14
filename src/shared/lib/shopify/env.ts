import "server-only";

export function getOptionalPrivateStorefrontToken(): string | undefined {
  const token = process.env.PRIVATE_STOREFRONT_API_TOKEN?.trim();
  return token || undefined;
}

