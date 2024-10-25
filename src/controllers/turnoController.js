const { pool } = require('../database/connectionMySQL');
const { getProfesional } = require('../controllers/profesionalController');
const { getEspecialidades } = require('../controllers/especialidadController');
const { buscarPacientePorDni } = require('../controllers/pacienteController');

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
        return result;
    } catch (error) {
        console.error(error);
        return [];
    }
};

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

const renderTurnos = async (req, res) => {
    const filtros = req.body;
    const turnos = await getTurnosDisponibles(filtros);
    res.render('turnoViews/listarTurnos', { turnos });
};

const editarTurno = async (req, res) => {
    const { ID_Turno } = req.params;
    const { Dni_Paciente, Motivo_Consulta, Clasificacion } = req.body;
    const accion = req.query.accion;

    try {
        if (accion === "buscar") {
            let paciente = null;
            if (Dni_Paciente) {
                paciente = await buscarPacientePorDni(Dni_Paciente);
            }

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
                mensajeConfirmacion: ''
            });

        } else if (accion === "reserva") {
            const {ID_Paciente, Dni_Paciente, Nombre_Paciente, Apellido_Paciente, Obra_Social, Email_Paciente } = req.body;

            await pool.query(
                "UPDATE turno SET Nombre_Paciente = ?, Apellido_Paciente = ?, Dni_Paciente = ?, Obra_Social = ?, Email_Paciente = ?, Motivo_Consulta = ?, Clasificacion = ?, ID_Paciente = ?, Estado = 'Reservado' WHERE ID_Turno = ?",
                [
                    req.body.Nombre_Paciente,
                    req.body.Apellido_Paciente,
                    Dni_Paciente,
                    req.body.Obra_Social,
                    req.bodyEmail_Paciente,
                    Motivo_Consulta,
                    Clasificacion,
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
    const turnos = await getTurnosReservados(filtros);
    
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

module.exports = {
    renderTurnosReservados,
    editTurnoReservado,
    renderFiltrosTurnos,
    renderTurnos,
    editarTurno,
    deactivateTurno,
    getTurnoByIdController,
};
