// Importamos Router para definir las rutas de proveedores
import { Router } from 'express';
// Importamos las funciones del controlador de proveedores
import { obtenerProveedores, obtenerProveedorPorId, crearProveedor, editarProveedor, cambiarActivoProveedor } from '../controllers/proveedores.controller.js';
//Comprobamos que el usuario haya iniciado sesión
import protegerRuta from '../middlewares/protegerRutas.js';
// Comprobamos que su rol tenga permiso para consultar proveedores
import { verificarRoles } from '../middlewares/verificarRol.js';

// Creamos el objeto donde registraremos las rutas
const router = Router();

// Para consultar proveedores, el usuario debe estar autenticado y tener el rol de ADMIN, GESTOR o EMPLEADO
router.get('/', protegerRuta, verificarRoles('ADMIN', 'GESTOR', 'EMPLEADO'), obtenerProveedores);
router.get('/:id', protegerRuta, verificarRoles('ADMIN', 'GESTOR', 'EMPLEADO'), obtenerProveedorPorId);
router.post('/', protegerRuta, verificarRoles('ADMIN', 'GESTOR'), crearProveedor);
router.put('/:id', protegerRuta, verificarRoles('ADMIN', 'GESTOR'), editarProveedor);
router.patch('/:id/activo', protegerRuta, verificarRoles('ADMIN', 'GESTOR'), cambiarActivoProveedor);

// Exportamos el router para poder utilizarlo en otros archivos
export default router;