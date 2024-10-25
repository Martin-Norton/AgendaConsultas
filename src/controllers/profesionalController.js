
const { pool } = require('../database/connectionMySQL'); 


const getProfesional = async () => {
    try {
        const [result] = await pool.query("SELECT * FROM profesional WHERE activo = 1;");
        return result; 
    } catch (error) {
        console.error(error);
        return []; 
    }
};


const renderProfesionales = async (req, res) => {
    const profesionales = await getProfesional(); 
    res.render('profesionalViews/listarProfesionales', { profesionales }); 
};


const addProfesional = async (req, res) => {
    const { nombre, apellido, telefono, email} = req.body;
    try {
        await pool.query("INSERT INTO profesional (Nombre_Profesional, Apellido_Profesional, Telefono, Email) VALUES (?, ?, ?, ?)", [nombre, apellido, telefono, email]);
        res.redirect('/profesional'); 
    } catch (error) {
        console.error(error);
        res.status(500).send("Error al agregar el profesional");
    }
};


const editProfesional = async (req, res) => {
    const { nombre, apellido, telefono, email } = req.body;
    const { ID_Profesional } = req.params;
    
    try {
        console.log(ID_Profesional);
        await pool.query("UPDATE profesional SET Nombre_Profesional = ?, Apellido_Profesional = ?, Telefono = ?, Email = ? WHERE ID_Profesional = ?", [nombre, apellido, telefono, email, ID_Profesional]);
        res.redirect('/profesional'); 
    } catch (error) {
        console.error(error);
        res.status(500).send("Error al editar el profesional");
    }
};


const removeProfesional = async (req, res) => {
    const { ID_Profesional } = req.params;
    try {
        await pool.query("UPDATE profesional SET activo = 0 WHERE ID_Profesional = ?", [ID_Profesional]);
        res.redirect('/profesional');
    } catch (error) {
        console.error(error);
        res.status(500).send("Error al eliminar el profesional");
    }
};

const getProfesionalById= async (ID_Profesional) => {
    try {
        const [result] = await pool.query("SELECT * FROM profesional WHERE ID_Profesional= ?", [ID_Profesional]);
        return result[0]; 
    } catch (error) {
        console.error(error);
        return null; 
    }
};


const getProfesionalByIdController = async (req, res, next) => {
    const profesional = await getProfesionalById(req.params.ID_Profesional);
    req.professional = profesional; 
    next(); 
};

module.exports = {
    getProfesional,
    renderProfesionales,
    addProfesional,
    editProfesional,
    removeProfesional,
    getProfesionalByIdController, 
};

