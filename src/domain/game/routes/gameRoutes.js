const express = require('express');
const { joinSession, getSession, getLeaderboard } = require('../controllers/gameController');
const authMiddleware = require('../../../middleware/auth');
const router = express.Router();

/**
 * @swagger
 * /api/game/join:
 *   post:
 *     summary: Join a game session
 *     tags: [Game]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - number
 *             properties:
 *               number:
 *                 type: integer
 *                 example: 5
 *     responses:
 *       200:
 *         description: Successfully joined session
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 sessionId:
 *                   type: string
 *       401:
 *         description: Unauthorized
 */
router.post('/join', authMiddleware, joinSession);

/**
 * @swagger
 * /api/game/session/{id}:
 *   get:
 *     summary: Get details of a game session
 *     tags: [Game]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Session ID
 *     responses:
 *       200:
 *         description: Session details
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 _id:
 *                   type: string
 *                 isActive:
 *                   type: boolean
 *                 players:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       user:
 *                         type: string
 *                       number:
 *                         type: integer
 *                 winningNumber:
 *                   type: integer
 *                   nullable: true
 *                 createdAt:
 *                   type: string
 *                   format: date-time
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Session not found
 */
router.get('/session/:id', authMiddleware, getSession);

/**
 * @swagger
 * /api/game/leaderboard:
 *   get:
 *     summary: Get leaderboard of top players
 *     tags: [Game]
 *     responses:
 *       200:
 *         description: List of top players
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   _id:
 *                     type: string
 *                   username:
 *                     type: string
 *                   wins:
 *                     type: integer
 */
router.get('/leaderboard', getLeaderboard);

module.exports = router;