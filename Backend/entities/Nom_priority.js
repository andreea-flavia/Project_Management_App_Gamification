import db from '../dbConfig.js';
import Sequelize from 'sequelize';

const Priorities = db.define('Nom_Priorities', {
    priority_id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false
    },
    priority_name: {
        type: Sequelize.STRING,
        allowNull: false
    },
    priority_description: {
        type: Sequelize.TEXT,
        allowNull: true
    },
    priority_type:{ //Categoria prioritatii (PROIECT, TASK)
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

export default Priorities;