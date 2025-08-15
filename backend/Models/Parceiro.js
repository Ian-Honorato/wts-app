import { Model, DataTypes } from "sequelize";

class Parceiro extends Model {
  static init(sequelize) {
    super.init(
      {
        nome_escritorio: DataTypes.STRING,
      },
      {
        sequelize,
        tableName: "parceiros",
      }
    );
    return this;
  }

  // Vamos adicionar as associações aqui em breve
  static associate(models) {
    // Um parceiro pode ter muitos clientes
    this.hasMany(models.Cliente, { foreignKey: "parceiro_id", as: "clientes" });
    // Um parceiro pode ter muitos pagamentos
    this.hasMany(models.PagamentoParceiro, {
      foreignKey: "parceiro_id",
      as: "pagamentos",
    });
  }
}

export default Parceiro;
