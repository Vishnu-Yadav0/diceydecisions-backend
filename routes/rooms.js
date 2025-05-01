const express = require('express');
const router = express.Router();
const Room = require('../models/Room');
const { requireAuth } = require('../middleware/auth');
const crypto = require('crypto');

// POST /api/rooms/create - Create a new room
router.post('/create', requireAuth, async (req, res) => {
  const { title, description, maxParticipants } = req.body;
  const creatorId = req.user._id;

  try {
    let roomCode;
    let isUnique = false;

    // Generate a unique roomCode
    while (!isUnique) {
      roomCode = crypto.randomBytes(4).toString('hex'); // 8-char code
      const existing = await Room.findOne({ roomCode });
      if (!existing) isUnique = true;
    }

    const room = new Room({
      title,
      description,
      maxParticipants,
      creatorId,
      participants: [creatorId],
      roomCode // explicitly passed
    });

    await room.save();
    res.status(201).json({ message: 'Room created successfully', room });

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Failed to create room', error: err.message });
  }
});

// POST /api/rooms/:roomCode/join - Join a room using the room code
router.post('/:roomCode/join', requireAuth, async (req, res) => {
  const { roomCode } = req.params;

  if (!roomCode) {
    return res.status(400).json({ message: 'Room code is required' });
  }

  try {
    const room = await Room.findOne({ roomCode });

    if (!room) {
      return res.status(404).json({ message: 'Room not found' });
    }

    if (room.participants.includes(req.user.id)) {
      return res.status(400).json({ message: 'You are already in this room' });
    }

    if (room.participants.length >= room.maxParticipants) {
      return res.status(400).json({ message: 'Room is full' });
    }

    room.participants.push(req.user.id);
    await room.save();

    res.status(200).json({ message: 'Successfully joined the room', room });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Failed to join room', error: err.message });
  }
});

// POST /api/rooms/:roomCode/leave - Leave a room
router.post('/:roomCode/leave', requireAuth, async (req, res) => {
  const { roomCode } = req.params;

  try {
    const room = await Room.findOne({ roomCode });

    if (!room) {
      return res.status(404).json({ message: 'Room not found' });
    }

    if (!room.participants.includes(req.user.id)) {
      return res.status(400).json({ message: 'You are not in this room' });
    }

    // Remove the user from the participants array
    room.participants = room.participants.filter(
      (participant) => participant.toString() !== req.user.id
    );
    await room.save();

    res.status(200).json({ message: 'Successfully left the room', room });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Failed to leave room', error: err.message });
  }
});

// GET /api/rooms/:roomCode - Get details of a room by roomCode
router.get('/:roomCode', requireAuth, async (req, res) => {
  const { roomCode } = req.params;

  try {
    const room = await Room.findOne({ roomCode }).populate('participants', 'email');

    if (!room) {
      return res.status(404).json({ message: 'Room not found' });
    }

    res.status(200).json({ room });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Failed to fetch room details', error: err.message });
  }
});

module.exports = router;
