import db from '../dbConfig.js';
import Sequelize from 'sequelize';

const Users = db.define('Users', {
    user_id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false
    },
    user_first_name: {
        type: Sequelize.STRING,
        allowNull: false
    },

    user_last_name: {
        type: Sequelize.STRING,
        allowNull: false
    },
    user_mail:{
        type: Sequelize.STRING,
        allowNull: false,
        unique: true,
        validate:{
            isEmail: true,
            isCorrEmail(value){
                if(!value.endsWith('@rhodon.ro')){
                    throw new Error('Email must end with @rhodon.ro');
                }
            }
        }
    },
    user_password_hash:{
        type: Sequelize.STRING,
        allowNull: false
    },
    picture_url:{  //poza de profil
        type: Sequelize.STRING,
        allowNull: true
    },
    role_id:{       //denumires rolului (manager, angajat, administrator)
        type: Sequelize.INTEGER,
        allowNull: false
    },
    function:{     //denumirea postului ocupat de utilizator
        type: Sequelize.STRING,
        allowNull: false
    }
    // ,
    // xp_points:{
    //     type: Sequelize.INTEGER,
    //     allowNull: false,
    //     defaultValue: 0
    // },
    // level:{
    //     type: Sequelize.INTEGER,
    //     allowNull: false,
    //     defaultValue: 1
    // }
},{
    timestamps: true
});

export default Users;