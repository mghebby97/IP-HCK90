require("dotenv").config();
const express = require("express");
const cors = require("cors");
const authentication = require("./middlewares/authentication");

// Import routes
const userRoutes = require("./routes/userRoutes");
const newsRoutes = require("./routes/newsRoutes");
const favoriteRoutes = require("./routes/favoriteRoutes");
const aiRoutes = require("./routes/aiRoutes");

const app = express();
const PORT = process.env.PORT || 3001;

if (process.env.NODE_ENV !== "production") {
  require("dotenv").config();
}
// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Public routes
app.use("/", newsRoutes);
app.use("/", userRoutes);

// Protected routes
app.use("/favorites", favoriteRoutes);
app.use("/ai", aiRoutes);

// Error handling middleware
app.use((err, req, res, next) => {
  console.error("❌ Server error:", err.message);
  console.error("Stack:", err.stack);
  
  if (err.message === "Only image files are allowed") {
    return res.status(400).json({ message: err.message });
  }
  
  if (err.code === "LIMIT_FILE_SIZE") {
    return res.status(400).json({ message: "File size too large. Max 5MB" });
  }
  
  res.status(500).json({ 
    message: "Internal server error",
    error: err.message
  });
});

module.exports = app;