"use strict";
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable("pagamentos_certificados", {
      id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false,
      },
      pagamento_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: { model: "pagamentos_parceiros", key: "id" },
        onUpdate: "CASCADE",
        onDelete: "CASCADE",
      },
      tipo_certificado_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: { model: "certificados", key: "id" },
        onUpdate: "CASCADE",
        onDelete: "RESTRICT",
      },
      quantidade: {
        type: Sequelize.INTEGER,
        allowNull: false,
      },
      valor_certificado: {
        type: Sequelize.DECIMAL(10, 2),
      },
      percentual_comissao: {
        type: Sequelize.FLOAT,
        allowNull: false,
      },
      valor_total: {
        type: Sequelize.DECIMAL(10, 2),
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
    await queryInterface.dropTable("pagamentos_certificados");
  },
};
