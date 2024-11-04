// index.js
const express = require('express');
const path = require('path');
const methodOverride = require('method-override');
const bodyParser = require('body-parser');

const profesionalRoutes = require('./src/routes/profesional'); 
const especialidadRoutes = require('./src/routes/especialidades');
const matriculaRoutes = require('./src/routes/matricula');
const agendaRoutes = require('./src/routes/agenda');
const turnoRoutes = require('./src/routes/turno');
const pacienteRoutes = require('./src/routes/paciente');
const clasificacionRoutes = require('./src/routes/clasificacion');
const listaEsperaRoutes = require('./src/routes/listaEspera');


const app = express();
const PORT = 3000;

const conection  = require('./src/database/connectionMySQL');

app.use(express.urlencoded({ extended: true }));
app.set('views', path.join(__dirname, 'src', 'views'));
app.set('view engine', 'ejs');

const bcrypt = require('bcryptjs'); 
const session = require('express-session');

app.use(session({
    secret: 'secret',
    resave: true,
    saveUninitialized: true
}))

app.use(express.static(path.join(__dirname,'src' ,'public')));
app.use(methodOverride('_method'));

app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.json());

app.get('/', (req, res) => {
    res.render('index');
});

app.use('/', profesionalRoutes);
app.use('/', especialidadRoutes);
app.use('/', matriculaRoutes);
app.use('/', agendaRoutes);
app.use('/', turnoRoutes);
app.use('/', pacienteRoutes);
app.use('/', clasificacionRoutes);
app.use('/', listaEsperaRoutes);

app.get('/login/this', (req, res) => {
    res.render('login');
});
app.get('/register/this', (req, res) => {
    res.render('register');
});

app.listen(PORT, () => {
    console.log(`Servidor escuchando en el puerto http://localhost:${PORT}`);
}); 
