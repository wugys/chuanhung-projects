// 銓宏國際 - 認證與權限管理模組
// 使用 Supabase Auth + JWT + Custom Claims

// Supabase 配置
const SUPABASE_URL = 'https://djvyozmdenvzlbyieyss.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRqdnlvem1kZW52emxieWlleXNzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzQxMTA1ODcsImV4cCI6MjA4OTY4NjU4N30.xc33MXQmbNph4EcFHwNbmai3dXDanIj2VKStJ6Xy2Tg';

// 初始化 Supabase 客戶端
let supabaseClient = null;

// 角色定義
const ROLES = {
    ADMIN: 'admin',           // 超級管理員
    SALES: 'sales',           // 業務
    ACCOUNTING: 'accounting', // 會計
    DESIGN: 'design',         // 設計
    GUEST: 'guest'            // 客戶/供應商
};

// 權限定義
const PERMISSIONS = {
    // 專案管理
    PROJECT_VIEW: 'project.view',
    PROJECT_CREATE: 'project.create',
    PROJECT_EDIT: 'project.edit',
    PROJECT_DELETE: 'project.delete',
    
    // 報價系統
    QUOTE_VIEW: 'quote.view',
    QUOTE_CREATE: 'quote.create',
    QUOTE_EDIT: 'quote.edit',
    
    // 設計中心
    DESIGN_VIEW: 'design.view',
    DESIGN_UPLOAD: 'design.upload',
    
    // KPI 儀表
    KPI_VIEW: 'kpi.view',
    
    // 系統設定
    SETTINGS_VIEW: 'settings.view',
    SETTINGS_EDIT: 'settings.edit'
};

// 角色權限對照表
const ROLE_PERMISSIONS = {
    [ROLES.ADMIN]: Object.values(PERMISSIONS), // 管理員有全部權限
    
    [ROLES.SALES]: [
        PERMISSIONS.PROJECT_VIEW,
        PERMISSIONS.PROJECT_CREATE,
        PERMISSIONS.PROJECT_EDIT,
        PERMISSIONS.QUOTE_VIEW,
        PERMISSIONS.QUOTE_CREATE,
        PERMISSIONS.QUOTE_EDIT,
        PERMISSIONS.DESIGN_VIEW
    ],
    
    [ROLES.ACCOUNTING]: [
        PERMISSIONS.QUOTE_VIEW,
        PERMISSIONS.KPI_VIEW
    ],
    
    [ROLES.DESIGN]: [
        PERMISSIONS.DESIGN_VIEW,
        PERMISSIONS.DESIGN_UPLOAD,
        PERMISSIONS.PROJECT_VIEW
    ],
    
    [ROLES.GUEST]: [
        PERMISSIONS.PROJECT_VIEW
    ]
};

// 初始化認證模組
async function initAuth() {
    if (!window.supabase) {
        console.error('Supabase library not loaded');
        return false;
    }
    
    supabaseClient = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
    
    // 檢查當前會話
    const { data: { session } } = await supabaseClient.auth.getSession();
    
    if (!session) {
        // 未登入，導向登入頁面（如果不是在登入頁面）
        if (!window.location.pathname.includes('login.html')) {
            window.location.href = 'login.html';
        }
        return false;
    }
    
    // 儲存使用者資訊到全域
    window.currentUser = {
        id: session.user.id,
        email: session.user.email,
        role: session.user.user_metadata?.role || ROLES.GUEST,
        name: session.user.user_metadata?.name || session.user.email
    };
    
    // 設定權限檢查函數到全域
    window.checkPermission = checkPermission;
    window.checkRole = checkRole;
    window.logout = logout;
    
    // 更新 UI 顯示使用者資訊
    updateUserUI();
    
    // 根據角色顯示/隱藏功能
    applyRoleBasedUI();
    
    return true;
}

// 檢查是否有特定權限
function checkPermission(permission) {
    if (!window.currentUser) return false;
    
    const userRole = window.currentUser.role;
    const permissions = ROLE_PERMISSIONS[userRole] || [];
    
    return permissions.includes(permission);
}

// 檢查是否為特定角色（或更高權限）
function checkRole(role) {
    if (!window.currentUser) return false;
    
    const userRole = window.currentUser.role;
    const roleHierarchy = [ROLES.GUEST, ROLES.DESIGN, ROLES.ACCOUNTING, ROLES.SALES, ROLES.ADMIN];
    
    const userLevel = roleHierarchy.indexOf(userRole);
    const requiredLevel = roleHierarchy.indexOf(role);
    
    return userLevel >= requiredLevel;
}

// 登出
async function logout() {
    if (supabaseClient) {
        await supabaseClient.auth.signOut();
    }
    window.location.href = 'login.html';
}

// 更新 UI 顯示使用者資訊
function updateUserUI() {
    const userInfoElements = document.querySelectorAll('.user-info');
    userInfoElements.forEach(el => {
        el.innerHTML = `
            <span class="user-role">${getRoleDisplayName(window.currentUser?.role)}</span>
            <span class="user-name">${window.currentUser?.name || ''}</span>
            <button onclick="logout()" class="btn-logout">登出</button>
        `;
    });
}

// 取得角色顯示名稱
function getRoleDisplayName(role) {
    const roleNames = {
        [ROLES.ADMIN]: '👑 管理員',
        [ROLES.SALES]: '💼 業務',
        [ROLES.ACCOUNTING]: '📊 會計',
        [ROLES.DESIGN]: '🎨 設計',
        [ROLES.GUEST]: '👤 訪客'
    };
    return roleNames[role] || role;
}

// 根據角色應用 UI 調整
function applyRoleBasedUI() {
    const role = window.currentUser?.role;
    
    if (!role) return;
    
    // 隱藏無權限的功能按鈕
    document.querySelectorAll('[data-permission]').forEach(el => {
        const requiredPermission = el.dataset.permission;
        if (!checkPermission(requiredPermission)) {
            el.style.display = 'none';
        }
    });
    
    // 隱藏無權限的導航項目
    document.querySelectorAll('[data-role]').forEach(el => {
        const requiredRole = el.dataset.role;
        if (!checkRole(requiredRole)) {
            el.style.display = 'none';
        }
    });
}

// 保護需要特定權限的函數
function requirePermission(permission, callback) {
    return function(...args) {
        if (!checkPermission(permission)) {
            alert('您沒有權限執行此操作');
            return;
        }
        return callback.apply(this, args);
    };
}

// 保護需要特定角色的函數
function requireRole(role, callback) {
    return function(...args) {
        if (!checkRole(role)) {
            alert('您沒有權限執行此操作');
            return;
        }
        return callback.apply(this, args);
    };
}

// 監聽認證狀態變化
function setupAuthListener() {
    if (!supabaseClient) return;
    
    supabaseClient.auth.onAuthStateChange((event, session) => {
        if (event === 'SIGNED_OUT') {
            window.location.href = 'login.html';
        } else if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED') {
            window.currentUser = {
                id: session.user.id,
                email: session.user.email,
                role: session.user.user_metadata?.role || ROLES.GUEST,
                name: session.user.user_metadata?.name || session.user.email
            };
        }
    });
}

// 頁面載入時初始化
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initAuth);
} else {
    initAuth();
}

// 導出模組（供其他腳本使用）
window.AuthModule = {
    ROLES,
    PERMISSIONS,
    checkPermission,
    checkRole,
    logout,
    requirePermission,
    requireRole,
    getRoleDisplayName
};
