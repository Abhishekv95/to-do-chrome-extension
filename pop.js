document.addEventListener('DOMContentLoaded', function() {
    const taskInput = document.getElementById('taskInput');
    const addTaskBtn = document.getElementById('addTaskBtn');
    const taskList = document.getElementById('taskList');
  
    // Load saved tasks
    chrome.storage.sync.get(['tasks'], function(result) {
      if (result.tasks) {
        result.tasks.forEach(task => {
          addTaskToList(task);
        });
      }
    });
  
    // Add task button listener
    addTaskBtn.addEventListener('click', function() {
      const task = taskInput.value.trim();
      if (task) {
        addTaskToList(task);
        saveTask(task);
        taskInput.value = ''; // Clear input
      }
    });
  
    // Save the task to Chrome storage
    function saveTask(task) {
      chrome.storage.sync.get(['tasks'], function(result) {
        const tasks = result.tasks || [];
        tasks.push(task);
        chrome.storage.sync.set({ tasks: tasks });
      });
    }
  
    // Add task to the HTML list
    function addTaskToList(task) {
      const li = document.createElement('li');
      li.textContent = task;
      const deleteBtn = document.createElement('button');
      deleteBtn.textContent = 'X';
      deleteBtn.addEventListener('click', function() {
        taskList.removeChild(li);
        removeTask(task);
      });
      li.appendChild(deleteBtn);
      taskList.appendChild(li);
    }
  
    // Remove task from Chrome storage
    function removeTask(task) {
      chrome.storage.sync.get(['tasks'], function(result) {
        const tasks = result.tasks || [];
        const updatedTasks = tasks.filter(t => t !== task);
        chrome.storage.sync.set({ tasks: updatedTasks });
      });
    }
  });
  
