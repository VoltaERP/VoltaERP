import { DataTypes } from 'sequelize';
import db from '../config/db.js';

const TipoIva = db.define('TipoIva', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    nombre: {
        type: DataTypes.STRING,
        allowNull: false // Ej: "General 21%", "Reducido 10%", "Superreducido 4%", "Exento 0%"
    },
    porcentaje: {
        type: DataTypes.DECIMAL(5, 2),
        allowNull: false
    }
});

export default TipoIva;