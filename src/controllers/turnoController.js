// const { pool } = require('../database/connectionMySQL');
// const { getProfesional } = require('./profesionalController');
// const { getEspecialidades } = require('./especialidadController');

// // Obtener todos los turnos activos
// const getTurnos = async () => {
//     try {
//         const [result] = await pool.query("SELECT * FROM turno WHERE activo = 1;");
//         return result;
//     } catch (error) {
//         console.error(error);
//         return [];
//     }
// };

// // Obtener turno por ID
// const getTurnoById = async (ID_Turno) => {
//     try {
//         const [result] = await pool.query("SELECT * FROM turno WHERE ID_Turno = ?", [ID_Turno]);
//         return result[0];
//     } catch (error) {
//         console.error(error);
//         return null;
//     }
// };
// // Obtener turno por ID y añadirlo a la solicitud
// const getTurnoByIdController = async (req, res, next) => {
//     const ID_Turno = req.params.ID_Turno; // Obtener el ID del turno de los parámetros de la ruta
//     const turno = await getTurnoById(ID_Turno); // Llamar a la función que obtiene el turno por ID

//     if (turno) {
//         req.turno = turno; // Almacenar el turno en la solicitud para que esté disponible en las siguientes funciones
//         next(); // Pasar al siguiente middleware
//     } else {
//         res.status(404).send('Turno no encontrado'); // Manejar el caso en que no se encuentra el turno
//     }
// };


// // Obtener turnos disponibles según criterios
// const getTurnosDisponibles = async (profesionalId, especialidadId, fechaInicio, fechaFin, horaInicio, horaFin) => {
//     let query = `
//         SELECT a.ID_Agenda, a.Hora_Inicio, a.Hora_Fin, 
//         CASE WHEN t.ID_Turno IS NULL THEN 0 ELSE 1 END AS ocupado
//         FROM agenda a
//         LEFT JOIN turno t ON a.ID_Agenda = t.ID_Agenda AND DATE(t.Fecha) >= ? AND DATE(t.Fecha) <= ?
//         WHERE a.activo = 1 AND a.ID_Profesional = ? AND a.ID_Especialidad = ?
//     `;

//     // Filtros de horario
//     if (horaInicio && horaFin) {
//         query += ` AND a.Hora_Inicio >= ? AND a.Hora_Fin <= ?`;
//     }

//     try {
//         const params = [fechaInicio, fechaFin, profesionalId, especialidadId];
//         if (horaInicio && horaFin) {
//             params.push(horaInicio, horaFin);
//         }
//         const [result] = await pool.query(query, params);
//         return result;
//     } catch (error) {
//         console.error(error);
//         return [];
//     }
// };

// // Controlador para obtener y renderizar turnos disponibles
// const getTurnosDisponiblesController = async (req, res) => {
//     const profesionales = await getProfesional();
//     const especialidades = await getEspecialidades();
    
//     const { profesional, especialidad, fechaInicio, fechaFin, horaInicio, horaFin } = req.query;

//     const turnos = await getTurnosDisponibles(profesional, especialidad, fechaInicio, fechaFin, horaInicio, horaFin);

//     // Renderiza la vista con los turnos
//     res.render('turnosViews/listarTurnos', { turnos, profesionales, especialidades });
// };

// const renderTurnos = async (req, res) => {
//     console.log('renderTurnos called'); // Agrega esto para depuración

//     // Obtener todos los turnos activos
//     const turnos = await getTurnos(); // Llama a la función que obtiene los turnos

//     // Si necesitas cargar profesionales y especialidades para la vista
//     const profesionales = await getProfesional(); // O la función adecuada para obtener profesionales
//     const especialidades = await getEspecialidades(); // O la función adecuada para obtener especialidades

//     // Renderiza la vista con los turnos
//     res.render('turnosViews/listarTurnos', { turnos, profesionales, especialidades });
// };


// // Editar un turno y obtener las listas de estado, obra social y clasificación
// const editTurno = async (req, res) => {
//     const { Nombre_Paciente, Dni_Paciente, Motivo_Consulta, Obra_Social, Clasificacion, Email_Paciente, ID_Agenda, Estado } = req.body;
//     const { ID_Turno } = req.params;

//     try {
//         await pool.query(
//             "UPDATE turno SET Nombre_Paciente = ?, Dni_Paciente = ?, Motivo_Consulta = ?, Obra_Social = ?, Clasificacion = ?, Email_Paciente = ?, ID_Agenda = ?, Estado = ? WHERE ID_Turno = ?",
//             [Nombre_Paciente, Dni_Paciente, Motivo_Consulta, Obra_Social, Clasificacion, Email_Paciente, ID_Agenda, Estado, ID_Turno]
//         );
//         res.redirect('/turno');
//     } catch (error) {
//         console.error(error);
//         res.status(500).send("Error al editar el turno");
//     }
// };

// // Obtener la información del turno y renderizar la vista de edición
// const renderEditarTurno = async (req, res) => {
//     const turno = await getTurnoById(req.params.ID_Turno);

//     // Listas de estados, obras sociales y clasificaciones (esto puede venir de la BD o estar predefinido)
//     const estados = ['Reservado', 'A Confirmar', 'Cancelado'];
//     const obrasSociales = ['Obra Social 1', 'Obra Social 2', 'Obra Social 3']; // Esto debe cargarse de una fuente de datos
//     const clasificaciones = ['Normal', 'Especial', 'VIP'];

//     if (turno) {
//         res.render('turnosViews/editarTurno', {
//             turno,
//             estados,
//             obrasSociales,
//             clasificaciones
//         });
//     } else {
//         res.status(404).send('Turno no encontrado');
//     }
// };



// // Inactivar un turno
// const deactivateTurno = async (req, res) => {
//     const { ID_Turno } = req.params;
//     try {
//         await pool.query("UPDATE turno SET activo = 0 WHERE ID_Turno = ?", [ID_Turno]);
//         res.redirect('/turno');
//     } catch (error) {
//         console.error(error);
//         res.status(500).send("Error al inactivar el turno");
//     }
// };

// module.exports = {
//     getTurnos,
//     renderTurnos,
//     editTurno,
//     renderEditarTurno,
//     deactivateTurno,
//     getTurnoByIdController,
//     getTurnosDisponiblesController,
// };
const { pool } = require('../database/connectionMySQL');
const { getProfesional } = require('./profesionalController');
const { getEspecialidades } = require('./especialidadController');

// Obtener todos los turnos activos
const getTurnos = async () => {
    try {
        const [result] = await pool.query("SELECT * FROM turno WHERE activo = 1;");
        return result; // Asegúrate de que 'result' contenga datos.
    } catch (error) {
        console.error(error);
        return [];
    }
};

// Obtener turno por ID
const getTurnoById = async (ID_Turno) => {
    try {
        const [result] = await pool.query("SELECT * FROM turno WHERE ID_Turno = ?", [ID_Turno]);
        return result[0];
    } catch (error) {
        console.error("Error al obtener el turno por ID:", error);
        return null;
    }
};

// Obtener turno por ID y añadirlo a la solicitud
const getTurnoByIdController = async (req, res, next) => {
    const ID_Turno = req.params.ID_Turno; // Obtener el ID del turno de los parámetros de la ruta
    const turno = await getTurnoById(ID_Turno); // Llamar a la función que obtiene el turno por ID

    if (turno) {
        req.turno = turno; // Almacenar el turno en la solicitud para que esté disponible en las siguientes funciones
        next(); // Pasar al siguiente middleware
    } else {
        res.status(404).send('Turno no encontrado'); // Manejar el caso en que no se encuentra el turno
    }
};

// Obtener turnos disponibles según criterios
const getTurnosDisponibles = async (profesionalId, especialidadId, fechaInicio, fechaFin, horaInicio, horaFin) => {
    let query = `
        SELECT a.ID_Agenda, a.Hora_Inicio, a.Hora_Fin, 
        CASE WHEN t.ID_Turno IS NULL THEN 0 ELSE 1 END AS ocupado
        FROM agenda a
        LEFT JOIN turno t ON a.ID_Agenda = t.ID_Agenda AND DATE(t.Fecha) >= ? AND DATE(t.Fecha) <= ?
        WHERE a.activo = 1 AND a.ID_Profesional = ? AND a.ID_Especialidad = ?
    `;

    // Filtros de horario
    if (horaInicio && horaFin) {
        query += ` AND a.Hora_Inicio >= ? AND a.Hora_Fin <= ?`;
    }

    try {
        const params = [fechaInicio, fechaFin, profesionalId, especialidadId];
        if (horaInicio && horaFin) {
            params.push(horaInicio, horaFin);
        }
        const [result] = await pool.query(query, params);
        return result;
    } catch (error) {
        console.error("Error al obtener turnos disponibles:", error);
        return [];
    }
};

// Controlador para obtener y renderizar turnos disponibles
const getTurnosDisponiblesController = async (req, res) => {
    const profesionales = await getProfesional();
    const especialidades = await getEspecialidades();
    
    const { profesional, especialidad, fechaInicio, fechaFin, horaInicio, horaFin } = req.query;

    const turnos = await getTurnosDisponibles(profesional, especialidad, fechaInicio, fechaFin, horaInicio, horaFin);

    // Renderiza la vista con los turnos
    res.render('turnosViews/listarTurnos', { turnos, profesionales, especialidades });
};

// Controlador para renderizar todos los turnos activos
const renderTurnos = async (req, res) => {
    console.log('renderTurnos called'); // Agrega esto para depuración

    try {
        // Obtener todos los turnos activos
        const turnos = await getTurnos(); // Llama a la función que obtiene los turnos

        // Obtener la lista de profesionales y especialidades
        const profesionales = await getProfesional(); // Llama a la función adecuada para obtener profesionales
        const especialidades = await getEspecialidades(); // Llama a la función adecuada para obtener especialidades

        // Renderiza la vista con los turnos, profesionales y especialidades
        res.render('turnosViews/listarTurnos', { turnos, profesionales, especialidades });
    } catch (error) {
        console.error("Error al renderizar turnos:", error);
        res.status(500).send("Error al obtener los turnos");
    }
};

// Editar un turno y obtener las listas de estado, obra social y clasificación
const editTurno = async (req, res) => {
    const { Nombre_Paciente, Dni_Paciente, Motivo_Consulta, Obra_Social, Clasificacion, Email_Paciente, ID_Agenda, Estado } = req.body;
    const { ID_Turno } = req.params;

    try {
        await pool.query(
            "UPDATE turno SET Nombre_Paciente = ?, Dni_Paciente = ?, Motivo_Consulta = ?, Obra_Social = ?, Clasificacion = ?, Email_Paciente = ?, ID_Agenda = ?, Estado = ? WHERE ID_Turno = ?",
            [Nombre_Paciente, Dni_Paciente, Motivo_Consulta, Obra_Social, Clasificacion, Email_Paciente, ID_Agenda, Estado, ID_Turno]
        );
        res.redirect('/turno');
    } catch (error) {
        console.error("Error al editar el turno:", error);
        res.status(500).send("Error al editar el turno");
    }
};

// Obtener la información del turno y renderizar la vista de edición
const renderEditarTurno = async (req, res) => {
    const turno = await getTurnoById(req.params.ID_Turno);

    // Listas de estados, obras sociales y clasificaciones (esto puede venir de la BD o estar predefinido)
    const estados = ['Reservado', 'A Confirmar', 'Cancelado'];
    const obrasSociales = ['Obra Social 1', 'Obra Social 2', 'Obra Social 3']; // Esto debe cargarse de una fuente de datos
    const clasificaciones = ['Normal', 'Especial', 'VIP'];

    if (turno) {
        res.render('turnosViews/editarTurno', {
            turno,
            estados,
            obrasSociales,
            clasificaciones
        });
    } else {
        res.status(404).send('Turno no encontrado');
    }
};

// Inactivar un turno
const deactivateTurno = async (req, res) => {
    const { ID_Turno } = req.params;
    try {
        await pool.query("UPDATE turno SET activo = 0 WHERE ID_Turno = ?", [ID_Turno]);
        res.redirect('/turno');
    } catch (error) {
        console.error("Error al inactivar el turno:", error);
        res.status(500).send("Error al inactivar el turno");
    }
};

module.exports = {
    getTurnos,
    renderTurnos,
    editTurno,
    renderEditarTurno,
    deactivateTurno,
    getTurnoByIdController,
    getTurnosDisponiblesController,
};
