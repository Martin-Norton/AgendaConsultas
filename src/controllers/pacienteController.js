const { pool } = require('../database/connectionMySQL');

const getPaciente = async () => {
    try {
        const [result] = await pool.query("SELECT * FROM paciente WHERE activo = 1;");
        return result;
    } catch (error) {
        console.error(error);
        return [];
    }
};

const renderPacientes = async (req, res) => {
    const pacientes = await getPaciente();
    res.render('pacienteViews/listarPacientes', { pacientes });
};


const addPaciente = async (req, res) => {
    const { nombre, apellido, dni, obraSocial, telefono, email } = req.body;
    try {
        await pool.query("INSERT INTO paciente (Nombre_Paciente, Apellido_Paciente, Dni_Paciente, Obra_Social, Telefono, Email) VALUES (?, ?, ?, ?, ?, ?)", [nombre, apellido, dni, obraSocial, telefono, email]);
        res.redirect('/paciente/inicio');
    } catch (error) {
        console.error(error);
        res.status(500).send("Error al agregar el paciente");
    }
};

const editPaciente = async (req, res) => {
    const { nombre, apellido, dni, obraSocial, telefono, email } = req.body;
    const { ID_Paciente } = req.params;
    
    try {
        await pool.query("UPDATE paciente SET Nombre_Paciente = ?, Apellido_Paciente = ?, Dni_Paciente = ?, Obra_Social = ?, Telefono = ?, Email = ? WHERE ID_Paciente = ?", [nombre, apellido, dni, obraSocial, telefono, email, ID_Paciente]);
        res.redirect('/paciente/inicio');
    } catch (error) {
        console.error(error);
        res.status(500).send("Error al editar el paciente");
    }
};
const getPacienteByDni = async (dni) => {
    try {
        const [result] = await pool.query("SELECT * FROM paciente WHERE Dni_Paciente = ? AND Activo = 1", [dni]);
        return result[0];
    } catch (error) {
        console.error(error);
        return null;
    }
};
const getPacienteByEmail = async(email) =>{
    try {
        const result = await pool.query("SELECT * FROM paciente WHERE Email = ? AND Activo = 1", [email]);
        return result;
    } catch (error) {
        console.error(error);
        return null;
    }
}
const buscarPacientePorDni = async (Dni_Paciente) => {
    console.log("Dni_Paciente:", Dni_Paciente);
    try {
        const paciente = await getPacienteByDni(Dni_Paciente);
        return paciente;
    } catch (error) {
        console.error("Error retrieving patient:", error);
        throw error;
    }
};
const buscarPacientePorEmail = async (Email) => {
    console.log("email con el que se busca el paciente en la tabla" ,Email)
    try {
        const paciente = await getPacienteByEmail(Email);
        console.log("paciente: desde aciente controller en buscarPacientePorEmail:", paciente);
        return paciente; 
    } catch (error) {
        console.error("Error retrieving patient:", error);
        throw error;
    }
}

const removePaciente = async (req, res) => {
    const { ID_Paciente } = req.params;
    try {
        await pool.query("UPDATE paciente SET activo = 0 WHERE ID_Paciente = ?", [ID_Paciente]);
        res.redirect('/paciente/inicio');
    } catch (error) {
        console.error(error);
        res.status(500).send("Error al eliminar el paciente");
    }
};

const getPacienteById = async (ID_Paciente) => {
    try {
        const [result] = await pool.query("SELECT * FROM paciente WHERE ID_Paciente = ?", [ID_Paciente]);
        return result[0];
    } catch (error) {
        console.error(error);
        return null;
    }
};

const getPacienteByIdController = async (req, res, next) => {
    const paciente = await getPacienteById(req.params.ID_Paciente);
    req.paciente = paciente;
    next();
};

module.exports = {
    getPaciente,
    renderPacientes,
    addPaciente,
    editPaciente,
    removePaciente,
    getPacienteByIdController,
    buscarPacientePorDni,
    buscarPacientePorEmail,
};
