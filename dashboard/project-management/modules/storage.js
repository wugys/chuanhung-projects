/**
 * 銓宏國際 - 儲存模組
 * 安全的 LocalStorage 操作，含資料驗證與備份
 */

const Storage = (function() {
    'use strict';
    
    // 設定
    const CONFIG = {
        projectKey: 'chuanhung_projects_v1',
        clientKey: 'chuanhung_clients_v1',
        backupKey: 'chuanhung_backup_v1',
        maxProjects: 1000, // 最大專案數量限制
        maxStorageSize: 5 * 1024 * 1024 // 5MB 限制警告
    };
    
    // 記憶體快取
    let projectsCache = null;
    let clientsCache = null;
    let lastLoadTime = 0;
    const CACHE_DURATION = 5000; // 5秒快取
    
    /**
     * 取得儲存使用量
     */
    function getStorageUsage() {
        let total = 0;
        for (let key in localStorage) {
            if (localStorage.hasOwnProperty(key)) {
                total += localStorage[key].length * 2; // UTF-16 編碼
            }
        }
        return total;
    }
    
    /**
     * 檢查儲存空間
     */
    function checkStorageSpace() {
        const usage = getStorageUsage();
        const percent = (usage / CONFIG.maxStorageSize) * 100;
        
        if (percent > 90) {
            console.warn('⚠️ LocalStorage 空間不足:', percent.toFixed(1) + '%');
            return { ok: false, percent, usage };
        }
        
        if (percent > 70) {
            console.warn('⚠️ LocalStorage 空間使用超過 70%:', percent.toFixed(1) + '%');
        }
        
        return { ok: true, percent, usage };
    }
    
    /**
     * 儲存專案資料（含驗證與備份）
     */
    function saveProjects(projects) {
        try {
            // 檢查空間
            const spaceCheck = checkStorageSpace();
            if (!spaceCheck.ok) {
                return {
                    success: false,
                    error: '儲存空間不足，請清理舊資料'
                };
            }
            
            // 驗證資料
            if (!Array.isArray(projects)) {
                return {
                    success: false,
                    error: '資料格式錯誤：必須是陣列'
                };
            }
            
            if (projects.length > CONFIG.maxProjects) {
                return {
                    success: false,
                    error: `專案數量超過限制 (${CONFIG.maxProjects})`
                };
            }
            
            // 驗證並修復每個專案
            const validatedProjects = [];
            const validationErrors = [];
            
            projects.forEach((project, index) => {
                if (!project) {
                    validationErrors.push(`專案[${index}] 為 null`);
                    return;
                }
                
                // 使用 DataValidator 驗證並修復
                if (typeof DataValidator !== 'undefined') {
                    const result = DataValidator.validateAndFixProject(project);
                    if (result.fixes.length > 0) {
                        console.warn(`專案 ${result.project.id} 自動修復:`, result.fixes);
                    }
                    validatedProjects.push(result.project);
                } else {
                    // 如果沒有 DataValidator，直接儲存
                    validatedProjects.push(project);
                }
            });
            
            // 備份現有資料
            backupBeforeSave();
            
            // 儲存資料
            const dataString = JSON.stringify(validatedProjects);
            localStorage.setItem(CONFIG.projectKey, dataString);
            
            // 更新快取
            projectsCache = validatedProjects;
            lastLoadTime = Date.now();
            
            console.log('💾 已儲存', validatedProjects.length, '個專案');
            
            return {
                success: true,
                count: validatedProjects.length,
                errors: validationErrors,
                storageUsed: getStorageUsage()
            };
            
        } catch (e) {
            console.error('儲存專案失敗:', e);
            
            // 嘗試還原備份
            restoreFromBackup();
            
            return {
                success: false,
                error: e.message
            };
        }
    }
    
    /**
     * 載入專案資料（含快取與驗證）
     */
    function loadProjects() {
        try {
            // 檢查快取
            if (projectsCache && (Date.now() - lastLoadTime) < CACHE_DURATION) {
                console.log('📦 使用快取資料');
                return projectsCache;
            }
            
            const stored = localStorage.getItem(CONFIG.projectKey);
            
            if (!stored) {
                console.log('ℹ️ 沒有儲存的專案資料');
                return [];
            }
            
            // 解析 JSON
            let projects;
            try {
                projects = JSON.parse(stored);
            } catch (e) {
                console.error('JSON 解析失敗:', e);
                // 嘗試還原備份
                return restoreFromBackup() || [];
            }
            
            // 驗證資料結構
            if (!Array.isArray(projects)) {
                console.error('資料格式錯誤：不是陣列');
                return [];
            }
            
            // 使用 DataValidator 驗證
            if (typeof DataValidator !== 'undefined') {
                const result = DataValidator.validateProjects(projects);
                
                if (!result.valid) {
                    console.warn('⚠️ 部分專案資料無效:', result.errors);
                    
                    // 如果大部分有效，只返回有效的
                    if (result.validCount > 0) {
                        console.log(`✅ 載入 ${result.validCount}/${result.totalCount} 個有效專案`);
                        projects = result.validProjects;
                    } else {
                        console.error('❌ 所有專案資料無效');
                        return [];
                    }
                }
            }
            
            // 更新快取
            projectsCache = projects;
            lastLoadTime = Date.now();
            
            console.log('📦 載入', projects.length, '個專案');
            return projects;
            
        } catch (e) {
            console.error('載入專案失敗:', e);
            return [];
        }
    }
    
    /**
     * 儲存前備份
     */
    function backupBeforeSave() {
        try {
            const current = localStorage.getItem(CONFIG.projectKey);
            if (current) {
                const backup = {
                    data: current,
                    timestamp: Date.now(),
                    version: '1.0'
                };
                localStorage.setItem(CONFIG.backupKey, JSON.stringify(backup));
                console.log('💾 已建立備份');
            }
        } catch (e) {
            console.warn('備份失敗:', e);
        }
    }
    
    /**
     * 從備份還原
     */
    function restoreFromBackup() {
        try {
            const backupString = localStorage.getItem(CONFIG.backupKey);
            if (!backupString) {
                console.warn('沒有可用備份');
                return null;
            }
            
            const backup = JSON.parse(backupString);
            if (backup.data) {
                localStorage.setItem(CONFIG.projectKey, backup.data);
                console.log('✅ 已從備份還原');
                
                // 清除快取強制重新載入
                projectsCache = null;
                return loadProjects();
            }
        } catch (e) {
            console.error('還原備份失敗:', e);
        }
        return null;
    }
    
    /**
     * 儲存客戶資料
     */
    function saveClients(clients) {
        try {
            if (!Array.isArray(clients)) {
                return { success: false, error: '資料格式錯誤' };
            }
            
            // 驗證客戶資料
            const validatedClients = [];
            clients.forEach((client, index) => {
                if (!client || !client.name) {
                    console.warn(`跳過無效客戶[${index}]`);
                    return;
                }
                
                // 確保 contacts 是陣列
                if (!Array.isArray(client.contacts)) {
                    client.contacts = [];
                }
                
                validatedClients.push(client);
            });
            
            localStorage.setItem(CONFIG.clientKey, JSON.stringify(validatedClients));
            clientsCache = validatedClients;
            
            console.log('💾 已儲存', validatedClients.length, '個客戶');
            return { success: true, count: validatedClients.length };
            
        } catch (e) {
            console.error('儲存客戶失敗:', e);
            return { success: false, error: e.message };
        }
    }
    
    /**
     * 載入客戶資料
     */
    function loadClients() {
        try {
            // 使用快取
            if (clientsCache) {
                return clientsCache;
            }
            
            const stored = localStorage.getItem(CONFIG.clientKey);
            if (!stored) {
                return [];
            }
            
            const clients = JSON.parse(stored);
            if (!Array.isArray(clients)) {
                return [];
            }
            
            clientsCache = clients;
            return clients;
            
        } catch (e) {
            console.error('載入客戶失敗:', e);
            return [];
        }
    }
    
    /**
     * 清除快取（強制重新載入）
     */
    function clearCache() {
        projectsCache = null;
        clientsCache = null;
        lastLoadTime = 0;
        console.log('🗑️ 已清除快取');
    }
    
    /**
     * 匯出所有資料
     */
    function exportAll() {
        return {
            projects: loadProjects(),
            clients: loadClients(),
            exportedAt: new Date().toISOString(),
            version: '1.0'
        };
    }
    
    /**
     * 匯入資料（含驗證）
     */
    function importAll(data) {
        try {
            if (!data || typeof data !== 'object') {
                return { success: false, error: '無效的資料格式' };
            }
            
            let result = { success: true, projects: 0, clients: 0 };
            
            // 匯入專案
            if (Array.isArray(data.projects)) {
                const saveResult = saveProjects(data.projects);
                if (saveResult.success) {
                    result.projects = saveResult.count;
                } else {
                    result.success = false;
                    result.error = '專案匯入失敗: ' + saveResult.error;
                }
            }
            
            // 匯入客戶
            if (Array.isArray(data.clients)) {
                const saveResult = saveClients(data.clients);
                if (saveResult.success) {
                    result.clients = saveResult.count;
                }
            }
            
            return result;
            
        } catch (e) {
            return { success: false, error: e.message };
        }
    }
    
    /**
     * 清除所有資料
     */
    function clearAll() {
        localStorage.removeItem(CONFIG.projectKey);
        localStorage.removeItem(CONFIG.clientKey);
        localStorage.removeItem(CONFIG.backupKey);
        clearCache();
        console.log('🗑️ 已清除所有資料');
    }
    
    // 公開 API
    return {
        saveProjects,
        loadProjects,
        saveClients,
        loadClients,
        clearCache,
        exportAll,
        importAll,
        clearAll,
        getStorageUsage,
        checkStorageSpace,
        restoreFromBackup
    };
})();

// 綁定到全域 window 物件
window.Storage = Storage;
