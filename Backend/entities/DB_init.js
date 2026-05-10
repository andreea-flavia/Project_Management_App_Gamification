import mysql from 'mysql2/promise';
import env from 'dotenv';
import Users from './Users.js';
import Tasks from './Tasks.js';
import Projects from './Projects.js';
import Statuses from './Nom_status.js';
import Priorities from './Nom_priority.js';
import Nom_Tags from './Nom_tags.js';
import User_Stats from './User_Stats.js';
import AuditLog from './AuditLog.js';
import Project_Members from './Project_Members.js';
import Nom_Badges from "./Nom_Badges.js";
import Notifications from "./Notifications.js";

env.config();

function DB_Create() {
    let conn;
    conn = mysql.createConnection({
        user: process.env.DB_USERNAME,
        password: process.env.DB_PASSWORD
    })
        .then((connection) => {
            conn = connection;
            return conn.query(`CREATE DATABASE IF NOT EXISTS ${process.env.DB_DATABASE}`);
        })
        .then(() => {
            return conn.end();
        })
        .catch((error) => {
            console.warn(error.stack);
        })
}

function PK_Config() {
    //------------- 1-n -------------//
    Users.hasMany(Tasks, { foreignKey: 'assigned_to' });
    Tasks.belongsTo(Users, { foreignKey: 'assigned_to' });

    Projects.hasMany(Tasks, { foreignKey: 'project_id' });
    Tasks.belongsTo(Projects, { foreignKey: 'project_id' });


    Statuses.hasMany(Tasks, { foreignKey: 'status' });
    Tasks.belongsTo(Statuses, { foreignKey: 'status' });

    Priorities.hasMany(Tasks, { foreignKey: 'priority' });
    Tasks.belongsTo(Priorities, { foreignKey: 'priority' });

    Statuses.hasMany(Projects, { foreignKey: 'status' });
    Projects.belongsTo(Statuses, { foreignKey: 'status' });

    Priorities.hasMany(Projects, { foreignKey: 'priority' });
    Projects.belongsTo(Priorities, { foreignKey: 'priority' });

    Users.hasMany(AuditLog, { foreignKey: 'user_id' });
    AuditLog.belongsTo(Users, { foreignKey: 'user_id' });

    Users.hasMany(Notifications, { foreignKey: 'user_id' });
    Notifications.belongsTo(Users, { foreignKey: 'user_id' });


    //------------- n-n -------------//
    Tasks.belongsToMany(Nom_Tags, { through: 'Tasks_Tags', foreignKey: 'task_id', as: 'tags' });
    Nom_Tags.belongsToMany(Tasks, { through: 'Tasks_Tags', foreignKey: 'tag_id', as: 'tasks' });

    Projects.belongsToMany(Users, { through: Project_Members, foreignKey: 'project_id', as: 'members' });
    Users.belongsToMany(Projects, { through: Project_Members, foreignKey: 'user_id', as: 'projects' });

    Users.belongsToMany(Nom_Badges, { through: 'User_Badges', foreignKey: 'user_id', as: 'badges' });
    Nom_Badges.belongsToMany(Users, { through: 'User_Badges', foreignKey: 'badge_id', as: 'owners' });

    // ------------- 1-1 -------------//
    Users.hasOne(User_Stats, { foreignKey: 'user_id' });
    User_Stats.belongsTo(Users, { foreignKey: 'user_id' });


}

function DB_Init() {
    DB_Create();
    PK_Config();
}

export default DB_Init;