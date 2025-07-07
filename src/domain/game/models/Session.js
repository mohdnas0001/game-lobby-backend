const mongoose = require('mongoose');

const sessionSchema = new mongoose.Schema({
  isActive: { type: Boolean, default: true },
  winningNumber: Number,
  players: [{
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    number: Number
  }]
}, { timestamps: true });

module.exports = mongoose.model('Session', sessionSchema);


