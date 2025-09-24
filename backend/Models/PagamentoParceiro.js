import { Model, DataTypes } from "sequelize";

class PagamentoParceiro extends Model {
  static init(sequelize) {
    super.init(
      {
        mes_referencia: {
          type: DataTypes.DATEONLY,
          allowNull: false,
        },

        valor_total: {
          type: DataTypes.DECIMAL(10, 2),
          allowNull: false,
        },

        quantidade: {
          type: DataTypes.INTEGER,
          allowNull: false,
        },

        data_pagamento: {
          type: DataTypes.DATE,
          allowNull: true,
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

  static associate(models) {
    this.belongsTo(models.Parceiro, {
      foreignKey: "parceiro_id",
      as: "parceiro",
    });

    this.hasMany(models.PagamentoCertificado, {
      foreignKey: "pagamento_id",
      as: "certificados",
    });
  }
}

export default PagamentoParceiro;
