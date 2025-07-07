const Session = require('../models/Session');
const GameResult = require('../models/GameResult');
const User = require('../../auth/models/User');

exports.joinSession = async (req, res) => {
  try {
    let session = await Session.findOne({ isActive: true });
    if (!session) {
      session = new Session();
      await session.save();
      setTimeout(() => endSession(session._id), 20000);
    }

    const alreadyJoined = session.players.some(p => p.user.toString() === req.user.id);
    if (alreadyJoined) {
      return res.status(400).json({ message: 'Already joined this session' });
    }

    session.players.push({ user: req.user.id }); 
    await session.save();

    res.json({ message: 'Joined session', sessionId: session._id });
  } catch (error) {
    res.status(500).json({ message: 'Failed to join session', error: error.message });
  }
};

exports.pickNumber = async (req, res) => {
  try {
    const { number } = req.body;
    if (!number || number < 1 || number > 10) {
      return res.status(400).json({ message: 'Number must be between 1 and 10' });
    }

    const session = await Session.findOne({ isActive: true, 'players.user': req.user.id });
    if (!session) {
      return res.status(400).json({ message: 'Not joined or session not active' });
    }

    const player = session.players.find(p => p.user.toString() === req.user.id);
    if (!player) {
      return res.status(400).json({ message: 'Not joined' });
    }

    player.number = number; 
    await session.save();

    res.json({ message: 'Number picked/updated' });
  } catch (error) {
    res.status(500).json({ message: 'Failed to pick number', error: error.message });
  }
};

exports.getOrCreateActiveSession = async (req, res) => {
  try {
    let session = await Session.findOne({ isActive: true });
    if (!session) {
      session = new Session();
      await session.save();
      setTimeout(() => endSession(session._id), 20000);
    }

    // Calculate time left on the backend
    const SESSION_DURATION = 20; // seconds
    const startTime = new Date(session.createdAt).getTime();
    const now = Date.now();
    const timeLeft = Math.max(0, Math.floor((startTime + SESSION_DURATION * 1000 - now) / 1000));

    res.json({
      _id: session._id,
      isActive: session.isActive,
      createdAt: session.createdAt,
      players: session.players,
      timeLeft, // Include timeLeft in the response
    });
  } catch (error) {
    res.status(500).json({ message: 'Failed to get or create session', error: error.message });
  }
};

exports.getLeaderboard = async (req, res) => {
  try {
    const topPlayers = await User.find().sort({ wins: -1 }).limit(10);
    res.json(topPlayers);
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch leaderboard', error: error.message });
  }
};

exports.getSessionResult = async (req, res) => {
  try {
    const session = await Session.findById(req.params.id);
    if (!session || session.isActive) {
      return res.status(400).json({ message: 'Session not ended or not found' });
    }
    res.json({
      winningNumber: session.winningNumber,
      winners: session.players.filter(p => p.number === session.winningNumber).map(p => p.user)
    });
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch session result', error: error.message });
  }
};


const SESSION_DURATION = 20; // seconds, consistent with frontend

async function endSession(sessionId) {
  try {
    const session = await Session.findById(sessionId);
    if (!session || !session.isActive) {
      console.log(`Session ${sessionId} not found or already inactive`);
      return;
    }

    // End current round
    session.isActive = false;
    session.winningNumber = Math.floor(Math.random() * 10) + 1; // Fixed bug
    const winners = session.players
      .filter(p => p.number === session.winningNumber)
      .map(p => p.user);

    await User.updateMany(
      { _id: { $in: winners } },
      { $inc: { wins: 1 } }
    );

    const gameResult = new GameResult({
      session: session._id,
      winners,
    });

    await Promise.all([session.save(), gameResult.save()]);
    console.log(`Session ${sessionId} ended. Winning number: ${session.winningNumber}, Winners: ${winners.length}`);

    // Delay before restarting the session (5 seconds)
    setTimeout(async () => {
      session.isActive = true;
      session.createdAt = new Date();
      session.markModified('createdAt');
      session.winningNumber = undefined;
      session.players = [];
      await session.save();
      console.log(`Session ${sessionId} restarted with new createdAt: ${session.createdAt}`);

      // Schedule the next session end
      setTimeout(() => endSession(session._id), SESSION_DURATION * 1000);
    }, 5000); // 5-second delay
  } catch (error) {
    console.error(`Error ending session ${sessionId}:`, error);
  }
}