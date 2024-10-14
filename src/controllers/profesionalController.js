// src/controllers/profesionalController.js
const { pool } = require('../database/connectionMySQL'); // Ajusta la ruta a tu conexión MySQL

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
    res.render('profesionalView', { profesionales }); // Renderiza la vista y pasa los datos
};

module.exports = {
    renderProfesionales, // Exporta la función
};
