import db from '../dbConfig.js';
import Sequelize from 'sequelize';

const Tasks = db.define('Tasks', {
    task_id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false
    },
    task_title:{
        type: Sequelize.STRING,
        allowNull: false
    },
    task_description:{
        type: Sequelize.TEXT,
        allowNull: true
    },

    start_date:{
        type: Sequelize.DATE,
        allowNull: false
    },
    end_date:{
        type: Sequelize.DATE,
        allowNull: false
    },

    status:{
        type: Sequelize.INTEGER,
        allowNull: false,
        references:{
            model: 'Nom_Statuses',
            key: 'status_id'
        }
    },
    priority:{
        type: Sequelize.INTEGER,
        allowNull: false,
        references:{
            model: 'Nom_Priorities',
            key: 'priority_id'
        }
    },

    assigned_to:{
        type: Sequelize.INTEGER,
        allowNull: true,
        references: {
            model: 'Users',
            key: 'user_id'
        }
    },

    project_id:{
        type: Sequelize.INTEGER,
        allowNull: true,
        references: {
            model: 'Projects',
            key: 'project_id'
        }
    },

    xp_points:{
        type: Sequelize.INTEGER,
        allowNull: false,
        defaultValue: 0
    }
},{
    timestamps: true
});

export default Tasks;