import express from 'express';
import { trackVisit, getVisitStats, getStatsSummary, getMonthlyVisitStats } from '../controllers/dashboardController.js';
import { verifyAdmin } from '../utils/verifyToken.js';

const router = express.Router();

router.post('/track', trackVisit);
router.post('/track/:tourId', trackVisit);
router.get('/stats', getVisitStats);
router.get('/stats/summary', verifyAdmin, getStatsSummary);
router.get('/stats/monthly', verifyAdmin, getMonthlyVisitStats);



export default router;
