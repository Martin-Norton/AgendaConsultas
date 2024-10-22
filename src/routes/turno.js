const express = require('express');
const router = express.Router();
const turnoController = require('../controllers/turnoController');

router.get('/turno', turnoController.renderTurnos); // Asegúrate de que renderTurnos no sea undefined
router.get('/editar/:ID_Turno', turnoController.renderEditarTurno);
router.post('/editar/:ID_Turno', turnoController.editTurno);
router.post('/deactivate/:ID_Turno', turnoController.deactivateTurno);

module.exports = router;
