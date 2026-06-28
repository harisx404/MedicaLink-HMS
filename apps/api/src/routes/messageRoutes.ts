import { Router } from 'express';
import { authenticate } from '../middlewares/auth';
import {
  sendMessage,
  getInbox,
  getConversation,
  searchStaff
} from '../controllers/messageController';

const router = Router();

// Apply auth middleware to all routes
router.use(authenticate);

router.post('/', sendMessage);
router.get('/inbox', getInbox);
router.get('/search-staff', searchStaff);
router.get('/:otherUserId', getConversation);

export const messageRoutes: Router = router;
