import express from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { index, detail, bayar, konfirmasi, storeKonfirmasi } from '../controllers/InvoiceController.js';
import { authGuard } from '../middlewares/auth.js';

const router = express.Router();

// Ensure upload directory exists
const uploadDir = 'public/uploads/konfirmasi';
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// Multer storage config
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({
  storage: storage,
  limits: { fileSize: 2 * 1024 * 1024 } // 2MB limit
});

// Protect all routes
router.use(authGuard);

router.get('/', index);
router.get('/detail/:encryptedId', detail);
router.get('/bayar/:encryptedId', bayar);
router.get('/konfirmasi/:encryptedId', konfirmasi);
router.post('/konfirmasi/:encryptedId', upload.single('bukti'), storeKonfirmasi);

export default router;
