import express from 'express';
import {
    createUserStats,
    getUserStatsByUserId,
    updateUserStats,
    deleteUserStats
} from '../dataAccess/User_StatsDA.js';

let user_statsRouter = express.Router();

user_statsRouter.route('/user_stats/:user_id')
    .get(async (req, res) => {
        try {
            const userStats = await getUserStatsByUserId(req.params.user_id);
            if (userStats) return res.json(userStats);
            return res.status(404).json({ error: 'Stats not found' });
        } catch (error) {
            return res.status(500).json({ error: error.message });
        }
    })
    .post(async(req, res) => {
        try{
            const stats = await createUserStats(req.body);
            return res.status(201).json(stats);
        } catch (error){
            return  res.status(400).json({error: error.message});
        }
    })
    .put(async(req, res) => {
        const updated = await updateUserStats(req.params.stats_id, req.body);
        if(updated) return res.json(updated);
        return res.status(404).json({error: 'User stats not found'});
    })
    .delete(async(req, res) => {
        const deleted = await deleteUserStats(req.params.stats_id);
        if(deleted) return res.json(deleted);
        return res.status(404).json({error: 'User stats not found'});
    });


export default user_statsRouter;