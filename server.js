const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

const authRoutes = require('./routes/auth');
const protectedRoutes = require('./routes/protected'); 
const roomsRoutes = require('./routes/rooms'); // Updated import

const app = express();
app.use(cors());
app.use(express.json());

// Use separate base paths for auth and protected routes
app.use('/api/auth', authRoutes);  // For signup, login
app.use('/api/protected', protectedRoutes);  // For the protected route
app.use('/api/rooms', roomsRoutes);  // Handle all room-related actions

// Default route (for root URL)
app.get('/', (req, res) => {
  res.send(`
    <h1>🎲 Welcome to the DiceyDecisions API!</h1>
    <p>The API is running successfully!</p>
  `);
});

mongoose.connect(process.env.MONGO_URI)
  .then(() => {
    app.listen(process.env.PORT, () => {
      console.log(`🚀 Server running on port ${process.env.PORT}`);
    });

    console.log('✅ MongoDB connected');
  })
  .catch((err) => console.error('❌ MongoDB connection error:', err));
