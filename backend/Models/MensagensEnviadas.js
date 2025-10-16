import { Model, DataTypes } from "sequelize";

class MensagensEnviadas extends Model {
  static init(sequelize) {
    super.init(
      {
        id: {
          type: DataTypes.INTEGER,
          primaryKey: true,
          autoIncrement: true,
          allowNull: false,
        },
        data_envio: {
          type: DataTypes.DATEONLY,
          allowNull: false,
        },
      },
      {
        sequelize,
        modelName: "MensagensEnviadas",
        tableName: "mensagens_enviadas",
        timestamps: true,
        underscored: true,
      }
    );
    return this;
  }

  static associate(models) {
    this.belongsTo(models.Usuario, {
      foreignKey: "enviada_por_id",
      as: "remetente",
    });
    this.belongsTo(models.Cliente, {
      foreignKey: "cliente_id",
      as: "cliente_notificado",
    });
  }
}

export default MensagensEnviadas;
