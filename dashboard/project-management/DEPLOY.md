# 專案管理系統部署指南

## 自動部署流程（已設定）

### GitHub Actions 自動部署

**觸發條件**：
- Push 到 `main` 分支且修改了 `dashboard/**` 或 `.github/workflows/deploy.yml`
- 手動觸發（GitHub 頁面 → Actions → Deploy to GitHub Pages → Run workflow）

**執行流程**：
1. 檢查連結正確性（禁止 `project-dashboard-web`，確認回主系統連結）
2. 自動同步 `dashboard/` 到 `gh-pages` 分支
3. 提交並推送
4. 驗證部署狀態

### 本地提交前檢查（建議）

```bash
# 執行連結檢查
./scripts/check-links.sh

# 如果通過，正常提交
git add .
git commit -m "你的提交訊息"
git push origin main
```

## 正確連結規範

| 用途 | 正確連結 | 錯誤連結 |
|------|---------|---------|
| 回主系統 | `../index.html` | `../dashboard/index.html` |
| 專案管理 | `project-management/` | `project-dashboard-web/` |
| 登入頁面 | `../login.html` | 其他 |

## 部署狀態檢查

訪問以下連結確認部署成功：
- 🔗 https://wugys.github.io/chuanhung-projects/dashboard/project-management/

清除快取重新載入：
- Windows: `Ctrl + Shift + R`
- Mac: `Cmd + Shift + R`

## 故障排除

### GitHub Actions 未自動部署

1. 前往 https://github.com/wugys/chuanhung-projects/actions
2. 確認 workflow 已啟用（Repository → Settings → Actions → General）
3. 手動觸發：點擊 "Deploy to GitHub Pages" → "Run workflow"

### 連結檢查失敗

執行 `./scripts/check-links.sh` 查看詳細錯誤訊息。

常見問題：
- ❌ `project-dashboard-web` 殘留 → 改為 `dashboard/project-management/`
- ❌ `../dashboard/index.html` → 改為 `../index.html`

## 歷史記錄

- **2026-03-23**: 建立 GitHub Actions 自動部署（方案 A）
- **2026-03-23**: 建立連結檢查腳本
- **2026-03-21**: 修復 gh-pages 與 main 不同步問題
