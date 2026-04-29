import verifyRole from '../Middleware/verifyRole.js';
import express from 'express';
import { ROLES } from '../constants/roles.js';
import { LOG_ENTITY_TYPES } from '../constants/log_entity_type.js';
import { LOG_ACTIONS } from '../constants/log_action.js';


import { getAuditLogs, getAuditLogsByentityId } from '../dataAccess/AuditLogDA.js';

let auditRouter = express.Router();

auditRouter.route('/logs')
    .get(async (req, res) => {
        try {
            const logs = await getAuditLogs();
            return res.json(logs);
        } catch (err) {
            console.error(err);
            return res.status(500).json({ error: 'Error getting audit logs' });
        }
    });

auditRouter.route('/logs/:entity_id')
    .get(async (req, res) => {
        try {
            const logs = await getAuditLogsByentityId(req.params.entity_id);
            return res.json(logs);
        } catch (err) {
            console.error(err);
            return res.status(500).json({ error: 'Error getting audit logs' });
        }
    });

export default auditRouter;