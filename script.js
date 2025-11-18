// 示例任务数据
let tasks = JSON.parse(localStorage.getItem('tasks')) || [
    {
        id: 1,
        title: '写数学作业',
        description: '完成第三章练习题',
        category: 'study',
        ddl: '2024-05-15',
        completed: false,
        completedAt: null,
        isFavorite: false,
        createdAt: new Date().toISOString()
    },
    {
        id: 2,
        title: '买菜',
        description: '西红柿、鸡蛋、青菜',
        category: 'life',
        ddl: '',
        completed: false,
        completedAt: null,
        isFavorite: false,
        createdAt: new Date().toISOString()
    }
];

let currentView = 'category';
let currentCategory = 'all';
let currentPage = 'homePage';

// DOM 元素
const taskList = document.getElementById('taskList');
const favoriteTaskList = document.getElementById('favoriteTaskList');
const completedHistory = document.getElementById('completedHistory');
const taskModal = document.getElementById('taskModal');
const taskForm = document.getElementById('taskForm');
const addTaskBtn = document.getElementById('addTaskBtn');
const cancelBtn = document.getElementById('cancelBtn');
const viewBtns = document.querySelectorAll('.view-btn');
const categories = document.querySelectorAll('.category');
const navItems = document.querySelectorAll('.nav-item');
const pages = document.querySelectorAll('.page');

// 初始化
function init() {
    renderTasks();
    renderFavoriteTasks();
    renderCompletedHistory();
    setupEventListeners();
    updateBodyClass(); // 初始化body类名
}

// 设置事件监听
function setupEventListeners() {
    addTaskBtn.addEventListener('click', () => {
        taskModal.style.display = 'block';
    });

    cancelBtn.addEventListener('click', () => {
        taskModal.style.display = 'none';
        taskForm.reset();
    });

    taskForm.addEventListener('submit', handleAddTask);

    // 视图切换
    viewBtns.forEach(btn => {
        btn.addEventListener('click', (e) => {
            const view = e.target.dataset.view;
            switchView(view);
        });
    });

    // 分类切换
    categories.forEach(cat => {
        cat.addEventListener('click', (e) => {
            const category = e.target.dataset.category;
            switchCategory(category);
        });
    });

    // 页面切换
    navItems.forEach(item => {
        item.addEventListener('click', (e) => {
            const page = e.target.dataset.page;
            switchPage(page);
        });
    });

    // 点击模态框外部关闭
    taskModal.addEventListener('click', (e) => {
        if (e.target === taskModal) {
            taskModal.style.display = 'none';
            taskForm.reset();
        }
    });
}

// 更新body类名来控制元素显示/隐藏
function updateBodyClass() {
    // 移除所有页面类
    document.body.classList.remove('home-page', 'favorite-page', 'history-page');
    
    // 添加当前页面类
    if (currentPage === 'homePage') {
        document.body.classList.add('home-page');
    } else if (currentPage === 'favoritePage') {
        document.body.classList.add('favorite-page');
    } else if (currentPage === 'historyPage') {
        document.body.classList.add('history-page');
    }
}

// 切换页面
function switchPage(page) {
    currentPage = page;
    
    // 更新页面显示
    pages.forEach(p => {
        p.classList.toggle('active', p.id === page);
    });
    
    // 更新导航状态
    navItems.forEach(item => {
        item.classList.toggle('active', item.dataset.page === page);
    });
    
    // 更新body类名来控制显示/隐藏
    updateBodyClass();
    
    // 根据页面刷新内容
    if (page === 'homePage') {
        renderTasks();
    } else if (page === 'favoritePage') {
        renderFavoriteTasks();
    } else if (page === 'historyPage') {
        renderCompletedHistory();
    }
}

// 切换视图
function switchView(view) {
    currentView = view;
    
    // 更新按钮状态
    viewBtns.forEach(btn => {
        btn.classList.toggle('active', btn.dataset.view === view);
    });

    // 切换样式
    document.querySelector('.container').classList.toggle('summary-mode', view === 'summary');
    
    renderTasks();
}

// 切换分类
function switchCategory(category) {
    currentCategory = category;
    
    // 更新分类状态
    categories.forEach(cat => {
        cat.classList.toggle('active', cat.dataset.category === category);
    });
    
    renderTasks();
}

// 处理添加任务
function handleAddTask(e) {
    e.preventDefault();
    
    const title = document.getElementById('taskTitle').value;
    const description = document.getElementById('taskDesc').value;
    const ddl = document.getElementById('taskDdl').value;
    const category = document.getElementById('taskCategory').value;
    
    const newTask = {
        id: Date.now(),
        title,
        description,
        category,
        ddl,
        completed: false,
        completedAt: null,
        isFavorite: false,
        createdAt: new Date().toISOString()
    };
    
    tasks.push(newTask);
    saveTasks();
    renderTasks();
    
    taskModal.style.display = 'none';
    taskForm.reset();
}

// 保存任务到本地存储
function saveTasks() {
    localStorage.setItem('tasks', JSON.stringify(tasks));
}

// 渲染任务列表（首页）
function renderTasks() {
    let filteredTasks = tasks.filter(task => !task.completed);
    
    // 分类过滤
    if (currentCategory !== 'all') {
        filteredTasks = filteredTasks.filter(task => task.category === currentCategory);
    }
    
    // 排序：有DDL的按时间排序，无DDL的显示在前面
    filteredTasks.sort((a, b) => {
        if (a.ddl && b.ddl) {
            return new Date(a.ddl) - new Date(b.ddl);
        }
        if (a.ddl && !b.ddl) return 1;
        if (!a.ddl && b.ddl) return -1;
        return new Date(b.createdAt) - new Date(a.createdAt);
    });
    
    taskList.innerHTML = '';
    
    if (filteredTasks.length === 0) {
        taskList.innerHTML = '<div class="no-tasks">暂无任务</div>';
        return;
    }
    
    filteredTasks.forEach(task => {
        const taskElement = createTaskElement(task, true);
        taskList.appendChild(taskElement);
    });
}

// 渲染收藏任务
function renderFavoriteTasks() {
    const favoriteTasks = tasks.filter(task => task.isFavorite && !task.completed);
    
    favoriteTaskList.innerHTML = '';
    
    if (favoriteTasks.length === 0) {
        favoriteTaskList.innerHTML = '<div class="no-tasks">暂无收藏任务</div>';
        return;
    }
    
    favoriteTasks.forEach(task => {
        const taskElement = createTaskElement(task, false); // 在收藏页面不显示操作按钮
        favoriteTaskList.appendChild(taskElement);
    });
}

// 创建任务元素
function createTaskElement(task, showActions = true) {
    const taskDiv = document.createElement('div');
    taskDiv.className = `task-item ${task.completed ? 'completed' : ''}`;
    
    let actionsHTML = '';
    if (showActions) {
        actionsHTML = `
            <div class="task-actions">
                <button class="complete-btn" onclick="toggleTaskComplete(${task.id})">
                    ${task.completed ? '标记未完成' : '标记完成'}
                </button>
                <button class="favorite-btn ${task.isFavorite ? 'favorited' : ''}" onclick="toggleFavorite(${task.id})">
                    ${task.isFavorite ? '取消收藏' : '收藏'}
                </button>
                <button class="delete-btn" onclick="deleteTask(${task.id})">删除</button>
            </div>
        `;
    }
    
    taskDiv.innerHTML = `
        <div class="task-header">
            <div class="task-title">
                ${task.completed ? '✅ ' : ''}${task.title}
                ${task.isFavorite ? '⭐' : ''}
            </div>
            <div class="task-category">${getCategoryName(task.category)}</div>
        </div>
        ${task.ddl ? `<div class="task-ddl">截止: ${formatDate(task.ddl)}</div>` : ''}
        ${task.description ? `<div class="task-desc">${task.description}</div>` : ''}
        ${actionsHTML}
    `;
    
    return taskDiv;
}

// 切换任务完成状态
function toggleTaskComplete(taskId) {
    const task = tasks.find(t => t.id === taskId);
    if (task) {
        task.completed = !task.completed;
        task.completedAt = task.completed ? new Date().toISOString() : null;
        saveTasks();
        renderTasks();
        renderFavoriteTasks();
        if (currentPage === 'historyPage') {
            renderCompletedHistory();
        }
    }
}

// 切换收藏状态
function toggleFavorite(taskId) {
    const task = tasks.find(t => t.id === taskId);
    if (task) {
        task.isFavorite = !task.isFavorite;
        saveTasks();
        renderTasks();
        if (currentPage === 'favoritePage') {
            renderFavoriteTasks();
        }
    }
}

// 删除任务
function deleteTask(taskId) {
    if (confirm('确定要删除这个任务吗？')) {
        tasks = tasks.filter(t => t.id !== taskId);
        saveTasks();
        renderTasks();
        renderFavoriteTasks();
        if (currentPage === 'historyPage') {
            renderCompletedHistory();
        }
    }
}

// 渲染完成历史
function renderCompletedHistory() {
    // 计算7天前的日期
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    
    // 筛选最近7天完成的任务
    const recentCompleted = tasks
        .filter(task => task.completed && task.completedAt && new Date(task.completedAt) >= sevenDaysAgo)
        .sort((a, b) => new Date(b.completedAt) - new Date(a.completedAt));
    
    completedHistory.innerHTML = '';
    
    if (recentCompleted.length === 0) {
        completedHistory.innerHTML = '<div class="no-history">最近7天没有完成的任务</div>';
        return;
    }
    
    recentCompleted.forEach(task => {
        const historyItem = document.createElement('div');
        historyItem.className = 'history-item';
        historyItem.innerHTML = `
            <div class="history-title">✅ ${task.title}</div>
            <div class="history-time">完成于: ${formatDateTime(task.completedAt)}</div>
            <div class="history-category">${getCategoryName(task.category)}</div>
        `;
        completedHistory.appendChild(historyItem);
    });
}

// 工具函数
function getCategoryName(category) {
    const names = {
        study: '学习',
        work: '工作', 
        life: '生活'
    };
    return names[category] || category;
}

function formatDate(dateString) {
    if (!dateString) return '';
    const date = new Date(dateString);
    return `${date.getMonth() + 1}/${date.getDate()}`;
}

function formatDateTime(dateString) {
    if (!dateString) return '';
    const date = new Date(dateString);
    return `${date.getMonth() + 1}/${date.getDate()} ${date.getHours().toString().padStart(2, '0')}:${date.getMinutes().toString().padStart(2, '0')}`;
}

// 初始化应用
document.addEventListener('DOMContentLoaded', init);