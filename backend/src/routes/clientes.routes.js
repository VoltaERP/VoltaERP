import {Router} from 'express';
import {obtenerClientes, obtenerClientePorId, crearCliente, editarCliente, cambiarActivo} from '../controllers/clientes.controller.js';
import protegerRuta from '../middlewares/protegerRutas.js';
import {esAdminOGestor,esAdmin, esGestor, esEmpleado,verificarRoles} from '../middlewares/verificarRol.js';

const router = Router();

router.get('/', protegerRuta, verificarRoles('ADMIN','GESTOR','EMPLEADO'), obtenerClientes);
router.get('/:id', protegerRuta, verificarRoles('ADMIN','GESTOR','EMPLEADO'), obtenerClientePorId);
router.post('/', protegerRuta, esAdminOGestor, crearCliente);
router.put('/:id', protegerRuta, esAdminOGestor, editarCliente);
router.patch('/:id/activo', protegerRuta, esAdminOGestor, cambiarActivo);

export default router;