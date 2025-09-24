import { Model, DataTypes } from "sequelize";

class PagamentoCertificado extends Model {
  static init(sequelize) {
    super.init(
      {
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
    this.belongsTo(models.PagamentoParceiro, {
      foreignKey: "pagamento_id",
      as: "pagamento_parceiro",
    });

    this.belongsTo(models.ContratoCertificado, {
      foreignKey: "contrato_certificado_id",
      as: "contrato",
    });
  }
}

export default PagamentoCertificado;
