const { pool } = require('../database/connectionMySQL');

const agregarAListaEspera = async (req, res) => {
    const { agendaId } = req.params;
    const { nombrePaciente, dniPaciente, motivoConsulta } = req.body;

    try {
        const sqlInsertarListaEspera = `
            INSERT INTO lista_espera (ID_Agenda, Nombre_Paciente, DNI_Paciente, Motivo_Consulta, Fecha_Registro, Activo)
            VALUES (?, ?, ?, ?, NOW(), 1)
        `;
        await pool.query(sqlInsertarListaEspera, [agendaId, nombrePaciente, dniPaciente, motivoConsulta]);
        
        res.redirect('/turno/filtros');
    } catch (error) {
        console.error('Error al agregar a la lista de espera:', error);
        res.status(500).json({ message: 'Error al agregar a la lista de espera' });
    }
};

module.exports = {
    agregarAListaEspera
};
