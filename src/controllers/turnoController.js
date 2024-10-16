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
};
