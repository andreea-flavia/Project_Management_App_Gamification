import express from 'express';

import {
    getStatuses
} from '../dataAccess/Nom_StatusDA.js';

let nomStatusRouter = express.Router();

nomStatusRouter.route('/statuses')
    .get (async(req, res) => {
        return res.json(await getStatuses());
    });

export default nomStatusRouter;