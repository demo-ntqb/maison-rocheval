import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const { revalidateTag } = vi.hoisted(() => ({ revalidateTag: vi.fn() }));

vi.mock("next/cache", () => ({ revalidateTag }));

import { GET, POST } from "./route";

const SECRET = "test-revalidate-secret";

describe("Manual Revalidate Route", () => {
  beforeEach(() => {
    process.env.REVALIDATE_SECRET_TOKEN = SECRET;
    revalidateTag.mockClear();
  });

  afterEach(() => {
    delete process.env.REVALIDATE_SECRET_TOKEN;
    delete process.env.SHOPIFY_ADMIN_CLIENT_SECRET;
  });

  it("trả về 401 khi không cung cấp secret hoặc sai secret", async () => {
    const req = new Request("https://maison-rocheval.test/api/revalidate", { method: "POST" });
    const res = await POST(req);
    expect(res.status).toBe(401);
    expect(revalidateTag).not.toHaveBeenCalled();
  });

  it("revalidate toàn bộ catalog tags khi không chỉ định params qua Authorization Bearer", async () => {
    const req = new Request("https://maison-rocheval.test/api/revalidate", {
      headers: { authorization: `Bearer ${SECRET}` },
      method: "POST",
    });
    const res = await POST(req);
    expect(res.status).toBe(200);
    const data = await res.json();
    expect(data.revalidated).toBe(true);
    expect(data.tags).toEqual([
      "shopify-products",
      "shopify-collections",
      "shopify-metaobjects",
    ]);
    expect(revalidateTag).toHaveBeenCalledTimes(3);
  });

  it("revalidate tag cụ thể qua query param và header x-revalidate-secret", async () => {
    const req = new Request(
      "https://maison-rocheval.test/api/revalidate?tag=shopify-products",
      {
        headers: { "x-revalidate-secret": SECRET },
        method: "GET",
      },
    );
    const res = await GET(req);
    expect(res.status).toBe(200);
    const data = await res.json();
    expect(data.tags).toEqual(["shopify-products"]);
    expect(revalidateTag).toHaveBeenCalledWith("shopify-products", { expire: 0 });
  });

  it("revalidate theo product handle qua JSON body", async () => {
    const req = new Request("https://maison-rocheval.test/api/revalidate", {
      body: JSON.stringify({ handle: "kaluga" }),
      headers: {
        authorization: `Bearer ${SECRET}`,
        "content-type": "application/json",
      },
      method: "POST",
    });
    const res = await POST(req);
    expect(res.status).toBe(200);
    const data = await res.json();
    expect(data.tags).toEqual(["shopify-products", "shopify-product-kaluga"]);
    expect(revalidateTag).toHaveBeenCalledWith("shopify-products", { expire: 0 });
    expect(revalidateTag).toHaveBeenCalledWith("shopify-product-kaluga", { expire: 0 });
  });

  it("từ chối (503) khi không có secret nào được cấu hình — không dùng default", async () => {
    delete process.env.REVALIDATE_SECRET_TOKEN;
    delete process.env.SHOPIFY_ADMIN_CLIENT_SECRET;

    const req = new Request("https://maison-rocheval.test/api/revalidate", {
      headers: { authorization: "Bearer maison-rocheval-revalidate-secret" },
      method: "POST",
    });
    const res = await POST(req);

    expect(res.status).toBe(503);
    expect(revalidateTag).not.toHaveBeenCalled();
  });

  it("không chấp nhận secret qua query string (tránh rò rỉ vào access log)", async () => {
    const req = new Request(
      `https://maison-rocheval.test/api/revalidate?secret=${SECRET}`,
      { method: "GET" },
    );
    const res = await GET(req);

    expect(res.status).toBe(401);
    expect(revalidateTag).not.toHaveBeenCalled();
  });
});
