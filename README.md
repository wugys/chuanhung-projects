# 銓宏國際 產品提案系統

專業的 B2B 產品提案網頁系統，適合向客戶展示多個產品選項。

## 🚀 快速開始

### 1. 本地預覽

```bash
# 直接在瀏覽器開啟
open dashboard/proposal-system/index.html

# 或使用本地伺服器
cd dashboard/proposal-system
python3 -m http.server 8080
# 然後訪問 http://localhost:8080
```

### 2. 部署到 GitHub Pages

```bash
# 確保檔案已提交
git add dashboard/proposal-system/
git commit -m "Add proposal system"
git push

# 在 GitHub 設定中啟用 Pages（Settings > Pages > Source）
```

### 3. 連接 Supabase 資料庫

1. 在 [Supabase](https://supabase.com) 建立專案
2. 執行 `schema.sql` 建立資料表
3. 複製 API URL 和 Anon Key
4. 修改 `index.html` 中的 Supabase 配置：

```javascript
// 在 <script> 標籤中添加
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'YOUR_SUPABASE_URL'
const supabaseKey = 'YOUR_SUPABASE_ANON_KEY'
const supabase = createClient(supabaseUrl, supabaseKey)
```

## 📁 檔案結構

```
dashboard/proposal-system/
├── index.html          # 主要網頁（含 CSS + JavaScript）
├── schema.sql          # Supabase 資料庫結構
├── README.md           # 本說明文件
└── assets/             # 靜態資源（可選）
    ├── images/         # 產品圖片
    └── docs/           # 說明文件
```

## ✨ 功能特色

| 功能 | 說明 |
|-----|------|
| 📱 響應式設計 | 支援桌面、平板、手機瀏覽 |
| 🎨 專業 UI | 產品型錄質感，適合 B2B 客戶 |
| 📝 完整資訊 | 每個產品顯示7項關鍵資訊 |
| ❤️ 標記功能 | 客戶可標記感興趣的品項 |
| 📊 比較表格 | 一覽所有品項的規格比較 |
| 💾 資料持久化 | 支援 localStorage 和 Supabase |
| 📄 PDF 匯出 | 一鍵列印/匯出 PDF |

## 🎯 使用流程

### 建立新提案

1. **複製 `index.html`**
   ```bash
   cp index.html proposal-A0016.html
   ```

2. **修改產品資料**
   - 編輯檔案中的 `products` 陣列
   - 更新專案編號、客戶資訊
   - 填入產品詳細資料

3. **部署**
   - 上傳到 GitHub Pages
   - 或發送 HTML 檔案給客戶

### 資料格式

```javascript
const products = [
    {
        id: 1,
        type: "產品類型",
        name: "產品名稱",
        price: "參考單價",
        specs: "產品規格",
        features: "產品特色",
        reason: "為何選這個",
        supplier: "手中對象",
        quote: "報價建議",
        margin: "毛利率",
        leadTime: "交期",
        rating: "推薦指數"
    }
];
```

## 📊 資料庫結構

### products 表
- 儲存所有產品提案資訊
- 支援多專案（以 project_id 區分）

### customer_feedback 表
- 儲存客戶回饋
- 記錄感興趣的產品 ID

### projects 表
- 儲存專案基本資訊
- 客戶名稱、數量、成本目標等

## 🔧 進階配置

### 自訂顏色

在 `index.html` 的 CSS `:root` 中修改：

```css
:root {
    --primary: #1a365d;      /* 主色 */
    --primary-light: #2c5282; /* 淺主色 */
    --secondary: #ed8936;     /* 強調色 */
    --accent: #38a169;        /* 成功色 */
}
```

### 添加產品圖片

在產品卡片中加入圖片：

```javascript
// 在 product-card 中加入
<div class="product-image">
    <img src="assets/images/product-1.jpg" alt="${product.name}">
</div>
```

### 啟用 Supabase 同步

1. 安裝 Supabase 客戶端：
   ```html
   <script src="https://unpkg.com/@supabase/supabase-js@2"></script>
   ```

2. 初始化連接：
   ```javascript
   const supabase = supabase.createClient(SUPABASE_URL, SUPABASE_KEY)
   ```

3. 載入資料：
   ```javascript
   async function loadFromDatabase() {
       const { data, error } = await supabase
           .from('products')
           .select('*')
           .eq('project_id', 'A0015-260320')
       
       if (data) products = data
   }
   ```

## 📱 畫面預覽

### 桌面版
- 雙欄/三欄產品卡片佈局
- 完整資訊顯示
- 側邊比較表格

### 手機版
- 單欄產品卡片
- 折疊式比較表格
- 觸控友善的按鈕

## 📝 版本紀錄

| 版本 | 日期 | 更新內容 |
|-----|------|---------|
| v1.0 | 2026-03-20 | 初始版本，基本功能完成 |

## 🆘 常見問題

**Q: 如何新增更多產品？**
A: 編輯 `products` 陣列，複製現有物件並修改內容。

**Q: 如何修改公司資訊？**
A: 編輯 `<header>` 和 `<footer>` 區塊的內容。

**Q: 客戶標記的資料儲存在哪？**
A: 預設使用 localStorage，重新整理頁面後仍會保留。

**Q: 如何連接真實資料庫？**
A: 參考「連接 Supabase 資料庫」章節，建立專案並執行 schema.sql。

---

**製作**：銓宏國際 - Eva 助理  
**更新日期**：2026-03-20
