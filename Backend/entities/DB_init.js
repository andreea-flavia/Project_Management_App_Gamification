import mysql from 'mysql2/promise';
import env from 'dotenv';
import Users from './Users.js';

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

}

function DB_Init(){
    DB_Create();
    PK_Config();
}

export default DB_Init;