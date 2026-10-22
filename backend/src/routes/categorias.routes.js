import {Router} from 'express';
import protegerRuta from '../middlewares/protegerRutas.js';
import {esAdminOGestor,esAdmin, esGestor, esEmpleado,verificarRoles} from '../middlewares/verificarRol.js';
import {obtenerCategorias, obtenerCategoriaPorId, crearCategoria, editarCategoria, eliminarCategoria} from '../controllers/categorias.controller.js';

const router = Router();

router.get('/', protegerRuta, verificarRoles('ADMIN','GESTOR','EMPLEADO'), obtenerCategorias);
router.get('/:id', protegerRuta, verificarRoles('ADMIN','GESTOR','EMPLEADO'), obtenerCategoriaPorId);
router.post('/', protegerRuta, esAdmin, crearCategoria);
router.put('/:id', protegerRuta, esAdmin, editarCategoria);
router.delete('/:id', protegerRuta, esAdmin, eliminarCategoria);

export default router;