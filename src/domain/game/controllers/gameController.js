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

    session.players.push({ user: req.user.id }); // No number yet
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
    if (player.number) {
      return res.status(400).json({ message: 'Number already picked' });
    }

    player.number = number;
    await session.save();

    res.json({ message: 'Number picked' });
  } catch (error) {
    res.status(500).json({ message: 'Failed to pick number', error: error.message });
  }
};

exports.getSession = async (req, res) => {
  try {
    const session = await Session.findById(req.params.id).populate('players.user');
    if (!session) return res.status(404).json({ message: 'Session not found' });
    res.json(session);
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch session', error: error.message });
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

async function endSession(sessionId) {
  try {
    const session = await Session.findById(sessionId);
    if (!session || !session.isActive) return;
    
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
      winners
    });
    
    await Promise.all([session.save(), gameResult.save()]);
  } catch (error) {
    console.error('Error ending session:', error);
  }
}