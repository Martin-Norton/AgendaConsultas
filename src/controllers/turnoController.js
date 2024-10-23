const { pool } = require('../database/connectionMySQL'); // Ajusta la ruta a tu conexión MySQL

// Obtener todos los turnos disponibles y activos
const getTurnosDisponibles = async (filtros) => {
    const { especialidad, profesional, fechaInicio, fechaFin, horario } = filtros;
    let query = `SELECT * FROM turno WHERE Activo = 1 AND Estado = 'Disponible'`;
    const params = [];

    if (especialidad) {
        query += ` AND ID_Especialidad = ?`;
        params.push(especialidad);
    }

    if (profesional) {
        query += ` AND ID_Profesional = ?`;
        params.push(profesional);
    }

    if (fechaInicio && fechaFin) {
        query += ` AND Fecha_Turno BETWEEN ? AND ?`;
        params.push(fechaInicio, fechaFin);
    }

    if (horario) {
        query += ` AND Hora_Inicio_Turno LIKE ?`;
        params.push(`${horario}%`);
    }

    try {
        const [result] = await pool.query(query, params);
        return result; // Devuelve la lista de turnos disponibles
    } catch (error) {
        console.error(error);
        return []; // Devuelve un array vacío en caso de error
    }
};

// Renderizar la vista con los turnos
const renderTurnos = async (req, res) => {
    const filtros = req.body; // Obtiene los filtros del formulario
    const turnos = await getTurnosDisponibles(filtros);
    res.render('turnoViews/listarTurnos', { turnos });
};

// Editar un turno (reservarlo)
const editTurno = async (req, res) => {
    const { ID_Turno } = req.params;
    const { Nombre_Paciente, Dni_Paciente, Motivo_Consulta, Obra_Social, Clasificacion, Email_Paciente } = req.body;
    try {
        await pool.query(
            "UPDATE turno SET Nombre_Paciente = ?, Dni_Paciente = ?, Motivo_Consulta = ?, Obra_Social = ?, Clasificacion = ?, Email_Paciente = ?, Estado = 'Reservado' WHERE ID_Turno = ?",
            [Nombre_Paciente, Dni_Paciente, Motivo_Consulta, Obra_Social, Clasificacion, Email_Paciente, ID_Turno]
        );
        res.redirect('/turno/inicio');
    } catch (error) {
        console.error(error);
        res.status(500).send("Error al editar el turno");
    }
};

// Inactivar un turno
const deactivateTurno = async (req, res) => {
    const { ID_Turno } = req.params;
    try {
        await pool.query("UPDATE turno SET Activo = 0 WHERE ID_Turno = ?", [ID_Turno]);
        res.redirect('/turno/inicio');
    } catch (error) {
        console.error(error);
        res.status(500).send("Error al eliminar el turno");
    }
};

// Obtener turno por ID
const getTurnoById = async (ID_Turno) => {
    try {
        const [result] = await pool.query("SELECT * FROM turno WHERE ID_Turno = ?", [ID_Turno]);
        return result[0];
    } catch (error) {
        console.error(error);
        return null;
    }
};

// Controlador para obtener turno por ID y pasarlo al siguiente middleware
const getTurnoByIdController = async (req, res, next) => {
    const turno = await getTurnoById(req.params.ID_Turno);
    req.turno = turno;
    next();
};

module.exports = {
    renderTurnos,
    editTurno,
    deactivateTurno,
    getTurnoByIdController,
};
