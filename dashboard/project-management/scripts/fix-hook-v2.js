#!/usr/bin/env node
/**
 * 透過 Supabase REST API 執行 SQL 刪除 Hook
 */

const SUPABASE_URL = 'https://djvyozmdenvzlbyieyss.supabase.co';
const SERVICE_KEY = process.env.SUPABASE_SERVICE_KEY;

async function executeSQL() {
    if (!SERVICE_KEY) {
        console.error('❌ 請設定 SUPABASE_SERVICE_KEY');
        process.exit(1);
    }

    console.log('🗑️  嘗試刪除 custom_access_token_hook...\n');

    // SQL 查詢：刪除函數
    const dropFunctionSQL = `DROP FUNCTION IF EXISTS public.custom_access_token_hook()`;

    try {
        // 使用 Supabase 的 pg 函數執行 SQL
        const response = await fetch(`${SUPABASE_URL}/rest/v1/rpc/exec_sql`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${SERVICE_KEY}`,
                'Content-Type': 'application/json',
                'apikey': SERVICE_KEY
            },
            body: JSON.stringify({
                sql: dropFunctionSQL
            })
        });

        console.log('回應狀態:', response.status);
        const result = await response.text();
        console.log('回應內容:', result);

    } catch (error) {
        console.log('⚠️  exec_sql 失敗:', error.message);
    }

    // 嘗試另一種方式：直接查詢 pg_proc 確認函數存在
    console.log('\n🔍 檢查函數是否存在...');
    try {
        const checkResponse = await fetch(`${SUPABASE_URL}/rest/v1/rpc/check_function`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${SERVICE_KEY}`,
                'Content-Type': 'application/json',
                'apikey': SERVICE_KEY
            },
            body: JSON.stringify({
                func_name: 'custom_access_token_hook'
            })
        });
        console.log('檢查結果:', await checkResponse.text());
    } catch (e) {
        console.log('無法檢查');
    }

    // 最終測試登入
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
            console.log('✅ 登入成功！問題已解決');
        } else {
            console.log('❌ 仍然失敗:', loginData.msg || loginData.message);
            console.log('\n💡 請直接在 SQL Editor 執行：');
            console.log('DROP FUNCTION IF EXISTS public.custom_access_token_hook();');
        }
    } catch (error) {
        console.error('❌ 測試錯誤:', error.message);
    }
}

executeSQL().catch(console.error);
