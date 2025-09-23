import { Model, DataTypes } from "sequelize";

class PagamentoCertificado extends Model {
  static init(sequelize) {
    super.init(
      {
        // O campo 'quantidade' foi removido. Cada linha é um pagamento único.
        valor_certificado: {
          type: DataTypes.DECIMAL(10, 2),
          allowNull: true,
          comment: "Valor base do certificado na data do pagamento",
        },
        percentual_comissao: {
          type: DataTypes.FLOAT,
          allowNull: false,
          comment: "Percentual de comissão aplicado",
        },
        valor_total: {
          type: DataTypes.DECIMAL(10, 2),
          allowNull: false,
          comment: "Valor final da comissão para este contrato",
        },
      },
      {
        sequelize,
        tableName: "pagamentos_certificados",
        timestamps: true,
        underscored: true,
      }
    );
    return this;
  }

  static associate(models) {
    // Relação CORRETA: Um item de pagamento pertence a um lote/fatura (PagamentoParceiro).
    this.belongsTo(models.PagamentoParceiro, {
      foreignKey: "pagamento_id",
      as: "pagamento_parceiro",
    });

    // Relação CORRIGIDA: Cada registro de pagamento agora se refere a um CONTRATO específico.
    this.belongsTo(models.ContratoCertificado, {
      foreignKey: "contrato_certificado_id",
      as: "contrato",
    });

    // A associação incorreta com o model 'Certificado' foi removida.
  }
}

export default PagamentoCertificado;
