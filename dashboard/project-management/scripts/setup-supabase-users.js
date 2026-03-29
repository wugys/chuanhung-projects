#!/usr/bin/env node
/**
 * Supabase 帳號設定腳本
 * 用於在 Supabase 專案中建立銓宏國際的 4 個使用者帳號
 * 
 * 使用方法：
 * 1. 在 Supabase Dashboard 取得 SERVICE_ROLE_KEY
 * 2. 設定環境變數：export SUPABASE_SERVICE_KEY=your_key
 * 3. 執行：node setup-supabase-users.js
 */

const SUPABASE_URL = 'https://djvyozmdenvzlbyieyss.supabase.co';

// 要建立的帳號列表
const USERS = [
    {
        email: 'wugys@chuanhung.local',
        password: '0403',
        user_metadata: {
            name: 'Kevin',
            role: 'admin'
        }
    },
    {
        email: 'zizi@chuanhung.local',
        password: 'zizi123',
        user_metadata: {
            name: '姿姿',
            role: 'manager'
        }
    },
    {
        email: 'mia@chuanhung.local',
        password: 'mia123',
        user_metadata: {
            name: 'Mia',
            role: 'staff'
        }
    },
    {
        email: 'betty@chuanhung.local',
        password: 'betty123',
        user_metadata: {
            name: 'Betty',
            role: 'staff'
        }
    }
];

async function createUsers() {
    const serviceKey = process.env.SUPABASE_SERVICE_KEY;
    
    if (!serviceKey) {
        console.error('❌ 錯誤：請設定 SUPABASE_SERVICE_KEY 環境變數');
        console.log('\n取得方式：');
        console.log('1. 登入 https://supabase.com/dashboard');
        console.log('2. 進入專案 djvyozmdenvzlbyieyss');
        console.log('3. Project Settings → API → service_role key (注意：這是私密金鑰，請勿外洩)');
        console.log('\n執行：');
        console.log('export SUPABASE_SERVICE_KEY=your_service_role_key');
        console.log('node setup-supabase-users.js');
        process.exit(1);
    }

    console.log('🚀 開始建立 Supabase 帳號...\n');

    for (const user of USERS) {
        try {
            const response = await fetch(`${SUPABASE_URL}/auth/v1/admin/users`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${serviceKey}`,
                    'Content-Type': 'application/json',
                    'apikey': serviceKey
                },
                body: JSON.stringify({
                    email: user.email,
                    password: user.password,
                    email_confirm: true,  // 自動驗證 email
                    user_metadata: user.user_metadata
                })
            });

            if (response.ok) {
                const data = await response.json();
                console.log(`✅ ${user.user_metadata.name} (${user.email}) - 建立成功`);
                console.log(`   UUID: ${data.id}`);
                console.log(`   角色: ${user.user_metadata.role}\n`);
            } else {
                const error = await response.json();
                if (error.message?.includes('already been registered')) {
                    console.log(`⚠️  ${user.user_metadata.name} (${user.email}) - 帳號已存在，跳過\n`);
                } else {
                    console.error(`❌ ${user.user_metadata.name} (${user.email}) - 建立失敗:`, error.message);
                }
            }
        } catch (error) {
            console.error(`❌ ${user.user_metadata.name} - 錯誤:`, error.message);
        }
    }

    console.log('\n📋 帳號清單摘要：');
    console.log('===================');
    USERS.forEach(user => {
        console.log(`${user.user_metadata.name}:`);
        console.log(`  登入帳號: ${user.email.replace('@chuanhung.local', '')}`);
        console.log(`  密碼: ${user.password}`);
        console.log(`  角色: ${user.user_metadata.role}\n`);
    });
    
    console.log('✨ 完成！');
}

// 執行
createUsers().catch(console.error);
