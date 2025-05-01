//models/Room.js
const mongoose = require('mongoose');
const crypto = require('crypto');

const roomSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String, required: true },
  maxParticipants: { type: Number, required: true },
  creatorId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  participants: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  isOpen: { type: Boolean, default: true },
  roomCode: { type: String, required: true, unique: true }
}, { timestamps: true });

// Pre-save hook to generate a unique roomCode
roomSchema.pre('save', async function (next) {
  if (this.roomCode) return next();

  try {
    let codeGenerated = false;
    while (!codeGenerated) {
      const code = crypto.randomBytes(6).toString('hex'); // 12-char code
      const existing = await mongoose.models.Room.findOne({ roomCode: code });
      if (!existing) {
        this.roomCode = code;
        codeGenerated = true;
      }
    }
    next();
  } catch (err) {
    next(err);
  }
});

const Room = mongoose.model('Room', roomSchema);
module.exports = Room;
