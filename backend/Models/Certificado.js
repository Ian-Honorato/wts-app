import { Model, DataTypes } from "sequelize";

class Certificado extends Model {
  static init(sequelize) {
    super.init(
      {
        nome_certificado: DataTypes.STRING,
      },
      {
        sequelize,
        tableName: "certificados",
      }
    );
    return this;
  }

  static associate(models) {
    // Um tipo de certificado pode estar em muitos contratos
    this.hasMany(models.ContratoCertificado, {
      foreignKey: "certificado_id",
      as: "contratos",
    });
  }
}

export default Certificado;
