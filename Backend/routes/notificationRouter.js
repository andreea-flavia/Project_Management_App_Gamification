import express from 'express';
import { createNotification, getNotificationsByUser, markAsRead } from '../dataAccess/notificationsDA.js';

const notificationsRouter = express.Router();

notificationsRouter.get('/notifications/:userId', async (req, res) => {
    try {
        const notifs = await getNotificationsByUser(req.params.userId);
        res.json(notifs);
    } catch (e) {
        res.status(500).json({ error: e.message });
    }
});

notificationsRouter.put('/notifications/read/:id', async (req, res) => {
    try {
        await markAsRead(req.params.id);
        res.json({ success: true });
    } catch (e) {
        res.status(500).json({ error: e.message });
    }
});

export default notificationsRouter;
