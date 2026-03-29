/**
 * 銓宏國際專案管理系統 v2.0
 * 模組化重構版本 - 主入口檔案
 * 
 * 使用方式：
 * 1. 在 index.html 中引入各模組
 * 2. 系統會自動初始化
 * 
 * 模組依賴順序：
 * 1. utils.js (工具函數)
 * 2. data-validator.js (資料驗證)
 * 3. storage.js (儲存操作)
 * 4. auth.js (登入權限)
 * 5. project-manager.js (專案管理)
 * 6. ui-renderer.js (界面渲染)
 * 7. app.js (主入口 - 本檔案)
 */

// 主要資料
let projects = [];
let clientsDB = [];

// 系統初始化
(function initSystem() {
    'use strict';
    
    console.log('🏢 銓宏國際專案管理系統 v2.0 啟動中...');
    
    // 檢查必要模組
    const requiredModules = ['Utils', 'DataValidator', 'Storage', 'Auth'];
    const missingModules = requiredModules.filter(m => typeof window[m] === 'undefined');
    
    if (missingModules.length > 0) {
        console.error('❌ 缺少必要模組:', missingModules);
        alert('系統載入失敗，請重新整理頁面');
        return;
    }
    
    console.log('✅ 所有模組已載入');
    
    // 初始化認證系統
    if (typeof Auth !== 'undefined') {
        Auth.init();
        console.log('🔐 認證系統已初始化');
    }
    
    // 載入資料
    loadAllData();
    
    // 綁定全域事件
    bindGlobalEvents();
    
    // 渲染初始界面
    renderInitialUI();
    
    console.log('✅ 系統初始化完成');
    
    // 顯示歡迎訊息
    if (typeof Utils !== 'undefined') {
        const user = Auth?.getCurrentUser();
        if (user) {
            Utils.showToast(`歡迎回來，${user.name}！`, 'success');
        } else {
            Utils.showToast('歡迎使用銓宏專案管理系統', 'info');
        }
    }
})();

/**
 * 載入所有資料
 */
function loadAllData() {
    try {
        // 載入專案資料
        if (typeof Storage !== 'undefined') {
            projects = Storage.loadProjects();
            console.log(`📦 載入 ${projects.length} 個專案`);
            
            // 載入客戶資料
            clientsDB = Storage.loadClients();
            console.log(`📦 載入 ${clientsDB.length} 個客戶`);
        } else {
            // 降級：使用空陣列
            projects = [];
            clientsDB = [];
            console.warn('⚠️ Storage 模組未載入，使用空資料');
        }
        
    } catch (e) {
        console.error('載入資料失敗:', e);
        projects = [];
        clientsDB = [];
    }
}

/**
 * 儲存所有資料
 */
function saveAllData() {
    try {
        // 驗證並儲存專案
        if (typeof Storage !== 'undefined') {
            const result = Storage.saveProjects(projects);
            if (!result.success) {
                console.error('儲存專案失敗:', result.error);
                if (typeof Utils !== 'undefined') {
                    Utils.showToast('儲存失敗：' + result.error, 'error');
                }
                return false;
            }
            
            // 儲存客戶資料
            Storage.saveClients(clientsDB);
            console.log('💾 資料已儲存');
            return true;
        }
        
    } catch (e) {
        console.error('儲存資料失敗:', e);
        return false;
    }
}

/**
 * 綁定全域事件
 */
function bindGlobalEvents() {
    // 登入事件
    window.addEventListener('auth:login', function(e) {
        console.log('👤 使用者登入:', e.detail.name);
        renderInitialUI();
    });
    
    // 登出事件
    window.addEventListener('auth:logout', function() {
        console.log('👋 使用者登出');
        renderInitialUI();
    });
    
    // 頁面關閉前儲存
    window.addEventListener('beforeunload', function(e) {
        if (projects.length > 0) {
            saveAllData();
        }
    });
    
    // 定期自動儲存（每 5 分鐘）
    setInterval(() => {
        if (projects.length > 0) {
            saveAllData();
            console.log('💾 自動儲存完成');
        }
    }, 5 * 60 * 1000);
}

/**
 * 渲染初始界面
 */
function renderInitialUI() {
    // 更新使用者顯示
    updateUserDisplay();
    
    // 檢查登入狀態
    const isLoggedIn = typeof Auth !== 'undefined' && Auth.isLoggedIn();
    
    if (!isLoggedIn) {
        // 顯示登入界面
        showLoginModal();
    } else {
        // 顯示主界面
        hideLoginModal();
        renderProjectList();
    }
}

/**
 * 更新使用者顯示
 */
function updateUserDisplay() {
    const userDisplay = document.getElementById('current-user-name');
    const logoutBtn = document.getElementById('btn-logout');
    
    if (!userDisplay) return;
    
    const user = typeof Auth !== 'undefined' ? Auth.getCurrentUser() : null;
    
    if (user) {
        userDisplay.textContent = user.name;
        userDisplay.classList.remove('guest');
        userDisplay.classList.add('logged-in');
        
        if (logoutBtn) {
            logoutBtn.style.display = 'inline-block';
        }
    } else {
        userDisplay.textContent = '訪客';
        userDisplay.classList.remove('logged-in');
        userDisplay.classList.add('guest');
        
        if (logoutBtn) {
            logoutBtn.style.display = 'none';
        }
    }
}

/**
 * 顯示登入彈窗
 */
function showLoginModal() {
    const modal = document.getElementById('login-modal');
    if (modal) {
        modal.style.display = 'flex';
    }
}

/**
 * 隱藏登入彈窗
 */
function hideLoginModal() {
    const modal = document.getElementById('login-modal');
    if (modal) {
        modal.style.display = 'none';
    }
}

/**
 * 渲染專案列表
 */
function renderProjectList() {
    const container = document.getElementById('project-container');
    if (!container) return;
    
    // 清空容器
    container.innerHTML = '';
    
    if (projects.length === 0) {
        container.innerHTML = `
            <div class="empty-state">
                <p>尚無專案資料</p>
                <button onclick="showAddProjectModal()" class="btn-primary">+ 新增專案</button>
            </div>
        `;
        return;
    }
    
    // 使用 Utils 批次渲染（效能優化）
    if (typeof Utils !== 'undefined') {
        const elements = projects.map(project => createProjectCard(project));
        Utils.batchDOMUpdate(container, elements);
    } else {
        // 降級方案
        projects.forEach(project => {
            const card = createProjectCard(project);
            container.appendChild(card);
        });
    }
    
    console.log(`🎨 已渲染 ${projects.length} 個專案卡片`);
}

/**
 * 建立專案卡片
 */
function createProjectCard(project) {
    const card = document.createElement('div');
    card.className = 'project-card';
    card.dataset.projectId = project.id;
    
    // 使用 textContent 避免 XSS
    const title = document.createElement('h3');
    title.textContent = project.name || '未命名專案';
    
    const client = document.createElement('p');
    client.className = 'client-name';
    client.textContent = project.client || '未知客戶';
    
    const status = document.createElement('span');
    status.className = `status-badge status-${project.phase || 'quoting'}`;
    status.textContent = project.statusText || '🟡 進行中';
    
    const progress = document.createElement('div');
    progress.className = 'progress-bar';
    progress.innerHTML = `
        <div class="progress-fill" style="width: ${project.progress || 0}%"></div>
        <span>${project.progress || 0}%</span>
    `;
    
    card.appendChild(title);
    card.appendChild(client);
    card.appendChild(status);
    card.appendChild(progress);
    
    // 點擊事件
    card.addEventListener('click', () => {
        openProjectDetail(project.id);
    });
    
    return card;
}

/**
 * 開啟專案詳情
 */
function openProjectDetail(projectId) {
    console.log('📂 開啟專案:', projectId);
    
    const project = projects.find(p => p.id === projectId);
    if (!project) {
        if (typeof Utils !== 'undefined') {
            Utils.showToast('找不到專案資料', 'error');
        }
        return;
    }
    
    // TODO: 開啟專案詳情彈窗
    console.log('專案詳情:', project);
}

/**
 * 顯示新增專案彈窗
 */
function showAddProjectModal() {
    // 檢查權限
    if (typeof Auth !== 'undefined' && !Auth.hasPermission('write')) {
        if (typeof Utils !== 'undefined') {
            Utils.showToast('您沒有權限執行此操作', 'error');
        }
        return;
    }
    
    const modal = document.getElementById('add-project-modal');
    if (modal) {
        modal.style.display = 'flex';
        
        // 自動產生專案編號
        const idInput = document.getElementById('new-project-id');
        if (idInput && typeof Utils !== 'undefined') {
            idInput.value = Utils.generateProjectId();
        }
    }
}

// ==================== 公開 API ====================

window.ProjectApp = {
    // 資料存取
    getProjects: () => projects,
    getClients: () => clientsDB,
    
    // 資料操作
    addProject: function(projectData) {
        // 驗證權限
        if (typeof Auth !== 'undefined' && !Auth.hasPermission('write')) {
            return { success: false, error: '無權限' };
        }
        
        // 驗證資料
        if (typeof DataValidator !== 'undefined') {
            const validation = DataValidator.validateAndFixProject(projectData);
            if (validation.fixes.length > 0) {
                console.warn('專案資料已自動修復:', validation.fixes);
            }
            projectData = validation.project;
        }
        
        // 檢查重複 ID
        if (projects.some(p => p.id === projectData.id)) {
            return { success: false, error: '專案編號已存在' };
        }
        
        // 添加到陣列
        projects.push(projectData);
        
        // 儲存
        if (saveAllData()) {
            renderProjectList();
            return { success: true, project: projectData };
        }
        
        return { success: false, error: '儲存失敗' };
    },
    
    updateProject: function(projectId, updates) {
        if (typeof Auth !== 'undefined' && !Auth.hasPermission('write')) {
            return { success: false, error: '無權限' };
        }
        
        const index = projects.findIndex(p => p.id === projectId);
        if (index === -1) {
            return { success: false, error: '找不到專案' };
        }
        
        // 合併更新
        if (typeof Utils !== 'undefined') {
            projects[index] = Utils.mergeObjects(projects[index], updates);
        } else {
            projects[index] = { ...projects[index], ...updates };
        }
        
        if (saveAllData()) {
            renderProjectList();
            return { success: true, project: projects[index] };
        }
        
        return { success: false, error: '儲存失敗' };
    },
    
    deleteProject: function(projectId) {
        if (typeof Auth !== 'undefined' && !Auth.hasPermission('delete')) {
            return { success: false, error: '無權限' };
        }
        
        const index = projects.findIndex(p => p.id === projectId);
        if (index === -1) {
            return { success: false, error: '找不到專案' };
        }
        
        // 確認對話框
        if (typeof Utils !== 'undefined') {
            Utils.confirmDialog(
                `確定要刪除專案「${projects[index].name}」嗎？此操作無法復原。`,
                () => {
                    projects.splice(index, 1);
                    saveAllData();
                    renderProjectList();
                    Utils.showToast('專案已刪除', 'success');
                }
            );
            return { success: true, pending: true };
        } else {
            projects.splice(index, 1);
            saveAllData();
            renderProjectList();
            return { success: true };
        }
    },
    
    // 重新載入
    reload: loadAllData,
    
    // 儲存
    save: saveAllData,
    
    // 匯出
    export: function() {
        if (typeof Storage !== 'undefined') {
            return Storage.exportAll();
        }
        return {
            projects: projects,
            clients: clientsDB,
            exportedAt: new Date().toISOString()
        };
    },
    
    // 匯入
    import: function(data) {
        if (typeof Storage !== 'undefined') {
            const result = Storage.importAll(data);
            if (result.success) {
                loadAllData();
                renderProjectList();
            }
            return result;
        }
        return { success: false, error: 'Storage 模組未載入' };
    }
};
