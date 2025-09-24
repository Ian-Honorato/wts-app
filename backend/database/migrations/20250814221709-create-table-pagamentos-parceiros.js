"use strict";
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable("pagamentos_parceiros", {
      id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false,
      },
      parceiro_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: { model: "parceiros", key: "id" },
        onUpdate: "CASCADE",
        onDelete: "CASCADE",
      },
      mes_referencia: {
        type: Sequelize.DATEONLY,
        allowNull: false,
      },
      valor_total: {
        type: Sequelize.DECIMAL(10, 2),
        allowNull: false,
      },
      quantidade: {
        type: Sequelize.INTEGER,
        allowNull: false,
      },
      data_pagamento: {
        type: Sequelize.DATE,
        allowNull: true,
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
  async down(queryInterface) {
    await queryInterface.dropTable("pagamentos_parceiros");
  },
};
