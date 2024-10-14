const express = require('express');
const axios = require('axios');
const path = require('path');

// Inicializa la aplicación Express
const app = express();
const PORT = 3000;

// Configura el motor de plantillas y la ruta de las vistas
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'src','views'));

// Sirve archivos estáticos desde la carpeta 'public'
app.use(express.static(path.join(__dirname, 'src','public')));

// Define la ruta principal
app.get('/', (req, res) => {
    res.render('index');
});

// Inicia el servidor
app.listen(PORT, () => {
    console.log(`Servidor escuchando en el puerto http://localhost:${PORT}`);
});
