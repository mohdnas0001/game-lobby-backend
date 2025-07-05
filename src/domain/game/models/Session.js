const mongoose = require('mongoose');

const sessionSchema = new mongoose.Schema({
  isActive: { type: Boolean, default: true },
  createdAt: { type: Date, default: Date.now },
  players: [{
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    number: { type: Number, min: 1, max: 10 }
  }],
  winningNumber: { type: Number }
});

module.exports = mongoose.model('Session', sessionSchema);