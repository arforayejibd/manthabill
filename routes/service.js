import express from 'express';
import { index, detail } from '../controllers/ServiceController.js';
import { authGuard } from '../middlewares/auth.js';

const router = express.Router();

// Apply authGuard to protect actions
router.use(authGuard);

router.get('/', index);
router.get('/detail/:encryptedId', detail);

export default router;
