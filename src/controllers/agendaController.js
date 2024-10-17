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
// const addAgenda = async (req, res) => {
//     console.log('Cuerpo de la solicitud:', req.body); // Log para verificar el cuerpo
//     if (!req.body) {
//         return res.status(400).json({ error: 'Cuerpo de la solicitud no definido' });
//     }
//     const { profesionalId, especialidadId, diasTrabajo, horaInicio, horaFin, duracionCita } = req.body;

//     if (!profesionalId) {
//         return res.status(400).json({ error: 'Por favor, selecciona un profesional.' });
//     }

//     try {
//         const fechaInicio = new Date();
//         const fechaFin = new Date();
//         fechaFin.setMonth(fechaFin.getMonth() + 6);

//         // Crear la agenda
//         const sqlAgenda = `
//             INSERT INTO agenda (ID_Profesional, ID_Especialidad, Hora_Inicio, Hora_Fin, Duracion_Cita, Estado, Activo)
//             VALUES (?, ?, ?, ?, ?, 'Disponible', 1)
//         `;
//         const [result] = await pool.query(sqlAgenda, [profesionalId, especialidadId, horaInicio, horaFin, duracionCita]);

//         // Obtener el ID de la nueva agenda
//         const agendaId = result.insertId;

//         // Insertar los días de trabajo en la tabla 'agenda_dias_trabajo'
//         const sqlDiasTrabajo = `
//             INSERT INTO agenda_dias_trabajo (ID_Agenda, Dia)
//             VALUES (?, ?)
//         `;
//         for (const dia of diasTrabajo) {
//             await pool.query(sqlDiasTrabajo, [agendaId, dia]);
//         }

//         res.status(200).json({ message: 'Agenda creada con éxito' });
//     } catch (error) {
//         console.error('Error al crear la agenda:', error);
//         res.status(500).json({ message: 'Error al crear la agenda' });
//     }
// };

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
// Función para agregar una nueva agenda
const addAgenda = async (req, res) => {
    console.log('Cuerpo de la solicitud:', req.body); // Log para verificar el cuerpo
    if (!req.body) {
        return res.status(400).json({ error: 'Cuerpo de la solicitud no definido' });
    }

    const { profesionalId, especialidadId, diasTrabajo, horaInicio, horaFin, duracionCita } = req.body;

    if (!profesionalId) {
        return res.status(400).json({ error: 'Por favor, selecciona un profesional.' });
    }

    try {
        // Crear la agenda
        const sqlAgenda = `
            INSERT INTO agenda (ID_Profesional, ID_Especialidad, Hora_Inicio, Hora_Fin, Duracion_Cita, Estado, Activo)
            VALUES (?, ?, ?, ?, ?, 'Disponible', 1)
        `;
        const [result] = await pool.query(sqlAgenda, [profesionalId, especialidadId, horaInicio, horaFin, duracionCita]);

        // Obtener el ID de la nueva agenda
        const agendaId = result.insertId;

        // Insertar los días de trabajo en la tabla 'agenda_dias_trabajo'
        const sqlDiasTrabajo = `
            INSERT INTO agenda_dias_trabajo (ID_Agenda, Dia)
            VALUES (?, ?)
        `;
        for (const dia of diasTrabajo) {
            await pool.query(sqlDiasTrabajo, [agendaId, dia]);
        }

        // Enviar respuesta exitosa
        res.status(200).json({ message: 'Agenda creada con éxito' });
    } catch (error) {
        console.error('Error al crear la agenda:', error);

        // Solo enviamos la respuesta de error si no se ha enviado ya otra
        if (!res.headersSent) {
            res.status(500).json({ message: 'Error al crear la agenda' });
        }
    }
};

// Controlador para crear una nueva agenda y redirigir
const createAgenda = async (req, res) => {
    try {
        await addAgenda(req, res);

        // Verificar si la respuesta ya fue enviada en la función `addAgenda`
        if (!res.headersSent) {
            res.redirect('/agenda'); // Redirigir a la lista de agendas
        }
    } catch (error) {
        console.error(error);
        if (!res.headersSent) {
            res.status(500).send("Error al agregar la agenda");
        }
    }
};

// const createAgenda = async (req, res) => {
//     const { profesionalId, especialidadId, diasTrabajo, horario, duracionCita } = req.body;

//     const fechaActual = new Date();
//     const fechaFin = new Date();
//     fechaFin.setMonth(fechaFin.getMonth() + 6);

//     try {
//         await addAgenda(req, res);
//         res.redirect('/agenda'); // Redirigir a la lista de agendas o donde desees
//     } catch (error) {
//         console.error(error);
//         res.status(500).send("Error al agregar la agenda");
//     }
// };

// Renderizar la vista de listar agendas
const renderAgendas = async (req, res) => {
    const agendas = await getAgendas(); // Obtener todas las agendas
    res.render('agendaViews/listarAgendas', { agendas });
};

module.exports = {
    addAgenda,
    renderAgregarAgenda,
    createAgenda,
    renderAgendas,
};
