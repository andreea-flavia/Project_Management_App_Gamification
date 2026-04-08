import express from 'express';
import db from '../dbConfig.js';
import Statuses from '../entities/Nom_status.js';
import Priorities from '../entities/Nom_priority.js';

let createDbRouter = express.Router();

createDbRouter.route('/create').get(async (req, res) => {
    try{
        // await db.sync({force : true})
        await db.sync({alter : true})

        const statuses=[
            {status_name: 'UNASIGNED', status_description: 'Task not assigned', status_type: 'TASK', color: '#000000'},
            {status_name: 'ASSIGNED', status_description: 'Task assigned but not started', status_type: 'TASK', color: '#000000'},
            {status_name: 'IN_PROGRESS', status_description: 'Task in progress', status_type: 'TASK', color: '#0000FF'},
            {status_name: 'COMPLETED', status_description: 'Task completed', status_type: 'TASK', color: '#00FF00'},
            {status_name: 'ON_HOLD', status_description: 'Task on hold', status_type: 'TASK', color: '#FFFF00'},
        ];

        await Statuses.bulkCreate(statuses);

        const priorities=[
            {priority_name: 'LOW', priority_description: 'Low priority', priority_type: 'TASK', color: '#00FF00'},
            {priority_name: 'MEDIUM', priority_description: 'Medium priority', priority_type: 'TASK', color: '#FFFF00'},
            {priority_name: 'HIGH', priority_description: 'High priority', priority_type: 'TASK', color: '#FF0000'},
        ];

        await Priorities.bulkCreate(priorities);


        res.status(201).json({message : 'created'})
    }
    catch(err){
        console.warn(err.stack)
        // res.status(500).json({ error: err.message });
        res.status(500).json({ 
            message: 'server error', 
            error: err.message,   
            details: err.original?.sqlMessage || err.name 
        });
    }
});

export default createDbRouter;