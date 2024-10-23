const express = require('express');
const router = express.Router();
const turnoController = require('../controllers/turnoController');

// Mostrar la lista de turnos y formulario de filtros
router.get('/turno/inicio', (req, res) => {
    res.render('turnoViews/filtrosTurnos'); // Vista con el formulario de filtros
});

// Filtrar turnos
router.post('/turno/turnos', turnoController.renderTurnos);

// Mostrar el formulario para editar un turno
router.get('/turno/editar/:ID_Turno', turnoController.getTurnoByIdController, (req, res) => {
    const turno = req.turno;
    if (turno) {
        res.render('turnoViews/editarTurno', { turno });
    } else {
        res.status(404).send('Turno no encontrado');
    }
});

// Actualizar un turno (reservarlo)
router.post('/turno/editar/:ID_Turno', turnoController.editTurno);

// Inactivar un turno
router.post('/turno/inactivar/:ID_Turno', turnoController.deactivateTurno);

module.exports = router;
