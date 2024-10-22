// src/controllers/agendaController.js
const { pool } = require('../database/connectionMySQL');
const { getProfesional } = require('./profesionalController');
const { getEspecialidades } = require('./especialidadController');

// src/controllers/agendaController.js
const getAgendas = async () => {
    try {
        const query = `
            SELECT 
                a.ID_Agenda, 
                p.Nombre_Profesional, 
                p.Apellido_Profesional, 
                e.Nombre_Especialidad, 
                a.Hora_Inicio, 
                a.Hora_Fin, 
                a.Duracion_Cita, 
                a.Estado
            FROM 
                agenda a
            JOIN 
                profesional p ON a.ID_Profesional = p.ID_Profesional
            JOIN 
                especialidad e ON a.ID_Especialidad = e.ID_Especialidad
            WHERE 
                a.activo = 1;`;

        const [result] = await pool.query(query);
        return result; // Devuelve la lista de agendas con los datos del profesional y la especialidad
    } catch (error) {
        console.error(error);
        return []; // Devuelve un array vacío en caso de error
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
//// aca 

const generarTurnos = async (agendaId, diasTrabajo, horaInicio, horaFin, duracionCita) => {
    const sqlInsertTurno = `
        INSERT INTO turno (Hora_Inicio_Turno, Fecha_Turno, ID_Agenda, Estado, Activo)
        VALUES (?, ?, ?, 'Disponible', 1)
    `;

    // Función para agregar minutos a una hora correctamente
    const sumarMinutos = (hora, minutos) => {
        const [h, m] = hora.split(':').map(Number);
        let nuevaHora = new Date(0, 0, 0, h, m);
        nuevaHora.setMinutes(nuevaHora.getMinutes() + minutos);
        const horas = nuevaHora.getHours().toString().padStart(2, '0');
        const minutosFormateados = nuevaHora.getMinutes().toString().padStart(2, '0');
        return `${horas}:${minutosFormateados}`;
    };

    // Convertir la hora a un objeto Date para comparar correctamente
    const convertirAHora = (hora) => {
        const [h, m] = hora.split(':').map(Number);
        return new Date(0, 0, 0, h, m);
    };

    console.log('Iniciando generación de turnos...');
    console.log('Días de trabajo:', diasTrabajo);
    console.log('Hora inicio:', horaInicio, 'Hora fin:', horaFin);
    console.log('Duración de la cita:', duracionCita);

    // Normalizar los días de trabajo a minúsculas
    const diasTrabajoNormalizados = diasTrabajo.map(dia => dia.toLowerCase());

    // Obtener la fecha actual y los próximos 30 días
    const hoy = new Date();
    for (let i = 0; i < 30; i++) {
        const fechaActual = new Date(hoy);
        fechaActual.setDate(hoy.getDate() + i);

        // Obtener el nombre del día de la semana en minúsculas
        const nombreDiaSemana = fechaActual.toLocaleDateString('es-ES', { weekday: 'long' }).toLowerCase();

        console.log(`Verificando día: ${nombreDiaSemana} (${fechaActual.toISOString().split('T')[0]})`);

        // Verificar si el día actual es uno de los días de trabajo
        if (diasTrabajoNormalizados.includes(nombreDiaSemana)) {
            console.log('Día de trabajo encontrado:', nombreDiaSemana);
            let horaActual = convertirAHora(horaInicio);
            const horaFinDate = convertirAHora(horaFin);

            // Crear turnos desde la hora de inicio hasta la hora de fin
            while (horaActual < horaFinDate) {
                const fechaFormateada = fechaActual.toISOString().split('T')[0]; // YYYY-MM-DD

                console.log('Insertando turno con valores:');
                console.log('Hora:', horaActual.toTimeString().substring(0, 5));
                console.log('Fecha:', fechaFormateada);
                console.log('Agenda ID:', agendaId);

                try {
                    // Insertar el turno en la base de datos
                    await pool.query(sqlInsertTurno, [horaActual.toTimeString().substring(0, 5), fechaFormateada, agendaId]);
                } catch (error) {
                    console.error('Error al crear turno:', error);
                }

                // Sumar la duración de la cita a la hora actual
                horaActual = convertirAHora(sumarMinutos(horaActual.toTimeString().substring(0, 5), parseInt(duracionCita, 10)));
            }
        } else {
            console.log(`${nombreDiaSemana} no es un día de trabajo.`);
        }
    }
};

// Función para agregar una nueva agenda
const addAgenda = async (req, res) => {
    console.log('Cuerpo de la solicitud:', req.body);
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
        const sqlDiasTrabajo = `INSERT INTO agenda_dias_trabajo (ID_Agenda, Dia) VALUES (?, ?)`;

        // Asegurar que 'diasTrabajo' sea un array y recorrerlo
        const diasArray = Array.isArray(diasTrabajo) ? diasTrabajo : [diasTrabajo];
        for (const dia of diasArray) {
            await pool.query(sqlDiasTrabajo, [agendaId, dia]);
        }

        console.log('Días de trabajo:', diasTrabajo);

        // Generar los turnos para los próximos 30 días
        await generarTurnos(agendaId, diasArray, horaInicio, horaFin, duracionCita);

        // Redirigir a la lista de agendas
        res.redirect('/agenda');
    } catch (error) {
        console.error('Error al crear la agenda:', error);
        if (!res.headersSent) {
            res.status(500).json({ message: 'Error al crear la agenda' });
        }
    }
};
////hasta aca


// // Función para agregar una nueva agenda comentado 21/10 20:34
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
//         // Crear la agenda
//         const sqlAgenda = `
//             INSERT INTO agenda (ID_Profesional, ID_Especialidad, Hora_Inicio, Hora_Fin, Duracion_Cita, Estado, Activo)
//             VALUES (?, ?, ?, ?, ?, 'Disponible', 1)
//         `;
//         const [result] = await pool.query(sqlAgenda, [profesionalId, especialidadId, horaInicio, horaFin, duracionCita]);

//         // Obtener el ID de la nueva agenda
//         const agendaId = result.insertId;

//         // Insertar los días de trabajo en la tabla 'agenda_dias_trabajo'
//         const sqlDiasTrabajo = `INSERT INTO agenda_dias_trabajo (ID_Agenda, Dia) VALUES (?, ?)`;

//         // Asegurar que 'diasTrabajo' sea un array y recorrerlo
//         const diasArray = Array.isArray(diasTrabajo) ? diasTrabajo : [diasTrabajo];
//         for (const dia of diasArray) {
//             await pool.query(sqlDiasTrabajo, [agendaId, dia]);
//         }

//         // Redirigir a la lista de agendas
//         res.redirect('/agenda');
//     } catch (error) {
//         console.error('Error al crear la agenda:', error);
//         if (!res.headersSent) {
//             res.status(500).json({ message: 'Error al crear la agenda' });
//         }
//     }
// };


// Controlador para crear una nueva agenda y redirigir
const createAgenda = async (req, res) => {
    try {
        await addAgenda(req, res);
    } catch (error) {
        console.error(error);
        if (!res.headersSent) {
            res.status(500).send("Error al agregar la agenda");
        }
    }
};

const renderEditarAgenda = async (req, res) => {
    const { ID_Agenda } = req.params;

    try {
        const [agenda] = await pool.query(`
            SELECT a.*, p.Nombre_Profesional AS Nombre_Profesional, e.Nombre_Especialidad AS Nombre_Especialidad
            FROM agenda a
            JOIN profesional p ON a.ID_Profesional = p.ID_Profesional
            JOIN especialidad e ON a.ID_Especialidad = e.ID_Especialidad
            WHERE a.ID_Agenda = ?
        `, [ID_Agenda]);

        if (agenda.length === 0) {
            return res.status(404).send("Agenda no encontrada");
        }
        res.render('agendaViews/editarAgenda', {
            agenda: agenda[0],
            profesional: agenda[0].Nombre_Profesional,
            especialidad: agenda[0].Nombre_Especialidad
        });

    } catch (error) {
        console.error(error);
        res.status(500).send("Error al cargar la vista de editar agenda");
    }
};
const editarAgenda = async (req, res) => {
    const { ID_Agenda } = req.params;
    const { Hora_Inicio, Hora_Fin, Duracion_Cita, Estado } = req.body;

    try {
        // Actualizar los datos en la base de datos
        await pool.query(
            `UPDATE agenda 
             SET Hora_Inicio = ?, Hora_Fin = ?, Duracion_Cita = ?, Estado = ? 
             WHERE ID_Agenda = ?`,
            [Hora_Inicio, Hora_Fin, Duracion_Cita, Estado, ID_Agenda]
        );
        // Redirigir a alguna página después de la actualización
        res.redirect(`/agenda`);
    } catch (error) {
        console.error(error);
        res.status(500).send("Error al actualizar la agenda");
    }
};


const inactivarAgenda = async (req, res) => {
    const { ID_Agenda } = req.params;
    try {
        await pool.query("UPDATE agenda SET Activo = 0 WHERE ID_Agenda = ?", [ID_Agenda]);
        res.redirect('/agenda');
    } catch (error) {
        console.error('Error al inactivar la agenda:', error);
        res.status(500).json({ message: 'Error al inactivar la agenda' });
    }
};

// Controlador para mostrar todas las agendas
const renderAgendas = async (req, res) => {
    const agendas = await getAgendas(); // Obtener todas las agendas
    res.render('agendaViews/listarAgendas', { agendas });
};

module.exports = {
    addAgenda,
    editarAgenda,
    renderEditarAgenda,
    inactivarAgenda,
    renderAgregarAgenda,
    createAgenda,
    renderAgendas,
};
