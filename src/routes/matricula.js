
const express = require('express');
const router = express.Router();
const matriculaController = require('../controllers/matriculaController');

router.get('/matricula', matriculaController.renderMatriculas);


router.get('/matricula/agregar', matriculaController.renderAgregarMatricula);


router.post('/matricula', matriculaController.addMatricula);


router.post('/matricula/baja/:ID_Matricula', matriculaController.bajaMatricula);

module.exports = router;
