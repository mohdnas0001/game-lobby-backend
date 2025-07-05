const express = require('express');
const authRoutes = require('../domain/auth/routes/authRoutes');
const gameRoutes = require('../domain/game/routes/gameRoutes');

const router = express.Router();

router.use('/auth', authRoutes);
router.use('/game', gameRoutes);

module.exports = router;