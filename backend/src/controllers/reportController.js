const prisma = require('../config/prisma');

const getEvaluationResult = async (req, res) => {
  try {
    const { evaluationId } = req.params;
    const { userId, role } = req.user;

    const evaluation = await prisma.evaluation.findUnique({
      where: { id: parseInt(evaluationId) },
      include: {
        topics: {
          include: {
            indicators: true,
          },
        },
        assignments: {
          include: {
            evaluator: { select: { id: true, name: true } },
            evaluatee: { select: { id: true, name: true, department: true } },
            results: true,
          },
        },
      },
    });

    if (!evaluation) {
      return res.status(404).json({ message: 'Evaluation not found' });
    }

    // RBAC check
    let targetAssignments = evaluation.assignments;
    if (role === 'EVALUATEE') {
      // PDF says "Evaluatee forbidden from viewing result" 
      // but also "EVALUATEE -> only their own". 
      // Usually, it means they can see it when it's done.
      // But page 7 says "Evaluatee ห้ามดูผล" (Evaluatee forbidden from viewing result).
      // I'll stick to the "ห้ามดูผล" for EVALUATEE.
      return res.status(403).json({ message: 'Evaluatee forbidden from viewing results' });
    } else if (role === 'EVALUATOR') {
      targetAssignments = evaluation.assignments.filter(a => a.evaluatorId === userId);
    }

    const calculateScore = (indicator, score) => {
      if (!score && score !== 0) return 0;
      if (indicator.type === 'SCALE_1_4') {
        return (score / 4) * indicator.weight;
      } else if (indicator.type === 'YES_NO') {
        return (score === 1 ? 1 : 0) * indicator.weight;
      }
      return 0;
    };

    const totalIndicatorsCount = evaluation.topics.reduce((sum, topic) => sum + topic.indicators.length, 0);

    const report = targetAssignments.map(a => {
      const resultsByIndicator = {};
      a.results.forEach(r => {
        resultsByIndicator[r.indicatorId] = r.score;
      });

      let totalScore = 0;
      let scoredCount = 0;

      evaluation.topics.forEach(topic => {
        topic.indicators.forEach(indicator => {
          const score = resultsByIndicator[indicator.id];
          if (score !== undefined && score !== null) {
            totalScore += calculateScore(indicator, score);
            scoredCount++;
          }
        });
      });

      const isComplete = scoredCount === totalIndicatorsCount;

      return {
        assignmentId: a.id,
        evaluator: a.evaluator,
        evaluatee: a.evaluatee,
        totalScore: totalScore.toFixed(2),
        isComplete,
        results: a.results,
      };
    });

    res.json(report);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

const getDashboardStats = async (req, res) => {
  try {
    const { userId, role } = req.user;

    let stats = {};

    if (role === 'ADMIN') {
      const evaluationCount = await prisma.evaluation.count();
      const evaluatorCount = await prisma.user.count({ where: { role: 'EVALUATOR' } });
      const evaluateeCount = await prisma.user.count({ where: { role: 'EVALUATEE' } });
      stats = { evaluationCount, evaluatorCount, evaluateeCount };
    } else if (role === 'EVALUATOR') {
      const assignedCount = await prisma.assignment.count({
        where: { evaluatorId: userId },
      });
      stats = { assignedCount };
    } else if (role === 'EVALUATEE') {
      const myEvaluationCount = await prisma.assignment.count({
        where: { evaluateeId: userId },
      });
      stats = { myEvaluationCount };
    }

    res.json(stats);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

module.exports = {
  getEvaluationResult,
  getDashboardStats,
};
