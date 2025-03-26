// controllers/authController.js
const pool = require('../db');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

exports.register = async (req, res) => {
  const { username, email, password } = req.body;
  try {
    // Check if username or email is already used
    const checkQuery = 'SELECT * FROM users WHERE username = $1 OR email = $2';
    const checkResult = await pool.query(checkQuery, [username, email]);
    if (checkResult.rows.length > 0) {
      return res.status(400).json({ message: 'Username or Email already in use.' });
    }
    // Hash the password
    const hashedPassword = await bcrypt.hash(password, 10);
    // Insert the new user into the database
    const insertQuery = `
      INSERT INTO users (username, email, password)
      VALUES ($1, $2, $3)
      RETURNING id, username, email, is_seller, date_created
    `;
    const newUser = await pool.query(insertQuery, [username, email, hashedPassword]);
    return res.status(201).json({ message: 'User registered successfully.', user: newUser.rows[0] });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: 'Server error during registration.' });
  }
};

exports.login = async (req, res) => {
  const { username, password } = req.body;
  try {
    // Retrieve the user record from the database
    const query = 'SELECT * FROM users WHERE username = $1';
    const result = await pool.query(query, [username]);
    if (result.rows.length === 0) {
      return res.status(400).json({ message: 'Invalid credentials.' });
    }
    const user = result.rows[0];
    // Compare the provided password with the stored hash
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: 'Invalid credentials.' });
    }
    // Generate a JWT token
    const token = jwt.sign(
      { userId: user.id, username: user.username },
      process.env.JWT_SECRET,
      { expiresIn: '1h' }
    );
    return res.status(200).json({ message: 'Logged in successfully.', token });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: 'Server error during login.' });
  }
};
