import express from 'express';
import { index, logout, checkpoint, help } from '../controllers/AdminDashboardController.js';
import { adminGuard } from '../middlewares/auth.js';

const router = express.Router();

// Apply adminGuard to protect staff views
router.use(adminGuard);

router.get('/', index);
router.get('/logout', logout);
router.get('/checkpoint', checkpoint);
router.get('/help', help);

export default router;
