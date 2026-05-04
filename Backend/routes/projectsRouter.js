import verifyRole from '../Middleware/verifyRole.js';
import express from 'express';

import {
    createProject,
    deleteProject,
    getMyProjects,
    getAllProjects
} from '../dataAccess/ProjectsDA.js';
import { ROLES } from '../constants/roles.js';
import { logAction } from '../dataAccess/AuditLogDA.js';
import { LOG_ENTITY_TYPES } from '../constants/log_entity_type.js';
import { LOG_ACTIONS } from '../constants/log_action.js';


let projectsRouter = express.Router();

projectsRouter.route('/project')
    .post(verifyRole(ROLES.ADMIN, ROLES.MANAGER), async (req, res) => {
        try {
            const new_project = await createProject(req.body, req.user.userId);
            await logAction(req.user.userId, LOG_ACTIONS.CREATE, LOG_ENTITY_TYPES.PROJECT, new_project.project_id, new_project);
            return res.status(201).json(new_project);
        } catch (error) {
            return res.status(400).json({ error: error.message });
        }
    })

projectsRouter.route('/project/:id')
    .delete(verifyRole(ROLES.ADMIN, ROLES.MANAGER), async (req, res) => {
        const pr_del = await deleteProject(req.params.id);
        if (pr_del) {
            await logAction(req.user.userId, LOG_ACTIONS.DELETE, LOG_ENTITY_TYPES.PROJECT, pr_del.project_id, pr_del);
            return res.json(pr_del);
        }
    })

projectsRouter.route('/projects')
    .get(verifyRole(ROLES.ADMIN, ROLES.MANAGER, ROLES.USER), async (req, res) => {
        try {
            let projects = [];
            if (req.user.role === ROLES.ADMIN) {
                projects = await getAllProjects();
            } else {
                projects = await getMyProjects(req.user.userId);
            }
            return res.status(200).json(projects);
        } catch (error) {
            return res.status(400).json({ error: error.message });
        }
    })

export default projectsRouter;


