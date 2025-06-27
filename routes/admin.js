const express = require('express');
const db = require('../db');
const router = express.Router();
const bcrypt = require('bcrypt');

bcrypt.compare('Admin123!', '<copied_password_hash_from_db>')
  .then(console.log);  // Should print true


router.get('/users', async (req, res) => {
  if (req.user.role !== 'admin') return res.sendStatus(403);
  const { search = '', page = 1 } = req.query;
  const limit = 10;
  const offset = (page - 1) * limit;
  const [rows] = await db.query(
    'SELECT id, name, email, role, auth_type, created_at FROM users WHERE name LIKE ? OR email LIKE ? LIMIT ? OFFSET ?',
    [`%${search}%`, `%${search}%`, limit, offset]
  );
  res.json(rows);
});

router.get('/user/:id', async (req, res) => {
  if (req.user.role !== 'admin') return res.sendStatus(403);
  const [rows] = await db.query('SELECT * FROM users WHERE id = ?', [req.params.id]);
  res.json(rows[0]);
});

module.exports = router;
