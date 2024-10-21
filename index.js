//index.js
const express = require('express');
const path = require('path');
const methodOverride = require('method-override');

const { renderProfesionales } = require('./src/controllers/profesionalController');
const { renderEspecialidades } = require('./src/controllers/especialidadController');
const { renderMatriculas } = require('./src/controllers/matriculaController');
const { renderAgendas } = require('./src/controllers/agendaController');
const { renderTurnos } = require('./src/controllers/turnoController');

const profesionalRoutes = require('./src/routes/profesional'); 
const especialidadRoutes = require('./src/routes/especialidades');
const matriculaRoutes = require('./src/routes/matricula');
const agendaRoutes = require('./src/routes/agenda');
const turnoRoutes = require('./src/routes/turno');

const app = express();
const PORT = 3000;

// Middleware para analizar el cuerpo de las solicitudes
app.use(express.json()); // Para manejar datos JSON
app.use(express.urlencoded({ extended: true })); // Para manejar datos de formularios

// Configura el motor de plantillas
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'src', 'views')); // Ruta al directorio de las plantillas

// Configura el directorio publico
app.use(express.static(path.join(__dirname,'src' ,'public')));// Ruta al directorio publico
app.use(methodOverride('_method'));

// Rutas
app.use('/', profesionalRoutes);
app.use('/', especialidadRoutes);
app.use('/', matriculaRoutes);
app.use('/', agendaRoutes);
app.use('/', turnoRoutes);

app.get('/', (req, res) => {
    res.render('index');
});

// Eliminar rutas duplicadas aquí si están presentes en los archivos de rutas
// app.get('/profesional', renderProfesionales); // No necesario si ya está en profesionalRoutes
// app.get('/especialidad', renderEspecialidades); // No necesario si ya está en especialidadRoutes
// app.get('/matricula', renderMatriculas); // No necesario si ya está en matriculaRoutes
// app.get('/agenda', renderAgendas); // No necesario si ya está en agendaRoutes
// app.get('/turno', renderTurnos); // No necesario si ya está en turnoRoutes

app.listen(PORT, () => {
    console.log(`Servidor escuchando en el puerto http://localhost:${PORT}`);
});
