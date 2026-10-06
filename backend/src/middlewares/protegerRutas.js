import jwt from 'jsonwebtoken'
import {Usuario} from '../models/index.js'

const protegerRuta = async (req, res, next)=> {
    // 1. Angular enviará el token en la cabecera oculta: "Authorization: Bearer <token>"
    const authHeader = req.headers['authorization'];
    // Separamos la palabra "Bearer" del token real
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
        return res.status(403).json({ error: 'Acceso denegado. Se requiere un token de seguridad.' });
    }

    try {
        // 2. Comprobamos matemáticamente que el token lo firmamos nosotros y no ha caducado
        const usuarioDecodificado = jwt.verify(token, process.env.JWT_SECRET);
        const usuario = await Usuario.scope('eliminarPassword').findByPk(usuarioDecodificado.usuarioId)
        // 3. Guardamos los datos (el ID y el ROL que metimos antes) en la petición (req)
        // Así los controladores sabrán exactamente quién está haciendo la petición
        if(usuario){
            req.usuario = usuario
        }else{
            return res.status(403).json({ error: 'Acceso denegado. Se requiere un token de seguridad.' });
        }

        // 4. Le decimos a Express: "Todo correcto, déjale pasar a la ruta que ha pedido"
        return next();
    } catch (error) {
        return res.status(401).json({ error: 'Token inválido o expirado. Vuelve a iniciar sesión.' });
    }
};

export default protegerRuta