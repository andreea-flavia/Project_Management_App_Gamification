import express from 'express';

import {
    getTags
} from '../dataAccess/Nom_TagsDA.js';

let nomTagsRouter = express.Router();

nomTagsRouter.route('/tags')
    .get (async(req, res) => {
        return res.json(await getTags());
    });

export default nomTagsRouter;