import db from '../dbConfig.js';
import Sequelize from 'sequelize';

const Nom_Badges = db.define('Nom_Badges', {
    badge_id: {
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
        allowNull: false
    },
    icon: {
        type: Sequelize.STRING,
        allowNull: true
    },
    requirement_type: {
        type: Sequelize.ENUM('TOTAL_TASKS', 'LEVEL', 'TAG_COUNT'),
        allowNull: false
    },
    requirement_value: {
        type: Sequelize.INTEGER,
        allowNull: false
    },
    target_tag: {
        type: Sequelize.STRING,
        allowNull: true //pt requirement_type='TAG_COUNT' (de ex 5 taskuri cu tagul 'bug')
    }
}, {
    timestamps: true
});

export default Nom_Badges;


