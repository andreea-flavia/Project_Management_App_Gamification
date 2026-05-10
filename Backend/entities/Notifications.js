import db from '../dbConfig.js';
import Sequelize from 'sequelize';

const Notifications = db.define('Notifications', {
    notification_id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    user_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
            model: 'Users',
            key: 'user_id'
        }
    },
    title: {
        type: Sequelize.STRING,
        allowNull: false
    },
    message: {
        type: Sequelize.TEXT,
        allowNull: false
    },
    type: {
        type: Sequelize.ENUM('TASK_ASSIGNED', 'TASK_UPDATED', 'BADGE_EARNED', 'PROJECT_UPDATED', 'SYSTEM'),
        defaultValue: 'SYSTEM'
    },
    is_read: {
        type: Sequelize.BOOLEAN,
        defaultValue: false
    }
}, {
    timestamps: true
});
export default Notifications;