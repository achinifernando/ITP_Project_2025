// routes/InventoryRoutes/stockRouter.js
import express from "express";
import Joi from "joi";
import Stock from "../../models/InventoryModels/Stock.js";
import { protectUser,authorize } from "../../middleware/authMiddleware.js";

// Create router
const router = express.Router();

// Validation schemas
const stockBody = Joi.object({
  itemName: Joi.string().required(),
  category: Joi.alternatives().try(
    Joi.string().trim().max(100).allow("", null),
    Joi.string().hex().length(24)
  ).optional(),
  quantity: Joi.number().required(),
  unit: Joi.string().allow("", null),
  threshold: Joi.number().min(0).default(0),
  supplierId: Joi.alternatives().try(
    Joi.string().hex().length(24),
    Joi.valid(null, "")
  ).optional(),
  expiryDate: Joi.date().optional().allow(null, "")
});

const idParam = Joi.object({
  id: Joi.string().hex().length(24).required()
});

const pagination = Joi.object({
  page: Joi.number().min(1).default(1),
  limit: Joi.number().min(1).max(100).default(10)
});

// Routes
router.get("/", protectUser, authorize("inventory_manager","company_manager"), async (req, res) => {
  const { value: q } = pagination.validate(req.query);
  const docs = await Stock.find()
    .populate("supplierId", "name email company status")
    .skip((q.page - 1) * q.limit)
    .limit(q.limit)
    .sort({ lastUpdated: -1 });
  res.json(docs);
});

router.post("/", protectUser, async (req, res) => {
  for (const k of Object.keys(req.body)) {
    if (req.body[k] === "" || req.body[k] === null) delete req.body[k];
  }

  const { value, error } = stockBody.validate(req.body);
  if (error) throw Object.assign(new Error(error.message), { status: 400 });

  const created = await Stock.create(value);
  res.status(201).json(created);
});

router.get("/:id", protectUser, async (req, res) => {
  const { error } = idParam.validate(req.params);
  if (error) throw Object.assign(new Error(error.message), { status: 400 });

  const doc = await Stock.findById(req.params.id).populate(
    "supplierId",
    "name email"
  );
  if (!doc) throw Object.assign(new Error("Stock not found"), { status: 404 });
  res.json(doc);
});

router.patch("/:id/quantity", protectUser, async (req, res) => {
  const { error } = idParam.validate(req.params);
  if (error) throw Object.assign(new Error(error.message), { status: 400 });

  const body = Joi.object({
    delta: Joi.number().required()
  }).validate(req.body);
  if (body.error) throw Object.assign(new Error(body.error.message), { status: 400 });

  const doc = await Stock.findById(req.params.id);
  if (!doc) throw Object.assign(new Error("Stock not found"), { status: 404 });

  doc.quantity = Math.max(0, doc.quantity + body.value.delta);
  await doc.save();
  res.json(doc);
});

router.put("/:id", protectUser, async (req, res) => {
  const { error: idErr } = idParam.validate(req.params);
  if (idErr) throw Object.assign(new Error(idErr.message), { status: 400 });

  for (const k of Object.keys(req.body)) {
    if (req.body[k] === "" || req.body[k] === null) delete req.body[k];
  }

  const { value, error } = stockBody.validate(req.body);
  if (error) throw Object.assign(new Error(error.message), { status: 400 });

  const updated = await Stock.findByIdAndUpdate(
    req.params.id,
    { ...value, lastUpdated: Date.now() },
    { new: true, runValidators: true }
  );
  if (!updated) throw Object.assign(new Error("Stock not found"), { status: 404 });

  res.json(updated);
});

router.delete("/:id", protectUser, async (req, res) => {
  const { error } = idParam.validate(req.params);
  if (error) throw Object.assign(new Error(error.message), { status: 400 });

  const del = await Stock.findByIdAndDelete(req.params.id);
  if (!del) throw Object.assign(new Error("Stock not found"), { status: 404 });

  res.json({ ok: true });
});

export default router;
