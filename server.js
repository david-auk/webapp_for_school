const express = require("express");
const jsonServer = require("json-server");
const app = express();
const router = jsonServer.router("db.json");
const db = router.db; // lowdb instance for direct access to db.json

app.use(express.json());

// GET /api/musicItems endpoint with filtering, sorting, and pagination
app.get("/api/musicItems", (req, res) => {
  // Get all items from db.json
  let items = db.get("musicItems").value();

  // Filtering by mood if provided and not "all"
  const filterMood = req.query.filterMood;
  if (filterMood && filterMood !== "all") {
    items = items.filter(item => item.mood.includes(filterMood));
  }

  // Sorting by type (releaseDate or rating) if provided
  const sortType = req.query.sortType;
  const sortOrder = req.query.sortOrder || "asc"; // default to ascending
  if (sortType) {
    items.sort((a, b) => {
      let comparison = 0;
      if (sortType === "releaseDate") {
        comparison = a.releaseDate - b.releaseDate;
      } else if (sortType === "rating") {
        comparison = a.rating - b.rating;
      }
      return sortOrder === "desc" ? -comparison : comparison;
    });
  }

  // Pagination
  const page = parseInt(req.query.page, 10) || 1;
  const itemsPerPage = parseInt(req.query.limit, 10) || 5;
  const startIndex = (page - 1) * itemsPerPage;
  const paginatedItems = items.slice(startIndex, startIndex + itemsPerPage);

  res.json({
    totalItems: items.length,
    totalPages: Math.ceil(items.length / itemsPerPage),
    currentPage: page,
    items: paginatedItems,
  });
});

// POST endpoint for adding new items
app.post("/api/musicItems", (req, res) => {
  const newItem = req.body;
  // Create a simple unique id (you could use other methods or libraries)
  newItem.id = Date.now();
  db.get("musicItems").push(newItem).write();
  res.status(201).json(newItem);
});

// Fallback to JSON Server router for any other routes
//app.use("/api", router);

app.use(express.static("public"));

const PORT = 5001;
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
