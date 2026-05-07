import db from '../dbConfig.js';
import Sequelize from 'sequelize';

const User_Badges = db.define('User_Badges', {
    user_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        primaryKey: true,
        references: {
            model: 'Users',
            key: 'user_id'
        },
        onDelete: 'CASCADE'
    },
    badge_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        primaryKey: true,
        references: {
            model: 'Nom_Badges',
            key: 'badge_id'
        },
        onDelete: 'CASCADE',
    },
    date_earned: {
        type: Sequelize.DATE,
        defaultValue: Sequelize.NOW
    }
});

export default User_Badges;