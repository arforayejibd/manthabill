import express from 'express';
import { index } from '../controllers/MemberController.js';
import { authGuard } from '../middlewares/auth.js';

const router = express.Router();

// Apply authGuard to all member routes
router.use(authGuard);

router.get('/', index);

export default router;
