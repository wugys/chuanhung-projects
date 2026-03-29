#!/usr/bin/env node
/**
 * Supabase 連線診斷腳本
 */

const SUPABASE_URL = 'https://djvyozmdenvzlbyieyss.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRqdnlvem1kZW52emxieWlleXNzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzQxMTA1ODcsImV4cCI6MjA4OTY4NjU4N30.xc33MXQmbNph4EcFHwNbmai3dXDanIj2VKStJ6Xy2Tg';

async function diagnose() {
    console.log('🔍 Supabase 連線診斷\n');
    console.log('URL:', SUPABASE_URL);
    console.log('');

    // 1. 測試專案健康狀態
    console.log('1️⃣ 測試專案健康狀態...');
    try {
        const healthResponse = await fetch(`${SUPABASE_URL}/rest/v1/`, {
            method: 'HEAD',
            headers: {
                'apikey': SUPABASE_ANON_KEY
            }
        });
        console.log('   狀態:', healthResponse.status);
        console.log('   ✅ REST API 可連線\n');
    } catch (error) {
        console.log('   ❌ REST API 連線失敗:', error.message, '\n');
    }

    // 2. 測試認證端點
    console.log('2️⃣ 測試認證端點...');
    try {
        const authResponse = await fetch(`${SUPABASE_URL}/auth/v1/settings`, {
            headers: {
                'apikey': SUPABASE_ANON_KEY
            }
        });
        const authData = await authResponse.json();
        console.log('   狀態:', authResponse.status);
        console.log('   設定:', JSON.stringify(authData, null, 2).substring(0, 200));
        console.log('   ✅ Auth API 可連線\n');
    } catch (error) {
        console.log('   ❌ Auth API 連線失敗:', error.message, '\n');
    }

    // 3. 測試登入（使用已建立的帳號）
    console.log('3️⃣ 測試登入 wugys@chuanhung.local...');
    try {
        const loginResponse = await fetch(`${SUPABASE_URL}/auth/v1/token?grant_type=password`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'apikey': SUPABASE_ANON_KEY
            },
            body: JSON.stringify({
                email: 'wugys@chuanhung.local',
                password: '0403'
            })
        });
        
        const loginData = await loginResponse.json();
        console.log('   狀態:', loginResponse.status);
        
        if (loginResponse.ok) {
            console.log('   ✅ 登入成功!');
            console.log('   使用者:', loginData.user.email);
            console.log('   角色:', loginData.user.user_metadata?.role);
        } else {
            console.log('   ❌ 登入失敗:', loginData.message || loginData.error_description);
            console.log('   詳細:', JSON.stringify(loginData, null, 2));
        }
    } catch (error) {
        console.log('   ❌ 登入請求失敗:', error.message);
    }

    console.log('\n✨ 診斷完成');
}

diagnose().catch(console.error);
