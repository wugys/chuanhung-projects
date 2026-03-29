/**
 * 銓宏國際 - 資料驗證模組
 * 提供資料結構驗證與清理功能
 */

const DataValidator = (function() {
    'use strict';
    
    // 專案資料結構定義
    const PROJECT_SCHEMA = {
        id: { type: 'string', required: true, pattern: /^A\d{4}-\d{6}$/ },
        name: { type: 'string', required: true, maxLength: 200 },
        client: { type: 'string', required: true, maxLength: 100 },
        contact: { type: 'string', required: false, maxLength: 50 },
        quantity: { type: 'string', required: false, maxLength: 100 },
        deadline: { type: 'string', required: false, pattern: /^\d{4}-\d{2}-\d{2}$|^等/ },
        progress: { type: 'number', required: true, min: 0, max: 100 },
        status: { type: 'string', required: true, enum: ['active', 'completed', 'archived'] },
        statusText: { type: 'string', required: true, maxLength: 100 },
        phase: { type: 'string', required: true, enum: ['quoting', 'pending', 'sampling', 'production', 'completed'] },
        sales_rep: { type: 'string', required: true, maxLength: 50 },
        tasks: { type: 'array', required: true }
    };
    
    // 任務資料結構定義
    const TASK_SCHEMA = {
        name: { type: 'string', required: true, maxLength: 200 },
        start: { type: 'string', required: true, pattern: /^\d{4}-\d{2}-\d{2}$/ },
        end: { type: 'string', required: true, pattern: /^\d{4}-\d{2}-\d{2}$/ },
        progress: { type: 'number', required: true, min: 0, max: 100 }
    };
    
    // 客戶資料結構定義
    const CLIENT_SCHEMA = {
        name: { type: 'string', required: true, maxLength: 100 },
        contacts: { type: 'array', required: true, itemType: 'string' }
    };
    
    /**
     * 驗證單個欄位
     */
    function validateField(value, rules, fieldName) {
        const errors = [];
        
        // 檢查必填
        if (rules.required && (value === undefined || value === null || value === '')) {
            errors.push(`${fieldName}: 為必填欄位`);
            return errors;
        }
        
        // 如果非必填且無值，跳過其他驗證
        if (!rules.required && (value === undefined || value === null || value === '')) {
            return errors;
        }
        
        // 檢查型別
        if (rules.type && value !== undefined) {
            const actualType = Array.isArray(value) ? 'array' : typeof value;
            if (actualType !== rules.type) {
                errors.push(`${fieldName}: 型別錯誤，期望 ${rules.type}，實際 ${actualType}`);
                return errors;
            }
        }
        
        // 檢查字串長度
        if (rules.type === 'string' && rules.maxLength) {
            if (value.length > rules.maxLength) {
                errors.push(`${fieldName}: 長度超過限制 (${value.length} > ${rules.maxLength})`);
            }
        }
        
        // 檢查數字範圍
        if (rules.type === 'number') {
            if (rules.min !== undefined && value < rules.min) {
                errors.push(`${fieldName}: 數值過小 (${value} < ${rules.min})`);
            }
            if (rules.max !== undefined && value > rules.max) {
                errors.push(`${fieldName}: 數值過大 (${value} > ${rules.max})`);
            }
        }
        
        // 檢查正則表達式
        if (rules.pattern && !rules.pattern.test(value)) {
            errors.push(`${fieldName}: 格式不符合要求`);
        }
        
        // 檢查枚舉值
        if (rules.enum && !rules.enum.includes(value)) {
            errors.push(`${fieldName}: 無效的值，期望其中之一: ${rules.enum.join(', ')}`);
        }
        
        // 檢查陣列項目型別
        if (rules.type === 'array' && rules.itemType && Array.isArray(value)) {
            value.forEach((item, index) => {
                const itemType = typeof item;
                if (itemType !== rules.itemType) {
                    errors.push(`${fieldName}[${index}]: 型別錯誤，期望 ${rules.itemType}，實際 ${itemType}`);
                }
            });
        }
        
        return errors;
    }
    
    /**
     * 驗證物件結構
     */
    function validateObject(obj, schema, objectName = '物件') {
        const errors = [];
        
        if (!obj || typeof obj !== 'object') {
            return [`${objectName}: 必須是物件`];
        }
        
        // 檢查每個定義的欄位
        for (const [fieldName, rules] of Object.entries(schema)) {
            const fieldErrors = validateField(obj[fieldName], rules, fieldName);
            errors.push(...fieldErrors);
        }
        
        // 檢查是否有未定義的額外欄位（警告）
        const definedFields = Object.keys(schema);
        const extraFields = Object.keys(obj).filter(key => !definedFields.includes(key));
        if (extraFields.length > 0) {
            console.warn(`⚠️ ${objectName} 有未定義的欄位:`, extraFields);
        }
        
        return errors;
    }
    
    /**
     * 驗證專案資料
     */
    function validateProject(project) {
        const errors = validateObject(project, PROJECT_SCHEMA, '專案');
        
        // 額外驗證：任務陣列
        if (project.tasks && Array.isArray(project.tasks)) {
            project.tasks.forEach((task, index) => {
                const taskErrors = validateObject(task, TASK_SCHEMA, `任務[${index}]`);
                errors.push(...taskErrors);
            });
        }
        
        return {
            valid: errors.length === 0,
            errors: errors
        };
    }
    
    /**
     * 驗證客戶資料
     */
    function validateClient(client) {
        const errors = validateObject(client, CLIENT_SCHEMA, '客戶');
        
        return {
            valid: errors.length === 0,
            errors: errors
        };
    }
    
    /**
     * 驗證專案陣列
     */
    function validateProjects(projects) {
        if (!Array.isArray(projects)) {
            return {
                valid: false,
                errors: ['資料必須是陣列'],
                validProjects: [],
                invalidProjects: []
            };
        }
        
        const validProjects = [];
        const invalidProjects = [];
        const allErrors = [];
        
        projects.forEach((project, index) => {
            const result = validateProject(project);
            if (result.valid) {
                validProjects.push(project);
            } else {
                invalidProjects.push({ index, project, errors: result.errors });
                allErrors.push(`專案[${index}](${project.id || '未知ID'}): ${result.errors.join(', ')}`);
            }
        });
        
        return {
            valid: invalidProjects.length === 0,
            errors: allErrors,
            validProjects,
            invalidProjects,
            totalCount: projects.length,
            validCount: validProjects.length
        };
    }
    
    /**
     * 清理專案資料（移除 XSS 風險）
     */
    function sanitizeProject(project) {
        if (!project || typeof project !== 'object') {
            return null;
        }
        
        const sanitized = {};
        
        // 清理每個字串欄位
        for (const [key, value] of Object.entries(project)) {
            if (typeof value === 'string') {
                sanitized[key] = escapeHtml(value);
            } else if (Array.isArray(value)) {
                sanitized[key] = value.map(item => {
                    if (typeof item === 'string') {
                        return escapeHtml(item);
                    } else if (typeof item === 'object' && item !== null) {
                        return sanitizeTask(item);
                    }
                    return item;
                });
            } else if (typeof value === 'object' && value !== null) {
                sanitized[key] = sanitizeTask(value);
            } else {
                sanitized[key] = value;
            }
        }
        
        return sanitized;
    }
    
    /**
     * 清理任務資料
     */
    function sanitizeTask(task) {
        if (!task || typeof task !== 'object') {
            return task;
        }
        
        const sanitized = {};
        for (const [key, value] of Object.entries(task)) {
            if (typeof value === 'string') {
                sanitized[key] = escapeHtml(value);
            } else {
                sanitized[key] = value;
            }
        }
        return sanitized;
    }
    
    /**
     * HTML 跳脫（防 XSS）
     */
    function escapeHtml(text) {
        if (typeof text !== 'string') return text;
        
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }
    
    /**
     * 驗證並修復專案資料（自動修復常見問題）
     */
    function validateAndFixProject(project) {
        const fixed = { ...project };
        const fixes = [];
        
        // 確保必填欄位有預設值
        if (!fixed.id) {
            fixed.id = generateTempId();
            fixes.push('產生臨時 ID');
        }
        
        if (!fixed.name) {
            fixed.name = '未命名專案';
            fixes.push('設定預設名稱');
        }
        
        if (!fixed.client) {
            fixed.client = '未知客戶';
            fixes.push('設定預設客戶');
        }
        
        if (typeof fixed.progress !== 'number' || isNaN(fixed.progress)) {
            fixed.progress = 0;
            fixes.push('修復進度數值');
        } else {
            // 限制在 0-100 範圍
            fixed.progress = Math.max(0, Math.min(100, fixed.progress));
        }
        
        if (!fixed.status) {
            fixed.status = 'active';
            fixes.push('設定預設狀態');
        }
        
        if (!fixed.phase) {
            fixed.phase = 'quoting';
            fixes.push('設定預設階段');
        }
        
        if (!fixed.sales_rep) {
            fixed.sales_rep = '未指派';
            fixes.push('設定預設業務');
        }
        
        if (!Array.isArray(fixed.tasks)) {
            fixed.tasks = [];
            fixes.push('初始化任務陣列');
        }
        
        // 清理任務資料
        fixed.tasks = fixed.tasks.map((task, index) => {
            if (!task || typeof task !== 'object') {
                fixes.push(`移除無效任務[${index}]`);
                return null;
            }
            
            const fixedTask = { ...task };
            
            if (!fixedTask.name) fixedTask.name = '未命名任務';
            if (typeof fixedTask.progress !== 'number') fixedTask.progress = 0;
            fixedTask.progress = Math.max(0, Math.min(100, fixedTask.progress));
            
            return fixedTask;
        }).filter(Boolean); // 移除 null
        
        // 產生狀態文字
        if (!fixed.statusText) {
            fixed.statusText = generateStatusText(fixed);
            fixes.push('產生狀態文字');
        }
        
        return {
            project: fixed,
            fixes: fixes,
            originalValid: validateProject(project).valid
        };
    }
    
    /**
     * 產生臨時 ID
     */
    function generateTempId() {
        const date = new Date();
        const dateStr = date.toISOString().slice(2, 10).replace(/-/g, '');
        const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
        return `TEMP-${dateStr}-${random}`;
    }
    
    /**
     * 產生狀態文字
     */
    function generateStatusText(project) {
        const phaseMap = {
            'quoting': '🟡 報價中',
            'pending': '🟡 報價待確認',
            'sampling': '🟡 打樣中',
            'production': '🟢 生產中',
            'completed': '✅ 已完成'
        };
        
        if (project.status === 'completed') {
            return '✅ 已結案';
        }
        
        return phaseMap[project.phase] || '🟡 進行中';
    }
    
    // 公開 API
    return {
        validateProject,
        validateClient,
        validateProjects,
        sanitizeProject,
        sanitizeTask,
        escapeHtml,
        validateAndFixProject,
        PROJECT_SCHEMA,
        TASK_SCHEMA,
        CLIENT_SCHEMA
    };
})();

// 綁定到全域 window 物件
window.DataValidator = DataValidator;
