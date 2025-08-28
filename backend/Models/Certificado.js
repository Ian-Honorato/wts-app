import { Model, DataTypes } from "sequelize";

class Certificado extends Model {
  static init(sequelize) {
    super.init(
      {
        nome_certificado: {
          type: DataTypes.STRING,
          allowNull: false,
          unique: true,
        },
      },
      {
        sequelize,
        tableName: "certificados",
        timestamps: true,
        underscored: true,
      }
    );
    return this;
  }

  static associate(models) {
    // Um tipo de certificado pode estar em muitos contratos
    this.hasMany(models.ContratoCertificado, {
      foreignKey: "referencia_certificado",
      as: "contratos",
    });
  }
}

export default Certificado;
