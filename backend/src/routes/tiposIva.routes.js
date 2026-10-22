import {Router} from 'express';
import protegerRuta from '../middlewares/protegerRutas.js';
import {esAdminOGestor,esAdmin, esGestor, esEmpleado,verificarRoles} from '../middlewares/verificarRol.js';
import {obtenerTiposIva, obtenerTipoIvaPorId, crearTipoIva, editarTipoIva, eliminarTipoIva} from '../controllers/tiposIva.controller.js';

const router = Router();
router.get('/', protegerRuta, verificarRoles('ADMIN','GESTOR','EMPLEADO'), obtenerTiposIva);
router.get('/:id', protegerRuta, verificarRoles('ADMIN','GESTOR','EMPLEADO'), obtenerTipoIvaPorId);
router.post('/', protegerRuta, esAdmin, crearTipoIva);
router.put('/:id', protegerRuta, esAdmin, editarTipoIva);
router.delete('/:id', protegerRuta, esAdmin, eliminarTipoIva);

export default router;