import Notifications from '../entities/Notifications.js';
async function createNotification(userId, title, message, type) {
    return await Notifications.create({
        user_id: userId,
        title,
        message,
        type
    });
}

async function getNotificationsByUser(userId) {
    return await Notifications.findAll({
        where: { user_id: userId },
        order: [['createdAt', 'DESC']],
        limit: 20
    });
}

async function markAsRead(notificationId) {
    const notification = await Notifications.findByPk(notificationId);
    if (notification) {
        return await notification.update({ is_read: true });
    }
    return null;
}

export { createNotification, getNotificationsByUser, markAsRead };
