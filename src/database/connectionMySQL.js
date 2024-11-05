/*const mysql = require('mysql2/promise');
const pool = mysql.createPool({
    host: "localhost",
    port: 3306,
    database: "agenda_consultorio",
    user: "root",
    password: ""
});

module.exports = { pool };
*/

require('dotenv').config();
const mysql = require('mysql2/promise');

const pool = mysql.createPool({
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    database: process.env.DB_DATABASE,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    waitForConnections: true,
    connectionLimit: 10, 
    queueLimit: 0
});

async function testConnection() {
    try {
        const connection = await pool.getConnection();
        console.log('Conexión a la base de datos exitosa.');
        connection.release();
    } catch (error) {
        console.error('Error al conectar con la base de datos:', error);
    }
}

testConnection();

module.exports = { pool };