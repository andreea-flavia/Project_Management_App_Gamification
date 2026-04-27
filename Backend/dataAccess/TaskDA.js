import Tasks from '../entities/Tasks.js';
import Priorities from '../entities/Nom_priority.js';
import Statuses from '../entities/Nom_status.js';
import Nom_Tags from '../entities/Nom_tags.js';
import { addXP_checkLevel } from './User_StatsDA.js';

async function createTask(task) {
    try{
        if(!task.status){
            task.status = 1; //UNASSIGNED
        }
        const tags = task.tags;
        const newTask = await Tasks.create(task);
        if (Array.isArray(tags)) {
            const tagIds = tags.map(tag => tag.tag_id ?? tag.id ?? tag).filter(Boolean);
            await newTask.setTags(tagIds);
        }
        return await getTaskById(newTask.task_id);
    } catch(e){
        console.error('Error creating task:', e);
        throw e;
    }
}

async function getTasks() {
    return await Tasks.findAll({
        include: [{ model: Nom_Tags, as: 'tags', through: { attributes: [] } }]
    });
}

async function getTaskById(id) {
    return await Tasks.findByPk(id, {
        include: [{ model: Nom_Tags, as: 'tags', through: { attributes: [] } }]
    });
}

async function getTasksByUserId(userId) {
    const tasks = await Tasks.findAll({
        where: { assigned_to: userId },
        include: [{ model: Nom_Tags, as: 'tags', through: { attributes: [] } }]
    });
    return tasks;
}

async function updateTask(id, taskData){
    const task = await Tasks.findByPk(id);
    if(!task){
        return null;
    }

    const { tags, ...fields } = taskData;
    await task.update(fields);

    if (Array.isArray(tags)) {
        const tagIds = tags.map(tag => tag.tag_id ?? tag.id ?? tag).filter(Boolean);
        await task.setTags(tagIds);
    }

    return await getTaskById(id);
}

async function deleteTask(id){
    const task = await Tasks.findByPk(id);
    if(!task){
        return null;
    }
    return await task.destroy();
}

async function markCompleted(id){
    const task = await Tasks.findByPk(id);
    if(!task){
        return null;
    }
    
    // Verifica daca task-ul nu e deja completed
    if(task.status === 4) {
        return task; // Deja completed, nu face nimic
    }

    // Schimba statusul la completed (4)
    task.status = 4; 
    await task.save();

    // Adauga XP-ul la user
    if(task.assigned_to && task.xp_points) {
        try {
            await addXP_checkLevel(task.assigned_to, task.xp_points, Math.floor(task.xp_points / 10));
            console.log(`Added ${task.xp_points} XP to user ${task.assigned_to}`);
        } catch(e) {
            console.error('Error adding XP:', e);
        }
    }

    return await getTaskById(id);
}


export {
    createTask,
    getTasks,
    getTaskById,
    updateTask,
    deleteTask,
    getTasksByUserId,
    markCompleted
}