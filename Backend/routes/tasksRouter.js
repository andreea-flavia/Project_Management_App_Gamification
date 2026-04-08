import express from 'express';

import {
    createTask,
    getTasks,
    getTaskById,
    updateTask,
    deleteTask
} from '../dataAccess/TaskDA.js';

let tasksRouter = express.Router();

tasksRouter.route('/task')
    .post (async (req,res) => {
        try{
            const new_task = await createTask(req.body);
            return res.status(201).json(new_task);
        } catch(e){
            return res.status(400).json({error: e.message});
        }
    })
    .get (async(req, res) => {
        return res.json(await getTasks());
    });

tasksRouter.route('/task/:id')
    .get(async(req, res) => {
        const task = await getTaskById(req.params.id);
        if(task) 
            return res.json(task);
        return res.status(404).json({error: 'Task not found'});
    })
    .put(async(req, res) => {
        const task_upd = await updateTask(req.params.id, req.body);
        if(task_upd)
            return res.json(task_upd);
        return res.status(404).json({error: 'Task not found'});
    })
    .delete(async(req, res) => {
        task_del = await deleteTask(req.params.id);
        if(task_del)
            return res.json(task_del);
        return res.status(404).json({error: 'Task not found'});
    });


    export default tasksRouter;