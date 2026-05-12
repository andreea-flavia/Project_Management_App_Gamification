import express from 'express';
import { getDashboardData } from '../dataAccess/DashboardDA.js';

const dashboardRouter = express.Router();

dashboardRouter.get('/dashboard/:id', async (req, res) => {
    try {
        const userId = parseInt(req.params.id);
        const data = await getDashboardData(userId);
        res.status(200).json(data);
    } catch (error) {
        console.error("Error on /dashboard:", error);
        res.status(500).json({ error: "Eroare la aducerea datelor de dashboard" });
    }
});

export default dashboardRouter;
