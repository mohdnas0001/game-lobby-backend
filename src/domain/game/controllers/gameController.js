const Session = require('../models/Session');
const GameResult = require('../models/GameResult');
const User = require('../../auth/models/User');


exports.getOrCreateActiveSession = async (req, res) => {
  try {
    let session = await Session.findOne({ isActive: true });
    if (!session) {
      session = new Session();
      await session.save();
    }
    res.json({
      _id: session._id,
      isActive: session.isActive,
      createdAt: session.createdAt, // UTC timestamp
      players: session.players,
    });
  } catch (error) {
    console.error('Error getting or creating session:', error);
    res.status(500).json({ message: 'Failed to get or create session', error: error.message });
  }
};

exports.joinSession = async (req, res) => {
  try {
    let session = await Session.findOne({ isActive: true });
    if (!session) {
      session = new Session();
      await session.save();
    }

    const alreadyJoined = session.players.some(p => p.user.toString() === req.user.id);
    if (alreadyJoined) {
      return res.status(400).json({ message: 'Already joined this session' });
    }

    session.players.push({ user: req.user.id });
    await session.save();

    res.json({ message: 'Joined session', sessionId: session._id });
  } catch (error) {
    console.error('Error joining session:', error);
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
    console.error('Error picking number:', error);
    res.status(500).json({ message: 'Failed to pick number', error: error.message });
  }
};

exports.endSession = async (req, res) => {
  try {
    const { sessionId } = req.body;
    const session = await Session.findById(sessionId);
    if (!session || !session.isActive) {
      return res.status(400).json({ message: 'Session not active or not found' });
    }

    // End the session
    session.isActive = false;
    session.winningNumber = Math.floor(Math.random() * 10) + 1;
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

    res.json({
      message: 'Session ended',
      winningNumber: session.winningNumber,
      winners,
    });
  } catch (error) {
    console.error('Error ending session:', error);
    res.status(500).json({ message: 'Failed to end session', error: error.message });
  }
};

exports.createNewSession = async (req, res) => {
  try {
    const activeSession = await Session.findOne({ isActive: true });
    if (activeSession) {
      return res.status(400).json({ message: 'An active session already exists' });
    }

    const session = new Session();
    await session.save();
    res.json({
      _id: session._id,
      isActive: session.isActive,
      createdAt: session.createdAt, // UTC timestamp
      players: session.players,
    });
  } catch (error) {
    console.error('Error creating new session:', error);
    res.status(500).json({ message: 'Failed to create new session', error: error.message });
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
      winners: session.players.filter(p => p.number === session.winningNumber).map(p => p.user),
    });
  } catch (error) {
    console.error('Error fetching session result:', error);
    res.status(500).json({ message: 'Failed to fetch session result', error: error.message });
  }
};

exports.getLeaderboard = async (req, res) => {
  try {
    const topPlayers = await User.find().sort({ wins: -1 }).limit(10);
    res.json(topPlayers);
  } catch (error) {
    console.error('Error fetching leaderboard:', error);
    res.status(500).json({ message: 'Failed to fetch leaderboard', error: error.message });
  }
};