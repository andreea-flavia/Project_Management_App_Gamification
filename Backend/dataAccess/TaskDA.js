import Tasks from '../entities/Tasks.js';
import Priorities from '../entities/Nom_priority.js';
import Statuses from '../entities/Nom_status.js';
import Nom_Tags from '../entities/Nom_tags.js';
import { addXP_checkLevel } from './User_StatsDA.js';
import Project_Members from '../entities/Project_Members.js';
import { checkUserForBadges } from './Nom_BadgesDA.js';



async function createTask(task) {
    try {
        if (!task.status) {
            task.status = 1; //UNASSIGNED
        }
        const tags = task.tags;
        const newTask = await Tasks.create(task);
        if (task.assigned_to && task.project_id) {
            await Project_Members.findOrCreate({
                where: {
                    user_id: task.assigned_to,
                    project_id: task.project_id
                },
                defaults: {
                    role: 'MEMBER'
                }
            })
        }
        if (Array.isArray(tags)) {
            const tagIds = tags.map(tag => tag.tag_id ?? tag.id ?? tag).filter(Boolean);
            await newTask.setTags(tagIds);
        }
        return await getTaskById(newTask.task_id);
    } catch (e) {
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

async function updateTask(id, taskData) {
    const task = await Tasks.findByPk(id);
    if (!task) {
        return null;
    }
    const oldStatus = task.status;
    if (taskData.version !== undefined) {
        task.version = taskData.version;
    }

    const finalAssignedTo = taskData.assigned_to !== undefined ? taskData.assigned_to : task.assigned_to;

    if (taskData.status === 4 && !finalAssignedTo) {
        throw new Error("Cannot complete a task without an assignee.");
    }

    const { tags, ...fields } = taskData;
    await task.update(fields);

    if (oldStatus !== 4 && task.status === 4) {
        if (task.assigned_to && task.xp_points) {
            try {
                await addXP_checkLevel(task.assigned_to, task.xp_points, Math.floor(task.xp_points / 10));
                await checkUserForBadges(task.assigned_to);
                console.log(`[SYSTEM] Task ${id} completed manually. XP & Badges processed.`);
            } catch (error) {
                console.error('Error in gamification logic during updateTask:', e);
            }
        }
    }


    if (taskData.assigned_to && taskData.project_id) {
        await Project_Members.findOrCreate({
            where: {
                user_id: taskData.assigned_to,
                project_id: taskData.project_id
            },
            defaults: {
                role: 'MEMBER'
            }
        });
    }

    if (Array.isArray(tags)) {
        const tagIds = tags.map(tag => tag.tag_id ?? tag.id ?? tag).filter(Boolean);
        await task.setTags(tagIds);
    }

    return await getTaskById(id);
}

async function deleteTask(id) {
    const task = await Tasks.findByPk(id);
    if (!task) {
        return null;
    }
    return await task.destroy();
}

async function markCompleted(id) {
    const task = await Tasks.findByPk(id);
    if (!task) {
        return null;
    }

    if (!task.assigned_to) {
        throw new Error("Cannot complete an unassigned task. Please assign it to someone first.");
    }

    if (task.status === 4) {
        return task;
    }
    task.status = 4;
    await task.save();
    if (task.assigned_to && task.xp_points) {
        try {
            await addXP_checkLevel(task.assigned_to, task.xp_points, Math.floor(task.xp_points / 10));
            await checkUserForBadges(task.assigned_to);
            console.log(`Added XP and checked badges for user ${task.assigned_to}`);
        } catch (e) {
            console.error('Error adding XP & checking for badges:', e);
        }
    }

    return await getTaskById(id);
}

async function countCompletedTask(userId) {
    return await Tasks.count({
        where: { assigned_to: userId, status: 4 }
    });
}


export {
    createTask,
    getTasks,
    getTaskById,
    updateTask,
    deleteTask,
    getTasksByUserId,
    markCompleted,
    countCompletedTask
}