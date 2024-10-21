const { pool } = require('../database/connectionMySQL');

// Obtener todos los turnos activos
const getTurnos = async () => {
    try {
        const [result] = await pool.query("SELECT * FROM turno WHERE activo = 1;");
        return result;
    } catch (error) {
        console.error(error);
        return [];
    }
};

// Renderizar la vista con los turnos
const renderTurnos = async (req, res) => {
    const turnos = await getTurnos();
    res.render('turnosViews/listarTurnos', { turnos });
};

// Agregar un nuevo turno
const addTurno = async (req, res) => {
    const { Nombre_Paciente, Dni_Paciente, Motivo_Consulta, Obra_Social, Email_Paciente, ID_Agenda, Estado } = req.body;
    try {
        await pool.query("INSERT INTO turno (Nombre_Paciente, Dni_Paciente, Motivo_Consulta, Obra_Social, Email_Paciente, ID_Agenda, Estado, activo) VALUES (?, ?, ?, ?, ?, ?, ?, 1)", 
                        [Nombre_Paciente, Dni_Paciente, Motivo_Consulta, Obra_Social, Email_Paciente, ID_Agenda, Estado]);
        res.redirect('/turno');
    } catch (error) {
        console.error(error);
        res.status(500).send("Error al agregar el turno");
    }
};

// Editar un turno
const editTurno = async (req, res) => {
    const { Nombre_Paciente, Dni_Paciente, Motivo_Consulta, Obra_Social, Email_Paciente, ID_Agenda, Estado } = req.body;
    const { ID_Turno } = req.params;
    try {
        await pool.query("UPDATE turno SET Nombre_Paciente = ?, Dni_Paciente = ?, Motivo_Consulta = ?, Obra_Social = ?, Email_Paciente = ?, ID_Agenda = ?, Estado = ? WHERE ID_Turno = ?", 
                        [Nombre_Paciente, Dni_Paciente, Motivo_Consulta, Obra_Social, Email_Paciente, ID_Agenda, Estado, ID_Turno]);
        res.redirect('/turno');
    } catch (error) {
        console.error(error);
        res.status(500).send("Error al editar el turno");
    }
};
const getProfesionales = async () => {
    try {
        const [result] = await pool.query("SELECT * FROM profesional;");
        return result;
    } catch (error) {
        console.error(error);
        return [];
    }
};

const getEspecialidades = async () => {
    try {
        const [result] = await pool.query("SELECT * FROM especialidad;");
        return result;
    } catch (error) {
        console.error(error);
        return [];
    }
};

const getTurnosDisponibles = async (profesionalId, especialidadId) => {
    const fechaActual = new Date().toISOString().split('T')[0]; // Fecha actual
    const query = `
        SELECT a.ID_Agenda, a.Hora_Inicio, a.Hora_Fin, 
        CASE WHEN t.ID_Turno IS NULL THEN 0 ELSE 1 END AS ocupado
        FROM agenda a
        LEFT JOIN turno t ON a.ID_Agenda = t.ID_Agenda AND DATE(t.Fecha) = ?
        WHERE a.ID_Profesional = ? OR a.ID_Especialidad = ?
    `;
    try {
        const [result] = await pool.query(query, [fechaActual, profesionalId, especialidadId]);
        return result;
    } catch (error) {
        console.error(error);
        return [];
    }
};

// Renderizar la vista de agregar turno con filtros
const renderAgregarTurno = async (req, res) => {
    const profesionales = await getProfesionales();
    const especialidades = await getEspecialidades();
    res.render('turnosViews/agregarTurno', { profesionales, especialidades });
};

// Obtener turnos disponibles según filtros
const getTurnosDisponiblesController = async (req, res) => {
    const { profesional, especialidad } = req.query;
    const turnos = await getTurnosDisponibles(profesional, especialidad);
    const profesionales = await getProfesionales();
    const especialidades = await getEspecialidades();
    res.render('turnosViews/agregarTurno', { turnos, profesionales, especialidades });
};

// Inactivar un turno
const deactivateTurno = async (req, res) => {
    const { ID_Turno } = req.params;
    try {
        await pool.query("UPDATE turno SET activo = 0 WHERE ID_Turno = ?", [ID_Turno]);
        res.redirect('/turno');
    } catch (error) {
        console.error(error);
        res.status(500).send("Error al inactivar el turno");
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

const getTurnoByIdController = async (req, res, next) => {
    const turno = await getTurnoById(req.params.ID_Turno);
    req.turno = turno;
    next();
};

module.exports = {
    getTurnos,
    renderTurnos,
    addTurno,
    editTurno,
    deactivateTurno,
    getTurnoByIdController,
    renderAgregarTurno,
    getTurnosDisponiblesController,
};
