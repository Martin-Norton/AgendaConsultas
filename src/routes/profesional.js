// src/routes/profesionales.js
const express = require('express');
const router = express.Router();
const profesionalController = require('../controllers/profesionalController');

// Mostrar la lista de profesionales
router.get('/profesionales', profesionalController.renderProfesionales);

// Mostrar el formulario para agregar un nuevo profesional
router.get('/profesionales/agregar', (req, res) => {
    res.render('profesionalViews/agregarProfesional'); // Renderiza la vista para agregar un nuevo profesional
});

// Agregar un nuevo profesional
router.post('/profesionales', profesionalController.addProfesional);

// Mostrar el formulario para editar un profesional
router.get('/profesionales/editar/:id', async (req, res) => {
    const profesional = await profesionalController.getProfesionalById(req.params.id); // Asegúrate de implementar esta función
    res.render('profesionalViews/editarProfesional', { profesional });
});

// Actualizar un profesional
router.post('/profesionales/editar/:id', profesionalController.editProfesional);

// Confirmar eliminación de un profesional
router.get('/profesionales/baja/:id', async (req, res) => {
    const profesional = await profesionalController.getProfesionalById(req.params.id); // Asegúrate de implementar esta función
    res.render('profesionalViews/bajaProfesional', { profesional });
});

// Eliminar un profesional
router.post('/profesionales/baja/:id', profesionalController.removeProfesional);

module.exports = router;
