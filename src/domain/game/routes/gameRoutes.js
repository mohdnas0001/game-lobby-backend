const express = require('express');
const { joinSession, getSession, getLeaderboard } = require('../controllers/gameController');
const authMiddleware = require('../../../middleware/auth');
const router = express.Router();

router.post('/join', authMiddleware, joinSession);
router.get('/session/:id', authMiddleware, getSession);
router.get('/leaderboard', getLeaderboard);

module.exports = router;