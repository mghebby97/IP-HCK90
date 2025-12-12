const express = require("express");
const router = express.Router();
const NewsController = require("../controllers/NewsController");
const authentication = require("../middlewares/authentication");

// Public routes
router.get("/news", NewsController.getNews);
router.get("/news/detail", NewsController.getNewsById);

module.exports = router;
