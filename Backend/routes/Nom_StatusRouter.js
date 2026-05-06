import express from 'express';

import {
    getStatuses, getStatusessByType
} from '../dataAccess/Nom_StatusDA.js';

let nomStatusRouter = express.Router();

nomStatusRouter.route('/statuses')
    .get(async (req, res) => {
        return res.json(await getStatuses());
    });

nomStatusRouter.route('/statuses/:type')
    .get(async (req, res) => {
        const pr = await getStatusessByType(req.params.type);
        if (pr) {
            return res.json(pr);
        }
        return res.status(404).json({ error: 'Status not found' });
    })


export default nomStatusRouter;