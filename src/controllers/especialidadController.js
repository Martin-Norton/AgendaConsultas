const { pool } = require('../database/connectionMySQL'); 
const getEspecialidades = async () => {
    try {
        const [result] = await pool.query("SELECT * FROM especialidad WHERE activo = 1;");
        return result; 
    } catch (error) {
        console.error(error);
        return []; 
    }
};

// const getEspecialidadById = async () => {}

const renderEspecialidades = async (req, res) => {
    const especialidades = await getEspecialidades();
    res.render('especialidadViews/listarEspecialidades', { especialidades });
};

const addEspecialidad = async (req, res) => {
    const { nombre_especialidad } = req.body;
    try {
        await pool.query("INSERT INTO especialidad (Nombre_especialidad, activo) VALUES (?, 1)", [nombre_especialidad]);
        res.redirect('/especialidad');
    } catch (error) {
        console.error(error);
        res.status(500).send("Error al agregar la especialidad");
    }
};

const editEspecialidad = async (req, res) => {
    const { nombre_especialidad } = req.body;
    const { ID_Especialidad } = req.params;
    try {
        await pool.query("UPDATE especialidad SET Nombre_especialidad = ? WHERE ID_Especialidad = ?", [nombre_especialidad, ID_Especialidad]);
        res.redirect('/especialidad');
    } catch (error) {
        console.error(error);
        res.status(500).send("Error al editar la especialidad");
    }
};


const deactivateEspecialidad = async (req, res) => {
    const { ID_Especialidad } = req.params;
    try {
        await pool.query("UPDATE especialidad SET activo = 0 WHERE ID_Especialidad = ?", [ID_Especialidad]);
        res.redirect('/especialidad');
    } catch (error) {
        console.error(error);
        res.status(500).send("Error al eliminar la especialidad");
    }
};


const getEspecialidadById = async (ID_Especialidad) => {
    try {
        const [result] = await pool.query("SELECT * FROM especialidad WHERE ID_Especialidad = ?", [ID_Especialidad]);
        return result[0];
    } catch (error) {
        console.error(error);
        return null;
    }
};


const getEspecialidadByIdController = async (req, res, next) => {
    const especialidad = await getEspecialidadById(req.params.ID_Especialidad);
    req.especialidad = especialidad;
    next();
};


const getEspecialidadesPorProfesional = async (req, res) => {
    const { profesionalId } = req.params;

    try {
        const [especialidades] = await pool.query(`
            SELECT e.ID_Especialidad, e.Nombre_Especialidad 
            FROM matricula m 
            INNER JOIN especialidad e ON m.ID_Especialidad = e.ID_Especialidad 
            WHERE m.ID_Profesional = ? AND m.Activo = 1
        `, [profesionalId]);

        res.json(especialidades);
    } catch (error) {
        console.error('Error al obtener especialidades:', error);
        res.status(500).json({ message: 'Error al obtener especialidades' });
    }
};


module.exports = {
    getEspecialidades,
    renderEspecialidades,
    addEspecialidad,
    editEspecialidad,
    deactivateEspecialidad,
    getEspecialidadByIdController,
    getEspecialidadesPorProfesional,
    getEspecialidadById,
};
