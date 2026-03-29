// 銓宏國際專案管理系統 - 功能邏輯

// ==================== LocalStorage 儲存功能 ====================
const STORAGE_KEY = 'chuanhung_projects_v1';

// 儲存專案資料到 LocalStorage
function saveProjectsToLocalStorage() {
    try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(projects));
        console.log('💾 已儲存', projects.length, '個專案到 LocalStorage');
        // 驗證儲存成功
        const verify = localStorage.getItem(STORAGE_KEY);
        if (verify) {
            console.log('✅ 驗證成功：資料已寫入 LocalStorage');
        }
    } catch (e) {
        console.error('LocalStorage 儲存失敗:', e);
        alert('⚠️ 儲存失敗：' + e.message);
    }
}

// 從 LocalStorage 載入專案資料
function loadProjectsFromLocalStorage() {
    try {
        const stored = localStorage.getItem(STORAGE_KEY);
        if (stored) {
            const parsed = JSON.parse(stored);
            console.log('📦 從 LocalStorage 載入', parsed.length, '個專案');
            return parsed;
        }
    } catch (e) {
        console.error('LocalStorage 載入失敗:', e);
    }
    return null;
}

// 初始化時載入資料
function initProjects() {
    const stored = loadProjectsFromLocalStorage();
    if (stored && stored.length > 0) {
        // 使用 LocalStorage 中的數據覆蓋默認數據
        // 保留默認數據中不在 stored 中的專案
        const storedIds = new Set(stored.map(p => p.id));
        const defaultOnly = projects.filter(p => !storedIds.has(p.id));

        // 清空 projects 並重新填充
        projects.length = 0;

        // 先添加 stored 中的數據
        stored.forEach(p => projects.push(p));

        // 再添加默認數據中獨有的專案
        defaultOnly.forEach(p => projects.push(p));

        console.log('✅ 專案資料初始化完成（從 LocalStorage 載入）', projects.length, '個');
    }
}
// ==================== LocalStorage 結束 ====================

// ==================== 客戶資料庫功能 ====================
const CLIENTS_STORAGE_KEY = 'chuanhung_clients_v1';

// 客戶資料結構: { name: string, contacts: string[] }
let clientsDB = [];

// 從現有專案資料初始化客戶資料庫
function initClientsDB() {
    const stored = localStorage.getItem(CLIENTS_STORAGE_KEY);
    if (stored) {
        clientsDB = JSON.parse(stored);
        console.log('📦 從 LocalStorage 載入', clientsDB.length, '個客戶');
    } else {
        // 從現有專案資料建立客戶庫
        const clientMap = new Map();
        projects.forEach(p => {
            if (p.client) {
                if (!clientMap.has(p.client)) {
                    clientMap.set(p.client, new Set());
                }
                if (p.contact) {
                    clientMap.get(p.client).add(p.contact);
                }
            }
        });

        clientsDB = Array.from(clientMap.entries()).map(([name, contacts]) => ({
            name,
            contacts: Array.from(contacts)
        }));

        saveClientsDB();
        console.log('✅ 從專案資料建立客戶庫，共', clientsDB.length, '個客戶');
    }

    // 確保銓宏國際公司存在
    const chuanhungClient = clientsDB.find(c => c.name === '銓宏國際');
    if (!chuanhungClient) {
        clientsDB.push({
            name: '銓宏國際',
            contacts: ['姿姿', 'Mia', 'Kevin', 'Betty']
        });
        saveClientsDB();
        console.log('✅ 已添加銓宏國際公司和人員');
    } else {
        // 確保所有人員都在
        const requiredContacts = ['姿姿', 'Mia', 'Kevin', 'Betty'];
        let updated = false;
        requiredContacts.forEach(person => {
            if (!chuanhungClient.contacts.includes(person)) {
                chuanhungClient.contacts.push(person);
                updated = true;
            }
        });
        if (updated) {
            saveClientsDB();
            console.log('✅ 已更新銓宏國際公司人員');
        }
    }
}

// 儲存客戶資料庫
function saveClientsDB() {
    try {
        localStorage.setItem(CLIENTS_STORAGE_KEY, JSON.stringify(clientsDB));
    } catch (e) {
        console.error('客戶資料庫儲存失敗:', e);
    }
}

// 搜尋客戶
function searchClients(query) {
    if (!query) return clientsDB;
    const lowerQuery = query.toLowerCase();
    return clientsDB.filter(c => c.name.toLowerCase().includes(lowerQuery));
}

// 取得客戶聯絡人
function getClientContacts(clientName) {
    const client = clientsDB.find(c => c.name === clientName);
    return client ? client.contacts : [];
}

// 新增客戶
function addClient(clientName, contactName = null) {
    const existing = clientsDB.find(c => c.name === clientName);
    if (existing) {
        if (contactName && !existing.contacts.includes(contactName)) {
            existing.contacts.push(contactName);
            saveClientsDB();
        }
        return existing;
    }

    const newClient = {
        name: clientName,
        contacts: contactName ? [contactName] : []
    };
    clientsDB.push(newClient);
    saveClientsDB();
    return newClient;
}

// 檢查客戶是否存在
function clientExists(clientName) {
    return clientsDB.some(c => c.name === clientName);
}

// 檢查聯絡人是否存在於客戶
function contactExists(clientName, contactName) {
    const client = clientsDB.find(c => c.name === clientName);
    return client && client.contacts.includes(contactName);
}

// 新增專案表單相關變數
let pendingClientData = null; // 暫存新客戶/聯絡人資料

// 顯示客戶搜尋建議
function showClientSuggestions(query) {
    const dropdown = document.getElementById('client-suggestions');
    const matches = searchClients(query);

    if (matches.length === 0 || !query) {
        dropdown.classList.remove('active');
        return;
    }

    dropdown.innerHTML = matches.map(client => `
        <div class="client-suggestion-item" onclick="selectClient('${client.name}')">
            <div class="client-name">${client.name}</div>
            <div class="contact-hint">聯絡人: ${client.contacts.join(', ') || '無'}</div>
        </div>
    `).join('');

    dropdown.classList.add('active');
}

// 選擇客戶
function selectClient(clientName) {
    document.getElementById('new-project-client').value = clientName;
    document.getElementById('client-suggestions').classList.remove('active');
    updateContactSelect(clientName);
}

// 更新聯絡人選擇器
function updateContactSelect(clientName) {
    const select = document.getElementById('new-project-contact');
    const contacts = getClientContacts(clientName);

    select.innerHTML = '<option value="">選擇聯絡人</option>';

    if (contacts.length === 0) {
        select.innerHTML += '<option value="new">+ 新增聯絡人</option>';
        select.value = 'new';
        toggleNewContactInput();
    } else {
        contacts.forEach(contact => {
            select.innerHTML += `<option value="${contact}">${contact}</option>`;
        });
        select.innerHTML += '<option value="new">+ 新增聯絡人</option>';
    }

    select.disabled = false;
}

// 切換新增聯絡人輸入框
function toggleNewContactInput() {
    const select = document.getElementById('new-project-contact');
    const input = document.getElementById('new-contact-input');
    const btn = document.getElementById('btn-add-new-contact');

    if (select.value === 'new' || input.classList.contains('hidden')) {
        // 顯示輸入框
        select.classList.add('hidden');
        input.classList.remove('hidden');
        input.focus();
        btn.textContent = '✓';
        btn.title = '確認';
        btn.onclick = confirmNewContact;
    } else {
        // 返回選擇框
        select.classList.remove('hidden');
        input.classList.add('hidden');
        input.value = '';
        btn.textContent = '+';
        btn.title = '新增聯絡人';
        btn.onclick = toggleNewContactInput;
    }
}

// 確認新聯絡人
function confirmNewContact() {
    const input = document.getElementById('new-contact-input');
    const contactName = input.value.trim();

    if (!contactName) {
        alert('請輸入聯絡人姓名');
        return;
    }

    // 返回選擇狀態但保留值
    const select = document.getElementById('new-project-contact');
    select.innerHTML += `<option value="${contactName}" selected>${contactName} (新)</option>`;
    select.classList.remove('hidden');
    input.classList.add('hidden');

    const btn = document.getElementById('btn-add-new-contact');
    btn.textContent = '+';
    btn.title = '新增聯絡人';
    btn.onclick = toggleNewContactInput;
}

// 顯示新增客戶/聯絡人提示
function showClientPrompt(type, name, clientName = null) {
    const modal = document.getElementById('client-prompt-modal');
    const title = document.getElementById('client-prompt-title');
    const message = document.getElementById('client-prompt-message');

    pendingClientData = { type, name, clientName };

    if (type === 'client') {
        title.textContent = '🏢 新客戶';
        message.innerHTML = `"<strong>${name}</strong>" 不在客戶資料庫中。<br>是否將此客戶加入資料庫？`;
    } else {
        title.textContent = '👤 新聯絡人';
        message.innerHTML = `"<strong>${name}</strong>" 不在 "${clientName}" 的聯絡人列表中。<br>是否加入此聯絡人？`;
    }

    modal.classList.add('active');
}

// 確認加入客戶資料庫
function confirmAddToClientDB() {
    if (!pendingClientData) return;

    const { type, name, clientName } = pendingClientData;

    if (type === 'client') {
        addClient(name);
    } else {
        addClient(clientName, name);
    }

    closeClientPrompt();
}

// 取消加入（僅用於此專案）
function cancelAddToClientDB() {
    closeClientPrompt();
}

// 關閉提示彈窗
function closeClientPrompt() {
    document.getElementById('client-prompt-modal').classList.remove('active');
    pendingClientData = null;
}

// 初始化新增專案表單
function initAddProjectForm() {
    // 客戶輸入框事件
    const clientInput = document.getElementById('new-project-client');
    if (clientInput) {
        clientInput.addEventListener('input', (e) => {
            showClientSuggestions(e.target.value);
        });

        clientInput.addEventListener('blur', () => {
            setTimeout(() => {
                document.getElementById('client-suggestions').classList.remove('active');
            }, 200);
        });

        clientInput.addEventListener('focus', (e) => {
            showClientSuggestions(e.target.value);
        });

        clientInput.addEventListener('change', (e) => {
            const clientName = e.target.value.trim();
            if (clientName && !clientExists(clientName)) {
                showClientPrompt('client', clientName);
            }
            updateContactSelect(clientName);
        });
    }

    // 聯絡人選擇事件
    const contactSelect = document.getElementById('new-project-contact');
    if (contactSelect) {
        contactSelect.addEventListener('change', (e) => {
            if (e.target.value === 'new') {
                toggleNewContactInput();
            }
        });
    }
}

// ==================== 客戶資料庫功能結束 ====================

// 業務人員列表
const SALES_REPS = ['姿姿', 'Betty', 'Mia', 'Kevin'];

// 目前登入使用者（暫時固定，待登入系統完成後動態取得）
let currentUser = {
    name: '訪客',
    role: 'guest'
};

// 篩選狀態
let filterState = {
    phase: 'all',
    searchQuery1: '',  // 第一個搜尋框
    searchQuery2: ''   // 第二個搜尋框（可選）
};

// 模擬資料（實際使用時會讀取 YAML 檔案）
// phase: 'quoting' = 報價中, 'pending' = 報價待確認, 'sampling' = 打樣中, 'production' = 生產中, 'completed' = 已完成
const projects = [
    {
        id: "A0008-260316",
        name: "花朵皮革鏡子鑰匙圈",
        client: "易集",
        contact: "Rebecca",
        quantity: "7.5萬個（粉/紅/咖 各25000pcs）",
        deadline: "2026-04-25",
        progress: 35,
        status: "active",
        statusText: "🟢 已下單生產中",
        phase: "production",
        sales_rep: "Kevin",
        tasks: [
            { name: "3/17 提供皮料樣冊", start: "2026-03-17", end: "2026-03-17", progress: 100 },
            { name: "3/17 確認下單（三色各25000pcs）", start: "2026-03-17", end: "2026-03-17", progress: 100 },
            { name: "3/17 下單備料", start: "2026-03-17", end: "2026-03-17", progress: 100 },
            { name: "收到三成訂金", start: "2026-03-17", end: "2026-03-18", progress: 50 },
            { name: "標籤設計（一色印刷，PVC皮革）", start: "2026-03-18", end: "2026-03-20", progress: 0 },
            { name: "確認紅色色卡號", start: "2026-03-18", end: "2026-03-19", progress: 0 },
            { name: "皮料庫存確認", start: "2026-03-17", end: "2026-03-19", progress: 30 },
            { name: "生產製作（4/25交貨）", start: "2026-03-20", end: "2026-04-25", progress: 0 }
        ]
    },
    {
        id: "A0001-260302",
        name: "NFC CD鑰匙圈",
        client: "客主創意",
        contact: "Kaka",
        quantity: "3-4千個",
        deadline: "2026-03-31",
        progress: 40,
        status: "active",
        statusText: "🟡 打樣中",
        phase: "sampling",
        sales_rep: "姿姿",
        tasks: [
            { name: "結構樣-高周波廠", start: "2026-03-10", end: "2026-03-15", progress: 100 },
            { name: "3/20前收Kaka圖稿", start: "2026-03-15", end: "2026-03-20", progress: 60 },
            { name: "5/27打樣完成", start: "2026-03-20", end: "2026-03-27", progress: 20 }
        ]
    },
    {
        id: "A0004-260310",
        name: "無紡布覆膜袋",
        client: "葉林傳",
        contact: "黃姐",
        quantity: "3萬個",
        deadline: "2026-03-23",
        progress: 60,
        status: "active",
        statusText: "🟡 打樣中",
        phase: "sampling",
        sales_rep: "姿姿",
        tasks: [
            { name: "確認姿姿圖稿", start: "2026-03-10", end: "2026-03-13", progress: 100 },
            { name: "Betty跟進報價", start: "2026-03-13", end: "2026-03-17", progress: 100 },
            { name: "本道打樣完成", start: "2026-03-17", end: "2026-03-18", progress: 100 },
            { name: "3/18客戶支付三成訂金", start: "2026-03-18", end: "2026-03-18", progress: 100 },
            { name: "打樣到貨", start: "2026-03-18", end: "2026-03-23", progress: 30 }
        ]
    },
    {
        id: "A0009-260316",
        name: "馬克杯定制（摩天輪圖案）",
        client: "北市商",
        contact: "鳳翎主任",
        quantity: "100個",
        deadline: "等3/25會議",
        progress: 30,
        status: "active",
        statusText: "🟡 報價待確認",
        phase: "pending",
        sales_rep: "姿姿",
        quoteDate: "3/16",
        tasks: [
            { name: "3/16 Kevin已報價給客戶", start: "2026-03-16", end: "2026-03-16", progress: 100 },
            { name: "3/25行政會議確認", start: "2026-03-25", end: "2026-03-25", progress: 0 },
            { name: "確認下單製作", start: "2026-03-25", end: "2026-03-26", progress: 0 },
            { name: "確認摩天輪圖案規格", start: "2026-03-16", end: "2026-03-25", progress: 50 }
        ]
    },
    {
        id: "A0001-260301",
        name: "KKbox NFC高周波鑰匙圈",
        client: "客主創意",
        contact: "Nina",
        quantity: "3-4千個",
        deadline: "2026-03-20",
        progress: 65,
        status: "active",
        statusText: "🟡 打樣中",
        phase: "sampling",
        sales_rep: "姿姿",
        tasks: [
            { name: "NFC晶片追蹤", start: "2026-03-10", end: "2026-03-15", progress: 100 },
            { name: "高周波廠確認", start: "2026-03-15", end: "2026-03-18", progress: 90 },
            { name: "生產排程", start: "2026-03-18", end: "2026-03-20", progress: 30 }
        ]
    },
    {
        id: "A0002-260301",
        name: "杜蕾斯晶片",
        client: "台灣銘板",
        contact: "名城",
        quantity: "4-5千個",
        deadline: "2026-04-05",
        progress: 15,
        status: "active",
        statusText: "🟡 準備打樣",
        phase: "sampling",
        sales_rep: "姿姿",
        tasks: [
            { name: "確認新羽起算日", start: "2026-03-16", end: "2026-03-18", progress: 70 },
            { name: "確認打樣規格", start: "2026-03-18", end: "2026-03-22", progress: 20 },
            { name: "打樣製作", start: "2026-03-22", end: "2026-04-05", progress: 0 }
        ]
    },
    {
        id: "A0005-260316",
        name: "冰壩杯",
        client: "進豐",
        contact: "Sam",
        quantity: "待確認",
        deadline: "待確認",
        progress: 10,
        status: "active",
        statusText: "🟡 報價待確認",
        phase: "pending",
        sales_rep: "姿姿",
        quoteDate: "待確認",
        tasks: [
            { name: "姿姿提供照片", start: "2026-03-16", end: "2026-03-18", progress: 80 },
            { name: "確認交期", start: "2026-03-18", end: "2026-03-20", progress: 30 },
            { name: "報價回覆", start: "2026-03-20", end: "2026-04-10", progress: 0 }
        ]
    },
    {
        id: "A0006-260301",
        name: "壓克力翡翠盒",
        client: "客主創意",
        contact: "kaka",
        quantity: "待確認",
        deadline: "打樣修正",
        progress: 40,
        status: "active",
        statusText: "🟡 打樣修正",
        phase: "sampling",
        sales_rep: "姿姿",
        tasks: [
            { name: "本道補木板", start: "2026-03-16", end: "2026-03-20", progress: 60 },
            { name: "kaka確認修正樣品", start: "2026-03-20", end: "2026-03-25", progress: 10 },
            { name: "重新打樣", start: "2026-03-25", end: "2026-03-28", progress: 0 }
        ]
    },
    {
        id: "A0007-260309",
        name: "白沙屯香火袋",
        client: "台灣銘板-郭昱暘",
        contact: "-",
        quantity: "4,236個",
        deadline: "2026-03-09",
        progress: 100,
        status: "completed",
        statusText: "✅ 已完成",
        phase: "completed",
        tasks: [
            { name: "已出貨完成", start: "2026-03-09", end: "2026-03-09", progress: 100 }
        ]
    },
    {
        id: "A0010-260317",
        name: "20寸/28寸行李箱+logo印刷",
        client: "高柏科技",
        contact: "Joanne",
        quantity: "待確認",
        deadline: "預計這兩天下單",
        progress: 30,
        status: "active",
        statusText: "🟡 議價中",
        phase: "quoting",
        sales_rep: "姿姿",
        tasks: [
            { name: "3/17 Joanne來電議價", start: "2026-03-17", end: "2026-03-17", progress: 100, assigned_to: "姿姿" },
            { name: "回覆依照原價送審", start: "2026-03-17", end: "2026-03-17", progress: 100, assigned_to: "姿姿" },
            { name: "等待送審結果", start: "2026-03-17", end: "2026-03-19", progress: 50, assigned_to: "姿姿" },
            { name: "客戶確認下單", start: "2026-03-19", end: "2026-03-20", progress: 0, assigned_to: "姿姿" },
            { name: "下採購單給大陸廠商", start: "2026-03-20", end: "2026-03-21", progress: 0, assigned_to: "姿姿" },
            { name: "大陸廠商安排定制", start: "2026-03-21", end: "2026-04-15", progress: 0, assigned_to: "姿姿" }
        ]
    },
    {
        id: "A0011-260316",
        name: "五十嵐紙卡+冷錢包卡片包裝",
        client: "台灣銘板",
        contact: "名城",
        quantity: "3k+待確認",
        deadline: "3/20前報價",
        progress: 40,
        status: "active",
        statusText: "🟡 報價中",
        phase: "quoting",
        sales_rep: "Betty",
        tasks: [
            { name: "3/16 名城發新需求詢價", start: "2026-03-16", end: "2026-03-16", progress: 100 },
            { name: "Kevin口頭回覆可以", start: "2026-03-16", end: "2026-03-16", progress: 100 },
            { name: "評估五十嵐紙卡成本", start: "2026-03-17", end: "2026-03-19", progress: 50 },
            { name: "評估冷錢包卡片包裝成本", start: "2026-03-17", end: "2026-03-19", progress: 30 },
            { name: "3/20前提供正式報價單", start: "2026-03-19", end: "2026-03-20", progress: 0 }
        ]
    },
    {
        id: "A0012-260317",
        name: "新加坡華人博物館-3D造型卡",
        client: "台銘",
        contact: "名城",
        quantity: "2K/3K",
        deadline: "待確認",
        progress: 20,
        status: "active",
        statusText: "🟡 詢價中",
        phase: "quoting",
        sales_rep: "Betty",
        tasks: [
            { name: "收到ezLink新案件需求", start: "2026-03-17", end: "2026-03-17", progress: 100 },
            { name: "評估娘惹蓋盅3D造型卡", start: "2026-03-17", end: "2026-03-19", progress: 30 },
            { name: "評估娘惹搪瓷餐盒3D造型卡", start: "2026-03-17", end: "2026-03-19", progress: 30 },
            { name: "確認ABS/PVC材質可行性", start: "2026-03-17", end: "2026-03-18", progress: 50 },
            { name: "回覆印刷程度及感應位置建議", start: "2026-03-18", end: "2026-03-20", progress: 0 }
        ]
    },
    {
        id: "A0013-260317",
        name: "SSSTC無紡布手提織帶",
        client: "寶宸",
        contact: "RAY",
        quantity: "3,000個",
        deadline: "未定",
        progress: 10,
        status: "active",
        statusText: "🟡 送樣中",
        phase: "sampling",
        sales_rep: "姿姿",
        tasks: [
            { name: "請本道提供織帶樣品", start: "2026-03-17", end: "2026-03-17", progress: 100 },
            { name: "等待廠商提供可定染織帶", start: "2026-03-17", end: "2026-03-20", progress: 20 },
            { name: "提供給客戶選擇", start: "2026-03-20", end: "2026-03-22", progress: 0 },
            { name: "確認織帶款式及定染顏色", start: "2026-03-22", end: "2026-03-24", progress: 0 },
            { name: "安排打樣", start: "2026-03-24", end: "2026-03-27", progress: 0 }
        ]
    },
    {
        id: "A0014-260324",
        name: "飲料提袋",
        client: "易集",
        contact: "Julie",
        quantity: "3000 pcs（初估，待確認）",
        deadline: "待確認",
        progress: 10,
        status: "active",
        statusText: "🔵 報價中",
        phase: "quoting",
        sales_rep: "Kevin",
        clientMaterials: [
            {
                date: "2026-03-24",
                description: "客戶提供參考照片",
                notes: "蠟筆小新提袋、Lulu豬系列共3張",
                images: [
                    "projects/active/2026-0324-易集-飲料提袋/references/01-蠟筆小新提袋.jpg",
                    "projects/active/2026-0324-易集-飲料提袋/references/02-Lulu豬-中秋燒烤.jpg",
                    "projects/active/2026-0324-易集-飲料提袋/references/03-Lulu豬-CityCafe聯名系列.jpg"
                ]
            }
        ],
        tasks: [
            { name: "已傳資料給廠商報價（新羽-吳生）", start: "2026-03-24", end: "2026-03-24", progress: 100 },
            { name: "等待廠商報價回覆", start: "2026-03-24", end: "", progress: 0 },
            { name: "提供客戶正式報價", start: "", end: "", progress: 0 }
        ]
    },
    {
        id: "A0015-260324",
        name: "kitty造型皮革鏡掛飾",
        client: "易集",
        contact: "Julie",
        quantity: "估價10萬跟50萬",
        deadline: "未定",
        progress: 20,
        status: "active",
        statusText: "🟡 打樣中",
        phase: "sampling",
        sales_rep: "Kevin",
        tasks: [
            { name: "3/24安排打樣（新羽-吳生）", start: "2026-03-24", end: "2026-03-26", progress: 0, assigned_to: "Kevin" },
            { name: "3/26新羽提供樣品照片與報價單", start: "2026-03-26", end: "2026-03-26", progress: 0, assigned_to: "新羽-吳生" },
            { name: "確認樣品無誤安排寄出（順豐）", start: "2026-03-26", end: "2026-03-28", progress: 0, assigned_to: "Kevin" },
            { name: "3/30台灣收到樣品", start: "2026-03-30", end: "2026-03-30", progress: 0, assigned_to: "Kevin" },
            { name: "姿姿安排叫寄貨運給客戶", start: "2026-03-30", end: "", progress: 0, assigned_to: "姿姿" }
        ]
    },
    {
        id: "A0016-260324",
        name: "BT21 壓克力SuperCard造型悠遊卡-Ribbon(悠遊卡)",
        client: "台灣銘版",
        contact: "名城",
        quantity: "5000 pcs",
        deadline: "待確認",
        progress: 10,
        status: "active",
        statusText: "🔵 報價中",
        phase: "quoting",
        sales_rep: "Kevin",
        tasks: [
            { name: "客戶提供詢價資料", start: "2026-03-23", end: "2026-03-23", progress: 100, assigned_to: "Kevin" },
            { name: "發給本道紙塑-陳先生估價", start: "2026-03-24", end: "2026-03-24", progress: 0, assigned_to: "Kevin" },
            { name: "整理報價並傳給客戶", start: "2026-03-25", end: "2026-03-25", progress: 0, assigned_to: "Kevin" }
        ]
    }
];

// 初始化
function init() {
    // 載入 LocalStorage 儲存的專案
    initProjects();

    // 初始化客戶資料庫
    initClientsDB();

    // 初始化新增專案表單
    initAddProjectForm();

    updateStatusBar();
    renderProposalView();
    renderQuoteView();
    renderSampleView();
    renderProductionView();
    renderGantt();
    renderList();
    updateTime();
    initSalesRepFilter(); // 初始化人員篩選器
}

// 更新狀態列
function updateStatusBar() {
    const urgent = projects.filter(p => p.status === 'urgent').length;
    const quoting = projects.filter(p => p.phase === 'quoting').length;
    const pending = projects.filter(p => p.phase === 'pending').length;
    const sampling = projects.filter(p => p.phase === 'sampling' || p.phase === 'production').length;
    const completed = projects.filter(p => p.phase === 'completed').length;

    document.getElementById('urgent-count').textContent = urgent;
    document.getElementById('quote-count').textContent = quoting;
    document.getElementById('pending-count').textContent = pending;
    document.getElementById('sample-count').textContent = sampling;
    document.getElementById('completed-count').textContent = completed;
}

// 更新時間
function updateTime() {
    const now = new Date();
    document.getElementById('update-time').textContent =
        now.toLocaleDateString('zh-TW') + ' ' + now.toLocaleTimeString('zh-TW', {hour: '2-digit', minute: '2-digit'});
}

// 切換視圖
function showView(viewName) {
    console.log('showView called:', viewName);

    document.querySelectorAll('.view').forEach(v => v.classList.remove('active'));
    document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));

    const viewEl = document.getElementById(viewName + '-view');
    if (viewEl) {
        viewEl.classList.add('active');
    } else {
        console.error('View not found:', viewName + '-view');
    }

    // 渲染對應視圖
    switch(viewName) {
        case 'list': renderList(); break;
        case 'proposal': renderProposalView(); break;
        case 'quote': renderQuoteView(); break;
        case 'sample': renderSampleView(); break;
        case 'production': renderProductionView(); break;
        case 'pending-confirm': renderPendingConfirmView(); break;
        case 'closed': renderClosedView(); break;
    }
}

// 渲染報價階段視圖
function renderQuoteView() {
    // 報價中
    const quotingContainer = document.getElementById('quoting-projects');
    quotingContainer.innerHTML = '';
    const quotingProjects = projects.filter(p => p.phase === 'quoting');

    quotingProjects.forEach(project => {
        const card = createProjectCard(project);
        quotingContainer.appendChild(card);
    });

    // 報價待確認
    const pendingContainer = document.getElementById('pending-projects');
    pendingContainer.innerHTML = '';
    const pendingProjects = projects.filter(p => p.phase === 'pending');

    pendingProjects.forEach(project => {
        const card = createProjectCard(project);
        pendingContainer.appendChild(card);
    });
}

// 篩選報價待確認專案
function filterPendingProjects() {
    const searchTerm = document.getElementById('pending-search').value.toLowerCase();
    const pendingContainer = document.getElementById('pending-projects');
    pendingContainer.innerHTML = '';

    const filtered = projects.filter(p => {
        if (p.phase !== 'pending') return false;
        const matchClient = p.client.toLowerCase().includes(searchTerm);
        const matchContact = p.contact.toLowerCase().includes(searchTerm);
        const matchName = p.name.toLowerCase().includes(searchTerm);
        return matchClient || matchContact || matchName;
    });

    filtered.forEach(project => {
        const card = createProjectCard(project);
        pendingContainer.appendChild(card);
    });
}

// 渲染提案階段視圖
function renderProposalView() {
    // 提案中
    const proposingContainer = document.getElementById('proposing-projects');
    if (proposingContainer) {
        proposingContainer.innerHTML = '';
        const proposingProjects = projects.filter(p => p.phase === 'proposing');

        proposingProjects.forEach(project => {
            const card = createProjectCard(project);
            proposingContainer.appendChild(card);
        });
    }

    // 提案待確認
    const proposalPendingContainer = document.getElementById('proposal-pending-projects');
    if (proposalPendingContainer) {
        proposalPendingContainer.innerHTML = '';
        const proposalPendingProjects = projects.filter(p => p.phase === 'proposal_pending');

        proposalPendingProjects.forEach(project => {
            const card = createProjectCard(project);
            proposalPendingContainer.appendChild(card);
        });
    }
}

// 篩選提案待確認專案
function filterProposalProjects() {
    const searchTerm = document.getElementById('proposal-search')?.value.toLowerCase() || '';
    const container = document.getElementById('proposal-pending-projects');
    if (!container) return;

    container.innerHTML = '';
    const filtered = projects.filter(p => {
        if (p.phase !== 'proposal_pending') return false;
        const matchClient = p.client.toLowerCase().includes(searchTerm);
        const matchContact = p.contact.toLowerCase().includes(searchTerm);
        const matchName = p.name.toLowerCase().includes(searchTerm);
        return matchClient || matchContact || matchName;
    });

    filtered.forEach(project => {
        const card = createProjectCard(project);
        container.appendChild(card);
    });
}

// 渲染打樣後階段視圖
function renderSampleView() {
    // 打樣中 / 打樣修正
    const samplingContainer = document.getElementById('sampling-projects');
    samplingContainer.innerHTML = '';
    const samplingProjects = projects.filter(p => p.phase === 'sampling');

    samplingProjects.forEach(project => {
        const card = createProjectCard(project);
        samplingContainer.appendChild(card);
    });
}

// 渲染生產階段視圖
function renderProductionView() {
    // 生產中
    const productionContainer = document.getElementById('production-only-projects');
    productionContainer.innerHTML = '';
    const productionProjects = projects.filter(p => p.phase === 'production');

    productionProjects.forEach(project => {
        const card = createProjectCard(project);
        productionContainer.appendChild(card);
    });

    // 即將出貨（這裡可以根據實際需求篩選接近截止日的專案）
    const shippingContainer = document.getElementById('shipping-projects');
    shippingContainer.innerHTML = '';
    // 篩選截止日在 7 天內的專案
    const today = new Date();
    const upcomingProjects = projects.filter(p => {
        if (p.phase !== 'production') return false;
        const deadline = new Date(p.deadline);
        const diffDays = Math.ceil((deadline - today) / (1000 * 60 * 60 * 24));
        return diffDays <= 7 && diffDays >= 0;
    });

    upcomingProjects.forEach(project => {
        const card = createProjectCard(project);
        shippingContainer.appendChild(card);
    });
}

// 渲染待確認專案視圖
function renderPendingConfirmView() {
    // 提案待確認
    const proposalPendingContainer = document.getElementById('pending-confirm-proposal');
    proposalPendingContainer.innerHTML = '';
    const proposalPendingProjects = projects.filter(p => p.phase === 'proposal_pending');

    proposalPendingProjects.forEach(project => {
        const card = createProjectCard(project);
        proposalPendingContainer.appendChild(card);
    });

    // 報價待確認
    const quotePendingContainer = document.getElementById('pending-confirm-quote');
    quotePendingContainer.innerHTML = '';
    const quotePendingProjects = projects.filter(p => p.phase === 'pending');

    quotePendingProjects.forEach(project => {
        const card = createProjectCard(project);
        quotePendingContainer.appendChild(card);
    });
}

// 建立專案卡片
function createProjectCard(project) {
    const card = document.createElement('div');
    card.className = `project-card ${project.status}`;

    const quoteInfo = project.quoteDate ? `<span class="quote-date">報價日: ${project.quoteDate}</span>` : '';

    // 所有未完成專案都顯示結案按鈕（除了已結案的）
    const isCompleted = project.phase === 'completed' || project.isClosed;
    const closeCaseBtns = !isCompleted ? `
        <button class="btn-close-case-complete" onclick="event.stopPropagation(); closeProjectCaseComplete('${project.id}')">✅ 完成結案</button>
        <button class="btn-close-case-incomplete" onclick="event.stopPropagation(); closeProjectCaseIncomplete('${project.id}')">⏸️ 未完成結案</button>
    ` : `
        <button class="btn-reopen-case" onclick="event.stopPropagation(); reopenProjectCase('${project.id}')">↩️ 撤回結案</button>
    `;

    const buttonsHtml = `
        <div class="card-buttons">
            ${closeCaseBtns}
        </div>
    `;

    card.innerHTML = `
        <div class="card-header">
            <span class="card-id">${project.id}</span>
            <span class="card-status ${project.status}">${project.statusText}</span>
        </div>
        <div class="card-title">${project.name}</div>
        <div class="card-client">${project.client} / ${project.contact}</div>
        <div class="card-meta">
            <span>📦 ${project.quantity}</span>
            <span>📅 ${project.deadline}</span>
        </div>
        ${quoteInfo}
        <div class="progress-bar">
            <div class="progress-fill" style="width: ${project.progress}%"></div>
        </div>
        <div class="progress-text">${project.progress}% 完成</div>
        ${buttonsHtml}
    `;

    // 點擊卡片直接顯示待辦事項（按鈕除外）
    card.onclick = (e) => {
        if (!e.target.closest('.card-buttons')) {
            showProjectTodo(project.id, 'incomplete');
        }
    };

    return card;
}

// 完成結案 - 進度設為100%，所有任務標記完成
function closeProjectCaseComplete(projectId) {
    const project = projects.find(p => p.id === projectId);
    if (!project) return;

    if (!confirm('確定要完成結案嗎？這將把專案進度設為100%並標記所有任務為已完成。')) {
        return;
    }

    // 標記為已完成結案
    project.isClosed = true;
    project.closedAt = new Date().toISOString();
    project.closedPhase = project.phase;
    project.phase = 'completed';
    project.statusText = '✅ 已完成結案';
    project.progress = 100;

    // 將所有任務標記為完成，並儲存原始進度
    if (project.tasks && project.tasks.length > 0) {
        project.tasks.forEach(task => {
            // 儲存原始進度（用於撤回時還原）
            if (task.progress < 100) {
                task.originalProgress = task.progress;
            }
            task.progress = 100;
            task.completed_at = new Date().toISOString();
        });
    }

    // 儲存
    saveProjectsToLocalStorage();

    // 重新渲染所有視圖
    renderAllViews();

    showTodoToast('✅ 專案已完成結案');
}

// 未完成結案 - 保留進度，隱藏任務
function closeProjectCaseIncomplete(projectId) {
    const project = projects.find(p => p.id === projectId);
    if (!project) return;

    if (!confirm('確定要未完成結案嗎？這將保留專案進度，但不再顯示在負責人待辦事項中。')) {
        return;
    }

    // 標記為未完成結案
    project.isClosed = true;
    project.closedAt = new Date().toISOString();
    project.closedPhase = project.phase;
    project.phase = 'completed';
    project.statusText = '⏸️ 未完成結案';
    // 保留原有進度

    // 隱藏任務 - 標記為隱藏
    if (project.tasks && project.tasks.length > 0) {
        project.tasks.forEach(task => {
            task.isHidden = true;
        });
    }

    // 儲存
    saveProjectsToLocalStorage();

    // 重新渲染所有視圖
    renderAllViews();

    showTodoToast('⏸️ 專案已未完成結案');
}

// 撤回結案 - 恢復專案到結案前的狀態
function reopenProjectCase(projectId) {
    const project = projects.find(p => p.id === projectId);
    if (!project) return;

    if (!confirm('確定要撤回結案嗎？這將恢復專案到結案前的狀態，任務進度也會還原。')) {
        return;
    }

    // 恢復結案前的狀態
    project.isClosed = false;
    project.phase = project.closedPhase || 'proposing';
    project.statusText = getStatusText(project.phase);
    delete project.closedAt;
    delete project.closedPhase;

    // 恢復任務顯示並還原進度
    if (project.tasks && project.tasks.length > 0) {
        project.tasks.forEach(task => {
            // 移除隱藏標記
            delete task.isHidden;
            // 還原任務進度（如果之前有儲存 originalProgress）
            if (task.originalProgress !== undefined) {
                task.progress = task.originalProgress;
                delete task.originalProgress;
            }
            // 移除完成時間（如果是完成結案）
            if (task.completed_at && task.progress < 100) {
                delete task.completed_at;
            }
        });
    }

    // 重新計算專案進度（根據任務平均進度）
    updateProjectProgress(project);

    // 儲存
    saveProjectsToLocalStorage();

    // 重新渲染所有視圖
    renderAllViews();

    showTodoToast('↩️ 專案已撤回結案');
}

// 根據階段取得狀態文字
function getStatusText(phase) {
    const statusMap = {
        'proposing': '💡 提案中',
        'proposal_pending': '📤 提案待確認',
        'quoting': '📋 報價中',
        'pending': '🔵 報價待確認',
        'sampling': '🔨 打樣中',
        'production': '🏭 生產中',
        'completed': '✅ 已完成'
    };
    return statusMap[phase] || '💡 提案中';
}

// 渲染甘特圖
function renderGantt() {
    const filter = document.getElementById('gantt-phase-filter')?.value || 'all';
    const container = document.getElementById('gantt-chart');
    container.innerHTML = '';

    let filteredProjects = projects;
    if (filter === 'quote') {
        filteredProjects = projects.filter(p => p.phase === 'quoting' || p.phase === 'pending');
    } else if (filter === 'sample') {
        filteredProjects = projects.filter(p => p.phase === 'sampling' || p.phase === 'production');
    }

    // 計算時間範圍
    const today = new Date();
    const minDate = new Date(today);
    minDate.setDate(minDate.getDate() - 7);
    const maxDate = new Date(today);
    maxDate.setDate(maxDate.getDate() + 30);

    const totalDays = (maxDate - minDate) / (1000 * 60 * 60 * 24);

    // 建立時間刻度
    const headerRow = document.createElement('div');
    headerRow.className = 'gantt-timeline-header sticky-header';

    let headerHtml = '<div class="gantt-task-label">專案 / 任務</div>';
    headerHtml += '<div class="gantt-timeline-track-header">';
    for (let i = 0; i <= totalDays; i += 3) {
        const date = new Date(minDate);
        date.setDate(date.getDate() + i);
        const dayLabel = date.getMonth() + 1 + '/' + date.getDate();
        headerHtml += `<div class="gantt-day-label" style="left: ${(i / totalDays) * 100}%">${dayLabel}</div>`;
    }
    headerHtml += '</div>';
    headerRow.innerHTML = headerHtml;
    container.appendChild(headerRow);

    // 滾動內容區域
    const scrollContainer = document.createElement('div');
    scrollContainer.className = 'gantt-scroll-container';

    // 顯示專案
    filteredProjects.forEach((project, projectIndex) => {
        if (project.phase === 'completed') return;

        const projectContainer = document.createElement('div');
        projectContainer.className = 'gantt-project-container';

        // 專案標題列
        const projectRow = document.createElement('div');
        projectRow.className = 'gantt-project-row collapsible';
        projectRow.dataset.projectId = projectIndex;
        projectRow.onclick = () => toggleProjectTasks(projectIndex);

        const projectStart = new Date(project.tasks[0]?.start || project.deadline);
        const projectEnd = new Date(project.tasks[project.tasks.length - 1]?.end || project.deadline);
        const projectStartOffset = (projectStart - minDate) / (1000 * 60 * 60 * 24);
        const projectDuration = (projectEnd - projectStart) / (1000 * 60 * 60 * 24) + 1;

        const leftPercent = (projectStartOffset / totalDays) * 100;
        const widthPercent = (projectDuration / totalDays) * 100;

        projectRow.innerHTML = `
            <div class="gantt-task-label project-name">
                <span class="collapse-icon">▼</span>
                <strong>${project.id}</strong> ${project.name}
                <span class="project-status ${project.status}">${project.statusText.replace(/[🔴🟡🟢]/g, '')}</span>
            </div>
            <div class="gantt-timeline-track">
                <div class="gantt-project-bar ${project.status}"
                     style="left: ${leftPercent}%; width: ${Math.max(widthPercent, 2)}%"
                     title="${projectStart.toLocaleDateString('zh-TW')} ~ ${projectEnd.toLocaleDateString('zh-TW')}">
                    <span class="project-date-range">${projectStart.getMonth() + 1}/${projectStart.getDate()} ~ ${projectEnd.getMonth() + 1}/${projectEnd.getDate()}</span>
                </div>
            </div>
        `;
        projectContainer.appendChild(projectRow);

        // 任務容器
        const tasksContainer = document.createElement('div');
        tasksContainer.className = 'gantt-tasks-container expanded';
        tasksContainer.id = `gantt-tasks-${projectIndex}`;

        project.tasks.forEach((task, index) => {
            const taskRow = document.createElement('div');
            taskRow.className = 'gantt-task-row';

            const taskStart = new Date(task.start);
            const taskEnd = new Date(task.end);

            const startOffset = (taskStart - minDate) / (1000 * 60 * 60 * 24);
            const duration = (taskEnd - taskStart) / (1000 * 60 * 60 * 24) + 1;

            const leftPercent = (startOffset / totalDays) * 100;
            const widthPercent = (duration / totalDays) * 100;

            let taskStatus = 'pending';
            if (task.progress === 100) taskStatus = 'completed';
            else if (task.progress > 0) taskStatus = 'in-progress';

            const isOverdue = taskEnd < today && task.progress < 100;

            taskRow.innerHTML = `
                <div class="gantt-task-label">
                    <span class="task-number">${index + 1}</span>
                    ${task.name}
                    ${isOverdue ? '<span class="overdue-badge">逾期</span>' : ''}
                </div>
                <div class="gantt-timeline-track">
                    <div class="gantt-task-bar ${taskStatus}"
                         style="left: ${leftPercent}%; width: ${Math.max(widthPercent, 2)}%">
                        <div class="task-progress" style="width: ${task.progress}%"></div>
                        <span class="task-date">${task.start} ~ ${task.end}</span>
                    </div>
                </div>
            `;

            tasksContainer.appendChild(taskRow);
        });

        projectContainer.appendChild(tasksContainer);

        const separator = document.createElement('div');
        separator.className = 'gantt-separator';
        projectContainer.appendChild(separator);

        scrollContainer.appendChild(projectContainer);
    });

    container.appendChild(scrollContainer);
}

// 折疊/展開任務
function toggleProjectTasks(projectIndex) {
    const tasksContainer = document.getElementById(`gantt-tasks-${projectIndex}`);
    const projectRow = document.querySelector(`.gantt-project-row[data-project-id="${projectIndex}"]`);
    const icon = projectRow.querySelector('.collapse-icon');

    if (tasksContainer.classList.contains('expanded')) {
        tasksContainer.classList.remove('expanded');
        tasksContainer.classList.add('collapsed');
        icon.textContent = '▶';
        projectRow.classList.add('collapsed');
    } else {
        tasksContainer.classList.remove('collapsed');
        tasksContainer.classList.add('expanded');
        icon.textContent = '▼';
        projectRow.classList.remove('collapsed');
    }
}

// 渲染清單
function renderList() {
    const filter = document.getElementById('list-phase-filter')?.value || 'all';
    const tbody = document.getElementById('project-list-body');

    if (!tbody) {
        console.error('找不到 project-list-body 元素');
        return;
    }

    if (!projects || projects.length === 0) {
        console.error('projects 陣列為空');
        return;
    }

    tbody.innerHTML = '';

    // 只顯示未完成的專案（排除已結案的）
    let filtered = projects.filter(p => !p.isClosed && p.phase !== 'completed');

    if (filter !== 'all') {
        filtered = filtered.filter(p => p.phase === filter);
    }

    filtered.forEach(project => {
        const row = document.createElement('tr');

        const phaseMap = {
            'quoting': '報價中',
            'pending': '報價待確認',
            'sampling': '打樣中',
            'production': '生產中',
            'completed': '已完成',
            'proposing': '提案中',
            'proposal_pending': '提案待確認'
        };

        const closeButtons = `
            <button onclick="event.stopPropagation(); closeProjectCaseComplete('${project.id}')" style="padding: 4px 8px; background: #10b981; color: white; border: none; border-radius: 4px; font-size: 11px; cursor: pointer; margin-right: 4px;" title="完成結案">✅</button>
            <button onclick="event.stopPropagation(); closeProjectCaseIncomplete('${project.id}')" style="padding: 4px 8px; background: #f59e0b; color: white; border: none; border-radius: 4px; font-size: 11px; cursor: pointer;" title="未完成結案">⏸️</button>
        `;

        row.innerHTML = `
            <td><strong>${project.id}</strong></td>
            <td>${project.client}<br><small style="color:#888">${project.contact}</small></td>
            <td>${project.name}</td>
            <td>${project.quantity}</td>
            <td>${project.deadline}</td>
            <td class="progress-cell" onclick="showProjectGantt('${project.id}')" title="點擊查看甘特圖">
                <div class="progress-bar" style="width: 80px; display: inline-block; cursor: pointer;">
                    <div class="progress-fill" style="width: ${project.progress}%"></div>
                </div>
                <span style="font-size: 12px; color: #666; margin-left: 5px; cursor: pointer;">${project.progress}% 📊</span>
            </td>
            <td>
                <select class="phase-select ${project.phase}" onchange="updateProjectPhase('${project.id}', this.value)" onclick="event.stopPropagation()">
                    <option value="proposing" ${project.phase === 'proposing' ? 'selected' : ''}>💡 提案</option>
                    <option value="proposal_pending" ${project.phase === 'proposal_pending' ? 'selected' : ''}>📤 提案待確認</option>
                    <option value="quoting" ${project.phase === 'quoting' ? 'selected' : ''}>📋 報價</option>
                    <option value="pending" ${project.phase === 'pending' ? 'selected' : ''}>🔵 報價待確認</option>
                    <option value="sampling" ${project.phase === 'sampling' ? 'selected' : ''}>🔨 打樣</option>
                    <option value="production" ${project.phase === 'production' ? 'selected' : ''}>🏭 生產</option>
                    <option value="completed" ${project.phase === 'completed' ? 'selected' : ''}>✅ 已完成</option>
                </select>
            </td>
            <td style="white-space: nowrap;">${closeButtons}</td>
        `;
        tbody.appendChild(row);
    });
}

// 渲染已結案視圖
function renderClosedView() {
    const tbody = document.getElementById('closed-projects-list');
    if (!tbody) return;

    tbody.innerHTML = '';

    // 取得篩選條件
    const filter = document.getElementById('closed-filter')?.value || 'all';
    const searchQuery = document.getElementById('closed-search')?.value?.trim().toLowerCase() || '';

    // 只顯示已結案的專案
    let closedProjects = projects.filter(p => p.isClosed || p.phase === 'completed');

    // 應用結案類型篩選
    if (filter === 'complete') {
        closedProjects = closedProjects.filter(p => p.progress === 100);
    } else if (filter === 'incomplete') {
        closedProjects = closedProjects.filter(p => p.progress < 100);
    }

    // 應用搜尋篩選（模糊搜尋客戶或產品）
    if (searchQuery) {
        closedProjects = closedProjects.filter(p => {
            const clientMatch = p.client?.toLowerCase().includes(searchQuery);
            const nameMatch = p.name?.toLowerCase().includes(searchQuery);
            return clientMatch || nameMatch;
        });
    }

    if (closedProjects.length === 0) {
        tbody.innerHTML = '<tr><td colspan="8" style="text-align: center; padding: 40px; color: #9ca3af;">暫無符合條件的已結案專案</td></tr>';
        return;
    }

    closedProjects.forEach(project => {
        const row = document.createElement('tr');

        // 判斷結案類型
        const isCompleteClose = project.progress === 100;
        const closeType = isCompleteClose ?
            '<span style="color: #10b981; font-weight: 500;">✅ 已完成結案</span>' :
            '<span style="color: #f59e0b; font-weight: 500;">⏸️ 未完成結案</span>';

        row.innerHTML = `
            <td><strong>${project.id}</strong></td>
            <td>${project.client}<br><small style="color:#888">${project.contact}</small></td>
            <td>${project.name}</td>
            <td>${project.quantity}</td>
            <td>${project.deadline}</td>
            <td>
                <div class="progress-bar" style="width: 80px; display: inline-block;">
                    <div class="progress-fill" style="width: ${project.progress}%"></div>
                </div>
                <span style="font-size: 12px; color: #666; margin-left: 5px;">${project.progress}%</span>
            </td>
            <td>${closeType}</td>
            <td style="white-space: nowrap;">
                <button onclick="event.stopPropagation(); reopenProjectCase('${project.id}')" style="padding: 6px 12px; background: #3b82f6; color: white; border: none; border-radius: 4px; font-size: 12px; cursor: pointer;" title="撤回結案"
>↩️ 撤回結案</button>
            </td>
        `;
        tbody.appendChild(row);
    });
}

// 顯示專案詳情
function showProjectDetail(project) {
    const modal = document.getElementById('project-modal');
    const body = document.getElementById('modal-body');

    const tasksHtml = project.tasks.map((task, index) => {
        const today = new Date();
        const taskEnd = new Date(task.end);
        const isOverdue = taskEnd < today && task.progress < 100;

        let statusIcon = '⏳';
        if (task.progress === 100) statusIcon = '✅';
        else if (task.progress > 0) statusIcon = '🔄';

        return `
            <li class="task-item ${isOverdue ? 'overdue' : ''}">
                <div class="task-main">
                    <span class="task-status-icon">${statusIcon}</span>
                    <span class="task-name">${task.name}</span>
                    ${isOverdue ? '<span class="badge-overdue">逾期</span>' : ''}
                </div>
                <div class="task-meta">
                    <span class="task-date">📅 ${task.start} → ${task.end}</span>
                    <span class="task-progress">${task.progress}%</span>
                </div>
                <div class="task-progress-bar">
                    <div class="task-progress-fill" style="width: ${task.progress}%"></div>
                </div>
            </li>
        `;
    }).join('');

    const quoteInfo = project.quoteDate ? `<p><strong>報價日期:</strong> ${project.quoteDate}</p>` : '';

    body.innerHTML = `
        <h2>${project.name}</h2>
        <div class="project-info-grid">
            <div class="info-item"><span class="info-label">編號</span><span class="info-value">${project.id}</span></div>
            <div class="info-item"><span class="info-label">客戶</span><span class="info-value">${project.client}</span></div>
            <div class="info-item"><span class="info-label">聯絡人</span><span class="info-value">${project.contact}</span></div>
            <div class="info-item"><span class="info-label">數量</span><span class="info-value">${project.quantity}</span></div>
            <div class="info-item"><span class="info-label">截止日</span><span class="info-value ${project.status === 'urgent' ? 'text-urgent' : ''}">${project.deadline}</span></div>
            <div class="info-item"><span class="info-label">狀態</span><span class="info-value"><span class="card-status ${project.status}">${project.statusText}</span></span></div>
        </div>
        ${quoteInfo}
        <div class="project-progress-section">
            <div class="progress-header"><strong>整體進度</strong><span class="progress-percent">${project.progress}%</span></div>
            <div class="progress-bar large"><div class="progress-fill" style="width: ${project.progress}%"></div></div>
        </div>
        <div class="project-tasks-section">
            <h3>📝 任務清單</h3>
            <ul class="task-list">${tasksHtml}</ul>
        </div>
    `;

    modal.classList.add('active');
}

// 關閉彈窗
function closeModal() {
    document.getElementById('project-modal').classList.remove('active');
}

// 點擊彈窗外關閉
window.onclick = function(event) {
    const modal = document.getElementById('project-modal');
    if (event.target === modal) {
        modal.classList.remove('active');
    }
}

// Excel匯出
function exportToExcel() {
    const exportData = [];

    projects.forEach(p => {
        const phaseMap = {
            'quoting': '報價中',
            'pending': '報價待確認',
            'sampling': '打樣中',
            'production': '生產中',
            'completed': '已完成'
        };

        p.tasks.forEach((task, index) => {
            exportData.push({
                '專案編號': p.id,
                '客戶名稱': p.client,
                '產品名稱': p.name,
                '階段': phaseMap[p.phase],
                '報價日期': p.quoteDate || '-',
                '任務編號': index + 1,
                '任務名稱': task.name,
                '開始日期': task.start,
                '結束日期': task.end,
                '任務進度': task.progress + '%'
            });
        });
    });

    const ws = XLSX.utils.json_to_sheet(exportData);
    ws['!cols'] = [
        { wch: 15 }, { wch: 18 }, { wch: 25 }, { wch: 12 }, { wch: 12 },
        { wch: 10 }, { wch: 25 }, { wch: 12 }, { wch: 12 }, { wch: 12 }
    ];

    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, '專案任務');

    const dateStr = new Date().toISOString().slice(0, 10).replace(/-/g, '');
    XLSX.writeFile(wb, `銓宏國際-專案管理-${dateStr}.xlsx`);
}

// 顯示單一專案甘特圖
function showProjectGantt(projectId) {
    const project = projects.find(p => p.id === projectId);
    if (!project) return;

    currentGanttProject = project;
    const modal = document.getElementById('gantt-modal');
    const title = document.getElementById('gantt-modal-title');
    const body = document.getElementById('gantt-modal-body');

    title.innerHTML = `📅 ${project.name} - 甘特圖`;
    renderGanttContent(body, project);
    modal.classList.add('active');
}

// 渲染甘特圖內容
function renderGanttContent(container, project) {
    const today = new Date();
    const minDate = new Date(today);
    minDate.setDate(minDate.getDate() - 3);
    const maxDate = new Date(today);
    maxDate.setDate(maxDate.getDate() + 30);

    const totalDays = (maxDate - minDate) / (1000 * 60 * 60 * 24);

    // 篩選任務
    let filteredTasks = project.tasks.map((task, index) => ({ ...task, originalIndex: index }));

    if (ganttHideCompleted) {
        filteredTasks = filteredTasks.filter(task => task.progress < 100);
    }

    if (ganttShowOverdue) {
        filteredTasks = filteredTasks.filter(task => {
            const taskEnd = new Date(task.end);
            return taskEnd < today && task.progress < 100;
        });
    }

    const completedCount = project.tasks.filter(t => t.progress === 100).length;
    const totalCount = project.tasks.length;
    const overdueCount = project.tasks.filter(t => {
        const taskEnd = new Date(t.end);
        return taskEnd < today && t.progress < 100;
    }).length;

    // 建立甘特圖 HTML
    let ganttHtml = `
        <div class="single-gantt">
            <div class="single-gantt-header">
                <div class="gantt-info">
                    <span class="gantt-project-id">${project.id}</span>
                    <span class="gantt-project-client">${project.client} / ${project.contact}</span>
                </div>
                <div class="gantt-progress">
                    <span class="gantt-progress-text">整體進度: ${project.progress}%</span>
                    <div class="progress-bar large">
                        <div class="progress-fill" style="width: ${project.progress}%"></div>
                    </div>
                </div>
            </div>
            <div class="gantt-filters">
                <label class="gantt-filter-label">
                    <input type="checkbox" ${ganttHideCompleted ? 'checked' : ''}
                        onchange="toggleGanttHideCompleted(this.checked)">
                    <span>隱藏已完成 (${completedCount}/${totalCount})</span>
                </label>
                <label class="gantt-filter-label overdue">
                    <input type="checkbox" ${ganttShowOverdue ? 'checked' : ''}
                        onchange="toggleGanttShowOverdue(this.checked)">
                    <span>🔴 只顯示逾期 (${overdueCount})</span>
                </label>
            </div>
            <div class="single-gantt-timeline">
                <div class="gantt-date-scale">
    `;

    // 時間刻度
    for (let i = 0; i <= totalDays; i += 2) {
        const date = new Date(minDate);
        date.setDate(date.getDate() + i);
        const dayLabel = `${date.getMonth() + 1}/${date.getDate()}`;
        const leftPercent = (i / totalDays) * 100;
        ganttHtml += `<div class="gantt-date-label" style="left: ${leftPercent}%">${dayLabel}</div>`;
    }

    ganttHtml += `</div><div class="gantt-tasks">`;

    // 任務列
    filteredTasks.forEach((task, index) => {
        const taskStart = new Date(task.start);
        const taskEnd = new Date(task.end);

        const startOffset = (taskStart - minDate) / (1000 * 60 * 60 * 24);
        const duration = (taskEnd - taskStart) / (1000 * 60 * 60 * 24) + 1;
        const workDays = Math.ceil(duration);

        const leftPercent = Math.max(0, (startOffset / totalDays) * 100);
        const widthPercent = Math.max(2, (duration / totalDays) * 100);

        let taskStatus = 'pending';
        if (task.progress === 100) taskStatus = 'completed';
        else if (task.progress > 0) taskStatus = 'in-progress';

        const isOverdue = taskEnd < today && task.progress < 100;

        // 負責人和跟催人
        const assignedTo = task.assigned_to || project.sales_rep || '未分配';
        const followUpBy = task.follow_up_by || 'Kevin';

        ganttHtml += `
            <div class="gantt-task-row">
                <div class="gantt-task-info">
                    <span class="task-num">${task.originalIndex + 1}</span>
                    <div class="task-details">
                        <span class="task-name">${task.name}</span>
                        <div class="task-assignees">
                            <span class="gantt-assignee">👤 ${assignedTo}</span>
                            <span class="gantt-followup">🔔 ${followUpBy}</span>
                        </div>
                    </div>
                    ${isOverdue ? '<span class="badge-overdue">逾期</span>' : ''}
                </div>
                <div class="gantt-task-timeline">
                    <div class="gantt-task-bar ${taskStatus}" style="left: ${leftPercent}%; width: ${widthPercent}%">
                        <div class="task-progress-fill" style="width: ${task.progress}%"></div>
                    </div>
                </div>
                <div class="gantt-task-meta">
                    <div class="gantt-task-date">📅 ${task.start} ~ ${task.end}</div>
                    <div class="gantt-task-days">⏱️ ${workDays} 天</div>
                </div>
                <div class="gantt-task-percent">${task.progress}%</div>
            </div>
        `;
    });

    ganttHtml += `</div></div></div>`;

    container.innerHTML = ganttHtml;
}

// 切換甘特圖隱藏已完成
function toggleGanttHideCompleted(isChecked) {
    ganttHideCompleted = isChecked;
    if (currentGanttProject) {
        const body = document.getElementById('gantt-modal-body');
        renderGanttContent(body, currentGanttProject);
    }
}

// 切換甘特圖只顯示逾期
function toggleGanttShowOverdue(isChecked) {
    ganttShowOverdue = isChecked;
    if (currentGanttProject) {
        const body = document.getElementById('gantt-modal-body');
        renderGanttContent(body, currentGanttProject);
    }
}

// 關閉甘特圖彈窗
function closeGanttModal() {
    document.getElementById('gantt-modal').classList.remove('active');
    currentGanttProject = null;
    ganttHideCompleted = false;
    ganttShowOverdue = false;
}

// 顯示單一專案待辦事項（使用固定 HTML 元素）
function showProjectTodo(projectId, filter = 'incomplete') {
    console.log('showProjectTodo called:', { projectId, filter });

    const project = projects.find(p => p.id === projectId);
    if (!project) {
        console.error('showProjectTodo: project not found', projectId);
        alert('❌ 找不到專案資料');
        return;
    }

    // 確保專案有 tasks 數組
    if (!project.tasks) {
        console.warn('showProjectTodo: project.tasks missing, initializing empty array');
        project.tasks = [];
    }

    currentTodoProject = project;
    currentTodoFilter = filter;

    // 設置全局篩選狀態
    hideCompleted = (filter === 'incomplete');
    showOverdueOnly = (filter === 'overdue');

    const modal = document.getElementById('todo-modal');
    const title = document.getElementById('todo-modal-title');

    if (!modal) {
        console.error('showProjectTodo: modal not found');
        return;
    }

    const filterText = filter === 'incomplete' ? '（待辦事項）' : filter === 'overdue' ? '（逾期事項）' : '（全部事項）';
    title.innerHTML = `📝 ${project.name} ${filterText}`;

    // 計算並更新專案進度
    updateProjectProgress(project);

    try {
        // 更新固定控制區域的統計數字
        updateTodoStats(project);

        // 更新專案資訊顯示
        document.getElementById('todo-project-id-display').textContent = project.id || 'N/A';
        document.getElementById('todo-project-client-display').textContent =
            `${project.client || 'N/A'} / ${project.contact || 'N/A'}`;
        
        // 設置截止日和日期異常檢查
        currentTodoProject = project; // 確保設置當前專案
        updateDeadlineDisplay(project);
        
        document.getElementById('todo-project-sales-display').textContent = project.sales_rep || '未分配';

        // 更新專案進度（如果元素存在）
        const progressDisplay = document.getElementById('todo-progress-display');
        if (progressDisplay) {
            progressDisplay.textContent = `${project.progress}%`;
        }

        // 渲染客戶提供資料
        renderClientMaterials(project);

        // 設置初始按鈕樣式
        const btnAll = document.getElementById('btn-show-all');
        const btnIncomplete = document.getElementById('btn-show-incomplete');
        const btnOverdue = document.getElementById('btn-show-overdue');

        // 重置所有按鈕
        [btnAll, btnIncomplete, btnOverdue].forEach(btn => {
            if (btn) {
                btn.style.background = 'white';
                btn.style.color = '#374151';
                btn.style.border = '1px solid #d1d5db';
            }
        });

        // 設置當前選中按鈕
        let activeBtn = btnIncomplete; // 默認待辦
        if (filter === 'all') activeBtn = btnAll;
        if (filter === 'overdue') activeBtn = btnOverdue;

        if (activeBtn) {
            activeBtn.style.background = '#3b82f6';
            activeBtn.style.color = 'white';
            activeBtn.style.border = '1px solid #3b82f6';
        }

        // 渲染任務清單
        const body = document.getElementById('todo-modal-body');
        if (body) {
            renderTaskListOnly(body, project, filter);
        }

        isTodoModalOpen = true;
        modal.classList.add('active');
        console.log('✅ Modal opened successfully');
    } catch (error) {
        console.error('❌ Error in showProjectTodo:', error);
        alert('Error: ' + error.message);
    }
}

// 渲染客戶提供資料
function renderClientMaterials(project) {
    const container = document.getElementById('client-materials-list');
    if (!container) return;

    // 確保專案有 clientMaterials 陣列
    if (!project.clientMaterials || project.clientMaterials.length === 0) {
        container.innerHTML = '<div style="color: #a8a29e; font-style: italic;">尚無客戶提供資料</div>';
        return;
    }

    // 按日期排序（最新的在前）
    const sortedMaterials = [...project.clientMaterials].sort((a, b) => {
        return new Date(b.date) - new Date(a.date);
    });

    const materialsHtml = sortedMaterials.map((material, index) => {
        const originalIndex = project.clientMaterials.indexOf(material);
        return `
            <div style="display: flex; justify-content: space-between; align-items: flex-start; padding: 8px 0; border-bottom: 1px dashed #fcd34d;">
                <div style="flex: 1;">
                    <div style="font-weight: 500; margin-bottom: 2px;">
                        ${formatDateShort(material.date)} - ${material.description}
                    </div>
                    ${material.notes ? `<div style="font-size: 12px; color: #92400e; opacity: 0.8;">${material.notes}</div>` : ''}
                </div>
                <button onclick="deleteMaterial('${project.id}', ${originalIndex})" style="margin-left: 8px; padding: 2px 6px; background: transparent; border: none; color: #92400e; cursor: pointer; font-size: 12px; opacity: 0.6;" title="刪除">×</button>
            </div>
        `;
    }).join('');

    container.innerHTML = materialsHtml;
}

// 格式化日期（MM/DD）
function formatDateShort(dateStr) {
    if (!dateStr) return '';
    const date = new Date(dateStr);
    const month = date.getMonth() + 1;
    const day = date.getDate();
    return `${month}/${day}`;
}

// 開啟新增資料彈窗
let currentMaterialProjectId = null;

function openAddMaterialModal() {
    const modal = document.getElementById('add-material-modal');
    const dateInput = document.getElementById('new-material-date');

    // 預設今天日期
    const today = new Date();
    dateInput.value = today.toISOString().split('T')[0];

    // 記錄當前專案 ID
    currentMaterialProjectId = currentTodoProject ? currentTodoProject.id : null;

    modal.classList.add('active');
}

// 關閉新增資料彈窗
function closeAddMaterialModal() {
    const modal = document.getElementById('add-material-modal');
    modal.classList.remove('active');
    document.getElementById('add-material-form').reset();
    currentMaterialProjectId = null;
}

// 提交新增資料
function submitNewMaterial(event) {
    event.preventDefault();

    if (!currentMaterialProjectId) {
        alert('❌ 無法取得專案資訊');
        return;
    }

    const project = projects.find(p => p.id === currentMaterialProjectId);
    if (!project) {
        alert('❌ 找不到專案');
        return;
    }

    const date = document.getElementById('new-material-date').value;
    const description = document.getElementById('new-material-desc').value.trim();
    const notes = document.getElementById('new-material-notes').value.trim();

    if (!date || !description) {
        alert('請填寫日期和資料說明');
        return;
    }

    // 確保 clientMaterials 陣列存在
    if (!project.clientMaterials) {
        project.clientMaterials = [];
    }

    // 新增資料
    project.clientMaterials.push({
        date: date,
        description: description,
        notes: notes,
        created_at: new Date().toISOString()
    });

    // 儲存到 LocalStorage
    saveProjectsToLocalStorage();

    // 重新渲染
    renderClientMaterials(project);

    // 關閉彈窗
    closeAddMaterialModal();

    alert('✅ 資料已新增');
}

// 刪除資料
function deleteMaterial(projectId, materialIndex) {
    const project = projects.find(p => p.id === projectId);
    if (!project || !project.clientMaterials || !project.clientMaterials[materialIndex]) return;

    if (confirm('確定要刪除此資料記錄嗎？')) {
        project.clientMaterials.splice(materialIndex, 1);
        saveProjectsToLocalStorage();
        renderClientMaterials(project);
    }
}

// 更新待辦事項統計數字
function updateTodoStats(project) {
    const completedCount = project.tasks.filter(t => t.progress === 100).length;
    const totalCount = project.tasks.length;
    const overdueCount = project.tasks.filter(t => {
        const taskEnd = new Date(t.end);
        return taskEnd < new Date() && t.progress < 100;
    }).length;

    // 只更新存在的元素
    const taskCountEl = document.getElementById('todo-task-count');
    if (taskCountEl) {
        taskCountEl.textContent = `任務清單 (${project.tasks.length} 項)`;
    }
}

// 只渲染任務清單（不含控制區域）
function renderTaskListOnly(container, project, filter) {
    if (!project.tasks || !Array.isArray(project.tasks)) {
        container.innerHTML = '<div class="todo-empty">📝 暫無任務</div>';
        return;
    }

    // 根據篩選條件過濾任務
    let filteredTasks = project.tasks.map((task, index) => ({ ...task, originalIndex: index }));

    if (filter === 'incomplete') {
        filteredTasks = filteredTasks.filter(task => task.progress < 100);
    }

    if (hideCompleted) {
        filteredTasks = filteredTasks.filter(task => task.progress < 100);
    }

    if (showOverdueOnly) {
        const today = new Date();
        filteredTasks = filteredTasks.filter(task => {
            const taskEnd = new Date(task.end);
            return taskEnd < today && task.progress < 100;
        });
    }

    // 更新任務數量顯示
    document.getElementById('todo-task-count').textContent = `任務清單 (${filteredTasks.length} 項)`;

    if (filteredTasks.length === 0) {
        container.innerHTML = `<div class="todo-empty">${hideCompleted ? '✅ 已完成項目已隱藏' : '🎉 所有事項已完成！'}</div>`;
        return;
    }

    const tasksHtml = filteredTasks.map((task) => {
        const today = new Date();
        const taskEnd = new Date(task.end);
        const taskStart = new Date(task.start);
        const isOverdue = taskEnd < today && task.progress < 100;
        const isCompleted = task.progress === 100;
        const workDays = Math.ceil((taskEnd - taskStart) / (1000 * 60 * 60 * 24)) + 1;
        const assignedTo = task.assigned_to || project.sales_rep || '未分配';
        
        // 檢查任務日期是否超過專案截止日
        const isBeyondDeadline = checkTaskBeyondDeadline(project, task);

        return `
            <li class="todo-item ${isCompleted ? 'completed' : ''} ${isOverdue ? 'overdue' : ''}" data-index="${task.originalIndex}" style="padding: 10px 12px; margin-bottom: 8px; border-radius: 8px; background: #fff; border: 1px solid ${isBeyondDeadline ? '#ef4444' : '#e5e7eb'}; ${isBeyondDeadline ? 'box-shadow: 0 0 0 2px #fecaca;' : ''}">
                <!-- 第一行：复选框 + 任务名称 + 按钮 -->
                <div style="display: flex; align-items: center; gap: 8px;">
                    <label class="todo-checkbox-label" style="margin: 0; flex-shrink: 0;">
                        <input type="checkbox" class="todo-checkbox"
                            ${isCompleted ? 'checked' : ''}
                            onchange="toggleTaskComplete('${project.id}', ${task.originalIndex}, this.checked)"
                            style="width: 18px; height: 18px; cursor: pointer;">
                        <span class="todo-checkbox-custom"></span>
                    </label>

                    <div class="todo-name ${isCompleted ? 'strikethrough' : ''}"
                         onclick="openTaskEditModal('${project.id}', ${task.originalIndex})"
                         style="cursor:pointer; flex: 1; font-size: 14px; font-weight: 500; line-height: 1.4; overflow: hidden; text-overflow: ellipsis; display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical;"
                         title="點擊編輯">
                        ${task.name}
                    </div>

                    ${isOverdue ? '<span style="background: #fee2e2; color: #dc2626; padding: 2px 6px; border-radius: 4px; font-size: 11px; flex-shrink: 0;">逾期</span>' : ''}
                    ${isBeyondDeadline ? '<span style="background: #ef4444; color: white; padding: 2px 6px; border-radius: 4px; font-size: 11px; flex-shrink: 0; margin-left: 4px;">超過截止日</span>' : ''}
                </div>

                <!-- 第二行：负责人 + 日期 + 按钮 -->
                <div style="display: flex; align-items: center; justify-content: space-between; margin-top: 8px; padding-top: 8px; border-top: 1px dashed ${isBeyondDeadline ? '#fecaca' : '#f3f4f6'};">
                    <div style="display: flex; align-items: center; gap: 12px; font-size: 12px; color: #6b7280; flex-wrap: wrap;">
                        <span onclick="openTaskEditModal('${project.id}', ${task.originalIndex})" style="cursor:pointer; display: flex; align-items: center; gap: 4px;" title="點擊編輯">
                            👤 ${assignedTo}
                        </span>

                        ${task.start && task.end ? `<span style="display: flex; align-items: center; gap: 4px; color: ${isBeyondDeadline ? '#dc2626' : '#6b7280'}; font-weight: ${isBeyondDeadline ? '600' : 'normal'};">
                            📅 ${formatDateShort(task.start)}-${formatDateShort(task.end)} · ${workDays}天
                            ${isBeyondDeadline ? '<span style="color: #ef4444; margin-left: 4px;">⚠️ 超過截止日</span>' : ''}
                        </span>` : ''}
                    </div>

                    <div style="display: flex; gap: 4px; flex-shrink: 0;">
                        ${task.files && task.files.length > 0 ? `
                        <span style="padding: 3px 6px; font-size: 11px; background: #e0f2fe; border: 1px solid #0ea5e9; border-radius: 4px; color: #0369a1; cursor: pointer;"
                              onclick="viewTaskFiles('${project.id}', ${task.originalIndex})" title="查看檔案">📎 ${task.files.length}</span>
                        ` : ''}

                        <button onclick="uploadTaskFile('${project.id}', ${task.originalIndex})"
                                style="padding: 3px 6px; font-size: 11px; background: #f0fdf4; border: 1px solid #10b981; border-radius: 4px; color: #047857; cursor: pointer;" title="上傳檔案">📎+</button>

                        ${project.clientMaterials && project.clientMaterials.length > 0 ? `
                        <button onclick="showTaskMaterials('${project.id}', ${task.originalIndex})"
                                style="padding: 3px 6px; font-size: 11px; background: #fef3c7; border: 1px solid #f59e0b; border-radius: 4px; color: #92400e; cursor: pointer; white-space: nowrap;">圖稿</button>
                        ` : ''}

                        <button onclick="openTaskEditModal('${project.id}', ${task.originalIndex})"
                                style="padding: 3px 6px; font-size: 11px; background: #f3f4f6; border: 1px solid #d1d5db; border-radius: 4px; cursor: pointer;" title="編輯事項">✏️</button>

                        <button onclick="deleteTask('${project.id}', ${task.originalIndex})"
                                style="padding: 3px 6px; font-size: 11px; background: transparent; border: none; color: #9ca3af; cursor: pointer;">🗑️</button>
                    </div>
                </div>
            </li>
        `;
    }).join('');

    container.innerHTML = `<ul class="todo-list" style="list-style: none; padding: 0; margin: 0;">${tasksHtml}</ul>`;
}

// 新增任務
function addNewTask(projectId) {
    const project = projects.find(p => p.id === projectId);
    if (!project) return;

    const nameInput = document.getElementById('new-task-name');
    const startInput = document.getElementById('new-task-start');
    const endInput = document.getElementById('new-task-end');
    const assigneeInput = document.getElementById('new-task-assignee');

    const name = nameInput.value.trim();
    const start = startInput.value;
    const end = endInput.value;
    const assignee = assigneeInput.value.trim() || project.sales_rep || '未分配';

    if (!name || !start || !end) {
        alert('請填寫任務名稱、開始日期和結束日期');
        return;
    }

    const newTask = {
        name: name,
        start: start,
        end: end,
        progress: 0,
        assigned_to: assignee,
        follow_up_by: 'Kevin',
        created_at: new Date().toISOString()
    };

    if (!project.tasks) project.tasks = [];
    project.tasks.push(newTask);

    // 儲存到 LocalStorage
    saveProjectsToLocalStorage();

    // 清空輸入框
    nameInput.value = '';
    startInput.value = '';
    endInput.value = '';
    assigneeInput.value = '';

    // 重新渲染
    const body = document.getElementById('todo-modal-body');
    if (body) renderTaskListOnly(body, project, currentTodoFilter);

    // 更新統計
    updateTodoStats(project);

    alert('✅ 任務已新增');
}

// 編輯任務名稱
function editTaskName(projectId, taskIndex) {
    const project = projects.find(p => p.id === projectId);
    if (!project || !project.tasks[taskIndex]) return;

    const task = project.tasks[taskIndex];
    const newName = prompt('編輯任務名稱：', task.name);

    if (newName !== null && newName.trim() !== '') {
        task.name = newName.trim();
        task.updated_at = new Date().toISOString();

        saveProjectsToLocalStorage();

        const body = document.getElementById('todo-modal-body');
        if (body) renderTaskListOnly(body, project, currentTodoFilter);

        alert('✅ 任務已更新');
    }
}

// 編輯任務日期
function editTaskDates(projectId, taskIndex) {
    const project = projects.find(p => p.id === projectId);
    if (!project || !project.tasks[taskIndex]) return;

    const task = project.tasks[taskIndex];
    const newStart = prompt('開始日期（YYYY-MM-DD）：', task.start);
    const newEnd = prompt('結束日期（YYYY-MM-DD）：', task.end);

    if (newStart && newEnd) {
        task.start = newStart;
        task.end = newEnd;
        task.updated_at = new Date().toISOString();

        saveProjectsToLocalStorage();

        const body = document.getElementById('todo-modal-body');
        if (body) renderTaskListOnly(body, project, currentTodoFilter);

        alert('✅ 日期已更新');
    }
}

// 編輯任務進度
function editTaskProgress(projectId, taskIndex) {
    const project = projects.find(p => p.id === projectId);
    if (!project || !project.tasks[taskIndex]) return;

    const task = project.tasks[taskIndex];
    const newProgress = prompt('進度百分比（0-100）：', task.progress);

    if (newProgress !== null) {
        const progress = parseInt(newProgress);
        if (progress >= 0 && progress <= 100) {
            task.progress = progress;
            task.updated_at = new Date().toISOString();

            // 如果進度 100%，標記為已完成
            if (progress === 100) {
                task.completed_at = new Date().toISOString();
            }

            saveProjectsToLocalStorage();

            const body = document.getElementById('todo-modal-body');
            if (body) renderTaskListOnly(body, project, currentTodoFilter);

            alert('✅ 進度已更新');
        }
    }
}

// 刪除任務
function deleteTask(projectId, taskIndex) {
    const project = projects.find(p => p.id === projectId);
    if (!project || !project.tasks[taskIndex]) return;

    if (confirm('確定要刪除此任務嗎？')) {
        project.tasks.splice(taskIndex, 1);

        saveProjectsToLocalStorage();

        const body = document.getElementById('todo-modal-body');
        if (body) renderTaskListOnly(body, project, currentTodoFilter);

        updateTodoStats(project);

        alert('✅ 任務已刪除');
    }
}

// ==================== 任務檔案上傳功能 ====================

// 上傳任務檔案
function uploadTaskFile(projectId, taskIndex) {
    const project = projects.find(p => p.id === projectId);
    if (!project || !project.tasks[taskIndex]) return;

    // 建立檔案選擇器
    const fileInput = document.createElement('input');
    fileInput.type = 'file';
    fileInput.multiple = true;
    fileInput.accept = '*/*';

    fileInput.onchange = function(e) {
        const files = e.target.files;
        if (!files || files.length === 0) return;

        const task = project.tasks[taskIndex];
        if (!task.files) task.files = [];

        // 處理每個檔案
        Array.from(files).forEach(file => {
            // 讀取檔案為 Base64
            const reader = new FileReader();
            reader.onload = function(event) {
                task.files.push({
                    name: file.name,
                    type: file.type,
                    size: file.size,
                    data: event.target.result,
                    uploadedAt: new Date().toISOString()
                });

                // 儲存
                saveProjectsToLocalStorage();

                // 重新渲染
                const body = document.getElementById('todo-modal-body');
                if (body) renderTaskListOnly(body, project, currentTodoFilter);
            };
            reader.readAsDataURL(file);
        });

        alert(`✅ 正在上傳 ${files.length} 個檔案...`);
    };

    fileInput.click();
}

// 查看任務檔案
function viewTaskFiles(projectId, taskIndex) {
    const project = projects.find(p => p.id === projectId);
    if (!project || !project.tasks[taskIndex]) return;

    const task = project.tasks[taskIndex];
    if (!task.files || task.files.length === 0) {
        alert('暫無檔案');
        return;
    }

    // 建立檔案列表彈窗
    let filesHtml = task.files.map((file, index) => {
        const isImage = file.type && file.type.startsWith('image/');
        const isJpgOrPng = isImage && (file.type.includes('jpeg') || file.type.includes('jpg') || file.type.includes('png'));
        const fileSize = (file.size / 1024).toFixed(1) + ' KB';

        // 圖片預覽或檔案圖標
        const filePreview = isJpgOrPng && file.data
            ? `<img src="${file.data}" style="width: 100px; height: 100px; object-fit: cover; border-radius: 8px; border: 1px solid #e5e7eb; cursor: pointer;" onclick="openImagePreview('${file.data}')" title="點擊預覽">`
            : `<span style="font-size: 40px;">📄</span>`;

        return `
            <div style="display: flex; align-items: center; justify-content: space-between; padding: 10px; background: #f9fafb; border-radius: 6px; margin-bottom: 8px;">
                <div style="display: flex; align-items: center; gap: 12px; flex: 1;">
                    ${filePreview}
                    <div style="flex: 1; min-width: 0;">
                        <div style="font-size: 14px; font-weight: 500; color: #111827; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;">${file.name}</div>
                        <div style="font-size: 12px; color: #6b7280;">${fileSize} · ${new Date(file.uploadedAt).toLocaleDateString('zh-TW')}</div>
                    </div>
                </div>
                <div style="display: flex; gap: 6px;">
                    ${isImage && file.data ? `<button onclick="openImagePreview('${file.data}')" style="padding: 6px 12px; background: #3b82f6; color: white; border: none; border-radius: 4px; font-size: 12px; cursor: pointer;">查看</button>` : ''}
                    <button onclick="deleteTaskFile('${projectId}', ${taskIndex}, ${index})" style="padding: 6px 12px; background: #ef4444; color: white; border: none; border-radius: 4px; font-size: 12px; cursor: pointer;">刪除</button>
                </div>
            </div>
        `;
    }).join('');

    let modalContent = `
        <div id="task-files-modal" class="modal active" style="z-index: 10000;">
            <div class="modal-content" style="max-width: 500px; max-height: 80vh; overflow-y: auto;">
                <span class="close-btn" onclick="closeTaskFilesModal()">×</span>
                <h3>📎 任務檔案 (${task.files.length}個)</h3>
                <div style="margin: 16px 0;">
                    ${filesHtml}
                </div>
                <div style="display: flex; gap: 8px; justify-content: center;">
                    <button onclick="addMoreFiles('${projectId}', ${taskIndex})" style="padding: 8px 16px; background: #10b981; color: white; border: none; border-radius: 6px; font-size: 13px; cursor: pointer;">➕ 新增檔案</button>
                    <button onclick="closeTaskFilesModal()" style="padding: 8px 16px; background: #f3f4f6; color: #374151; border: 1px solid #d1d5db; border-radius: 6px; font-size: 13px; cursor: pointer;">關閉</button>
                </div>
            </div>
        </div>
    `;

    // 插入到頁面
    const existingModal = document.getElementById('task-files-modal');
    if (existingModal) existingModal.remove();
    document.body.insertAdjacentHTML('beforeend', modalContent);
}

// 關閉檔案彈窗
function closeTaskFilesModal() {
    const modal = document.getElementById('task-files-modal');
    if (modal) modal.remove();
}

// 新增更多檔案
function addMoreFiles(projectId, taskIndex) {
    closeTaskFilesModal();
    setTimeout(() => uploadTaskFile(projectId, taskIndex), 100);
}

// 圖片預覽功能
function openImagePreview(imageData) {
    // 建立圖片預覽彈窗
    let previewModal = `
        <div id="image-preview-modal" class="modal active" style="z-index: 11000;" onclick="closeImagePreview()">
            <div class="modal-content" style="max-width: 90vw; max-height: 90vh; padding: 10px; background: rgba(0,0,0,0.9);" onclick="event.stopPropagation()">
                <span class="close-btn" onclick="closeImagePreview()" style="color: white; font-size: 24px; top: 10px; right: 10px;">×</span>
                <img src="${imageData}" style="max-width: 100%; max-height: 85vh; display: block; margin: 0 auto; border-radius: 4px;">
            </div>
        </div>
    `;

    // 插入到頁面
    const existingModal = document.getElementById('image-preview-modal');
    if (existingModal) existingModal.remove();
    document.body.insertAdjacentHTML('beforeend', previewModal);
}

// 關閉圖片預覽
function closeImagePreview() {
    const modal = document.getElementById('image-preview-modal');
    if (modal) modal.remove();
}

// 刪除任務檔案
function deleteTaskFile(projectId, taskIndex, fileIndex) {
    const project = projects.find(p => p.id === projectId);
    if (!project || !project.tasks[taskIndex] || !project.tasks[taskIndex].files) return;

    const task = project.tasks[taskIndex];
    const fileName = task.files[fileIndex].name;

    if (confirm(`確定要刪除檔案「${fileName}」嗎？`)) {
        task.files.splice(fileIndex, 1);
        saveProjectsToLocalStorage();

        // 重新顯示
        viewTaskFiles(projectId, taskIndex);

        // 重新渲染任務列表
        const body = document.getElementById('todo-modal-body');
        if (body) renderTaskListOnly(body, project, currentTodoFilter);
    }
}

// ==================== 任務檔案功能結束 ====================

// 顯示任務相關的客戶圖稿
let currentTaskMaterialsProjectId = null;
let currentTaskMaterialsTaskIndex = null;

function showTaskMaterials(projectId, taskIndex) {
    const project = projects.find(p => p.id === projectId);
    if (!project) return;

    currentTaskMaterialsProjectId = projectId;
    currentTaskMaterialsTaskIndex = taskIndex;

    // 取得任務資訊
    const task = project.tasks[taskIndex];

    // 取得已關聯的資料索引
    const linkedIndices = task.linkedMaterials || [];

    // 建立彈窗內容 - 使用更高的 z-index 確保在最前面
    let modalContent = `
        <div id="task-materials-modal" class="modal active" style="z-index: 10000;">
            <div class="modal-content" style="max-width: 600px; max-height: 85vh; overflow-y: auto;">
                <span class="close-btn" onclick="closeTaskMaterialsModal()">×</span>
                <h3>📎 客戶圖稿 - ${task.name}</h3>

                <div style="margin: 15px 0; padding: 10px; background: #f8fafc; border-radius: 6px;">
                    <p style="margin: 0; font-size: 13px; color: #6b7280;">
                        選擇要關聯到此任務的客戶提供資料，點擊圖片可預覽大圖
                    </p>
                </div>
    `;

    // 顯示所有客戶資料，可勾選關聯
    if (project.clientMaterials && project.clientMaterials.length > 0) {
        modalContent += '<div style="margin-top: 15px;">';
        project.clientMaterials.forEach((material, index) => {
            const isLinked = linkedIndices.includes(index);

            // 檢查是否有圖片檔案
            const hasImages = material.images && material.images.length > 0;
            const imagePreview = hasImages ? `
                <div style="margin-top: 10px; display: flex; gap: 8px; flex-wrap: wrap;">
                    ${material.images.map((img, imgIndex) => {
                        // 轉換為完整的 GitHub Pages URL
                        const fullImgUrl = img.startsWith('http') ? img :
                            (img.startsWith('/') ? `https://wugys.github.io/chuanhung-projects${img}` :
                             `https://wugys.github.io/chuanhung-projects/${img}`);
                        // 取得檔案名稱
                        const fileName = img.split('/').pop();
                        return `
                        <div style="position: relative; width: 100px; height: 100px; border-radius: 6px; overflow: hidden; border: 1px solid #e5e7eb; background: #f9fafb;"
                             id="img-container-${index}-${imgIndex}">
                            <img src="${fullImgUrl}"
                                 style="width: 100%; height: 100%; object-fit: cover; cursor: pointer;"
                                 onclick="previewImage('${fullImgUrl}')"
                                 title="點擊預覽大圖"
                                 onerror="showFileName(this, '${fileName}', '${fullImgUrl}')"
                                 id="img-${index}-${imgIndex}"
                            >
                            <a href="${fullImgUrl}" download
                               style="position: absolute; bottom: 2px; right: 2px; background: rgba(0,0,0,0.7); color: white; padding: 2px 6px; border-radius: 4px; font-size: 10px; text-decoration: none;"
                               onclick="event.stopPropagation();"
                               title="下載"
                            >⬇️</a>
                        </div>
                        `;
                    }).join('')}
                </div>
            ` : '';

            // 如果有檔案路徑（非圖片），顯示下載連結
            const fileLinks = material.files ? `
                <div style="margin-top: 8px;">
                    ${material.files.map((file, fileIndex) => `
                        <a href="${file.path}" download
                           style="display: inline-flex; align-items: center; gap: 4px; margin-right: 10px; padding: 4px 10px; background: #3b82f6; color: white; border-radius: 4px; font-size: 12px; text-decoration: none;"
                        >
                            📄 ${file.name} ⬇️
                        </a>
                    `).join('')}
                </div>
            ` : '';

            modalContent += `
                <div style="display: flex; align-items: flex-start; gap: 10px; padding: 12px; margin-bottom: 12px; background: ${isLinked ? '#fef3c7' : '#f9fafb'}; border-radius: 8px; border: 1px solid ${isLinked ? '#f59e0b' : '#e5e7eb'};">
                    <input type="checkbox" id="material-link-${index}"
                        ${isLinked ? 'checked' : ''}
                        onchange="toggleMaterialLink('${projectId}', ${taskIndex}, ${index})"
                        style="margin-top: 3px; cursor: pointer; flex-shrink: 0;">
                    <div style="flex: 1; min-width: 0;">
                        <div style="font-weight: 500; font-size: 14px; margin-bottom: 4px;">
                            ${formatDateShort(material.date)} - ${material.description}
                        </div>
                        ${material.notes ? `<div style="font-size: 12px; color: #6b7280; margin-bottom: 8px;">${material.notes}</div>` : ''}
                        ${imagePreview}
                        ${fileLinks}
                    </div>
                </div>
            `;
        });
        modalContent += '</div>';
    } else {
        modalContent += `
            <div style="text-align: center; padding: 30px; color: #9ca3af;">
                <p>尚無客戶提供資料</p>
                <p style="font-size: 12px;">請先在「📎 客戶提供資料」區塊新增資料</p>
            </div>
        `;
    }

    modalContent += `
                <div style="margin-top: 20px; display: flex; justify-content: flex-end; gap: 10px;">
                    <button onclick="closeTaskMaterialsModal()" style="padding: 8px 16px; background: #f3f4f6; border: 1px solid #d1d5db; border-radius: 6px; cursor: pointer;">關閉</button>
                </div>
            </div>
        </div>
    `;

    // 插入到頁面
    const existingModal = document.getElementById('task-materials-modal');
    if (existingModal) {
        existingModal.remove();
    }
    document.body.insertAdjacentHTML('beforeend', modalContent);
}

// 圖片加載失敗時顯示檔案名稱
function showFileName(imgElement, fileName, fullUrl) {
    const container = imgElement.parentElement;
    container.innerHTML = `
        <div style="width: 100%; height: 100%; display: flex; flex-direction: column; align-items: center; justify-content: center; padding: 8px; box-sizing: border-box;">
            <div style="font-size: 28px; margin-bottom: 4px;">📄</div>
            <div style="font-size: 10px; color: #6b7280; text-align: center; word-break: break-all; line-height: 1.2; max-height: 40px; overflow: hidden;">
                ${fileName}
            </div>
            <a href="${fullUrl}" download
               style="margin-top: 4px; background: #3b82f6; color: white; padding: 2px 8px; border-radius: 4px; font-size: 10px; text-decoration: none;"
               onclick="event.stopPropagation();"
            >⬇️ 下載</a>
        </div>
    `;
}

// 預覽圖片
function previewImage(imageSrc) {
    const previewModal = document.createElement('div');
    previewModal.id = 'image-preview-modal';
    previewModal.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: rgba(0,0,0,0.9);
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        z-index: 20000;
        cursor: zoom-out;
    `;
    previewModal.innerHTML = `
        <img src="${imageSrc}"
             style="max-width: 90%; max-height: 85%; object-fit: contain; border-radius: 8px;"
             onclick="event.stopPropagation();"
             onerror="this.style.display='none'; this.nextElementSibling.style.display='flex';"
        >
        <div style="display: none; color: white; font-size: 16px; padding: 20px; text-align: center;">
            <div>📄 無法預覽圖片</div>
            <a href="${imageSrc}" download style="color: #60a5fa; text-decoration: underline; margin-top: 10px; display: inline-block;">點擊下載檔案</a>
        </div>
        <div style="color: white; margin-top: 10px; font-size: 12px; opacity: 0.7;">點擊任意處關閉</div>
        <button onclick="closeImagePreview()" style="position: absolute; top: 20px; right: 20px; background: white; border: none; width: 40px; height: 40px; border-radius: 50%; font-size: 20px; cursor: pointer;">×</button>
    `;
    previewModal.onclick = () => closeImagePreview();
    document.body.appendChild(previewModal);
}

// 關閉圖片預覽
function closeImagePreview() {
    const modal = document.getElementById('image-preview-modal');
    if (modal) {
        modal.remove();
    }
}

// 切換資料關聯
function toggleMaterialLink(projectId, taskIndex, materialIndex) {
    const project = projects.find(p => p.id === projectId);
    if (!project || !project.tasks[taskIndex]) return;

    const task = project.tasks[taskIndex];

    // 確保 linkedMaterials 陣列存在
    if (!task.linkedMaterials) {
        task.linkedMaterials = [];
    }

    const linkIndex = task.linkedMaterials.indexOf(materialIndex);

    if (linkIndex === -1) {
        // 新增關聯
        task.linkedMaterials.push(materialIndex);
    } else {
        // 移除關聯
        task.linkedMaterials.splice(linkIndex, 1);
    }

    // 儲存
    saveProjectsToLocalStorage();

    // 更新 UI
    const checkbox = document.getElementById(`material-link-${materialIndex}`);
    const container = checkbox.closest('div');
    const isLinked = linkIndex === -1; // 剛剛新增
    container.style.background = isLinked ? '#fef3c7' : '#f9fafb';
    container.style.borderColor = isLinked ? '#f59e0b' : '#e5e7eb';
}

// 關閉任務圖稿彈窗
function closeTaskMaterialsModal() {
    const modal = document.getElementById('task-materials-modal');
    if (modal) {
        modal.remove();
    }
    currentTaskMaterialsProjectId = null;
    currentTaskMaterialsTaskIndex = null;
}

// 固定控制區域的切換函數
function toggleHideCompletedFixed(isChecked) {
    hideCompleted = isChecked;
    if (currentTodoProject) {
        const body = document.getElementById('todo-modal-body');
        if (body) renderTaskListOnly(body, currentTodoProject, currentTodoFilter);
    }
}

function toggleShowOverdueOnlyFixed(isChecked) {
    showOverdueOnly = isChecked;
    if (currentTodoProject) {
        const body = document.getElementById('todo-modal-body');
        if (body) renderTaskListOnly(body, currentTodoProject, currentTodoFilter);
    }
}

// 關閉待辦事項彈窗
function closeTodoModal() {
    document.getElementById('todo-modal').classList.remove('active');
    isTodoModalOpen = false;
    currentTodoProject = null;
    currentTodoFilter = 'all';
    showOverdueOnly = false;
    hideCompleted = false;
}

// 切換任務完成狀態
function toggleTaskComplete(projectId, taskIndex, isChecked) {
    const project = projects.find(p => p.id === projectId);
    if (!project || !project.tasks[taskIndex]) return;

    project.tasks[taskIndex].progress = isChecked ? 100 : 0;
    updateProjectProgress(project);

    // 更新固定區域的統計數字
    updateTodoStats(project);
    const progressDisplay = document.getElementById('todo-progress-display');
    if (progressDisplay) {
        progressDisplay.textContent = `${project.progress}%`;
    }

    // 重新渲染任務清單
    const body = document.getElementById('todo-modal-body');
    if (body && currentTodoProject) {
        renderTaskListOnly(body, currentTodoProject, currentTodoFilter);
    }

    const taskName = project.tasks[taskIndex].name;
    const message = isChecked ? `✅ 「${taskName}」已完成` : `⏳ 「${taskName}」已標記為未完成`;
    showTodoToast(message);
}

// 關閉待辦事項彈窗
function closeTodoModal() {
    document.getElementById('todo-modal').classList.remove('active');
    isTodoModalOpen = false;
    currentTodoProject = null;
    currentTodoFilter = 'all';
    showOverdueOnly = false;
    hideCompleted = false;
}

// ==================== 截止日編輯與日期異常檢查 ====================

// 更新截止日顯示和異常檢查
function updateDeadlineDisplay(project) {
    if (!project) return;
    
    const deadlineDisplay = document.getElementById('todo-project-deadline-display');
    const warningEl = document.getElementById('deadline-warning');
    
    if (deadlineDisplay) {
        deadlineDisplay.textContent = project.deadline || 'N/A';
    }
    
    // 檢查日期異常
    const hasDateIssue = checkDeadlineConflict(project);
    if (warningEl) {
        warningEl.style.display = hasDateIssue ? 'inline-block' : 'none';
    }
}

// 檢查截止日與任務日期是否衝突
function checkDeadlineConflict(project) {
    if (!project || !project.deadline || !project.tasks || project.tasks.length === 0) {
        return false;
    }
    
    // 如果截止日是文字說明（非日期格式），不進行檢查
    const deadlineStr = project.deadline.trim();
    const datePattern = /^\d{4}-\d{2}-\d{2}$/;
    if (!datePattern.test(deadlineStr)) {
        return false;
    }
    
    const deadlineDate = new Date(deadlineStr);
    deadlineDate.setHours(0, 0, 0, 0);
    
    // 檢查所有任務的結束日期是否超過截止日
    for (const task of project.tasks) {
        if (task.end) {
            const taskEndDate = new Date(task.end);
            taskEndDate.setHours(0, 0, 0, 0);
            
            if (taskEndDate > deadlineDate) {
                return true; // 有日期異常
            }
        }
    }
    
    return false;
}

// 檢查單個任務是否超過截止日
function checkTaskBeyondDeadline(project, task) {
    if (!project || !project.deadline || !task || !task.end) {
        return false;
    }
    
    // 如果截止日是文字說明（非日期格式），不進行檢查
    const deadlineStr = project.deadline.trim();
    const datePattern = /^\d{4}-\d{2}-\d{2}$/;
    if (!datePattern.test(deadlineStr)) {
        return false;
    }
    
    const deadlineDate = new Date(deadlineStr);
    deadlineDate.setHours(0, 0, 0, 0);
    
    const taskEndDate = new Date(task.end);
    taskEndDate.setHours(0, 0, 0, 0);
    
    return taskEndDate > deadlineDate;
}

// 切換截止日編輯模式
function toggleEditDeadline() {
    const displayContainer = document.getElementById('deadline-display-container');
    const editContainer = document.getElementById('deadline-edit-container');
    const input = document.getElementById('edit-deadline-input');
    
    if (displayContainer && editContainer && input && currentTodoProject) {
        displayContainer.style.display = 'none';
        editContainer.style.display = 'block';
        input.value = currentTodoProject.deadline || '';
        input.focus();
    }
}

// 取消截止日編輯
function cancelEditDeadline() {
    const displayContainer = document.getElementById('deadline-display-container');
    const editContainer = document.getElementById('deadline-edit-container');
    
    if (displayContainer && editContainer) {
        displayContainer.style.display = 'block';
        editContainer.style.display = 'none';
    }
}

// 儲存截止日
function saveDeadline() {
    const input = document.getElementById('edit-deadline-input');
    if (!input || !currentTodoProject) return;
    
    const newDeadline = input.value.trim();
    
    // 更新專案資料
    currentTodoProject.deadline = newDeadline || null;
    currentTodoProject.updated_at = new Date().toISOString();
    
    // 儲存到 LocalStorage
    saveProjectsToLocalStorage();
    
    // 更新顯示
    updateDeadlineDisplay(currentTodoProject);
    
    // 切換回顯示模式
    cancelEditDeadline();
    
    // 顯示提示
    const hasIssue = checkDeadlineConflict(currentTodoProject);
    const message = hasIssue 
        ? '⚠️ 截止日已更新，任務日期超過截止日！' 
        : '✅ 截止日已更新';
    showTodoToast(message);
    
    // 重新渲染主視圖以反映變更
    renderAllViews();
}

// ==================== 截止日編輯與日期異常檢查結束 ====================

// ==================== 新增任務功能 ====================

// 切換新增任務表單顯示
function toggleAddTaskForm() {
    const formContainer = document.getElementById('add-task-form-container');
    const isVisible = formContainer.style.display !== 'none';

    if (isVisible) {
        formContainer.style.display = 'none';
    } else {
        formContainer.style.display = 'block';
        // 預設填入日期
        const today = new Date().toISOString().split('T')[0];
        document.getElementById('new-task-start').value = today;
        document.getElementById('new-task-end').value = today;
        // 預設填入專案負責人
        if (currentTodoProject && currentTodoProject.sales_rep) {
            document.getElementById('new-task-assignee').value = currentTodoProject.sales_rep;
        }
        // 聚焦到任務名稱輸入框
        document.getElementById('new-task-name').focus();
    }
}

// 負責人下拉選擇事件
document.addEventListener('DOMContentLoaded', function() {
    const assigneeInput = document.getElementById('new-task-assignee');
    if (assigneeInput) {
        assigneeInput.addEventListener('change', function() {
            console.log('負責人已選擇:', this.value);
        });
    }
});

// 提交新任務（從待辦事項彈窗）
function submitNewTaskFromTodo() {
    if (!currentTodoProject) {
        alert('請先選擇專案');
        return;
    }

    const taskName = document.getElementById('new-task-name').value.trim();
    const assignee = document.getElementById('new-task-assignee').value.trim();
    const startDate = document.getElementById('new-task-start').value;
    const endDate = document.getElementById('new-task-end').value;

    if (!taskName) {
        alert('請輸入任務名稱');
        return;
    }
    if (!startDate || !endDate) {
        alert('請選擇開始和結束日期');
        return;
    }
    if (new Date(startDate) > new Date(endDate)) {
        alert('開始日期不能晚於結束日期');
        return;
    }

    // 新增任務
    const newTask = {
        name: taskName,
        start: startDate,
        end: endDate,
        progress: 0,
        assigned_to: assignee || currentTodoProject.sales_rep || '未分配'
    };

    // 初始化任務陣列（如果不存在）
    if (!currentTodoProject.tasks) {
        currentTodoProject.tasks = [];
    }
    currentTodoProject.tasks.push(newTask);

    // 更新專案進度
    updateProjectProgress(currentTodoProject);

    // 儲存
    saveProjectsToLocalStorage();

    // 清空表單並隱藏
    document.getElementById('new-task-name').value = '';
    document.getElementById('add-task-form-container').style.display = 'none';

    // 重新渲染任務清單
    const body = document.getElementById('todo-modal-body');
    if (body) {
        renderTaskListOnly(body, currentTodoProject, currentTodoFilter);
    }

    // 更新統計
    updateTodoStats(currentTodoProject);
    document.getElementById('todo-task-count').textContent = `任務清單 (${currentTodoProject.tasks.length} 項)`;

    showTodoToast(`✅ 任務「${taskName}」已新增`);
}

// ==================== 新增任務功能結束 ====================

// ==================== 新增專案功能 ====================

// 開啟新增專案彈窗
function openAddProjectModal() {
    const modal = document.getElementById('add-project-modal');
    const projectIdInput = document.getElementById('new-project-id');
    const deadlineInput = document.getElementById('new-project-deadline');

    // 自動生成專案編號
    projectIdInput.value = generateProjectId();

    // 預設今天日期
    const today = new Date();
    deadlineInput.value = today.toISOString().split('T')[0];

    // 顯示彈窗
    modal.classList.add('active');
}

// 關閉新增專案彈窗
function closeAddProjectModal() {
    document.getElementById('add-project-modal').classList.remove('active');
    document.getElementById('add-project-form').reset();

    // 重置聯絡人選擇器
    const contactSelect = document.getElementById('new-project-contact');
    const contactInput = document.getElementById('new-contact-input');
    if (contactSelect) {
        contactSelect.innerHTML = '<option value="">先選擇客戶</option>';
        contactSelect.disabled = true;
        contactSelect.classList.remove('hidden');
    }
    if (contactInput) {
        contactInput.value = '';
        contactInput.classList.add('hidden');
    }
}

// 生成專案編號（格式：A0001-YYMMDD）
function generateProjectId() {
    const date = new Date();
    const yy = String(date.getFullYear()).slice(-2);
    const mm = String(date.getMonth() + 1).padStart(2, '0');
    const dd = String(date.getDate()).padStart(2, '0');

    // 從現有專案找出最大序號
    let maxNum = 0;
    projects.forEach(p => {
        const match = p.id.match(/A(\d+)-/);
        if (match) {
            const num = parseInt(match[1]);
            if (num > maxNum) maxNum = num;
        }
    });

    const sequence = String(maxNum + 1).padStart(4, '0');
    return `A${sequence}-${yy}${mm}${dd}`;
}

// 提交新專案
async function submitNewProject(event) {
    event.preventDefault();

    const clientName = document.getElementById('new-project-client').value.trim();
    const contactSelect = document.getElementById('new-project-contact');
    const contactInput = document.getElementById('new-contact-input');

    // 取得聯絡人（從選擇框或輸入框）
    let contactName = '';
    if (!contactInput.classList.contains('hidden') && contactInput.value.trim()) {
        contactName = contactInput.value.trim();
    } else if (contactSelect.value && contactSelect.value !== 'new') {
        contactName = contactSelect.value;
    }

    // 檢查新客戶
    if (clientName && !clientExists(clientName)) {
        showClientPrompt('client', clientName);
        // 等待用戶選擇
        return;
    }

    // 檢查新聯絡人
    if (clientName && contactName && !contactExists(clientName, contactName)) {
        showClientPrompt('contact', contactName, clientName);
        // 等待用戶選擇
        return;
    }

    const formData = {
        id: document.getElementById('new-project-id').value,
        name: document.getElementById('new-project-name').value,
        client: clientName,
        contact: contactName,
        product_type: document.getElementById('new-project-type').value,
        quantity: document.getElementById('new-project-quantity').value + '個',
        deadline: document.getElementById('new-project-deadline').value,
        phase: document.getElementById('new-project-phase').value,
        sales_rep: document.getElementById('new-project-sales').value,
        notes: document.getElementById('new-project-notes').value,
        progress: 0,
        status: 'active',
        status_text: getStatusText(document.getElementById('new-project-phase').value),
        tasks: []
    };

    try {
        // 寫入 Supabase
        const { data, error } = await supabaseClient
            .from('projects')
            .insert([formData])
            .select();

        if (error) {
            console.error('Supabase 寫入錯誤:', error);
            // 離線模式：僅儲存到本地
            projects.push(formData);
            saveProjectsToLocalStorage();
            console.log('💾 離線模式：專案已儲存到 LocalStorage');
        } else {
            // 添加到本地陣列（即時顯示）
            projects.push(formData);
        }

        // 關閉彈窗並重新整理顯示
        closeAddProjectModal();
        renderAllViews();

        // 顯示成功提示
        alert('✅ 專案建立成功！');

    } catch (error) {
        console.error('寫入錯誤:', error);
        // 離線模式
        projects.push(formData);
        saveProjectsToLocalStorage();
        closeAddProjectModal();
        renderAllViews();
        alert('✅ 專案已建立（離線模式）');
    }
}

// 根據階段取得狀態文字
function getStatusText(phase) {
    const statusMap = {
        'proposing': '💡 提案中',
        'quoting': '📋 報價中',
        'pending': '🔵 報價待確認',
        'sampling': '🔨 打樣中',
        'production': '🏭 生產中',
        'completed': '✅ 已完成'
    };
    return statusMap[phase] || '💡 提案中';
}

// 重新整理所有視圖
function renderAllViews() {
    renderProposalView();
    renderQuoteView();
    renderSampleView();
    renderProductionView();
    renderList();
    renderPendingConfirmView();
    renderClosedView();
    updateStats();
}

// ==================== 新增專案功能結束 ====================

// ==================== 專案進度AI輔助填入功能 ====================

let currentProgressProjectId = null;

// 開啟新增進度彈窗
function openAddProgressModal(projectId) { return; // 已停用
    currentProgressProjectId = projectId;
    const modal = document.getElementById('add-progress-modal');
    const input = document.getElementById('progress-description');
    const resultDiv = document.getElementById('progress-analysis-result');

    input.value = '';
    resultDiv.innerHTML = '';
    resultDiv.style.display = 'none';

    modal.classList.add('active');
    input.focus();
}

// 關閉新增進度彈窗
function closeAddProgressModal() { return; // 已停用
    document.getElementById('add-progress-modal').classList.remove('active');
    currentProgressProjectId = null;
}

// AI 分析進度描述
// AI 分析設定
const AI_CONFIG = {
    // 使用 Kimi API (Moonshot AI)
    apiUrl: 'https://api.moonshot.cn/v1/chat/completions',
    model: 'moonshot-v1-8k',
    // API Key 應該從環境變數或 Supabase 取得，這裡使用代理函數
    useEdgeFunction: true,  // 使用 Supabase Edge Function 保護 API Key
    edgeFunctionName: 'ai-progress-analyzer'
};

// 分析進度（使用真正 AI）
async function analyzeProgressWithAI() { alert("此功能已停用"); return; // 已停用
    const input = document.getElementById('progress-description');
    const resultDiv = document.getElementById('progress-analysis-result');
    const analyzeBtn = document.getElementById('analyze-btn');

    const description = input.value.trim();
    if (!description) {
        alert('請輸入進度描述');
        return;
    }

    analyzeBtn.disabled = true;
    analyzeBtn.innerHTML = '🤔 AI 分析中...';

    try {
        let analysis;

        // 嘗試使用 AI API
        if (AI_CONFIG.useEdgeFunction && supabaseClient) {
            try {
                analysis = await callAIWithEdgeFunction(description);
            } catch (apiError) {
                console.warn('AI API 呼叫失敗，使用備援分析:', apiError);
                // 降級到本地規則分析
                analysis = performLocalAnalysis(description);
                analysis.notes = description + '\n\n(⚠️ AI 服務暫時不可用，使用本地分析)';
            }
        } else {
            // 直接使用本地規則
            analysis = performLocalAnalysis(description);
        }

        // 使用新的待辦事項格式呈現分析結果
        const tasksHtml = analysis.tasks.map((task, index) => `
            <div class="analysis-task-item">
                <label class="task-checkbox-label">
                    <input type="checkbox" checked onchange="toggleAnalysisTask(${index}, this.checked)">
                    <span class="task-checkbox-custom"></span>
                </label>
                <div class="task-content">
                    <div class="task-name">${task.name}</div>
                    <div class="task-meta">
                        <span class="task-progress">進度: ${task.progress}%</span>
                        <span class="task-date">${task.start}</span>
                    </div>
                </div>
            </div>
        `).join('');

        resultDiv.innerHTML = `
            <div class="analysis-result todo-style">
                <h4>📝 待辦事項分析結果</h4>
                <div class="analysis-summary">
                    <span class="summary-item">共 ${analysis.tasks.length} 項</span>
                    <span class="summary-item">整體進度: ${analysis.overallProgress}%</span>
                    <span class="summary-item">階段: ${analysis.phaseText}</span>
                </div>
                <div class="analysis-tasks-list">
                    ${tasksHtml}
                </div>
                <div class="analysis-actions">
                    <button onclick="applyProgressUpdate()" class="btn-primary">➕ 新增事項</button>
                    <button onclick="document.getElementById('progress-description').focus()" class="btn-secondary">📝 修改描述</button>
                </div>
            </div>
        `;
        resultDiv.style.display = 'block';

        // 儲存分析結果供套用時使用
        window.currentAnalysis = analysis;

    } catch (error) {
        console.error('分析錯誤:', error);
        alert('分析失敗，請稍後再試');
    } finally {
        analyzeBtn.disabled = false;
        analyzeBtn.innerHTML = '🤖 AI分析';
    }
}

// 切換分析任務的選擇狀態
function toggleAnalysisTask(index, isChecked) {
    if (window.currentAnalysis && window.currentAnalysis.tasks[index]) {
        window.currentAnalysis.tasks[index].selected = isChecked;
    }
}

// 呼叫 Supabase Edge Function 進行 AI 分析
async function callAIWithEdgeFunction(description) {
    const { data, error } = await supabaseClient.functions.invoke(
        AI_CONFIG.edgeFunctionName,
        {
            body: {
                description: description,
                projectContext: currentProgressProjectId ? getProjectContext(currentProgressProjectId) : null
            }
        }
    );

    if (error) {
        throw new Error(`Edge Function 錯誤: ${error.message}`);
    }

    return {
        progress: data.progress || 0,
        phase: data.phase || 'proposing',
        phaseText: data.phaseText || '💡 提案',
        deadline: data.deadline || '',
        notes: data.notes || description
    };
}

// 取得專案上下文（用於 AI 分析）
function getProjectContext(projectId) {
    const project = projects.find(p => p.id === projectId);
    if (!project) return null;

    return {
        id: project.id,
        name: project.name,
        client: project.client,
        currentPhase: project.phase,
        currentProgress: project.progress,
        deadline: project.deadline
    };
}

// 本地規則分析（簡易 AI）- 改為返回多個待辦事項
function performLocalAnalysis(description) {
    const lines = description.split(/\n|\r|,/).filter(line => line.trim());
    const tasks = [];
    const today = new Date();
    const todayStr = today.toISOString().split('T')[0];

    // 解析每一行為一個待辦事項
    lines.forEach((line, index) => {
        const trimmedLine = line.trim();
        if (!trimmedLine) return;

        // 判斷進度
        let progress = 0;
        const lowerLine = trimmedLine.toLowerCase();

        if (lowerLine.includes('完成') || lowerLine.includes('搞定') || lowerLine.includes('結束')) {
            progress = 100;
        } else if (lowerLine.includes('已到') || lowerLine.includes('已經') || lowerLine.includes('正在')) {
            progress = 60;
        } else if (lowerLine.includes('預計') || lowerLine.includes('準備') || lowerLine.includes('安排')) {
            progress = 30;
        }

        tasks.push({
            id: index,
            name: trimmedLine.substring(0, 50) + (trimmedLine.length > 50 ? '...' : ''),
            fullText: trimmedLine,
            progress: progress,
            start: todayStr,
            end: todayStr,
            selected: true  // 預設選中
        });
    });

    // 如果沒有解析到任何項目，將整段描述作為一個項目
    if (tasks.length === 0) {
        tasks.push({
            id: 0,
            name: description.substring(0, 50) + (description.length > 50 ? '...' : ''),
            fullText: description,
            progress: 0,
            start: todayStr,
            end: todayStr,
            selected: true
        });
    }

    // 計算整體進度
    const avgProgress = Math.round(tasks.reduce((sum, t) => sum + t.progress, 0) / tasks.length);

    // 判斷整體階段
    let phase = 'production';
    let phaseText = '🏭 生產';

    const lowerDesc = description.toLowerCase();
    if (lowerDesc.includes('提案') || lowerDesc.includes('概念')) {
        phase = 'proposing';
        phaseText = '💡 提案';
    } else if (lowerDesc.includes('報價') || lowerDesc.includes('價格')) {
        phase = 'quoting';
        phaseText = '📋 報價';
    } else if (lowerDesc.includes('打樣') || lowerDesc.includes('樣品')) {
        phase = 'sampling';
        phaseText = '🔨 打樣';
    } else if (lowerDesc.includes('完成') || lowerDesc.includes('結案')) {
        phase = 'completed';
        phaseText = '✅ 已完成';
    }

    return {
        tasks: tasks,
        overallProgress: avgProgress,
        phase: phase,
        phaseText: phaseText,
        deadline: ''
    };
}

// 套用進度更新 - 將選中的事項加入全部清單
function applyProgressUpdate() {
    if (!currentProgressProjectId || !window.currentAnalysis) {
        alert('無法套用更新');
        return;
    }

    const project = projects.find(p => p.id === currentProgressProjectId);
    if (!project) {
        alert('找不到專案');
        return;
    }

    const analysis = window.currentAnalysis;

    // 取得選中的任務
    const selectedTasks = analysis.tasks.filter(t => t.selected);

    if (selectedTasks.length === 0) {
        alert('請至少選擇一個事項');
        return;
    }

    // 更新專案整體進度和階段
    project.progress = analysis.overallProgress;
    if (analysis.phase) {
        project.phase = analysis.phase;
        project.statusText = analysis.phaseText;
    }

    // 將選中的事項加入全部事項（tasks）
    if (!project.tasks) {
        project.tasks = [];
    }

    // 為每個選中的任務建立 task 項目
    selectedTasks.forEach(task => {
        const newTask = {
            name: task.name,
            start: task.start,
            end: task.end,
            progress: task.progress
        };
        project.tasks.push(newTask);
    });

    // 關閉彈窗並重新整理
    closeAddProgressModal();
    renderAllViews();

    alert(`✅ 成功新增 ${selectedTasks.length} 個事項到全部清單！`);
}

// 快速更新專案階段
function updateProjectPhase(projectId, newPhase) {
    const project = projects.find(p => p.id === projectId);
    if (!project) return;

    const phaseMap = {
        'proposing': '💡 提案中',
        'proposal_pending': '📤 提案待確認',
        'quoting': '📋 報價中',
        'pending': '🔵 報價待確認',
        'sampling': '🔨 打樣中',
        'production': '🏭 生產中',
        'completed': '✅ 已完成'
    };

    // 確認變更
    if (!confirm(`確定將「${project.name}」變更為「${phaseMap[newPhase]}」?`)) {
        renderList(); // 重新整理恢復原狀
        return;
    }

    // 更新階段
    project.phase = newPhase;
    project.statusText = phaseMap[newPhase];

    // 如果完成，設定進度為100%
    if (newPhase === 'completed') {
        project.progress = 100;
    }

    // 重新整理所有視圖
    renderAllViews();

    // 顯示提示
    showToast(`已更新為「${phaseMap[newPhase]}」`);
}

// 顯示 Toast 提示
function showToast(message) {
    const toast = document.createElement('div');
    toast.className = 'toast-notification';
    toast.textContent = message;
    toast.style.cssText = `
        position: fixed;
        bottom: 20px;
        left: 50%;
        transform: translateX(-50%);
        background: #10b981;
        color: white;
        padding: 12px 24px;
        border-radius: 8px;
        box-shadow: 0 4px 12px rgba(0,0,0,0.15);
        z-index: 9999;
        font-size: 14px;
        animation: slideUp 0.3s ease;
    `;
    document.body.appendChild(toast);

    setTimeout(() => {
        toast.remove();
    }, 3000);
}

// ==================== 專案進度AI輔助填入功能結束 ====================

// ==================== 待辦事項功能優化 (SYS-2026-0321-003) ====================

let currentTodoProject = null;
let currentTodoFilter = 'all';
let hideCompleted = false;
let showOverdueOnly = false;
let isTodoModalOpen = false; // 追蹤 modal 開啟狀態，防止競態條件
let currentGanttProject = null;
let ganttHideCompleted = false;
let ganttShowOverdue = false;

// 渲染待辦事項列表
function renderTodoList(container, project, filter) {
    // 防禦性檢查：確保 modal 是開啟狀態
    if (!isTodoModalOpen) {
        console.log('renderTodoList skipped: modal is not open');
        return;
    }

    // 防禦性檢查
    if (!project) {
        console.error('renderTodoList: project is null/undefined');
        container.innerHTML = '<div class="todo-empty">❌ 專案資料錯誤</div>';
        return;
    }

    // 確保 tasks 存在
    if (!project.tasks || !Array.isArray(project.tasks)) {
        console.warn('renderTodoList: project.tasks is missing, creating empty array');
        project.tasks = [];
    }

    // 根據篩選條件過濾任務
    let filteredTasks = project.tasks.map((task, index) => ({ ...task, originalIndex: index }));

    if (filter === 'incomplete') {
        filteredTasks = filteredTasks.filter(task => task.progress < 100);
    }

    if (hideCompleted) {
        filteredTasks = filteredTasks.filter(task => task.progress < 100);
    }

    // 只顯示逾期事項
    if (showOverdueOnly) {
        const today = new Date();
        filteredTasks = filteredTasks.filter(task => {
            const taskEnd = new Date(task.end);
            return taskEnd < today && task.progress < 100;
        });
    }

    const completedCount = project.tasks.filter(t => t.progress === 100).length;
    const totalCount = project.tasks.length;
    const overdueCount = project.tasks.filter(t => {
        const taskEnd = new Date(t.end);
        return taskEnd < new Date() && t.progress < 100;
    }).length;

    const tasksHtml = filteredTasks.map((task) => {
        const today = new Date();
        const taskEnd = new Date(task.end);
        const taskStart = new Date(task.start);
        const isOverdue = taskEnd < today && task.progress < 100;
        const isCompleted = task.progress === 100;

        // 計算工作天數
        const workDays = Math.ceil((taskEnd - taskStart) / (1000 * 60 * 60 * 24)) + 1;

        // 負責人和跟催人（預設值）
        const assignedTo = task.assigned_to || project.sales_rep || '未分配';
        const followUpBy = task.follow_up_by || 'Kevin';

        return `
            <li class="todo-item ${isCompleted ? 'completed' : ''} ${isOverdue ? 'overdue' : ''}" data-index="${task.originalIndex}">
                <div class="todo-main">
                    <label class="todo-checkbox-label">
                        <input type="checkbox" class="todo-checkbox"
                            ${isCompleted ? 'checked' : ''}
                            onchange="toggleTaskComplete('${project.id}', ${task.originalIndex}, this.checked)">
                        <span class="todo-checkbox-custom"></span>
                    </label>
                    <div class="todo-content">
                        <div class="todo-name ${isCompleted ? 'strikethrough' : ''}" onclick="openTaskEditModal('${project.id}', ${task.originalIndex})" style="cursor:pointer;" title="點擊編輯">${task.name}</div>
                        <div class="todo-assignees">
                            <span class="assignee-badge assignee-primary" onclick="openTaskEditModal('${project.id}', ${task.originalIndex})" style="cursor:pointer;" title="點擊編輯">👤 ${assignedTo}</span>
                            <span class="assignee-badge assignee-followup" onclick="openTaskEditModal('${project.id}', ${task.originalIndex})" style="cursor:pointer;" title="點擊編輯">🔔 ${followUpBy}</span>
                        </div>
                    </div>
                    ${isOverdue ? '<span class="badge-overdue">逾期</span>' : ''}
                </div>                <div class="todo-details">
                    <div class="todo-dates">
                        <span class="date-range">📅 ${task.start} → ${task.end}</span>
                        <span class="work-days">⏱️ ${workDays} 天</span>
                    </div>
                    <div class="todo-progress-info">
                        <div class="progress-bar-small">
                            <div class="progress-fill-small ${isCompleted ? 'completed' : ''}" style="width: ${task.progress}%"></div>
                        </div>
                        <span class="progress-text ${isCompleted ? 'completed' : ''}">${task.progress}%</span>
                    </div>
                </div>
            </li>
        `;
    }).join('');

    // 如果沒有待辦事項
    const emptyMessage = filteredTasks.length === 0
        ? `<div class="todo-empty">
            ${hideCompleted ? '✅ 已完成項目已隱藏' : '🎉 所有事項已完成！'}
          </div>`
        : '';

    // 渲染 HTML - 確保 todo-controls 始終顯示
    const html = `
        <div class="todo-controls" style="display: flex !important; justify-content: space-between; align-items: center; padding: 12px 16px; background: #f8fafc; border-radius: 8px; margin-bottom: 16px; border: 2px solid #3b82f6;">
            <div class="todo-filters" style="display: flex !important; gap: 16px; flex-wrap: wrap;">
                <label class="todo-toggle-label" style="display: flex !important; align-items: center; gap: 8px; cursor: pointer; font-size: 14px; color: #374151;">
                    <input type="checkbox" id="hide-completed-toggle" ${hideCompleted ? 'checked' : ''}
                        onchange="toggleHideCompleted(this.checked)" style="width: 18px; height: 18px; cursor: pointer;">
                    <span>隱藏已完成 (${completedCount}/${totalCount})</span>
                </label>
                <label class="todo-toggle-label overdue-filter" style="display: flex !important; align-items: center; gap: 8px; cursor: pointer; font-size: 14px; color: #dc2626; font-weight: 500;">
                    <input type="checkbox" id="show-overdue-toggle" ${showOverdueOnly ? 'checked' : ''}
                        onchange="toggleShowOverdueOnly(this.checked)" style="width: 18px; height: 18px; cursor: pointer; accent-color: #ef4444;">
                    <span>🔴 只顯示逾期 (${overdueCount})</span>
                </label>
            </div>
            <span class="todo-progress-summary" style="font-size: 14px; color: #6b7280;">專案進度: <strong>${project.progress}%</strong></span>
        </div>
        <div class="todo-project-info">
            <div class="todo-info-item">
                <span class="todo-info-label">專案編號</span>
                <span class="todo-info-value">${project.id || 'N/A'}</span>
            </div>
            <div class="todo-info-item">
                <span class="todo-info-label">客戶</span>
                <span class="todo-info-value">${project.client || 'N/A'} / ${project.contact || 'N/A'}</span>
            </div>
            <div class="todo-info-item">
                <span class="todo-info-label">截止日</span>
                <span class="todo-info-value">${project.deadline || 'N/A'}</span>
            </div>
        </div>
        <h3>任務清單 (${filteredTasks.length} 項)</h3>
        ${emptyMessage}
        <ul class="todo-list">${tasksHtml}</ul>
    `;

    container.innerHTML = html;

    // 調試訊息
    console.log('renderTodoList completed:', {
        projectId: project.id,
        totalTasks: totalCount,
        filteredTasks: filteredTasks.length,
        hasTodoControls: container.querySelector('.todo-controls') !== null
    });
}

// 切換任務完成狀態
function toggleTaskComplete(projectId, taskIndex, isChecked) {
    const project = projects.find(p => p.id === projectId);
    if (!project || !project.tasks[taskIndex]) return;

    // 更新任務進度
    project.tasks[taskIndex].progress = isChecked ? 100 : 0;

    // 自動計算專案整體進度
    updateProjectProgress(project);

    // 重新渲染列表
    const body = document.getElementById('todo-modal-body');
    renderTodoList(body, project, currentTodoFilter);

    // 顯示提示
    const taskName = project.tasks[taskIndex].name;
    const message = isChecked ? `✅ 「${taskName}」已完成` : `⏳ 「${taskName}」已標記為未完成`;
    showTodoToast(message);
}

// 更新專案進度（自動計算）
function updateProjectProgress(project) {
    if (!project.tasks || project.tasks.length === 0) return;

    const totalProgress = project.tasks.reduce((sum, task) => sum + task.progress, 0);
    const averageProgress = Math.round(totalProgress / project.tasks.length);

    project.progress = averageProgress;

    // 如果全部完成，更新狀態
    if (project.progress === 100 && project.phase !== 'completed') {
        project.phase = 'completed';
        project.statusText = '✅ 已完成';
    }
}

// 切換隱藏已完成項目
function toggleHideCompleted(isChecked) {
    if (!isTodoModalOpen) return; // 防止競態條件
    hideCompleted = isChecked;
    if (currentTodoProject) {
        const body = document.getElementById('todo-modal-body');
        if (body) renderTodoList(body, currentTodoProject, currentTodoFilter);
    }
}

// 切換只顯示逾期事項
function toggleShowOverdueOnly(isChecked) {
    if (!isTodoModalOpen) return; // 防止競態條件
    showOverdueOnly = isChecked;
    if (currentTodoProject) {
        const body = document.getElementById('todo-modal-body');
        if (body) renderTodoList(body, currentTodoProject, currentTodoFilter);
    }
}

// 覆寫關閉待辦事項彈窗函數
closeTodoModal = function() {
    document.getElementById('todo-modal').classList.remove('active');
    isTodoModalOpen = false; // 標記 modal 已關閉
    currentTodoProject = null;
    currentTodoFilter = 'all';
    showOverdueOnly = false;
    hideCompleted = false;
    // 不重新整理主頁面，避免競態條件
};

// 分頁式篩選切換（新設計）
function switchTodoFilter(filter) {
    console.log('switchTodoFilter called:', filter);

    if (!currentTodoProject) {
        console.error('switchTodoFilter: currentTodoProject is null');
        return;
    }

    currentTodoFilter = filter;

    // 更新按鈕樣式
    const btnAll = document.getElementById('btn-show-all');
    const btnIncomplete = document.getElementById('btn-show-incomplete');
    const btnOverdue = document.getElementById('btn-show-overdue');

    // 重置所有按鈕為未選中狀態
    [btnAll, btnIncomplete, btnOverdue].forEach(btn => {
        if (btn) {
            btn.style.background = 'white';
            btn.style.color = '#374151';
            btn.style.border = '1px solid #d1d5db';
        }
    });

    // 設定選中按鈕樣式
    let activeBtn;
    switch(filter) {
        case 'all':
            activeBtn = btnAll;
            hideCompleted = false;
            showOverdueOnly = false;
            break;
        case 'incomplete':
            activeBtn = btnIncomplete;
            hideCompleted = true;
            showOverdueOnly = false;
            break;
        case 'overdue':
            activeBtn = btnOverdue;
            hideCompleted = false;
            showOverdueOnly = true;
            break;
    }

    if (activeBtn) {
        activeBtn.style.background = '#3b82f6';
        activeBtn.style.color = 'white';
        activeBtn.style.border = '1px solid #3b82f6';
    }

    // 重新渲染任務清單
    const body = document.getElementById('todo-modal-body');
    if (body) {
        renderTaskListOnly(body, currentTodoProject, filter);
    }
}

// 顯示待辦事項提示
function showTodoToast(message) {
    const toast = document.createElement('div');
    toast.className = 'todo-toast';
    toast.textContent = message;
    toast.style.cssText = `
        position: fixed;
        bottom: 20px;
        left: 50%;
        transform: translateX(-50%);
        background: #10b981;
        color: white;
        padding: 12px 24px;
        border-radius: 8px;
        box-shadow: 0 4px 12px rgba(0,0,0,0.15);
        z-index: 10000;
        font-size: 14px;
        animation: slideUp 0.3s ease;
    `;
    document.body.appendChild(toast);

    setTimeout(() => {
        toast.remove();
    }, 2000);
}

// ==================== 待辦事項功能優化結束 ====================

// ==================== 人員搜尋功能 (SYS-2026-0321-007) ====================

// 初始化人員篩選器
function initSalesRepFilter() {
    // 檢查是否已存在篩選器
    if (document.getElementById('sales-rep-filter')) return;

    // 在標題區添加人員篩選器
    const statusBar = document.querySelector('.status-bar');
    if (!statusBar) return;

    const filterContainer = document.createElement('div');
    filterContainer.className = 'sales-rep-filter-container';
    filterContainer.innerHTML = `
        <label>👤 業務：</label>
        <select id="sales-rep-filter" onchange="filterBySalesRep(this.value)">
            <option value="all">全部人員</option>
            ${SALES_REPS.map(rep => `<option value="${rep}">${rep}</option>`).join('')}
        </select>
        <button class="btn-my-projects" onclick="showMyProjects()">📋 我的專案</button>
    `;

    statusBar.appendChild(filterContainer);

    // 添加逾期警示區域
    addOverdueAlertSection();
}

// 依業務篩選
function filterBySalesRep(salesRep) {
    if (salesRep === 'all') {
        filterState.searchQuery1 = '';
        document.getElementById('search-box-1').value = '';
    } else {
        filterState.searchQuery1 = salesRep.toLowerCase();
        document.getElementById('search-box-1').value = salesRep;
    }
    renderAllViews();

    // 顯示篩選提示
    if (salesRep !== 'all') {
        showToast(`已篩選：${salesRep} 的專案`);
    }
}

// 顯示「我的專案」
function showMyProjects() {
    // 暫時使用「姿姿」作為範例（待登入系統完成後使用目前登入者）
    const myName = '姿姿';
    filterState.searchQuery1 = myName.toLowerCase();
    document.getElementById('search-box-1').value = myName;
    renderAllViews();
    showToast(`👤 顯示 ${myName} 的專案`);
}

// 取得過濾後的專案列表
function getFilteredProjects() {
    return projects.filter(project => {
        // 階段篩選
        if (filterState.phase !== 'all' && project.phase !== filterState.phase) {
            return false;
        }

        // 搜尋關鍵詞（支援兩個搜尋框，AND 邏輯）
        const searchFields = [
            project.client || '',
            project.name || '',
            project.contact || '',
            project.sales_rep || '',
            project.id || ''
        ].map(f => f.toLowerCase());

        // 第一個搜尋框
        if (filterState.searchQuery1) {
            const query1 = filterState.searchQuery1.toLowerCase().trim();
            const match1 = searchFields.some(field => field.includes(query1));
            if (!match1) return false;
        }

        // 第二個搜尋框（AND 邏輯）
        if (filterState.searchQuery2) {
            const query2 = filterState.searchQuery2.toLowerCase().trim();
            const match2 = searchFields.some(field => field.includes(query2));
            if (!match2) return false;
        }

        return true;
    });
}

// 添加逾期警示區域
function addOverdueAlertSection() {
    const container = document.querySelector('.container');
    if (!container) return;

    const alertSection = document.createElement('div');
    alertSection.id = 'overdue-alert-section';
    alertSection.className = 'overdue-alert-section';
    alertSection.style.display = 'none';

    container.insertBefore(alertSection, container.querySelector('.nav-tabs'));

    // 檢查並顯示逾期專案
    updateOverdueAlerts();
}

// 更新逾期警示
function updateOverdueAlerts() {
    const alertSection = document.getElementById('overdue-alert-section');
    if (!alertSection) return;

    const today = new Date();
    const overdueProjects = projects.filter(p => {
        const deadline = new Date(p.deadline);
        return deadline < today && p.progress < 100 && p.phase !== 'completed';
    });

    if (overdueProjects.length === 0) {
        alertSection.style.display = 'none';
        return;
    }

    alertSection.style.display = 'block';
    alertSection.innerHTML = `
        <div class="overdue-header">
            <span class="overdue-icon">🔴</span>
            <span class="overdue-title">逾期警示：${overdueProjects.length} 個專案已逾期</span>
        </div>
        <div class="overdue-list">
            ${overdueProjects.map(p => `
                <div class="overdue-item" onclick="showProjectDetail(projects.find(proj => proj.id === '${p.id}'))">
                    <span class="overdue-project-id">${p.id}</span>
                    <span class="overdue-project-name">${p.name}</span>
                    <span class="overdue-project-client">${p.client}</span>
                    <span class="overdue-days">逾期 ${Math.ceil((today - new Date(p.deadline)) / (1000 * 60 * 60 * 24))} 天</span>
                </div>
            `).join('')}
        </div>
    `;
}

// 顯示工作量統計
function showWorkloadStats() {
    const stats = {};
    SALES_REPS.forEach(rep => {
        stats[rep] = {
            total: 0,
            proposing: 0,
            quoting: 0,
            sampling: 0,
            production: 0,
            completed: 0
        };
    });

    projects.forEach(p => {
        const rep = p.sales_rep || '未分配';
        if (stats[rep]) {
            stats[rep].total++;
            if (p.phase === 'proposing' || p.phase === 'proposal_pending') stats[rep].proposing++;
            else if (p.phase === 'quoting' || p.phase === 'pending') stats[rep].quoting++;
            else if (p.phase === 'sampling') stats[rep].sampling++;
            else if (p.phase === 'production') stats[rep].production++;
            else if (p.phase === 'completed') stats[rep].completed++;
        }
    });

    // 建立統計彈窗
    const modal = document.createElement('div');
    modal.className = 'modal active';
    modal.id = 'workload-stats-modal';
    modal.innerHTML = `
        <div class="modal-content stats-modal-content">
            <span class="close-btn" onclick="document.getElementById('workload-stats-modal').remove()">×</span>
            <h2>📊 業務工作量統計</h2>
            <div class="stats-table-container">
                <table class="stats-table">
                    <thead>
                        <tr>
                            <th>業務</th>
                            <th>負責中</th>
                            <th>💡 提案</th>
                            <th>📋 報價</th>
                            <th>🔨 打樣</th>
                            <th>🏭 生產</th>
                            <th>✅ 已完成</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${SALES_REPS.map(rep => `
                            <tr>
                                <td><strong>${rep}</strong></td>
                                <td>${stats[rep].total}</td>
                                <td>${stats[rep].proposing}</td>
                                <td>${stats[rep].quoting}</td>
                                <td>${stats[rep].sampling}</td>
                                <td>${stats[rep].production}</td>
                                <td>${stats[rep].completed}</td>
                            </tr>
                        `).join('')}
                    </tbody>
                </table>
            </div>
        </div>
    `;

    document.body.appendChild(modal);

    // 點擊彈窗外關閉
    modal.onclick = function(e) {
        if (e.target === modal) modal.remove();
    };
}

// 顯示提示
function showToast(message) {
    const toast = document.createElement('div');
    toast.className = 'toast-notification';
    toast.textContent = message;
    toast.style.cssText = `
        position: fixed;
        bottom: 20px;
        left: 50%;
        transform: translateX(-50%);
        background: #3b82f6;
        color: white;
        padding: 12px 24px;
        border-radius: 8px;
        box-shadow: 0 4px 12px rgba(0,0,0,0.15);
        z-index: 10000;
        font-size: 14px;
        animation: slideUp 0.3s ease;
    `;
    document.body.appendChild(toast);

    setTimeout(() => {
        toast.remove();
    }, 3000);
}

// 覆寫 renderAllViews 以支援篩選
const originalRenderAllViews = renderAllViews;
renderAllViews = function() {
    // 更新各視圖
    renderProposalView();
    renderQuoteView();
    renderSampleView();
    renderProductionView();
    renderList();
    renderPendingConfirmView();
    updateStats();
    updateOverdueAlerts();
};

// 覆寫原本的渲染函數以支援篩選
function getProjectsForView(phase) {
    const filtered = getFilteredProjects();
    if (phase === 'all') return filtered;
    return filtered.filter(p => p.phase === phase);
}

// ==================== 人員搜尋功能結束 ====================

// ==================== 全局搜尋功能 ====================

function filterGlobalProjects() {
    const query1 = document.getElementById('search-box-1').value.toLowerCase().trim();
    const query2 = document.getElementById('search-box-2').value.toLowerCase().trim();

    filterState.searchQuery1 = query1;
    filterState.searchQuery2 = query2;

    renderAllViews();
}

function clearGlobalFilter() {
    filterState.searchQuery1 = '';
    filterState.searchQuery2 = '';
    document.getElementById('search-box-1').value = '';
    document.getElementById('search-box-2').value = '';
    renderAllViews();
}

// ==================== 搜尋結果彈窗功能 ====================

function openSearchResultsModal() {
    const query1 = document.getElementById('search-box-1').value.trim();
    const query2 = document.getElementById('search-box-2').value.trim();

    // 更新篩選狀態
    filterState.searchQuery1 = query1.toLowerCase();
    filterState.searchQuery2 = query2.toLowerCase();

    // 執行搜尋
    const results = getFilteredProjects();

    // 更新彈窗標題
    const titleEl = document.getElementById('search-results-title');
    titleEl.innerHTML = `🔍 搜尋結果 <span style="font-size: 14px; color: #6b7280;">(${results.length} 個專案)</span>`;

    // 更新搜尋資訊
    const infoEl = document.getElementById('search-results-info');
    let searchInfoHtml = '搜尋條件：';
    if (query1) {
        searchInfoHtml += `<span class="search-term">${query1}</span>`;
    }
    if (query2) {
        searchInfoHtml += ` + <span class="search-term">${query2}</span>`;
    }
    if (!query1 && !query2) {
        searchInfoHtml += '<span class="search-term">顯示全部</span>';
    }
    infoEl.innerHTML = searchInfoHtml;

    // 渲染結果
    const resultsBody = document.getElementById('search-results-body');
    resultsBody.innerHTML = '';

    if (results.length === 0) {
        resultsBody.innerHTML = `
            <div style="text-align: center; padding: 60px 20px; color: #6b7280;">
                <i class="fas fa-search" style="font-size: 48px; margin-bottom: 16px; display: block;"></i>
                <p>找不到符合條件的專案</p>
                <p style="font-size: 13px; margin-top: 8px;">請嘗試其他關鍵字</p>
            </div>
        `;
    } else {
        results.forEach(project => {
            const card = createProjectCard(project);
            resultsBody.appendChild(card);
        });
    }

    // 顯示彈窗
    const modal = document.getElementById('search-results-modal');
    modal.classList.add('active');
    document.body.style.overflow = 'hidden';
}

function closeSearchResultsModal() {
    const modal = document.getElementById('search-results-modal');
    modal.classList.remove('active');
    document.body.style.overflow = '';
}

// ==================== 人員查詢功能 ====================
let currentQueryFilter = 'incomplete';
let currentQueryCompany = '';
let currentQueryPerson = '';

// 開啟人員查詢彈窗
function openPersonQueryModal() {
    console.log('openPersonQueryModal called');
    const modal = document.getElementById('person-query-modal');
    if (!modal) {
        console.error('person-query-modal not found');
        alert('系統錯誤：找不到人員查詢視窗');
        return;
    }

    const companyInput = document.getElementById('query-company-input');
    const personInput = document.getElementById('query-person-input');
    const companySuggestions = document.getElementById('query-company-suggestions');
    const personSuggestions = document.getElementById('query-person-suggestions');
    const filterButtons = document.getElementById('query-filter-buttons');
    const resultsContainer = document.getElementById('query-results-container');
    const noResults = document.getElementById('query-no-results');

    if (companyInput) companyInput.value = '';
    if (personInput) personInput.value = '';
    if (companySuggestions) companySuggestions.style.display = 'none';
    if (personSuggestions) personSuggestions.style.display = 'none';
    if (filterButtons) filterButtons.style.display = 'none';
    if (resultsContainer) resultsContainer.style.display = 'none';
    if (noResults) noResults.style.display = 'block';

    modal.classList.add('active');
    console.log('Person query modal opened');
}

// 關閉人員查詢彈窗
function closePersonQueryModal() {
    const modal = document.getElementById('person-query-modal');
    modal.classList.remove('active');
    currentQueryCompany = '';
    currentQueryPerson = '';
}

// 搜尋公司（用於人員查詢）
function searchCompaniesForQuery(query) {
    const suggestionsDiv = document.getElementById('query-company-suggestions');
    if (!query || query.trim() === '') {
        suggestionsDiv.style.display = 'none';
        return;
    }

    const matches = clientsDB.filter(c => c.name.toLowerCase().includes(query.toLowerCase()));

    if (matches.length === 0) {
        suggestionsDiv.style.display = 'none';
        return;
    }

    suggestionsDiv.innerHTML = matches.map(client => `
        <div onclick="selectCompanyForQuery('${client.name}')"
             style="padding: 10px 12px; cursor: pointer; border-bottom: 1px solid #f3f4f6; font-size: 14px;"
             onmouseover="this.style.background='#f3f4f6'"
             onmouseout="this.style.background='white'"
        >
            <div style="font-weight: 500;">${client.name}</div>
            <div style="font-size: 12px; color: #6b7280;">聯絡人: ${client.contacts.join(', ') || '無'}</div>
        </div>
    `).join('');

    suggestionsDiv.style.display = 'block';
}

// 選擇公司（用於人員查詢）
function selectCompanyForQuery(companyName) {
    document.getElementById('query-company-input').value = companyName;
    document.getElementById('query-company-suggestions').style.display = 'none';
    currentQueryCompany = companyName;

    // 取得該公司的人員列表
    const client = clientsDB.find(c => c.name === companyName);
    if (client && client.contacts.length > 0) {
        // 自動顯示人員建議
        searchPersonsForQuery('');
    }
}

// 搜尋人員（用於人員查詢）
function searchPersonsForQuery(query) {
    const suggestionsDiv = document.getElementById('query-person-suggestions');
    const companyName = document.getElementById('query-company-input').value.trim();

    // 取得該公司的人員
    let persons = [];
    if (companyName) {
        const client = clientsDB.find(c => c.name === companyName);
        if (client) {
            persons = client.contacts;
        }
    }

    // 如果沒有公司或公司沒有人員，從所有專案中收集人員
    if (persons.length === 0) {
        const personSet = new Set();
        projects.forEach(p => {
            if (p.sales_rep) personSet.add(p.sales_rep);
            if (p.tasks) {
                p.tasks.forEach(t => {
                    if (t.assigned_to) personSet.add(t.assigned_to);
                });
            }
        });
        persons = Array.from(personSet);
    }

    // 過濾符合輸入的人員
    let matches = persons;
    if (query && query.trim() !== '') {
        matches = persons.filter(p => p.toLowerCase().includes(query.toLowerCase()));
    }

    if (matches.length === 0) {
        suggestionsDiv.style.display = 'none';
        return;
    }

    suggestionsDiv.innerHTML = matches.map(person => `
        <div onclick="selectPersonForQuery('${person}')"
             style="padding: 10px 12px; cursor: pointer; border-bottom: 1px solid #f3f4f6; font-size: 14px;"
             onmouseover="this.style.background='#f3f4f6'"
             onmouseout="this.style.background='white'"
        >
            👤 ${person}
        </div>
    `).join('');

    suggestionsDiv.style.display = 'block';
}

// 選擇人員（用於人員查詢）
function selectPersonForQuery(personName) {
    document.getElementById('query-person-input').value = personName;
    document.getElementById('query-person-suggestions').style.display = 'none';
    currentQueryPerson = personName;
}

// 執行人員查詢
function executePersonQuery() {
    const company = document.getElementById('query-company-input').value.trim();
    const person = document.getElementById('query-person-input').value.trim();

    if (!person) {
        alert('請輸入人員名稱');
        return;
    }

    currentQueryCompany = company;
    currentQueryPerson = person;
    currentQueryFilter = 'incomplete';

    // 顯示篩選按鈕
    document.getElementById('query-filter-buttons').style.display = 'block';
    document.getElementById('query-no-results').style.display = 'none';

    // 更新按鈕樣式
    updateQueryFilterButtons();

    // 渲染結果
    renderQueryResults();
}

// 切換查詢篩選
function switchQueryFilter(filter) {
    currentQueryFilter = filter;
    updateQueryFilterButtons();
    renderQueryResults();
}

// 更新查詢篩選按鈕樣式
function updateQueryFilterButtons() {
    const btnAll = document.getElementById('btn-query-all');
    const btnIncomplete = document.getElementById('btn-query-incomplete');
    const btnOverdue = document.getElementById('btn-query-overdue');

    [btnAll, btnIncomplete, btnOverdue].forEach(btn => {
        btn.style.background = 'white';
        btn.style.color = '#374151';
        btn.style.border = '1px solid #d1d5db';
    });

    let activeBtn;
    switch(currentQueryFilter) {
        case 'all': activeBtn = btnAll; break;
        case 'incomplete': activeBtn = btnIncomplete; break;
        case 'overdue': activeBtn = btnOverdue; break;
    }

    if (activeBtn) {
        activeBtn.style.background = '#3b82f6';
        activeBtn.style.color = 'white';
        activeBtn.style.border = '1px solid #3b82f6';
    }
}

// 渲染查詢結果
function renderQueryResults() {
    const container = document.getElementById('query-results-container');
    const listDiv = document.getElementById('query-results-list');
    const titleSpan = document.getElementById('query-result-title');
    const countSpan = document.getElementById('query-result-count');

    // 收集該人員的所有任務
    let allTasks = [];

    projects.forEach(project => {
        // 跳過已結案的專案
        if (project.isClosed || project.phase === 'completed') return;

        // 檢查任務負責人 - 同時考慮 assigned_to 和專案的 sales_rep
        if (project.tasks) {
            project.tasks.forEach((task, taskIndex) => {
                // 檢查任務的 assigned_to 或繼承專案的 sales_rep
                let taskAssignee = task.assigned_to;
                if (!taskAssignee && project.sales_rep) {
                    taskAssignee = project.sales_rep;
                }

                // 如果都沒有，跳過此任務
                if (!taskAssignee) return;

                // 跳過隱藏的任務（未完成結案的任務）
                if (task.isHidden) return;

                // 檢查是否匹配查詢的人員（不區分大小寫）
                if (taskAssignee.toLowerCase() === currentQueryPerson.toLowerCase()) {
                    // 檢查是否符合公司條件（如果有指定公司）
                    // 注意：「銓宏國際」是內部公司，對應到專案負責人情況
                    if (currentQueryCompany && currentQueryCompany !== '') {
                        // 如果查詢的是銓宏國際，則匹配所有負責人符合的任務
                        // 否則按客戶名稱匹配
                        if (currentQueryCompany !== '銓宏國際' && project.client !== currentQueryCompany) {
                            return;
                        }
                    }

                    allTasks.push({
                        project: project,
                        task: task,
                        taskIndex: taskIndex,
                        assignee: taskAssignee
                    });
                }
            });
        }
    });

    // 根據篩選條件過濾
    const today = new Date();
    today.setHours(0, 0, 0, 0); // 設為當天開始時間

    let filteredTasks = allTasks;

    if (currentQueryFilter === 'incomplete') {
        filteredTasks = allTasks.filter(t => t.task.progress < 100);
    } else if (currentQueryFilter === 'overdue') {
        filteredTasks = allTasks.filter(t => {
            if (!t.task.end || t.task.progress === 100) return false;
            const taskEnd = new Date(t.task.end);
            taskEnd.setHours(0, 0, 0, 0); // 設為當天開始時間
            return taskEnd < today;
        });
    }

    // 按時間排序（開始日期）
    filteredTasks.sort((a, b) => {
        const dateA = a.task.start ? new Date(a.task.start) : new Date(0);
        const dateB = b.task.start ? new Date(b.task.start) : new Date(0);
        return dateA - dateB;
    });

    // 更新標題和數量
    const filterText = currentQueryFilter === 'all' ? '全部' :
                       currentQueryFilter === 'incomplete' ? '待辦' : '逾期';
    titleSpan.innerHTML = `${currentQueryPerson} 的${filterText}事項 <span style="font-size: 12px; color: #6b7280; font-weight: normal;">(點擊事項可編輯進度)</span>`;
    countSpan.textContent = `(${filteredTasks.length} 項)`;

    // 渲染清單式任務列表
    if (filteredTasks.length === 0) {
        listDiv.innerHTML = `
            <div style="text-align: center; padding: 30px; color: #9ca3af; background: #f9fafb; border-radius: 8px;">
                <p>沒有找到符合條件的事項</p>
            </div>
        `;
    } else {
        // 使用表格/清單格式顯示
        let html = `
            <table style="width: 100%; border-collapse: collapse; font-size: 13px;">
                <thead>
                    <tr style="background: #f3f4f6; border-bottom: 2px solid #e5e7eb;">
                        <th style="padding: 10px 4px; text-align: center; font-weight: 600; color: #374151; width: 40px;">完成</th>
                        <th style="padding: 10px 8px; text-align: left; font-weight: 600; color: #374151;">時間</th>
                        <th style="padding: 10px 8px; text-align: left; font-weight: 600; color: #374151;">專案/客戶</th>
                        <th style="padding: 10px 8px; text-align: left; font-weight: 600; color: #374151;">事項</th>
                        <th style="padding: 10px 8px; text-align: center; font-weight: 600; color: #374151;">進度</th>
                        <th style="padding: 10px 8px; text-align: center; font-weight: 600; color: #374151;">狀態</th>
                    </tr>
                </thead>
                <tbody>
        `;

        html += filteredTasks.map(item => {
            const isCompleted = item.task.progress === 100;
            let isOverdue = false;
            if (item.task.end && !isCompleted) {
                const taskEnd = new Date(item.task.end);
                taskEnd.setHours(0, 0, 0, 0);
                const compareToday = new Date(today);
                compareToday.setHours(0, 0, 0, 0);
                isOverdue = taskEnd < compareToday;
            }

            const dateStr = item.task.start ? formatDateShort(item.task.start) : '-';
            const endDateStr = item.task.end ? formatDateShort(item.task.end) : '';
            const dateDisplay = endDateStr ? `${dateStr}~${endDateStr}` : dateStr;

            let statusBadge = '';
            if (isCompleted) {
                statusBadge = '<span style="background: #22c55e; color: white; padding: 2px 8px; border-radius: 4px; font-size: 11px;">已完成</span>';
            } else if (isOverdue) {
                statusBadge = '<span style="background: #ef4444; color: white; padding: 2px 8px; border-radius: 4px; font-size: 11px;">逾期</span>';
            } else {
                statusBadge = '<span style="background: #3b82f6; color: white; padding: 2px 8px; border-radius: 4px; font-size: 11px;">進行中</span>';
            }

            return `
                <tr style="border-bottom: 1px solid #e5e7eb; background: ${isCompleted ? '#f0fdf4' : isOverdue ? '#fef2f2' : 'white'};">
                    <td style="padding: 10px 4px; text-align: center;" onclick="event.stopPropagation();">
                        <input type="checkbox"
                               ${isCompleted ? 'checked' : ''}
                               onchange="toggleTaskCompleteFromQuery('${item.project.id}', ${item.taskIndex}, this.checked)"
                               style="width: 20px; height: 20px; cursor: pointer;"
                               title="${isCompleted ? '標記為未完成' : '標記為已完成'}"
                        >
                    </td>
                    <td style="padding: 10px 8px; color: #6b7280; white-space: nowrap; cursor: pointer;"
                        onclick="editTaskProgressFromQuery('${item.project.id}', ${item.taskIndex})"
                    >${dateDisplay}</td>
                    <td style="padding: 10px 8px; cursor: pointer;"
                        onclick="editTaskProgressFromQuery('${item.project.id}', ${item.taskIndex})"
                    >
                        <div style="font-weight: 500; color: #111827;">${item.project.name}</div>
                        <div style="font-size: 11px; color: #6b7280;">${item.project.client || '-'}</div>
                    </td>
                    <td style="padding: 10px 8px; color: #374151; cursor: pointer;"
                        onclick="editTaskProgressFromQuery('${item.project.id}', ${item.taskIndex})"
                    >${item.task.name}</td>
                    <td style="padding: 10px 8px; text-align: center; color: #6b7280; cursor: pointer;"
                        onclick="editTaskProgressFromQuery('${item.project.id}', ${item.taskIndex})"
                    >${item.task.progress}%</td>
                    <td style="padding: 10px 8px; text-align: center; cursor: pointer;"
                        onclick="editTaskProgressFromQuery('${item.project.id}', ${item.taskIndex})"
                    >${statusBadge}</td>
                </tr>
            `;
        }).join('');

        html += '</tbody></table>';
        listDiv.innerHTML = html;
    }

    container.style.display = 'block';
}

// 從人員查詢清單切換任務完成狀態
function toggleTaskCompleteFromQuery(projectId, taskIndex, isChecked) {
    const project = projects.find(p => p.id === projectId);
    if (!project || !project.tasks[taskIndex]) return;

    const task = project.tasks[taskIndex];
    task.progress = isChecked ? 100 : 0;
    task.updated_at = new Date().toISOString();

    if (isChecked) {
        task.completed_at = new Date().toISOString();
    } else {
        delete task.completed_at;
    }

    // 儲存
    saveProjectsToLocalStorage();

    // 重新渲染查詢結果
    renderQueryResults();

    // 顯示提示
    const message = isChecked ? '✅ 已標記為完成' : '⏳ 已標記為未完成';
    showTodoToast(message);
}

// 從人員查詢清單編輯任務（完整編輯視窗）
let currentEditProjectId = null;
let currentEditTaskIndex = null;

// 通用函數：開啟任務編輯彈窗（用於待辦事項和查詢結果）
function openTaskEditModal(projectId, taskIndex) {
    const project = projects.find(p => p.id === projectId);
    if (!project || !project.tasks[taskIndex]) return;

    currentEditProjectId = projectId;
    currentEditTaskIndex = taskIndex;
    const task = project.tasks[taskIndex];

    // 使用與查詢結果相同的編輯彈窗代碼
    editTaskProgressFromQuery(projectId, taskIndex);
}

function editTaskProgressFromQuery(projectId, taskIndex) {
    const project = projects.find(p => p.id === projectId);
    if (!project || !project.tasks[taskIndex]) return;

    currentEditProjectId = projectId;
    currentEditTaskIndex = taskIndex;
    const task = project.tasks[taskIndex];

    // 建立編輯彈窗
    let modalContent = `
        <div id="task-edit-modal" class="modal active" style="z-index: 15000;">
            <div class="modal-content" style="max-width: 450px;">
                <span class="close-btn" onclick="closeTaskEditModal()">×</span>
                <h3>✏️ 編輯事項</h3>

                <div style="margin: 20px 0;">
                    <div style="margin-bottom: 15px;">
                        <label style="display: block; margin-bottom: 6px; font-size: 14px; font-weight: 500; color: #374151;">事項名稱</label>
                        <input type="text"
                               id="edit-task-name"
                               value="${task.name}"
                               style="width: 100%; padding: 10px 12px; border: 1px solid #d1d5db; border-radius: 6px; font-size: 14px; box-sizing: border-box;"
                        >
                    </div>

                    <div style="display: flex; gap: 10px; margin-bottom: 15px;">
                        <div style="flex: 1;">
                            <label style="display: block; margin-bottom: 6px; font-size: 14px; font-weight: 500; color: #374151;">開始日期</label>
                            <input type="date"
                                   id="edit-task-start"
                                   value="${task.start || ''}"
                                   onchange="updateEditProgressFromDates()"
                                   style="width: 100%; padding: 10px 12px; border: 1px solid #d1d5db; border-radius: 6px; font-size: 14px; box-sizing: border-box;"
                            >
                        </div>
                        <div style="flex: 1;">
                            <label style="display: block; margin-bottom: 6px; font-size: 14px; font-weight: 500; color: #374151;">結束日期</label>
                            <input type="date"
                                   id="edit-task-end"
                                   value="${task.end || ''}"
                                   onchange="updateEditProgressFromDates()"
                                   style="width: 100%; padding: 10px 12px; border: 1px solid #d1d5db; border-radius: 6px; font-size: 14px; box-sizing: border-box;"
                            >
                        </div>
                    </div>

                    <div style="margin-bottom: 15px;">
                        <label style="display: block; margin-bottom: 6px; font-size: 14px; font-weight: 500; color: #374151;">負責人</label>
                        <select id="edit-task-assignee"
                                style="width: 100%; padding: 10px 12px; border: 1px solid #d1d5db; border-radius: 6px; font-size: 14px; box-sizing: border-box; background: white; cursor: pointer;"
                        >
                            <option value="姿姿" ${(task.assigned_to || project.sales_rep) === '姿姿' ? 'selected' : ''}>姿姿</option>
                            <option value="Mia" ${(task.assigned_to || project.sales_rep) === 'Mia' ? 'selected' : ''}>Mia</option>
                            <option value="Kevin" ${(task.assigned_to || project.sales_rep) === 'Kevin' ? 'selected' : ''}>Kevin</option>
                            <option value="Betty" ${(task.assigned_to || project.sales_rep) === 'Betty' ? 'selected' : ''}>Betty</option>
                        </select>
                    </div>

                    <div style="margin-bottom: 20px;">
                        <label style="display: block; margin-bottom: 6px; font-size: 14px; font-weight: 500; color: #374151;">
                            進度 (<span id="edit-progress-value">${task.progress}</span>%)
                            <span style="font-size: 12px; color: #6b7280; font-weight: 400; margin-left: 8px;">📅 根據日期自動計算</span>
                        </label>
                        <input type="range"
                               id="edit-task-progress"
                               min="0"
                               max="100"
                               value="${task.progress}"
                               oninput="document.getElementById('edit-progress-value').textContent = this.value"
                               style="width: 100%; cursor: pointer;"
                        >
                        <div style="display: flex; justify-content: space-between; font-size: 12px; color: #6b7280; margin-top: 4px;">
                            <span>0%</span>
                            <span>50%</span>
                            <span>100%</span>
                        </div>
                    </div>
                </div>

                <div style="display: flex; gap: 10px;">
                    <button onclick="closeTaskEditModal()"
                            style="flex: 1; padding: 10px; background: #f3f4f6; border: 1px solid #d1d5db; border-radius: 6px; font-size: 14px; cursor: pointer;"
                    >取消</button>

                    <button onclick="saveTaskEditFromQuery()"
                            style="flex: 1; padding: 10px; background: #3b82f6; color: white; border: none; border-radius: 6px; font-size: 14px; cursor: pointer; font-weight: 500;"
                    >✅ 更新</button>
                </div>
            </div>
        </div>
    `;

    // 插入到頁面
    const existingModal = document.getElementById('task-edit-modal');
    if (existingModal) {
        existingModal.remove();
    }
    document.body.insertAdjacentHTML('beforeend', modalContent);
}

// 關閉任務編輯彈窗
function closeTaskEditModal() {
    const modal = document.getElementById('task-edit-modal');
    if (modal) {
        modal.remove();
    }
    currentEditProjectId = null;
    currentEditTaskIndex = null;
}

// 根據日期自動計算進度
function calculateAutoProgress(start, end) {
    if (!start || !end) return 0;

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const startDate = new Date(start);
    startDate.setHours(0, 0, 0, 0);

    const endDate = new Date(end);
    endDate.setHours(0, 0, 0, 0);

    // 如果還沒開始
    if (today < startDate) return 0;

    // 如果已經結束
    if (today >= endDate) return 100;

    // 計算進度
    const totalDays = (endDate - startDate) / (1000 * 60 * 60 * 24);
    const passedDays = (today - startDate) / (1000 * 60 * 60 * 24);

    if (totalDays <= 0) return 0;

    const progress = Math.round((passedDays / totalDays) * 100);
    return Math.min(100, Math.max(0, progress));
}

// 更新編輯表單中的進度顯示
function updateEditProgressFromDates() {
    const start = document.getElementById('edit-task-start').value;
    const end = document.getElementById('edit-task-end').value;

    if (start && end) {
        const autoProgress = calculateAutoProgress(start, end);
        const progressInput = document.getElementById('edit-task-progress');
        const progressValue = document.getElementById('edit-progress-value');

        if (progressInput && progressValue) {
            progressInput.value = autoProgress;
            progressValue.textContent = autoProgress;
        }
    }
}

// 儲存任務編輯（從人員查詢）
function saveTaskEditFromQuery() {
    if (!currentEditProjectId || currentEditTaskIndex === null) return;

    const project = projects.find(p => p.id === currentEditProjectId);
    if (!project || !project.tasks[currentEditTaskIndex]) return;

    // 取得新值
    const newName = document.getElementById('edit-task-name').value.trim();
    const newStart = document.getElementById('edit-task-start').value;
    const newEnd = document.getElementById('edit-task-end').value;
    const newAssignee = document.getElementById('edit-task-assignee').value.trim();
    const newProgress = parseInt(document.getElementById('edit-task-progress').value);

    if (!newName) {
        alert('請輸入事項名稱');
        return;
    }

    // 更新任務 - 直接修改陣列元素以確保引用正確
    const task = project.tasks[currentEditTaskIndex];
    task.name = newName;
    task.start = newStart;
    task.end = newEnd;
    task.assigned_to = newAssignee;
    task.progress = newProgress;
    task.updated_at = new Date().toISOString();

    // 如果進度達到100%，標記為已完成
    if (newProgress === 100) {
        task.completed_at = new Date().toISOString();
    } else {
        delete task.completed_at;
    }

    // 重新計算任務狀態（根據日期和進度）
    updateTaskStatus(task);

    // 同時更新專案整體進度
    updateProjectProgress(project);

    // 儲存到 LocalStorage
    saveProjectsToLocalStorage();

    console.log('✅ 任務已更新:', task);
    console.log('📊 專案進度已更新:', project.progress + '%');
    console.log('🏷️ 任務狀態:', task.status);

    // 關閉彈窗
    closeTaskEditModal();

    // 強制重新渲染所有視圖以確保數據同步
    renderAllViews();

    // 重新渲染待辦事項彈窗的任務列表（如果開啟中）
    const todoBody = document.getElementById('todo-modal-body');
    if (todoBody && currentTodoProject && currentTodoProject.id === currentEditProjectId) {
        renderTaskListOnly(todoBody, currentTodoProject, currentTodoFilter);
        updateTodoStats(currentTodoProject);
    }

    // 重新渲染查詢結果（確保使用最新數據）
    refreshQueryResults();

    // 顯示提示
    const message = newProgress === 100 ? '✅ 已完成並更新' : '📊 事項已更新';
    showTodoToast(message);
}

// 更新任務狀態（根據日期和進度）
function updateTaskStatus(task) {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // 如果已完成
    if (task.progress === 100) {
        task.status = 'completed';
        return;
    }

    // 檢查是否逾期
    if (task.end) {
        const endDate = new Date(task.end);
        endDate.setHours(0, 0, 0, 0);

        if (endDate < today) {
            task.status = 'overdue';
        } else {
            task.status = 'in-progress';
        }
    } else {
        task.status = 'in-progress';
    }
}

// 強制重新整理查詢結果
function refreshQueryResults() {
    // 清除容器內容以強制重新渲染
    const container = document.getElementById('query-results-container');
    if (container) {
        container.innerHTML = '';
    }

    // 使用 setTimeout 確保 DOM 更新完成後再渲染
    setTimeout(() => {
        renderQueryResults();
        console.log('🔄 查詢結果已重新整理');
    }, 100);
}

// 更新專案整體進度
function updateProjectProgress(project) {
    if (!project.tasks || project.tasks.length === 0) return;

    const totalProgress = project.tasks.reduce((sum, t) => sum + (t.progress || 0), 0);
    project.progress = Math.round(totalProgress / project.tasks.length);

    // 更新狀態文字
    if (project.progress === 100) {
        project.statusText = '✅ 已完成';
        project.status = 'completed';
    } else if (project.progress > 0) {
        project.statusText = project.statusText.replace(/🔴|🟡|🟢/, '🟡');
        project.status = 'active';
    }

    project.updated_at = new Date().toISOString();
}

// ==================== 人員查詢功能結束 ====================

// 點擊彈窗外關閉
window.onclick = function(event) {
    const modal = document.getElementById('project-modal');
    const ganttModal = document.getElementById('gantt-modal');
    const todoModal = document.getElementById('todo-modal');
    const addProjectModal = document.getElementById('add-project-modal');
    const searchResultsModal = document.getElementById('search-results-modal');
    const personQueryModal = document.getElementById('person-query-modal');
    const taskEditModal = document.getElementById('task-edit-modal');

    if (event.target === modal) {
        modal.classList.remove('active');
    }
    if (event.target === ganttModal) {
        ganttModal.classList.remove('active');
    }
    if (event.target === todoModal) {
        todoModal.classList.remove('active');
    }
    if (event.target === addProjectModal) {
        closeAddProjectModal();
    }
    if (event.target === searchResultsModal) {
        closeSearchResultsModal();
    }
    if (event.target === personQueryModal) {
        closePersonQueryModal();
    }
    if (event.target === taskEditModal) {
        closeTaskEditModal();
    }
}

// 頁面載入時初始化
document.addEventListener('DOMContentLoaded', init);
