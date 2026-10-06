import { Sequelize } from "sequelize";
import dotenv from 'dotenv'
dotenv.config({path:'.env'})

const db = new Sequelize(process.env.BD_URL,{
    dialect:'postgres',
    define:{
        timestamps: true
    },
    pool:{
        max:5,
        min:0,
        acquire:30000,
        idle: 1000
    }

})

export default db