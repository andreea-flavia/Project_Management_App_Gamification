import express from 'express';
import db from '../dbConfig.js';
import Statuses from '../entities/Nom_status.js';
import Priorities from '../entities/Nom_priority.js';
import Nom_Tags from '../entities/Nom_tags.js';

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

        // await Statuses.bulkCreate(statuses);

        const priorities=[
            {priority_name: 'LOW', priority_description: 'Low priority', priority_type: 'TASK', color: '#689868'},
            {priority_name: 'MEDIUM', priority_description: 'Medium priority', priority_type: 'TASK', color: '#dfdf55'},
            {priority_name: 'HIGH', priority_description: 'High priority', priority_type: 'TASK', color: '#9b4949'},
        ];

        // await Priorities.bulkCreate(priorities);

        const tags = [
            {tag_name: 'BUG', tag_description: 'Indicates a bug in the system', color: '#ff0000'},
            {tag_name: 'FEATURE', tag_description: 'Indicates a new feature request', color: '#00ff00'},
            {tag_name: 'IMPROVEMENT', tag_description: 'Indicates an improvement to an existing feature', color: '#0000ff'},
            {tag_name: 'Analysing', tag_description: 'An analyst should handle this task', color: '#eff493'},
            {tag_name: 'Testing', tag_description: 'A tester should handle this task', color: '#a8f493'},
            {tag_name: 'Developing', tag_description: 'A developer should handle this task', color: '#93f4f1'},
            {tag_name: 'SQL', tag_description: 'This task involves SQL', color: '#f78a9a'},
            {tag_name: 'C/C++', tag_description: 'This task involves C/C++', color: '#f870ef'},
            {tag_name: 'C#', tag_description: 'This task involves C#', color: '#8cd988'},
            {tag_name: 'Java', tag_description: 'This task involves Java', color: '#8aa9f7'},
            {tag_name: 'JavaScript', tag_description: 'This task involves JavaScript', color: '#e3f78a'},
            {tag_name: 'HTML/CSS', tag_description: 'This task involves HTML/CSS', color: '#fccd75'}
        ];

        // await Nom_Tags.bulkCreate(tags);    


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