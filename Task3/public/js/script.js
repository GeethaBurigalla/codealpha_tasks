const socket = io();

let currentProjectId = null;
let draggedTaskId = null;
let allTasks = [];

// ─── INIT ─────────────────────────────────────────────────────────────────────

window.onload = async () => {
    const res = await fetch('/api/me');
    const data = await res.json();
    if (data.loggedIn) {
        showApp(data.username);
        loadProjects();
    }
    if (localStorage.getItem('darkMode') === 'true') {
        document.body.classList.add('dark');
    }
};

// ─── DARK MODE ────────────────────────────────────────────────────────────────

function toggleDark() {
    document.body.classList.toggle('dark');
    localStorage.setItem('darkMode', document.body.classList.contains('dark'));
}

// ─── AUTH ─────────────────────────────────────────────────────────────────────

function switchTab(tab) {
    document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
    event.target.classList.add('active');
    document.getElementById('login-form').style.display = tab === 'login' ? 'block' : 'none';
    document.getElementById('register-form').style.display = tab === 'register' ? 'block' : 'none';
}

async function login() {
    const username = document.getElementById('login-username').value.trim();
    const password = document.getElementById('login-password').value.trim();
    if (!username || !password) return;
    const res = await fetch('/api/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password })
    });
    const data = await res.json();
    if (data.success) {
        showApp(data.username);
        loadProjects();
    } else {
        document.getElementById('login-error').textContent = data.message;
    }
}

async function register() {
    const username = document.getElementById('reg-username').value.trim();
    const password = document.getElementById('reg-password').value.trim();
    if (!username || !password) return;
    const res = await fetch('/api/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password })
    });
    const data = await res.json();
    if (data.success) {
        document.getElementById('reg-success').textContent = 'Registered! Please login.';
        document.getElementById('reg-error').textContent = '';
    } else {
        document.getElementById('reg-error').textContent = data.message;
        document.getElementById('reg-success').textContent = '';
    }
}

async function logout() {
    await fetch('/api/logout', { method: 'POST' });
    document.getElementById('app-section').style.display = 'none';
    document.getElementById('auth-section').style.display = 'flex';
}

function showApp(username) {
    document.getElementById('auth-section').style.display = 'none';
    document.getElementById('app-section').style.display = 'block';
    document.getElementById('nav-username').textContent = '👤 ' + username;
}

// ─── PROJECTS ─────────────────────────────────────────────────────────────────

async function loadProjects() {
    const res = await fetch('/api/projects');
    const projects = await res.json();
    const list = document.getElementById('projects-list');
    if (projects.length === 0) {
        list.innerHTML = '<p style="color:#aaa; text-align:center; margin-top:40px;">No projects yet. Create one!</p>';
        return;
    }
    list.innerHTML = projects.map(p => `
        <div class="project-card">
            <h3>${p.name}</h3>
            <p>${p.description || 'No description'}</p>
            <div class="project-card-footer">
                <button class="btn-delete" onclick="deleteProject('${p._id}', event)">🗑 Delete</button>
                <button class="btn-open" onclick="openBoard('${p._id}', '${p.name}')">Open →</button>
            </div>
        </div>
    `).join('');
}

function showCreateProject() {
    document.getElementById('create-project-form').style.display = 'block';
}

function hideCreateProject() {
    document.getElementById('create-project-form').style.display = 'none';
    document.getElementById('project-name').value = '';
    document.getElementById('project-desc').value = '';
}

async function createProject() {
    const name = document.getElementById('project-name').value.trim();
    const description = document.getElementById('project-desc').value.trim();
    if (!name) return;
    const res = await fetch('/api/projects', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, description })
    });
    const data = await res.json();
    if (data.success) {
        hideCreateProject();
        loadProjects();
        showToast('Project created! 🎉');
    }
}

async function deleteProject(id, e) {
    e.stopPropagation();
    if (!confirm('Delete this project and all its tasks?')) return;
    await fetch(`/api/projects/${id}`, { method: 'DELETE' });
    loadProjects();
    showToast('Project deleted');
}

// ─── BOARD ────────────────────────────────────────────────────────────────────

async function openBoard(projectId, projectName) {
    currentProjectId = projectId;
    document.getElementById('projects-section').style.display = 'none';
    document.getElementById('board-section').style.display = 'block';
    document.getElementById('board-title').textContent = projectName;
    document.getElementById('search-input').style.display = 'block';
    loadTasks();
}

function showProjects() {
    document.getElementById('board-section').style.display = 'none';
    document.getElementById('projects-section').style.display = 'block';
    document.getElementById('search-input').style.display = 'none';
    document.getElementById('search-input').value = '';
    currentProjectId = null;
}

async function loadTasks() {
    const res = await fetch(`/api/projects/${currentProjectId}/tasks`);
    allTasks = await res.json();
    renderAllTasks(allTasks);
}

function renderAllTasks(tasks) {
    document.getElementById('tasks-todo').innerHTML = '';
    document.getElementById('tasks-inprogress').innerHTML = '';
    document.getElementById('tasks-done').innerHTML = '';
    tasks.forEach(task => renderTask(task));
    updateCounts(tasks);
}

function updateCounts(tasks) {
    document.getElementById('count-todo').textContent = tasks.filter(t => t.status === 'todo').length;
    document.getElementById('count-inprogress').textContent = tasks.filter(t => t.status === 'inprogress').length;
    document.getElementById('count-done').textContent = tasks.filter(t => t.status === 'done').length;
}

function searchTasks() {
    const query = document.getElementById('search-input').value.toLowerCase().trim();
    if (!query) {
        renderAllTasks(allTasks);
        return;
    }
    const filtered = allTasks.filter(t =>
        t.title.toLowerCase().includes(query) ||
        (t.description && t.description.toLowerCase().includes(query))
    );
    renderAllTasks(filtered);
}

function renderTask(task) {
    const col = document.getElementById('tasks-' + task.status);
    if (!col) return;

    const priorityColor = { low: '#27ae60', medium: '#f39c12', high: '#e74c3c' };
    const priorityLabel = { low: '🟢 Low', medium: '🟡 Medium', high: '🔴 High' };

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    let dueDateHTML = '';
    if (task.dueDate) {
        const due = new Date(task.dueDate);
        const isOverdue = due < today && task.status !== 'done';
        const formatted = due.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
        dueDateHTML = `<span class="due-date ${isOverdue ? 'overdue' : ''}">📅 ${formatted}${isOverdue ? ' ⚠️ Overdue' : ''}</span>`;
    }

    const card = document.createElement('div');
    card.className = 'task-card';
    card.draggable = true;
    card.id = 'task-' + task._id;
    card.dataset.id = task._id;
    card.innerHTML = `
        <div class="task-priority-bar" style="background:${priorityColor[task.priority || 'medium']}"></div>
        <h4>${task.title}</h4>
        <p>${task.description || ''}</p>
        <div class="task-meta">
            <span class="priority-badge" style="color:${priorityColor[task.priority || 'medium']}">${priorityLabel[task.priority || 'medium']}</span>
            ${dueDateHTML}
        </div>
        <div class="task-card-footer">
    <button class="btn-edit-task" onclick='openEdit(${JSON.stringify(task)})'>✏️ Edit</button>
    <button class="btn-delete-task" onclick="deleteTask('${task._id}')">🗑 Delete</button>
</div>
    `;

    card.addEventListener('dragstart', (e) => {
        draggedTaskId = task._id;
        setTimeout(() => card.classList.add('dragging'), 0);
    });

    card.addEventListener('dragend', () => {
        card.classList.remove('dragging');
        draggedTaskId = null;
    });

    col.appendChild(card);
}

// ─── TASKS ────────────────────────────────────────────────────────────────────

function showAddTask() {
    document.getElementById('add-task-form').style.display = 'block';
}

function hideAddTask() {
    document.getElementById('add-task-form').style.display = 'none';
    document.getElementById('task-title').value = '';
    document.getElementById('task-desc').value = '';
    document.getElementById('task-priority').value = 'medium';
    document.getElementById('task-due').value = '';
}

async function addTask() {
    const title = document.getElementById('task-title').value.trim();
    const description = document.getElementById('task-desc').value.trim();
    const priority = document.getElementById('task-priority').value;
    const dueDate = document.getElementById('task-due').value;
    if (!title) return;
    const res = await fetch(`/api/projects/${currentProjectId}/tasks`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title, description, priority, dueDate })
    });
    const data = await res.json();
    if (data.success) {
        hideAddTask();
        loadTasks();
        showToast('Task added! ✅');
    }
}

async function deleteTask(taskId) {
    if (!confirm('Delete this task?')) return;
    await fetch(`/api/tasks/${taskId}`, { method: 'DELETE' });
    loadTasks();
    showToast('Task deleted');
}
// ─── EDIT TASK ────────────────────────────────────────────────────────────────

let editingTaskId = null;

function openEdit(task) {
    editingTaskId = task._id;
    document.getElementById('edit-title').value = task.title;
    document.getElementById('edit-desc').value = task.description || '';
    document.getElementById('edit-priority').value = task.priority || 'medium';
    document.getElementById('edit-due').value = task.dueDate ? task.dueDate.substring(0, 10) : '';
    document.getElementById('edit-modal').style.display = 'flex';
}

function closeEdit() {
    document.getElementById('edit-modal').style.display = 'none';
    editingTaskId = null;
}

async function saveEdit() {
    const title = document.getElementById('edit-title').value.trim();
    const description = document.getElementById('edit-desc').value.trim();
    const priority = document.getElementById('edit-priority').value;
    const dueDate = document.getElementById('edit-due').value;
    if (!title) return;
    const res = await fetch(`/api/tasks/${editingTaskId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title, description, priority, dueDate })
    });
    const data = await res.json();
    if (data.success) {
        closeEdit();
        loadTasks();
        showToast('Task updated! ✏️');
    }
}
// ─── DRAG & DROP ──────────────────────────────────────────────────────────────

function allowDrop(e) {
    e.preventDefault();
    e.currentTarget.classList.add('drag-over');
}

function dragLeave(e) {
    e.currentTarget.classList.remove('drag-over');
}

async function drop(e, status) {
    e.preventDefault();
    e.currentTarget.classList.remove('drag-over');
    if (!draggedTaskId) return;
    const res = await fetch(`/api/tasks/${draggedTaskId}/status`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status })
    });
    const data = await res.json();
    if (data.success) {
        await loadTasks();
        showToast('Task moved! ✅');
    }
}

// ─── SOCKET.IO REAL-TIME ──────────────────────────────────────────────────────

socket.on('taskCreated', (data) => {
    if (currentProjectId === data.projectId) loadTasks();
});

socket.on('taskUpdated', () => {
    if (currentProjectId) loadTasks();
});

socket.on('taskDeleted', () => {
    if (currentProjectId) loadTasks();
});

// ─── TOAST ────────────────────────────────────────────────────────────────────

function showToast(msg) {
    const toast = document.getElementById('toast');
    toast.textContent = msg;
    toast.classList.add('show');
    setTimeout(() => toast.classList.remove('show'), 3000);
}

function togglePwd(inputId, icon) {
    const input = document.getElementById(inputId);
    if (input.type === 'password') {
        input.type = 'text';
        icon.textContent = '🙈';
    } else {
        input.type = 'password';
        icon.textContent = '👁️';
    }
}