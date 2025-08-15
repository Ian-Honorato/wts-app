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
        // Chave estrangeira
        type: Sequelize.INTEGER,
        allowNull: false,
        references: { model: "parceiros", key: "id" },
        onUpdate: "CASCADE",
        onDelete: "CASCADE",
      },
      data_pagamento: {
        type: Sequelize.DATE,
        allowNull: false,
      },
      valor_pago: {
        type: Sequelize.DECIMAL(10, 2),
      },
      quantidade_clientes: {
        type: Sequelize.INTEGER,
        allowNull: false,
      },
      percentual_pagamento: {
        type: Sequelize.FLOAT,
        allowNull: false,
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
