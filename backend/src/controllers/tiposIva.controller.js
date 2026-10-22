import {TipoIva, Producto} from '../models/index.js';

export const obtenerTiposIva = async (req, res, next) => {
    try {
        const tiposIva = await TipoIva.findAll({order: [['porcentaje', 'ASC']]});
        return res.status(200).json(tiposIva);
    } catch (error) {
        next(error);
    }
}

export const obtenerTipoIvaPorId = async (req, res, next) => {
    try {
        const {id} = req.params;
        const tipoIva = await TipoIva.findByPk(id);
        if (!tipoIva) {
            return res.status(404).json({error: "Tipo de IVA no encontrado"});
        }
        return res.status(200).json(tipoIva);
    } catch (error) {
        next(error);
    }
}

export const crearTipoIva = async (req, res, next) => {
    try{
        const {nombre, porcentaje} = req.body;
        if(!nombre){
            return res.status(400).json({error: "El nombre es obligatorio"});
        }
        if(porcentaje === undefined || porcentaje === null || porcentaje <0 || porcentaje > 100){
            return res.status(400).json({error: "El porcentaje es obligatorio y debe estar entre 0 y 100"});
        }
        const tipoIva = await TipoIva.create({nombre, porcentaje});
        return res.status(201).json(tipoIva);
    } catch (error) {
        next(error);
    }
}

export const editarTipoIva = async (req, res, next) => {
    try {
        const {id} = req.params;
        const {nombre, porcentaje} = req.body;
        const tipoIva = await TipoIva.findByPk(id);
        if (!tipoIva) {
            return res.status(404).json({error: "Tipo de IVA no encontrado"});
        }
        if(porcentaje === undefined || porcentaje === null || porcentaje <0 || porcentaje > 100){
            return res.status(400).json({error: "El porcentaje es obligatorio y debe estar entre 0 y 100"});
        }
        await tipoIva.update({nombre, porcentaje});
        return res.status(200).json(tipoIva);
    } catch (error) {
        next(error);
    } 
}

export const eliminarTipoIva = async (req, res, next) => {
    try {
        const {id} = req.params;
        const tipoIva = await TipoIva.findByPk(id);
        if (!tipoIva) {
            return res.status(404).json({error: "Tipo de IVA no encontrado"});
        }
        const productos = await Producto.count({where: {tipoIvaId: id}});
        if (productos > 0) {
            return res.status(409).json({error: "No se puede eliminar el tipo de IVA porque tiene productos asociados"});
        }
        await tipoIva.destroy();
        return res.status(200).send();
    } catch (error) {
        next(error);
    }
}