import { DataTypes } from 'sequelize';
import db from '../config/db.js';

const Tercero = db.define('Tercero', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    tipo: {
        type: DataTypes.ENUM('CLIENTE', 'PROVEEDOR', 'AMBOS'),
        allowNull: false,
        defaultValue: 'CLIENTE'
    },
    razonSocial: {
        type: DataTypes.STRING,
        allowNull: false
    },
    nif: {
        type: DataTypes.STRING,
        allowNull: false
    },
    email: {
        type: DataTypes.STRING,
        validate: { isEmail: true }
    },
    telefono: {
        type: DataTypes.STRING
    },
    direccion: {
        type: DataTypes.STRING
    },
    ciudad: {
        type: DataTypes.STRING
    },
    codigoPostal: {
        type: DataTypes.STRING
    },
    pais: {
        type: DataTypes.STRING,
        defaultValue: 'España'
    },
    condicionesPago: {
        type: DataTypes.INTEGER,
        defaultValue: 0
    },
    activo: {
        type: DataTypes.BOOLEAN,
        defaultValue: true
    }
});

export default Tercero;