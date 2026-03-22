

// ==================== 任務快速編輯功能 ====================

// 編輯任務名稱
function editTaskName(projectId, taskIndex, element) {
    const project = projects.find(p => p.id === projectId);
    if (!project || !project.tasks[taskIndex]) return;
    
    const currentName = project.tasks[taskIndex].name;
    const input = document.createElement('input');
    input.type = 'text';
    input.value = currentName;
    input.className = 'edit-input';
    input.style.width = '100%';
    
    input.onblur = function() {
        saveTaskEdit(projectId, taskIndex, 'name', input.value);
    };
    
    input.onkeydown = function(e) {
        if (e.key === 'Enter') {
            input.blur();
        }
    };
    
    element.innerHTML = '';
    element.appendChild(input);
    input.focus();
    input.select();
}

// 編輯負責人
function editTaskAssignee(projectId, taskIndex, element) {
    const project = projects.find(p => p.id === projectId);
    if (!project || !project.tasks[taskIndex]) return;
    
    const currentAssignee = project.tasks[taskIndex].assigned_to || project.sales_rep || '未分配';
    const select = document.createElement('select');
    select.className = 'edit-select';
    
    SALES_REPS.forEach(rep => {
        const option = document.createElement('option');
        option.value = rep;
        option.textContent = rep;
        if (rep === currentAssignee) option.selected = true;
        select.appendChild(option);
    });
    
    select.onchange = function() {
        saveTaskEdit(projectId, taskIndex, 'assigned_to', select.value);
    };
    
    select.onblur = function() {
        setTimeout(() => {
            if (currentTodoProject) {
                const body = document.getElementById('todo-modal-body');
                renderTodoList(body, currentTodoProject, currentTodoFilter);
            }
        }, 200);
    };
    
    element.innerHTML = '';
    element.appendChild(select);
    select.focus();
}

// 編輯跟催人
function editTaskFollowUp(projectId, taskIndex, element) {
    const project = projects.find(p => p.id === projectId);
    if (!project || !project.tasks[taskIndex]) return;
    
    const currentFollowUp = project.tasks[taskIndex].follow_up_by || 'Kevin';
    const select = document.createElement('select');
    select.className = 'edit-select';
    
    SALES_REPS.forEach(rep => {
        const option = document.createElement('option');
        option.value = rep;
        option.textContent = rep;
        if (rep === currentFollowUp) option.selected = true;
        select.appendChild(option);
    });
    
    select.onchange = function() {
        saveTaskEdit(projectId, taskIndex, 'follow_up_by', select.value);
    };
    
    select.onblur = function() {
        setTimeout(() => {
            if (currentTodoProject) {
                const body = document.getElementById('todo-modal-body');
                renderTodoList(body, currentTodoProject, currentTodoFilter);
            }
        }, 200);
    };
    
    element.innerHTML = '';
    element.appendChild(select);
    select.focus();
}

// 編輯日期
function editTaskDates(projectId, taskIndex, element) {
    const project = projects.find(p => p.id === projectId);
    if (!project || !project.tasks[taskIndex]) return;
    
    const task = project.tasks[taskIndex];
    const container = document.createElement('div');
    container.className = 'edit-dates';
    container.style.display = 'flex';
    container.style.gap = '8px';
    container.style.alignItems = 'center';
    
    const startInput = document.createElement('input');
    startInput.type = 'date';
    startInput.value = task.start;
    startInput.className = 'edit-date-input';
    
    const endInput = document.createElement('input');
    endInput.type = 'date';
    endInput.value = task.end;
    endInput.className = 'edit-date-input';
    
    const saveBtn = document.createElement('button');
    saveBtn.textContent = '✓';
    saveBtn.className = 'edit-save-btn';
    saveBtn.onclick = function() {
        if (startInput.value && endInput.value) {
            project.tasks[taskIndex].start = startInput.value;
            project.tasks[taskIndex].end = endInput.value;
            saveProjectChanges();
            const body = document.getElementById('todo-modal-body');
            renderTodoList(body, currentTodoProject, currentTodoFilter);
        }
    };
    
    container.appendChild(startInput);
    container.appendChild(document.createTextNode('→'));
    container.appendChild(endInput);
    container.appendChild(saveBtn);
    
    element.innerHTML = '';
    element.appendChild(container);
    startInput.focus();
}

// 編輯進度
function editTaskProgress(projectId, taskIndex, element) {
    const project = projects.find(p => p.id === projectId);
    if (!project || !project.tasks[taskIndex]) return;
    
    const currentProgress = project.tasks[taskIndex].progress;
    const container = document.createElement('div');
    container.className = 'edit-progress';
    container.style.display = 'flex';
    container.style.alignItems = 'center';
    container.style.gap = '10px';
    
    const range = document.createElement('input');
    range.type = 'range';
    range.min = '0';
    range.max = '100';
    range.value = currentProgress;
    range.style.width = '100px';
    
    const valueDisplay = document.createElement('span');
    valueDisplay.textContent = currentProgress + '%';
    valueDisplay.style.minWidth = '40px';
    
    range.oninput = function() {
        valueDisplay.textContent = range.value + '%';
    };
    
    range.onchange = function() {
        saveTaskEdit(projectId, taskIndex, 'progress', parseInt(range.value));
    };
    
    container.appendChild(range);
    container.appendChild(valueDisplay);
    
    element.innerHTML = '';
    element.appendChild(container);
}

// 儲存任務編輯
function saveTaskEdit(projectId, taskIndex, field, value) {
    const project = projects.find(p => p.id === projectId);
    if (!project || !project.tasks[taskIndex]) return;
    
    project.tasks[taskIndex][field] = value;
    
    // 儲存變更
    saveProjectChanges();
    
    // 重新渲染列表
    if (currentTodoProject) {
        const body = document.getElementById('todo-modal-body');
        renderTodoList(body, currentTodoProject, currentTodoFilter);
    }
}

// 儲存專案變更
function saveProjectChanges() {
    console.log('專案變更已儲存');
    
    // 更新專案整體進度
    if (currentTodoProject) {
        updateProjectProgress(currentTodoProject);
    }
}
