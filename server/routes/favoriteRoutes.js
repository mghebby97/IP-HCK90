const express = require("express");
const router = express.Router();
const FavoriteController = require("../controllers/FavoriteController");
const authentication = require("../middlewares/authentication");

// All routes require authentication
router.use(authentication);

router.get("/", FavoriteController.getFavorites);
router.post("/", FavoriteController.addFavorite);
router.delete("/:id", FavoriteController.deleteFavorite);

module.exports = router;
