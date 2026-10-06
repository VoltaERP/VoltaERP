import { DataTypes } from 'sequelize';
import db from '../config/db.js';

const Factura = db.define('Factura', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    serie: {
        type: DataTypes.STRING(10),
        allowNull: false,
        defaultValue: 'F'
    },
    numero: {
        type: DataTypes.INTEGER,
        allowNull: true // Es null mientras esté en estado 'BORRADOR'. Se asigna al emitir.
    },
    fechaEmision: {
        type: DataTypes.DATEONLY,
        allowNull: true // Se fija al emitir
    },
    fechaVencimiento: {
        type: DataTypes.DATEONLY,
        allowNull: true
    },
    estado: {
        type: DataTypes.ENUM('BORRADOR', 'EMITIDA', 'COBRADA', 'ANULADA'),
        allowNull: false,
        defaultValue: 'BORRADOR'
    },
    baseImponible: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false,
        defaultValue: 0.00
    },
    totalIva: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false,
        defaultValue: 0.00
    },
    total: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false,
        defaultValue: 0.00
    },
    observaciones: {
        type: DataTypes.TEXT,
        allowNull: true
    }
});

export default Factura;