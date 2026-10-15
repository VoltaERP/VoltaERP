import {Router} from 'express';
import {obtenerUsuarios,obtenerUsuarioPorId, crearUsuario, editarUsuario, cambiarEstadoUsuario, cambiarRolUsuario} from '../controllers/usuarios.controller.js';
import protegerRuta from '../middlewares/protegerRutas.js';
import {esAdminOGestor,esAdmin, esGestor, esEmpleado,verificarRoles} from '../middlewares/verificarRol.js';
//el router es el que se encarga de manejar las rutas, en este caso la ruta /usuarios, 
// y los metodos get, post, put, delete, etc. y los controladores que se encargan de manejar 
// la logica de cada ruta
const router = Router();
//esta coge info de /usuarios y devuelve todos los usuarios, solo accesible para admin y gestor
router.get('/', protegerRuta, esAdminOGestor, obtenerUsuarios);
router.get('/:id', protegerRuta, verificarRoles('ADMIN', 'GESTOR', 'EMPLEADO'), obtenerUsuarioPorId);
router.post('/', protegerRuta, esAdmin, crearUsuario);
router.put('/:id', protegerRuta, verificarRoles('ADMIN', 'GESTOR'), editarUsuario);
router.patch('/:id/estado', protegerRuta, esAdmin, cambiarEstadoUsuario);
router.patch('/:id/rol', protegerRuta, esAdmin, cambiarRolUsuario);

export default router;
