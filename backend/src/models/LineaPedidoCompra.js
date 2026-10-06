import { DataTypes } from 'sequelize';
import db from '../config/db.js';

const LineaPedidoCompra = db.define('LineaPedidoCompra', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    cantidadPedida: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 1
    },
    cantidadRecibida: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 0 // Se va incrementando al registrar recepciones de mercancía
    },
    precioUnitario: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false,
        defaultValue: 0.00
    },
    porcentajeIva: {
        type: DataTypes.DECIMAL(5, 2),
        allowNull: false,
        defaultValue: 21.00
    }
});

export default LineaPedidoCompra;