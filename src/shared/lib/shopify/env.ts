import "server-only";

const SESSION_SECRET_MIN_LENGTH = 32;

export function getOptionalPrivateStorefrontToken(): string | undefined {
  const token = process.env.PRIVATE_STOREFRONT_API_TOKEN?.trim();
  return token || undefined;
}

export function getSessionSecret(): string {
  const secret = process.env.SESSION_SECRET;

  if (!secret || secret.length < SESSION_SECRET_MIN_LENGTH) {
    throw new Error(
      `SESSION_SECRET is required and must contain at least ${SESSION_SECRET_MIN_LENGTH} characters.`,
    );
  }

  return secret;
}
