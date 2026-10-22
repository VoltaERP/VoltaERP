import {Tercero} from '../models/index.js';
import {validarNIF} from '../helpers/nif.helper.js';
import {Op} from 'sequelize';

//TIPOSCLIENTES es un array con los tipos de clientes que queremos obtener, en este caso CLIENTE y AMBOS lo importamos 
// aqui para poder elegir por que tipo de cliente queremos filtrar, si solo queremos 
// clientes o clientes y proveedores
const TIPOSCLIENTES = ['CLIENTE', 'AMBOS'];
//obtener clientes, async para que de la respuesta cuando la bbdd pueda, req,res,next
// es lenguaje js y next para que oase la siguiente si da error
export const obtenerClientes = async (req, res, next) => {
    try {
        const clientes = await Tercero.findAll({
            where: {
                //el tipo de cliente tiene que estar en el array TIPOSCLIENTES, es decir, 
                // tiene que ser CLIENTE o AMBOS
                tipo: {[Op.in]: TIPOSCLIENTES}}, order: [['razonSocial', 'ASC']]});
        return res.status(200).json(clientes);
    } catch (error) {
        next(error);
    }
};
export const obtenerClientePorId = async (req, res, next) => {
    try {
        const {id} = req.params;
        const cliente = await Tercero.findOne({where: {id, tipo: {[Op.in]: TIPOSCLIENTES}}});
        if (!cliente) {
            return res.status(404).json({error: "Cliente no encontrado"});
        }
        return res.status(200).json(cliente);
    } catch (error) {
        next(error);
    }
};
export const crearCliente = async (req, res, next) => {
    try {
        const {razonSocial, nif, email, telefono, direccion, ciudad, codigoPostal, pais, condicionesPago, tipo='CLIENTE'} = req.body;
        if (!razonSocial){
            return res.status(400).json({error: "La razón social es obligatoria"});
        }
        if (!nif || !validarNIF(nif)) {
            return res.status(400).json({error: "El NIF/CIF/NIE es obligatorio y debe ser válido"});
        }
        const clienteExistente = await Tercero.findOne({where: {nif}});
        if (clienteExistente) {
            return res.status(400).json({error: "El NIF/CIF/NIE ya está en uso"});
        }
        const clienteCreado = await Tercero.create({razonSocial, nif: nif.toUpperCase(), email, telefono, direccion, ciudad, codigoPostal, pais, condicionesPago, tipo});
        return res.status(201).json(clienteCreado);
    } catch (error) {
        next(error);
    }
};

export const editarCliente = async (req, res, next) => {
    try {
        const {id} = req.params;
        const {razonSocial, nif, email, telefono, direccion, ciudad, codigoPostal, pais, condicionesPago} = req.body;
        const cliente = await Tercero.findOne({where: {id, tipo: {[Op.in]: TIPOSCLIENTES}}});
        if (!cliente) {
            return res.status(404).json({error: "Cliente no encontrado"});
        }
        if (nif && !validarNIF(nif)) {
            return res.status(400).json({error: "El NIF/CIF/NIE debe ser válido"});
        }
        await cliente.update({razonSocial, nif: nif ? nif.toUpperCase() : cliente.nif, email, telefono, direccion, ciudad, codigoPostal, pais, condicionesPago});
        return res.status(200).json(cliente);
    } catch (error) {
        next(error);
    }
};
export const cambiarActivo = async (req, res, next) => {
    try {
        const {id} = req.params;
        const {activo} = req.body;        
        if (typeof activo !== 'boolean') {
            return res.status(400).json({error: "El estado debe ser un valor booleano"});
        }
        
        //comprobamos que el usuario existe
        const cliente = await Tercero.findByPk(id);
        if (!cliente) {
            return res.status(404).json({error: "Cliente no encontrado"});
        }
        const CLIENTECONTADO = '000000000T' //NIF del cliente contado, no se puede desactivar
        if (cliente.nif === CLIENTECONTADO) {
            return res.status(403).json({error: "No se puede desactivar el cliente contado"});
        }
        await cliente.update({activo});
        return res.status(200).json(cliente);
    } catch (error) {
        next(error);
    }
}
