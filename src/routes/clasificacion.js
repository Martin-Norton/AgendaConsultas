const express = require('express');
const router = express.Router();
const clasificacionController = require('../controllers/clasificacionController');

router.get('/clasificacion/inicio', clasificacionController.renderClasificaciones);

router.get('/clasificacion/agregar', (req, res) => {
    res.render('clasificacionViews/agregarClasificacion');
});

router.post('/clasificacion/inicio', clasificacionController.addClasificacion);

router.get('/clasificacion/editar/:ID_Clasificacion', clasificacionController.getClasificacionByIdController, (req, res) => {
    const clasificacion = req.clasificacion;
    if (clasificacion) {
        res.render('clasificacionViews/editarClasificacion', { clasificacion });
    } else {
        res.status(404).send('Clasificación no encontrada');
    }
});

router.post('/clasificacion/editar/:ID_Clasificacion', clasificacionController.editClasificacion);

router.get('/clasificacion/inactivar/:ID_Clasificacion', clasificacionController.getClasificacionByIdController, (req, res) => {
    const clasificacion = req.clasificacion;
    if (clasificacion) {
        res.render('clasificacionViews/inactivarClasificacion', { clasificacion });
    } else {
        res.status(404).send('Clasificación no encontrada');
    }
});

router.post('/clasificacion/inactivar/:ID_Clasificacion', clasificacionController.deactivateClasificacion);

module.exports = router;
