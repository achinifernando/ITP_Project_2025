// routes/InventoryRoutes/supplierRequests.js
import express from "express";
import Joi from "joi";
import Supplier from "../../models/InventoryModels/Supplier.js";
import SupplierRequest from "../../models/InventoryModels/SupplierRequest.js";
import { idParam, pagination } from "../../validators/common.js";
import { sendEmail } from "../../utils/mailer.js";
import { protectUser, inventoryManager } from "../../middleware/authMiddleware.js";

const router = express.Router();

// Item schema
const itemSchema = Joi.object({
  stock: Joi.string().hex().length(24).optional(),
  name: Joi.string().required(),
  category: Joi.string().allow("").optional(),
  quantity: Joi.number().required(),
  unit: Joi.string().allow("")
}).unknown(true);

const requestBody = Joi.object({
  supplier: Joi.string().hex().length(24).required(),
  items: Joi.array().items(itemSchema).min(1).required(),
  notes: Joi.string().allow(""),
  status: Joi.string().valid("draft", "sent", "confirmed", "received", "cancelled", "closed").optional(),
  sendEmail: Joi.boolean().default(false)
});

// GET all supplier requests
router.get("/", protectUser, async (req, res) => {
  const { value: q } = pagination.validate(req.query);
  const docs = await SupplierRequest.find()
    .populate("supplier", "name email company status")
    .skip((q.page - 1) * q.limit)
    .limit(q.limit)
    .sort({ updatedAt: -1 });
  res.json(docs);
});

// POST create new supplier request
router.post("/", protectUser, async (req, res) => {
  const { value, error } = requestBody.validate(req.body);
  if (error) throw Object.assign(new Error(error.message), { status: 400 });

  const supplier = await Supplier.findById(value.supplier);
  if (!supplier) throw Object.assign(new Error("Supplier not found"), { status: 404 });

  const doc = await SupplierRequest.create({
    supplier: supplier._id,
    items: value.items,
    notes: value.notes,
    status: value.status || (value.sendEmail ? "sent" : "draft")
  });

  if (value.sendEmail && supplier.email) {
    try {
      const itemsHtml = value.items
        .map((i) => `<li>${i.name} – ${i.quantity}${i.unit ? " " + i.unit : ""}</li>`)
        .join("");
      await sendEmail({
        to: supplier.email,
        subject: `Request for Quotation – ${supplier.company || supplier.name}`,
        html: `<p>Dear ${supplier.name},</p>
               <p>Please provide a quotation for the following items:</p>
               <ul>${itemsHtml}</ul>
               ${value.notes ? `<p>Notes: ${value.notes}</p>` : ""}
               <p>Regards,<br/>Inventory Manager</p>`
      });
      doc.emailSentAt = new Date();
      await doc.save();
    } catch (err) {
      console.error("Email send failed:", err?.message || err);
    }
  }

  res.status(201).json(doc);
});

// GET single supplier request by ID
router.get("/:id", protectUser, async (req, res) => {
  const { error } = idParam.validate(req.params);
  if (error) throw Object.assign(new Error(error.message), { status: 400 });

  const doc = await SupplierRequest.findById(req.params.id)
    .populate("supplier", "name email company");
  if (!doc) throw Object.assign(new Error("Request not found"), { status: 404 });

  res.json(doc);
});

// PATCH update status
router.patch("/:id/status", protectUser, async (req, res) => {
  const { error } = idParam.validate(req.params);
  if (error) throw Object.assign(new Error(error.message), { status: 400 });

  const body = Joi.object({
    status: Joi.string().valid("draft", "sent", "confirmed", "received", "cancelled", "closed").required(),
    sendEmail: Joi.boolean().optional()
  }).validate(req.body);

  if (body.error) throw Object.assign(new Error(body.error.message), { status: 400 });

  // Check if request exists and is not already confirmed
  const existingDoc = await SupplierRequest.findById(req.params.id);
  if (!existingDoc) throw Object.assign(new Error("Request not found"), { status: 404 });
  
  // Prevent status changes once confirmed
  if (existingDoc.status === 'confirmed' && body.value.status !== 'confirmed') {
    throw Object.assign(new Error("Cannot change status once confirmed"), { status: 400 });
  }

  const doc = await SupplierRequest.findByIdAndUpdate(
    req.params.id,
    { status: body.value.status, updatedAt: Date.now() },
    { new: true }
  );

  res.json(doc);
});

// PUT update full supplier request
router.put("/:id", protectUser, async (req, res) => {
  const { error } = idParam.validate(req.params);
  if (error) throw Object.assign(new Error(error.message), { status: 400 });

  const updateSchema = requestBody.keys({ supplier: Joi.string().hex().length(24).optional() });
  const { value, error: bodyError } = updateSchema.validate(req.body);
  if (bodyError) throw Object.assign(new Error(bodyError.message), { status: 400 });

  const doc = await SupplierRequest.findByIdAndUpdate(req.params.id, value, { new: true });
  if (!doc) throw Object.assign(new Error("Request not found"), { status: 404 });

  res.json(doc);
});

// DELETE supplier request
router.delete("/:id", protectUser, async (req, res) => {
  const { error } = idParam.validate(req.params);
  if (error) throw Object.assign(new Error(error.message), { status: 400 });

  const del = await SupplierRequest.findByIdAndDelete(req.params.id);
  if (!del) throw Object.assign(new Error("Request not found"), { status: 404 });

  res.json({ ok: true });
});

export default router;
