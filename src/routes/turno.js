// const express = require('express');
// const router = express.Router();
// const turnoController = require('../controllers/turnoController');

// router.get('/turno/filtros', turnoController.renderFiltrosTurnos);

// router.post('/turno/listarTurnos', turnoController.renderTurnos);

// router.get('/turno/editar/:ID_Turno', turnoController.getTurnoByIdController, (req, res) => {
//     const turno = req.turno;
//     if (turno) {
//         res.render('turnoViews/editarTurno', { turno });
//     } else {
//         res.status(404).send('Turno no encontrado');
//     }
// });

// router.post('/turno/editar/:ID_Turno', turnoController.editarTurno);

// router.post('/turno/inactivar/:ID_Turno', turnoController.deactivateTurno);

// //TURNOS RESERVADOS, MANEJO DE LA SECRETARIA
// router.get('/turno/reservados/filtros', turnoController.renderTurnosReservados);


// router.post('/turno/reservados/listarTurnos', turnoController.renderTurnosReservados);

// router.get('/turno/reservados/editar/:ID_Turno', turnoController.getTurnoByIdController, (req, res) => {
//     const turno = req.turno;
//     if (turno) {
//         res.render('turnoViews/editarTurnoReservado', { turno });
//     } else {
//         res.status(404).send('Turno no encontrado');
//     }
// });

// router.post('/turno/reservados/editar/:ID_Turno', turnoController.editTurnoReservado);

// // Turnos por paciente
// router.get('/turnos/por-paciente', turnoController.renderTurnosPorPacienteForm);
// router.post('/turnos/por-paciente/buscar', turnoController.buscarTurnosPorPaciente);
// router.get('/turno/alternativas/:ID_Turno', turnoController.obtenerAlternativasTurno);
// router.post('/turno/mover', turnoController.moverTurno);
// module.exports = router;
// const express = require('express');
// const router = express.Router();
// const turnoController = require('../controllers/turnoController');

// // Rutas existentes
// router.get('/turno/filtros', turnoController.renderFiltrosTurnos);
// router.post('/turno/listarTurnos', turnoController.renderTurnos);

// router.get('/turno/editar/:ID_Turno', turnoController.getTurnoByIdController, (req, res) => {
//     const turno = req.turno;
//     if (turno) {
//         res.render('turnoViews/editarTurno', { turno });
//     } else {
//         res.status(404).send('Turno no encontrado');
//     }
// });

// router.post('/turno/editar/:ID_Turno', turnoController.editarTurno);
// router.post('/turno/inactivar/:ID_Turno', turnoController.deactivateTurno);

// // TURNOS RESERVADOS, MANEJO DE LA SECRETARIA
// router.get('/turno/reservados/filtros', turnoController.renderTurnosReservados);
// router.post('/turno/reservados/listarTurnos', turnoController.renderTurnosReservados);

// router.get('/turno/reservados/editar/:ID_Turno', turnoController.getTurnoByIdController, (req, res) => {
//     const turno = req.turno;
//     if (turno) {
//         res.render('turnoViews/editarTurnoReservado', { turno });
//     } else {
//         res.status(404).send('Turno no encontrado');
//     }
// });

// router.post('/turno/reservados/editar/:ID_Turno', turnoController.editTurnoReservado);

// // Turnos por paciente
// router.get('/turnos/por-paciente', turnoController.renderTurnosPorPacienteForm);
// router.post('/turnos/por-paciente/buscar', turnoController.buscarTurnosPorPaciente);
// router.get('/turno/alternativas/:ID_Turno', turnoController.obtenerAlternativasTurno);
// router.post('/turno/mover', turnoController.moverTurno);

// // Nueva ruta para turnos disponibles
// router.post('/turnos/disponibles', async (req, res) => {
//     try {
//         await turnoController.getTurnosDisponibles(req.body, res);
//     } catch (error) {
//         console.error("Error en la ruta:", error);
//         res.status(500).json({ message: "Error interno del servidor" });
//     }
// });

// module.exports = router;
const express = require('express');
const router = express.Router();
const turnoController = require('../controllers/turnoController');
const authMiddleware = require('../middlewares/authMiddleware');

// Rutas para filtros y listado de turnos
router.get('/turno/filtros', turnoController.renderFiltrosTurnos);
router.post('/turno/listarTurnos', turnoController.renderTurnos);

// Rutas para editar turnos
router.get('/turno/editar/:ID_Turno', turnoController.getTurnoByIdController, (req, res) => {
    const turno = req.turno;
    if (turno) {
        res.render('turnoViews/editarTurno', { turno });
    } else {
        res.status(404).send('Turno no encontrado');
    }
});
router.post('/turno/editar/:ID_Turno', turnoController.editarTurno);
router.post('/turno/inactivar/:ID_Turno', turnoController.deactivateTurno);

// Rutas para turnos reservados (manejados por la secretaria)
router.get('/turno/reservados/filtros', turnoController.renderTurnosReservados);
router.post('/turno/reservados/listarTurnos', turnoController.renderTurnosReservados);

router.get('/turno/reservados/editar/:ID_Turno', turnoController.getTurnoByIdController, (req, res) => {
    const turno = req.turno;
    if (turno) {
        res.render('turnoViews/editarTurnoReservado', { turno });
    } else {
        res.status(404).send('Turno no encontrado');
    }
});
router.post('/turno/reservados/editar/:ID_Turno', turnoController.editTurnoReservado);

// Rutas para turnos por paciente
router.get('/turnos/por-paciente', turnoController.renderTurnosPorPacienteForm);
router.post('/turnos/por-paciente/buscar', turnoController.buscarTurnosPorPaciente);

// Rutas para manejar alternativas de turnos
router.get('/turno/alternativas/:ID_Turno', turnoController.obtenerAlternativasTurno);
router.post('/turno/mover', turnoController.moverTurno);

// Nueva ruta para obtener turnos disponibles
router.post('/turnos/disponibles', async (req, res) => {
    try {
        await turnoController.getTurnosDisponibles(req.body, res);
    } catch (error) {
        console.error("Error en la ruta de turnos disponibles:", error);
        res.status(500).json({ message: "Error interno del servidor" });
    }
});

//region paciente
router.get('/turnos/paciente/filtros', authMiddleware.ensurePatientRole, turnoController.renderFiltrosTurnosPaciente);

router.post('/turnos/paciente/listarTurnos', authMiddleware.ensurePatientRole, turnoController.renderTurnosPaciente);

router.get('/turnos/paciente/editar/:ID_Turno', authMiddleware.ensurePatientRole, turnoController.editarTurnoPaciente);

router.post('/turnos/paciente/editar/:ID_Turno', authMiddleware.ensurePatientRole, turnoController.editarTurnoPaciente);
//end region paciente


module.exports = router;
