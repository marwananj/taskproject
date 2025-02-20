// DOM Elements
const taskInput = document.querySelector('.new-task-input');
const addButton = document.querySelector('.add-btn');
const taskList = document.querySelector('.task-list');
const emptyState = document.querySelector('.empty-state');
const itemsLeft = document.querySelector('.items-left');
const clearButton = document.querySelector('.clear-btn');
const searchInput = document.querySelector('.search-input');
const filterSelect = document.querySelector('.filter-select');
const filterButtons = document.querySelectorAll('.filter-btn');

// State
let tasks = JSON.parse(localStorage.getItem('tasks')) || [];
let currentFilter = 'all';
let searchTerm = '';

// Functions
function saveTasks() {
    localStorage.setItem('tasks', JSON.stringify(tasks));
}

function updateItemsCount() {
    const activeItems = tasks.filter(task => !task.completed).length;
    itemsLeft.textContent = `${activeItems} item${activeItems !== 1 ? 's' : ''} left`;
}

function toggleEmptyState() {
    const filteredTasks = filterTasks(tasks);
    emptyState.style.display = filteredTasks.length === 0 ? 'flex' : 'none';
}

function createTaskElement(task) {
    const li = document.createElement('li');
    li.className = 'task-item';
    if (task.completed) li.classList.add('completed');

    const isEditing = task.isEditing || false;

    if (isEditing) {
        li.innerHTML = `
            <input type="text" class="edit-input" value="${task.text}">
            <div class="task-actions">
                <button class="edit-btn"><i class="fa-solid fa-check"></i></button>
                <button class="delete-btn"><i class="fa-solid fa-times"></i></button>
            </div>
        `;

        const editInput = li.querySelector('.edit-input');
        const saveBtn = li.querySelector('.edit-btn');
        const cancelBtn = li.querySelector('.delete-btn');

        saveBtn.addEventListener('click', () => saveTask(task.id, editInput.value));
        cancelBtn.addEventListener('click', () => cancelEdit(task.id));
        editInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') saveTask(task.id, editInput.value);
        });
    } else {
        li.innerHTML = `
            <input type="checkbox" class="task-checkbox" ${task.completed ? 'checked' : ''}>
            <span class="task-text">${task.text}</span>
            <div class="task-actions">
                <button class="edit-btn"><i class="fa-solid fa-pen"></i></button>
                <button class="delete-btn"><i class="fa-solid fa-trash"></i></button>
            </div>
        `;

        const checkbox = li.querySelector('.task-checkbox');
        const editBtn = li.querySelector('.edit-btn');
        const deleteBtn = li.querySelector('.delete-btn');

        checkbox.addEventListener('change', () => toggleTask(task.id));
        editBtn.addEventListener('click', () => startEdit(task.id));
        deleteBtn.addEventListener('click', () => deleteTask(task.id));
    }

    return li;
}

function filterTasks(taskList) {
    return taskList
        .filter(task => {
            if (currentFilter === 'completed') return task.completed;
            if (currentFilter === 'pending') return !task.completed;
            return true;
        })
        .filter(task => 
            task.text.toLowerCase().includes(searchTerm.toLowerCase())
        );
}

function renderTasks() {
    const filteredTasks = filterTasks(tasks);
    taskList.innerHTML = '';
    filteredTasks.forEach(task => {
        taskList.appendChild(createTaskElement(task));
    });
    toggleEmptyState();
    updateItemsCount();
}

function addTask(text) {
    if (text.trim() === '') return;
    
    const newTask = {
        id: Date.now(),
        text: text.trim(),
        completed: false,
        isEditing: false
    };
    
    tasks.push(newTask);
    saveTasks();
    renderTasks();
    taskInput.value = '';
}

function toggleTask(id) {
    tasks = tasks.map(task =>
        task.id === id ? { ...task, completed: !task.completed } : task
    );
    saveTasks();
    renderTasks();
}

function startEdit(id) {
    tasks = tasks.map(task =>
        task.id === id ? { ...task, isEditing: true } : { ...task, isEditing: false }
    );
    renderTasks();
}

function saveTask(id, newText) {
    if (newText.trim() === '') return;
    
    tasks = tasks.map(task =>
        task.id === id ? { ...task, text: newText.trim(), isEditing: false } : task
    );
    saveTasks();
    renderTasks();
}

function cancelEdit(id) {
    tasks = tasks.map(task =>
        task.id === id ? { ...task, isEditing: false } : task
    );
    renderTasks();
}

function deleteTask(id) {
    tasks = tasks.filter(task => task.id !== id);
    saveTasks();
    renderTasks();
}

function clearAllTasks() {
    tasks = [];
    saveTasks();
    renderTasks();
}

// Event Listeners
addButton.addEventListener('click', () => addTask(taskInput.value));

taskInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
        addTask(taskInput.value);
    }
});

clearButton.addEventListener('click', clearAllTasks);

searchInput.addEventListener('input', (e) => {
    searchTerm = e.target.value;
    renderTasks();
});

filterSelect.addEventListener('change', (e) => {
    currentFilter = e.target.value;
    filterButtons.forEach(btn => {
        btn.classList.toggle('active', 
            btn.textContent.toLowerCase() === currentFilter ||
            (btn.textContent.toLowerCase() === 'all' && currentFilter === 'all')
        );
    });
    renderTasks();
});

filterButtons.forEach(btn => {
    btn.addEventListener('click', (e) => {
        filterButtons.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        currentFilter = btn.textContent.toLowerCase();
        filterSelect.value = currentFilter;
        renderTasks();
    });
});

// Initial render
renderTasks();