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
          unique: true,
        },
        quantidade: {
          type: DataTypes.INTEGER,
          allowNull: false,
          defaultValue: 0,
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

  static associate(models) {}
}

export default MensagensEnviadas;
