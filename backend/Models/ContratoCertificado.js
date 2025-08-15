import { Model, DataTypes } from "sequelize";

class ContratoCertificado extends Model {
  static init(sequelize) {
    super.init(
      {
        numero_contrato: DataTypes.STRING,
        data_emissao: DataTypes.DATE,
        data_vencimento: DataTypes.DATE,
        status: DataTypes.ENUM(
          "Agendado",
          "Em contato",
          "Renovado",
          "Não identificado",
          "Não vai renovar",
          "Cancelado",
          "Ativo"
        ),
      },
      {
        sequelize,
        tableName: "contratos_certificados",
      }
    );
    return this;
  }

  static associate(models) {
    // Relação com Cliente
    this.belongsTo(models.Cliente, { foreignKey: "cliente_id", as: "cliente" });
    // Relação com Usuário
    this.belongsTo(models.Usuario, { foreignKey: "usuario_id", as: "usuario" });
  }
}

export default ContratoCertificado;
