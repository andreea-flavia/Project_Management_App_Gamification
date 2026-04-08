import mysql from 'mysql2/promise';
import env from 'dotenv';
import Users from './Users.js';
import Tasks from './Tasks.js';
import Projects from './Projects.js';
import Statuses from './Nom_status.js';
import Priorities from './Nom_priority.js';

env.config();

function DB_Create(){
    let conn;
    conn = mysql.createConnection({
        user: process.env.DB_USERNAME,
        password: process.env.DB_PASSWORD
    })
    .then( (connection) => {
        conn = connection;
        return conn.query(`CREATE DATABASE IF NOT EXISTS ${process.env.DB_DATABASE}`);
    })
    .then(() => {
        return conn.end();
    })
    .catch( (error) => {
        console.warn(error.stack);
    })
}

function PK_Config(){
//------------- 1-n -------------//
    Users.hasMany(Tasks, {foreignKey: 'assigned_to'});
    Tasks.belongsTo(Users, {foreignKey: 'assigned_to'});

    Projects.hasMany(Tasks, {foreignKey: 'project_id'});
    Tasks.belongsTo(Projects, {foreignKey: 'project_id'});

    Statuses.hasMany(Tasks, {foreignKey: 'status'});
    Tasks.belongsTo(Statuses, {foreignKey: 'status'});

    Priorities.hasMany(Tasks, {foreignKey: 'priority'});
    Tasks.belongsTo(Priorities, {foreignKey: 'priority'});
    
    Statuses.hasMany(Projects, {foreignKey: 'status'});
    Projects.belongsTo(Statuses, {foreignKey: 'status'});

    Priorities.hasMany(Projects, {foreignKey: 'priority'});
    Projects.belongsTo(Priorities, {foreignKey: 'priority'});

}

function DB_Init(){
    DB_Create();
    PK_Config();
}

export default DB_Init;