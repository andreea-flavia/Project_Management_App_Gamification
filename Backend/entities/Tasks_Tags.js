import db from '../dbConfig.js';
import Sequelize from 'sequelize';

const Tasks_Tags = db.define('Tasks_Tags', {
    tag_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        primaryKey: true,
        references: {
            model: 'Nom_Tags',
            key: 'tag_id'
        },
        onDelete: 'CASCADE'
    },
    task_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        primaryKey: true,
        references: {
            model: 'Tasks',
            key: 'task_id'
        },
        onDelete: 'CASCADE',
    }
}, {
    timestamps: false
});

export default Tasks_Tags;