const verificarRoles = (...rolesPermitidos) => {
    return (req, res, next) => {
        if (!req.usuario) {
            return res.status(401).json({ error: 'No autenticado.' });
        }
        if (!rolesPermitidos.includes(req.usuario.rol)) {
            return res.status(403).json({
                error: `Acceso denegado. Roles permitidos: ${rolesPermitidos.join(', ')}.`
            });
        }
        next();
    };
};

const esAdmin = verificarRoles('ADMIN');
const esGestor = verificarRoles('GESTOR');
const esEmpleado = verificarRoles('EMPLEADO');
const esAdminOGestor = verificarRoles('ADMIN', 'GESTOR');

const miRol = (req, res) => {
    return res.status(200).json({ rol: req.usuario.rol });
};

export {verificarRoles, esAdmin, esGestor, esEmpleado, esAdminOGestor, miRol};