const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { v4: uuidv4 } = require('uuid');
const db = require('../db');
require('dotenv').config();
const axios = require('axios');


router.post('/register', async (req, res) => {
  const { name, email, password } = req.body;
  try {
    const hashed = await bcrypt.hash(password, 10);
    const id = uuidv4();

        const avatar_url = `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=random`;
        console.log("avatar_url",avatar_url);
    await db.query('INSERT INTO users (id, name, email, password_hash, avatar_url,role, auth_type) VALUES (?, ?, ?,?, ?, ?, ?)', 
      [id, name, email, hashed,avatar_url, 'user', 'email']);

    

    // const token = jwt.sign({ id, role: 'user' }, 'your_jwt_secret', { expiresIn: '7d' });
    const token = jwt.sign({ id, email, role: 'user' }, process.env.JWT_SECRET, {
  expiresIn: '7d',
});
  res.cookie('token', token, { httpOnly: true, maxAge: 7 * 24 * 60 * 60 * 1000 }); // 7 days
    res.json({ id, email, name });
  } catch (err) {
    res.status(400).json({ error: 'Email may already be in use' });
  }
});

router.post('/login', async (req, res) => {
  const { email, password } = req.body;
  const [rows] = await db.query('SELECT * FROM users WHERE email = ?', [email]);
  const user = rows[0];
  if (!user || !(await bcrypt.compare(password, user.password_hash))) {
    return res.status(401).json({ error: 'Invalid credentials' });
  }
//   const token = jwt.sign({ id: user.id, role: user.role }, 'your_jwt_secret', { expiresIn: '7d' });
const token = jwt.sign({ id: user.id, email: user.email, role: user.role }, process.env.JWT_SECRET, {
  expiresIn: '7d',
});
res.cookie('token', token, { httpOnly: true, maxAge: 7 * 24 * 60 * 60 * 1000 }); // 7 days
  res.json({ id: user.id, email: user.email, name: user.name });
});

router.post('/logout', (req, res) => {
  res.clearCookie('token');
  res.sendStatus(200);
});

router.get('/google', (req, res) => {
  const url = `https://accounts.google.com/o/oauth2/v2/auth?` +
    new URLSearchParams({
      client_id: process.env.GOOGLE_CLIENT_ID,
      redirect_uri: process.env.GOOGLE_REDIRECT_URI,
      response_type: 'code',
      scope: 'email profile',
      access_type: 'offline',
      prompt: 'consent',
    }).toString();

  res.redirect(url);
});


// File: routes/auth.js
router.get('/google', (req, res) => {
  const url = `https://accounts.google.com/o/oauth2/v2/auth?` +
    new URLSearchParams({
      client_id: process.env.GOOGLE_CLIENT_ID,
      redirect_uri: process.env.GOOGLE_REDIRECT_URI,
      response_type: 'code',
      scope: 'email profile',
      access_type: 'offline',
      prompt: 'consent'
    });
  res.redirect(url);
});

// Step 2: Google Callback
router.get('/google/callback', async (req, res) => {
  const code = req.query.code;

  try {
    // Exchange code for tokens
    const tokenRes = await axios.post('https://oauth2.googleapis.com/token', null, {
      params: {
        code,
        client_id: process.env.GOOGLE_CLIENT_ID,
        client_secret: process.env.GOOGLE_CLIENT_SECRET,
        redirect_uri: process.env.GOOGLE_REDIRECT_URI,
        grant_type: 'authorization_code',
      }
    });

    const { access_token } = tokenRes.data;

    // Get user profile
    const userInfo = await axios.get(`https://www.googleapis.com/oauth2/v3/userinfo?access_token=${access_token}`);
    const { email, name, picture, sub: provider_id } = userInfo.data;

    // Check if user exists
    let [rows] = await db.execute('SELECT * FROM users WHERE email = ?', [email]);
    let user = rows[0];

    if (!user) {
      await db.execute(
        'INSERT INTO users (email, name, avatar_url, role, auth_type) VALUES (?, ?, ?, ?, ?)',
        [email, name, picture, 'user', 'oauth']
      );
      [rows] = await db.execute('SELECT * FROM users WHERE email = ?', [email]);
      user = rows[0];
    }

    // Save OAuth tokens
    await db.execute(
      `INSERT INTO oauth_accounts (user_id, provider, provider_id, access_token)
       VALUES (?, ?, ?, ?)
       ON DUPLICATE KEY UPDATE access_token = VALUES(access_token)`,
      [user.id, 'google', provider_id, access_token]
    );

    // Set JWT
    const token = jwt.sign({ email: user.email, role: user.role }, process.env.JWT_SECRET, { expiresIn: '7d' });
   res.cookie('token', token, {
  httpOnly: true,
  secure: false, // set true in production (HTTPS)
  sameSite: 'Lax', // or 'None'
  maxAge: 7 * 24 * 60 * 60 * 1000
});


    // Redirect to dashboard
    res.redirect('http://localhost:3000/dashboard');
  } catch (err) {
    console.error('OAuth Callback Error:', err.response?.data || err.message);
    res.status(500).send('OAuth Error');
  }
});



module.exports = router;
