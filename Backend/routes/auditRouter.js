
import express from 'express';
import { ROLES } from '../constants/roles.js';
import verifyRole from '../Middleware/verifyRole.js';


import { getAuditLogs, getAuditLogsByentityId } from '../dataAccess/AuditLogDA.js';

let auditRouter = express.Router();

auditRouter.route('/logs')
    .get(verifyRole(ROLES.ADMIN), async (req, res) => {
        try {
            const logs = await getAuditLogs();
            return res.json(logs);
        } catch (err) {
            console.error(err);
            return res.status(500).json({ error: 'Error getting audit logs' });
        }
    });

auditRouter.route('/logs/:entity_id')
    .get(verifyRole(ROLES.ADMIN), async (req, res) => {
        try {
            const logs = await getAuditLogsByentityId(req.params.entity_id);
            return res.json(logs);
        } catch (err) {
            console.error(err);
            return res.status(500).json({ error: 'Error getting audit logs' });
        }
    });

export default auditRouter; 