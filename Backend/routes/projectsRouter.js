import verifyRole from '../Middleware/verifyRole.js';
import express from 'express';

import {
    createProject,
    deleteProject,
    getMyProjects,
    getAllProjects,
    getProjectStats,
    getProjectById,
    isUserInProject,
    archiveProject,
    getProjectMembers,
    addProjectMember
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
        try {
            const pr_del = await archiveProject(req.params.id);
            if (pr_del) {
                await logAction(req.user.userId, LOG_ACTIONS.DELETE, LOG_ENTITY_TYPES.PROJECT, pr_del.project_id, pr_del);
                return res.json(pr_del);
            }
            return res.status(404).json({ error: 'Project not found' });
        } catch (error) {
            return res.status(500).json({ error: error.message });
        }

    })
    .get(verifyRole(ROLES.ADMIN, ROLES.MANAGER, ROLES.STANDARD), async (req, res) => {
        try {
            if (req.user.role === ROLES.STANDARD) {
                const hasAccess = await isUserInProject(req.user.userId, req.params.id);
                if (!hasAccess) {
                    return res.status(403).json({ error: 'Forbidden: You are not a member of this project!' });
                }
            }
            const project = await getProjectById(req.params.id);
            if (!project) return res.status(404).json({ error: 'Project not found' });

            return res.status(200).json(project);
        } catch (error) {
            return res.status(500).json({ error: error.message });
        }
    });

projectsRouter.route('/project/:id/close')
    .put(verifyRole(ROLES.ADMIN, ROLES.MANAGER), async (req, res) => {
        try {
            const project = await archiveProject(req.params.id);
            if (project) {
                return res.status(200).json(project);
            }
            return res.status(404).json({ error: 'Project not found' });
        } catch (error) {
            return res.status(500).json({ error: error.message });
        }
    });

projectsRouter.route('/project/:id/members')
    .get(async (req, res) => {
        try {
            const members = await getProjectMembers(req.params.id);
            return res.status(200).json(members);
        } catch (error) {
            return res.status(500).json({ error: error.message });
        }
    })
    .post(verifyRole(ROLES.ADMIN, ROLES.MANAGER), async (req, res) => {
        try {
            const { userId, role } = req.body;
            const [member, created] = await addProjectMember(req.params.id, userId, role);
            return res.status(created ? 201 : 200).json(member);
        } catch (error) {
            return res.status(500).json({ error: error.message });
        }
    });

projectsRouter.route('/project/:id/stats')
    .get(async (req, res) => {
        try {
            const stats = await getProjectStats(req.params.id);
            return res.status(200).json(stats);
        } catch (error) {
            return res.status(500).json({ error: error.message });
        }
    });

projectsRouter.route('/my-projects')
    .get(verifyRole(ROLES.ADMIN, ROLES.MANAGER, ROLES.STANDARD), async (req, res) => {
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


