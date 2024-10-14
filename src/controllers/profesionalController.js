// src/controllers/profesionalController.js
const { pool } = require('../database/connectionMySQL'); // Ajusta la ruta a tu conexión MySQL

// Obtiene todos los profesionales
const getProfesional = async () => {
    try {
        const [result] = await pool.query("SELECT * FROM profesional;");
        return result; // Devuelve la lista de profesionales
    } catch (error) {
        console.error(error);
        return []; // Devuelve un array vacío en caso de error
    }
};

// Controlador para renderizar la vista con los profesionales
const renderProfesionales = async (req, res) => {
    const profesionales = await getProfesional(); // Obtiene los profesionales
    res.render('profesionalViews/listarProfesionales', { profesionales }); // Renderiza la vista y pasa los datos
};

// Agregar un nuevo profesional
const addProfesional = async (req, res) => {
    const { nombre, apellido, telefono, email, matricula, especialidad } = req.body;
    try {
        await pool.query("INSERT INTO profesional (Nombre_Profesional, Apellido_Profesional, Telefono, Email) VALUES (?, ?, ?, ?)", [nombre, apellido, telefono, email]);
        res.redirect('/profesional'); // Redirige a la lista de profesionales
    } catch (error) {
        console.error(error);
        res.status(500).send("Error al agregar el profesional");
    }
};

// Editar un profesional
const editProfesional = async (req, res) => {
    const { nombre, apellido, telefono, email, matricula, especialidad } = req.body;
    const { id } = req.params;
    try {
        await pool.query("UPDATE profesional SET Nombre_Profesional = ?, Apellido_Profesional = ?, Telefono = ?, Email = ?, Matricula = ?, Especialidad = ? WHERE id = ?", [nombre, apellido, telefono, email, matricula, especialidad, id]);
        res.redirect('/profesionales'); // Redirige a la lista de profesionales
    } catch (error) {
        console.error(error);
        res.status(500).send("Error al editar el profesional");
    }
};

// Eliminar un profesional
const removeProfesional = async (req, res) => {
    const { id } = req.params;
    try {
        await pool.query("DELETE FROM profesional WHERE id = ?", [id]);
        res.redirect('/profesionales'); // Redirige a la lista de profesionales
    } catch (error) {
        console.error(error);
        res.status(500).send("Error al eliminar el profesional");
    }
};

const getProfesionalById = async (id) => {
    try {
        const [result] = await pool.query("SELECT * FROM profesional WHERE id = ?", [id]);
        return result[0]; // Devuelve el profesional encontrado
    } catch (error) {
        console.error(error);
        return null; // Devuelve null en caso de error
    }
};

// Controlador para obtener un profesional por ID
const getProfesionalByIdController = async (req, res, next) => {
    const profesional = await getProfesionalById(req.params.id);
    req.professional = profesional; // Agrega el profesional a la solicitud
    next(); // Continúa al siguiente middleware
};

module.exports = {
    renderProfesionales,
    addProfesional,
    editProfesional,
    removeProfesional,
    getProfesionalByIdController, // Exporta el controlador
};

