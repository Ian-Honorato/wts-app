import { Model, DataTypes } from "sequelize";

class Parceiro extends Model {
  static init(sequelize) {
    super.init(
      {
        nome_escritorio: {
          type: DataTypes.STRING,
          allowNull: false,
          unique: true,
        },
      },
      {
        sequelize,
        tableName: "parceiros",
        timestamps: true,
        underscored: true,
      }
    );
    return this;
  }

  static associate(models) {
    this.belongsTo(models.Usuario, {
      foreignKey: "cadastrado_por_id",
      as: "cadastrado_por",
    });

    this.hasMany(models.PagamentoParceiro, {
      foreignKey: "parceiro_id",
      as: "pagamentos",
    });
    this.hasMany(models.Cliente, {
      foreignKey: "referencia_parceiro",
      as: "clientes_indicados",
    });
  }
}

export default Parceiro;
