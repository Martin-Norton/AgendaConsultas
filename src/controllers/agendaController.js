// src/controllers/agendaController.js
const { pool } = require('../database/connectionMySQL');
const { getProfesional } = require('./profesionalController');
const { getEspecialidades } = require('./especialidadController');

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
        return result;
    } catch (error) {
        console.error(error);
        return [];
    }
};
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

const generarTurnos = async (agendaId, diasTrabajo, horaInicio, horaFin, duracionCita,dias) => {
    const sqlInsertTurno = `
        INSERT INTO turno (Hora_Inicio_Turno, Fecha_Turno, ID_Agenda, Estado, Activo)
        VALUES (?, ?, ?, 'Disponible', 1)
    `;

    
    const sumarMinutos = (hora, minutos) => {
        const [h, m] = hora.split(':').map(Number);
        let nuevaHora = new Date(0, 0, 0, h, m);
        nuevaHora.setMinutes(nuevaHora.getMinutes() + minutos);
        const horas = nuevaHora.getHours().toString().padStart(2, '0');
        const minutosFormateados = nuevaHora.getMinutes().toString().padStart(2, '0');
        return `${horas}:${minutosFormateados}`;
    };

    
    const convertirAHora = (hora) => {
        const [h, m] = hora.split(':').map(Number);
        return new Date(0, 0, 0, h, m);
    };
    
    const diasTrabajoNormalizados = diasTrabajo.map(dia => dia.toLowerCase());

    
    const hoy = new Date();
    for (let i = 0; i < dias; i++) {
        const fechaActual = new Date(hoy);
        fechaActual.setDate(hoy.getDate() + i);

        
        const nombreDiaSemana = fechaActual.toLocaleDateString('es-ES', { weekday: 'long' }).toLowerCase();

        console.log(`Verificando día: ${nombreDiaSemana} (${fechaActual.toISOString().split('T')[0]})`);

        
        if (diasTrabajoNormalizados.includes(nombreDiaSemana)) {
            console.log('Día de trabajo encontrado:', nombreDiaSemana);
            let horaActual = convertirAHora(horaInicio);
            const horaFinDate = convertirAHora(horaFin);

            
            while (horaActual < horaFinDate) {
                const fechaFormateada = fechaActual.toISOString().split('T')[0]; 

                try {
                    
                    await pool.query(sqlInsertTurno, [horaActual.toTimeString().substring(0, 5), fechaFormateada, agendaId]);
                } catch (error) {
                    console.error('Error al crear turno:', error);
                }

                
                horaActual = convertirAHora(sumarMinutos(horaActual.toTimeString().substring(0, 5), parseInt(duracionCita, 10)));
            }
        } else {
            console.log(`${nombreDiaSemana} no es un día de trabajo.`);
        }
    }
};

const addAgenda = async (req, res) => {
    console.log('Cuerpo de la solicitud:', req.body);
    if (!req.body) {
        return res.status(400).json({ error: 'Cuerpo de la solicitud no definido' });
    }

    const { profesionalId, especialidadId, diasTrabajo, horaInicio, horaFin, duracionCita, dias } = req.body;

    if (!profesionalId) {
        return res.status(400).json({ error: 'Por favor, selecciona un profesional.' });
    }

    try {
        // Convertir los días de trabajo a minúsculas para uniformidad
        const diasArray = Array.isArray(diasTrabajo) ? diasTrabajo.map(d => d.toLowerCase()) : [diasTrabajo.toLowerCase()];

        // Consulta para verificar si el profesional tiene agendas activas que se superponen en días y horarios
        const sqlVerificarSuperposicion = `
            SELECT a.ID_Agenda, adt.Dia
            FROM agenda a
            JOIN agenda_dias_trabajo adt ON a.ID_Agenda = adt.ID_Agenda
            WHERE a.ID_Profesional = ? AND a.Activo = 1
              AND adt.Dia IN (?)
              AND (
                  (a.Hora_Inicio <= ? AND a.Hora_Fin > ?) OR
                  (a.Hora_Inicio < ? AND a.Hora_Fin >= ?)
              )
        `;
        
        const [agendasSuperpuestas] = await pool.query(sqlVerificarSuperposicion, [
            profesionalId,
            diasArray,
            horaFin,
            horaInicio,
            horaInicio,
            horaFin
        ]);

        // Si se encuentran agendas superpuestas, se envía una respuesta de error
        if (agendasSuperpuestas.length > 0) {
            return res.status(400).json({ error: 'El profesional ya tiene una agenda en estos días y horarios.' });
        }

        // Si no hay superposición, procede a crear la agenda
        const sqlAgenda = `
            INSERT INTO agenda (ID_Profesional, ID_Especialidad, Hora_Inicio, Hora_Fin, Duracion_Cita, Estado, Activo)
            VALUES (?, ?, ?, ?, ?, 'Disponible', 1)
        `;
        const [result] = await pool.query(sqlAgenda, [profesionalId, especialidadId, horaInicio, horaFin, duracionCita]);

        const agendaId = result.insertId;

        // Inserta los días de trabajo
        const sqlDiasTrabajo = `INSERT INTO agenda_dias_trabajo (ID_Agenda, Dia) VALUES (?, ?)`;
        for (const dia of diasArray) {
            await pool.query(sqlDiasTrabajo, [agendaId, dia]);
        }

        console.log('Días de trabajo:', diasTrabajo);

        // Genera los turnos para la nueva agenda
        await generarTurnos(agendaId, diasArray, horaInicio, horaFin, duracionCita, parseInt(dias, 10));

        res.redirect('/agenda');
    } catch (error) {
        console.error('Error al crear la agenda:', error);
        if (!res.headersSent) {
            res.status(500).json({ message: 'Error al crear la agenda' });
        }
    }
};

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

const inactivarAgenda = async (req, res) => {
    const { ID_Agenda } = req.params;
    try {
        await pool.query("UPDATE agenda SET Activo = 0 WHERE ID_Agenda = ?", [ID_Agenda]);
        await pool.query("UPDATE turno SET Activo = 0 WHERE ID_Agenda = ?", [ID_Agenda]);
        res.redirect('/agenda');
    } catch (error) {
        console.error('Error al inactivar la agenda:', error);
        res.status(500).json({ message: 'Error al inactivar la agenda' });
    }
};

const renderAgendas = async (req, res) => {
    const agendas = await getAgendas(); 
    res.render('agendaViews/listarAgendas', { agendas });
};

const editarAgenda = async (req, res) => {
    const { ID_Agenda } = req.params;
    const { Hora_Inicio, Hora_Fin, Duracion_Cita, Estado } = req.body;

    try {
        
        await pool.query(
            `UPDATE agenda 
             SET Hora_Inicio = ?, Hora_Fin = ?, Duracion_Cita = ?, Estado = ? 
             WHERE ID_Agenda = ?`,
            [Hora_Inicio, Hora_Fin, Duracion_Cita, Estado, ID_Agenda]
        );
        
        res.redirect(`/agenda`);
    } catch (error) {
        console.error(error);
        res.status(500).send("Error al actualizar la agenda");
    }
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
