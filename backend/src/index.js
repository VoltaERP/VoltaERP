import express from 'express'
import cors from 'cors'
import 'dotenv/config'
import db from './config/db.js'
import './models/index.js'



const app = express();

app.use(cors({
    origin: process.env.FRONTEND_URL || 'http://localhost:4200',
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'],
    allowedHeaders: ['Content-Type', 'Authorization']
}));

//Permite que el servidor entienda JSON en el body de las peticiones
app.use(express.json());

//Le decimos a Express que todas las rutas de auth empiecen por /api/v1/auth
//app.use('/api/v1/auth', authRoutes);


const port = process.env.PORT || 3000;

try{
    await db.authenticate()
    await db.sync()
    console.log("✅ Conexion Correcta a la bd")

    app.listen(port,() => {
    console.log(`🚀 Servidor escuchando en http://localhost:${port}`);
})
}catch(error){
    console.log(error)
}

