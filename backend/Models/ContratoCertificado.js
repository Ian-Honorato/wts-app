import { Model, DataTypes } from "sequelize";

class ContratoCertificado extends Model {
  static init(sequelize) {
    super.init(
      {
        numero_contrato: {
          type: DataTypes.STRING,
          allowNull: false,
          unique: true,
        },
        data_renovacao: {
          type: DataTypes.DATE,
          allowNull: true,
        },
        data_vencimento: {
          type: DataTypes.DATE,
          allowNull: true,
        },
        status: {
          type: DataTypes.ENUM(
            "Agendado",
            "Em contato",
            "Renovado",
            "Não identificado",
            "Não vai renovar",
            "Cancelado",
            "Ativo"
          ),
          allowNull: false,
          defaultValue: "Não identificado",
        },
      },
      {
        sequelize,
        tableName: "contratos_certificados",
        timestamps: true,
        underscored: true,
      }
    );
    return this;
  }

  static associate(models) {
    this.belongsTo(models.Cliente, { foreignKey: "cliente_id", as: "cliente" });

    this.belongsTo(models.Usuario, {
      foreignKey: "usuario_id",
      as: "responsavel",
    });

    this.belongsTo(models.Certificado, {
      foreignKey: "referencia_certificado",
      as: "certificado",
    });
  }
}

export default ContratoCertificado;
