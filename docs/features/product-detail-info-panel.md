# F05: Product Detail Info Panel UI Update

## Problem

Product Detail Info Panel hiện tại lệch design so với Figma wireframe (node `3:11741`). Cụ thể:
1. **Packaging selector** dùng radio button text-only thay vì card layout với packaging thumbnail images
2. **Summary block** hiển thị dạng card + product image thay vì text-only format đúng Figma
3. **Packaging data** (descriptions, prices) chưa khớp Figma

## Scope

### IN
- Cập nhật **Packaging Selector** thành card layout: thumbnail (54×54px) + tên uppercase + mô tả + giá bên phải — selected state = border dày hơn
- Cập nhật **Summary Block** thành text-only format: "{PACKAGING} BOX OF {perBox}" + "{perBox} X {size} {productName} per box" + conditional "Personalized message included"
- Cập nhật **packaging data** khớp Figma: Standard = "Paper bag with ice" (FREE), Premium = "Quality cardboard box with Bolduc ribbon." (+$32), Luxury = "Premium wooden box with Bolduc ribbon." (+$74)
- Đảm bảo accessibility: `role="radiogroup"`, `aria-checked`, keyboard navigation

### OUT
- Packaging thumbnail images (dùng placeholder — tạo ảnh thật là task riêng)
- Price calculation logic changes (giữ nguyên formula hiện tại)
- Gallery/Image component changes (đã verified trong F04)
- Mobile-specific layout refinements (sẽ làm trong pass riêng)

## Observable Acceptance Criteria

1. Packaging cards hiển thị dạng vertical stack với thumbnail, tên, mô tả, giá
2. Card được chọn có border 1px `#000`, card không chọn có border 0.5px `#bcbcbc`
3. Summary block hiển thị format text-only: "{PACKAGING_NAME} BOX OF {perBox}" trên dòng 1
4. Summary dòng 2: "{perBox} X {size} {productName} per box"
5. Khi packaging ≥ Premium: hiện "Personalized message included" (màu muted)
6. Data packaging khớp Figma: Standard/FREE, Premium/+$32, Luxury/+$74
7. `yarn build` pass, `yarn lint` clean

## Metrics

- name: f05_visual_fidelity
  baseline: unknown
  target: unknown
  source: proposed
  status: awaiting_approval
  measurement_required: true

## Affected Modules

- `src/screens/product-detail/components/product-detail-info.tsx` — main UI changes
- `src/screens/product-detail/constants/product-detail.constant.ts` — packaging data update
- `messages/en.json` + `messages/fr.json` — new i18n keys for summary format

## Test Plan

- BDD: Gherkin scenarios covering packaging card rendering, selection state, summary text format
- Build verification: `yarn build` + `yarn lint` pass
