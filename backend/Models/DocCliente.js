import { Model, DataTypes } from "sequelize";

class DocCliente extends Model {
  static init(sequelize) {
    super.init(
      {
        nome_arquivo: {
          type: DataTypes.STRING,
          allowNull: false,
        },
        caminho_do_arquivo: {
          type: DataTypes.STRING,
          allowNull: false,
          unique: true,
        },
        id_cliente: {
          type: DataTypes.INTEGER,
          allowNull: false,
        },
      },
      {
        sequelize,
        tableName: "doc_clientes",
        timestamps: true,
        underscored: true,
      }
    );
    return this;
  }

  static associate(models) {
    this.belongsTo(models.Cliente, {
      foreignKey: "id_cliente",
      as: "cliente",
    });
  }
}

export default DocCliente;
