import jwt from 'jsonwebtoken';
import { Usuario } from '../models/index.js';


export const login = async (req, res, next) => {
    try {
        const { email, password } = req.body;
        if (!email || !password) {
            return res.status(400).json({ error: 'Debes proporcionar email y contraseña.' });
        }
        const usuario = await Usuario.scope('conPassword').findOne({
            where: { email: email.trim().toLowerCase() }
        });
        if (!usuario || !(await usuario.verificarPassword(password))) {
            return res.status(401).json({ error: 'Credenciales incorrectas.' });
        }
        if (!usuario.activo) {
            return res.status(403).json({ error: 'Usuario desactivado. Contacta con el administrador.' });
        }
        const token = jwt.sign(
            { usuarioId: usuario.id, rol: usuario.rol, email: usuario.email, nombre: usuario.nombre },
            process.env.JWT_SECRET,
            { expiresIn: process.env.JWT_EXPIRES_IN || '24h' }
        );
        return res.status(200).json({
            token,
            usuario: { id: usuario.id, nombre: usuario.nombre, email: usuario.email, rol: usuario.rol }
        });
    } catch (error) {
        next(error);
    }
};


export const me = (req, res) => {
    return res.status(200).json({ usuario: req.usuario });
};


export const refresh = (req, res) => {
    const { id, rol, email, nombre } = req.usuario;
    const token = jwt.sign(
        { usuarioId: id, rol, email, nombre },
        process.env.JWT_SECRET,
        { expiresIn: process.env.JWT_EXPIRES_IN || '24h' }
    );
    return res.status(200).json({ token });
};