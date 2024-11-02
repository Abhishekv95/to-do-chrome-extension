document.addEventListener('DOMContentLoaded', function () {
    const taskInput = document.getElementById('taskInput');
    const addTaskBtn = document.getElementById('addTaskBtn');
    const categoryInput = document.getElementById('categoryInput');
    const priorityInput = document.getElementById('priorityInput');
    const dueDateInput = document.getElementById('dueDateInput');
    const taskList = document.getElementById('taskList');
    const darkModeToggle = document.getElementById('darkModeToggle');

    // Load saved tasks and apply sorting & dark mode
    chrome.storage.sync.get(['tasks', 'darkMode'], function (result) {
        if (result.tasks) {
            result.tasks.sort(sortTasks).forEach(task => addTaskToList(task)); // Apply sorting function
        }
        if (result.darkMode) {
            document.body.classList.add('dark');
            darkModeToggle.checked = true;
        }
    });

    addTaskBtn.addEventListener('click', function () {
        const task = taskInput.value.trim();
        const category = categoryInput.value;
        const priority = priorityInput.value;
        const dueDate = dueDateInput.value;

        // Validate that all fields are filled
        if (task && category && priority && dueDate) {
            const taskObj = { task, category, priority, dueDate, done: false };
            addTaskToList(taskObj);
            saveTask(taskObj);
            clearForm();  // Clear form after adding task
        } else {
            alert("Please fill in all task details!");
        }
    });

    darkModeToggle.addEventListener('change', function () {
        document.body.classList.toggle('dark');
        chrome.storage.sync.set({ darkMode: darkModeToggle.checked });
    });

    function saveTask(taskObj) {
        chrome.storage.sync.get(['tasks'], function (result) {
            const tasks = result.tasks || [];
            tasks.push(taskObj);
            tasks.sort(sortTasks);  // Re-sort tasks after adding a new one
            chrome.storage.sync.set({ tasks });
        });
    }

    function addTaskToList(taskObj) {
        const li = document.createElement('li');
        li.className = `task ${taskObj.priority.toLowerCase()}`;

        // Color-coding based on due date
        const daysRemaining = calculateDaysRemaining(taskObj.dueDate);
        if (daysRemaining <= 2) li.classList.add('due-soon'); // Add 'due-soon' class if due in 2 days or less

        li.innerHTML = `
            <span class="task-text">${taskObj.task} (${taskObj.category}) - Due: ${taskObj.dueDate}</span>
        `;

        const doneCheckbox = document.createElement('input');
        doneCheckbox.type = 'checkbox';
        doneCheckbox.checked = taskObj.done;
        doneCheckbox.addEventListener('change', function () {
            taskObj.done = doneCheckbox.checked;
            updateTask(taskObj);
        });

        const deleteBtn = document.createElement('button');
        deleteBtn.textContent = 'X';
        deleteBtn.addEventListener('click', function () {
            taskList.removeChild(li);
            removeTask(taskObj.task);
        });

        li.prepend(doneCheckbox);
        li.appendChild(deleteBtn);
        taskList.appendChild(li);
    }

    function updateTask(updatedTask) {
        chrome.storage.sync.get(['tasks'], function (result) {
            const tasks = result.tasks.map(task =>
                task.task === updatedTask.task ? updatedTask : task
            );
            chrome.storage.sync.set({ tasks });
        });
    }

    function removeTask(taskName) {
        chrome.storage.sync.get(['tasks'], function (result) {
            const tasks = result.tasks.filter(task => task.task !== taskName);
            chrome.storage.sync.set({ tasks });
        });
    }

    function clearForm() {
        taskInput.value = '';
        categoryInput.value = '';
        priorityInput.value = '';
        dueDateInput.value = '';
    }

    // Sorting function based on priority and due date
    function sortTasks(a, b) {
        const priorityOrder = { high: 1, medium: 2, low: 3 };
        if (priorityOrder[a.priority] === priorityOrder[b.priority]) {
            return new Date(a.dueDate) - new Date(b.dueDate);
        }
        return priorityOrder[a.priority] - priorityOrder[b.priority];
    }

    // Calculates days remaining until the task's due date
    function calculateDaysRemaining(dueDate) {
        const currentDate = new Date();
        const targetDate = new Date(dueDate);
        return Math.floor((targetDate - currentDate) / (1000 * 60 * 60 * 24));
    }
});
