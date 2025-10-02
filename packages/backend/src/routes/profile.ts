import { Router } from 'express';
import { authenticate, requireRole } from '../middleware/auth';
import { getProfile, updateCreatorProfile } from '../controllers/profile';

const router = Router();

router.get('/', authenticate, getProfile);
router.put('/creator', authenticate, requireRole(['CREATOR']), updateCreatorProfile);

export default router;
