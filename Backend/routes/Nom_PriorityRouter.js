import express from 'express';

import {
    getPriorities,
    getPrioritiesByType
} from '../dataAccess/Nom_PriorityDA.js';

let nomPriorityRouter = express.Router();

nomPriorityRouter.route('/priorities')
    .get(async (req, res) => {
        return res.json(await getPriorities());
    });

nomPriorityRouter.route('/priorities/:type')
    .get(async (req, res) => {
        const pr = await getPrioritiesByType(req.params.type);
        if (pr) {
            return res.json(pr);
        }
        return res.status(404).json({ error: 'Priority not found' });
    })

export default nomPriorityRouter;


