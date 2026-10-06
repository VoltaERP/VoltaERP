import { DataTypes } from 'sequelize';
import db from '../config/db.js';

const HistorialFactura = db.define('HistorialFactura', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    estadoAnterior: {
        type: DataTypes.STRING,
        allowNull: true
    },
    estadoNuevo: {
        type: DataTypes.STRING,
        allowNull: false
    },
    fecha: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW
    },
    comentario: {
        type: DataTypes.STRING,
        allowNull: true // Ej: "Emitida en mostrador", "Anulada por error en NIF"
    }
});

export default HistorialFactura;