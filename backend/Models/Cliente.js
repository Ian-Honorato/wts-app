import { Model, DataTypes } from "sequelize";

class Cliente extends Model {
  static init(sequelize) {
    super.init(
      {
        nome: {
          type: DataTypes.STRING,
          defaultValue: "",
          validate: {
            notEmpty: {
              msg: "O campo nome não pode estar vazio.",
            },
          },
        },
        cpf_cnpj: {
          type: DataTypes.STRING,
          defaultValue: "",
          unique: {
            msg: "Este CPF/CNPJ já está cadastrado.",
          },
          validate: {
            notEmpty: {
              msg: "O campo CPF/CNPJ não pode estar vazio.",
            },
          },
        },
        email: {
          type: DataTypes.STRING,
          defaultValue: "",
          validate: {
            isEmail: {
              msg: "O e-mail informado é inválido.",
            },
          },
        },
        telefone: DataTypes.STRING,
        endereco: DataTypes.STRING,
      },
      {
        sequelize,
        tableName: "clientes",
      }
    );
    return this;
  }
  //relacionamento com a tabela usuarios
  static associate(models) {
    this.belongsTo(models.Usuario, { foreignKey: "usuario_id", as: "usuario" });
    // Adicione a linha abaixo
    this.hasMany(models.ContratoCertificado, {
      foreignKey: "cliente_id",
      as: "contratos",
    });
  }
}

export default Cliente;
