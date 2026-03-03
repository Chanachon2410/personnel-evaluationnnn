const express = require('express');
const adminController = require('../controllers/adminController');
const { authenticateToken, authorizeRole } = require('../middlewares/authMiddleware');

const router = express.Router();

router.use(authenticateToken);
router.use(authorizeRole('ADMIN'));

// Test Route
router.get('/test-status', (req, res) => res.json({ message: 'Admin API is online and working!' }));

// User Management
router.get('/users', adminController.getUsers);
router.post('/users', adminController.createUser);
router.patch('/users/:id', adminController.updateUser);
router.delete('/users/:id', adminController.deleteUser);
router.get('/departments', adminController.getDepartments);

// Evaluation
router.get('/evaluations', adminController.getEvaluations);
router.post('/evaluations', adminController.createEvaluation);
router.get('/evaluations/:id', adminController.getEvaluationDetail);
router.patch('/evaluations/:id', adminController.updateEvaluation);
router.delete('/evaluations/:id', adminController.deleteEvaluation);

// Topic / Indicator
router.post('/evaluations/:evaluationId/topics', adminController.createTopic);
router.patch('/topics/:id', adminController.updateTopic);
router.delete('/topics/:id', adminController.deleteTopic);
router.post('/topics/:id/indicators', adminController.createIndicator);
router.patch('/indicators/:id', adminController.updateIndicator);
router.delete('/indicators/:id', adminController.deleteIndicator);

// Assignment
router.get('/evaluations/:evaluationId/assignments', adminController.getAssignments);
router.post('/assignments', adminController.createAssignment);
router.delete('/assignments/:id', adminController.deleteAssignment);
router.get('/assignments/:id/results', adminController.getAssignmentResults);

module.exports = router;
