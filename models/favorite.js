'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Favorite extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
    }
  }
  Favorite.init({
    user_id: DataTypes.INTEGER,
    article_id: DataTypes.STRING,
    title: DataTypes.STRING,
    description: DataTypes.TEXT,
    content: DataTypes.TEXT,
    url: DataTypes.STRING,
    image_url: DataTypes.STRING,
    published_at: DataTypes.DATE,
    lang: DataTypes.STRING,
    source_id: DataTypes.STRING,
    source_name: DataTypes.STRING,
    source_url: DataTypes.STRING,
    source_country: DataTypes.STRING
  }, {
    sequelize,
    modelName: 'Favorite',
  });
  return Favorite;
};