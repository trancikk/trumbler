import { Router } from 'express';
import multer from 'multer';
import path from 'path';
import { authenticate, requireRole } from '../middleware/auth';
import {
  createContent,
  getContent,
  getContentById,
  updateContent,
  deleteContent
} from '../controllers/content';

const router = Router();

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, process.env.UPLOAD_DIR || './uploads');
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({ storage });

router.post(
  '/',
  authenticate,
  requireRole(['CREATOR']),
  upload.fields([
    { name: 'fullFile', maxCount: 1 },
    { name: 'previewFile', maxCount: 1 }
  ]),
  createContent
);

router.get('/', getContent);
router.get('/:id', getContentById);

router.put(
  '/:id',
  authenticate,
  requireRole(['CREATOR']),
  updateContent
);

router.delete(
  '/:id',
  authenticate,
  requireRole(['CREATOR']),
  deleteContent
);

export default router;
