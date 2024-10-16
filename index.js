// index.js
const express = require('express');
const path = require('path');

const { renderProfesionales } = require('./src/controllers/profesionalController');
const { renderEspecialidades } = require('./src/controllers/especialidadController');
const { renderMatriculas } = require('./src/controllers/matriculaController');

const profesionalRoutes = require('./src/routes/profesional'); 
const especialidadRoutes = require('./src/routes/especialidades');
const matriculaRoutes = require('./src/routes/matricula');

const app = express();
const PORT = 3000;

// Configura el motor de plantillas
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'src', 'views')); // Ruta al directorio de las plantillas
app.use(express.urlencoded({ extended: true }));

app.use('/', profesionalRoutes);
app.use('/', especialidadRoutes);
app.use('/', matriculaRoutes);

app.get('/', (req, res) => {
    res.render('index');
})

// Ruta para mostrar los profesionales
app.get('/profesional', renderProfesionales); // Llama a renderProfesionales
// Ruta para mostrar las especialidades
app.get('/especialidad', renderEspecialidades); // Llama a renderEspecialidades
// Ruta para mostrar las matriculas
app.get('/matricula', renderMatriculas);

app.use('/profesional', profesionalRoutes);
app.use('/especialidad', especialidadRoutes);
app.use('/matricula', matriculaRoutes);

app.listen(PORT, () => {
    console.log(`Servidor escuchando en el puerto http://localhost:${PORT}`);
});