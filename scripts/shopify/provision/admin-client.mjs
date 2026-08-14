import { Kind, parse } from "graphql";

export const SHOPIFY_ADMIN_API_VERSION = "2026-07";

function normalizeStoreDomain(value) {
  const candidate = String(value ?? "").trim();
  if (!candidate) return "";

  try {
    const url = new URL(candidate.includes("://") ? candidate : `https://${candidate}`);
    return url.hostname.toLowerCase();
  } catch {
    throw new Error("SHOPIFY_ADMIN_STORE_DOMAIN must be a valid Shopify hostname.");
  }
}

export function resolveAdminConfig(env = process.env) {
  const storeDomain = normalizeStoreDomain(
    env.SHOPIFY_ADMIN_STORE_DOMAIN || env.NEXT_PUBLIC_SHOPIFY_STORE_DOMAIN,
  );
  if (!storeDomain) {
    throw new Error(
      "SHOPIFY_ADMIN_STORE_DOMAIN or NEXT_PUBLIC_SHOPIFY_STORE_DOMAIN is required.",
    );
  }

  const accessToken = env.SHOPIFY_ADMIN_ACCESS_TOKEN?.trim();
  if (accessToken) {
    return {
      apiVersion: SHOPIFY_ADMIN_API_VERSION,
      authMode: "access-token",
      storeDomain,
      accessToken,
    };
  }

  const clientId = env.SHOPIFY_ADMIN_CLIENT_ID?.trim();
  const clientSecret = env.SHOPIFY_ADMIN_CLIENT_SECRET?.trim();
  if (!clientId || !clientSecret) {
    throw new Error(
      "Set SHOPIFY_ADMIN_ACCESS_TOKEN or both SHOPIFY_ADMIN_CLIENT_ID and SHOPIFY_ADMIN_CLIENT_SECRET.",
    );
  }

  return {
    apiVersion: SHOPIFY_ADMIN_API_VERSION,
    authMode: "client-credentials",
    storeDomain,
    clientId,
    clientSecret,
  };
}

function operationLabel(query, explicitName) {
  if (explicitName) return explicitName;
  return query.match(/\b(?:query|mutation)\s+([A-Za-z0-9_]+)/u)?.[1] ?? "AnonymousOperation";
}

function containsMutation(query) {
  return parse(query).definitions.some((definition) => (
    definition.kind === Kind.OPERATION_DEFINITION && definition.operation === "mutation"
  ));
}

async function parseJsonResponse(response, context) {
  let payload;
  try {
    payload = await response.json();
  } catch {
    throw new Error(`[shopify-admin] ${context} returned invalid JSON (HTTP ${response.status}).`);
  }
  if (!response.ok) {
    throw new Error(`[shopify-admin] ${context} failed with HTTP ${response.status}.`);
  }
  return payload;
}

export function createAdminClient({
  env = process.env,
  fetchImpl = fetch,
  readOnly = false,
} = {}) {
  const config = resolveAdminConfig(env);
  const graphQlUrl = `https://${config.storeDomain}/admin/api/${config.apiVersion}/graphql.json`;
  let cachedToken = config.authMode === "access-token" ? config.accessToken : null;
  let tokenExpiresAt = Number.POSITIVE_INFINITY;

  async function accessToken() {
    if (cachedToken && Date.now() < tokenExpiresAt - 60_000) return cachedToken;

    const body = new URLSearchParams({
      grant_type: "client_credentials",
      client_id: config.clientId,
      client_secret: config.clientSecret,
    });
    const response = await fetchImpl(
      `https://${config.storeDomain}/admin/oauth/access_token`,
      {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body,
      },
    );
    const payload = await parseJsonResponse(response, "ClientCredentials");
    if (!payload.access_token) {
      throw new Error("[shopify-admin] ClientCredentials response did not include an access token.");
    }
    cachedToken = payload.access_token;
    tokenExpiresAt = Date.now() + Number(payload.expires_in ?? 86_399) * 1000;
    return cachedToken;
  }

  return {
    apiVersion: config.apiVersion,
    authMode: config.authMode,
    storeDomain: config.storeDomain,
    async request(query, variables = {}, options = {}) {
      const name = operationLabel(query, options.operationName);
      if (readOnly && containsMutation(query)) {
        throw new Error(`[shopify-admin] ${name} is a mutation and is blocked in read-only mode.`);
      }

      const response = await fetchImpl(graphQlUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-Shopify-Access-Token": await accessToken(),
        },
        body: JSON.stringify({ query, variables }),
      });
      const payload = await parseJsonResponse(response, name);
      if (payload.errors?.length) {
        const messages = payload.errors.map((error) => error.message).join("; ");
        throw new Error(`[shopify-admin] ${name} failed: ${messages}`);
      }
      if (!payload.data) {
        throw new Error(`[shopify-admin] ${name} response did not include data.`);
      }
      return payload.data;
    },
  };
}
