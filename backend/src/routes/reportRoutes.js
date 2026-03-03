const express = require('express');
const reportController = require('../controllers/reportController');
const { authenticateToken, authorizeRole } = require('../middlewares/authMiddleware');

const router = express.Router();

router.use(authenticateToken);

router.get('/stats', reportController.getDashboardStats);
router.get('/evaluation/:evaluationId/result', reportController.getEvaluationResult);

module.exports = router;
