// Importamos el modelo de index para poder interactuar con la base de datos
import { Tercero } from '../models/index.js';
import { validarNIF } from '../helpers/nif.helper.js';

// Importamos los operadores de Sequelize para filtrar la consulta
import { Op } from 'sequelize';

const TIPOSPROVEEDORES = ['PROVEEDOR', 'AMBOS'];

// Exportamos la función para poder utilizarla desde las rutas
export const obtenerProveedores = async (req, res, next) => {
    try {
        // Esperamos la consulta y guardamos la lista en proveedores
        const proveedores = await Tercero.findAll({
            where: {
                tipo: {
                    // Inlcuimos proveedores y terceros que sean ambos (proveedor y cliente)
                    [Op.in]: TIPOSPROVEEDORES
                }
            }, order: [['razonSocial', 'ASC']]
        });

        // Respondemos con un estado 200 y la lista de proveedores en formato JSON
        return res.status(200).json(proveedores);
    } catch (error) {
        next(error);
    }
}

export const obtenerProveedorPorId = async (req, res, next) => {
    try {
        const { id } = req.params;
        const proveedor = await Tercero.findOne({
            where: {
                id,
                tipo: {
                    [Op.in]: TIPOSPROVEEDORES
                }
            }
        });

        if (!proveedor) {
            return res.status(404).json({ message: 'Proveedor no encontrado' });
        }

        return res.status(200).json(proveedor);
    } catch (error) {
        next(error);
    }
}

export const crearProveedor = async (req, res, next) => {
    try {
        const { razonSocial, nif, email, telefono, direccion, ciudad, codigoPostal, pais, condicionesPago, tipo = 'PROVEEDOR' } = req.body;

        if (!razonSocial) {
            return res.status(400).json({ message: 'La razón social es obligatoria' });
        }
        if (!nif || !validarNIF(nif)) {
            return res.status(400).json({ message: 'El NIF/CIF/NIE es obligatorio y debe ser válido' });
        }
        const proveedorExistente = await Tercero.findOne({ where: { nif } });
        if (proveedorExistente) {
            return res.status(400).json({ message: 'El NIF/CIF/NIE ya está en uso' });
        }
        const proveedorCreado = await Tercero.create({ razonSocial, nif: nif.toUpperCase(), email, telefono, direccion, ciudad, codigoPostal, pais, condicionesPago, tipo });
        return res.status(201).json(proveedorCreado);
    } catch (error) {
        next(error);
    }
}

export const editarProveedor = async (req, res, next) => {
    try {
        const { id } = req.params;
        const { razonSocial, nif, email, telefono, direccion, ciudad, codigoPostal, pais, condicionesPago } = req.body;
        const proveedor = await Tercero.findOne({
            where: {
                id, tipo: {
                    [Op.in]: TIPOSPROVEEDORES
                }
            }
        });

        if (!proveedor) {
            return res.status(404).json({ message: 'Proveedor no encontrado' });
        }
        if (nif && !validarNIF(nif)) {
            return res.status(400).json({ message: 'El NIF/CIF/NIE debe ser válido' });
        }
        await proveedor.update({ razonSocial, nif: nif ? nif.toUpperCase() : proveedor.nif, email, telefono, direccion, ciudad, codigoPostal, pais, condicionesPago });
        return res.status(200).json(proveedor);
    } catch (error) {
        next(error);
    }
}

export const cambiarActivoProveedor = async (req, res, next) => {
    try {
        const { id } = req.params;
        const { activo } = req.body; 
        if (typeof activo !== 'boolean') {
            return res.status(400).json({ message: 'El campo activo debe ser un valor booleano' });
        }
        //Comprobamos que el proveedor exista 
         const proveedor = await Tercero.findByPk(id);
         if (!proveedor) {
             return res.status(404).json({ message: 'Proveedor no encontrado' });
         }
         await proveedor.update({ activo });
         return res.status(200).json(proveedor);
    } catch (error) {
        next(error);
    }
}