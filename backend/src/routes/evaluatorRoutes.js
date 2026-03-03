const express = require('express');
const evaluatorController = require('../controllers/evaluatorController');
const { authenticateToken, authorizeRole } = require('../middlewares/authMiddleware');

const router = express.Router();

router.use(authenticateToken);
router.use(authorizeRole('EVALUATOR', 'ADMIN'));

router.get('/assigned-evaluations', (req, res, next) => {
  /* #swagger.tags = ['Evaluator'] */
  evaluatorController.getAssignedEvaluations(req, res, next);
});

router.get('/evaluations/:evaluationId', (req, res, next) => {
  /* #swagger.tags = ['Evaluator'] */
  evaluatorController.getEvaluatorAssignments(req, res, next);
});

router.get('/assignments/:id/results', (req, res, next) => {
  /* #swagger.tags = ['Evaluator'] */
  evaluatorController.getAssignmentResults(req, res, next);
});

router.get('/assignments/:id', (req, res, next) => {
  /* #swagger.tags = ['Evaluator'] */
  evaluatorController.getAssignmentById(req, res, next);
});

router.post('/assignments/:id/score', (req, res, next) => {
  /* #swagger.tags = ['Evaluator'] */
  evaluatorController.submitScore(req, res, next);
});

module.exports = router;