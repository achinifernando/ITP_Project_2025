const express = require('express');
const QRCode = require('qrcode');
const jwt = require('jsonwebtoken');
const router = express.Router();
const User = require('../models/User');
const Joi = require('joi');

// Validate JWT secret exists
if (!process.env.JWT_SECRET) {
  throw new Error('JWT_SECRET is not defined in environment variables');
}

// GET /qr/generate?userId=...
router.get('/generate', async (req, res, next) => {
  try {
    const { userId } = req.query;
    
    // Validate input
    if (!userId) {
      return res.status(400).json({ error: 'Missing userId query parameter' });
    }

    const { error } = Joi.string().hex().length(24).validate(userId);
    if (error) {
      return res.status(400).json({ error: 'Invalid userId format' });
    }

    // Find user
    const user = await User.findById(userId).select('_id name email');
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Create token
    const token = jwt.sign(
      { 
        userId: user._id.toString(),
        purpose: 'attendance',
        generatedAt: Date.now()
      },
      process.env.JWT_SECRET,
      { expiresIn: '5m' }
    );

    // Generate QR code
    let qrData;
    try {
      qrData = await QRCode.toDataURL(token, {
        errorCorrectionLevel: 'H', // High error correction for printed codes
        margin: 2,
        scale: 8
      });
    } catch (qrErr) {
      console.error('QR Generation failed:', qrErr);
      return res.status(500).json({ error: 'Failed to generate QR code' });
    }

    // Set security headers
    res.setHeader('Cache-Control', 'no-store');
    
    // Log successful generation
    console.log(`QR generated for user ${userId}`);

    res.json({ 
      qrData, 
      expiresIn: 300,
      userId: user._id,
      userName: user.name
    });

  } catch (err) {
    console.error('QR generation error:', err);
    next(err);
  }
});

module.exports = router;