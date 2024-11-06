
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
//SE CAMBIA POR POOL
//const connection  = require('./src/database/connectionMySQL');
const { pool } = require('./src/database/connectionMySQL');

app.use(express.urlencoded({ extended: false }));
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

//desde aca= nuevo register+login
app.post('/register/this', async (req, res) => {
    const { user, name, rol, pass } = req.body;
    const passwordHash = await bcrypt.hash(pass, 8);

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
			timer: 3000,
			ruta: ""
		});		
    } catch (error) {
        console.log(error);
        res.render('./loginView/register', {
            alert: true,
            alertTitle: "Error",
            alertMessage: "Error en el registro",
            alertIcon: 'error',
            showConfirmButton: true,
            timer: false,
            ruta: ''
        });
    }
});

// Ruta de autenticación
app.post('/auth', async (req, res) => {
    const { user, pass } = req.body;

    if (user && pass) {
        try {
            const [results] = await pool.query(
                'SELECT * FROM users WHERE user = ?', 
                [user]
            );

            // Check if the user exists and the password field is present
            if (results.length === 0 || !results[0].pass) {
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
                // Use bcrypt.compare only if the password field exists
                const isPasswordCorrect = await bcrypt.compare(pass, results[0].pass);
                if (!isPasswordCorrect) {
                    res.render('login/this', {
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
                    res.render('login/this', {
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
            console.log(error);
            res.send('Hubo un error en el servidor');
        }
    } else {
        res.send('Por favor ingrese usuario y contraseña!');
    }
});

//hasta aca
// app.post('/register/this', async (req, res)=>{
// 	const user = req.body.user;
// 	const name = req.body.name;
//     const rol = req.body.rol;
// 	const pass = req.body.pass;
// 	let passwordHash = await bcrypt.hash(pass, 8);
//     connection.query('INSERT INTO users SET ?',{user:user, name:name, rol:rol, pass:passwordHash}, async (error, results)=>{
//         if(error){
//             console.log(error);
//         }else{            
// 			res.render('register', {
// 				alert: true,
// 				alertTitle: "Registration",
// 				alertMessage: "¡Successful Registration!",
// 				alertIcon:'success',
// 				showConfirmButton: false,
// 				timer: 1500,
// 				ruta: ''
// 			});        
//         }
// 	});
// })

// //11 - Metodo para la autenticacion
// app.post('/auth', async (req, res)=> {
// 	const user = req.body.user;
// 	const pass = req.body.pass;    
//     let passwordHash = await bcrypt.hash(pass, 8);
// 	if (user && pass) {
// 		connection.query('SELECT * FROM users WHERE user = ?', [user], async (error, results, fields)=> {
// 			if( results.length == 0 || !(await bcrypt.compare(pass, results[0].pass)) ) {    
// 				res.render('login', {
//                         alert: true,
//                         alertTitle: "Error",
//                         alertMessage: "USUARIO y/o PASSWORD incorrectas",
//                         alertIcon:'error',
//                         showConfirmButton: true,
//                         timer: false,
//                         ruta: 'login'    
//                     });			
// 			} else {     
// 				req.session.loggedin = true;                
// 				req.session.name = results[0].name;
// 				res.render('login', {
// 					alert: true,
// 					alertTitle: "Conexión exitosa",
// 					alertMessage: "¡LOGIN CORRECTO!",
// 					alertIcon:'success',
// 					showConfirmButton: false,
// 					timer: 1500,
// 					ruta: ''
// 				});        			
// 			}			
// 			res.end();
// 		});
// 	} else {	
// 		res.send('Porfavor ingrese usuario y contraseña!');
// 		res.end();
// 	}
// });

// //12 - Método para controlar que está auth en todas las páginas
// app.get('/', (req, res)=> {
// 	if (req.session.loggedin) {
// 		res.render('index',{
// 			login: true,
// 			name: req.session.name			
// 		});		
// 	} else {
// 		res.render('index',{
// 			login:false,
// 			name:'Debe iniciar sesión',			
// 		});				
// 	}
// 	res.end();
// });


//función para limpiar la caché luego del logout
app.use(function(req, res, next) {
    if (!req.user)
        res.header('Cache-Control', 'private, no-cache, no-store, must-revalidate');
    next();
});

 //Logout
//Destruye la sesión.
app.get('/logout', function (req, res) {
	req.session.destroy(() => {
	  res.redirect('/') // siempre se ejecutará después de que se destruya la sesión
	})
});


app.listen(PORT, () => {
    console.log(`Servidor escuchando en el puerto http://localhost:${PORT}`);
}); 

