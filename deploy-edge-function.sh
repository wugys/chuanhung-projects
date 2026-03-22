#!/bin/bash

# 部署 Supabase Edge Function 腳本
# 使用 Service Role Key

PROJECT_REF="djvyozmdenvzlbyieyss"
SERVICE_ROLE_KEY="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRqdnlvem1kZW52emxieWlleXNzIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3NDExMDU4NywiZXhwIjoyMDg5Njg2NTg3fQ.dyg0lZM78rOXAPunTBq1TXYQNpVTEZgWkIJwHkwt500"
FUNCTION_NAME="ai-progress-analyzer"

echo "🚀 正在部署 Edge Function: $FUNCTION_NAME..."

# 嘗試安裝 Supabase CLI
if ! command -v supabase &> /dev/null; then
    echo "📦 安裝 Supabase CLI..."
    curl -fsSL https://github.com/supabase/cli/releases/latest/download/supabase_linux_amd64.tar.gz | tar -xzv -C /tmp
    sudo mv /tmp/supabase /usr/local/bin/ 2>/dev/null || mv /tmp/supabase ~/.local/bin/ 2>/dev/null || export PATH="$PATH:/tmp"
fi

# 使用 Service Role Key 登入
echo "🔑 設定認證..."
export SUPABASE_ACCESS_TOKEN="$SERVICE_ROLE_KEY"

# 部署函數
echo "📤 部署中..."
supabase functions deploy "$FUNCTION_NAME" --project-ref "$PROJECT_REF"

# 設定環境變數
echo "🔐 設定環境變數..."
supabase secrets set KIMI_API_KEY="sk-yWwS2oNkubpo89CUnBnguFjRidDHrpKbiqXbSYuK01RwqQEv" --project-ref "$PROJECT_REF"

echo "✅ 部署完成！"
