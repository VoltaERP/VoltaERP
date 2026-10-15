const errorHandler = (err, req, res, next) => {
    console.error('Error capturado:', err);
    if (err.name === 'SequelizeValidationError') {
        const errores = err.errors.map(e => ({ campo: e.path, mensaje: e.message }));
        return res.status(400).json({ error: 'Error de validación en los datos enviados.', detalles: errores });
    }
    if (err.name === 'SequelizeUniqueConstraintError') {
        const campos = err.errors.map(e => e.path).join(', ');
        return res.status(409).json({ error: `Ya existe un registro con el mismo valor en: ${campos}.` });
    }
    if (err.name === 'SequelizeForeignKeyConstraintError') {
        return res.status(400).json({ error: 'El recurso relacionado no existe o está siendo utilizado.' });
    }
    const statusCode = err.statusCode || err.status || 500;
    return res.status(statusCode).json({ error: err.message || 'Error interno del servidor.' });
};
export default errorHandler;