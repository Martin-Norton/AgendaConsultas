// src/routes/profesional.js
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
router.get('/profesional/editar/:id', profesionalController.getProfesionalById, async (req, res) => {
    const profesional = req.professional; // Asumiendo que agregas el profesional a la solicitud
    if (profesional) {
        res.render('profesionalViews/editarProfesional', { profesional });
    } else {
        res.status(404).send('Profesional no encontrado'); // Manejo de errores si el profesional no existe
    }
});

// Actualizar un profesional
router.post('/profesional/editar/:id', profesionalController.editProfesional);

// Confirmar eliminación de un profesional
router.get('/profesional/baja/:id', profesionalController.getProfesionalById, async (req, res) => {
    const profesional = req.professional; // Asumiendo que agregas el profesional a la solicitud
    if (profesional) {
        res.render('profesionalViews/bajaProfesional', { profesional });
    } else {
        res.status(404).send('Profesional no encontrado'); // Manejo de errores si el profesional no existe
    }
});

// Eliminar un profesional
router.post('/profesional/baja/:id', profesionalController.removeProfesional);

module.exports = router;
