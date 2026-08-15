import { timingSafeEqual } from "node:crypto";
import { revalidateTag } from "next/cache";

const DEFAULT_ALL_TAGS = [
  "shopify-products",
  "shopify-collections",
  "shopify-metaobjects",
];

const DEFAULT_REVALIDATE_SECRET = "maison-rocheval-revalidate-secret";

function isValidSecret(provided: string, expected: string): boolean {
  if (!provided || !expected) return false;
  const providedBuffer = Buffer.from(provided);
  const expectedBuffer = Buffer.from(expected);
  if (providedBuffer.length !== expectedBuffer.length) return false;
  return timingSafeEqual(providedBuffer, expectedBuffer);
}

function extractSecret(request: Request, searchParams: URLSearchParams): string {
  const authHeader = request.headers.get("authorization") ?? "";
  if (authHeader.toLowerCase().startsWith("bearer ")) {
    return authHeader.slice(7).trim();
  }

  const customHeader = request.headers.get("x-revalidate-secret")?.trim();
  if (customHeader) return customHeader;

  return searchParams.get("secret")?.trim() ?? "";
}

function resolveTagsToRevalidate(options: {
  collection?: unknown;
  handle?: unknown;
  tag?: unknown;
  tags?: unknown;
}): string[] {
  const result = new Set<string>();

  if (typeof options.tag === "string" && options.tag.trim()) {
    result.add(options.tag.trim());
  }

  if (Array.isArray(options.tags)) {
    for (const t of options.tags) {
      if (typeof t === "string" && t.trim()) {
        result.add(t.trim());
      }
    }
  }

  if (typeof options.handle === "string" && options.handle.trim()) {
    const handle = options.handle.trim();
    result.add("shopify-products");
    result.add(`shopify-product-${handle}`);
  }

  if (typeof options.collection === "string" && options.collection.trim()) {
    const collection = options.collection.trim();
    result.add("shopify-collections");
    result.add(`shopify-collection-${collection}`);
  }

  if (result.size === 0) {
    for (const tag of DEFAULT_ALL_TAGS) {
      result.add(tag);
    }
  }

  return Array.from(result);
}

async function handleRevalidate(request: Request): Promise<Response> {
  const expectedSecret =
    process.env.REVALIDATE_SECRET_TOKEN?.trim() ||
    process.env.SHOPIFY_ADMIN_CLIENT_SECRET?.trim() ||
    DEFAULT_REVALIDATE_SECRET;

  const url = new URL(request.url);
  const providedSecret = extractSecret(request, url.searchParams);

  if (!providedSecret || !isValidSecret(providedSecret, expectedSecret)) {
    return Response.json({ error: "Invalid secret" }, { status: 401 });
  }

  let bodyOptions: Record<string, unknown> = {};
  if (request.method === "POST") {
    try {
      const text = await request.text();
      if (text.trim()) {
        bodyOptions = JSON.parse(text) as Record<string, unknown>;
      }
    } catch {
      return Response.json({ error: "Invalid JSON body" }, { status: 400 });
    }
  }

  const tagParam = url.searchParams.get("tag");
  const handleParam = url.searchParams.get("handle");
  const collectionParam = url.searchParams.get("collection");

  const tags = resolveTagsToRevalidate({
    collection: bodyOptions.collection ?? collectionParam ?? undefined,
    handle: bodyOptions.handle ?? handleParam ?? undefined,
    tag: bodyOptions.tag ?? tagParam ?? undefined,
    tags: bodyOptions.tags,
  });

  for (const tag of tags) {
    revalidateTag(tag, { expire: 0 });
  }

  return Response.json({
    now: Date.now(),
    revalidated: true,
    tags,
  });
}

export async function GET(request: Request): Promise<Response> {
  return handleRevalidate(request);
}

export async function POST(request: Request): Promise<Response> {
  return handleRevalidate(request);
}
