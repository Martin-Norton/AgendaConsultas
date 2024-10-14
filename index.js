// index.js
const express = require('express');
const path = require('path');
const { renderProfesionales } = require('./src/controllers/profesionalController'); // Ajusta la ruta según tu estructura
const profesionalRoutes = require('./src/routes/profesional'); 

const app = express();
const PORT = 3000;

// Configura el motor de plantillas
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'src', 'views')); // Establece la ruta de las vistas
app.use(express.urlencoded({ extended: true }));

app.get('/', (req, res) => {
    res.render('index');
})
// Ruta para mostrar los profesionales
//app.get('/profesionales', renderProfesionales); // Llama a renderProfesionales

app.use('/profesional', profesionalRoutes);
app.listen(PORT, () => {
    console.log(`Servidor escuchando en el puerto http://localhost:${PORT}`);
});