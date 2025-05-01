const Room = require('../models/Room');
const jwt = require('jsonwebtoken');

exports.joinRoom = async (req, res) => {
    const { roomCode } = req.params;
    const { token } = req.body;
  
    console.log('Room Code:', roomCode);
    console.log('Token:', token);
  
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      console.log('Decoded User:', decoded);
      const userId = decoded.userId;
  
      const room = await Room.findOne({ roomCode });
      if (!room) {
        return res.status(404).json({ message: 'Room not found' });
      }
  
      if (!room.participants.includes(userId)) {
        room.participants.push(userId);
        await room.save();
        return res.status(200).json({ message: 'Successfully joined the room' });
      } else {
        return res.status(400).json({ message: 'You are already in the room' });
      }
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: 'Something went wrong' });
    }
  };
  


exports.leaveRoom = async (req, res) => {
    const { roomCode } = req.params; // Room code from URL
    const { token } = req.body; // User's JWT token
  
    try {
      // Verify the token
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      const userId = decoded.userId;
  
      // Find the room by roomCode
      const room = await Room.findOne({ roomCode });
      if (!room) {
        return res.status(404).json({ message: 'Room not found' });
      }
  
      // Remove user from participants list
      const index = room.participants.indexOf(userId);
      if (index !== -1) {
        room.participants.splice(index, 1);
        await room.save();
        return res.status(200).json({ message: 'Successfully left the room' });
      } else {
        return res.status(400).json({ message: 'You are not in this room' });
      }
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: 'Something went wrong' });
    }
  };
  