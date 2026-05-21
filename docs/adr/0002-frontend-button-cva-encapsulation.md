# ADR 0002: 前端按鈕原子化與 CVA 封裝決策

## Context (背景)

Laravel Breeze 預設生成的鷹架包含多個功能單一且代碼冗餘的按鈕元件（PrimaryButton, SecondaryButton, DangerButton），導致樣式分散且難以維護。同時，在動態組合 Tailwind 類別時常因 CSS 宣告順序導致樣式覆蓋失效。我們需要一個輕量、高主導權且能完美契合 Inertia.js 路由與防重複點擊（loading）的解決方案。

## Decision (決定)

拒絕引入龐大的第三方 UI 框架（如完整版 shadcn/ui），改用 `class-variance-authority (CVA)` + `tailwind-merge` + `clsx` 自研封裝核心 `<Button />` 元件，並建立全域樣式裁決工具 `Utils/cn.js`。

## Status (狀態)

已執行 (Executed) - 2026-05-19

## Consequences (後果)

- **好處**：成功消滅 3 個冗餘元件，達成專案「減法原則」與「代碼即文件」精神；前端第一線具備物理阻斷連點能力（loading 狀態自動禁用）；完美相容 Inertia Link。
- **副作用**：全域重構時需人工清查並替換 Breeze 既有視圖，存在表單提交行為（type="submit"）與雙重 Link 嵌套的重構風險。
