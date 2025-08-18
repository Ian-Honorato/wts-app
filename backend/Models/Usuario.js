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
        password: {
          type: DataTypes.VIRTUAL,
          allowNull: false,
          validate: {
            len: {
              args: [6, 50],
              msg: "A senha deve ter entre 6 e 50 caracteres.",
            },
          },
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

    this.addHook("beforeSave", async (usuario) => {
      if (usuario.password) {
        usuario.password_hash = await bcrypt.hash(usuario.password, 10);
      }
    });

    return this;
  }

  async passwordIsValid(password) {
    if (!this.password_hash) return false;
    return await bcrypt.compare(password, this.password_hash);
  }

  static associate(models) {
    this.hasMany(models.Cliente, { foreignKey: "usuario_id", as: "clientes" });
    this.hasMany(models.ContratoCertificado, {
      foreignKey: "usuario_id",
      as: "contratos",
    });
  }
}

export default Usuario;
