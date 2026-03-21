// 銓宏國際專案管理系統 - 功能邏輯

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
    
    // 切換到清單視圖時重新渲染
    if (viewName === 'list') {
        renderList();
    }
    // 切換到提案階段時渲染
    if (viewName === 'proposal') {
        renderProposalView();
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
    
    // 生產中 / 已確認
    const productionContainer = document.getElementById('production-projects');
    productionContainer.innerHTML = '';
    const productionProjects = projects.filter(p => p.phase === 'production');
    
    productionProjects.forEach(project => {
        const card = createProjectCard(project);
        productionContainer.appendChild(card);
    });
}

// 建立專案卡片
function createProjectCard(project) {
    const card = document.createElement('div');
    card.className = `project-card ${project.status}`;
    
    const quoteInfo = project.quoteDate ? `<span class="quote-date">報價日: ${project.quoteDate}</span>` : '';
    
    // 所有專案都顯示四個按鈕
    const buttonsHtml = `
        <div class="card-buttons">
            <button class="btn-gantt" onclick="event.stopPropagation(); showProjectGantt('${project.id}')">📅 甘特圖</button>
            <button class="btn-todo" onclick="event.stopPropagation(); showProjectTodo('${project.id}')">📝 待辦事項</button>
            <button class="btn-all-tasks" onclick="event.stopPropagation(); showProjectAllTasks('${project.id}')">📋 全部事項</button>
            <button class="btn-update" onclick="event.stopPropagation(); showProgressUpdate('${project.id}')">➕ 新進度回報</button>
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
    card.onclick = (e) => {
        if (!e.target.closest('.card-buttons')) {
            showProjectDetail(project);
        }
    };
    
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
            <td><span class="phase-badge ${project.phase}">${phaseMap[project.phase]}</span></td>
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
function showProjectTodo(projectId) {
    const project = projects.find(p => p.id === projectId);
    if (!project) return;
    
    const modal = document.getElementById('todo-modal');
    const title = document.getElementById('todo-modal-title');
    const body = document.getElementById('todo-modal-body');
    
    title.innerHTML = `📝 ${project.name} - 待辦事項`;
    
    const tasksHtml = project.tasks.map((task, index) => {
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
        <ul class="todo-list">${tasksHtml}</ul>
    `;
    
    modal.classList.add('active');
}

// 關閉待辦事項彈窗
function closeTodoModal() {
    document.getElementById('todo-modal').classList.remove('active');
}

// 顯示全部事項
function showProjectAllTasks(projectId) {
    const project = projects.find(p => p.id === projectId);
    if (!project) return;
    
    const modal = document.getElementById('todo-modal');
    const title = document.getElementById('todo-modal-title');
    const body = document.getElementById('todo-modal-body');
    
    title.innerHTML = `📋 ${project.name} - 全部事項`;
    
    // 顯示所有任務
    let allTasksHtml = `
        <div class="all-tasks-list">
            <div class="task-stats">
                <span class="stat-item">📊 總任務: ${project.tasks.length}</span>
                <span class="stat-item">✅ 已完成: ${project.tasks.filter(t => t.progress === 100).length}</span>
                <span class="stat-item">🔄 進行中: ${project.tasks.filter(t => t.progress > 0 && t.progress < 100).length}</span>
                <span class="stat-item">⏳ 未開始: ${project.tasks.filter(t => t.progress === 0).length}</span>
            </div>
    `;
    
    project.tasks.forEach((task, index) => {
        const statusClass = task.progress === 100 ? 'completed' : task.progress > 0 ? 'in-progress' : 'pending';
        const statusText = task.progress === 100 ? '✅ 已完成' : task.progress > 0 ? '🔄 進行中' : '⏳ 未開始';
        
        allTasksHtml += `
            <div class="task-item ${statusClass}">
                <div class="task-header">
                    <span class="task-number">#${index + 1}</span>
                    <span class="task-status-badge ${statusClass}">${statusText}</span>
                </div>
                <div class="task-name">${task.name}</div>                <div class="task-meta">
                    <span>📅 ${task.start} ~ ${task.end}</span>
                    <span class="task-progress">${task.progress}%</span>
                </div>
                <div class="task-progress-bar">
                    <div class="task-progress-fill" style="width: ${task.progress}%"></div>
                </div>
            </div>
        `;
    });
    
    allTasksHtml += '</div>';
    body.innerHTML = allTasksHtml;
    modal.classList.add('active');
}

// 顯示新進度回報表單
function showProgressUpdate(projectId) {
    const project = projects.find(p => p.id === projectId);
    if (!project) return;
    
    const modal = document.getElementById('todo-modal');
    const title = document.getElementById('todo-modal-title');
    const body = document.getElementById('todo-modal-body');
    
    title.innerHTML = `➕ ${project.name} - 新進度回報`;
    
    // 生成任務選項
    const taskOptions = project.tasks.map((task, index) => 
        `<option value="${index}">${task.name} (目前: ${task.progress}%)</option>`
    ).join('');
    
    body.innerHTML = `
        <form id="progress-update-form" class="progress-update-form">
            <div class="form-group">
                <label>📋 選擇任務</label>
                <select id="update-task-select" class="form-select">
                    <option value="">請選擇任務...</option>
                    ${taskOptions}
                    <option value="new">➕ 新增任務</option>
                </select>
            </div>
            
            <div class="form-group" id="new-task-group" style="display:none;">
                <label>📝 新任務名稱</label>
                <input type="text" id="new-task-name" class="form-input" placeholder="輸入任務名稱">
            </div>
            
            <div class="form-group">
                <label>📊 完成進度 (%)</label>
                <input type="range" id="update-progress" class="form-range" min="0" max="100" value="0"
                       oninput="document.getElementById('progress-value').textContent = this.value + '%'">
                <span id="progress-value" class="progress-value">0%</span>
            </div>
            
            <div class="form-group">
                <label>💬 進度說明</label>
                <textarea id="update-note" class="form-textarea" rows="3" placeholder="請描述本次進度更新內容..."></textarea>
            </div>
            
            <div class="form-group">
                <label>👤 回報人</label>
                <select id="update-reporter" class="form-select">
                    <option value="Kevin">Kevin</option>
                    <option value="姿姿">姿姿</option>
                    <option value="Betty">Betty</option>
                    <option value="Mia">Mia</option>
                    <option value="Yaryna">Yaryna</option>
                </select>
            </div>
            
            <div class="form-actions">
                <button type="button" class="btn-cancel" onclick="closeTodoModal()">❌ 取消</button>
                <button type="button" class="btn-submit" onclick="submitProgressUpdate('${project.id}')">✅ 提交回報</button>
            </div>
        </form>
    `;
    
    // 新增任務選項切換
    document.getElementById('update-task-select').addEventListener('change', function() {
        const newTaskGroup = document.getElementById('new-task-group');
        if (this.value === 'new') {
            newTaskGroup.style.display = 'block';
        } else if (this.value !== '') {
            newTaskGroup.style.display = 'none';
            // 自動帶入目前進度
            const taskIndex = parseInt(this.value);
            if (!isNaN(taskIndex) && project.tasks[taskIndex]) {
                document.getElementById('update-progress').value = project.tasks[taskIndex].progress;
                document.getElementById('progress-value').textContent = project.tasks[taskIndex].progress + '%';
            }
        }
    });
    
    modal.classList.add('active');
}

// 提交進度回報
function submitProgressUpdate(projectId) {
    const taskSelect = document.getElementById('update-task-select');
    const progress = document.getElementById('update-progress').value;
    const note = document.getElementById('update-note').value;
    const reporter = document.getElementById('update-reporter').value;
    
    if (!taskSelect.value) {
        alert('請選擇任務');
        return;
    }
    
    // 這裡可以加入實際的資料儲存邏輯
    // 目前先顯示成功訊息
    alert(`✅ 進度回報已提交！\n\n專案: ${projectId}\n回報人: ${reporter}\n進度: ${progress}%\n說明: ${note || '無'}`);
    
    closeTodoModal();
    
    // 重新渲染專案列表
    renderAllViews();
}

// 點擊彈窗外關閉
window.onclick = function(event) {
    const modal = document.getElementById('project-modal');
    const ganttModal = document.getElementById('gantt-modal');
    const todoModal = document.getElementById('todo-modal');
    
    if (event.target === modal) {
        modal.classList.remove('active');
    }
    if (event.target === ganttModal) {
        ganttModal.classList.remove('active');
    }
    if (event.target === todoModal) {
        todoModal.classList.remove('active');
    }
}

// 頁面載入時初始化
document.addEventListener('DOMContentLoaded', init);
