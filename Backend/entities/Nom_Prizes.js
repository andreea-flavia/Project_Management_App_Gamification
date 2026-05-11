import Sequelize from 'sequelize';
import db from '../dbConfig.js';

const Nom_Prizes = db.define('Nom_Prizes', {
    prize_id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    name: {
        type: Sequelize.STRING,
        allowNull: false
    },
    description: {
        type: Sequelize.TEXT,
        allowNull: true
    },
    cost: {
        type: Sequelize.INTEGER,
        allowNull: false,
        defaultValue: 0
    },
    icon: {
        type: Sequelize.STRING,
        allowNull: true,
        defaultValue: 'redeem'
    },
    type: {
        type: Sequelize.ENUM('VOUCHER', 'BOOSTER', 'STYLE'),
        defaultValue: 'VOUCHER'
    }
});

export default Nom_Prizes;
