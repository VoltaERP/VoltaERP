import {Usuario} from '../models/index.js';
//obtener usuarios, async para que de la respuesta cuando la bbdd pueda, req,res,next 
// es lenguaje js y next para que oase la siguiente si da error
//solo puede obetener todos los usuarios el admin
export const obtenerUsuarios= async (req, res, next) => {
    try {
        //await para que espere a que la bbdd de la respuesta
        //findAll para que busque todos los usuarios
        //hacemos el return para que termine la funcion y devuelva la respuesta al cliente, se pone con status 200 
        // para que el cliente sepa que todo ha ido bien y json para que lo devuelva en formato json
        const usuarios = await Usuario.findAll();
       return res.status(200).json(usuarios);
    } catch (error) {
        next(error);
    }
};
export const obtenerUsuarioPorId = async (req, res, next) => {
    try {
        //el req.params estaria por asi decirlo en la url por ejemplo /usuarios/:id y el id seria el que se pasa por la url
        const {id} = req.params;
        if (req.usuario.rol == "EMPLEADO" && req.usuario.id != parseInt(id)) {
            return res.status(403).json({error: "No tienes permisos para ver este usuario"});
        }
        const usuario = await Usuario.findByPk(id);
        if (!usuario) {
            return res.status(404).json({error: "Usuario no encontrado"});
        }
        return res.status(200).json(usuario);
    } catch (error) {
        next(error);
    }
};
export const crearUsuario = async (req, res, next) => {
    try {
        //el req.body estaria en el body de la peticion, por ejemplo en postman en el body de la peticion

        const {nombre, email, password, rol} = req.body;
        //comprobamos que todos los datos obligatorios estan presentes
        if(!nombre || !email || !password || !rol){
            //si falta algun dato obligatorio devolvemos un error 400 con un mensaje de error
            return res.status(400).json({error: "Faltan datos obligatorios"});
        }
        //comprobamos que el rol es valido
        if(!['ADMIN', 'GESTOR', 'EMPLEADO'].includes(rol)){
            return res.status(400).json({error: "Rol no válido"});
        }
        //comprobamos que el email no esta repetido
        const usuarioExistente = await Usuario.findOne({where: {email}});
        if(usuarioExistente){
            return res.status(400).json({error: "El email ya está en uso"});
        }
        //si todo esta bien creamos el usuario y devolvemos un 201 con el usuario creado
        const usuariocreado = await Usuario.create({nombre, email, password, rol});
        const usuario = await Usuario.findByPk(usuariocreado.id);
        return res.status(201).json(usuario);
    } catch (error) {
        next(error);
    }
}
export const editarUsuario = async (req, res, next) => {
    try {
        //pide id por params y nombre y email por body, 
        // comprueba que el usuario existe y si existe lo actualiza con los datos del body
        const {id} = req.params;
        const {nombre, email} = req.body;
        //comprobamos que el usuario existe
        const usuario = await Usuario.findByPk(id);
        //si no existe devolvemos un error 404 con un mensaje de error
        if (!usuario) {
            return res.status(404).json({error: "Usuario no encontrado"});
        }
        
        //actualizamos el usuario con los datos del body, y devolvemos un 200 con el usuario actualizado
        await usuario.update({nombre, email});
        return res.status(200).json(usuario);
    } catch (error) {
        next(error);
    }
}
export const cambiarRolUsuario = async (req, res, next) => {
    try {
        const {id} = req.params;
        const {rol} = req.body;
        //comprobamos que el rol es valido
        if(!['ADMIN', 'GESTOR', 'EMPLEADO'].includes(rol)){
            return res.status(400).json({error: "Rol no válido"});
        }
        //comprobamos que el usuario existe
        const usuario = await Usuario.findByPk(id);
        if (!usuario) {
            return res.status(404).json({error: "Usuario no encontrado"});
        }
        //actualizamos el rol del usuario y devolvemos un 200 con el usuario actualizado
        await usuario.update({rol});
        return res.status(200).json(usuario);
    } catch (error) {
        next(error);
    }
}
export const cambiarEstadoUsuario = async (req, res, next) => {
    try {
        const {id} = req.params;
        const {activo} = req.body;
        if (typeof activo !== 'boolean') {
            return res.status(400).json({error: "El estado debe ser un valor booleano"});
        }
        if (req.usuario.id === parseInt(id)) {
            return res.status(400).json({error: "No puedes cambiar tu propio estado"});
        }
        //comprobamos que el usuario existe
        const usuario = await Usuario.findByPk(id);
        if (!usuario) {
            return res.status(404).json({error: "Usuario no encontrado"});
        }
        await usuario.update({activo});
        return res.status(200).json(usuario);
    } catch (error) {
        next(error);
    }
}
//////////////////////////////////////////////////////////////////////////////////////////////////
//hay que hacer la funcion de cambiar password,                                                 //
// que solo pueda cambiarlo el propio usuario y el admin, y que el empleado no pueda cambiarlo  //
//////////////////////////////////////////////////////////////////////////////////////////////////
