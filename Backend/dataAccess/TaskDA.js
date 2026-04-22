import Tasks from '../entities/Tasks.js';
import Priorities from '../entities/Nom_priority.js';
import Statuses from '../entities/Nom_status.js';
import Nom_Tags from '../entities/Nom_tags.js';

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


export {
    createTask,
    getTasks,
    getTaskById,
    updateTask,
    deleteTask,
    getTasksByUserId
}