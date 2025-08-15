import { Model, DataTypes } from "sequelize";

class PagamentoParceiro extends Model {
  static init(sequelize) {
    super.init(
      {
        data_pagamento: DataTypes.DATE,
        valor_pago: DataTypes.DECIMAL(10, 2),
        quantidade_clientes: DataTypes.INTEGER,
        percentual_pagamento: DataTypes.FLOAT,
      },
      {
        sequelize,
        tableName: "pagamentos_parceiros",
      }
    );
    return this;
  }

  static associate(models) {
    // Um pagamento pertence a um parceiro
    this.belongsTo(models.Parceiro, {
      foreignKey: "parceiro_id",
      as: "parceiro",
    });
  }
}

export default PagamentoParceiro;
