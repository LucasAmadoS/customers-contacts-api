'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {

    await queryInterface.addColumn("contacts", "status", {
      type: Sequelize.ENUM("ACTIVE", "ARCHIVED"),
      defaultValue: "ACTIVE",
      allowNull: false,
    });
  },

  async down(queryInterface) {

    await queryInterface.sequelize.transaction(async transaction => {
      await queryInterface.removeColumn('contacts', "status", { transaction })

      await queryInterface.sequelize.query("DROP TYPE enum_contacts_status", { transaction })
    });
  }
};
