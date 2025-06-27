const express = require('express');

const authRoutes = require('./routes/auth');
const userRoutes = require('./routes/user');
const adminRoutes = require('./routes/admin');
const authMiddleware = require('./middleware/auth');

require('dotenv').config();

const cookieParser = require('cookie-parser');
const cors = require('cors');


const app = express();



app.use(express.json());



app.use(cors({
  origin: 'http://localhost:3000',
  credentials: true
}));
app.use(cookieParser());



app.use('/api/auth', authRoutes);
app.use('/api/user', authMiddleware, userRoutes);
app.use('/api/admin', authMiddleware, adminRoutes);

app.listen(5000, () => console.log('✅ Server running on http://localhost:5000'));
