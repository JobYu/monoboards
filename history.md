# 變更紀錄（History）

本檔案記錄 **monoboards** 的功能優化與迭代；新條目請加在**最上方**，並附上日期與簡要說明（必要時可對應 git commit）。

---

## 2026-04-19 — 結構：CSS / i18n 自 index.html 分離

- 新增 **`app.css`**：原內聯樣式改為外部樣式表，`index.html` 以 `<link rel="stylesheet" href="app.css">` 引用。
- 新增 **`i18n.js`**：`I18N`、`detectLang`、`t()`、`setLang` 等介面文案與語言相關邏輯。
- 新增 **`app.js`**：看板狀態、`localStorage`、渲染與匯出等其餘腳本；載入順序為 `i18n.js` → `app.js`（`setLang` 內會呼叫 `render()`）。
- **`index.html`** 僅保留結構與第三方字型連結；部署時須與上述三檔同路徑可存取。

## 2026-04-19 — 待辦：每條支援子清單

- 每筆主待辦下可新增**子項目**（勾選、編輯、刪除、Enter 送出）；子項完成後同樣自動排到該組**最底**。
- 專案進度條與頂部統計改為計入「主項 + 所有子項」；匯出 Markdown 為巢狀清單（子行兩格縮排）。
- 舊資料載入時自動補上 `children: []`，無需手動遷移。

## 2026-04-19 — 待辦清單：已完成項目自動置底

- 勾選完成後，該筆待辦會自動移到該專案清單**最底部**；取消完成則回到「未完成」區塊末端（仍位於所有已完成項目之上）。
- 新增待辦時會重新排序，新項目維持在未完成區、不會落在已完成項目之下。
- 從 `localStorage` 載入資料時會一併正規化順序，舊資料畫面與匯出 Markdown 順序一致。

## 2026-04-19 — 文件：README 安全提示（`7de0977`）

- 英文／繁中 README 補充：**勿**在瀏覽器 `localStorage` 存放密碼、API 金鑰等敏感資訊。

## 2026-04-19 — 文件：雙語 README 與互連（`25addf3`）

- 預設 **`README.md`** 為英文；新增 **`README.zh-TW.md`** 保留繁體說明。
- 兩份文件頂部互相連結；`_MANIFEST.md` 目錄結構同步更新。

## 2026-04-19 — 倉庫：首次發佈至 GitHub（`3060363`）

- 初始化專案追蹤：`.gitignore`、`README.md`、`_MANIFEST.md`、主應用與法律頁（`index.html`、`privacy.html`、`terms.html`）。
- 遠端：`https://github.com/JobYu/monoboards`；與 GitHub 既有 `main` 歷史 rebase 後合併。

## 2026-04-19 — GitHub：Initial commit（`822ba1d`）

- 建立遠端倉庫時的初始提交（含 **AGPL-3.0** `LICENSE` 等）。

---

## 既有能力（初版即具備，供對照）

以下為上線／開源前的核心範圍，之後迭代多在此之上疊加：

- 純靜態看板：入口 `index.html` + `app.css` + `i18n.js` + `app.js`（迭代後由單檔拆分而來），資料僅存 **`localStorage`**（鍵名 `kanban-v2`）。
- 專案卡片、拖曳排序、Todo CRUD、進度條、Markdown 匯出、響應式版面、介面多語言（繁／簡／英）。

---

### 維護者備註：如何新增一筆紀錄

1. 在本檔「最上方」`---` 之下新增一個 `## YYYY-MM-DD — 標題` 區塊。
2. 用條列寫行為或使用者可感知的變化；若有 git commit，可附短 hash。
3. 部署至 **https://monoboards.app/** 後，可選擇在條目註記「已上線」與大致時間。
