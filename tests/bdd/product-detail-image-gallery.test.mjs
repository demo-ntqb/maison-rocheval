import assert from "node:assert/strict";
import { execFileSync } from "node:child_process";
import { readFile } from "node:fs/promises";
import test from "node:test";

const repoRoot = new URL("../../", import.meta.url);

async function readSource(path) {
  if (process.env.SOURCE_REF) {
    return execFileSync("git", ["show", `${process.env.SOURCE_REF}:${path}`], {
      cwd: repoRoot,
      encoding: "utf8",
    });
  }

  return readFile(new URL(path, repoRoot), "utf8");
}

test("Gallery ảnh chi tiết sản phẩm tích hợp shadcn Carousel và các nút điều hướng", async () => {
  const gallerySource = await readSource("src/screens/product-detail/components/product-detail-image-gallery.tsx");

  assert.match(gallerySource, /Carousel/);
  assert.match(gallerySource, /CarouselContent/);
  assert.match(gallerySource, /CarouselItem/);
  assert.match(gallerySource, /CarouselPrevious/);
  assert.match(gallerySource, /CarouselNext/);
  assert.match(gallerySource, /CarouselApi/);
});

test("Gallery ảnh chi tiết sản phẩm hiển thị bộ đếm ảnh và phản hồi thumbnail click", async () => {
  const gallerySource = await readSource("src/screens/product-detail/components/product-detail-image-gallery.tsx");

  assert.match(gallerySource, /api\.scrollTo/);
  assert.match(gallerySource, /api\.on\("select"/);
  assert.match(gallerySource, /\{activeIndex \+ 1\}\s*\/\s*\{count\}/); // bộ đếm ảnh dạng X / Y
});

test("Gallery ảnh chi tiết sản phẩm lắng nghe sự kiện thay đổi variant và hỗ trợ Dialog Zoom", async () => {
  const gallerySource = await readSource("src/screens/product-detail/components/product-detail-image-gallery.tsx");

  assert.match(gallerySource, /product-variant-changed/); // custom event name
  assert.match(gallerySource, /Dialog/);
  assert.match(gallerySource, /DialogContent/);
  assert.match(gallerySource, /motion/); // framer-motion/motion animation
});

test("Trang thông tin sản phẩm phát đi sự kiện khi thay đổi kích thước hoặc bao bì", async () => {
  const infoSource = await readSource("src/screens/product-detail/components/product-detail-info.tsx");

  assert.match(infoSource, /product-variant-changed/);
});
