// Supabase Auth 整合模組 - 用於專案管理系統
// 取代舊的 modules/auth.js，提供真正的後端驗證

const SUPABASE_URL = 'https://djvyozmdenvzlbyieyss.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRqdnlvem1kZW52emxieWlleXNzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzQxMTA1ODcsImV4cCI6MjA4OTY4NjU4N30.xc33MXQmbNph4EcFHwNbmai3dXDanIj2VKStJ6Xy2Tg';

// 角色定義
const ROLES = {
    ADMIN: 'admin',
    MANAGER: 'manager',
    STAFF: 'staff'
};

// 權限對照表
const ROLE_PERMISSIONS = {
    [ROLES.ADMIN]: ['read', 'write', 'delete', 'admin'],
    [ROLES.MANAGER]: ['read', 'write'],
    [ROLES.STAFF]: ['read', 'write']
};

// 使用者資訊對照表（用於顯示名稱對應）
const USER_PROFILES = {
    'wugys@chuanhung.local': { name: 'Kevin', role: ROLES.ADMIN },
    'zizi@chuanhung.local': { name: '姿姿', role: ROLES.MANAGER },
    'mia@chuanhung.local': { name: 'Mia', role: ROLES.STAFF },
    'betty@chuanhung.local': { name: 'Betty', role: ROLES.STAFF }
};

class SupabaseAuth {
    constructor() {
        this.client = null;
        this.currentUser = null;
        this.initialized = false;
    }

    // 初始化 Supabase 客戶端
    async init() {
        if (this.initialized) {
            console.log('✅ Supabase Auth 已初始化 (cached)');
            return true;
        }

        console.log('🔄 初始化 Supabase Auth...');
        console.log('🔍 window.supabase:', typeof window.supabase);

        if (!window.supabase) {
            console.error('❌ Supabase library not loaded');
            return false;
        }

        try {
            this.client = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
            this.initialized = true;
            console.log('✅ Supabase Auth 已初始化');
            console.log('🔍 client:', this.client ? 'created' : 'null');

            // 檢查現有會話
            await this.checkSession();
            return true;
        } catch (error) {
            console.error('❌ Supabase 初始化失敗:', error);
            return false;
        }
    }

    // 檢查目前會話
    async checkSession() {
        if (!this.client) return false;

        try {
            const { data: { session }, error } = await this.client.auth.getSession();
            
            if (error) {
                console.error('❌ 檢查會話失敗:', error);
                return false;
            }

            if (session) {
                this.setCurrentUser(session.user);
                console.log('✅ 已恢復登入狀態:', this.currentUser.name);
                return true;
            }

            return false;
        } catch (error) {
            console.error('❌ 檢查會話錯誤:', error);
            return false;
        }
    }

    // 登入（使用 username，自動轉換為 email）
    async login(username, password) {
        if (!this.client) {
            await this.init();
        }

        // 將 username 轉換為 email 格式
        const email = this.usernameToEmail(username);

        try {
            const { data, error } = await this.client.auth.signInWithPassword({
                email: email,
                password: password
            });

            if (error) {
                console.error('❌ 登入失敗:', error);
                return { success: false, error: this.getErrorMessage(error) };
            }

            this.setCurrentUser(data.user);
            console.log('✅ 登入成功:', this.currentUser.name);
            
            return { 
                success: true, 
                user: this.currentUser,
                session: data.session
            };
        } catch (error) {
            console.error('❌ 登入錯誤:', error);
            return { success: false, error: '登入過程發生錯誤' };
        }
    }

    // 登出
    async logout() {
        if (!this.client) return;

        try {
            await this.client.auth.signOut();
            this.currentUser = null;
            console.log('👋 已登出');
        } catch (error) {
            console.error('❌ 登出錯誤:', error);
        }
    }

    // 檢查是否已登入
    isLoggedIn() {
        return this.currentUser !== null;
    }

    // 檢查權限
    hasPermission(permission) {
        if (!this.isLoggedIn()) return false;
        return this.currentUser.permissions.includes(permission);
    }

    // 檢查角色
    hasRole(role) {
        if (!this.isLoggedIn()) return false;
        
        const roleHierarchy = [ROLES.STAFF, ROLES.MANAGER, ROLES.ADMIN];
        const userLevel = roleHierarchy.indexOf(this.currentUser.role);
        const requiredLevel = roleHierarchy.indexOf(role);
        
        return userLevel >= requiredLevel;
    }

    // 取得目前使用者
    getCurrentUser() {
        return this.currentUser;
    }

    // 設定目前使用者（從 Supabase user 物件）
    setCurrentUser(supabaseUser) {
        const email = supabaseUser.email;
        const profile = USER_PROFILES[email] || { name: email, role: ROLES.STAFF };
        
        this.currentUser = {
            id: supabaseUser.id,
            email: email,
            username: this.emailToUsername(email),
            name: supabaseUser.user_metadata?.name || profile.name,
            role: supabaseUser.user_metadata?.role || profile.role,
            permissions: ROLE_PERMISSIONS[profile.role] || ROLE_PERMISSIONS[ROLES.STAFF]
        };
    }

    // username 轉 email
    usernameToEmail(username) {
        // 如果已經是 email，直接返回
        if (username.includes('@')) return username;
        return `${username}@chuanhung.local`;
    }

    // email 轉 username
    emailToUsername(email) {
        return email.replace('@chuanhung.local', '');
    }

    // 錯誤訊息轉換
    getErrorMessage(error) {
        const message = error.message || '';
        
        if (message.includes('Invalid login')) {
            return '帳號或密碼錯誤';
        } else if (message.includes('Email not confirmed')) {
            return '帳號尚未驗證';
        } else if (message.includes('Too many requests')) {
            return '登入嘗試次數過多，請稍後再試';
        }
        
        return '登入失敗，請稍後再試';
    }

    // 監聽認證狀態變化
    onAuthStateChange(callback) {
        if (!this.client) return;
        
        this.client.auth.onAuthStateChange((event, session) => {
            if (event === 'SIGNED_IN' && session) {
                this.setCurrentUser(session.user);
            } else if (event === 'SIGNED_OUT') {
                this.currentUser = null;
            }
            
            callback(event, this.currentUser);
        });
    }

    // 要求登入（未登入時導向登入頁面）
    requireLogin() {
        if (!this.isLoggedIn()) {
            const currentUrl = encodeURIComponent(window.location.href);
            window.location.href = `../login.html?return=${currentUrl}`;
            return false;
        }
        return true;
    }

    // 要求權限
    requirePermission(permission) {
        if (!this.isLoggedIn()) {
            this.requireLogin();
            return false;
        }
        
        if (!this.hasPermission(permission)) {
            alert('您沒有權限執行此操作');
            return false;
        }
        
        return true;
    }
}

// 建立全域實例
const SupabaseAuthInstance = new SupabaseAuth();

// 綁定到 window
window.SupabaseAuth = SupabaseAuthInstance;
window.ROLES = ROLES;

// 相容舊版 Auth API
window.Auth = {
    init: () => SupabaseAuthInstance.init(),
    login: (username, password) => SupabaseAuthInstance.login(username, password),
    logout: () => SupabaseAuthInstance.logout(),
    isLoggedIn: () => SupabaseAuthInstance.isLoggedIn(),
    hasPermission: (permission) => SupabaseAuthInstance.hasPermission(permission),
    getCurrentUser: () => SupabaseAuthInstance.getCurrentUser(),
    requireLogin: () => SupabaseAuthInstance.requireLogin(),
    requirePermission: (permission) => SupabaseAuthInstance.requirePermission(permission)
};

// 自動初始化
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => SupabaseAuthInstance.init());
} else {
    SupabaseAuthInstance.init();
}
