import Sequelize from 'sequelize';
import db from '../dbConfig.js';
// import PROJECT_ROLES from '../constants/project_roles.js';

const Project_Members = db.define('Project_Members', {
    pm_id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false
    },
    project_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
            model: 'Projects',
            key: 'project_id'
        },
        onDelete: 'CASCADE'
    },
    user_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
            model: 'Users',
            key: 'user_id'
        },
        onDelete: 'CASCADE'
    },
    role: {
        type: Sequelize.ENUM('OWNER', 'MEMBER', 'GUEST'),
        allowNull: false,
        defaultValue: 'MEMBER'//PROJECT_ROLES.MEMBER
    }
}, {
    timestamps: true
});

export default Project_Members;