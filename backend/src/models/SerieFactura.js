import { DataTypes } from 'sequelize';
import db from '../config/db.js';

const SerieFactura = db.define('SerieFactura', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    serie: {
        type: DataTypes.STRING(10),
        allowNull: false,
        defaultValue: 'F' // 'F' para ordinarias, 'R' para rectificativas
    },
    anio: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: new Date().getFullYear()
    },
    ultimoNumero: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 0 // Cada vez que se emite una factura, se incrementa en +1
    }
}, {
    indexes: [
    {
        unique: true,
        fields: ['serie', 'anio'] // Asegura que no se duplique la misma serie en el mismo año
    }
    ]
});

export default SerieFactura;