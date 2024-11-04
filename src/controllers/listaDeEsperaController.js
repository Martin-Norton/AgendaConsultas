const { pool } = require('../database/connectionMySQL');
const agregarAListaEspera = async (req, res) => {
    const { agendaId } = req.params;
    const { accion } = req.query;
    const { dniPaciente, motivoConsulta } = req.body;

    if (accion === 'buscar') {
        try {
            const paciente = await pacienteController.buscarPacientePorDni(dniPaciente);
            if (paciente) {
                res.render('listaEsperaViews/registrarEnListaEspera', {
                    agendasProfesionales: [{ ID_Agenda: agendaId }],
                    paciente, // para que aparezca en el formulario de registro
                    dniPaciente,
                });
            } else {
                res.render('listaEsperaViews/registrarEnListaEspera', {
                    agendasProfesionales: [{ ID_Agenda: agendaId }],
                    error: 'Paciente no encontrado',
                });
            }
        } catch (error) {
            console.error(error);
            res.status(500).send('Error al buscar paciente');
        }
    } else if (accion === 'registrar') {
        try {
            await listaEsperaModel.agregarPacienteAListaEspera({
                ID_Paciente: req.body.ID_Paciente,
                ID_Agenda: agendaId,
                motivoConsulta,
            });
            res.send('Paciente agregado a la lista de espera con éxito');
        } catch (error) {
            console.error(error);
            res.status(500).send('Error al agregar a la lista de espera');
        }
    } else {
        res.status(400).send('Acción no válida');
    }
};

module.exports = {
    agregarAListaEspera
};
