const express = require('express');
const router = express.Router();
const especialidadController = require('../controllers/especialidadController');

router.get('/especialidad', especialidadController.renderEspecialidades);


router.get('/especialidad/agregar', (req, res) => {
    res.render('especialidadViews/agregarEspecialidad');
});


router.post('/especialidad', especialidadController.addEspecialidad);


router.get('/especialidad/editar/:ID_Especialidad', especialidadController.getEspecialidadByIdController, (req, res) => {
    const especialidad = req.especialidad;
    if (especialidad) {
        res.render('especialidadViews/editarEspecialidad', { especialidad });
    } else {
        res.status(404).send('Especialidad no encontrada');
    }
});


router.post('/especialidad/editar/:ID_Especialidad', especialidadController.editEspecialidad);


router.get('/especialidad/inactivar/:ID_Especialidad', especialidadController.getEspecialidadByIdController, (req, res) => {
    const especialidad = req.especialidad;
    if (especialidad) {
        res.render('especialidadViews/inactivarEspecialidad', { especialidad });
    } else {
        res.status(404).send('Especialidad no encontrada');
    }
});


router.post('/especialidad/inactivar/:ID_Especialidad', especialidadController.deactivateEspecialidad);

router.get('/especialidad/:profesionalId', especialidadController.getEspecialidadesPorProfesional);

module.exports = router;
