import { SaveLocal, GetLocal, RemoveLocal, UpdateLocal } from "./localstorage.js";

const taskClasses = [
    'p-4',
    'bg-white',
    'border',
    'border-gray-200',
    'rounded-lg',
    'shadow-sm',
    'cursor-grab',
    'hover:bg-gray-50',
    'transition-colors',
    'duration-150',
    'mb-3',
    'w-full',
    'max-w-md'
];


document.addEventListener('DOMContentLoaded', () => {
    loadTasks();

    let draggedElement = null;

    document.getElementById('addTaskButton').addEventListener('click', createNewTask);

    document.getElementById('taskTitle').addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            document.getElementById('addTaskButton').click();
        }
    });

    function createNewTask() {
        const titleInput = document.getElementById('taskTitle');
        const dateInput = document.getElementById('taskDate');
        const summaryInput = document.getElementById('taskSummary');

        const title = titleInput.value.trim();
        const date = dateInput.value;
        const summary = summaryInput.value.trim();

        if (title !== '') {
            const taskDiv = document.createElement('div');
            taskDiv.classList.add(...taskClasses);

            // Create task content
            const titleInputField = document.createElement('input');
            titleInputField.type = 'text';
            titleInputField.classList.add('font-semibold', 'text-lg', 'bg-transparent', 'border-none', 'p-0', 'w-full', 'focus:ring-0');
            titleInputField.value = title;

            //  Edit button
            const editButton = document.createElement('button');
            editButton.classList.add('text-gray-400', 'hover:text-gray-600', 'edit-toggle', 'p-1');
            editButton.innerHTML = `
                <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                    <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
                </svg>
            `;

            //  Delete button
            const deleteButton = document.createElement('button');
            deleteButton.classList.add('text-red-500', 'hover:text-red-700', 'delete-task', 'p-1');
            deleteButton.innerHTML = `
                <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                    <path fill-rule="evenodd" d="M6 4a1 1 0 011-1h6a1 1 0 011 1v1h4a1 1 0 110 2h-1v10a2 2 0 01-2 2H6a2 2 0 01-2-2V7H3a1 1 0 110-2h4V4zm2 3a1 1 0 00-1 1v7a1 1 0 102 0V8a1 1 0 00-1-1zm4 0a1 1 0 00-1 1v7a1 1 0 102 0V8a1 1 0 00-1-1z" clip-rule="evenodd" />
                </svg>
            `;
            deleteButton.addEventListener('click', () => removeTask(taskDiv, title));

            //  Task date input
            const dateInputField = document.createElement('input');
            dateInputField.type = 'date';
            dateInputField.classList.add('block', 'w-full', 'bg-transparent', 'border-none', 'p-0', 'text-sm', 'text-gray-600', 'mb-2', 'focus:ring-0');
            dateInputField.value = date ? date : new Date().toISOString().split('T')[0];

            //  Task summary textarea
            const summaryInputField = document.createElement('textarea');
            summaryInputField.classList.add('block', 'w-full', 'bg-transparent', 'border-none', 'p-0', 'text-sm', 'text-gray-600', 'resize-none', 'focus:ring-0');
            summaryInputField.rows = 2;
            summaryInputField.value = summary;

            //  Task header (title + buttons)
            const taskHeader = document.createElement('div');
            taskHeader.classList.add('flex', 'justify-between', 'items-start', 'mb-2');
            taskHeader.appendChild(titleInputField);
            taskHeader.appendChild(editButton);
            taskHeader.appendChild(deleteButton); // Add delete button

            // Append everything to taskDiv
            taskDiv.appendChild(taskHeader);
            taskDiv.appendChild(dateInputField);
            taskDiv.appendChild(summaryInputField);

            // Enable dragging
            taskDiv.draggable = true;
            taskDiv.addEventListener('dragstart', dragStart);

            // Add to todo column
            const todoColumn = document.getElementById('todo');
            if (todoColumn) {
                todoColumn.appendChild(taskDiv);

                // Save to local storage
                saveTasks();

                // Clear inputs
                titleInput.value = '';
                dateInput.value = '';
                summaryInput.value = '';
            }
        }
    }

    function dragStart(event) {
        draggedElement = event.target;
        event.target.classList.add('opacity-50');
    }

    const columns = document.querySelectorAll('#todo, #inProgress, #done');
    columns.forEach(column => {
        column.addEventListener('dragover', dragOver);
        column.addEventListener('drop', drop);
        column.addEventListener('dragenter', dragEnter);
        column.addEventListener('dragleave', dragLeave);
    });

    function dragOver(event) {
        event.preventDefault();
    }

    function dragEnter(event) {
        const column = event.target.closest('#todo, #inProgress, #done');
        if (column) {
            column.classList.add('bg-gray-100');
        }
    }

    function dragLeave(event) {
        const column = event.target.closest('#todo, #inProgress, #done');
        if (column) {
            column.classList.remove('bg-gray-100');
        }
    }

    function drop(event) {
        event.preventDefault();

        const column = event.target.closest('#todo, #inProgress, #done');
        if (!column) return;

        column.classList.remove('bg-gray-100');
        draggedElement.classList.remove('opacity-50');
        column.appendChild(draggedElement);
        draggedElement = null;

        saveTasks()
        SaveLocal(getAllTasks());
    }

    function getAllTasks() {
        const tasks = [];

        document.querySelectorAll('#todo, #inProgress, #done').forEach(column => {
            column.querySelectorAll('div').forEach(taskDiv => {
                const titleInput = taskDiv.querySelector('input[type="text"]');
                const dateInput = taskDiv.querySelector('input[type="date"]');
                const summaryInput = taskDiv.querySelector('textarea');

                if (!titleInput || !dateInput || !summaryInput) {
                    console.warn("Task element is missing required fields:", taskDiv);
                    return;
                }

                tasks.push({
                    title: titleInput.value,
                    date: dateInput.value,
                    summary: summaryInput.value,
                    column: column.id
                });
            });
        });

        return tasks;
    }

    function loadTasks() {
        const savedTasks = GetLocal(); // Get tasks from local storage

        console.log("Loaded tasks from local storage:", savedTasks); // Debugging line

        if (Array.isArray(savedTasks)) {
            savedTasks.forEach(task => createTaskFromData(task)); // Create each task
        }
    }

    function createTaskFromData(taskData) {
        const { title, date, summary, column } = taskData;

        if (!title || !column) return;

        const taskDiv = document.createElement('div');
        taskDiv.classList.add(...taskClasses);

        const titleInput = document.createElement('input');
        titleInput.type = 'text';
        titleInput.classList.add('font-semibold', 'text-lg', 'bg-transparent', 'border-none', 'p-0', 'w-full', 'focus:ring-0');
        titleInput.value = title;

        const editButton = document.createElement('button');
        editButton.classList.add('text-gray-400', 'hover:text-gray-600', 'edit-toggle', 'p-1');
        editButton.innerHTML = `
            <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
            </svg>
        `;

        //  DELETE BUTTON
        const deleteButton = document.createElement('button');
        deleteButton.classList.add('text-red-500', 'hover:text-red-700', 'delete-task', 'p-1');
        deleteButton.innerHTML = `
            <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                <path fill-rule="evenodd" d="M6 4a1 1 0 011-1h6a1 1 0 011 1v1h4a1 1 0 110 2h-1v10a2 2 0 01-2 2H6a2 2 0 01-2-2V7H3a1 1 0 110-2h4V4zm2 3a1 1 0 00-1 1v7a1 1 0 102 0V8a1 1 0 00-1-1zm4 0a1 1 0 00-1 1v7a1 1 0 102 0V8a1 1 0 00-1-1z" clip-rule="evenodd" />
            </svg>
        `;
        deleteButton.addEventListener('click', () => removeTask(taskDiv, title));

        // Task date input
        const dateInput = document.createElement('input');
        dateInput.type = 'date';
        dateInput.classList.add('block', 'w-full', 'bg-transparent', 'border-none', 'p-0', 'text-sm', 'text-gray-600', 'mb-2', 'focus:ring-0');
        dateInput.value = date ? date : new Date().toISOString().split('T')[0];

        // Task summary textarea
        const summaryInput = document.createElement('textarea');
        summaryInput.classList.add('block', 'w-full', 'bg-transparent', 'border-none', 'p-0', 'text-sm', 'text-gray-600', 'resize-none', 'focus:ring-0');
        summaryInput.rows = 2;
        summaryInput.value = summary ? summary : '';

        // Task header (title + buttons)
        const taskHeader = document.createElement('div');
        taskHeader.classList.add('flex', 'justify-between', 'items-start', 'mb-2');
        taskHeader.appendChild(titleInput);
        taskHeader.appendChild(editButton);
        taskHeader.appendChild(deleteButton); // Add delete button

        // Append everything to the task div
        taskDiv.appendChild(taskHeader);
        taskDiv.appendChild(dateInput);
        taskDiv.appendChild(summaryInput);

        // Enable dragging
        taskDiv.draggable = true;
        taskDiv.addEventListener('dragstart', dragStart);

        // Append to the correct column
        const columnElement = document.getElementById(column);
        if (columnElement) {
            columnElement.appendChild(taskDiv);
        } else {
            console.warn(`Column "${column}" not found. Task not added.`);
        }
    }

    function saveTasks() {
        const allTasks = getAllTasks(); // Function to collect all tasks
        SaveLocal(allTasks);
    }

    function removeTask(taskElement, taskTitle) {
        // Remove from local storage
        let tasks = GetLocal(); // Get existing tasks
        tasks = tasks.filter(task => task.title !== taskTitle); // Remove the matching task
        SaveLocal(tasks); // Save updated list

        // Remove from DOM
        taskElement.remove();
    }
});