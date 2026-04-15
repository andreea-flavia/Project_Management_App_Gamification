import express from 'express';

import {
    getTT,
    getTagsByTaskId 
} from '../dataAccess/Tasks_TagsDA.js';

let nomTT= express.Router();

nomTT.route('/tags/:task_id')
    .get(async(req, res) => {
        const tags = await getTagsByTaskId(req.params.task_id);
        if(tags) return res.json(tags);
        return res.status(404).json({error: 'Tags not found for the given task ID'});
    });

export default nomTT;