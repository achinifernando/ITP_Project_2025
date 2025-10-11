const router = require("express").Router();
const Allowance = require("../../models/CompanyManagerModels/allowance");
const { protectUser, companyManager } = require("../../middleware/authMiddleware");

// ✅ Add allowance
router.post("/add",protectUser, async (req, res) => {
  try {
    const { employeeId, month, type, amount } = req.body;
    const newAllowance = new Allowance({ employeeId, month, type, amount });
    await newAllowance.save();
    res.json({ message: "Allowance added", newAllowance });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ✅ Get allowances by employee & month
router.get("/:employeeId/:month",protectUser, async (req, res) => {
  try {
    const { employeeId, month } = req.params;
    const allowances = await Allowance.find({ employeeId, month });
    res.json(allowances);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ✅ Update allowance by ID
router.put("/update/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const { type, amount, month } = req.body;

    const updatedAllowance = await Allowance.findByIdAndUpdate(
      id,
      { type, amount, month },
      { new: true } // return updated document
    );

    if (!updatedAllowance) {
      return res.status(404).json({ error: "Allowance not found" });
    }

    res.json({ message: "Allowance updated", updatedAllowance });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ✅ Delete allowance by ID
router.delete("/delete/:id",protectUser, async (req, res) => {
  try {
    const { id } = req.params;
    const deletedAllowance = await Allowance.findByIdAndDelete(id);

    if (!deletedAllowance) {
      return res.status(404).json({ error: "Allowance not found" });
    }

    res.json({ message: "Allowance deleted", deletedAllowance });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
