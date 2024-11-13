const { pool } = require('../database/connectionMySQL');
const { getProfesional } = require('../controllers/profesionalController');
const { getEspecialidades } = require('../controllers/especialidadController');
const { buscarPacientePorDni } = require('../controllers/pacienteController');
const { buscarPacientePorEmail } = require('../controllers/pacienteController');
//REGION SECRETARIA TURNOS
//filtros
const getTurnosExistentes = async (filtros) => {
    const { ID_Especialidad, fechaInicio, fechaFin, horario, ID_Profesional, Clasificacion, Estado } = filtros;
    let query = `SELECT * FROM turno WHERE Activo = 1`;
    const params = [];
    let idsAgendas = [];

    try {
        if (ID_Profesional && ID_Especialidad) {
            idsAgendas = await getAgendasByProfesionalYEspecialidad(ID_Profesional, ID_Especialidad);
        } else if (ID_Profesional) {
            idsAgendas = await getAgendasByProfesional(ID_Profesional);
        } else if (ID_Especialidad) {
            idsAgendas = await getAgendasByEspecialidad(ID_Especialidad);
        }

        if (idsAgendas.length > 0) {
            const placeholders = idsAgendas.map(() => `ID_Agenda = ?`).join(' OR ');
            query += ` AND (${placeholders})`;
            params.push(...idsAgendas);
        }

        if (Clasificacion) {
            query += ` AND Clasificacion = ?`;
            params.push(Clasificacion);
        }

        if (Estado) {
            query += ` AND Estado = ?`;
            params.push(Estado);
        }

        if (fechaInicio && fechaFin) {
            query += ` AND Fecha_Turno BETWEEN ? AND ?`;
            params.push(fechaInicio, fechaFin);
        }

        if (horario) {
            query += ` AND Hora_Inicio_Turno LIKE ?`;
            params.push(`${horario}:00`);
        }

        console.log("Consulta SQL:", query);
        console.log("Parámetros:", params);

        const [turnos] = await pool.query(query, params);

        if (turnos.length === 0) {
            return { error: "No se encontraron turnos disponibles" };
        } else {
            const turnosConProfesional = await obtenerTurnosConProfesional(turnos);
            return { turnosDisponibles: turnosConProfesional };
        }
    } catch (error) {
        console.error("Error en la consulta de turnos:", error);
        throw new Error("Error en la consulta de turnos");
    }
};

const getAgendasByProfesional = async (ID_Profesional) => {
    const query = `SELECT ID_Agenda FROM agenda WHERE ID_Profesional = ? AND Activo = 1`;
    const [agendas] = await pool.query(query, [ID_Profesional]);
    return agendas.map(agenda => agenda.ID_Agenda);
};

const renderFiltrosExistentes = async (req, res) => {
    try {
        const profesionales = await getProfesional();
        const especialidades = await getEspecialidades();
        const clasificaciones = await getClasificaciones();
        const estados = [
            "No Disponible", "Disponible", "A Confirmar", "Reservado", 
            "Cancelado", "Ausente", "Paciente", "En consulta", "Atendido"
        ];

        res.render('turnoViews/filtrosTurnosExistentes', {
            profesionales,
            especialidades,
            clasificaciones,
            estados
        });
    } catch (error) {
        console.error(error);
        res.status(500).send("Error al cargar los filtros de turnos");
    }
};
const getAgendasByProfesionalYEspecialidad = async (ID_Profesional, ID_Especialidad) => {
    let query = `SELECT ID_Agenda FROM agenda WHERE Activo = 1`;
    const params = [];

    if (ID_Profesional) {
        query += ` AND ID_Profesional = ?`;
        params.push(ID_Profesional);
    }

    if (ID_Especialidad) {
        query += ` AND ID_Especialidad = ?`;
        params.push(ID_Especialidad);
    }

    try {
        const [agendas] = await pool.query(query, params);
        return agendas.map(agenda => agenda.ID_Agenda);
    } catch (error) {
        console.error("Error al obtener agendas:", error);
        return [];
    }
};

//end filtros
const getAgendasByEspecialidad = async (ID_Especialidad) => {
    try {
        const [result] = await pool.query('SELECT ID_Agenda FROM agenda WHERE ID_Especialidad = ?', [ID_Especialidad]);
        return result.map(row => row.ID_Agenda);
    } catch (error) {
        console.error(error);
        return [];
    }
};
const getTurnosDisponibles = async (filtros, res) => {
    const { ID_Especialidad, fechaInicio, fechaFin, horario } = filtros;
    let placeholders = [];

    if (!ID_Especialidad) {
        throw new Error("La especialidad es obligatoria para la búsqueda.");
    }

    if (!fechaInicio || !fechaFin) {
        throw new Error("Las fechas son obligatorias para la búsqueda.");
    }

    let query = `SELECT * FROM turno WHERE Activo = 1 AND Estado = 'Disponible'`;
    const params = [];

    const idsAgendas = await getAgendasByEspecialidad(ID_Especialidad);
    if (idsAgendas.length === 0) {
        throw new Error("No se encontró agendas para la especialidad proporcionada.");
    } else {
        placeholders = idsAgendas.map(() => `ID_Agenda = ?`).join(' OR ');
        query += ` AND (${placeholders})`;
        params.push(...idsAgendas);
    }

    query += ` AND Fecha_Turno BETWEEN ? AND ?`;
    params.push(fechaInicio, fechaFin);

    if (horario) {
        query += ` AND Hora_Inicio_Turno LIKE ?`;
        params.push(`${horario}%`);
    }

    console.log("Consulta SQL:", query);
    console.log("Parámetros:", params);

    try {
        const [turnos] = await pool.query(query, params);
        console.log("Turnos disponibles encontrados:", turnos.length);

        if (turnos.length === 0) {
            console.log("No se encontró turnos disponibles");
        } else {
            const turnosConProfesional = await obtenerTurnosConProfesional(turnos);
            return { tipo: 'turnosDisponibles', datos: turnosConProfesional };
        }
    } catch (error) {
        console.error("Error en la consulta de turnos:", error);
        res.status(500).send("Error en la consulta de turnos");
    }
};
const renderTurnos = async (req, res) => {
    try {
        const filtros = req.body;
        const resultado = await getTurnosDisponibles(filtros, res);
        if (!resultado) return;

        let especialidadNombre = null;
        if (resultado.tipo === 'turnosDisponibles' && filtros.ID_Especialidad) {
            especialidadNombre = await getEspecialidadNombre(filtros.ID_Especialidad);
        }

        if (resultado.tipo === 'turnosDisponibles') {
            console.log("Turnos encontrados:", resultado.datos.length);

            const profesionales = resultado.datos.reduce((acc, turno) => {
                const idProfesional = turno.ID_Profesional;
                if (!acc[idProfesional]) {
                    acc[idProfesional] = {
                        Nombre_Profesional: turno.Nombre_Profesional,
                        turnos: []
                    };
                }
                acc[idProfesional].turnos.push(turno);
                return acc;
            }, {});

            const profesionalesArray = Object.values(profesionales);
            res.render('turnoViews/listarTurnos', {
                profesionales: profesionalesArray,
                especialidadNombre
            });
        }
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: error.message });
    }
};
async function getAgendasConProfesional(idsAgendas) {
    if (idsAgendas.length === 0) {
        return []; // Si no hay IDs, devolver un array vacío
    }

    const query = `
        SELECT agenda.ID_Agenda, agenda.ID_Profesional, profesional.Nombre_Profesional AS Nombre_Profesional
        FROM agenda
        JOIN profesional ON agenda.ID_Profesional = profesional.ID_Profesional
        WHERE agenda.ID_Agenda IN (${idsAgendas.map(() => '?').join(',')})
    `;
    const [result] = await pool.query(query, idsAgendas);
    return result;
}
async function obtenerTurnosConProfesional(turnos) {
    const agendasIds = turnos.map(turno => turno.ID_Agenda);
    const agendasProfesionales = await getAgendasConProfesional(agendasIds);
    return turnos.map(turno => {
        const profesional = agendasProfesionales.find(ap => ap.ID_Agenda === turno.ID_Agenda);
        return { ...turno, Nombre_Profesional: profesional ? profesional.Nombre_Profesional : 'Sin profesional' };
    });
}
const renderFiltrosTurnos = async (req, res) => {
    try {
        const profesionales = await getProfesional();
        const especialidades = await getEspecialidades();

        res.render('turnoViews/filtrosTurnos', {
            profesionales,
            especialidades,
        });
    } catch (error) {
        console.error(error);
        res.status(500).send("Error al cargar los filtros de turnos");
    }
};
const getEspecialidadNombre = async (idEspecialidad) => {
    console.log(idEspecialidad);
    const query = 'SELECT Nombre_especialidad FROM especialidad WHERE ID_Especialidad = ?';
    const [result] = await pool.query(query, [idEspecialidad]);
    if (result.length > 0) {
        console.log(result[0].Nombre_especialidad);
        return result[0].Nombre_especialidad;
    } else {
        return null;
    }
};
const getTurnosByDniPaciente = async (Dni_Paciente) => {
    try {
        const [result] = await pool.query(
            "SELECT * FROM turno WHERE Dni_Paciente = ?;",
            [Dni_Paciente]
        );
        return result;
    } catch (error) {
        console.error(error);
        return [];
    }
};
const renderTurnosPorPacienteForm = (req, res) => {
    res.render('turnoViews/turnosPorPacienteForm');
};
const buscarTurnosPorPaciente = async (req, res) => {
    const { Dni_Paciente } = req.body;
    const turnos = await getTurnosByDniPaciente(Dni_Paciente);

    res.render('turnoViews/turnosPorPaciente', {
        turnos,
        Dni_Paciente
    });
};
const obtenerAlternativasTurno = async (req, res) => {
    const { ID_Turno } = req.params;
    const turnoSeleccionado = await getTurnoById(ID_Turno);
    console.log("ID del turno selected: ", turnoSeleccionado.ID_Turno);

    if (turnoSeleccionado) {
        const ID_Especialidad = await getEspecialidadTurno(ID_Turno);
        const turnosDisponibles = await getTurnosDisponiblesPorEspecialidad(ID_Especialidad);

        res.render('turnoViews/alternativasTurnos', {
            turnoSeleccionado,
            turnosDisponibles,
            ID_Especialidad
        });
    } else {
        res.status(404).send("Turno no encontrado");
    }
};
const getEspecialidadTurno = async (ID_Turno) => {
    try {
        const [result] = await pool.query(
            `SELECT agenda.ID_Especialidad, agenda.ID_Agenda 
             FROM agenda
             JOIN turno ON agenda.ID_Agenda = turno.ID_Agenda
             WHERE turno.ID_Turno = ?
             LIMIT 1;`, // Forzamos a obtener solo un registro específico
            [ID_Turno]
        );

        if (result && result.length > 0) {
            console.log("Resultado de la consulta de especialidad:", result); // Verificar si se obtiene solo el registro esperado
            return result[0].ID_Especialidad;
        }

        console.warn("No se encontró un ID_Especialidad único para el turno:", ID_Turno);
        return null;
    } catch (error) {
        console.error("Error al obtener la especialidad del turno:", error);
        return null;
    }
};
const getTurnosDisponiblesPorEspecialidad = async (ID_Especialidad) => {
    try {
        const [result] = await pool.query(
            `SELECT turno.* 
             FROM turno
             JOIN agenda ON turno.ID_Agenda = agenda.ID_Agenda
             WHERE turno.Activo = 1 
               AND turno.Estado = 'Disponible' 
               AND agenda.ID_Especialidad = ?;`,
            [ID_Especialidad]
        );
        console.log("Turnos disponibles encontrados:", result);
        return result;
    } catch (error) {
        console.error("Error al obtener turnos disponibles por especialidad:", error);
        return [];
    }
};
const moverTurno = async (req, res) => {
    const { ID_Turno_Original, ID_Turno_Nuevo } = req.body;

    try {

        const turnoOriginal = await getTurnoById(ID_Turno_Original);
        if (!turnoOriginal) {
            return res.status(404).send("Turno original no encontrado.");
        }
        await pool.query(
            `UPDATE turno SET 
             Estado = 'Disponible', 
             Activo = 1, 
             ID_Paciente = NULL, 
             Nombre_Paciente = NULL, 
             Apellido_Paciente = NULL, 
             Dni_Paciente = 0, 
             Obra_Social = NULL, 
             Email_Paciente = NULL, 
             Motivo_Consulta = NULL, 
             Clasificacion = NULL 
             WHERE ID_Turno = ?`,
            [ID_Turno_Original]
        );
        const { Dni_Paciente, Nombre_Paciente, Apellido_Paciente, Obra_Social, Email_Paciente, Motivo_Consulta, Clasificacion } = turnoOriginal;

        await pool.query(
            `UPDATE turno SET 
             Estado = 'Reservado', 
             Activo = 1, 
             ID_Paciente = ?, 
             Nombre_Paciente = ?, 
             Apellido_Paciente = ?, 
             Dni_Paciente = ?, 
             Obra_Social = ?, 
             Email_Paciente = ?, 
             Motivo_Consulta = ?, 
             Clasificacion = ? 
             WHERE ID_Turno = ?`,
            [
                turnoOriginal.ID_Paciente,
                Nombre_Paciente,
                Apellido_Paciente,
                Dni_Paciente,
                Obra_Social,
                Email_Paciente,
                Motivo_Consulta,
                Clasificacion,
                ID_Turno_Nuevo
            ]
        );

        res.redirect('/turnos/por-paciente?mensaje=Turno movido correctamente');
    } catch (error) {
        console.error("Error al mover el turno:", error);
        res.status(500).send("Error al mover el turno");
    }
};
const getClasificaciones = async () => {
    try {
        const [result] = await pool.query("SELECT * FROM clasificacion;");
        return result;
    } catch (error) {
        console.error(error);
        return [];
    }
};
const editarTurno = async (req, res) => {
    const { ID_Turno } = req.params;
    const { Dni_Paciente, Motivo_Consulta, Clasificacion, Estado } = req.body;
    const accion = req.query.accion;

    try {
        if (accion === "buscar") {
            let paciente = null;
            if (Dni_Paciente) {
                paciente = await buscarPacientePorDni(Dni_Paciente);
            }

            // Obtener clasificaciones
            const clasificaciones = await getClasificaciones();

            res.render('turnoViews/editarTurno', {
                turno: paciente
                    ? {
                        ID_Turno,
                        ID_Paciente: paciente.ID_Paciente,
                        Nombre_Paciente: paciente.Nombre_Paciente,
                        Apellido_Paciente: paciente.Apellido_Paciente,
                        Dni_Paciente: paciente.Dni_Paciente,
                        Obra_Social: paciente.Obra_Social,
                        Email_Paciente: paciente.Email,
                        Motivo_Consulta: Motivo_Consulta || '',
                        Clasificacion: Clasificacion || ''
                    }
                    : { ID_Turno, Dni_Paciente },
                clasificaciones, // Pasar clasificaciones a la vista
                mensajeConfirmacion: ''
            });

        } else if (accion === "reserva") {
            const { ID_Paciente, Dni_Paciente, Nombre_Paciente, Apellido_Paciente, Obra_Social, Email_Paciente } = req.body;

            await pool.query(
                "UPDATE turno SET Nombre_Paciente = ?, Apellido_Paciente = ?, Dni_Paciente = ?, Obra_Social = ?, Email_Paciente = ?, Motivo_Consulta = ?, Clasificacion = ?, Estado = ?, ID_Paciente = ? WHERE ID_Turno = ?",
                [
                    req.body.Nombre_Paciente,
                    req.body.Apellido_Paciente,
                    Dni_Paciente,
                    req.body.Obra_Social,
                    req.body.Email_Paciente,
                    Motivo_Consulta,
                    Clasificacion,
                    Estado,
                    req.body.ID_Paciente,
                    ID_Turno
                ]
            );

            res.redirect('/turno/filtros?mensaje=Turno reservado correctamente');
        }
    } catch (error) {
        console.error("Error en editarTurno:", error);
        res.status(500).send("Error al procesar la solicitud");
    }
};
const getTurnosReservados = async (filtros) => {
    const { profesional, fechaInicio, fechaFin } = filtros;
    let query = `SELECT * FROM turno WHERE Activo = 1 AND Estado = 'Reservado'`;
    const params = [];

    if (profesional) {
        query += ` AND ID_Profesional = ?`;
        params.push(profesional);
    }

    if (fechaInicio && fechaFin) {
        query += ` AND Fecha_Turno BETWEEN ? AND ?`;
        params.push(fechaInicio, fechaFin);
    }

    try {
        const [result] = await pool.query(query, params);
        return result;
    } catch (error) {
        console.error(error);
        return [];
    }
};
const renderTurnosReservados = async (req, res) => {
    const filtros = req.body;
    const profesionales = await getProfesional();
    const turnos = await getTurnosReservados(filtros, res);

    res.render('turnoViews/listarTurnosReservados', { turnos, profesionales, filtros });
};
const editTurnoReservado = async (req, res) => {
    const { ID_Turno } = req.params;
    const { Nombre_Paciente, Dni_Paciente, Motivo_Consulta, Obra_Social, Clasificacion, Email_Paciente, Estado } = req.body;
    console.log(req.body);

    try {
        await pool.query(
            "UPDATE turno SET Nombre_Paciente = ?, Dni_Paciente = ?, Motivo_Consulta = ?, Obra_Social = ?, Clasificacion = ?, Email_Paciente = ?, Estado = ? WHERE ID_Turno = ?",
            [Nombre_Paciente, Dni_Paciente, Motivo_Consulta, Obra_Social, Clasificacion, Email_Paciente, Estado, ID_Turno]
        );
        res.redirect('/turno/reservados/filtros');
    } catch (error) {
        console.error(error);
        res.status(500).send("Error al editar el turno");
    }
};
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
const getTurnosAConfirmar = async (filtros) => {
    const { profesional, fechaInicio, fechaFin } = filtros;
    let query = `SELECT * FROM turno WHERE Activo = 1 AND Estado = 'A Confirmar'`;
    const params = [];

    if (profesional) {
        query += ` AND ID_Profesional = ?`;
        params.push(profesional);
    }

    if (fechaInicio && fechaFin) {
        query += ` AND Fecha_Turno BETWEEN ? AND ?`;
        params.push(fechaInicio, fechaFin);
    }

    try {
        const [result] = await pool.query(query, params);
        return result;
    } catch (error) {
        console.error(error);
        return [];
    }
};

const renderTurnosAConfirmar = async (req, res) => {
    const filtros = req.body;
    const profesionales = await getProfesional();
    const turnos = await getTurnosAConfirmar(filtros);

    res.render('turnoViews/listarTurnosAConfirmar', { turnos, profesionales, filtros });
};

const editTurnoAConfirmar = async (req, res) => {
    const { ID_Turno } = req.params;
    const { Nombre_Paciente, Dni_Paciente, Motivo_Consulta, Obra_Social, Clasificacion, Email_Paciente, Estado } = req.body;
    console.log(req.body);

    try {
        await pool.query(
            "UPDATE turno SET Nombre_Paciente = ?, Dni_Paciente = ?, Motivo_Consulta = ?, Obra_Social = ?, Clasificacion = ?, Email_Paciente = ?, Estado = ? WHERE ID_Turno = ? AND Estado = 'A Confirmar'",
            [Nombre_Paciente, Dni_Paciente, Motivo_Consulta, Obra_Social, Clasificacion, Email_Paciente, Estado, ID_Turno]
        );
        res.redirect('/turno/aConfirmar/filtros');
    } catch (error) {
        console.error(error);
        res.status(500).send("Error al editar el turno");
    }
};


//END REGION
//REGION PACIENTES
const renderFiltrosTurnosPaciente = async (req, res) => {
    try {
        if (!req.session.loggedin) {
            return res.redirect('/auth');
        }

        const especialidades = await getEspecialidades();
        const usuario = req.session.name;
        console.log("nombre asignado al usuario: desde renderFiltrosTurnosPaciente:", req.session.name);
        console.log("user asignado al usuario: desde renderFiltrosTurnosPaciente:", req.session.user);
        res.render('turnoViews/filtrosTurnosPaciente', {
            especialidades,
            usuario,
        });
    } catch (error) {
        console.error("Error al cargar los filtros de turnos:", error);
        res.status(500).send("Error al cargar los filtros de turnos");
    }
};
const renderTurnosPaciente = async (req, res) => {
    try {
        const filtros = req.body;
        const resultado = await getTurnosDisponibles(filtros, res);
        if (!resultado) return;

        let especialidadNombre = null;
        if (resultado.tipo === 'turnosDisponibles' && filtros.ID_Especialidad) {
            especialidadNombre = await getEspecialidadNombre(filtros.ID_Especialidad);
        }

        if (resultado.tipo === 'turnosDisponibles') {
            const profesionales = resultado.datos.reduce((acc, turno) => {
                const idProfesional = turno.ID_Profesional;
                if (!acc[idProfesional]) {
                    acc[idProfesional] = {
                        Nombre_Profesional: turno.Nombre_Profesional,
                        turnos: []
                    };
                }
                acc[idProfesional].turnos.push(turno);
                return acc;
            }, {});

            const profesionalesArray = Object.values(profesionales);
            res.render('turnoViews/listarTurnosPaciente', {
                profesionales: profesionalesArray,
                especialidadNombre
            });
        }
    } catch (error) {
        console.error("Error al mostrar los turnos:", error);
        res.status(500).json({ message: error.message });
    }
};
const editarTurnoPaciente = async (req, res) => {
    const { ID_Turno } = req.params;
    const { Motivo_Consulta} = req.body;
    const accion = req.query.accion;
    const usuarioDni = req.session.user;

    try {
        if (accion === "buscar") {
            let paciente = null;
            if (usuarioDni) {
                paciente = await buscarPacientePorDni(usuarioDni);
            }
            console.log("se accede a buscar")

            res.render('turnoViews/editarTurnoPaciente', {
                turno: paciente
                    ? {
                        ID_Turno,
                        ID_Paciente: paciente.ID_Paciente,
                        Nombre_Paciente: paciente.Nombre_Paciente,
                        Apellido_Paciente: paciente.Apellido_Paciente,
                        Dni_Paciente: paciente.Dni_Paciente,
                        Obra_Social: paciente.Obra_Social,
                        Email_Paciente: paciente.Email_Paciente,
                        Motivo_Consulta: Motivo_Consulta || '',
                    }
                    : { ID_Turno, Dni_Paciente: paciente.Dni_Paciente },
                mensajeConfirmacion: ''
            });
        } else if (accion === "reserva") {
            const paciente = await buscarPacientePorDni(usuarioDni);
            console.log("se accede a reserva");

            if (paciente) {
                 paciente.Dni_Paciente = paciente.Dni_Paciente;
                 await pool.query(
                    "UPDATE turno SET Nombre_Paciente = ?, Apellido_Paciente = ?, Dni_Paciente = ?, Obra_Social = ?, Email_Paciente = ?, Motivo_Consulta = ?, ID_Paciente = ?, Estado = 'A Confirmar' WHERE ID_Turno = ?",
                    [
                        paciente.Nombre_Paciente,
                        paciente.Apellido_Paciente,
                        paciente.Dni_Paciente,
                        paciente.Obra_Social,
                        paciente.Email_Paciente,
                        Motivo_Consulta,
                        paciente.ID_Paciente,
                        ID_Turno
                    ]
                );

                res.redirect('/turnos/paciente/filtros?mensaje=Turno reservado correctamente');
            } else {
                res.status(404).send("Paciente no encontrado");
            }
        } else {
            res.redirect('/turnos/paciente/filtros');
        }
    } catch (error) {
        console.error("Error al cargar el turno para reserva:", error);
        res.status(500).send("Error al cargar el turno para reserva");
    }
};
//END REGION PACIENTES
module.exports = {
    renderTurnosReservados,
    editTurnoReservado,
    renderFiltrosTurnos,
    renderTurnos,
    editarTurno,
    deactivateTurno,
    getTurnoByIdController,
    getTurnosByDniPaciente,
    renderTurnosPorPacienteForm,
    buscarTurnosPorPaciente,
    getTurnosDisponiblesPorEspecialidad,
    moverTurno,
    obtenerAlternativasTurno,
    renderFiltrosTurnosPaciente,
    renderTurnosPaciente,
    editarTurnoPaciente,
    editTurnoAConfirmar,
    renderTurnosAConfirmar,
    getTurnosExistentes,
    renderFiltrosExistentes,
};
