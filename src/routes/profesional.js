
const express = require('express');
const router = express.Router();
const profesionalController = require('../controllers/profesionalController');


router.get('/profesional', profesionalController.renderProfesionales);


router.get('/profesional/agregar', (req, res) => {
    res.render('profesionalViews/agregarProfesional'); 
});


router.post('/profesional', profesionalController.addProfesional);


router.put('/profesional/:ID_Profesional', profesionalController.editProfesional);


router.get('/profesional/editar/:ID_Profesional', profesionalController.getProfesionalByIdController, async (req, res) => {
    const profesional = req.professional; 
    if (profesional) {
        res.render('profesionalViews/editarProfesional', { profesional });
    } else {
        res.status(404).send('Profesional no encontrado');
    }
});


router.post('/profesional/editar/:ID_Profesional', profesionalController.editProfesional);


router.get('/profesional/baja/:ID_Profesional', profesionalController.getProfesionalByIdController, async (req, res) => {
    const profesional = req.professional;
    if (profesional) {
        res.render('profesionalViews/bajaProfesional', { profesional });
    } else {
        res.status(404).send('Profesional no encontrado');
    }
});


router.post('/profesional/baja/:ID_Profesional', profesionalController.removeProfesional);

module.exports = router;