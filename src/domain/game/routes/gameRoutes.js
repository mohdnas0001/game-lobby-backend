const express = require('express');
const {
  joinSession,
  pickNumber,
  getOrCreateActiveSession,
  getLeaderboard,
  getSessionResult,
  endSession,
  createNewSession,
} = require('../controllers/gameController');
const authMiddleware = require('../../../middleware/auth');
const router = express.Router();

/**
 * @swagger
 * components:
 *   schemas:
 *     Session:
 *       type: object
 *       properties:
 *         _id:
 *           type: string
 *           description: The session ID
 *         isActive:
 *           type: boolean
 *           description: Whether the session is active
 *         createdAt:
 *           type: string
 *           format: date-time
 *           description: Session creation time (UTC)
 *         players:
 *           type: array
 *           items:
 *             type: object
 *             properties:
 *               user:
 *                 type: string
 *                 description: User ID
 *               number:
 *                 type: integer
 *                 description: User's chosen number (1-10)
 */

/**
 * @swagger
 * /api/game/join:
 *   post:
 *     summary: Join an active game session
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
 *                   example: Joined session
 *                 sessionId:
 *                   type: string
 *                   example: 686ba0fe0a5c446402a07ea8
 *       400:
 *         description: Already joined this session or no active session
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Already joined this session
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Server error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 error:
 *                   type: string
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
 *                 minimum: 1
 *                 maximum: 10
 *                 example: 5
 *                 description: The number to pick (1-10)
 *     responses:
 *       200:
 *         description: Number picked or updated
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Number picked/updated
 *       400:
 *         description: Invalid number or not joined
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Number must be between 1 and 10
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Server error
 */
router.post('/pick-number', authMiddleware, pickNumber);

/**
 * @swagger
 * /api/game/session/active:
 *   get:
 *     summary: Get or create an active game session
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
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Server error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 error:
 *                   type: string
 */
router.get('/session/active', authMiddleware, getOrCreateActiveSession);

/**
 * @swagger
 * /api/game/end:
 *   post:
 *     summary: End an active game session
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
 *               - sessionId
 *             properties:
 *               sessionId:
 *                 type: string
 *                 example: 686ba0fe0a5c446402a07ea8
 *                 description: The ID of the session to end
 *     responses:
 *       200:
 *         description: Session ended successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Session ended
 *                 winningNumber:
 *                   type: integer
 *                   example: 7
 *                 winners:
 *                   type: array
 *                   items:
 *                     type: string
 *                     description: User IDs of winners
 *                   example: ["60d5f3b2c4b3c12e4c8f9a1b"]
 *       400:
 *         description: Session not active or not found
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Session not active or not found
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Server error
 */
router.post('/end', authMiddleware, endSession);

/**
 * @swagger
 * /api/game/session/new:
 *   post:
 *     summary: Create a new game session
 *     tags: [Game]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: New session created
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Session'
 *       400:
 *         description: An active session already exists
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: An active session already exists
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Server error
 */
router.post('/session/new', authMiddleware, createNewSession);

/**
 * @swagger
 * /api/game/session/result/{id}:
 *   get:
 *     summary: Get the result of a finished game session
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
 *                   example: 7
 *                 winners:
 *                   type: array
 *                   items:
 *                     type: string
 *                     description: User IDs of winners
 *                   example: ["60d5f3b2c4b3c12e4c8f9a1b"]
 *       400:
 *         description: Session not ended or not found
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Session not ended or not found
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Server error
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
 *                     description: User ID
 *                   username:
 *                     type: string
 *                     description: Username
 *                   wins:
 *                     type: integer
 *                     description: Number of wins
 *                     example: 5
 *       500:
 *         description: Server error
 */
router.get('/leaderboard', getLeaderboard);

module.exports = router;