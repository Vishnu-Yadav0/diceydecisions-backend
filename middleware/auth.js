const jwt = require('jsonwebtoken');
const User = require('../models/User'); // ensure correct path

const requireAuth = async (req, res, next) => {
  const token = req.headers['authorization']?.split(' ')[1];

  if (!token) {
    return res.status(401).json({ message: 'Authorization token is required' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.userId); 

    if (!user) {
      return res.status(401).json({ message: 'User not found' });
    }

    req.user = user; // ✅ attach full user (with _id) to request
    next();
  } catch (err) {
    console.error(err);
    return res.status(403).json({ message: 'Invalid token' });
  }
};

module.exports = { requireAuth };
