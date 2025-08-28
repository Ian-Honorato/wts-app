import { Model, DataTypes } from "sequelize";

class PagamentoParceiro extends Model {
  static init(sequelize) {
    super.init(
      {
        data_pagamento: {
          type: DataTypes.DATE,
          allowNull: false,
        },
        valor_pago: {
          type: DataTypes.DECIMAL(10, 2),
          allowNull: false,
        },
        quantidade_clientes: {
          type: DataTypes.INTEGER,
          allowNull: false,
        },
        percentual_pagamento: {
          type: DataTypes.FLOAT,
          allowNull: false,
        },
      },
      {
        sequelize,
        tableName: "pagamentos_parceiros",
        timestamps: true,
        underscored: true,
      }
    );
    return this;
  }

  // A associação está perfeita como você fez.
  static associate(models) {
    this.belongsTo(models.Parceiro, {
      foreignKey: "parceiro_id",
      as: "parceiro",
    });
  }
}

export default PagamentoParceiro;
