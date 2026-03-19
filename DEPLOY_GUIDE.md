# 🚀 部署步驟 - 提案系統上線

## ✅ 第1步：部署到 GitHub Pages（今天完成）

### 方式A：直接上傳（推薦，2分鐘完成）

1. **開啟 GitHub 網頁**
   ```
   前往：https://github.com/wugys/chuanhung-projects
   ```

2. **建立 gh-pages 分支**
   ```
   點擊 branch: master ▼
   輸入：gh-pages
   點擊 Create branch: gh-pages
   ```

3. **上傳檔案**
   ```
   點擊 Add file ▼ > Upload files
   把 gh-pages/ 目錄內的 5 個檔案全部拖曳上傳：
   - index.html（主要網頁）
   - QUICK_START.md
   - README.md  
   - SYSTEM_PLAN.md
   - schema.sql
   
   Commit message: "Deploy proposal system v1.0"
   點擊 Commit changes
   ```

4. **啟用 GitHub Pages**
   ```
   前往：https://github.com/wugys/chuanhung-projects/settings/pages
   Source 選擇：Deploy from a branch
   Branch 選擇：gh-pages / (root)
   點擊 Save
   ```

5. **等待生效**
   ```
   等待 2-5 分鐘
   重新整理頁面，會看到網址：
   https://wugys.github.io/chuanhung-projects/
   ```

### 方式B：使用 Git 指令（如果你有 GitHub 權限）

```bash
# 在本地執行
cd /root/.openclaw/workspace/gh-pages

git init
git remote add origin https://github.com/wugys/chuanhung-projects.git
git checkout -b gh-pages
git add .
git commit -m "Deploy proposal system v1.0"
git push origin gh-pages --force
```

---

## ✅ 第2步：連接 Supabase 資料庫（明天）

### 2.1 建立 Supabase 帳號

1. 前往 https://supabase.com
2. 點擊 Start your project
3. 用 GitHub 帳號登入
4. 建立新專案：
   - Name: chuanhung-proposal
   - Database Password: （設定強密碼）
   - Region: Singapore (最接近台灣)

### 2.2 建立資料表

1. 進入專案後，點擊左側 SQL Editor
2. 點擊 New query
3. 複製以下內容貼上：

```sql
-- 建立產品表
CREATE TABLE products (
    id SERIAL PRIMARY KEY,
    project_id VARCHAR(20) NOT NULL,
    rank VARCHAR(10) NOT NULL,
    name VARCHAR(200) NOT NULL,
    type VARCHAR(100),
    cost_range VARCHAR(50),
    quote_range VARCHAR(50),
    margin VARCHAR(20),
    specs TEXT,
    features TEXT,
    reason TEXT,
    supplier VARCHAR(200),
    lead_time VARCHAR(50),
    audience TEXT[],
    created_at TIMESTAMP DEFAULT NOW()
);

-- 插入 A0015 產品資料
INSERT INTO products (project_id, rank, name, type, cost_range, quote_range, margin, specs, features, reason, supplier, lead_time, audience) VALUES
('A0015-260320', 'A', '全彩印刷鋁箔保溫便當袋', '保溫袋/便當袋', 'RMB 3.2-3.8', 'RMB 4.8-5.2', '25-30%', '21×15×22cm / 12安帆布+3mm鋁箔珍珠棉 / 雙面全彩印刷', '360°全彩印刷外層，鋁箔內襯保溫保冷3-4小時', '符合受眾對「大印刷面積」需求，可完整呈現IP角色', '本道紙塑-陳先生', '25-30天', ARRAY['動漫族群', '年輕女性']),
('A0015-260320', 'B', '全彩印花厚磅帆布托特包', '帆布袋/托特包', 'RMB 3.5-4.2', 'RMB 5.5-6.5', '30-35%', '35×12×28cm / 12安帆布 / 正面全彩+背面單色', '正面大面積全彩印刷（28×20cm印刷面）', '最大印刷面積，最適合呈現IP角色完整形象', '本道紙塑-陳先生', '20-25天', ARRAY['動漫族群']),
('A0015-260320', 'C', '全彩束口袋組合-大+小', '束口袋/收納袋', 'RMB 3.0-3.5', 'RMB 5.0-6.0', '35-40%', '大袋20×25cm + 小袋12×15cm / 8安帆布', '雙袋皆可全彩印刷，組合價值感高', '一組兩個=雙倍印刷面積呈現IP，滿足蒐藏欲', '本道紙塑-陳先生', '20-25天', ARRAY['年輕女性', '動漫族群']),
('A0015-260320', 'D', '全彩保冷飲料提袋', '保冷袋/飲料提袋', 'RMB 2.5-3.0', 'RMB 4.0-4.8', '35-40%', '底10×10cm，高18cm / 潛水布或帆布+鋁箔', '全彩印刷外層，鋁箔內襯保冷2-3小時', '台灣手搖飲文化=使用頻率極高=品牌曝光度極高', '1688溫州工廠', '20-25天', ARRAY['年輕女性']),
('A0015-260320', 'E', '全彩餐具收納包', '收納包/餐具袋', 'RMB 2.8-3.3', 'RMB 4.5-5.0', '35-40%', '25×8cm（展開）/ 8安帆布+內裡滌綸', '全彩印刷捲軸式設計，內含餐具固定格層', 'ESG趨勢+環保餐具風潮=話題性', '本道紙塑-陳先生', '20-25天', ARRAY['年輕女性']);
```

4. 點擊 Run 執行

### 2.3 獲取 API 金鑰

1. 點擊左側 Project Settings > API
2. 複製以下資訊：
   - URL: `https://xxxxxx.supabase.co`
   - anon public: `eyJ...`（很長的字串）

3. 將這些資訊給 Eva，我會更新網頁加入動態載入功能

---

## ✅ 第3步：建立管理後台（本週）

管理後台功能：
- 提案列表（查看所有進行中提案）
- 客戶回饋追蹤（誰標記了哪些品項）
- 產品庫管理（新增/編輯產品）
- 數據報表（熱門品項排行）

這部分需要等 Supabase 建立完成後，我會再幫你建立 admin.html

---

## 📋 檢查清單

### 今天完成：
- [ ] GitHub Pages 部署完成
- [ ] 測試網址可以正常開啟
- [ ] 手機版顯示正常
- [ ] 發送網址給 Rebecca

### 明天完成：
- [ ] Supabase 帳號建立
- [ ] 資料表建立完成
- [ ] API 金鑰設定給 Eva

### 本週完成：
- [ ] 管理後台建立
- [ ] 第二個提案範本（企業禮贈）

---

## 🌐 部署後網址

預計網址：`https://wugys.github.io/chuanhung-projects/`

你可以在這個網址後面加上子路徑管理不同提案：
- `/proposal-A0015/` - 易集一番賞提案
- `/proposal-A0016/` - 下一個客戶提案

---

**需要我協助哪個步驟？** 例如：
- 幫你準備要上傳的 zip 檔
- 遠端協助設定 Supabase
- 建立其他視覺風格的網頁
