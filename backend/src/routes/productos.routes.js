import { Router  } from 'express';

// Aqui se decide que rutas se van a crear y que controladores van a manejar las peticiones
import {
    obtenerProductos, obtenerProductoPorId, crearProducto,
    editarProducto, cambiarActivoProducto
} from '../controllers/productos.controller.js';

// Comprueba que el usuario ha iniciado sesión y tiene un token valido
import protegerRuta from '../middlewares/protegerRutas.js';

//Comprueba que el rol del usuario está en la lista permitida
import { verificarRoles } from '../middlewares/verificarRol.js';

const router = Router();

// Puede consultar cualquier usuario con sesión (admin, gestor y empleado)
router.get('/', protegerRuta, verificarRoles('ADMIN', 'GESTOR', 'EMPLEADO'), obtenerProductos);
router.get('/:id', protegerRuta, verificarRoles('ADMIN', 'GESTOR', 'EMPLEADO'), obtenerProductoPorId);

// Crear, editar, activar y desactivar admin y  gestor; empleado solo consulta
router.post('/', protegerRuta, verificarRoles('ADMIN', 'GESTOR'), crearProducto);
router.put('/:id', protegerRuta, verificarRoles('ADMIN', 'GESTOR'), editarProducto);
router.patch('/:id/activo', protegerRuta, verificarRoles('ADMIN', 'GESTOR'), cambiarActivoProducto);

export default router;