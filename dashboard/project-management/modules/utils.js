/**
 * 銓宏國際 - 工具函數模組
 * 常用工具：DOM 操作、事件處理、格式化等
 */

const Utils = (function() {
    'use strict';
    
    /**
     * HTML 跳脫（防 XSS）
     */
    function escapeHtml(text) {
        if (typeof text !== 'string') return text;
        
        const map = {
            '&': '&amp;',
            '<': '&lt;',
            '>': '&gt;',
            '"': '&quot;',
            "'": '&#039;'
        };
        
        return text.replace(/[&<>"']/g, m => map[m]);
    }
    
    /**
     * 防抖函數
     */
    function debounce(func, wait = 300) {
        let timeout;
        return function executedFunction(...args) {
            const later = () => {
                clearTimeout(timeout);
                func(...args);
            };
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
        };
    }
    
    /**
     * 節流函數
     */
    function throttle(func, limit = 100) {
        let inThrottle;
        return function executedFunction(...args) {
            if (!inThrottle) {
                func(...args);
                inThrottle = true;
                setTimeout(() => inThrottle = false, limit);
            }
        };
    }
    
    /**
     * 產生唯一 ID
     */
    function generateId(prefix = 'ID') {
        const date = new Date();
        const dateStr = date.toISOString().slice(0, 10).replace(/-/g, '');
        const random = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
        return `${prefix}-${dateStr}-${random}`;
    }
    
    /**
     * 產生專案編號
     */
    function generateProjectId() {
        const date = new Date();
        const year = date.getFullYear().toString().slice(-2);
        const month = (date.getMonth() + 1).toString().padStart(2, '0');
        const day = date.getDate().toString().padStart(2, '0');
        const dateStr = `${year}${month}${day}`;
        
        // 取得目前最大編號
        const projects = typeof Storage !== 'undefined' ? Storage.loadProjects() : [];
        const maxNum = projects.reduce((max, p) => {
            const match = p.id?.match(/A(\d{4})/);
            if (match) {
                return Math.max(max, parseInt(match[1]));
            }
            return max;
        }, 0);
        
        const nextNum = (maxNum + 1).toString().padStart(4, '0');
        return `A${nextNum}-${dateStr}`;
    }
    
    /**
     * 格式化日期
     */
    function formatDate(dateStr, format = 'YYYY-MM-DD') {
        if (!dateStr || dateStr === '等') return dateStr;
        
        const date = new Date(dateStr);
        if (isNaN(date.getTime())) return dateStr;
        
        const year = date.getFullYear();
        const month = (date.getMonth() + 1).toString().padStart(2, '0');
        const day = date.getDate().toString().padStart(2, '0');
        
        return format
            .replace('YYYY', year)
            .replace('MM', month)
            .replace('DD', day);
    }
    
    /**
     * 計算剩餘天數
     */
    function getDaysRemaining(deadline) {
        if (!deadline || deadline.startsWith('等')) return null;
        
        const end = new Date(deadline);
        const now = new Date();
        const diff = end - now;
        
        return Math.ceil(diff / (1000 * 60 * 60 * 24));
    }
    
    /**
     * 安全地設定 innerHTML
     */
    function setSafeHTML(element, html) {
        if (!element) return;
        
        // 如果 html 是字串，使用 textContent 更安全
        if (typeof html === 'string') {
            element.textContent = html;
        } else if (html instanceof HTMLElement) {
            element.innerHTML = '';
            element.appendChild(html);
        }
    }
    
    /**
     * 建立 DOM 元素（安全版）
     */
    function createElement(tag, attributes = {}, children = []) {
        const element = document.createElement(tag);
        
        // 設定屬性
        for (const [key, value] of Object.entries(attributes)) {
            if (key === 'textContent') {
                element.textContent = value;
            } else if (key === 'innerHTML') {
                // 避免直接使用 innerHTML
                console.warn('建議使用 textContent 而非 innerHTML');
                element.textContent = value;
            } else if (key.startsWith('on') && typeof value === 'function') {
                element.addEventListener(key.slice(2).toLowerCase(), value);
            } else {
                element.setAttribute(key, value);
            }
        }
        
        // 添加子元素
        children.forEach(child => {
            if (typeof child === 'string') {
                element.appendChild(document.createTextNode(child));
            } else if (child instanceof HTMLElement) {
                element.appendChild(child);
            }
        });
        
        return element;
    }
    
    /**
     * 批次 DOM 更新（使用 DocumentFragment）
     */
    function batchDOMUpdate(container, elements) {
        const fragment = document.createDocumentFragment();
        elements.forEach(el => fragment.appendChild(el));
        container.appendChild(fragment);
    }
    
    /**
     * 複製到剪貼簿
     */
    async function copyToClipboard(text) {
        try {
            await navigator.clipboard.writeText(text);
            return { success: true };
        } catch (e) {
            // 降級方案
            const textarea = document.createElement('textarea');
            textarea.value = text;
            textarea.style.position = 'fixed';
            textarea.style.opacity = '0';
            document.body.appendChild(textarea);
            textarea.select();
            
            try {
                document.execCommand('copy');
                return { success: true };
            } catch (e2) {
                return { success: false, error: e2.message };
            } finally {
                document.body.removeChild(textarea);
            }
        }
    }
    
    /**
     * 下載 JSON 檔案
     */
    function downloadJSON(data, filename) {
        const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        
        const a = document.createElement('a');
        a.href = url;
        a.download = filename;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        
        URL.revokeObjectURL(url);
    }
    
    /**
     * 深拷貝
     */
    function deepClone(obj) {
        if (obj === null || typeof obj !== 'object') return obj;
        if (obj instanceof Date) return new Date(obj.getTime());
        if (Array.isArray(obj)) return obj.map(deepClone);
        
        const cloned = {};
        for (const key in obj) {
            if (obj.hasOwnProperty(key)) {
                cloned[key] = deepClone(obj[key]);
            }
        }
        return cloned;
    }
    
    /**
     * 合併物件
     */
    function mergeObjects(target, source) {
        const result = { ...target };
        for (const key in source) {
            if (source.hasOwnProperty(key)) {
                if (typeof source[key] === 'object' && source[key] !== null && !Array.isArray(source[key])) {
                    result[key] = mergeObjects(result[key] || {}, source[key]);
                } else {
                    result[key] = source[key];
                }
            }
        }
        return result;
    }
    
    /**
     * 顯示暫時訊息
     */
    function showToast(message, type = 'info', duration = 3000) {
        const toast = document.createElement('div');
        toast.className = `toast toast-${type}`;
        toast.textContent = message;
        toast.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            padding: 12px 20px;
            background: ${type === 'error' ? '#f44336' : type === 'success' ? '#4caf50' : '#2196f3'};
            color: white;
            border-radius: 4px;
            box-shadow: 0 2px 8px rgba(0,0,0,0.2);
            z-index: 10000;
            font-size: 14px;
            transition: opacity 0.3s;
        `;
        
        document.body.appendChild(toast);
        
        setTimeout(() => {
            toast.style.opacity = '0';
            setTimeout(() => document.body.removeChild(toast), 300);
        }, duration);
    }
    
    /**
     * 確認對話框
     */
    function confirmDialog(message, onConfirm, onCancel) {
        const overlay = document.createElement('div');
        overlay.className = 'confirm-overlay';
        overlay.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            background: rgba(0,0,0,0.5);
            display: flex;
            align-items: center;
            justify-content: center;
            z-index: 9999;
        `;
        
        const dialog = document.createElement('div');
        dialog.className = 'confirm-dialog';
        dialog.style.cssText = `
            background: white;
            padding: 24px;
            border-radius: 8px;
            max-width: 400px;
            text-align: center;
        `;
        
        const msg = document.createElement('p');
        msg.textContent = message;
        msg.style.marginBottom = '20px';
        
        const btnContainer = document.createElement('div');
        btnContainer.style.display = 'flex';
        btnContainer.style.gap = '12px';
        btnContainer.style.justifyContent = 'center';
        
        const confirmBtn = document.createElement('button');
        confirmBtn.textContent = '確定';
        confirmBtn.style.cssText = `
            padding: 8px 20px;
            background: #f44336;
            color: white;
            border: none;
            border-radius: 4px;
            cursor: pointer;
        `;
        confirmBtn.onclick = () => {
            document.body.removeChild(overlay);
            if (onConfirm) onConfirm();
        };
        
        const cancelBtn = document.createElement('button');
        cancelBtn.textContent = '取消';
        cancelBtn.style.cssText = `
            padding: 8px 20px;
            background: #e0e0e0;
            border: none;
            border-radius: 4px;
            cursor: pointer;
        `;
        cancelBtn.onclick = () => {
            document.body.removeChild(overlay);
            if (onCancel) onCancel();
        };
        
        btnContainer.appendChild(cancelBtn);
        btnContainer.appendChild(confirmBtn);
        dialog.appendChild(msg);
        dialog.appendChild(btnContainer);
        overlay.appendChild(dialog);
        document.body.appendChild(overlay);
    }
    
    // 公開 API
    return {
        escapeHtml,
        debounce,
        throttle,
        generateId,
        generateProjectId,
        formatDate,
        getDaysRemaining,
        setSafeHTML,
        createElement,
        batchDOMUpdate,
        copyToClipboard,
        downloadJSON,
        deepClone,
        mergeObjects,
        showToast,
        confirmDialog
    };
})();

// 綁定到全域 window 物件
window.Utils = Utils;
