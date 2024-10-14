// src/routes/profesionales.js
const express = require('express');
const router = express.Router();
const profesionalController = require('../controllers/profesionalController');

// Mostrar la lista de profesionales
router.get('/profesional', profesionalController.renderProfesionales);

// Mostrar el formulario para agregar un nuevo profesional
router.get('/profesional/agregar', (req, res) => {
    res.render('profesionalViews/agregarProfesional'); // Renderiza la vista para agregar un nuevo profesional
});

// Agregar un nuevo profesional
router.post('/profesional', profesionalController.addProfesional);

// Mostrar el formulario para editar un profesional
router.get('/profesional/editar/:id', async (req, res) => {
    const profesional = await profesionalController.getProfesionalById(req.params.id); // Asegúrate de implementar esta función
    res.render('profesionalViews/editarProfesional', { profesional });
});

// Actualizar un profesional
router.post('/profesional/editar/:id', profesionalController.editProfesional);

// Confirmar eliminación de un profesional
router.get('/profesional/baja/:id', async (req, res) => {
    const profesional = await profesionalController.getProfesionalById(req.params.id); // Asegúrate de implementar esta función
    res.render('profesionalViews/bajaProfesional', { profesional });
});

// Eliminar un profesional
router.post('/profesional/baja/:id', profesionalController.removeProfesional);

module.exports = router;
