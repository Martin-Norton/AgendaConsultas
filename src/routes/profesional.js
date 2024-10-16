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
router.get('/profesional/editar/:ID_Profesional', profesionalController.getProfesionalByIdController, async (req, res) => {
    const profesional = req.professional; // Asegúrate de que getProfesionalByIdController funcione
    if (profesional) {
        res.render('profesionalViews/editarProfesional', { profesional });
    } else {
        res.status(404).send('Profesional no encontrado');
    }
});

// Actualizar un profesional
router.post('/profesional/editar/:ID_Profesional', profesionalController.editProfesional);

// Confirmar eliminación de un profesional
router.get('/profesional/baja/:ID_Profesional', profesionalController.getProfesionalByIdController, async (req, res) => {
    const profesional = req.professional;
    if (profesional) {
        res.render('profesionalViews/bajaProfesional', { profesional });
    } else {
        res.status(404).send('Profesional no encontrado');
    }
});

// Eliminar un profesional
router.post('/profesional/baja/:ID_Profesional', profesionalController.removeProfesional);

module.exports = router;