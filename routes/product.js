import express from 'express';
import { index, beli, invoiceStore } from '../controllers/ProductController.js';
import { authGuard } from '../middlewares/auth.js';

const router = express.Router();

// Apply authGuard to protect catalog purchase
router.use(authGuard);

router.get('/', index);
router.get('/beli/:encryptedId', beli);
router.post('/invoice/:encryptedId', invoiceStore);

export default router;
