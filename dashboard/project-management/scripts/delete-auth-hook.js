#!/usr/bin/env node
/**
 * 刪除 Supabase 有問題的 Auth Hook
 */

const SUPABASE_URL = 'https://djvyozmdenvzlbyieyss.supabase.co';
const SERVICE_KEY = process.env.SUPABASE_SERVICE_KEY;

async function deleteAuthHook() {
    if (!SERVICE_KEY) {
        console.error('❌ 請設定 SUPABASE_SERVICE_KEY 環境變數');
        process.exit(1);
    }

    console.log('🗑️  正在刪除有問題的 Auth Hook...\n');

    // 使用 Supabase REST API 執行 SQL
    // 注意：需要啟用 pg_execute 權限
    try {
        // 方法 1：透過 REST API 執行 SQL
        const sqlQuery = `
            DO $$
            BEGIN
                -- 刪除 hook 函數
                DROP FUNCTION IF EXISTS public.custom_access_token_hook();
                
                -- 或者如果 hook 是用其他方式設定的，嘗試清理 auth.hooks
                -- 這部分可能需要直接在 Dashboard 操作
            END $$;
        `;

        const response = await fetch(`${SUPABASE_URL}/rest/v1/rpc/execute_sql`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${SERVICE_KEY}`,
                'Content-Type': 'application/json',
                'apikey': SERVICE_KEY
            },
            body: JSON.stringify({
                query: sqlQuery
            })
        });

        if (response.ok) {
            console.log('✅ Hook 刪除成功（如果存在）');
        } else {
            const error = await response.text();
            console.log('⚠️  透過 API 刪除失敗:', error);
            console.log('\n💡 建議手動在 Dashboard 刪除：');
            console.log('   1. https://supabase.com/dashboard/project/djvyozmdenvzlbyieyss');
            console.log('   2. Authentication → Hooks');
            console.log('   3. 刪除 custom_access_token_hook');
        }

    } catch (error) {
        console.error('❌ 錯誤:', error.message);
    }

    // 測試登入
    console.log('\n🔄 測試登入...');
    try {
        const loginResponse = await fetch(`${SUPABASE_URL}/auth/v1/token?grant_type=password`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'apikey': 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRqdnlvem1kZW52emxieWlleXNzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzQxMTA1ODcsImV4cCI6MjA4OTY4NjU4N30.xc33MXQmbNph4EcFHwNbmai3dXDanIj2VKStJ6Xy2Tg'
            },
            body: JSON.stringify({
                email: 'wugys@chuanhung.local',
                password: '0403'
            })
        });

        const loginData = await loginResponse.json();

        if (loginResponse.ok) {
            console.log('✅ 登入測試成功！問題已解決');
            console.log('👤 使用者:', loginData.user.email);
        } else {
            console.log('❌ 登入仍然失敗:', loginData.msg || loginData.message);
            console.log('\n💡 需要手動刪除 Hook：');
            console.log('   https://supabase.com/dashboard/project/djvyozmdenvzlbyieyss');
            console.log('   Authentication → Hooks');
        }
    } catch (error) {
        console.error('❌ 測試登入錯誤:', error.message);
    }
}

deleteAuthHook().catch(console.error);
