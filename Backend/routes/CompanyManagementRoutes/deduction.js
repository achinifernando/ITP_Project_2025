const router = require("express").Router();
const Deduction = require("../../models/CompanyManagerModels/deduction");
const { protectUser, companyManager } = require("../../middleware/authMiddleware");


// ---------- Add a deduction ----------
router.post("/add",protectUser, async (req, res) => {
  try {
    const { employeeId, month, type, amount } = req.body;

    const newDeduction = new Deduction({
      employeeId,
      month,
      type,
      amount,
    });

    await newDeduction.save();
    res.json({ message: "Deduction added successfully", newDeduction });
  } catch (err) {
    console.error("Error adding deduction:", err);
    res.status(500).json({ error: "Failed to add deduction" });
  }
});



// ---------- Get all deductions for an employee & month ----------
router.get("/:employeeId/:month", async (req, res) => {
  try {
    const { employeeId, month } = req.params;
    const deductions = await Deduction.find({ employeeId, month });
    res.json(deductions);
  } catch (err) {
    console.error("Error fetching deductions:", err);
    res.status(500).json({ error: "Failed to fetch deductions" });
  }
});

// ---------- Update deduction ----------
router.put("/update/:id",protectUser, async (req, res) => {
  try {
    const { type, amount } = req.body;
    const updated = await Deduction.findByIdAndUpdate(
      req.params.id,
      { type, amount },
      { new: true }
    );
    res.json({ message: "Deduction updated", updated });
  } catch (err) {
    console.error("Error updating deduction:", err);
    res.status(500).json({ error: "Failed to update deduction" });
  }
});

// ---------- Delete deduction ----------
router.delete("/delete/:id",protectUser, async (req, res) => {
  try {
    await Deduction.findByIdAndDelete(req.params.id);
    res.json({ message: "Deduction deleted successfully" });
  } catch (err) {
    console.error("Error deleting deduction:", err);
    res.status(500).json({ error: "Failed to delete deduction" });
  }
});

module.exports = router;
