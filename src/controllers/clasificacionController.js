const { pool } = require('../database/connectionMySQL'); 

const getClasificaciones = async () => {
    try {
        const [result] = await pool.query("SELECT * FROM clasificacion;");
        return result; 
    } catch (error) {
        console.error(error);
        return []; 
    }
};

const renderClasificaciones = async (req, res) => {
    const clasificaciones = await getClasificaciones();
    res.render('clasificacionViews/listarClasificaciones', { clasificaciones });
};

const addClasificacion = async (req, res) => {
    const { nombre_clasificacion } = req.body;
    try {
        await pool.query("INSERT INTO clasificacion (Nombre_Clasificacion, activo) VALUES (?, 1)", [nombre_clasificacion]);
        res.redirect('/clasificacion/inicio');
    } catch (error) {
        console.error(error);
        res.status(500).send("Error al agregar la clasificación");
    }
};

const editClasificacion = async (req, res) => {
    const { nombre_clasificacion } = req.body;
    const { ID_Clasificacion } = req.params;
    try {
        await pool.query("UPDATE clasificacion SET Nombre_Clasificacion = ? WHERE ID_Clasificacion = ?", [nombre_clasificacion, ID_Clasificacion]);
        res.redirect('/clasificacion/inicio');
    } catch (error) {
        console.error(error);
        res.status(500).send("Error al editar la clasificación");
    }
};

const deactivateClasificacion = async (req, res) => {
    const { ID_Clasificacion } = req.params;
    try {
        await pool.query("UPDATE clasificacion SET activo = 0 WHERE ID_Clasificacion = ?", [ID_Clasificacion]);
        res.redirect('/clasificacion/inicio');
    } catch (error) {
        console.error(error);
        res.status(500).send("Error al eliminar la clasificación");
    }
};

const getClasificacionById = async (ID_Clasificacion) => {
    try {
        const [result] = await pool.query("SELECT * FROM clasificacion WHERE ID_Clasificacion = ?", [ID_Clasificacion]);
        return result[0];
    } catch (error) {
        console.error(error);
        return null;
    }
};

const getClasificacionByIdController = async (req, res, next) => {
    const clasificacion = await getClasificacionById(req.params.ID_Clasificacion);
    req.clasificacion = clasificacion;
    next();
};

const getClasificacionByNombre = async (nombre) => {
    try {
        const [result] = await pool.query("SELECT * FROM clasificacion WHERE Nombre_Clasificacion = ?", [nombre]);
        return result[0];
    } catch (error) {
        console.error(error);
        return null;
    }
};

module.exports = {
    getClasificaciones,
    renderClasificaciones,
    addClasificacion,
    editClasificacion,
    deactivateClasificacion,
    getClasificacionByIdController,
    getClasificacionByNombre,
};
