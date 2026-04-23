import db from '../dbConfig.js';
import Sequelize from 'sequelize';

const User_Stats = db.define('User_Stats', {
    stat_id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false
    },
    user_id:{
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
            model: 'Users',
            key: 'user_id'
        }
    },
    xp_points:{
        type: Sequelize.INTEGER,
        allowNull: false,
        defaultValue: 0
    },
    level:{
        type: Sequelize.INTEGER,
        allowNull: false,
        defaultValue: 1
    },
    w_coins:{
        type: Sequelize.INTEGER,
        allowNull: false,
        defaultValue: 0
    },
    total_xp_points:{
        type: Sequelize.INTEGER,
        allowNull: false,
        defaultValue: 0
    },
    xp_points_req: {
        type: Sequelize.INTEGER,
        allowNull: false,
        defaultValue: 100
    }
},{
    timestamps: true
});

export default User_Stats;