import { Router } from 'express';
import { login, me, refresh } from '../controllers/auth.controller.js';
import protegerRuta from '../middlewares/protegerRutas.js';

const router = Router();

router.post('/login', login);
router.get('/me', protegerRuta, me);
router.post('/refresh', protegerRuta, refresh);

export default router;