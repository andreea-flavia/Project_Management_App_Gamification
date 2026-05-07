import express from 'express';
import verifyRole from '../Middleware/verifyRole.js';
import { ROLES } from '../constants/roles.js';

import {
    createBadge,
    getAllBadges,
    updateBadge,
    deleteBadge,
    getUserBadges,
    awardBadgeToUser,
    getBadgesByType
} from '../dataAccess/Nom_BadgesDA.js';

let badgesRouter = express.Router();

badgesRouter.route('/all-badges')
    .get(async (req, res) => {
        try {
            const bgs = await getAllBadges();
            return res.json(bgs);
        } catch (error) {
            console.error(error);
            return res.status(500).json({ error: 'Error getting badges' });
        }
    })
    .post(verifyRole(ROLES.ADMIN, ROLES.MANAGER), async (req, res) => {
        try {
            const new_bg = await createBadge(req.body);
            return res.status(201).json(new_bg);
        } catch (error) {
            return res.status(400).json({ error: error.message });
        }
    })


badgesRouter.route('/all-badges/:type')
    .get(async (req, res) => {
        try {
            const bgs = await getBadgesByType(req.params.type);
            return res.json(bgs);
        } catch (error) {
            console.error(error);
            return res.status(500).json({ error: 'Error getting badges' });
        }
    })

export default badgesRouter;