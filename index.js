// index.js
const express = require('express');
const path = require('path');
const { renderProfesionales } = require('./src/controllers/profesionalController'); // Ajusta la ruta según tu estructura

const app = express();
const PORT = 6000;

// Configura el motor de plantillas
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'src', 'views')); // Establece la ruta de las vistas

// Ruta para mostrar los profesionales
app.get('/profesionales', renderProfesionales); // Llama a renderProfesionales

app.listen(PORT, () => {
    console.log(`Servidor escuchando en el puerto http://localhost:${PORT}`);
});
