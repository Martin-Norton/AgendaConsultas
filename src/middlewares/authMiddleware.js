// authMiddleware.js
const ensurePatientRole = (req, res, next) => {
    if (req.session.loggedin && req.session.role === 'Paciente') {
        return next();
    } else {
        res.status(403).render('error', { message: 'No tiene permisos para acceder a esta sección.' });
    }
};

const ensureSecretariaRole = (req, res, next) => {
    if (req.session.loggedin && req.session.role === 'Secretaria') {
        return next();
    } else {
        res.status(403).render('error', { message: 'No tiene permisos para acceder a esta sección.' });
    }
};

const ensureAdminRole = (req, res, next) => {
    if (req.session.loggedin && req.session.role === 'Admin') {
        return next();
    } else {
        res.status(403).render('error', { message: 'No tiene permisos para acceder a esta sección.' });
    }
};

module.exports = {
    ensureAdminRole,
    ensureSecretariaRole,
    ensurePatientRole,
};
