import express from 'express';
import {
  loginIndex,
  loginStore,
  registerIndex,
  registerStore,
  checkEmail,
  getCsrf,
  logout
} from '../controllers/AuthController.js';
import {
  loginIndex as adminLoginIndex,
  loginStore as adminLoginStore,
  logout as adminLogout
} from '../controllers/AdminAuthController.js';
import { guestGuard, adminGuestGuard } from '../middlewares/auth.js';

const router = express.Router();

// Visitor / Member Guest Routes
router.get('/login', guestGuard, loginIndex);
router.post('/login', guestGuard, loginStore);

router.get('/register', guestGuard, registerIndex);
router.post('/register', guestGuard, registerStore);
router.post('/register/check-email', checkEmail);
router.get('/register/get-csrf', getCsrf);

// Member Logout
router.get('/Member/logout', logout);

// Admin Guest Routes
router.get('/staff/login', adminGuestGuard, adminLoginIndex);
router.post('/staff/login', adminGuestGuard, adminLoginStore);

// Admin Logout
router.get('/staff/Admin/logout', adminLogout);

export default router;
