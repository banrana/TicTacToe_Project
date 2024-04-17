const mongoose = require('mongoose');

const roomSchema = new mongoose.Schema({
    roomname: { type: String, required: true, unique: true },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'users' },
    createdAt: { type: Date, default: Date.now },
    players: [{ type: mongoose.Schema.Types.ObjectId, ref: 'users' }],
});

const Room = mongoose.model('Room', roomSchema);

module.exports = Room;
