import { Producto, Categoria, TipoIva } from '../models/index.js';
// Creamos el controlador de productos, que es el que recibe la request 
// Se comunica con la base de datos y devuelve la res



// Campos que se pueden enviar al crear o editar un producto.
const campos_Editables = [
    'referencia', 'nombre', 'descripcion', 'precioVenta', 'precioCompra',
    'stockMinimo', 'esServicio', 'categoriaId', 'tipoIvaId'
];

// La columna como mucho 8 digitos enteros y 2 decimales.
const precio_Maximo = 99999999.99;
// Máximo de la columna integer de PostgreSQL
const entero_Maximo = 99999999;


// Al devolver un producto incluimos el nombre de su categoría y su tipo de IVA,
const incluir_Relaciones = [
    { model: Categoria, as: 'categoria', attributes: ['id', 'nombre'] },
    { model: TipoIva, as: 'tipoIva', attributes: ['id', 'nombre', 'porcentaje'] }
];


// Como el id de la url llega como texto. Comprobamos que sea un entero positivo
// Asi nos da un error 400 claro y no un error 500 de Sequelize al hacer findByPk con un id no válido.

const idValido = (id) => /^\d+$/.test(id) && Number(id) > 0 && Number(id) <= entero_Maximo;

// Un precio cualquiera entre 0 y el maximo
const esPrecioValido = (valor) => {
    if (typeof valor !== 'number' && typeof valor !== 'string') return false;
    if (typeof valor === 'string' && valor.trim() === '') return false;
    const numero = Number(valor);
    return Number.isFinite(numero) && numero >= 0 && numero <= precio_Maximo;
};

const esEnteroPositivo = (valor) => Number.isInteger(valor) && valor > 0 && valor <= entero_Maximo;


// Revisa la forma de los datos del body. Devuelve un texto si hay error o no hay error (null).
// esCreacion = true; referencia, nombre y tipoIvaId son obligatorios.
// esCreacion = false; en la edicion solo se revisan los campos que vengan en el body.

const validarDatos = (body, esCreacion) => {
    const { referencia, nombre, descripcion, precioVenta, precioCompra,
            stockMinimo, esServicio, categoriaId, tipoIvaId } = body;

    if (esCreacion || referencia !== undefined) {
        if (typeof referencia !== 'string' || referencia.trim() === '') {
            return 'La referencia es obligatoria';
        }
    }
    if (esCreacion || nombre !== undefined) {
        if (typeof nombre !== 'string' || nombre.trim() === '') {
            return 'El nombre es obligatorio';
        }
    }
    if (descripcion !== undefined && descripcion !== null && typeof descripcion !== 'string') {
        return 'La descripción debe ser un texto';
    }
    if (precioVenta !== undefined && !esPrecioValido(precioVenta)) {
        return 'El precio de venta debe ser un número entre 0 y 99999999.99';
    }
    if (precioCompra !== undefined && !esPrecioValido(precioCompra)) {
        return 'El precio de compra debe ser un número entre 0 y 99999999.99';
    }
    if (stockMinimo !== undefined) {
        if (!Number.isInteger(stockMinimo) || stockMinimo < 0 || stockMinimo > entero_Maximo) {
            return 'El stock mínimo debe ser un número entero mayor o igual que 0';
        }
    }
    if (esServicio !== undefined && typeof esServicio !== 'boolean') {
        return 'esServicio debe ser un valor booleano (true o false)';
    }

    
    // El IVA es obligatorio: las líneas de factura copian el IVA del producto.
    if (esCreacion || tipoIvaId !== undefined) {
        if (!esEnteroPositivo(tipoIvaId)) {
            return 'El tipo de IVA es obligatorio (tipoIvaId debe ser un id válido)';
        }
    }
    // La categoria es opcional
    if (categoriaId !== undefined && categoriaId !== null && !esEnteroPositivo(categoriaId)) {
        return 'categoriaId debe ser un id válido';
    }
    return null;
};



// Se queda solo con los campos permitidos y los deja limpios
const limpiarDatos = (body) => {
    const datos = {};
    for (const campo of campos_Editables) {
        if (body[campo] !== undefined) {
            datos[campo] = body[campo];
        }
    }
    if (typeof datos.referencia === 'string') datos.referencia = datos.referencia.trim().toUpperCase();
    if (typeof datos.nombre === 'string') datos.nombre = datos.nombre.trim();
    if (typeof datos.descripcion === 'string') datos.descripcion = datos.descripcion.trim();
    for (const campo of ['precioVenta', 'precioCompra']) {
        if (datos[campo] !== undefined) {
            datos[campo] = Math.round(Number(datos[campo]) * 100) / 100;
        }
    }
    return datos;
};



// Comprueba que la categoría y el IVA indicados existen de verdad en la base de datos.
// Devuelve un texto con el error o null si esta bien.
const comprobarRelaciones = async (datos) => {
    if (datos.categoriaId !== undefined && datos.categoriaId !== null) {
        const categoria = await Categoria.findByPk(datos.categoriaId);
        if (!categoria) return 'La categoría indicada no existe';
    }
    if (datos.tipoIvaId !== undefined) {
        const tipoIva = await TipoIva.findByPk(datos.tipoIvaId);
        if (!tipoIva) return 'El tipo de IVA indicado no existe';
    }
    return null;
};



// -----------------------------------------------------------------------------------------------------------
// ENDPOINTS
// Las operaciones con la base de datos tardan en responder, por lo que se usa async + await
//  y await hace que el código espere el resultado antes de seguir. Si falta un await, el código sigue
// sin el resultado. next(error) pasaria cualquier fallo al errorHandler
// -----------------------------------------------------------------------------------------------------------


// GET api/productos; lista todos los productos (admin, gestor y empleado)
export const obtenerProductos = async (req, res, next) => {
    try {
        const productos = await Producto.findAll({
            include: incluir_Relaciones,
            order: [['nombre', 'ASC']]
        });
        return res.status(200).json(productos);
    } catch (error) {
        next(error);
    }
};

// GET api/productos/:id; obtiene un producto concreto al id correspondiente (admin, gestor y empleado)
export const obtenerProductoPorId = async (req, res, next) => {
    try {
        const { id } = req.params;
        if (!idValido(id)) {
            return res.status(400).json({ error: 'El id debe ser un número entero positivo' });
        }
        const producto = await Producto.findByPk(id, { include: incluir_Relaciones });
        if (!producto) {
            return res.status(404).json({ error: 'Producto no encontrado' });
        }
        return res.status(200).json(producto);
    } catch (error) {
        next(error);
    }
};

//POST api/productos; crea un producto (solo admin y gestor)
export const crearProducto = async (req, res, next) => {
    try {
        // Si no llega body, lo sustituimos por un objeto vacío
        const body = req.body ?? {};

        const errorValidacion = validarDatos(body, true);
        if (errorValidacion) {
            return res.status(400).json({ error: errorValidacion });
        }
        const datos = limpiarDatos(body);

        const errorRelaciones = await comprobarRelaciones(datos);
        if (errorRelaciones) {
            return res.status(400).json({ error: errorRelaciones });
        }

        // La referencia no se puede repetir
        const existente = await Producto.findOne({ where: { referencia: datos.referencia } });
        if (existente) {
            return res.status(409).json({ error: 'Ya existe un producto con esa referencia' });
        }

        const producto = await Producto.create(datos);
        // Lo volvemos a pedir para devolverlo ya con su categoria e IVA
        const completo = await Producto.findByPk(producto.id, { include: incluir_Relaciones });
        return res.status(201).json(completo);
    } catch (error) {
        next(error);
    }
};


// PUT api/productos/:id; edita un producto (solo admin y gestor). Se pueden cambiar todos los campos, excepto el id y el activo.
// Solo se modifican los campos que vengan en el body
export const editarProducto = async (req, res, next) => {
    try {
        const { id } = req.params;
        if (!idValido(id)) {
            return res.status(400).json({ error: 'El id debe ser un número entero positivo' });
        }
        const producto = await Producto.findByPk(id);
        if (!producto) {
            return res.status(404).json({ error: 'Producto no encontrado' });
        }

        const body = req.body ?? {};
        const errorValidacion = validarDatos(body, false);
        if (errorValidacion) {
            return res.status(400).json({ error: errorValidacion });
        }
        const datos = limpiarDatos(body);
        if (Object.keys(datos).length === 0) {
            return res.status(400).json({ error: 'No se ha enviado ningún dato modificable' });
        }

        const errorRelaciones = await comprobarRelaciones(datos);
        if (errorRelaciones) {
            return res.status(400).json({ error: errorRelaciones });
        }

        // Si cambia la referencia, que no sea la de otro producto existente
        if (datos.referencia !== undefined && datos.referencia !== producto.referencia) {
            const existente = await Producto.findOne({ where: { referencia: datos.referencia } });
            if (existente) {
                return res.status(409).json({ error: 'Ya existe un producto con esa referencia' });
            }
        }

        await producto.update(datos);
        const completo = await Producto.findByPk(producto.id, { include: incluir_Relaciones });
        return res.status(200).json(completo);
    } catch (error) {
        next(error);
    }
};

// PATCH api/productos/:id/activo;  activa o desactiva un producto (solo admin y gestor)
// Se puede cambiar el campo activo, pero no se borrar el producto
// Un producto puede estar en facturas y movimientos de stock, nunca se borra, solo se desactiva (igual que en clientes y proveedores)
export const cambiarActivoProducto = async (req, res, next) => {
    try {
        const { id } = req.params;
        if (!idValido(id)) {
            return res.status(400).json({ error: 'El id debe ser un número entero positivo' });
        }
        const { activo } = req.body ?? {};
        if (typeof activo !== 'boolean') {
            return res.status(400).json({ error: 'El estado debe ser un valor booleano' });
        }
        const producto = await Producto.findByPk(id);
        if (!producto) {
            return res.status(404).json({ error: 'Producto no encontrado' });
        }
        await producto.update({ activo });
        return res.status(200).json(producto);
    } catch (error) {
        next(error);
    }
};




