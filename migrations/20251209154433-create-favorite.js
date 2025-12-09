'use strict';
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('Favorites', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      user_id: {
        type: Sequelize.INTEGER
      },
      article_id: {
        type: Sequelize.STRING
      },
      title: {
        type: Sequelize.STRING
      },
      description: {
        type: Sequelize.TEXT
      },
      content: {
        type: Sequelize.TEXT
      },
      url: {
        type: Sequelize.STRING
      },
      image_url: {
        type: Sequelize.STRING
      },
      published_at: {
        type: Sequelize.DATE
      },
      lang: {
        type: Sequelize.STRING
      },
      source_id: {
        type: Sequelize.STRING
      },
      source_name: {
        type: Sequelize.STRING
      },
      source_url: {
        type: Sequelize.STRING
      },
      source_country: {
        type: Sequelize.STRING
      },
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE
      }
    });
  },
  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('Favorites');
  }
};