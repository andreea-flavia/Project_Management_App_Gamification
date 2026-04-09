import Tasks from '../entities/Tasks.js';
import Priorities from '../entities/Nom_priority.js';
import Statuses from '../entities/Nom_status.js';

async function createTask(task) {
    try{
        if(!task.status){
            task.status = 1; //UNASSIGNED
        }
        return await Tasks.create(task);
    } catch(e){
        console.error('Error creating task:', e);
        throw e;
    }
}

async function getTasks() {
    return await Tasks.findAll();
}

async function getTaskById(id) {
    return await Tasks.findByPk(id);
}

async function getTasksByUserId(userId) {
    const tasks = await Tasks.findAll({ where: { assigned_to: userId } });
    return tasks;
}

async function updateTask(id, taskData){
    const task = await Tasks.findByPk(id);
    if(!task){
        return null;
    }
    return await task.update(taskData);
}

async function deleteTask(id){
    const task = await Tasks.findByPk(id);
    if(!task){
        return null;
    }
    return await task.destroy();
}


export {
    createTask,
    getTasks,
    getTaskById,
    updateTask,
    deleteTask,
    getTasksByUserId
}