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
    saveUninitialized: true,
    cookie: { secure: false }
}))
//region roles secretaria y admin
app.get('/secretaria', (req, res) => {
    if (req.session.loggedin && req.session.role === 'Secretaria') {
        res.render('secretaria');
    } else {
        res.redirect('/login');
    }
});

app.get('/admin', (req, res) => {
    if (req.session.loggedin && req.session.role === 'Admin') {
        res.render('admin');
    } else {
        res.redirect('/login');
    }
});


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
                alertTitle: "Advertencia",
                alertMessage: "¡Ingrese USUARIO y CONTRASEÑA!",
                alertIcon: 'warning',
                showConfirmButton: true,
                timer: false,
                ruta: 'register/this'
        });
    }
});


app.post('/register/patient', async (req, res) => {
    const { dni, nombre, apellido, obra_social, telefono, email, pass } = req.body;
    const passwordHash = await bcrypt.hash(pass, 8);
    const connection = await pool.getConnection();

    try {
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
                User: dni,
                Name: `${nombre} ${apellido}`,
                Rol: 'Paciente',
                Pass: passwordHash
            }
        );
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
        connection.release();
    }
});

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

app.get('/logout/this', function (req, res) {
	req.session.destroy(() => {
	    res.redirect('/')
	})
    console.log("Sesión cerrada");
});


app.listen(PORT, () => {
    console.log(`Servidor escuchando en el puerto http://localhost:${PORT}`);
}); 

app.post('/auth', async (req, res) => {
    const user = req.body.user;
    const pass = req.body.pass;

    if (user && pass) {
        try {
            const [results] = await pool.query(
                'SELECT * FROM users WHERE user = ?',
                [user]
            );
            if (results.length === 0 || !results[0].Pass) {
                res.render('loginView/login', {
                    alert: true,
                    alertTitle: "Error",
                    alertMessage: "USUARIO y/o CONTRASEÑA incorrectas",
                    alertIcon: 'error',
                    showConfirmButton: true,
                    timer: false,
                    ruta: 'login/this'
                });
            } else {
                const isPasswordCorrect = await bcrypt.compare(pass, results[0].Pass);
                if (!isPasswordCorrect) {
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
                    req.session.loggedin = true;
                    req.session.name = results[0].Name;
                    req.session.role = results[0].Rol;
                    req.session.user = results[0].User;
                    console.log("Sesión iniciada:", req.session);
                    req.session.email = results[0].Email;
                    
                    if (req.session.role === 'Paciente') {
                        res.redirect('/turnos/paciente/filtros'); 
                    } else if (req.session.role === 'Secretaria') {
                        res.redirect('/secretaria');
                    } else if (req.session.role === 'Admin') {
                        res.redirect('/admin');
                    } else {
                        res.render('loginView/login', {
                            alert: true,
                            alertTitle: "Error",
                            alertMessage: "Rol de usuario desconocido",
                            alertIcon: 'error',
                            showConfirmButton: true,
                            timer: false,
                            ruta: ''
                        });
                    }
                }
            }
        } catch (error) {
            console.log("Error en la autenticación:", error);
            res.send('Hubo un error en el servidor');
        }
    } else {
        res.render('loginView/login', {
            alert: true,
            alertTitle: "Advertencia",
            alertMessage: "¡Ingrese USUARIO y CONTRASEÑA!",
            alertIcon: 'warning',
            showConfirmButton: true,
            timer: false,
            ruta: 'login/this'
        });
    }
});


app.get('/turnos/paciente/filtros', (req, res) => {
    if (req.session.loggedin) {
        res.render('turnoViews/filtrosTurnosPaciente', {
            login: true,
            name: req.session.name,
            role: req.session.role
        });
    } else {
        res.render('loginView/login', {
            alert: true,
            alertTitle: "Acceso denegado",
            alertMessage: "¡Debes iniciar sesión primero!",
            alertIcon: 'error',
            showConfirmButton: true,
            timer: false,
            ruta: 'login/this'
        });
    }
});
