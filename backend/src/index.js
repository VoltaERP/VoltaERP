import express from 'express'
import cors from 'cors'
import 'dotenv/config'
import db from './config/db.js'
import './models/index.js'
import authRoutes from './routes/auth.routes.js'
import errorHandler from "./middlewares/errorHandler.js";
import usuariosRoutes from './routes/usuarios.routes.js'
import clientesRoutes from './routes/clientes.routes.js'
import categoriasRoutes from './routes/categorias.routes.js'
import tiposIvaRoutes from './routes/tiposIva.routes.js'
import proveedoresRoutes from './routes/proveedores.routes.js'

const app = express();

app.use(cors({
    origin: process.env.FRONTEND_URL || 'http://localhost:4200',
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'],
    allowedHeaders: ['Content-Type', 'Authorization']
}));

//Permite que el servidor entienda JSON en el body de las peticiones
app.use(express.json());

//Le decimos a Express que todas las rutas de auth empiecen por /api/auth
app.use('/api/auth', authRoutes);
app.use('/api/usuarios', usuariosRoutes);
app.use('/api/clientes', clientesRoutes);
app.use('/api/categorias', categoriasRoutes);
app.use('/api/tiposiva', tiposIvaRoutes);
app.use('/api/proveedores', proveedoresRoutes);
app.use(errorHandler);

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

