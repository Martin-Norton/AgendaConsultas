const express = require('express');
const router = express.Router();
const pacienteController = require('../controllers/pacienteController');

router.get('/paciente/inicio', pacienteController.renderPacientes);

router.get('/paciente/agregar', (req, res) => {
    res.render('pacienteViews/agregarPaciente');
});

router.post('/paciente', pacienteController.addPaciente);

router.get('/paciente/editar/:ID_Paciente', pacienteController.getPacienteByIdController, async (req, res) => {
    const paciente = req.paciente;
    if (paciente) {
        res.render('pacienteViews/editarPaciente', { paciente });
    } else {
        res.status(404).send('Paciente no encontrado');
    }
});

router.post('/paciente/editar/:ID_Paciente', pacienteController.editPaciente);

router.get('/paciente/baja/:ID_Paciente', pacienteController.getPacienteByIdController, async (req, res) => {
    const paciente = req.paciente;
    if (paciente) {
        res.render('pacienteViews/bajaPaciente', { paciente });
    } else {
        res.status(404).send('Paciente no encontrado');
    }
});

router.post('/paciente/baja/:ID_Paciente', pacienteController.removePaciente);

module.exports = router;
