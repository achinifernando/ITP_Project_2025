const express = require("express");
const router = express.Router();
const Quotation = require("../models/quotationModel");
const QuotationRequest = require("../models/quotationRequestModel");
const nodemailer = require("nodemailer");
const upload = require('../middleware/fileUploadMiddleware');
const { protectClient } = require("../middleware/authMiddleware");
const Payment = require("../models/paymentsModel");

router.post("/generate-quotation/:requestID", async (req, res) => {
  try {
    const { requestID } = req.params;
    const quotationData = req.body;

    // Fetch the request and client
    const request = await QuotationRequest.findById(requestID).populate("clientID");
    if (!request) {
      return res.status(404).json({ message: "Quotation request not found" });
    }

    const client = request.clientID;
const { items, totalPrice, remarks, clientID, clientEmail } = req.body; 
    //vaild time duration
    const validUntilDate = new Date();
validUntilDate.setDate(validUntilDate.getDate() + 30); // expires in 30 days



    // Save quotation in DB
    const newQuotation = new Quotation({
      requestId: request._id,
      clientID: client._id,
      companyName: req.body.companyName,
      companyAddress: req.body.companyAddress,
      phoneNumber: req.body.phoneNumber,
      lorryCategory: req.body.lorryCategory,
      lorryType: req.body.lorryType,
      lorryModel: req.body.lorryModel,
      items,          
      totalPrice,     
      remarks,
      validUntil: validUntilDate, 
      status: "Quote_Sent",          
    });
    await newQuotation.save();

    // Nodemailer transporter (using Gmail App Password)
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.EMAIL_USER, // your Gmail address
        pass: process.env.EMAIL_PASS, // Gmail App Password (16 chars)
      },
    });

    // Send email with PDF if available
    if (quotationData.pdfBase64) {
      const pdfBuffer = Buffer.from(quotationData.pdfBase64, "base64");

      await transporter.sendMail({
        from: `"Nimal Engineering Works and Lorry Body Builders" <${process.env.EMAIL_USER}>`,
        to: client.email,
        subject: "Price Quotation",
        text: "Please find attached your requested quotation.",
        attachments: [{ filename: "Quotation.pdf", content: pdfBuffer }],
      });
    }

    res.json({
      message: "Quotation generated and email sent successfully!",
      client,
    });
  } catch (err) {
    console.error("Email Send Error:", err);
    res.status(500).json({
      message: "Error generating quotation",
      error: err.message,
    });
  }
});

// Get quotations for a client
router.get("/my_quotations", protectClient, async (req, res) => {
  try {
    const clientId  = req.user._id;
    const { status } = req.query;
    
    const query = { clientID:clientId };
    if (status) query.status = status;

    const quotations = await Quotation.find(query)
      .populate("requestId", "status lorryCategory lorryType lorryModel")
      .populate("lorryCategory", "category")
      .populate("lorryType", "typeName")
      .sort({ createdAt: -1 });

    res.json(quotations);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Accept quotation (client)
router.put('/:quotationId/accept', protectClient, async (req, res) => {
  try {
    const { quotationId } = req.params;
    const clientId = req.user._id;

    const quotation = await Quotation.findOne({ _id: quotationId, clientID:clientId });
    if (!quotation) {
      return res.status(404).json({ message: 'Quotation not found' });
    }

    if (quotation.status !== 'Quote_Sent') {
      return res.status(400).json({ message: 'Quotation is not in a state that can be accepted' });
    }

    // Check if quotation is still valid
    if (quotation.validUntil && new Date() > quotation.validUntil) {
      return res.status(400).json({ message: 'Quotation has expired' });
    }

    // Update quotation status
    quotation.status = 'Accepted';
    quotation.acceptedAt = new Date();
    await quotation.save();

    // Update request status
    await QuotationRequest.findByIdAndUpdate(quotation.requestId, {
      status: 'Accepted'
    });

    res.json({ message: 'Quotation accepted successfully', quotation });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Reject quotation (client)
router.put('/:quotationId/reject', protectClient, async (req, res) => {
  try {
    const { quotationId } = req.params;
    const clientId = req.user._id;

    const quotation = await Quotation.findOne({ _id: quotationId, clientID: clientId });
    if (!quotation) {
      return res.status(404).json({ message: 'Quotation not found' });
    }

    if (quotation.status !== 'Quote_Sent') {
      return res.status(400).json({ message: 'Quotation is not in a state that can be rejected' });
    }

    quotation.status = 'Rejected';
    quotation.rejectedAt = new Date();
    await quotation.save();

    // Update request status as well
    await QuotationRequest.findByIdAndUpdate(quotation.requestId, {
      status: 'Rejected'
    });

    res.json({ message: 'Quotation rejected successfully', quotation });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});


// Get accepted quotations for a client
router.get("/accepted", protectClient, async (req, res) => {
  try {
    const clientId = req.user._id;

    const acceptedQuotations = await Quotation.find({
      clientID: clientId,         
      status: "Accepted", 
    });

    res.json(acceptedQuotations);
  } catch (error) {
    console.error("Error fetching accepted quotations:", error);
    res.status(500).json({ message: "Failed to fetch accepted quotations" });
  }
});



// Upload payment receipt for accepted quotation
router.post('/:quotationId/payment', protectClient, upload.single('receipt'), async (req, res) => {
  try {
    const { quotationId } = req.params;
    const clientId = req.user._id;
    const { paymentMethod } = req.body;

    // Check if quotation exists and is accepted
    const quotation = await Quotation.findOne({ 
      _id: quotationId, 
      clientID: clientId,
      status: 'Accepted' 
    });

    if (!quotation) {
      return res.status(404).json({ message: 'Accepted quotation not found' });
    }

    if (!req.file) {
      return res.status(400).json({ message: 'Receipt file is required' });
    }

    // Check if payment already exists for this quotation
    const existingPayment = await Payment.findOne({ quotationId });
    if (existingPayment) {
      return res.status(400).json({ message: 'Payment already exists for this quotation' });
    }

    // Create payment record
    const payment = new Payment({
      quotationId,
      requestId: quotation.requestId,
      clientId,
      amount: quotation.totalPrice,
      receiptFile: {
        filename: req.file.filename,
        originalName: req.file.originalname,
        filePath: req.file.path,
        fileSize: req.file.size,
        mimeType: req.file.mimetype
      },
      paymentMethod,
      
    });

    await payment.save();
    
    // Update quotation payment status
    quotation.paymentStatus = 'paid';
    await quotation.save();

    res.status(201).json({ 
      message: 'Payment receipt uploaded successfully', 
      payment 
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get payment history for a client
router.get('/payments/my_payments', protectClient, async (req, res) => {
  try {
    const clientId = req.user._id;
    const payments = await Payment.find({ clientId })
      .populate('quotationId', 'totalPrice')
      .populate('requestId', 'lorryModel')
      .sort({ createdAt: -1 });

    res.json(payments);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});


// Get single quotation by ID
router.get("/:id", protectClient, async (req, res) => {
  try {
    const quotation = await Quotation.findById(req.params.id)
      .populate("lorryCategory", "category")
      .populate("lorryType", "typeName")
      .populate("items._id", "item "); // if linked to stock model

    if (!quotation) {
      return res.status(404).json({ message: "Quotation not found" });
    }

    // Make sure quotation belongs to logged-in client
    if (quotation.clientID.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "Not authorized" });
    }

    res.json(quotation);
  } catch (error) {
    console.error("Error fetching quotation:", error);
    res.status(500).json({ message: "Server error" });
  }
});
module.exports = router;
