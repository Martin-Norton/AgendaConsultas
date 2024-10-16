// src/routes/matricula.js
const express = require('express');
const router = express.Router();
const matriculaController = require('../controllers/matriculaController');

router.get('/matriculas', matriculaController.renderMatriculas);

// Mostrar formulario para agregar matrícula
router.get('/matricula/agregar', matriculaController.renderAgregarMatricula);

// Agregar nueva matrícula
router.post('/matricula', matriculaController.addMatricula);

// Dar de baja una matrícula
router.post('/matricula/baja/:ID_Matricula', matriculaController.bajaMatricula);

module.exports = router;
