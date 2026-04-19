# monoboards

**語言：** [English](README.md) · 繁體中文（本文件）

純靜態、離線的專案管理看板：開瀏覽器即可使用，資料只存在本機 **localStorage**，無後端、無套件依賴。

## 功能摘要

- 專案卡片看板（拖曳排序）
- Todo：新增、勾選、編輯、刪除
- 即時進度條與完成率
- Markdown 匯出（單一專案或全部）
- 響應式版面（桌面與行動裝置）
- 介面語言：繁體中文、簡體中文、English（依瀏覽器語系自動偵測，可手動切換並記住偏好）

## 技術棧

| 項目 | 說明 |
|------|------|
| 前端 | HTML5、CSS3、Vanilla JavaScript (ES6+) |
| 儲存 | `localStorage`（鍵名 `kanban-v2`）；語言偏好 `monoboards-lang` |
| 字型 | [Inter](https://fonts.google.com/specimen/Inter)（Google Fonts CDN） |
| 依賴 | 零 |

## 目錄結構

```
monoboards/
├── index.html       主應用（單檔，內嵌樣式與腳本）
├── privacy.html     隱私權政策
├── terms.html       使用條款
├── README.md        英文說明（預設）
├── README.zh-TW.md  繁體中文說明（本文件）
└── _MANIFEST.md     較完整的內部說明與約束
```

## 使用方式

1. 以瀏覽器直接開啟根目錄的 `index.html` 即可。
2. 若需本機預覽（避免部分環境對 `file://` 的限制），可選用：

```bash
python3 -m http.server 8080
# 或
npx serve .
```

## 資料與備份

- 資料僅存在本機瀏覽器，**不會**上傳至任何伺服器。
- 清除網站資料或換瀏覽器／裝置可能遺失內容；請定期使用應用內的 **匯出 Markdown** 備份。

## 安全提醒

**請勿在 monoboards 中儲存密碼、API 金鑰、私鑰或任何敏感個人資料。**

所有資料皆以**明文**儲存於瀏覽器的 `localStorage`。任何能實際接觸你裝置的人，或裝置上的惡意程式，都能直接讀取這些資料。請僅將 monoboards 用於一般任務與專案管理。

## 聯絡

- Email: [info@pixelart.tech](mailto:info@pixelart.tech)

## 授權

本專案以 [GNU Affero General Public License v3.0](LICENSE) 授權。

更多實作細節與已知限制見 [`_MANIFEST.md`](_MANIFEST.md)。
