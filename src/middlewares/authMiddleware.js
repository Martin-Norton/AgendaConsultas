// authMiddleware.js
const ensurePatientRole = (req, res, next) => {
    if (req.session.loggedin && req.session.role === 'Paciente') {
        return next();
    } else {
        res.status(403).render('error', { message: 'No tiene permisos para acceder a esta sección.' });
    }
};

module.exports = {
    ensurePatientRole,

};
