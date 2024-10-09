import {pool} from "./database/connectionMySQL.js";
const getProfesional= async ()=>{
    try {
        const [result] = await pool.query("SELECT * FROM profesional;");
        console.table(result);
        console.log ("Todo listado correctamente")
    } catch (error) {
        console.log(error);
    }
};

getProfesional();