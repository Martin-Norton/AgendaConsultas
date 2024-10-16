// src/controllers/agendaController.js
const { pool } = require('../database/connectionMySQL');
const { getProfesional } = require('./profesionalController');
const { getEspecialidades } = require('./especialidadController');

// Función para obtener todas las agendas
const getAgendas = async () => {
    try {
        const [result] = await pool.query("SELECT * FROM agenda;");
        return result;
    } catch (error) {
        console.error(error);
        return [];
    }
};

// Función para agregar una nueva agenda
const addAgenda = async (profesionalId, especialidadId, fechaInicio, fechaFin, diasTrabajo, horario, duracionCita) => {
    try {
        await pool.query(
            "INSERT INTO agenda (ID_Profesional, ID_Especialidad, Fecha_Inicio, Fecha_Fin, Dias_Trabajo, Horario, Duracion_Cita) VALUES (?, ?, ?, ?, ?, ?, ?)", 
            [profesionalId, especialidadId, fechaInicio, fechaFin, diasTrabajo, horario, duracionCita]
        );
    } catch (error) {
        console.error(error);
        throw new Error("Error al agregar la agenda");
    }
};

// Controlador para mostrar la vista de agregar agenda
const renderAgregarAgenda = async (req, res) => {
    try {
        const profesionales = await getProfesional();
        const especialidades = await getEspecialidades();
        res.render('agendaViews/agregarAgenda', { profesionales, especialidades });
    } catch (error) {
        console.error(error);
        res.status(500).send("Error al cargar la vista de agregar agenda");
    }
};

// Agregar una nueva agenda
const createAgenda = async (req, res) => {
    const { profesionalId, especialidadId, diasTrabajo, horario, duracionCita } = req.body;

    const fechaActual = new Date();
    const fechaFin = new Date();
    fechaFin.setMonth(fechaFin.getMonth() + 6);

    try {
        await addAgenda(profesionalId, especialidadId, fechaActual, fechaFin, diasTrabajo, horario, duracionCita);
        res.redirect('/agenda'); // Redirigir a la lista de agendas o donde desees
    } catch (error) {
        console.error(error);
        res.status(500).send("Error al agregar la agenda");
    }
};

// Renderizar la vista de listar agendas
const renderAgendas = async (req, res) => {
    const agendas = await getAgendas(); // Obtener todas las agendas
    res.render('agendaViews/listarAgendas', { agendas });
};

module.exports = {
    renderAgregarAgenda,
    createAgenda,
    renderAgendas,
};
