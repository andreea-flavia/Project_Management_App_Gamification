import express from 'express';

import {
    getPriorities
} from '../dataAccess/Nom_PriorityDA.js';

let nomPriorityRouter = express.Router();

nomPriorityRouter.route('/priorities')
    .get (async(req, res) => {
        return res.json(await getPriorities());
    });

export default nomPriorityRouter;