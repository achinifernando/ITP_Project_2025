// routes/cardRoutes.js
const express = require('express');
const router = express.Router();
const crypto = require('crypto');
const QRCode = require('qrcode');
const EmployeeCard = require('../models/EmployeeCard');

// Generate QR code for employee card
router.post('/generate-card', async (req, res) => {
  try {
    const { employeeId, employeeName } = req.body;
    
    const cardId = `CARD-${crypto.randomBytes(8).toString('hex')}`;
    const qrData = JSON.stringify({ cardId, employeeId, name: employeeName.substring(0, 20) });
    const qrCode = await QRCode.toDataURL(qrData);
    
    await EmployeeCard.create({ employeeId, cardId, qrCode });
    
    res.json({ qrCode, cardId, employeeId, downloadLink: `/download-card/${cardId}` });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
