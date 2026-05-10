import express from 'express';
import verifyRole from '../Middleware/verifyRole.js';
import { ROLES } from '../constants/roles.js';
import {
    getOverallStats,
    getProjectPortfolioHealth,
    getCFDData,
    getPriorityDistribution
} from '../dataAccess/analyticsDA.js';

const analyticsRouter = express.Router();

analyticsRouter.route('/analytics')
    .get(verifyRole(ROLES.ADMIN, ROLES.MANAGER), async (req, res) => {
        try {
            const days = parseInt(req.query.days) || 30;
            const stats = await getOverallStats();
            const portfolioHealth = await getProjectPortfolioHealth();
            const cfdData = await getCFDData(days);
            const priorityDist = await getPriorityDistribution();
            res.json({ stats, portfolioHealth, cfdData, priorityDist });
        } catch (error) {
            console.error('Analytics Error:', error);
            res.status(500).json({ error: 'Internal Server Error' });
        }
    });

export default analyticsRouter;