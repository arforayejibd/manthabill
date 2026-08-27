import express from 'express';
import { index, beli, storeBeli } from '../controllers/DomainController.js';
import { authGuard } from '../middlewares/auth.js';

const router = express.Router();

// Apply authGuard to protect domain actions
router.use(authGuard);

router.get('/', index);
router.get('/beli', beli);
router.post('/beli', storeBeli);

export default router;
