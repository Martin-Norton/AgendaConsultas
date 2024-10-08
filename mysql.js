import {pool} from "./database/connectionMySQL.js";
const getProfesionales=()=>{
    try {
        const result = pool.query('SELECT * FROM profesionales');
        return result;
    } catch (error) {
        console.log(error);
    }
};