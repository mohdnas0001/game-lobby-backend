const express = require('express');
const {
  joinSession,
  pickNumber,
  getOrCreateActiveSession,
  getLeaderboard,
  getSessionResult
} = require('../controllers/gameController');
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
 *       400:
 *         description: Already joined this session
 *       401:
 *         description: Unauthorized
 */
router.post('/join', authMiddleware, joinSession);

/**
 * @swagger
 * /api/game/pick-number:
 *   post:
 *     summary: Pick a number for the current session
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
 *         description: Number picked/updated
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *       400:
 *         description: Bad request or number already picked
 *       401:
 *         description: Unauthorized
 */
router.post('/pick-number', authMiddleware, pickNumber);

/**
 * @swagger
 * /api/game/session/active:
 *   get:
 *     summary: Get the currently active session
 *     tags: [Game]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Active session details
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Session'
 *       404:
 *         description: No active session
 *       401:
 *         description: Unauthorized
 */
router.get('/session/active', authMiddleware, getOrCreateActiveSession);

/**
 * @swagger
 * /api/game/session/result/{id}:
 *   get:
 *     summary: Get the result of a finished session
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
 *         description: Session result
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 winningNumber:
 *                   type: integer
 *                 winners:
 *                   type: array
 *                   items:
 *                     type: string
 *       400:
 *         description: Session not ended or not found
 *       401:
 *         description: Unauthorized
 */
router.get('/session/result/:id', authMiddleware, getSessionResult);


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