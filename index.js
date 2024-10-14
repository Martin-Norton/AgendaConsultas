import express from 'express';
import axios from 'axios';
import path from 'path';
const app = express();
const PORT = 6000;

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

app.use(express.static(path.join(__dirname, 'public')));

app.get('/',(req, res)=>{
    res.render('index');
})

app.listen(PORT, () => {
    console.log(`Servidor escuchando en el puerto http://localhost::${PORT}`);
});
