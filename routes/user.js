const express = require('express');
const db = require('../db');
const router = express.Router();
const authMiddleware = require('../middleware/auth');

// router.get('/profile', authMiddleware, async (req, res) => {

//       console.log('Decoded JWT in req.user:', req.user.email); 
//   const email = req.user.email;

//   const [rows] = await db.execute('SELECT id, name, email, role, avatar_url, auth_type FROM users WHERE email = ?', [email]);
//   if (rows.length === 0) return res.status(404).json({ error: 'User not found' });

//   res.json(rows[0]);
// });

router.get('/profile', authMiddleware, async (req, res) => {
  try {
    const email = req.user?.email;

    if (!email) {
      return res.status(400).json({ error: 'Email is missing from JWT' });
    }

    const [rows] = await db.execute(
      'SELECT id, name, email, role, avatar_url, auth_type FROM users WHERE email = ?',
      [email]
    );

    if (rows.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }

    return res.json(rows[0]);
  } catch (err) {
    console.error('Error fetching profile:', err.message);
    return res.status(500).json({ error: 'Internal server error' });
  }
});


router.put('/profile/update', authMiddleware, async (req, res) => {
  const { name, avatar_url } = req.body;
  const email = req.user.email;

  try {
    await db.query(
      'UPDATE users SET name = ?, avatar_url = ? WHERE email = ?',
      [name, avatar_url, email]
    );

    const [rows] = await db.query(
      'SELECT id, name, email, avatar_url FROM users WHERE email = ?',
      [email]
    );

    res.json(rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to update profile' });
  }
});

router.post('/logout', (req, res) => {
  res.clearCookie('token'); // or whatever your JWT cookie name is
  res.status(200).json({ message: 'Logged out' });
});





// router.put('profile/update', authMiddleware, async (req, res) => {
//   const { name, avatar_url } = req.body;
//   const email = req.user?.email;

//   if (!email) {
//     return res.status(401).json({ error: 'Unauthorized: Email missing from token' });
//   }

//   try {
//     const [result] = await db.execute(
//       'UPDATE users SET name = ?, avatar_url = ? WHERE email = ?',
//       [name, avatar_url, email]
//     );

//     console.log("result",[result]);

//     if (result.affectedRows === 0) {
//       return res.status(404).json({ error: 'User not found or no change' });
//     }

//     res.json({ message: 'Profile updated successfully' });
//   } catch (err) {
//     console.error('Error updating profile:', err);
//     res.status(500).json({ error: 'Database error while updating profile' });
//   }
// });

module.exports = router;
