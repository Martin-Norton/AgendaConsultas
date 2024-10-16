// src/routes/agenda.js
const express = require('express');
const router = express.Router();
const agendaController = require('../controllers/agendaController');
const especialidadController = require('../controllers/especialidadController');

// Renderizar el formulario para agregar agenda
router.get('/agenda/agregar', agendaController.renderAgregarAgenda);

// Agregar una nueva agenda
router.post('/agenda', agendaController.createAgenda); // Cambié el nombre a createAgenda

// Renderizar la vista de listar agendas
router.get('/agenda', agendaController.renderAgendas);

// Obtener especialidades por ID de profesional
router.get('/especialidad/:profesionalId', especialidadController.getEspecialidadesPorProfesional);
router.get('/:profesionalId', especialidadController.getEspecialidadesPorProfesional);

module.exports = router;