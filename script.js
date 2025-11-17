// 示例任务数据
let tasks = JSON.parse(localStorage.getItem('tasks')) || [
    {
        id: 1,
        title: '写数学作业',
        description: '完成第三章练习题',
        category: 'study',
        ddl: '2024-05-15',
        completed: false,
        createdAt: new Date().toISOString()
    },
    {
        id: 2,
        title: '买菜',
        description: '西红柿、鸡蛋、青菜',
        category: 'life',
        ddl: '',
        completed: false,
        createdAt: new Date().toISOString()
    }
];

let currentView = 'category';
let currentCategory = 'all';

// DOM 元素
const taskList = document.getElementById('taskList');
const taskModal = document.getElementById('taskModal');
const taskForm = document.getElementById('taskForm');
const addTaskBtn = document.getElementById('addTaskBtn');
const cancelBtn = document.getElementById('cancelBtn');
const viewBtns = document.querySelectorAll('.view-btn');
const categories = document.querySelectorAll('.category');

// 初始化
function init() {
    renderTasks();
    setupEventListeners();
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

    // 点击模态框外部关闭
    taskModal.addEventListener('click', (e) => {
        if (e.target === taskModal) {
            taskModal.style.display = 'none';
            taskForm.reset();
        }
    });
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

// 渲染任务列表
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
        const taskElement = createTaskElement(task);
        taskList.appendChild(taskElement);
    });
}

// 创建任务元素
function createTaskElement(task) {
    const taskDiv = document.createElement('div');
    taskDiv.className = 'task-item';
    taskDiv.innerHTML = `
        <div class="task-header">
            <div class="task-title">${task.title}</div>
            <div class="task-category">${getCategoryName(task.category)}</div>
        </div>
        ${task.ddl ? `<div class="task-ddl">截止: ${formatDate(task.ddl)}</div>` : ''}
        ${task.description ? `<div class="task-desc">${task.description}</div>` : ''}
    `;
    
    taskDiv.addEventListener('click', () => {
        // 标记完成任务（简化版）
        task.completed = true;
        saveTasks();
        renderTasks();
    });
    
    return taskDiv;
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

// 初始化应用
document.addEventListener('DOMContentLoaded', init);