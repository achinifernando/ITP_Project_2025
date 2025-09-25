const router = require("express").Router();
const multer = require("multer");
let Category = require("../../models/ClientPortalModels/lorryCategoriesModel");

// ---------- Multer setup for image uploads ----------
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/"); // make sure this folder exists
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + "-" + file.originalname);
  },
});

const upload = multer({ storage: storage });

// ---------- Add a new category ----------
router.post("/add", upload.single("image"), (req, res) => {
  const category = req.body.category;
  const description = req.body.description;
  const image = req.file ? req.file.filename : null; // store filename in DB

  const newCategory = new Category({
    category,
    description,
    image,
  });

  newCategory
    .save()
    .then(() => res.json("Category Added"))
    .catch((err) => {
      console.log(err);
      res.status(500).json("Error: " + err);
    });
});

// ---------- Get all categories ----------
router.get("/", (req, res) => {
  Category.find()
    .then((categories) => res.json(categories))
    .catch((err) => {
      console.log(err);
      res.status(500).json("Error: " + err);
    });
});

// ---------- Update a category ----------
router.put("/update/:id", upload.single("image"), async (req, res) => {
  let categoryId = req.params.id;
  const { category, description } = req.body;
  const image = req.file ? req.file.filename : undefined; // optional update

  const updateCategory = { category, description };
  if (image) updateCategory.image = image;

  try {
    const update = await Category.findByIdAndUpdate(categoryId, updateCategory, { new: true });
    res.status(200).send({ status: "Category updated", update });
  } catch (err) {
    console.log(err);
    res.status(500).send({ status: "Error with updating data" });
  }
});

// ---------- Delete a category ----------
router.delete("/delete/:id", async (req, res) => {
  let categoryId = req.params.id;
  try {
    await Category.findByIdAndDelete(categoryId);
    res.status(200).send({ status: "Category deleted" });
  } catch (err) {
    console.log(err);
    res.status(500).send({ status: "Error with delete category", error: err.message });
  }
});

// ---------- Get a category by ID ----------
router.get("/get/:id", async (req, res) => {
  let categoryId = req.params.id;
  try {
    const category = await Category.findById(categoryId);
    res.status(200).send({ status: "Category fetched", category });
  } catch (err) {
    console.log(err);
    res.status(500).send({ status: "Error with get category", error: err.message });
  }
});

module.exports = router;
