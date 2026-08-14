# Migration: bỏ `caviar_species`

## Mục tiêu

Scientific name và species description thuộc trực tiếp từng Shopify Product:

- `rocheval.species_scientific_name`: `single_line_text_field`
- `rocheval.species_description`: `multi_line_text_field`

`pearl_size`, `pearl_colour` và `tasting_notes` tiếp tục là Product metafields và
thay thế các field `grain`, `colour`, `taste` trùng lặp trước đây. Common name lấy
từ Product title nên không cần một field species riêng.

## Compatibility window

1. Deploy code provisioning có hai definitions mới nhưng chưa chạy cleanup.
2. Chạy `yarn shopify:provision:plan`, sau đó `apply` và `verify`.
3. Xác minh các Product metafields mới có base locale và EN/FR translations.
4. Deploy storefront đọc direct Product metafields.
5. Smoke test Home, Products, About Product và Product Detail ở cả EN/FR.
6. Chỉ sau khi storefront mới ổn định mới chạy cleanup legacy.

Trong window này, `rocheval.species` và `caviar_species` cũ vẫn tồn tại nên phiên
bản storefront cũ tiếp tục hoạt động. Provisioner không tự động xóa chúng.

## Cleanup

Dry-run:

```bash
yarn shopify:migrate:remove-caviar-species:plan
```

Plan chỉ thành công khi full legacy definition schema, exact bốn legacy entry
handles, direct Product values và EN/FR translations đều sẵn sàng. Output in một
confirmation token gắn với exact store domain và definition ID.

Apply sau khi đã xác minh deploy mới:

```bash
yarn shopify:migrate:remove-caviar-species:apply \
  --confirm="<store>:<definition-id>" \
  --backup="./caviar-species-backup.json"
```

Cleanup command chỉ chấp nhận type `caviar_species` có đúng name, display key,
access, capabilities và sáu field definitions với exact names/types/required
flags. Definition phải chứa đúng bốn legacy handles, không có entry lạ. Command
còn xác minh hai definitions mới có `PUBLIC_READ` Storefront access, cả 5 managed
products có scientific name/species description không rỗng và locale không phải
primary có translation hiện hành. Nếu một precondition hoặc confirmation không
đạt, command dừng trước mutation. Trước khi xóa, command ghi full definition,
legacy metaobject fields và non-primary translations vào một JSON backup mới;
file đã tồn tại không bị ghi đè. Xóa definition là thao tác destructive và Shopify
đồng thời dọn các entries, metafield definition/reference liên quan.

## Rollback

Trước cleanup, rollback bằng cách deploy storefront cũ vì legacy reference vẫn
còn. Sau cleanup, rollback code phải tiếp tục đọc direct Product metafields; muốn
khôi phục metaobject model cần provision lại definition, entries, translations và
references từ một migration riêng.
