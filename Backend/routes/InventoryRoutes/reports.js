// routes/InventoryRoutes/reports.js
import express from "express";
import Stock from "../../models/InventoryModels/Stock.js";
import SupplierRequest from "../../models/InventoryModels/SupplierRequest.js";
import { protectUser, inventoryManager } from "../../middleware/authMiddleware.js";

const router = express.Router();

/**
 * GET /api/reports/stock-summary
 * - totals per unit
 * - low stock count
 * - items with expiry
 */
router.get("/stock-summary", protectUser, async (_req, res) => {
  const all = await Stock.find();
  const byUnit = {};
  let lowStock = 0;
  let withExpiry = 0;

  for (const s of all) {
    if (s.quantity <= s.threshold) lowStock++;
    if (s.expiryDate) withExpiry++;
    if (!byUnit[s.unit || "unitless"]) byUnit[s.unit || "unitless"] = 0;
    byUnit[s.unit || "unitless"] += s.quantity;
  }

  res.json({
    totalItems: all.length,
    totalsByUnit: byUnit,
    lowStock,
    withExpiry
  });
});

/**
 * GET /api/reports/supplier-history/:supplierId
 * Basic request history for a supplier
 */
router.get("/supplier-history/:supplierId", protectUser, async (req, res) => {
  const { supplierId } = req.params;
  const history = await SupplierRequest.find({ supplier: supplierId }).sort({
    createdAt: -1
  });
  res.json(history);
});

export default router;
