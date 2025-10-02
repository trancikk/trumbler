import { Router } from 'express';
import { authenticate, requireRole } from '../middleware/auth';
import { createPurchase, getUserPurchases } from '../controllers/purchase';

const router = Router();

router.post('/', authenticate, requireRole(['VIEWER']), createPurchase);
router.get('/my-purchases', authenticate, getUserPurchases);

export default router;
