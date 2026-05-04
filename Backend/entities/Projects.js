import db from '../dbConfig.js';
import Sequelize from 'sequelize';

const Projects = db.define('Projects', {
    project_id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false
    },
    project_name: {
        type: Sequelize.STRING,
        allowNull: false
    },
    project_description: {
        type: Sequelize.TEXT,
        allowNull: true
    },

    start_date: {
        type: Sequelize.DATE,
        allowNull: false
    },
    end_date: {
        type: Sequelize.DATE,
        allowNull: true
    },

    status: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
            model: 'Nom_Statuses',
            key: 'status_id'
        }
    },
    priority: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
            model: 'Nom_Priorities',
            key: 'priority_id'
        }
    },
    is_inbox: {
        type: Sequelize.BOOLEAN,
        defaultValue: false,
        allowNull: false
    }
}, {
    timestamps: true
});

export default Projects;