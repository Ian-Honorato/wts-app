"use strict";

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable("clientes", {
      id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false,
      },
      nome: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      cpf_cnpj: {
        type: Sequelize.STRING,
        allowNull: false,
        unique: true,
      },
      tipo_cliente: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      representante: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      email: {
        type: Sequelize.STRING,
        allowNull: true,
      },
      telefone: {
        type: Sequelize.STRING,
        allowNull: true,
      },
      referencia_parceiro: {
        type: Sequelize.INTEGER,
        allowNull: true,
        references: { model: "parceiros", key: "id" },
      },
      id_usuario: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: { model: "usuarios", key: "id" },
        onUpdate: "CASCADE",
        onDelete: "RESTRICT",
      },
      // --- ADICIONADO ---
      deleted_at: {
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

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable("clientes");
  },
};
