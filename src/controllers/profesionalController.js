// controlador.js
const { pool } = require('./database/connectionMySQL'); // Cambia a require

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
    res.render('profesionales', { profesionales }); // Renderiza la vista y pasa los datos
};

module.exports = {
    renderProfesionales, // Exporta la función
};

