const express = require('express');
const { requireAuth } = require('../middleware/auth'); // Import authentication middleware
const router = express.Router();

// Protected route example
router.get('/protected', requireAuth, (req, res) => {
  res.status(200).json({ message: `Welcome, user ${req.user.id}` });  // Send a protected message
});

module.exports = router;
