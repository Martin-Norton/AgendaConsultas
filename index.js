const express = require('express');
const app = express();
const PORT = 8080;
const dotenv = require('dotenv');
const path = require('path');

dotenv.config();

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

app.use(express.static(path.join(__dirname, 'public')));

app.listen(PORT, () => {
    console.log(`Servidor escuchando en http://localhost:${PORT}`);
});
