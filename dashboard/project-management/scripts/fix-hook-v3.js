#!/usr/bin/env node
/**
 * 嘗試透過 Supabase Management API 或 Auth Admin API 解決 Hook 問題
 */

const SUPABASE_URL = 'https://djvyozmdenvzlbyieyss.supabase.co';
const SERVICE_KEY = process.env.SUPABASE_SERVICE_KEY;

async function fixHook() {
    if (!SERVICE_KEY) {
        console.error('❌ 請設定 SUPABASE_SERVICE_KEY');
        process.exit(1);
    }

    console.log('🔧 嘗試修復 Auth Hook 問題...\n');

    // 方法 1: 嘗試直接刪除函數（使用 pgrest 的 raw 查詢）
    console.log('方法 1: 透過 REST API 執行 SQL...');
    try {
        // 嘗試呼叫 postgres 函數
        const response = await fetch(`${SUPABASE_URL}/rest/v1/`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${SERVICE_KEY}`,
                'Content-Type': 'application/json',
                'apikey': SERVICE_KEY,
                'Prefer': 'params=single-object'
            },
            body: JSON.stringify({
                query: "DROP FUNCTION IF EXISTS public.custom_access_token_hook()"
            })
        });
        console.log('狀態:', response.status);
        console.log('回應:', await response.text());
    } catch (e) {
        console.log('失敗:', e.message);
    }

    // 方法 2: 檢查 Config
    console.log('\n方法 2: 檢查專案設定...');
    try {
        const configResponse = await fetch(`${SUPABASE_URL}/auth/v1/settings`, {
            headers: {
                'Authorization': `Bearer ${SERVICE_KEY}`,
                'apikey': SERVICE_KEY
            }
        });
        const config = await configResponse.json();
        console.log('設定:', JSON.stringify(config, null, 2));
    } catch (e) {
        console.log('無法取得設定:', e.message);
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
            console.log('✅ 登入成功！');
        } else {
            console.log('❌ 仍然失敗:', loginData.msg || loginData.message);
            
            if (loginData.msg?.includes('hook')) {
                console.log('\n🔴 確認是 Hook 問題');
                console.log('\n👉 請在 Supabase Dashboard 操作：');
                console.log('1. 左側選單 → SQL Editor');
                console.log('2. 新建 Query');
                console.log('3. 貼上：DROP FUNCTION IF EXISTS public.custom_access_token_hook();');
                console.log('4. 點擊 Run');
                console.log('5. 重新測試登入');
            }
        }
    } catch (error) {
        console.error('❌ 測試錯誤:', error.message);
    }
}

fixHook().catch(console.error);
