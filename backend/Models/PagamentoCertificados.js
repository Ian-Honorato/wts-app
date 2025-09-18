import { Model, DataTypes } from "sequelize";

class PagamentoCertificado extends Model {
  static init(sequelize) {
    super.init(
      {
        quantidade: {
          type: DataTypes.INTEGER,
          allowNull: false,
        },
        valor_certificado: {
          type: DataTypes.DECIMAL(10, 2),
          allowNull: true,
        },
        percentual_comissao: {
          type: DataTypes.FLOAT,
          allowNull: false,
        },
        valor_total: {
          type: DataTypes.DECIMAL(10, 2),
          allowNull: false,
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
    // Relação: Um item (PagamentoCertificado) pertence a uma fatura (PagamentoParceiro).
    this.belongsTo(models.PagamentoParceiro, {
      foreignKey: "pagamento_id",
      as: "pagamento", // 'as' define o nome da associação
    });
    // Relação: Um item (PagamentoCertificado) refere-se a um tipo de Certificado.
    this.belongsTo(models.Certificado, {
      foreignKey: "tipo_certificado_id",
      as: "certificado",
    });
  }
}

export default PagamentoCertificado;
