const mysql = require('mysql2/promise');
const pool = mysql.createPool({
    host: "localhost",
    port: 3307,
    database: "agenda_consultorio",
    user: "root",
    password: ""
});

module.exports = { pool };
