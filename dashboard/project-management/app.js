// 銓宏國際專案管理系統 - 功能邏輯

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
    salesRep: 'all',
    searchQuery: ''
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
        sales_rep: "Betty",
        tasks: [
            { name: "3/17 Joanne來電議價", start: "2026-03-17", end: "2026-03-17", progress: 100 },
            { name: "Kevin回覆依照原價送審", start: "2026-03-17", end: "2026-03-17", progress: 100 },
            { name: "等待送審結果", start: "2026-03-17", end: "2026-03-19", progress: 50 },
            { name: "客戶確認下單", start: "2026-03-19", end: "2026-03-20", progress: 0 },
            { name: "姿姿下採購單給大陸廠商", start: "2026-03-20", end: "2026-03-21", progress: 0 },
            { name: "大陸廠商安排定制", start: "2026-03-21", end: "2026-04-15", progress: 0 }
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
    }
];

// 初始化
function init() {
    updateStatusBar();
    renderQuoteView();
    renderSampleView();
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
    document.querySelectorAll('.view').forEach(v => v.classList.remove('active'));
    document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
    
    document.getElementById(viewName + '-view').classList.add('active');
    event.target.classList.add('active');
    
    // 切換到全部視圖時重新渲染
    if (viewName === 'list') {
        renderList();
    }
    // 切換到提案階段時渲染
    if (viewName === 'proposal') {
        renderProposalView();
    }
    // 切換到報價階段時渲染
    if (viewName === 'quote') {
        renderQuoteView();
    }
    // 切換到打樣階段時渲染
    if (viewName === 'sample') {
        renderSampleView();
    }
    // 切換到生產階段時渲染
    if (viewName === 'production') {
        renderProductionView();
    }
    // 切換到待確認專案時渲染
    if (viewName === 'pending-confirm') {
        renderPendingConfirmView();
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
    
    // 判斷是否為打樣後階段（顯示按鈕）
    const showButtons = project.phase === 'sampling' || project.phase === 'production';
    
    // 新增進度按鈕（所有階段都顯示）
    const progressButtonHtml = `
        <button class="btn-progress" onclick="event.stopPropagation(); openAddProgressModal('${project.id}')">📈 新增進度</button>
    `;
    
    const buttonsHtml = showButtons ? `
        <div class="card-buttons">
            <button class="btn-gantt" onclick="event.stopPropagation(); showProjectGantt('${project.id}')">📅 甘特圖</button>
            <button class="btn-todo" onclick="event.stopPropagation(); showProjectTodo('${project.id}', 'incomplete')">📝 待辦事項</button>
            <button class="btn-all" onclick="event.stopPropagation(); showProjectTodo('${project.id}', 'all')">📋 全部事項</button>
            ${progressButtonHtml}
        </div>
    ` : `
        <div class="card-buttons">
            ${progressButtonHtml}
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
    
    // 點擊卡片顯示詳情（按鈕除外）
    if (!showButtons) {
        card.onclick = () => showProjectDetail(project);
    } else {
        // 打樣後階段點擊標題區域顯示詳情
        card.onclick = (e) => {
            if (!e.target.closest('.card-buttons')) {
                showProjectDetail(project);
            }
        };
    }
    
    return card;
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
    
    let filtered = projects;
    if (filter !== 'all') {
        filtered = projects.filter(p => p.phase === filter);
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
    
    const modal = document.getElementById('gantt-modal');
    const title = document.getElementById('gantt-modal-title');
    const body = document.getElementById('gantt-modal-body');
    
    title.innerHTML = `📅 ${project.name} - 甘特圖`;
    
    // 計算時間範圍
    const today = new Date();
    const minDate = new Date(today);
    minDate.setDate(minDate.getDate() - 3);
    const maxDate = new Date(today);
    maxDate.setDate(maxDate.getDate() + 30);
    
    const totalDays = (maxDate - minDate) / (1000 * 60 * 60 * 24);
    
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
    project.tasks.forEach((task, index) => {
        const taskStart = new Date(task.start);
        const taskEnd = new Date(task.end);
        
        const startOffset = (taskStart - minDate) / (1000 * 60 * 60 * 24);
        const duration = (taskEnd - taskStart) / (1000 * 60 * 60 * 24) + 1;
        
        const leftPercent = Math.max(0, (startOffset / totalDays) * 100);
        const widthPercent = Math.max(2, (duration / totalDays) * 100);
        
        let taskStatus = 'pending';
        if (task.progress === 100) taskStatus = 'completed';
        else if (task.progress > 0) taskStatus = 'in-progress';
        
        const isOverdue = taskEnd < today && task.progress < 100;
        
        ganttHtml += `
            <div class="gantt-task-row">
                <div class="gantt-task-info">
                    <span class="task-num">${index + 1}</span>
                    <span class="task-name">${task.name}</span>
                    ${isOverdue ? '<span class="badge-overdue">逾期</span>' : ''}
                </div>
                <div class="gantt-task-timeline">
                    <div class="gantt-task-bar ${taskStatus}" style="left: ${leftPercent}%; width: ${widthPercent}%">
                        <div class="task-progress-fill" style="width: ${task.progress}%"></div>
                    </div>
                </div>
                <div class="gantt-task-date">${task.start} ~ ${task.end}</div>
                <div class="gantt-task-percent">${task.progress}%</div>
            </div>
        `;
    });
    
    ganttHtml += `</div></div></div>`;
    
    body.innerHTML = ganttHtml;
    modal.classList.add('active');
}

// 關閉甘特圖彈窗
function closeGanttModal() {
    document.getElementById('gantt-modal').classList.remove('active');
}

// 顯示單一專案待辦事項
function showProjectTodo(projectId, filter = 'all') {
    const project = projects.find(p => p.id === projectId);
    if (!project) return;
    
    const modal = document.getElementById('todo-modal');
    const title = document.getElementById('todo-modal-title');
    const body = document.getElementById('todo-modal-body');
    
    // 根據篩選條件過濾任務
    let filteredTasks = project.tasks;
    if (filter === 'incomplete') {
        filteredTasks = project.tasks.filter(task => task.progress < 100);
    }
    
    const filterText = filter === 'incomplete' ? '（待辦事項）' : '（全部事項）';
    title.innerHTML = `📝 ${project.name} - ${filterText}`;
    
    const tasksHtml = filteredTasks.map((task, index) => {
        const today = new Date();
        const taskEnd = new Date(task.end);
        const isOverdue = taskEnd < today && task.progress < 100;
        
        let statusIcon = '⏳';
        let statusClass = 'pending';
        if (task.progress === 100) {
            statusIcon = '✅';
            statusClass = 'completed';
        } else if (task.progress > 0) {
            statusIcon = '🔄';
            statusClass = 'in-progress';
        }
        
        return `
            <li class="todo-item ${statusClass} ${isOverdue ? 'overdue' : ''}">
                <div class="todo-main">
                    <span class="todo-status-icon">${statusIcon}</span>
                    <span class="todo-name">${task.name}</span>
                    ${isOverdue ? '<span class="badge-overdue">逾期</span>' : ''}
                </div>
                <div class="todo-meta">
                    <span class="todo-date">📅 ${task.start} → ${task.end}</span>
                    <span class="todo-progress">${task.progress}%</span>
                </div>
                <div class="todo-progress-bar">
                    <div class="todo-progress-fill" style="width: ${task.progress}%"></div>
                </div>
            </li>
        `;
    }).join('');
    
    // 如果沒有待辦事項
    const emptyMessage = filter === 'incomplete' && filteredTasks.length === 0 
        ? '<div class="todo-empty">🎉 所有事項已完成！</div>' 
        : '';
    
    body.innerHTML = `
        <div class="todo-project-info">
            <div class="todo-info-item">
                <span class="todo-info-label">專案編號</span>
                <span class="todo-info-value">${project.id}</span>
            </div>
            <div class="todo-info-item">
                <span class="todo-info-label">客戶</span>
                <span class="todo-info-value">${project.client} / ${project.contact}</span>
            </div>
            <div class="todo-info-item">
                <span class="todo-info-label">整體進度</span>
                <span class="todo-info-value">${project.progress}%</span>
            </div>
            <div class="todo-info-item">
                <span class="todo-info-label">截止日</span>
                <span class="todo-info-value">${project.deadline}</span>
            </div>
        </div>
        <h3>任務清單</h3>
        ${emptyMessage}
        <ul class="todo-list">${tasksHtml}</ul>
    `;
    
    modal.classList.add('active');
}

// 關閉待辦事項彈窗
function closeTodoModal() {
    document.getElementById('todo-modal').classList.remove('active');
}

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
function submitNewProject(event) {
    event.preventDefault();
    
    const formData = {
        id: document.getElementById('new-project-id').value,
        name: document.getElementById('new-project-name').value,
        client: document.getElementById('new-project-client').value,
        productType: document.getElementById('new-project-type').value,
        quantity: document.getElementById('new-project-quantity').value + '個',
        deadline: document.getElementById('new-project-deadline').value,
        phase: document.getElementById('new-project-phase').value,
        salesRep: document.getElementById('new-project-sales').value,
        notes: document.getElementById('new-project-notes').value,
        contact: '',
        progress: 0,
        status: 'active',
        statusText: getStatusText(document.getElementById('new-project-phase').value),
        tasks: []
    };
    
    // 添加新專案到資料陣列
    projects.push(formData);
    
    // 關閉彈窗並重新整理顯示
    closeAddProjectModal();
    renderAllViews();
    
    // 顯示成功提示
    alert('✅ 專案建立成功！');
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
    updateStats();
}

// ==================== 新增專案功能結束 ====================

// ==================== 專案進度AI輔助填入功能 ====================

let currentProgressProjectId = null;

// 開啟新增進度彈窗
function openAddProgressModal(projectId) {
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
function closeAddProgressModal() {
    document.getElementById('add-progress-modal').classList.remove('active');
    currentProgressProjectId = null;
}

// AI 分析進度描述
async function analyzeProgressWithAI() {
    const input = document.getElementById('progress-description');
    const resultDiv = document.getElementById('progress-analysis-result');
    const analyzeBtn = document.getElementById('analyze-btn');
    
    const description = input.value.trim();
    if (!description) {
        alert('請輸入進度描述');
        return;
    }
    
    analyzeBtn.disabled = true;
    analyzeBtn.innerHTML = '🤔 分析中...';
    
    try {
        // 簡易 AI 分析（本地規則）
        const analysis = performLocalAnalysis(description);
        
        resultDiv.innerHTML = `
            <div class="analysis-result">
                <h4>📊 AI 分析結果</h4>
                <div class="analysis-item">
                    <span class="label">建議進度:</span>
                    <span class="value">${analysis.progress}%</span>
                </div>
                <div class="analysis-item">
                    <span class="label">建議階段:</span>
                    <span class="value">${analysis.phaseText}</span>
                </div>
                ${analysis.deadline ? `
                <div class="analysis-item">
                    <span class="label">預計交期:</span>
                    <span class="value">${analysis.deadline}</span>
                </div>
                ` : ''}
                <div class="analysis-item">
                    <span class="label">備註:</span>
                    <span class="value">${analysis.notes || '無'}</span>
                </div>
                <div class="analysis-actions">
                    <button onclick="applyProgressUpdate()" class="btn-primary">✅ 套用更新</button>
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

// 本地規則分析（簡易 AI）
function performLocalAnalysis(description) {
    const lowerDesc = description.toLowerCase();
    let progress = 0;
    let phase = '';
    let phaseText = '';
    let deadline = '';
    let notes = description;
    
    // 進度關鍵詞分析
    if (lowerDesc.includes('完成') || lowerDesc.includes('結束') || lowerDesc.includes('搞定')) {
        if (lowerDesc.includes('全部') || lowerDesc.includes('所有') || lowerDesc.includes('100')) {
            progress = 100;
        } else {
            progress = Math.min(progress + 30, 100);
        }
    }
    if (lowerDesc.includes('進行中') || lowerDesc.includes('處理中') || lowerDesc.includes('製作中')) {
        progress = Math.max(progress, 50);
    }
    if (lowerDesc.includes('開始') || lowerDesc.includes('啟動')) {
        progress = Math.max(progress, 20);
    }
    if (lowerDesc.includes('確認') || lowerDesc.includes('審核通過')) {
        progress = Math.max(progress, 70);
    }
    if (lowerDesc.includes('出貨') || lowerDesc.includes('交貨') || lowerDesc.includes('交付')) {
        progress = Math.max(progress, 90);
    }
    
    // 階段分析
    if (lowerDesc.includes('提案') || lowerDesc.includes('概念')) {
        phase = 'proposing';
        phaseText = '💡 提案';
    } else if (lowerDesc.includes('報價') || lowerDesc.includes('價格') || lowerDesc.includes('報價單')) {
        phase = 'quoting';
        phaseText = '📋 報價';
        if (lowerDesc.includes('待確認') || lowerDesc.includes('等回覆')) {
            phase = 'pending';
            phaseText = '🔵 報價待確認';
        }
    } else if (lowerDesc.includes('打樣') || lowerDesc.includes('樣品')) {
        phase = 'sampling';
        phaseText = '🔨 打樣';
    } else if (lowerDesc.includes('生產') || lowerDesc.includes('製作') || lowerDesc.includes('大貨')) {
        phase = 'production';
        phaseText = '🏭 生產';
    } else if (lowerDesc.includes('完成') || lowerDesc.includes('結案')) {
        phase = 'completed';
        phaseText = '✅ 已完成';
        progress = 100;
    }
    
    // 日期分析
    const dateMatch = description.match(/(\d{1,2})\/(\d{1,2})/);
    if (dateMatch) {
        const today = new Date();
        const year = today.getFullYear();
        deadline = `${year}-${dateMatch[1].padStart(2, '0')}-${dateMatch[2].padStart(2, '0')}`;
    }
    
    // 如果沒有識別到階段，根據進度推斷
    if (!phase) {
        if (progress >= 100) {
            phase = 'completed';
            phaseText = '✅ 已完成';
        } else if (progress >= 70) {
            phase = 'production';
            phaseText = '🏭 生產';
        } else if (progress >= 40) {
            phase = 'sampling';
            phaseText = '🔨 打樣';
        }
    }
    
    return { progress, phase, phaseText, deadline, notes };
}

// 套用進度更新
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
    
    // 更新專案資料
    project.progress = analysis.progress;
    if (analysis.phase) {
        project.phase = analysis.phase;
        project.statusText = analysis.phaseText;
    }
    if (analysis.deadline) {
        project.deadline = analysis.deadline;
    }
    if (analysis.notes) {
        project.notes = analysis.notes;
    }
    
    // 關閉彈窗並重新整理
    closeAddProgressModal();
    renderAllViews();
    
    alert('✅ 進度更新成功！');
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

// 覆寫顯示專案待辦事項函數
const originalShowProjectTodo = showProjectTodo;
showProjectTodo = function(projectId, filter = 'all') {
    const project = projects.find(p => p.id === projectId);
    if (!project) return;
    
    currentTodoProject = project;
    currentTodoFilter = filter;
    
    const modal = document.getElementById('todo-modal');
    const title = document.getElementById('todo-modal-title');
    const body = document.getElementById('todo-modal-body');
    
    const filterText = filter === 'incomplete' ? '（待辦事項）' : '（全部事項）';
    title.innerHTML = `📝 ${project.name} - ${filterText}`;
    
    // 計算並更新專案進度
    updateProjectProgress(project);
    
    renderTodoList(body, project, filter);
    
    modal.classList.add('active');
};

// 渲染待辦事項列表
function renderTodoList(container, project, filter) {
    // 根據篩選條件過濾任務
    let filteredTasks = project.tasks.map((task, index) => ({ ...task, originalIndex: index }));
    
    if (filter === 'incomplete') {
        filteredTasks = filteredTasks.filter(task => task.progress < 100);
    }
    
    if (hideCompleted) {
        filteredTasks = filteredTasks.filter(task => task.progress < 100);
    }
    
    const completedCount = project.tasks.filter(t => t.progress === 100).length;
    const totalCount = project.tasks.length;
    
    const tasksHtml = filteredTasks.map((task) => {
        const today = new Date();
        const taskEnd = new Date(task.end);
        const isOverdue = taskEnd < today && task.progress < 100;
        const isCompleted = task.progress === 100;
        
        return `
            <li class="todo-item ${isCompleted ? 'completed' : ''} ${isOverdue ? 'overdue' : ''}" data-index="${task.originalIndex}">
                <div class="todo-main">
                    <label class="todo-checkbox-label">
                        <input type="checkbox" class="todo-checkbox" 
                            ${isCompleted ? 'checked' : ''} 
                            onchange="toggleTaskComplete('${project.id}', ${task.originalIndex}, this.checked)">
                        <span class="todo-checkbox-custom"></span>
                    </label>
                    <span class="todo-name ${isCompleted ? 'strikethrough' : ''}">${task.name}</span>
                    ${isOverdue ? '<span class="badge-overdue">逾期</span>' : ''}
                </div>
                <div class="todo-meta">
                    <span class="todo-date">📅 ${task.start} → ${task.end}</span>
                    <span class="todo-progress ${isCompleted ? 'completed' : ''}">${task.progress}%</span>
                </div>
                <div class="todo-progress-bar">
                    <div class="todo-progress-fill ${isCompleted ? 'completed' : ''}" style="width: ${task.progress}%"></div>
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
    
    container.innerHTML = `
        <div class="todo-controls">
            <label class="todo-toggle-label">
                <input type="checkbox" id="hide-completed-toggle" ${hideCompleted ? 'checked' : ''} 
                    onchange="toggleHideCompleted(this.checked)">
                <span>隱藏已完成項目 (${completedCount}/${totalCount})</span>
            </label>
            <span class="todo-progress-summary">專案進度: <strong>${project.progress}%</strong></span>
        </div>
        <div class="todo-project-info">
            <div class="todo-info-item">
                <span class="todo-info-label">專案編號</span>
                <span class="todo-info-value">${project.id}</span>
            </div>
            <div class="todo-info-item">
                <span class="todo-info-label">客戶</span>
                <span class="todo-info-value">${project.client} / ${project.contact}</span>
            </div>
            <div class="todo-info-item">
                <span class="todo-info-label">截止日</span>
                <span class="todo-info-value">${project.deadline}</span>
            </div>
        </div>
        <h3>任務清單 (${filteredTasks.length} 項)</h3>
        ${emptyMessage}
        <ul class="todo-list">${tasksHtml}</ul>
    `;
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
    hideCompleted = isChecked;
    if (currentTodoProject) {
        const body = document.getElementById('todo-modal-body');
        renderTodoList(body, currentTodoProject, currentTodoFilter);
    }
}

// 覆寫關閉待辦事項彈窗函數
const originalCloseTodoModal = closeTodoModal;
closeTodoModal = function() {
    document.getElementById('todo-modal').classList.remove('active');
    currentTodoProject = null;
    currentTodoFilter = 'all';
    // 重新整理主頁面以更新進度顯示
    renderAllViews();
};

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
    filterState.salesRep = salesRep;
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
    filterState.salesRep = myName;
    document.getElementById('sales-rep-filter').value = myName;
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
        // 人員篩選
        if (filterState.salesRep !== 'all' && project.sales_rep !== filterState.salesRep) {
            return false;
        }
        // 搜尋關鍵詞
        if (filterState.searchQuery) {
            const query = filterState.searchQuery.toLowerCase();
            const matchClient = project.client.toLowerCase().includes(query);
            const matchName = project.name.toLowerCase().includes(query);
            const matchId = project.id.toLowerCase().includes(query);
            if (!matchClient && !matchName && !matchId) {
                return false;
            }
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

// 點擊彈窗外關閉
window.onclick = function(event) {
    const modal = document.getElementById('project-modal');
    const ganttModal = document.getElementById('gantt-modal');
    const todoModal = document.getElementById('todo-modal');
    const addProjectModal = document.getElementById('add-project-modal');
    
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
}

// 頁面載入時初始化
document.addEventListener('DOMContentLoaded', init);
