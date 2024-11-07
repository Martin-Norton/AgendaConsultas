
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


const app = express();
const PORT = 3000;

const { pool } = require('./src/database/connectionMySQL');

app.use(express.urlencoded({ extended: false }));
app.set('views', path.join(__dirname, 'src', 'views'));
app.set('view engine', 'ejs');

const bcrypt = require('bcryptjs'); 
const session = require('express-session');
const { error } = require('console');

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
    res.render('index', {msg:''});
});

app.use('/', profesionalRoutes);
app.use('/', especialidadRoutes);
app.use('/', matriculaRoutes);
app.use('/', agendaRoutes);
app.use('/', turnoRoutes);
app.use('/', pacienteRoutes);
app.use('/', clasificacionRoutes);

app.get('/login/this', (req, res) => {
    res.render('loginView/login');
});
app.get('/register/this', (req, res) => {
    res.render('loginView/register');
});
app.get('/register/patient', (req, res) => {
    res.render('loginView/registerPaciente');
})
//register
app.post('/register/this', async (req, res) => {
    const user = req.body.user;
	const name = req.body.name;
    const rol = req.body.rol;
	const pass = req.body.pass;
	let passwordHash = await bcrypt.hash(pass, 8);
    try {
        const [results] = await pool.query(
            'INSERT INTO users SET ?', 
            { user, name, rol, pass: passwordHash }
        );
        res.render('loginView/register', {
			alert: true,
			alertTitle: "Registro exitoso",
			alertMessage: "El usuario ha sido registrado correctamente.",
			alertIcon: "success",
			showConfirmButton: true,
			timer: false,
			ruta: ""
		});		
    } catch (error) {
        console.log(error);
        res.render('loginView/register', {
            alert: true,
            alertTitle: "Error",
            alertMessage: "Error en el registro",
            alertIcon: 'error',
            showConfirmButton: true,
            timer: false,
            ruta: 'register/this'
        });
    }
});

// login
app.post('/auth', async (req, res)=>{
    const user = req.body.user;
    const pass = req.body.pass;
    let passwordHash = await bcrypt.hash(pass, 8)
    if (user && pass) {
        try {
            // Ejecuta la consulta y muestra los resultados para depuración
            const [results] = await pool.query(
                'SELECT * FROM users WHERE user = ?', 
                [user]
            );
            console.log("Resultados de la consulta:", results); // Verificar resultados de la consulta

            // Verifica si el usuario existe y si el campo de contraseña está presente
            if (results.length === 0 || !results[0].Pass) {
                console.log("Usuario no encontrado o sin campo de contraseña");
                res.render('loginView/login', {
                    alert: true,
                    alertTitle: "Error",
                    alertMessage: "USUARIO y/o PASSWORD incorrectas",
                    alertIcon: 'error',
                    showConfirmButton: true,
                    timer: false,
                    ruta: 'login/this'
                });
            } else {
                // Procede a comparar la contraseña si el usuario fue encontrado
                const isPasswordCorrect = await bcrypt.compare(pass, results[0].Pass);
                if (!isPasswordCorrect) {
                    res.render('loginView/login', {
                        alert: true,
                        alertTitle: "Error",
                        alertMessage: "USUARIO y/o PASSWORD incorrectas",
                        alertIcon: 'error',
                        showConfirmButton: true,
                        timer: false,
                        ruta: ''
                    });
                } else {
                    req.session.loggedin = true;
                    req.session.name = results[0].name;
                    res.render('loginView/login', {
                        alert: true,
                        alertTitle: "Conexión exitosa",
                        alertMessage: "¡LOGIN CORRECTO!",
                        alertIcon: 'success',
                        showConfirmButton: false,
                        timer: 1500,
                        ruta: ''
                    });
                }
            }
        } catch (error) {
            console.log("Error en la autenticación:", error); // Registrar errores específicos
            res.send('Hubo un error en el servidor');
        }
    } else {
        res.send('Por favor ingrese usuario y contraseña!');
    }
})

//REGION PACIENTE REGISTER
app.post('/register/patient', async (req, res) => {
    const { dni, nombre, apellido, obra_social, telefono, email, pass } = req.body;
    const passwordHash = await bcrypt.hash(pass, 8);

    // Obtén una conexión individual del pool
    const connection = await pool.getConnection();

    try {
        // Inicia una transacción con la conexión
        await connection.beginTransaction();

        const [pacienteResult] = await connection.query(
            'INSERT INTO paciente SET ?',
            {
                Dni_Paciente: dni,
                Nombre_Paciente: nombre,
                Apellido_Paciente: apellido,
                Obra_Social: obra_social,
                Telefono: telefono,
                Email: email,
                Activo: 1
            }
        );

        await connection.query(
            'INSERT INTO users SET ?',
            {
                User: email,
                Name: `${nombre} ${apellido}`,
                Rol: 'Paciente',
                Pass: passwordHash
            }
        );

        // Confirma la transacción
        await connection.commit();

        res.render('loginView/registerPaciente', {
            alert: true,
            alertTitle: "Registro exitoso",
            alertMessage: "El paciente ha sido registrado correctamente.",
            alertIcon: "success",
            showConfirmButton: true,
            timer: false,
            ruta: ""
        });
    } catch (error) {
        console.log(error);
        
        // Si ocurre un error, revierte la transacción
        await connection.rollback();

        res.render('loginView/registerPaciente', {
            alert: true,
            alertTitle: "Error",
            alertMessage: "Error en el registro",
            alertIcon: 'error',
            showConfirmButton: true,
            timer: false,
            ruta: 'register/patient'
        });
    } finally {
        // Libera la conexión de vuelta al pool
        connection.release();
    }
});

//END REGION PACIENTE REGISTER

app.get('/', (req, res)=> {
	if (req.session.loggedin) {
		res.render('index',{
			login: true,
			name: req.session.name			
		});		
	} else {
		res.render('index',{
			login:false,
			name:'Debe iniciar sesión',			
		});				
	}
	res.end();
});
        
app.use(function(req, res, next) {
    if (!req.user)
        res.header('Cache-Control', 'private, no-cache, no-store, must-revalidate');
    next();
});

 //Logout
app.get('/logout', function (req, res) {
	req.session.destroy(() => {
	  res.redirect('/')
	})
});


app.listen(PORT, () => {
    console.log(`Servidor escuchando en el puerto http://localhost:${PORT}`);
}); 

