const express = require('express');
const router = express.Router();
const turnoController = require('../controllers/turnoController');

router.get('/turno/filtros', turnoController.renderFiltrosTurnos);

router.post('/turno/listarTurnos', turnoController.renderTurnos);

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

//TURNOS RESERVADOS, MANEJO DE LA SECRETARIA
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

// Turnos por paciente
router.get('/turnos/por-paciente', turnoController.renderTurnosPorPacienteForm);
router.post('/turnos/por-paciente/buscar', turnoController.buscarTurnosPorPaciente);
router.get('/turno/alternativas/:ID_Turno', turnoController.obtenerAlternativasTurno);
router.post('/turno/mover', turnoController.moverTurno);
module.exports = router;
