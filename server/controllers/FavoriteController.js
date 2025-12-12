const { Favorite, User } = require("../models");

class FavoriteController {
  static async getFavorites(req, res) {
    try {
      const userId = req.user.id;

      const favorites = await Favorite.findAll({
        where: { user_id: userId },
        include: [
          {
            model: User,
            attributes: ["id", "full_name", "email"],
          },
        ],
        order: [["createdAt", "DESC"]],
      });

      return res.status(200).json(favorites);
    } catch (err) {
      console.error("❌ Get favorites error:", err);
      return res.status(500).json({ message: "Internal Server Error" });
    }
  }

  static async addFavorite(req, res) {
    try {
      const userId = req.user.id;
      const {
        article_id,
        title,
        description,
        content,
        url,
        image_url,
        published_at,
        lang,
        source_id,
        source_name,
        source_url,
        source_country,
      } = req.body;

      if (!article_id || !title) {
        return res
          .status(400)
          .json({ message: "Article ID and title are required" });
      }

      // Check if already favorited
      const existing = await Favorite.findOne({
        where: {
          user_id: userId,
          article_id: article_id,
        },
      });

      if (existing) {
        return res
          .status(400)
          .json({ message: "Article already in favorites" });
      }

      const favorite = await Favorite.create({
        user_id: userId,
        article_id,
        title,
        description,
        content,
        url,
        image_url,
        published_at,
        lang,
        source_id,
        source_name,
        source_url,
        source_country,
      });

      return res.status(201).json({
        message: "Article added to favorites",
        favorite,
      });
    } catch (err) {
      console.error("❌ Add favorite error:", err);

      if (err.name === "SequelizeValidationError") {
        return res.status(400).json({ message: err.errors[0].message });
      }

      return res.status(500).json({ message: "Internal Server Error" });
    }
  }

  static async deleteFavorite(req, res) {
    try {
      const userId = req.user.id;
      const { id } = req.params;

      const favorite = await Favorite.findOne({
        where: {
          id: id,
          user_id: userId,
        },
      });

      if (!favorite) {
        return res.status(404).json({ message: "Favorite not found" });
      }

      await favorite.destroy();

      return res.status(200).json({
        message: "Article removed from favorites",
      });
    } catch (err) {
      console.error("❌ Delete favorite error:", err);
      return res.status(500).json({ message: "Internal Server Error" });
    }
  }
}

module.exports = FavoriteController;
