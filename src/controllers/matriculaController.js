
const { pool } = require('../database/connectionMySQL');
const { getProfesional } = require('./profesionalController');



const getEspecialidades = async () => {
    try {
        const [result] = await pool.query("SELECT * FROM especialidad WHERE Activo = 1;");
        return result;
    } catch (error) {
        console.error(error);
        return [];
    }
};


const getMatriculas = async () => {
    try {
        const [result] = await pool.query("SELECT * FROM matricula;");
        return result;
    } catch (error) {
        console.error(error);
        return [];
    }
};


const renderAgregarMatricula = async (req, res) => {
    try {
        const profesionales = await getProfesional();
        const especialidades = await getEspecialidades();
        res.render('matriculaViews/agregarMatricula', { profesionales, especialidades });
    } catch (error) {
        console.error(error);
        res.status(500).send("Error al cargar la vista de agregar matrícula");
    }
};


const addMatricula = async (req, res) => {
    const { ID_Profesional, ID_Especialidad, Numero_Matricula } = req.body;

    
    const [exists] = await pool.query("SELECT * FROM matricula WHERE Numero_Matricula = ?", [Numero_Matricula]);
    if (exists.length > 0) {
        return res.status(400).send("El número de matrícula ya está en uso.");
    }

    try {
        await pool.query("INSERT INTO matricula (ID_Profesional, ID_Especialidad, Numero_Matricula, activo) VALUES (?, ?, ?, 1)", [ID_Profesional, ID_Especialidad, Numero_Matricula]);
        res.redirect('/matricula');
    } catch (error) {
        console.error(error);
        res.status(500).send("Error al agregar la matrícula");
    }
};


const bajaMatricula = async (req, res) => {
    const { ID_Matricula } = req.params;
    try {
        await pool.query("UPDATE matricula SET activo = 0 WHERE ID_Matricula = ?", [ID_Matricula]);
        res.redirect('/matricula');
    } catch (error) {
        console.error(error);
        res.status(500).send("Error al dar de baja la matrícula");
    }
};

const getMatriculasAll = async (profesionalId, especialidadId) => {
    let query = `
        SELECT m.Numero_Matricula, m.activo, p.Nombre_Profesional, p.Apellido_Profesional, e.Nombre_Especialidad
        FROM matricula m
        INNER JOIN profesional p ON m.ID_Profesional = p.ID_Profesional
        INNER JOIN especialidad e ON m.ID_Especialidad = e.ID_Especialidad
        WHERE m.activo = 1
    `;
    
    const params = [];

    
    if (profesionalId) {
        query += ` AND p.ID_Profesional = ?`;
        params.push(profesionalId);
    }
    
    if (especialidadId) {
        query += ` AND e.ID_Especialidad = ?`;
        params.push(especialidadId);
    }

    try {
        const [result] = await pool.query(query, params);
        return result;
    } catch (error) {
        console.error(error);
        return [];
    }
};


const renderMatriculas = async (req, res) => {
    const { profesionalId, especialidadId } = req.query; 
    const matriculas = await getMatriculasAll(profesionalId, especialidadId); 

    
    const [profesionales] = await pool.query("SELECT ID_Profesional, Nombre_Profesional, Apellido_Profesional FROM profesional;");
    const [especialidades] = await pool.query("SELECT ID_Especialidad, Nombre_Especialidad FROM especialidad WHERE Activo = 1;");
    
    res.render('matriculaViews/listarMatriculas', {
        matriculas,
        profesionales,
        especialidades,
        profesionalId,
        especialidadId
    });
};

module.exports = {
    getMatriculas,
    renderMatriculas,
    renderAgregarMatricula,
    addMatricula,
    bajaMatricula,
};
