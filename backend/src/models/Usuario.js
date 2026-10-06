import { DataTypes } from "sequelize";
import bcrypt from "bcryptjs"
import db from '../config/db.js'

const Usuario = db.define('Usuario',{
    id:{
        type: DataTypes.INTEGER,
        primaryKey:true,
        autoIncrement:true
    }, 
    nombre:{
        type: DataTypes.STRING,
        allowNull:false
    }, 
    email:{
        type: DataTypes.STRING,
        unique:true,
        allowNull:false,
        validate: {
            isEmail: { msg: 'Debe ser un correo electrónico válido' }
        }
    },
    password:{
        type: DataTypes.STRING,
        allowNull:false
    },
    rol:{
        type: DataTypes.ENUM('ADMIN', 'GESTOR', 'EMPLEADO'), 
        allowNull: false,
        defaultValue: 'EMPLEADO'
    },
    activo:{
        type: DataTypes.BOOLEAN,
        defaultValue:true
    }

},{
    hooks: {
        beforeCreate: async function(usuario){
            const salt = await bcrypt.genSalt(10)
            usuario.password = await bcrypt.hash(usuario.password, salt)
        },
        beforeUpdate:async function(usuario){
            if (usuario.changed('password')) {
                const salt = await bcrypt.genSalt(10);
                usuario.password = await bcrypt.hash(usuario.password, salt);
            }
        }
    },
    defaultScope: {
        attributes: { exclude: ['password'] }
    },
    scopes :{
        eliminarPassword:{
            attributes: {
                exclude:['password','createdAt', 'updatedAt']
            }
        },
        conPassword: {
            attributes: {} //Incluye todo, utilizar solo en el login
        }
    }
});

//Metodos Personalizados
Usuario.prototype.verificarPassword = async function(password) {
    return await bcrypt.compare(password, this.password);
};

export default Usuario;