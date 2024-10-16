const express = require('express');
const router = express.Router();
const especialidadController = require('../controllers/especialidadController');

// Mostrar la lista de especialidades
router.get('/especialidad', especialidadController.renderEspecialidades);

// Mostrar el formulario para agregar una nueva especialidad
router.get('/especialidad/agregar', (req, res) => {
    res.render('especialidadViews/agregarEspecialidad');
});

// Agregar una nueva especialidad
router.post('/especialidad', especialidadController.addEspecialidad);

// Mostrar el formulario para editar una especialidad
router.get('/especialidad/editar/:ID_Especialidad', especialidadController.getEspecialidadByIdController, (req, res) => {
    const especialidad = req.especialidad;
    if (especialidad) {
        res.render('especialidadViews/editarEspecialidad', { especialidad });
    } else {
        res.status(404).send('Especialidad no encontrada');
    }
});

// Actualizar una especialidad
router.post('/especialidad/editar/:ID_Especialidad', especialidadController.editEspecialidad);

// Confirmar inactivación de una especialidad
router.get('/especialidad/inactivar/:ID_Especialidad', especialidadController.getEspecialidadByIdController, (req, res) => {
    const especialidad = req.especialidad;
    if (especialidad) {
        res.render('especialidadViews/inactivarEspecialidad', { especialidad });
    } else {
        res.status(404).send('Especialidad no encontrada');
    }
});

// Inactivar una especialidad
router.post('/especialidad/inactivar/:ID_Especialidad', especialidadController.deactivateEspecialidad);

module.exports = router;
