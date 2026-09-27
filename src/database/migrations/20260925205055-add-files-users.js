'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {

    await queryInterface.addColumn("users", "file_id", {
      type: Sequelize.INTEGER,
      references: { model: "files", key: "id" },
      onUpdate: "CASCADE",
      onDelete: "SET NULL",
    });
  },

  async down(queryInterface) {
    return queryInterface.removeColumn('users', "file_id")
  }
};
