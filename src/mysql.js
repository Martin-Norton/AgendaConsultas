const { pool } = require('./database/connectionMySQL');

const getProfesional = async () => {
    try {
        const [result] = await pool.query("SELECT * FROM profesional;");
        console.table(result);
        console.log("Todo listado correctamente");
        return result;
    } catch (error) {
        console.log(error);
        return [];
    }
};
const getMatricula = async () => {
    try {
        const [result] = await pool.query("SELECT * FROM matricula;");
        console.table(result);
        console.log("Matrículas listadas correctamente");
    } catch (error) {
        console.log(error);
    }
};

const getEspecialidad = async () => {
    try {
        const [result] = await pool.query("SELECT * FROM especialidad;");
        console.table(result);
        console.log("Especialidades listadas correctamente");
    } catch (error) {
        console.log(error);
    }
};

const addProfesional = async (nombre, apellido, telefono, email) => {
    try {
        const query = `
            INSERT INTO Profesional (Nombre_Profesional, Apellido_Profesional, Telefono, Email) 
            VALUES (?, ?, ?, ?);
        `;
        const [result] = await pool.query(query, [nombre, apellido, telefono, email]);
        console.log("Profesional agregado correctamente:", result);
    } catch (error) {
        console.log(error);
    }
};

const addEspecialidad = async (nombreEspecialidad) => {
    try {
        const query = "INSERT INTO Especialidad (nombre_especialidad) VALUES (?);";
        const [result] = await pool.query(query, [nombreEspecialidad]);
        console.log("Especialidad agregada correctamente:", result);
    } catch (error) {
        console.log(error);
    }
};

const addMatricula = async (id_profesional, id_especialidad, numeroMatricula) => {
    try {
        const query = "INSERT INTO Matricula (id_profesional, id_especialidad, numero_matricula) VALUES (?, ?, ?);";
        const [result] = await pool.query(query, [id_profesional, id_especialidad, numeroMatricula]);
        console.log("Matrícula agregada correctamente:", result);
    } catch (error) {
        console.log(error);
    }
};


(async () => {
    await getProfesional();
    await getEspecialidad();
    await getMatricula();
})();
