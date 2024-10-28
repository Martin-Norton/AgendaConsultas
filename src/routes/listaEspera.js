const express = require('express');
const router = express.Router();
const listaEsperaController = require('../controllers/listaEsperaController');

router.get('/listaEspera/:agendaId', (req, res) => {
    const { agendaId } = req.params;
    res.render('listaEsperaViews/registrarEnListaEspera', { agendaId });
});

router.post('/listaEspera/:agendaId', listaEsperaController.agregarAListaEspera);

module.exports = router;
