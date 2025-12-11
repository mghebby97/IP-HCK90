const { User } = require("../models");
const { comparePassword } = require("../helpers/bcrypt");
const { signToken } = require("../helpers/jwt");
const { OAuth2Client } = require("google-auth-library");
const cloudinary = require("cloudinary").v2;
const { log } = require("../helpers/logger");

// Force reconfigure Cloudinary with latest env vars
const configureCloudinary = () => {
  console.log("🔧 Configuring Cloudinary:");
  console.log("   Cloud Name:", process.env.CLOUDINARY_CLOUD_NAME);
  console.log("   API Key:", process.env.CLOUDINARY_API_KEY ? "✅" : "❌");
  
  cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
  });
  
  console.log("✅ Cloudinary configured with:", cloudinary.config());
};

// Configure on first import
configureCloudinary();

const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

class UserController {
  static async register(req, res) {
    try {
      const { full_name, email, password } = req.body;

      if (!full_name || !email || !password) {
        return res
          .status(400)
          .json({ message: "Full Name, Email & password wajib diisi" });
      }

      const existing = await User.findOne({ where: { email } });
      if (existing) {
        return res.status(400).json({ message: "Email sudah digunakan" });
      }

      const user = await User.create({
        full_name,
        email,
        password,
        profile_photo: null, // OPSIONAL
      });

      return res.status(201).json({
        message: "Registration successful",
        user: {
          id: user.id,
          full_name: user.full_name,
          email: user.email,
          profile_photo: user.profile_photo,
        },
      });
    } catch (err) {
      console.error("❌ Register error:", err);

      if (err.name === "SequelizeValidationError") {
        return res.status(400).json({ message: err.errors[0].message });
      }

      return res.status(500).json({ message: err.message });
    }
  }

  static async login(req, res) {
    try {
      console.log("🔐 POST /login called");
      console.log("📦 Request body:", {
        email: req.body.email,
        password: "***",
      });

      const { email, password } = req.body;

      if (!email || !password) {
        console.log("❌ Missing email or password");
        return res
          .status(400)
          .json({ message: "Email & password wajib diisi" });
      }

      const user = await User.findOne({ where: { email } });

      if (!user) {
        console.log("❌ User not found:", email);
        return res.status(400).json({ message: "Email atau password salah" });
      }

      const isPasswordValid = await comparePassword(password, user.password);
      if (!isPasswordValid) {
        console.log("❌ Invalid password for:", email);
        return res.status(400).json({ message: "Email atau password salah" });
      }

      const access_token = signToken({ id: user.id });
      console.log("✅ Login successful for:", email);

      return res.status(200).json({ access_token });
    } catch (err) {
      console.error("❌ Login error:", err);
      return res.status(500).json({ message: "Internal Server Error" });
    }
  }

  static async googleLogin(req, res) {
    try {
      const { token } = req.body;

      if (!token) {
        return res.status(400).json({ message: "Google token is required" });
      }

      const ticket = await client.verifyIdToken({
        idToken: token,
        audience: process.env.GOOGLE_CLIENT_ID,
      });

      const payload = ticket.getPayload();
      const { email, name, picture } = payload;

      let user = await User.findOne({ where: { email } });

      if (!user) {
        // Create new user with random password for Google OAuth users
        const randomPassword =
          Math.random().toString(36).slice(-8) +
          Math.random().toString(36).slice(-8);

        user = await User.create({
          full_name: name,
          email: email,
          password: randomPassword,
          profile_photo: picture || null,
        });
      }

      const access_token = signToken({ id: user.id });

      return res.status(200).json({
        access_token,
        user: {
          id: user.id,
          full_name: user.full_name,
          email: user.email,
          profile_photo: user.profile_photo,
        },
      });
    } catch (err) {
      console.error("❌ Google login error:", err);
      return res.status(500).json({
        message: "Google authentication failed",
        error: err.message,
      });
    }
  }

  static async updateProfilePhoto(req, res) {
    try {
      console.log("📸 Update profile photo request received");
      const userId = req.user.id;
      console.log(`User ID: ${userId}`);

      if (!req.file) {
        console.log("❌ No file uploaded");
        return res.status(400).json({ message: "No file uploaded" });
      }

      console.log(`📁 File: ${req.file.originalname}, Size: ${req.file.size}, Type: ${req.file.mimetype}`);

      let photoUrl;

      // Try Cloudinary upload with 10 second timeout
      try {
        console.log("📤 Attempting Cloudinary upload...");
        const result = await Promise.race([
          new Promise((resolve, reject) => {
            const uploadStream = cloudinary.uploader.upload_stream(
              {
                folder: "news-app/profile-photos",
                resource_type: "auto",
              },
              (error, result) => {
                if (error) {
                  reject(error);
                } else {
                  resolve(result);
                }
              }
            );
            uploadStream.end(req.file.buffer);
          }),
          new Promise((_, reject) =>
            setTimeout(() => reject(new Error("Cloudinary timeout")), 10000)
          ),
        ]);

        photoUrl = result.secure_url;
        console.log(`✅ Cloudinary success: ${photoUrl}`);
      } catch (cloudinaryError) {
        console.log(`⚠️ Cloudinary failed: ${cloudinaryError.message}, using base64 fallback`);
        
        // Fallback: Convert to base64 data URL
        const base64Image = req.file.buffer.toString("base64");
        photoUrl = `data:${req.file.mimetype};base64,${base64Image}`;
        console.log(`✅ Using base64 fallback (${base64Image.length} chars)`);
      }

      // Update user profile photo
      const user = await User.findByPk(userId);

      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }

      user.profile_photo = photoUrl;
      await user.save();

      console.log(`✅ Profile photo saved successfully`);
      return res.status(200).json({
        message: "Profile photo updated successfully",
        profile_photo: user.profile_photo,
      });
    } catch (err) {
      console.error(`❌ Update profile photo error: ${err.message}`);
      return res.status(500).json({
        message: "Failed to update profile photo",
        error: err.message,
      });
    }
  }

  static async getUserProfile(req, res) {
    try {
      const userId = req.user.id;

      const user = await User.findByPk(userId, {
        attributes: ["id", "full_name", "email", "profile_photo", "createdAt"],
      });

      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }

      return res.status(200).json(user);
    } catch (err) {
      console.error("❌ Get user profile error:", err);
      return res.status(500).json({ message: "Internal Server Error" });
    }
  }
}

module.exports = UserController;
