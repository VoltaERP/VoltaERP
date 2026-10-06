import { DataTypes } from 'sequelize';
import db from '../config/db.js';

const LineaFactura = db.define('LineaFactura', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    descripcion: {
        type: DataTypes.STRING,
        allowNull: false
    },
    cantidad: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 1
    },
    precioUnitario: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false // Copiado del producto en el momento de crear la línea
    },
    descuento: {
        type: DataTypes.DECIMAL(5, 2),
        allowNull: false,
        defaultValue: 0.00 // Porcentaje de descuento (ej: 10.00%)
    },
    porcentajeIva: {
        type: DataTypes.DECIMAL(5, 2),
        allowNull: false // Copiado del IVA del producto en ese momento
    },
    subtotal: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false,
        defaultValue: 0.00 // (cantidad * precioUnitario) - descuento
    }
});

export default LineaFactura;