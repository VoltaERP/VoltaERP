import { DataTypes } from 'sequelize';
import db from '../config/db.js';

const MovimientoStock = db.define('MovimientoStock', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    cantidad: {
        type: DataTypes.INTEGER,
        allowNull: false // Positiva (entrada/compra) o negativa (salida/venta)
    },
    tipo: {
        type: DataTypes.ENUM('COMPRA', 'VENTA', 'AJUSTE', 'ANULACION'),
        allowNull: false
    },
    motivo: {
        type: DataTypes.STRING,
        allowNull: true // Ej: "Venta factura F-2026-001", "Rotura de stock", "Recepción pedido P-12"
    },
    fecha: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW
    },
    // Referencia lógica al documento origen (sin clave foránea estricta porque apunta a varias tablas distintas)
    origenTipo: {
        type: DataTypes.ENUM('FACTURA', 'PEDIDO_COMPRA', 'AJUSTE'),
        allowNull: true
    },
    origenId: {
        type: DataTypes.INTEGER,
        allowNull: true
    }
});

export default MovimientoStock;