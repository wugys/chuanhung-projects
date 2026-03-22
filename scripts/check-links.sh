#!/bin/bash
# 連結檢查腳本 - 在提交前執行

echo "🔍 檢查專案管理系統連結正確性..."

ERRORS=0

# 檢查 1: 禁止 project-dashboard-web 連結
echo "📋 檢查是否有舊版錯誤連結..."
if grep -r "project-dashboard-web" dashboard/project-management/ 2>/dev/null; then
    echo "❌ 錯誤：發現 project-dashboard-web 連結"
    echo "   請改為: dashboard/project-management/"
    ERRORS=$((ERRORS + 1))
else
    echo "✅ 無舊版錯誤連結"
fi

# 檢查 2: 回主系統連結必須正確
echo "📋 檢查『回主系統』連結..."
INCORRECT=$(grep -rn "\.\./dashboard/index\.html" dashboard/project-management/*.html 2>/dev/null || true)
if [ -n "$INCORRECT" ]; then
    echo "❌ 錯誤：『回主系統』連結不正確"
    echo "   問題檔案:"
    echo "$INCORRECT" | sed 's/^/   /'
    echo "   應該改為: ../index.html"
    ERRORS=$((ERRORS + 1))
else
    echo "✅ 『回主系統』連結正確"
fi

# 檢查 3: app.js 行數檢查（避免部署不完全）
echo "📋 檢查 app.js 完整性..."
if [ -f "dashboard/project-management/app.js" ]; then
    LINES=$(wc -l < dashboard/project-management/app.js)
    if [ "$LINES" -lt 500 ]; then
        echo "⚠️ 警告: app.js 只有 $LINES 行，可能不完整"
        echo "   正常應該有 1500+ 行"
    else
        echo "✅ app.js 完整 ($LINES 行)"
    fi
fi

# 檢查 4: 確認關鍵函數存在
echo "📋 檢查關鍵功能函數..."
MISSING_FUNC=""
for func in "renderTodoList" "showProjectTodo" "toggleHideCompleted" "toggleShowOverdueOnly"; do
    if ! grep -q "function $func" dashboard/project-management/app.js 2>/dev/null; then
        MISSING_FUNC="$MISSING_FUNC $func"
    fi
done

if [ -n "$MISSING_FUNC" ]; then
    echo "❌ 錯誤：缺少關鍵函數:$MISSING_FUNC"
    ERRORS=$((ERRORS + 1))
else
    echo "✅ 關鍵函數存在"
fi

# 總結
echo ""
if [ $ERRORS -eq 0 ]; then
    echo "🎉 所有檢查通過！可以安全提交。"
    exit 0
else
    echo "❌ 發現 $ERRORS 個問題，請修正後再提交。"
    exit 1
fi
