const Delivery = require("../models/Delivery");

// GET all deliveries
const getAllDeliveries = async (req, res) => {
  try {
    const deliveries = await Delivery.find()
      .populate("driver")
      .populate("vehicle");
    res.json(deliveries);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// ADD new delivery
const addDelivery = async (req, res) => {
  try {
    const { customerName, address, contactPhone, deliveryDate, notes } = req.body;

    if (!customerName || !address || !contactPhone || !deliveryDate) {
      return res.status(400).json({ message: "Please fill all required fields" });
    }

    const delivery = new Delivery({
      customerName,
      address,
      contactPhone,
      deliveryDate: new Date(deliveryDate),
      notes: notes || '',
      status: "Pending",
    });

    await delivery.save();
    res.status(201).json(delivery);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

// GET delivery by ID
const getDeliveryById = async (req, res) => {
  try {
    const delivery = await Delivery.findById(req.params.id)
      .populate("driver")
      .populate("vehicle");

    if (!delivery) return res.status(404).json({ message: "Delivery not found" });
    res.json(delivery);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// UPDATE delivery
const updateDelivery = async (req, res) => {
  try {
    const delivery = await Delivery.findByIdAndUpdate(req.params.id, req.body, { new: true })
      .populate("driver")
      .populate("vehicle");

    if (!delivery) return res.status(404).json({ message: "Delivery not found" });
    res.json(delivery);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

// DELETE delivery
const deleteDelivery = async (req, res) => {
  try {
    const delivery = await Delivery.findByIdAndDelete(req.params.id);
    if (!delivery) return res.status(404).json({ message: "Delivery not found" });
    res.json({ message: "Delivery deleted" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

module.exports = {
  getAllDeliveries,
  addDelivery,
  getDeliveryById,
  updateDelivery,
  deleteDelivery,
};