import verifyRole from '../Middleware/verifyRole.js';
import express from 'express';
import { ROLES } from '../constants/roles.js';
import { LOG_ENTITY_TYPES } from '../constants/log_entity_type.js';
import { LOG_ACTIONS } from '../constants/log_action.js';


import {
    createTask,
    getTasks,
    getTaskById,
    updateTask,
    deleteTask,
    getTasksByUserId,
    markCompleted,
    countCompletedTask
} from '../dataAccess/TaskDA.js';

import { logAction } from '../dataAccess/AuditLogDA.js';

let tasksRouter = express.Router();

tasksRouter.route('/task')
    .post(verifyRole(ROLES.ADMIN, ROLES.MANAGER), async (req, res) => {
        try {
            const new_task = await createTask(req.body);
            await logAction(req.user.userId, LOG_ACTIONS.CREATE, LOG_ENTITY_TYPES.TASK, new_task.task_id, new_task);
            return res.status(201).json(new_task);
        } catch (e) {
            return res.status(400).json({ error: e.message });
        }
    })
    .get(async (req, res) => {
        //Admin / Manager vad toate taskurile
        // Standard le vede doar pe ale lui
        try {
            if (req.user.role === ROLES.ADMIN || req.user.role === ROLES.MANAGER) {
                const allTasks = await getTasks();
                return res.json(allTasks);
            }
            if (req.user.role === ROLES.STANDARD) {
                const userTasks = await getTasksByUserId(req.user.userId);
                return res.json(userTasks);
            }
        } catch (err) {
            console.error(err);
            return res.status(500).json({ error: 'Error getting tasks' });
        }

        // return res.json(await getTasks());
    });

tasksRouter.route('/task/:id')
    .get(async (req, res) => {
        const task = await getTaskById(req.params.id);
        if (task)
            return res.json(task);
        return res.status(404).json({ error: 'Task not found' });
    })
    .put(async (req, res) => {
        try {

            const taskDB = await getTaskById(req.params.id);
            if (req.user.role === ROLES.STANDARD) {
                if (!taskDB)
                    return res.status(404).json({ error: 'Task not found' });
                if (taskDB.assigned_to !== req.user.userId) {
                    return res.status(403).json({ error: 'Forbidden: You cannot edit other users tasks!' });
                }
            }

            if (req.body.version !== undefined && Number(taskDB.version) !== Number(req.body.version)) {
                return res.status(409).json({ error: 'Attention! This task has been modified by another user. Refresh the page to see the changes!' });
            }

            const task_upd = await updateTask(req.params.id, req.body);
            if (task_upd) {
                await logAction(req.user.userId, LOG_ACTIONS.UPDATE, LOG_ENTITY_TYPES.TASK, task_upd.task_id, { previous: taskDB, updated: task_upd });
                return res.json(task_upd);
            }
            return res.status(404).json({ error: 'Task not found' });
        } catch (error) {

            console.error("Error in PUT /task/:id :", error);
            res.status(400).json({ error: error.message });
        }
    })
    .delete(verifyRole(ROLES.ADMIN, ROLES.MANAGER), async (req, res) => {
        const task_del = await deleteTask(req.params.id);
        if (task_del) {
            await logAction(req.user.userId, LOG_ACTIONS.DELETE, LOG_ENTITY_TYPES.TASK, task_del.task_id, task_del);
            return res.json(task_del);
        }
        return res.status(404).json({ error: 'Task not found' });
    })
    .patch(async (req, res) => {
        const task = await markCompleted(req.params.id);
        if (task)
            return res.json(task);
        return res.status(404).json({ error: 'Task not found' });
    });

tasksRouter.route('/tasks/user/:userId')
    .get(async (req, res) => {
        const tasks = await getTasksByUserId(req.params.userId);
        return res.json(tasks);
    });


tasksRouter.route('/tasks/user/:userId/completed-count')
    .get(async (req, res) => {
        const count = await countCompletedTask(req.params.userId);
        return res.json({ count });
    });

export default tasksRouter;