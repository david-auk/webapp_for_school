const express = require("express");
const jsonServer = require("json-server");
const multer = require("multer");
const path = require("path");
const fs = require("fs");

const app = express();
const router = jsonServer.router("db.json");
const db = router.db; // lowdb instance for direct access to db.json

app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));
app.use(express.static("public")); // Serve static files

// Configure multer for image uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadPath = path.join(__dirname, "public/images");
    if (!fs.existsSync(uploadPath)) {
      fs.mkdirSync(uploadPath, { recursive: true });
    }
    cb(null, uploadPath);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({ storage: storage });

// GET /api/musicItems endpoint with filtering, sorting, and pagination
app.get("/api/musicItems", (req, res) => {
  let items = db.get("musicItems").value();

  const filterMood = req.query.filterMood;
  if (filterMood && filterMood !== "all") {
    items = items.filter(item => item.mood.includes(filterMood));
  }

  const sortType = req.query.sortType;
  const sortOrder = req.query.sortOrder || "asc";
  if (sortType) {
    items.sort((a, b) => {
      let comparison = a[sortType] - b[sortType];
      return sortOrder === "desc" ? -comparison : comparison;
    });
  }

  const page = parseInt(req.query.page, 10) || 1;
  const itemsPerPage = parseInt(req.query.limit, 10) || 5;
  const startIndex = (page - 1) * itemsPerPage;
  const paginatedItems = items.slice(startIndex, startIndex + itemsPerPage);

  res.json({
    totalItems: items.length,
    totalPages: Math.ceil(items.length / itemsPerPage),
    currentPage: page,
    items: paginatedItems
  });
});

// POST /api/musicItems - Add new item with image upload
app.post("/api/musicItems", upload.single("image"), (req, res) => {
  const { name, releaseDate, rating, mood, alt } = req.body;

  if (!req.file) {
    return res.status(400).json({ error: "Image file is required" });
  }

  const newItem = {
    id: Date.now(),
    name,
    releaseDate: parseInt(releaseDate, 10),
    rating: parseFloat(rating),
    mood: mood.split(",").map(m => m.trim()),
    image: req.file.filename, // Save filename to db.json
    alt
  };

  db.get("musicItems").push(newItem).write();
  res.status(201).json(newItem);
});

const PORT = 5001;
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
