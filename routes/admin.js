import express from 'express';
import { index, logout, checkpoint, help } from '../controllers/AdminDashboardController.js';
import {
  listUsers,
  listDomains,
  listTLDs,
  listHostings,
  listInvoices,
  listTickets,
  listPackages,
  generalSettings,
  updateGeneralSettings,
  apiSettings,
  updateApiSettings
} from '../controllers/AdminPortalController.js';
import { adminGuard } from '../middlewares/auth.js';

const router = express.Router();

// Apply adminGuard to protect staff views
router.use(adminGuard);

router.get('/', index);
router.get('/logout', logout);
router.get('/checkpoint', checkpoint);
router.get('/help', help);

// Admin Portal Data Tables & Settings Enpoints
router.get('/user', listUsers);
router.get('/domain', listDomains);
router.get('/service_domain', listTLDs);
router.get('/shared_hosting', listHostings);
router.get('/invoice', listInvoices);
router.get('/inbox', listTickets);
router.get('/paket', listPackages);

router.get('/setting_umum', generalSettings);
router.post('/setting_umum', updateGeneralSettings);

router.get('/setting_api', apiSettings);
router.post('/setting_api', updateApiSettings);

export default router;
