import db from '../dbConfig.js';
import Sequelize from 'sequelize';

const AuditLog = db.define('Audit_Log', {
    log_id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false
    },
    action:{
        type: Sequelize.ENUM('CREATE', 'UPDATE', 'DELETE','UPLOAD_FILE'),
        allowNull: false
    },
    entity_type:{
        type: Sequelize.ENUM('User', 'Project', 'Task', 'Comment','File'),
        allowNull: false
    },
    entity_id:{
        type: Sequelize.INTEGER,
        allowNull: false
    },
    user_id : {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
            model: 'Users',
            key: 'user_id'
        },
    },
    details: {
        type: Sequelize.TEXT,
        allowNull: true
    }
}, {
    timestamps: true,
    updatedAt: false,
    indexes: [
        { fields: ['entity_id'] },
        { fields: ['user_id'] }
    ]
});

export default AuditLog;