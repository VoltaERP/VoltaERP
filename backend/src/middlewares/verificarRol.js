const esAdmin = (req, res, next) => {
    // Como este middleware irá DESPUÉS de protegerRuta, req.usuario ya existirá
    if (req.usuario && req.usuario.rol === 'ADMIN') {
        next(); // Le dejamos pasar a la ruta
    } else {
        return res.status(403).json({ error: 'Acceso denegado. Zona exclusiva para Administradores.' });
    }
};

const esGestor = (req, res, next) => {
    // Como este middleware irá DESPUÉS de protegerRuta, req.usuario ya existirá
    if (req.usuario && req.usuario.rol === 'GESTOR') {
        next(); // Le dejamos pasar a la ruta
    } else {
        return res.status(403).json({ error: 'Acceso denegado. Zona exclusiva para Gestores.' });
    }
};

const esEmpleado = (req, res, next) => {
    // Como este middleware irá DESPUÉS de protegerRuta, req.usuario ya existirá
    if (req.usuario && req.usuario.rol === 'EMPLEADO') {
        next(); // Le dejamos pasar a la ruta
    } else {
        return res.status(403).json({ error: 'Acceso denegado. Zona exclusiva para Empleados.' });
    }
};

const miRol = (req, res) =>{
    return res.status(200).json({'rol':req.usuario.rol})
}


export {esAdmin, esGestor, esEmpleado, miRol}