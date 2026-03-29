/**
 * 銓宏國際 - 登入與權限管理模組
 * 帳號：wugys / 密碼：0403
 */

const Auth = (function() {
    'use strict';
    
    // 設定
    const CONFIG = {
        storageKey: 'chuanhung_auth_v1',
        sessionDuration: 8 * 60 * 60 * 1000, // 8小時過期
        adminAccount: {
            username: 'wugys',
            password: '0403', // 實際應用應使用 hash
            name: 'Kevin',
            role: 'admin',
            permissions: ['read', 'write', 'delete', 'admin']
        }
    };
    
    // 目前登入狀態
    let currentSession = null;
    
    /**
     * 初始化認證系統
     */
    function init() {
        // 嘗試從 LocalStorage 恢復 session
        const saved = localStorage.getItem(CONFIG.storageKey);
        if (saved) {
            try {
                const session = JSON.parse(saved);
                if (validateSession(session)) {
                    currentSession = session;
                    updateUIForLoggedInUser();
                    console.log('✅ 已恢復登入狀態:', session.user.name);
                } else {
                    // Session 過期，清除
                    logout();
                }
            } catch (e) {
                console.error('讀取登入狀態失敗:', e);
                logout();
            }
        }
        
        // 綁定登入表單事件
        bindLoginEvents();
    }
    
    /**
     * 驗證 session 是否有效
     */
    function validateSession(session) {
        if (!session || !session.user || !session.expiresAt) {
            return false;
        }
        return Date.now() < session.expiresAt;
    }
    
    /**
     * 登入
     */
    function login(username, password) {
        // 驗證帳號密碼
        if (username === CONFIG.adminAccount.username && 
            password === CONFIG.adminAccount.password) {
            
            // 建立 session
            currentSession = {
                user: {
                    username: CONFIG.adminAccount.username,
                    name: CONFIG.adminAccount.name,
                    role: CONFIG.adminAccount.role,
                    permissions: CONFIG.adminAccount.permissions
                },
                loginAt: Date.now(),
                expiresAt: Date.now() + CONFIG.sessionDuration
            };
            
            // 儲存到 LocalStorage
            localStorage.setItem(CONFIG.storageKey, JSON.stringify(currentSession));
            
            console.log('✅ 登入成功:', currentSession.user.name);
            updateUIForLoggedInUser();
            
            return { success: true, user: currentSession.user };
        }
        
        return { success: false, error: '帳號或密碼錯誤' };
    }
    
    /**
     * 登出
     */
    function logout() {
        currentSession = null;
        localStorage.removeItem(CONFIG.storageKey);
        updateUIForLoggedOutUser();
        console.log('👋 已登出');
    }
    
    /**
     * 檢查是否已登入
     */
    function isLoggedIn() {
        if (!currentSession) return false;
        
        // 檢查是否過期
        if (Date.now() > currentSession.expiresAt) {
            logout();
            return false;
        }
        
        return true;
    }
    
    /**
     * 檢查權限
     */
    function hasPermission(permission) {
        if (!isLoggedIn()) return false;
        return currentSession.user.permissions.includes(permission);
    }
    
    /**
     * 取得目前使用者
     */
    function getCurrentUser() {
        return isLoggedIn() ? currentSession.user : null;
    }
    
    /**
     * 更新登入後的 UI
     */
    function updateUIForLoggedInUser() {
        const user = getCurrentUser();
        if (!user) return;
        
        // 更新使用者名稱顯示
        const userDisplay = document.getElementById('current-user-name');
        if (userDisplay) {
            userDisplay.textContent = user.name;
            userDisplay.classList.remove('guest');
            userDisplay.classList.add('logged-in');
        }
        
        // 顯示登出按鈕
        const logoutBtn = document.getElementById('btn-logout');
        if (logoutBtn) {
            logoutBtn.style.display = 'inline-block';
        }
        
        // 隱藏登入表單
        const loginForm = document.getElementById('login-modal');
        if (loginForm) {
            loginForm.style.display = 'none';
        }
        
        // 啟用需要權限的功能
        enableRestrictedFeatures();
        
        // 觸發登入事件
        window.dispatchEvent(new CustomEvent('auth:login', { detail: user }));
    }
    
    /**
     * 更新登出後的 UI
     */
    function updateUIForLoggedOutUser() {
        // 更新使用者名稱顯示
        const userDisplay = document.getElementById('current-user-name');
        if (userDisplay) {
            userDisplay.textContent = '訪客';
            userDisplay.classList.remove('logged-in');
            userDisplay.classList.add('guest');
        }
        
        // 隱藏登出按鈕
        const logoutBtn = document.getElementById('btn-logout');
        if (logoutBtn) {
            logoutBtn.style.display = 'none';
        }
        
        // 顯示登入表單
        const loginForm = document.getElementById('login-modal');
        if (loginForm) {
            loginForm.style.display = 'flex';
        }
        
        // 禁用需要權限的功能
        disableRestrictedFeatures();
        
        // 觸發登出事件
        window.dispatchEvent(new CustomEvent('auth:logout'));
    }
    
    /**
     * 綁定登入事件
     */
    function bindLoginEvents() {
        // 登入表單提交
        const loginForm = document.getElementById('login-form');
        if (loginForm) {
            loginForm.addEventListener('submit', function(e) {
                e.preventDefault();
                
                const username = document.getElementById('login-username').value.trim();
                const password = document.getElementById('login-password').value;
                
                const result = login(username, password);
                
                if (result.success) {
                    showLoginMessage('✅ 登入成功！', 'success');
                    setTimeout(() => {
                        document.getElementById('login-modal').style.display = 'none';
                    }, 500);
                } else {
                    showLoginMessage('❌ ' + result.error, 'error');
                }
            });
        }
        
        // 登出按鈕
        const logoutBtn = document.getElementById('btn-logout');
        if (logoutBtn) {
            logoutBtn.addEventListener('click', logout);
        }
        
        // 顯示登入 modal 按鈕
        const showLoginBtn = document.getElementById('btn-show-login');
        if (showLoginBtn) {
            showLoginBtn.addEventListener('click', function() {
                document.getElementById('login-modal').style.display = 'flex';
            });
        }
    }
    
    /**
     * 顯示登入訊息
     */
    function showLoginMessage(message, type) {
        const msgEl = document.getElementById('login-message');
        if (msgEl) {
            msgEl.textContent = message;
            msgEl.className = 'login-message ' + type;
            msgEl.style.display = 'block';
            
            setTimeout(() => {
                msgEl.style.display = 'none';
            }, 3000);
        }
    }
    
    /**
     * 啟用受限制功能
     */
    function enableRestrictedFeatures() {
        document.querySelectorAll('[data-require-login]').forEach(el => {
            el.disabled = false;
            el.classList.remove('disabled');
        });
        
        document.querySelectorAll('[data-require-admin]').forEach(el => {
            if (getCurrentUser()?.role === 'admin') {
                el.disabled = false;
                el.classList.remove('disabled');
            }
        });
    }
    
    /**
     * 禁用受限制功能
     */
    function disableRestrictedFeatures() {
        document.querySelectorAll('[data-require-login], [data-require-admin]').forEach(el => {
            el.disabled = true;
            el.classList.add('disabled');
        });
    }
    
    // 公開 API
    return {
        init,
        login,
        logout,
        isLoggedIn,
        hasPermission,
        getCurrentUser
    };
})();

// 綁定到全域 window 物件
window.Auth = Auth;

// 自動初始化（如果 DOM 已準備好）
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', Auth.init);
} else {
    Auth.init();
}
