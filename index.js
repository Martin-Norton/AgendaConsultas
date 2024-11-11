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
    cookie: { secure: false } // Cambia a true si usas HTTPS
}))
//region roles secretaria y admin
// Ruta para la vista Secretaria
app.get('/secretaria', (req, res) => {
    if (req.session.loggedin && req.session.role === 'Secretaria') {
        res.render('secretaria'); // Aquí renderizamos la vista Secretaria.ejs
    } else {
        res.redirect('/login'); // Si no está logueado o no tiene el rol adecuado, redirige a login
    }
});

// Ruta para la vista Admin
app.get('/admin', (req, res) => {
    if (req.session.loggedin && req.session.role === 'Admin') {
        res.render('admin'); // Aquí renderizamos la vista Admin.ejs
    } else {
        res.redirect('/login'); // Si no está logueado o no tiene el rol adecuado, redirige a login
    }
});

//end region

app.use(express.static(path.join(__dirname,'src' ,'public')));
app.use(methodOverride('_method'));

app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.json());

app.get('/', (req, res) => {
    res.redirect('/login/this'); 
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

// login
// app.post('/auth', async (req, res)=>{
//     const user = req.body.user;
//     const pass = req.body.pass;
//     let passwordHash = await bcrypt.hash(pass, 8)
//     if (user && pass) {
//         try {
//             const [results] = await pool.query(
//                 'SELECT * FROM users WHERE user = ?', 
//                 [user]
//             );
//             console.log("Resultados de la consulta:", results); 
//             if (results.length === 0 || !results[0].Pass) {
//                 console.log("Usuario no encontrado o sin campo de contraseña");
//                 res.render('loginView/login', {
//                     alert: true,
//                     alertTitle: "Error",
//                     alertMessage: "USUARIO y/o CONTRASEÑA incorrectas",
//                     alertIcon: 'error',
//                     showConfirmButton: true,
//                     timer: false,
//                     ruta: 'login/this'
//                 });
//             } else {
//                 const isPasswordCorrect = await bcrypt.compare(pass, results[0].Pass);
//                 if (!isPasswordCorrect) {
//                     res.render('loginView/login', {
//                         alert: true,
//                         alertTitle: "Error",
//                         alertMessage: "USUARIO y/o PASSWORD incorrectas",
//                         alertIcon: 'error',
//                         showConfirmButton: true,
//                         timer: false,
//                         ruta: ''
//                     });
//                 } else {
//                     req.session.loggedin = true;
//                     req.session.name = results[0].name;
//                     res.render('loginView/login', {
//                         alert: true,
//                         alertTitle: "Conexión exitosa",
//                         alertMessage: "¡LOGIN CORRECTO!",
//                         alertIcon: 'success',
//                         showConfirmButton: false,
//                         timer: 1500,
//                         ruta: ''
//                     });
//                 }
//             }
//         } catch (error) {
//             console.log("Error en la autenticación:", error);
//             res.send('Hubo un error en el servidor');
//         }
//     } else {
//         res.render('loginView/login', {
//             alert: true,
//             alertTitle: "Advertencia",
//             alertMessage: "¡Ingrese USUARIO y CONTRASEÑA!",
//             alertIcon: 'warning',
//             showConfirmButton: true,
//             timer: false,
//             ruta: 'login/this'
//     });
//     }
// })

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
                        ruta: ''
                    });
                } else {
                    req.session.loggedin = true;
                    req.session.name = results[0].Name;
                    req.session.role = results[0].Rol;
                    req.session.user = results[0].User;
                    console.log("Sesión iniciada:", req.session);

                    // Verificación del rol y redirección
                    if (req.session.role === 'Paciente') {
                        res.redirect('/turnos/paciente/filtros'); // Redirigir si es paciente
                    } else if (req.session.role === 'Secretaria') {
                        res.redirect('/secretaria'); // Redirigir a secretaria.ejs
                    } else if (req.session.role === 'Admin') {
                        res.redirect('/admin'); // Redirigir a admin.ejs
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
        // Si está logueado, pasa los datos de sesión a la vista
        res.render('turnoViews/filtrosTurnosPaciente', {
            login: true,
            name: req.session.name,
            role: req.session.role
        });
    } else {
        // Si no está logueado, redirige a la página de login
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
