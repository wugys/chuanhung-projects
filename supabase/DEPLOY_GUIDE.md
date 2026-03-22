# AI 進度分析 Edge Function 部署說明

## 部署方式一：使用 Supabase CLI（推薦）

### 步驟 1: 安裝 Supabase CLI
```bash
# macOS
brew install supabase/tap/supabase

# Windows
scoop bucket add supabase https://github.com/supabase/scoop-bucket.git
scoop install supabase

# 或使用 npm
npm install -g supabase
```

### 步驟 2: 登入 Supabase
```bash
supabase login
```

### 步驟 3: 連結專案
```bash
cd /path/to/chuanhung-projects
supabase link --project-ref djvyozmdenvzlbyieyss
```

### 步驟 4: 部署 Edge Function
```bash
supabase functions deploy ai-progress-analyzer
```

### 步驟 5: 設定環境變數
```bash
supabase secrets set KIMI_API_KEY=sk-yWwS2oNkubpo89CUnBnguFjRidDHrpKbiqXbSYuK01RwqQEv
```

---

## 部署方式二：手動在 Dashboard 設定

### 步驟 1: 建立 Edge Function
1. 登入 Supabase Dashboard: https://app.supabase.com
2. 選擇專案 `chuanhung-auth`
3. 左側選單 → **Edge Functions**
4. 點擊 **New Function**
5. 名稱輸入: `ai-progress-analyzer`
6. 複製 `supabase/functions/ai-progress-analyzer/index.ts` 的程式碼貼入

### 步驟 2: 設定環境變數
1. 在 Edge Function 頁面點擊 **Secrets**
2. 新增 Secret:
   - Name: `KIMI_API_KEY`
   - Value: `sk-yWwS2oNkubpo89CUnBnguFjRidDHrpKbiqXXbSYuK01RwqQEv`
3. 點擊 **Save**

### 步驟 3: 部署
1. 點擊 **Deploy**
2. 等待部署完成（約 30 秒）

---

## 測試 Edge Function

部署完成後，可以透過以下方式測試：

```javascript
// 在瀏覽器 Console 測試
const { data, error } = await supabase.functions.invoke('ai-progress-analyzer', {
  body: {
    description: "客戶已確認設計，預計週五出貨",
    projectContext: { name: "NFC 鑰匙圈", currentPhase: "sampling" }
  }
});

console.log(data);
```

預期回應:
```json
{
  "progress": 80,
  "phase": "sampling",
  "deadline": "",
  "notes": "設計已確認，準備出貨"
}
```

---

## 檔案位置

- Edge Function 程式碼: `supabase/functions/ai-progress-analyzer/index.ts`
- 設定檔: `supabase/config.toml`
- 前端呼叫: `dashboard/project-management/app.js` 中的 `callAIWithEdgeFunction()`

---

## 故障排除

### 問題 1: CORS 錯誤
**症狀**: 瀏覽器 Console 顯示 CORS 錯誤
**解決**: Edge Function 已包含 CORS headers，確認部署成功

### 問題 2: API Key 錯誤
**症狀**: 回應顯示 "KIMI_API_KEY 未設定"
**解決**: 確認 Secret 已正確設定並重新部署

### 問題 3: AI 回應解析失敗
**症狀**: 回應格式錯誤
**解決**: 檢查 Kimi API 狀態，Edge Function 會自動降級到本地分析

---

**部署完成後，前端 AI 填入功能將自動使用真正的 AI 分析！**
