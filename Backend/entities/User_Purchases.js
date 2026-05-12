import Sequelize from 'sequelize';
import db from '../dbConfig.js';

const User_Purchases = db.define('User_Purchases', {
    purchase_id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    user_id: {
        type: Sequelize.INTEGER,
        allowNull: false
    },
    prize_id: {
        type: Sequelize.INTEGER,
        allowNull: false
    },
    status: {
        type: Sequelize.ENUM('ACTIVE', 'USED', 'EXPIRED'),
        defaultValue: 'ACTIVE'
    },
    uses_left: {
        type: Sequelize.INTEGER,
        allowNull: true
    },
    expiry_date: {
        type: Sequelize.DATE,
        allowNull: true
    },
    redemption_code: {
        type: Sequelize.STRING,
        allowNull: true
    }
});

export default User_Purchases;
