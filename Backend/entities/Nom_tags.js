import db from '../dbConfig.js';
import Sequelize from 'sequelize';

const Nom_Tags = db.define('Nom_Tags', {
    tag_id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false
    },
    tag_name: {
        type: Sequelize.STRING,
        allowNull: false
    },
    tag_description: {
        type: Sequelize.TEXT,
        allowNull: true
    },
    color:{
        type: Sequelize.STRING,
        allowNull: true
    }
}, {
    timestamps: false
});

export default Nom_Tags;