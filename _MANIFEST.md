# monoboards

> 純靜態離線項目管理工具。開瀏覽器就能用，數據存在本地，零伺服器、零依賴。

---

## 技術棧

- **語言**: HTML5 + CSS3 + Vanilla JavaScript (ES6+)
- **存儲**: localStorage (完全離線，不上傳任何數據)
- **字體**: Inter (Google Fonts CDN)
- **依賴**: 零

## 目錄結構

```
monoboards/
├── index.html         │  主應用（單文件，全部功能）
├── privacy.html       │  隱私協議
├── terms.html         │  使用協議
├── README.md          │  倉庫說明（英文，預設）
├── README.zh-TW.md    │  倉庫說明（繁體中文）
└── _MANIFEST.md       │  本文件
```

## 核心功能

- ✅ 項目卡片看板（拖曳排序）
- ✅ Todo 清單（新增 / 勾選 / 編輯 / 刪除）
- ✅ 實時進度條與完成率計算
- ✅ 數據持久化（localStorage，鍵名 `kanban-v2`）
- ✅ Markdown 導出（單項目 / 全部）
- ✅ 響應式設計（桌面 + 移動端）
- ✅ 多語言界面（繁體中文 / 簡體中文 / English）

## 多語言說明

- **自動檢測**：根據瀏覽器 `navigator.language` 自動選擇語言
  - `zh-TW` / `zh-HK` → 繁體中文
  - `zh-CN` / `zh-SG` → 簡體中文
  - `en`* → English
  - 其他 → 繁體中文（默認）
- **手動切換**：每頁 Header 右上角提供語言下拉選單
- **偏好記憶**：手動選擇的語言存入 `localStorage`（鍵名 `monoboards-lang`）
- **覆蓋範圍**：三頁（index / privacy / terms）全部支持，包括 Markdown 導出內容

## 運行方式

打開 `index.html` 即可。任何現代瀏覽器均可運行。

```bash
# 本地預覽（可選）
python3 -m http.server 8080
# 或
npx serve .
```

## 數據存儲說明

- 所有數據僅保存在瀏覽器 **localStorage** 中
- 不上傳至任何伺服器
- 清除瀏覽器數據將導致數據丟失
- 可通過「導出 Markdown」功能手動備份

## 已知約束

- 單文件架構：CSS 和 JS 內聯在 HTML 中，不拆分
- 無後端：不支援多用戶協作
- 無雲同步：換設備需手動導出/導入（目前僅支援導出）

## 授權條款

本專案採用 [GNU Affero General Public License v3.0](LICENSE) 授權。

## 聯繫方式

- Email: [info@pixelart.tech](mailto:info@pixelart.tech)

