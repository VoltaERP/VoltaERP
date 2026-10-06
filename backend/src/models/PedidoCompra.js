import { DataTypes } from 'sequelize';
import db from '../config/db.js';

const PedidoCompra = db.define('PedidoCompra', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    numero: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true // Ej: "PC-2026-0001"
    },
    fecha: {
        type: DataTypes.DATEONLY,
        allowNull: false,
        defaultValue: DataTypes.NOW
    },
    fechaPrevista: {
        type: DataTypes.DATEONLY,
        allowNull: true
    },
    estado: {
        type: DataTypes.ENUM(
        'BORRADOR',
        'ENVIADO',
        'RECIBIDO_PARCIAL',
        'RECIBIDO',
        'CANCELADO'
        ),
        allowNull: false,
        defaultValue: 'BORRADOR'
    },
    total: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false,
        defaultValue: 0.00
    }
});

export default PedidoCompra;