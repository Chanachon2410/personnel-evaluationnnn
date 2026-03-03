const express = require('express');
const evaluatorController = require('../controllers/evaluatorController');
const { authenticateToken, authorizeRole } = require('../middlewares/authMiddleware');

const router = express.Router();

router.use(authenticateToken);
router.use(authorizeRole('EVALUATOR', 'ADMIN'));

// Matches Evaluations.jsx call: /api/evaluator/assigned-evaluations
router.get('/assigned-evaluations', evaluatorController.getAssignedEvaluations);

// Matches AssignmentList.jsx call: /api/evaluator/evaluations/:evaluationId
router.get('/evaluations/:evaluationId', evaluatorController.getEvaluatorAssignments);

// Matches EvaluationResult.jsx call: /api/evaluator/assignments/:id/results
router.get('/assignments/:id/results', evaluatorController.getAssignmentResults);

// Matches EvaluationForm.jsx calls
router.get('/assignments/:id', evaluatorController.getAssignmentById);
router.post('/assignments/:id/score', evaluatorController.submitScore);

module.exports = router;
