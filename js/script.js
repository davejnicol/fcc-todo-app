// DOM Elements
const taskInput = document.getElementById("task-input");
const addTaskBtn = document.getElementById("add-task");
const todosList = document.getElementById("todos-list");
const itemsAll = document.getElementById("items-all");
const itemsActive = document.getElementById("items-active");
const itemsCompleted = document.getElementById("items-completed");
const itemsLeft = document.getElementById("items-left");
const clearCompletedBtn = document.getElementById("clear-completed");
const emptyState = document.querySelector(".empty-state");
const dateElement = document.getElementById("date");
const filters = document.querySelectorAll(".filter");

let todos = [];
let currentFilter = "all";

addTaskBtn.addEventListener("click", () => {
    addTodo(taskInput.value);
});

taskInput.addEventListener("keydown", (e) => {
    if (e.key === "Enter") addTodo(taskInput.value);
});

clearCompletedBtn.addEventListener("click", clearCompleted);

function addTodo(text) {
    if (text.trim() === "") return;

    const todo = {
        id: Date.now(),
        text,
        completed: false,
    };

    todos.push(todo);

    saveTodos();
    renderTodos();
    taskInput.value = "";
}

function saveTodos() {
    localStorage.setItem("todos", JSON.stringify(todos));
    updateItemsCount();
    checkEmptyState();
}

function updateItemsCount() { 
    const allCount = todos.length;
    const activeCount = todos.filter((todo) => !todo.completed).length;
    const completedCount = todos.filter((todo) => todo.completed).length;

     // Update individual filter bubble counts
    if (itemsAll) itemsAll.textContent = allCount > 0 ? allCount : "";
    if (itemsActive) itemsActive.textContent = activeCount > 0 ? activeCount : "";
    if (itemsCompleted) itemsCompleted.textContent = completedCount > 0 ? completedCount : "";

    // Update footer summary text (items left)
    itemsLeft.textContent = `${activeCount} item${
        activeCount !== 1 ? "s" : ""
    } left`;
}

function checkEmptyState() {
    const filteredTodos = filterTodos(currentFilter);
    if (filteredTodos?.length === 0) emptyState.classList.remove("hidden");
    else emptyState.classList.add("hidden");
}

function filterTodos(filter) {
    switch (filter) {
        case "active":
            return todos.filter((todo) => !todo.completed);
        case "completed":
            return todos.filter((todo) => todo.completed);
        default:
            return todos;
    }
}

function getTaskDateGroup(id) {
    // Convert the numeric ID timestamp into a JavaScript Date object
    const taskDate = new Date(id);
    const now = new Date();
    
    // Set boundaries to the beginning of the respective time periods
    const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const startOfThisWeek = new Date(startOfToday);
    startOfThisWeek.setDate(startOfToday.getDate() - startOfToday.getDay()); // Sunday
    
    const startOfThisMonth = new Date(now.getFullYear(), now.getMonth(), 1);

    // Grouping conditions
    if (taskDate >= startOfToday) {
        return "today";
    } else if (taskDate >= startOfThisWeek) {
        return "thisWeek";
    } else if (taskDate >= startOfThisMonth) {
        return "thisMonth";
    } else {
        return "older";
    }
}

function renderTodos() {
    todosList.innerHTML = "";

    const filteredTodos = filterTodos(currentFilter);

    // 1. Group tasks into date buckets
    const groups = {
        today: { title: "Today", items: [] },
        thisWeek: { title: "This Week", items: [] },
        thisMonth: { title: "This Month", items: [] },
        older: { title: "Older than a Month", items: [] }
    };

    filteredTodos.forEach((todo) => {
        const groupKey = getTaskDateGroup(todo.id);
        groups[groupKey].items.push(todo);
    });

    // 2. Render each group if it has items
    Object.keys(groups).forEach((key) => {
        const group = groups[key];
        if (group.items.length === 0) return; // Skip empty groups

        // Create and append a group section header
        const header = document.createElement("h3");
        header.classList.add("todo-group-header");
        header.textContent = group.title;
        todosList.appendChild(header);

        // Sort completed to the bottom of each group
        group.items.sort((a, b) => a.completed - b.completed);

        // Render the sorted tasks inside this specific group
        group.items.forEach((todo) => {
            const todoItem = document.createElement("li");
            todoItem.classList.add("todo-item");
            if (todo.completed) todoItem.classList.add("completed");

            const checkboxContainer = document.createElement("label");
            checkboxContainer.classList.add("checkbox-container");

            const checkbox = document.createElement("input");
            checkbox.type = "checkbox";
            checkbox.classList.add("todo-checkbox");
            checkbox.checked = todo.completed;
            checkbox.addEventListener("change", () => toggleTodo(todo.id));

            const checkmark = document.createElement("span");
            checkmark.classList.add("checkmark");

            checkboxContainer.appendChild(checkbox);
            checkboxContainer.appendChild(checkmark);

            const todoText = document.createElement("span");
            todoText.classList.add("todo-item-text");
            todoText.textContent = todo.text;

            const deleteBtn = document.createElement("button");
            deleteBtn.classList.add("btn", "btn-delete");
            deleteBtn.innerHTML = '<i class="fas fa-times"></i>';
            deleteBtn.addEventListener("click", () => deleteTodo(todo.id));

            todoItem.appendChild(checkboxContainer);
            todoItem.appendChild(todoText);
            todoItem.appendChild(deleteBtn);

            todosList.appendChild(todoItem);
        });
    });
}

function clearCompleted() {
    todos = todos.filter((todo) => !todo.completed);
    saveTodos();
    renderTodos();
}

function toggleTodo(id) {
    todos = todos.map((todo) => {
        if (todo.id === id) {
            return { ...todo, completed: !todo.completed };
        }

        return todo;
    });
    
    saveTodos();
    renderTodos();
}

function deleteTodo(id) {
    todos = todos.filter((todo) => todo.id !== id);
    saveTodos();
    renderTodos();
}

function loadTodos() {
    const storedTodos = localStorage.getItem("todos");
    if (storedTodos) todos = JSON.parse(storedTodos);
    updateItemsCount();
    checkEmptyState();
    renderTodos();
}

filters.forEach((filter) => {
    filter.addEventListener("click", () => {
        setActiveFilter(filter.getAttribute("data-filter"));
    });
});

function setActiveFilter(filter) {
    currentFilter = filter;

    filters.forEach((item) => {
        if (item.getAttribute("data-filter") === filter) {
            item.classList.add("active");
        } else {
            item.classList.remove("active");
        }
    });

    renderTodos();
    checkEmptyState();
}

function setDate() {
    const options = { weekday: "long", month: "long", day: "numeric", year: "numeric" };
    const today = new Date();
    dateElement.textContent = today.toLocaleDateString("en-US", options);
}

window.addEventListener("DOMContentLoaded", () => {
    loadTodos();
    setDate();
});