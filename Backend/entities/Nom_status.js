import db from '../dbConfig.js';
import Sequelize from 'sequelize';

const Statuses = db.define('Nom_Statuses', {
    status_id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false
    },
    status_name: {
        type: Sequelize.STRING,
        allowNull: false
    },
    status_description: {
        type: Sequelize.TEXT,
        allowNull: true
    },
    status_type:{ //Categoria statusului (PROIECT, TASK)
        type: Sequelize.STRING,
        allowNull: false
    },
    color:{
        type: Sequelize.STRING,
        allowNull: true
    }
}, {
    timestamps: false
});

export default Statuses;