const express = require('express');
const router = express.Router();
const turnoController = require('../controllers/turnoController');

// Listar todos los turnos
router.get('/turno', turnoController.renderTurnos);

// Formulario para agregar un turno
router.get('/turno/agregar', (req, res) => {
    res.render('turnosViews/agregarTurno');
});

// Agregar un nuevo turno
router.post('/turno', turnoController.addTurno);

// Formulario para editar un turno
router.get('/turno/editar/:ID_Turno', turnoController.getTurnoByIdController, (req, res) => {
    const turno = req.turno;
    if (turno) {
        res.render('turnosViews/editarTurno', { turno });
    } else {
        res.status(404).send('Turno no encontrado');
    }
});
// Formulario para agregar un turno
router.get('/turno/agregar', turnoController.renderAgregarTurno);

// Obtener turnos disponibles
router.get('/turno/disponibles', turnoController.getTurnosDisponiblesController);


// Inactivar un turno
router.get('/turno/inactivar/:ID_Turno', turnoController.deactivateTurno);

module.exports = router;
