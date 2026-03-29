/**
 * 銓宏國際 - 主系統權限整合腳本
 * 將新系統的 Auth 模組整合到原有主系統
 * 
 * 使用方式：
 * 1. 在 index.html 中於 app.js 之前引入此腳本
 * 2. 系統會自動為關鍵功能添加權限檢查
 */

// 權限整合初始化
(function initPermissionIntegration() {
    'use strict';
    
    console.log('🔐 權限整合腳本載入中...');
    
    // 等待 Auth 模組載入
    function waitForAuth() {
        if (typeof Auth !== 'undefined') {
            console.log('✅ Auth 模組已載入，開始整合權限控制');
            integratePermissions();
        } else {
            console.log('⏳ 等待 Auth 模組...');
            setTimeout(waitForAuth, 100);
        }
    }
    
    // 開始等待
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', waitForAuth);
    } else {
        waitForAuth();
    }
})();

/**
 * 整合權限控制到主系統功能
 */
function integratePermissions() {
    
    // ==================== P1 核心功能權限 ====================
    
    // 1. 新增專案權限
    if (typeof openAddProjectModal === 'function') {
        const originalOpenAddProjectModal = openAddProjectModal;
        window.openAddProjectModal = function() {
            if (!checkPermission('write', '新增專案')) return;
            return originalOpenAddProjectModal.apply(this, arguments);
        };
        console.log('✅ 已為 openAddProjectModal 添加權限檢查');
    }
    
    // 2. 提交新專案權限
    if (typeof submitNewProject === 'function') {
        const originalSubmitNewProject = submitNewProject;
        window.submitNewProject = function(event) {
            if (!checkPermission('write', '提交新專案')) return;
            return originalSubmitNewProject.apply(this, arguments);
        };
        console.log('✅ 已為 submitNewProject 添加權限檢查');
    }
    
    // 3. 儲存專案變更權限
    if (typeof saveProjectChanges === 'function') {
        const originalSaveProjectChanges = saveProjectChanges;
        window.saveProjectChanges = function() {
            if (!checkPermission('write', '儲存專案變更')) return;
            return originalSaveProjectChanges.apply(this, arguments);
        };
        console.log('✅ 已為 saveProjectChanges 添加權限檢查');
    }
    
    // 4. 階段更新權限
    if (typeof updateProjectPhase === 'function') {
        const originalUpdateProjectPhase = updateProjectPhase;
        window.updateProjectPhase = function(projectId, newPhase) {
            if (!checkPermission('write', '更新專案階段')) return;
            return originalUpdateProjectPhase.apply(this, arguments);
        };
        console.log('✅ 已為 updateProjectPhase 添加權限檢查');
    }
    
    // 3. 進度更新權限
    if (typeof updateProjectProgress === 'function') {
        const originalUpdateProjectProgress = updateProjectProgress;
        window.updateProjectProgress = function(project) {
            if (!checkPermission('write', '更新專案進度')) return;
            return originalUpdateProjectProgress.apply(this, arguments);
        };
        console.log('✅ 已為 updateProjectProgress 添加權限檢查');
    }
    
    // 4. AI 進度分析權限
    if (typeof analyzeProjectProgress === 'function') {
        const originalAnalyzeProjectProgress = analyzeProjectProgress;
        window.analyzeProjectProgress = function() {
            if (!checkPermission('write', 'AI 進度分析')) return;
            return originalAnalyzeProjectProgress.apply(this, arguments);
        };
        console.log('✅ 已為 analyzeProjectProgress 添加權限檢查');
    }
    
    // 5. 確認新增專案權限
    if (typeof confirmAddProject === 'function') {
        const originalConfirmAddProject = confirmAddProject;
        window.confirmAddProject = function() {
            if (!checkPermission('write', '確認新增專案')) return;
            return originalConfirmAddProject.apply(this, arguments);
        };
        console.log('✅ 已為 confirmAddProject 添加權限檢查');
    }
    
    // 6. 完成結案權限
    if (typeof completeProject === 'function') {
        const originalCompleteProject = completeProject;
        window.completeProject = function(projectId) {
            if (!checkPermission('write', '完成結案')) return;
            return originalCompleteProject.apply(this, arguments);
        };
        console.log('✅ 已為 completeProject 添加權限檢查');
    }
    
    // 7. 撤回結案權限
    if (typeof uncompleteProject === 'function') {
        const originalUncompleteProject = uncompleteProject;
        window.uncompleteProject = function(projectId) {
            if (!checkPermission('write', '撤回結案')) return;
            return originalUncompleteProject.apply(this, arguments);
        };
        console.log('✅ 已為 uncompleteProject 添加權限檢查');
    }
    
    // ==================== P2 進階功能權限 ====================
    
    // 8. 刪除專案權限（如有此功能）
    if (typeof deleteProject === 'function') {
        const originalDeleteProject = deleteProject;
        window.deleteProject = function(projectId) {
            if (!checkPermission('delete', '刪除專案')) return;
            return originalDeleteProject.apply(this, arguments);
        };
        console.log('✅ 已為 deleteProject 添加權限檢查');
    }
    
    // 9. 客戶資料管理權限
    if (typeof addClient === 'function') {
        const originalAddClient = addClient;
        window.addClient = function(clientName, contactName) {
            if (!checkPermission('admin', '新增客戶')) return;
            return originalAddClient.apply(this, arguments);
        };
        console.log('✅ 已為 addClient 添加權限檢查');
    }
    
    console.log('🔐 權限整合完成');
}

/**
 * 檢查權限輔助函數
 */
function checkPermission(permission, actionName) {
    // 如果 Auth 模組未載入，允許操作（相容模式）
    if (typeof Auth === 'undefined') {
        console.warn(`⚠️ Auth 模組未載入，允許${actionName}`);
        return true;
    }
    
    // 檢查是否已登入
    if (!Auth.isLoggedIn()) {
        showPermissionError(`請先登入後再${actionName}`);
        showLoginModal();
        return false;
    }
    
    // 檢查權限
    if (!Auth.hasPermission(permission)) {
        showPermissionError(`您沒有權限${actionName}（需要 ${permission} 權限）`);
        return false;
    }
    
    return true;
}

/**
 * 顯示權限錯誤訊息
 */
function showPermissionError(message) {
    // 使用 Utils.showToast 如果可用
    if (typeof Utils !== 'undefined' && Utils.showToast) {
        Utils.showToast(message, 'error');
    } else {
        alert(message);
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

// 公開 API
window.PermissionIntegration = {
    checkPermission,
    showPermissionError,
    showLoginModal
};
