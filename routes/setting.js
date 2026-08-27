import express from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { index, update, changePassword, updatePassword } from '../controllers/SettingController.js';
import { authGuard } from '../middlewares/auth.js';

const router = express.Router();

const uploadDir = 'public/uploads/avatars';
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

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
  limits: { fileSize: 2 * 1024 * 1024 }
});

// Protect routes
router.use(authGuard);

router.get('/', index);
router.post('/update', upload.single('gambar'), update);
router.get('/password', changePassword);
router.post('/password', updatePassword);

export default router;
