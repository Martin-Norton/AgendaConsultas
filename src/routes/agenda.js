
const express = require('express');
const router = express.Router();
const agendaController = require('../controllers/agendaController');
const especialidadController = require('../controllers/especialidadController');


router.get('/agenda/agregar', agendaController.renderAgregarAgenda);


router.post('/agenda', agendaController.createAgenda);


router.get('/agenda', agendaController.renderAgendas);


router.get('/especialidad/:profesionalId', especialidadController.getEspecialidadesPorProfesional);
router.get('/:profesionalId', especialidadController.getEspecialidadesPorProfesional);


router.get('/agenda/editar/:ID_Agenda', agendaController.renderEditarAgenda);


router.post('/agenda/:ID_Agenda', agendaController.editarAgenda);


router.post('/agenda/inactivar/:ID_Agenda', agendaController.inactivarAgenda);



module.exports = router;
