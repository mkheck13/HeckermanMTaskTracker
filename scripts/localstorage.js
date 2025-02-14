// Save to Local
const SaveLocal = (tasks) => {
    localStorage.setItem('tasks', JSON.stringify(tasks));
};

// Get From Local
const GetLocal = () => {

    return JSON.parse(localStorage.getItem('tasks')) || [];
};

// Remove From Local
const RemoveLocal = (task) => {
    let taskArr = GetLocal();
    let index = taskArr.indexOf(task);

    if(index !== -1){
        taskArr.splice(index, 1);

        console.log(taskArr);
        localStorage.setItem("Task", JSON.stringify(taskArr))     
    }
};

// Update Local
const UpdateLocal = (updateTask) => {
    let tasks = GetLocal();
    tasks = tasks.map(task => task.name === updateTask.name && task.description === updateTask.description && task.date === updateTask.date ? updateTask : task);
    localStorage.setItem('Task', JSON.stringify(tasks));
}

// Exports
export { SaveLocal, GetLocal, RemoveLocal, UpdateLocal }