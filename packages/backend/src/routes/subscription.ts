import { Router } from 'express';
import { authenticate, requireRole } from '../middleware/auth';
import {
  createSubscription,
  getUserSubscription,
  cancelSubscription
} from '../controllers/subscription';

const router = Router();

router.post('/', authenticate, requireRole(['VIEWER']), createSubscription);
router.get('/my-subscription', authenticate, getUserSubscription);
router.delete('/:id', authenticate, cancelSubscription);

export default router;
