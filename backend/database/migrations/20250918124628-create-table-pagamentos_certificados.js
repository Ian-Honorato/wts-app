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
        comment:
          "Referencia o lote de pagamento ao parceiro em pagamentos_parceiros",
        references: { model: "pagamentos_parceiros", key: "id" },
        onUpdate: "CASCADE",
        onDelete: "CASCADE",
      },
      // ADICIONADO: O vínculo correto com o contrato específico que foi pago.
      contrato_certificado_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        comment: "Referencia o contrato específico que está sendo comissionado",
        references: { model: "contratos_certificados", key: "id" },
        onUpdate: "CASCADE",
        onDelete: "RESTRICT", // RESTRICT para não permitir apagar um contrato se já houver pagamento associado.
      },
      // Opcional: Pode ser mantido para registro histórico, mas o valor original está no contrato.
      valor_certificado: {
        type: Sequelize.DECIMAL(10, 2),
        comment: "Valor base do certificado na data do pagamento",
      },
      percentual_comissao: {
        type: Sequelize.FLOAT,
        allowNull: false,
        comment: "Percentual de comissão aplicado",
      },
      // O nome poderia ser mais específico, como 'valor_comissao'
      valor_total: {
        type: Sequelize.DECIMAL(10, 2),
        comment:
          "Valor final da comissão (valor_certificado * percentual_comissao)",
      },
      created_at: {
        type: Sequelize.DATE,
        allowNull: false,
      },
      updated_at: {
        type: Sequelize.DATE,
        allowNull: false,
      },
      // REMOVIDO: tipo_certificado_id
      // REMOVIDO: quantidade
    });
  },
  async down(queryInterface) {
    await queryInterface.dropTable("pagamentos_certificados");
  },
};
