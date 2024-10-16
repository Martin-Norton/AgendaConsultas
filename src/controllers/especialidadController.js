const { pool } = require('../database/connectionMySQL'); // Ajusta la ruta a tu conexión MySQL

// Obtener todas las especialidades activas
const getEspecialidades = async () => {
    try {
        const [result] = await pool.query("SELECT * FROM especialidad WHERE activo = 1;");
        return result; // Devuelve la lista de especialidades activas
    } catch (error) {
        console.error(error);
        return []; // Devuelve un array vacío en caso de error
    }
};

// Renderizar la vista con las especialidades
const renderEspecialidades = async (req, res) => {
    const especialidades = await getEspecialidades();
    res.render('especialidadViews/listarEspecialidades', { especialidades });
};

// Agregar una nueva especialidad
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

// Editar una especialidad
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

// Inactivar una especialidad (cambia el campo 'activo' a 0)
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

// Obtener especialidad por ID
const getEspecialidadById = async (ID_Especialidad) => {
    try {
        const [result] = await pool.query("SELECT * FROM especialidad WHERE ID_Especialidad = ?", [ID_Especialidad]);
        return result[0];
    } catch (error) {
        console.error(error);
        return null;
    }
};

// Controlador para obtener especialidad por ID y pasarla al siguiente middleware
const getEspecialidadByIdController = async (req, res, next) => {
    const especialidad = await getEspecialidadById(req.params.ID_Especialidad);
    req.especialidad = especialidad;
    next();
};

// Función para obtener especialidades por ID de profesional
const getEspecialidadesPorProfesional = async (req, res) => {
    const profesionalId = req.params.profesionalId;
    console.log("profesionalId: ", profesionalId);

    try {
        const especialidades = await pool.query(
            `SELECT e.ID_Especialidad, e.Nombre_especialidad 
            FROM especialidad e
            JOIN matricula m ON e.ID_Especialidad = m.ID_Especialidad
            WHERE m.ID_Profesional = 1 AND e.activo = 1`,
            [profesionalId]
        );
        console.log(especialidades);

        // Comprobar si se encontraron especialidades
        if (especialidades.length === 0) {
            return res.status(404).json({ error: 'No se encontraron especialidades' });
        }

        res.json(especialidades);
    } catch (error) {
        console.error(error);
        // Responder con un error JSON en caso de fallo
        res.status(500).json({ error: 'Error al obtener especialidades' });
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
};
