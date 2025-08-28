import { Model, DataTypes } from "sequelize";
import bcrypt from "bcryptjs";

class Usuario extends Model {
  static init(sequelize) {
    super.init(
      {
        nome: {
          type: DataTypes.STRING,
          allowNull: false,
          validate: {
            notEmpty: {
              msg: "O campo nome não pode estar vazio.",
            },
          },
        },
        email: {
          type: DataTypes.STRING,
          allowNull: false,
          unique: {
            msg: "O e-mail informado já está cadastrado.",
          },
          validate: {
            isEmail: {
              msg: "O e-mail informado é inválido.",
            },
          },
        },
        tipo_usuario: {
          type: DataTypes.ENUM("admin", "usuario"),
          defaultValue: "usuario",
          allowNull: false,
        },
        password_hash: {
          type: DataTypes.STRING,
          allowNull: false,
        },
      },
      {
        sequelize,
        tableName: "usuarios",
        timestamps: true,
        underscored: true,
      }
    );

    /* this.addHook("beforeSave", async (usuario) => {
      if (usuario.password) {
        usuario.password_hash = await bcrypt.hash(usuario.password, 10);
      }
    }); */

    return this;
  }

  passwordIsValid(password) {
    return bcrypt.compare(password, this.password_hash);
  }

  /**
   * Define todas as associações do modelo Usuario.
   */
  static associate(models) {
    // Um usuário pode cadastrar VÁRIOS clientes
    this.hasMany(models.Cliente, {
      foreignKey: "id_usuario", // Corrigido para corresponder à migration
      as: "clientes_cadastrados",
    });

    // Um usuário pode emitir VÁRIOS contratos
    this.hasMany(models.ContratoCertificado, {
      foreignKey: "usuario_id",
      as: "contratos_emitidos",
    });

    // Um usuário pode cadastrar VÁRIOS parceiros
    this.hasMany(models.Parceiro, {
      foreignKey: "cadastrado_por_id",
      as: "parceiros_cadastrados",
    });

    // Um usuário pode enviar VÁRIAS mensagens
    // CORREÇÃO: Nome do modelo ajustado para o plural 'MensagensEnviadas'
    this.hasMany(models.MensagensEnviadas, {
      foreignKey: "enviada_por_id",
      as: "mensagens_enviadas",
    });
  }
}

export default Usuario;
