const express = require("express");
const router = express.Router();
const SalaryInfo = require("../../models/CompanyManagerModels/salaryInfo");
const { protectUser, companyManager } = require("../../middleware/authMiddleware");

// ✅ Add salary info for an employee
router.post("/add",protectUser, async (req, res) => {
  try {
    const { employeeId, basicSalary, hourlyRate, overtimeRate } = req.body;
    
    const salaryExists = await SalaryInfo.findOne({ employeeId });
    if (salaryExists) {
      return res.status(400).json({ message: "Salary info already exists for this employee" });
    }

    const salaryInfo = new SalaryInfo({ employeeId, basicSalary, hourlyRate, overtimeRate });
    await salaryInfo.save();
    res.json({ message: "Salary info added", salaryInfo });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ✅ Update salary info
router.put("/update/:id",protectUser, async (req, res) => {
  try {
    const { basicSalary, hourlyRate, overtimeRate } = req.body;

    const updatedSalary = await SalaryInfo.findByIdAndUpdate(
      req.params.id,
      { basicSalary, hourlyRate, overtimeRate },
      { new: true }
    );

    if (!updatedSalary) return res.status(404).json({ message: "Salary info not found" });

    res.json({ message: "Salary info updated", updatedSalary });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ✅ Get salary info by employeeId
router.get("/:employeeId",protectUser, async (req, res) => {
  try {
    const salaryInfo = await SalaryInfo.findOne({ employeeId: req.params.employeeId });
    if (!salaryInfo) return res.status(404).json({ message: "Salary info not found" });
    res.json(salaryInfo);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
