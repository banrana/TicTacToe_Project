const mongoose = require('mongoose');

const gameSchema = new mongoose.Schema({
    roomId: { type: mongoose.Schema.Types.ObjectId, ref: 'rooms' },
    moves: [{ type: String }], 
    board: { type: String }, 
    winner: { type: mongoose.Schema.Types.ObjectId, ref: 'users' },
    createdAt: { type: Date, default: Date.now },
    finishedAt: { type: Date }
});

const Game = mongoose.model('Game', gameSchema);

module.exports = Game;
