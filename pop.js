document.addEventListener('DOMContentLoaded', function () {
    const taskInput = document.getElementById('taskInput');
    const addTaskBtn = document.getElementById('addTaskBtn');
    const categoryInput = document.getElementById('categoryInput');
    const priorityInput = document.getElementById('priorityInput');
    const dueDateInput = document.getElementById('dueDateInput');
    const taskList = document.getElementById('taskList');
    const darkModeToggle = document.getElementById('darkModeToggle');

    // Load saved tasks and dark mode setting
    chrome.storage.sync.get(['tasks', 'darkMode'], function (result) {
        if (result.tasks) {
            result.tasks.forEach(task => {
                addTaskToList(task);
            });
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

        if (task) {
            const taskObj = { task, category, priority, dueDate, done: false };
            addTaskToList(taskObj);
            saveTask(taskObj);
            taskInput.value = ''; // Clear input
            dueDateInput.value = ''; // Clear date input
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
            chrome.storage.sync.set({ tasks: tasks });
        });
    }

    function addTaskToList(taskObj) {
        const li = document.createElement('li');
        li.className = `task ${taskObj.priority.toLowerCase()}`;
        li.innerHTML = `<span class="task-text">${taskObj.task} (${taskObj.category}) - Due: ${taskObj.dueDate}</span>`;
        
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
            chrome.storage.sync.set({ tasks: tasks });
        });
    }

    function removeTask(taskName) {
        chrome.storage.sync.get(['tasks'], function (result) {
            const tasks = result.tasks.filter(task => task.task !== taskName);
            chrome.storage.sync.set({ tasks: tasks });
        });
    }
});
