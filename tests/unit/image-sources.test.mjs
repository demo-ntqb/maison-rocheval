import assert from "node:assert/strict";
import test from "node:test";

import { buildPictureSources } from "../../src/shared/lib/image.ts";

test("buildPictureSources tạo đúng thứ tự định dạng từ base path", () => {
  assert.deepEqual(buildPictureSources("/images/home/hero", "jpg"), {
    avif: "/images/home/hero.avif",
    webp: "/images/home/hero.webp",
    fallback: "/images/home/hero.jpg",
  });
});

test("buildPictureSources chuẩn hóa path đã có extension", () => {
  assert.deepEqual(buildPictureSources("/images/home/story-table.PNG", "png"), {
    avif: "/images/home/story-table.avif",
    webp: "/images/home/story-table.webp",
    fallback: "/images/home/story-table.png",
  });
});
