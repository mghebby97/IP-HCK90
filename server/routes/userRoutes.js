const express = require("express");
const router = express.Router();
const UserController = require("../controllers/userController");
const authentication = require("../middlewares/authentication");
const upload = require("../middlewares/upload");

// Public routes
router.post("/register", UserController.register);
router.post("/login", UserController.login);
router.post("/google-login", UserController.googleLogin);

// Protected routes
router.use(authentication);
router.get("/profile", UserController.getUserProfile);
router.patch(
  "/profile/photo",
  upload.single("photo"),
  UserController.updateProfilePhoto
);

module.exports = router;