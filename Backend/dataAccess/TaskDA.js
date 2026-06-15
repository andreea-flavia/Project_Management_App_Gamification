import Tasks from '../entities/Tasks.js';
import Priorities from '../entities/Nom_priority.js';
import Statuses from '../entities/Nom_status.js';
import Nom_Tags from '../entities/Nom_tags.js';
import { addXP_checkLevel, getUserStatsByUserId } from './User_StatsDA.js';
import Project_Members from '../entities/Project_Members.js';
import { checkUserForBadges } from './Nom_BadgesDA.js';
import { createNotification } from './notificationsDA.js';
import Users from '../entities/Users.js';
import { Op } from 'sequelize';


async function createTask(task) {
    try {
        if (!task.status) {
            task.status = 1; //UNASSIGNED
        }
        const tags = task.tags;
        const newTask = await Tasks.create(task);

        if (newTask.assigned_to) {
            await createNotification(
                newTask.assigned_to,
                "Task Assigned",
                `New operative task: #${newTask.task_id} ${newTask.task_title}`,
                "TASK_ASSIGNED",
                newTask.task_id
            );
        }

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
        include: [
            { model: Nom_Tags, as: 'tags', through: { attributes: [] } },
            { model: Users, as: 'assignedUser' }
        ]
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

    const oldAssignee = task.assigned_to;
    if (taskData.assigned_to && taskData.assigned_to !== oldAssignee) {
        await createNotification(
            taskData.assigned_to,
            "New Task Assigned",
            `You have been reassigned to task: #${task.task_id} ${task.task_title}`,
            "TASK_ASSIGNED",
            id
        );
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


async function checkMissedDeadlines() {
    try {
        const expiredTasks = await Tasks.findAll({
            where: {
                status: { [Op.notIn]: [4, 6] },
                end_date: { [Op.lt]: new Date() }
            }
        })

        if (expiredTasks.length > 0) {
            for (let task of expiredTasks) {
                task.status = 6;
                await task.save();
                if (task.assigned_to) {
                    await createNotification(
                        task.assigned_to,
                        "Missed Deadline!",
                        `You missed the deadline for task #${task.task_id} (${task.task_title}). 100 W-Coins have been substracted from your balance.`,
                        "SYSTEM",
                        task.task_id
                    );
                    const userStats = await getUserStatsByUserId(task.assigned_to);
                    if (userStats) {
                        userStats.w_coins = Math.max(0, userStats.w_coins - 100);
                        await userStats.save();
                    }
                }
            }
        }
    } catch (error) {
        console.error("Eroare la verificarea deadline-urilor:", error);

    }
}


async function submitForReview(id) {
    const task = await Tasks.findByPk(id);
    if (!task) {
        return null;
    }
    if (!task.assigned_to) {
        throw new Error("Cannont submit an unassigned task. Please assign it to someone first!");
    }
    if (task.status === 4) {
        return task;
    }

    task.status = 13; //IN_REVIEW
    await task.save();
    return await getTaskById(id);
}

async function approveTask(id) {
    const task = await Tasks.findByPk(id);
    if (!task) {
        return null;
    }
    if (task.status === 4) {
        return task;
    }
    task.status = 4; //COMPLETED
    await task.save();
    if (task.assigned_to) {
        try {
            await createNotification(
                task.assigned_to,
                "Task Approved!",
                `Your work on task #${task.task_id} (${task.task_title}) has been approved! Rewards have been added to your profile.`,
                "SYSTEM",
                task.task_id
            );
        } catch (e) {
            console.error("Error creating approve notification: ", e);
        }
    }
    if (task.assigned_to && task.xp_points) {
        try {
            await addXP_checkLevel(task.assigned_to, task.xp_points, Math.floor(task.xp_points / 10));
            await checkUserForBadges(task.assigned_to);
            console.log(`[SYSTEM] Task ${id} approved. Added XP and checked badges for user ${task.assigned_to}`);
        } catch (e) {
            console.error('Error adding XP & checking for badges:', e);
        }
    }
    return await getTaskById(id);
}

async function rejectTask(id) {
    const task = await Tasks.findByPk(id);
    if (!task) {
        return null;
    }
    task.status = 2; //IN_PROGRESS
    await task.save();
    if (task.assigned_to) {
        try {
            await createNotification(
                task.assigned_to,
                "Task Rejected!",
                `Your work on task #${task.task_id} (${task.task_title}) has been rejected. It was moved back to 'In Progress'.`,
                "SYSTEM",
                task.task_id
            );
        } catch (e) {
            console.error("Error creating reject notification: ", e);
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
    markCompleted,
    countCompletedTask,
    checkMissedDeadlines,
    submitForReview,
    approveTask,
    rejectTask
}