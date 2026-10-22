import {Categoria, Producto} from '../models/index.js';


export const obtenerCategorias = async (req, res, next) => {
    try {
        const categorias = await Categoria.findAll();
        return res.status(200).json(categorias);
    } catch (error) {
        next(error);
    }
}

export const obtenerCategoriaPorId = async (req, res, next) => {
    try {
        const {id} = req.params;
        const categoria = await Categoria.findByPk(id);
        if (!categoria) {
            return res.status(404).json({error: "Categoria no encontrada"});
        }
        return res.status(200).json(categoria);
    } catch (error) {
        next(error);
    }

}

export const crearCategoria = async (req, res, next) => {
    try{
        const {nombre,descripcion} = req.body;
        if(!nombre){
            return res.status(400).json({error: "El nombre es obligatorio"});
        }
        const categoria = await Categoria.create({nombre,descripcion});
        return res.status(201).json(categoria);
    } catch (error) {
        next(error);
    }
}

export const editarCategoria = async (req, res, next) => {
    try {
        const {id} = req.params;
        const {nombre, descripcion} = req.body;
        const categoria = await Categoria.findByPk(id);
        if (!categoria) {
            return res.status(404).json({error: "Categoria no encontrada"});
        }
        await categoria.update({nombre, descripcion});
        return res.status(200).json(categoria);

    } catch (error) {
        next(error);
    }
}

export const eliminarCategoria = async (req, res, next) => {
    try {
        const {id} = req.params;
        const categoria = await Categoria.findByPk(id);
        if (!categoria) {
            return res.status(404).json({error: "Categoria no encontrada"});
        }
        //comprobamos que no hay productos asociados a la categoria
        const productos = await Producto.count({where: {categoriaId: id}});
        if (productos > 0) {
            return res.status(409).json({error: "No se puede eliminar la categoria porque tiene productos asociados"});
        }
        await categoria.destroy();
        return res.status(200).send();
    } catch (error) {
        next(error);
    }
}

