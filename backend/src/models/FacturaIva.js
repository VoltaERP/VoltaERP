import { DataTypes } from 'sequelize';
import db from '../config/db.js';

const FacturaIva = db.define('FacturaIva', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    porcentaje: {
        type: DataTypes.DECIMAL(5, 2),
        allowNull: false // Ej: 21.00, 10.00, 4.00, 0.00
    },
    base: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false,
        defaultValue: 0.00 // Suma de subtotales que tienen este IVA
    },
    cuota: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false,
        defaultValue: 0.00 // base * (porcentaje / 100)
    }
});

export default FacturaIva;