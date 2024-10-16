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
  
    // Save the task to Chrome storage
    function saveTask(task) {
      chrome.storage.sync.get(['tasks'], function(result) {
        const tasks = result.tasks || [];
        tasks.push(task);
        chrome.storage.sync.set({ tasks: tasks });
      });
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
  
