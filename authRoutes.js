
const express = require('express');
const jwt = require('jsonwebtoken');
const User = require('../models/User');

const router = express.Router();

function generateToken(user) {
  if (!process.env.JWT_SECRET) {
    throw new Error('JWT_SECRET is missing from .env');
  }

  return jwt.sign(
    {
      id: user._id.toString(),
      email: user.email,
    },
    process.env.JWT_SECRET,
    { expiresIn: '7d' }
  );
}

// REGISTER
router.post('/register', async (req, res) => {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Name, email and password are required',
      });
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return res.status(400).json({
        success: false,
        message: 'Enter a valid email address',
      });
    }

    if (password.length < 6) {
      return res.status(400).json({
        success: false,
        message: 'Password must contain at least 6 characters',
      });
    }

    const user = await User.create(req.app.locals.db, {
      name,
      email,
      password,
    });

    const token = generateToken({
      _id: user.id,
      email: user.email,
    });

    return res.status(201).json({
      success: true,
      message: 'Registration successful',
      data: { user, token },
    });
  } catch (error) {
    if (error.message === 'Email already registered') {
      return res.status(409).json({
        success: false,
        message: error.message,
      });
    }

    console.error('Registration error:', error.message);

    return res.status(500).json({
      success: false,
      message: 'Registration failed',
    });
  }
});

// LOGIN
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Email and password are required',
      });
    }

    const user = await User.findByEmail(
      req.app.locals.db,
      email
    );

    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password',
      });
    }

    const validPassword = await User.verifyPassword(
      password,
      user.password
    );

    if (!validPassword) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password',
      });
    }

    const token = generateToken(user);

    return res.json({
      success: true,
      message: 'Login successful',
      data: {
        user: {
          id: user._id.toString(),
          name: user.name,
          email: user.email,
        },
        token,
      },
    });
  } catch (error) {
    console.error('Login error:', error.message);

    return res.status(500).json({
      success: false,
      message: 'Login failed',
    });
  }
});

module.exports = router;
