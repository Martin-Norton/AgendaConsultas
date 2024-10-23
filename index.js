// index.js
const express = require('express');
const path = require('path');
const methodOverride = require('method-override');

const profesionalRoutes = require('./src/routes/profesional'); 
const especialidadRoutes = require('./src/routes/especialidades');
const matriculaRoutes = require('./src/routes/matricula');
const agendaRoutes = require('./src/routes/agenda');
const turnoRoutes = require('./src/routes/turno');

const app = express();
const PORT = 3000;

app.use(express.urlencoded({ extended: true }));
app.set('views', path.join(__dirname, 'src', 'views'));
app.set('view engine', 'ejs');
app.use(express.static(path.join(__dirname,'src' ,'public')));
app.use(methodOverride('_method'));

// Ruta para la página de inicio
app.get('/', (req, res) => {
    res.render('index');
});

// Rutas
app.use('/', profesionalRoutes);
app.use('/', especialidadRoutes);
app.use('/', matriculaRoutes);
app.use('/', agendaRoutes);
app.use('/', turnoRoutes);
app.listen(PORT, () => {
    console.log(`Servidor escuchando en el puerto http://localhost:${PORT}`);
}); 
