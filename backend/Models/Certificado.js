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
    // Relação existente (mantida)
    this.hasMany(models.ContratoCertificado, {
      foreignKey: "referencia_certificado",
      as: "contratos",
    });

    this.hasMany(models.PagamentoCertificado, {
      foreignKey: "tipo_certificado_id",
      as: "pagamentos_detalhes",
    });
  }
}

export default Certificado;
