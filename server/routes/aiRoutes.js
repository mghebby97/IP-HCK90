const express = require("express");
const router = express.Router();
const AIController = require("../controllers/AIController");
const authentication = require("../middlewares/authentication");

// All routes require authentication
router.use(authentication);

router.post("/analyze", AIController.analyzeNews);

module.exports = router;
