const express = require('express');

const authRoutes = require('./routes/auth');
const userRoutes = require('./routes/user');
const adminRoutes = require('./routes/admin');

const authMiddleware = require('./middleware/auth');

require('dotenv').config();

const PORT = process.env.PORT || 5000;
const HOST = '127.0.0.1';

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

app.listen(PORT,HOST, () => console.log('✅ Server running on http://localhost:5000'));
