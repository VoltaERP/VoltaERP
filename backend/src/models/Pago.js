import { DataTypes } from 'sequelize';
import db from '../config/db.js';

const Pago = db.define('Pago', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    importe: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false
    },
    fecha: {
        type: DataTypes.DATEONLY,
        allowNull: false,
        defaultValue: DataTypes.NOW
    },
    metodo: {
        type: DataTypes.ENUM('TRANSFERENCIA', 'EFECTIVO', 'TARJETA'),
        allowNull: false,
        defaultValue: 'TRANSFERENCIA'
    }
});

export default Pago;