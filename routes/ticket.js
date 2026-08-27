import express from 'express';
import { index, create, store, show, reply, close } from '../controllers/TicketController.js';
import { authGuard } from '../middlewares/auth.js';

const router = express.Router();

// Apply authGuard to protect support tickets
router.use(authGuard);

router.get('/', index);
router.get('/buat', create);
router.post('/buat', store);
router.get('/lihat_ticket/:key', show);
router.post('/balas/:key', reply);
router.get('/kunci/:key', close);

export default router;
