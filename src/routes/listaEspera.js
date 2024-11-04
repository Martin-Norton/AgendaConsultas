const express = require('express');
const router = express.Router();
const listaEsperaController = require('../controllers/listaDeEsperaController');
const {buscarPacientePorDni} = require('../controllers/pacienteController');

// Ruta para buscar el paciente por DNI
router.post('/listaEspera/buscar', buscarPacientePorDni);

// Ruta para agregar el paciente a la lista de espera
router.post('/listaEspera/agregar/:agendaId', listaEsperaController.agregarAListaEspera);


module.exports = router;
