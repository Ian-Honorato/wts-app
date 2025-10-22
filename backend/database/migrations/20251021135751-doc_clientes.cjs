"use strict";

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable("doc_clientes", {
      id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false,
      },
      nome_arquivo: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      caminho_do_arquivo: {
        type: Sequelize.STRING,
        allowNull: false,
        unique: true,
      },

      id_cliente: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: { model: "clientes", key: "id" },
        onUpdate: "CASCADE",
        onDelete: "CASCADE",
      },
      created_at: {
        type: Sequelize.DATE,
        allowNull: false,
      },
      updated_at: {
        type: Sequelize.DATE,
        allowNull: false,
      },
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable("doc_clientes");
  },
};
