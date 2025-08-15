import { Model, DataTypes } from "sequelize";
import bcrypt from "bcryptjs";

class Usuario extends Model {
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
        email: {
          type: DataTypes.STRING,
          defaultValue: "",
          unique: {
            msg: "O e-mail informado já está cadastrado.",
          },
          validate: {
            isEmail: {
              msg: "O e-mail informado é inválido.",
            },
          },
        },

        password: {
          type: DataTypes.VIRTUAL,
          defaultValue: "",
          validate: {
            len: {
              args: [6, 50],
              msg: "A senha deve ter entre 6 e 50 caracteres.",
            },
          },
        },

        password_hash: {
          type: DataTypes.STRING,
          defaultValue: "",
        },
      },
      {
        sequelize,
        tableName: "usuarios",
      }
    );

    this.addHook("beforeSave", async (usuario) => {
      // Verifica se o campo VIRTUAL 'password' foi preenchido
      if (usuario.password) {
        usuario.password_hash = await bcrypt.hash(usuario.password, 10);
      }
    });

    return this;
  }

  passwordIsValid(password) {
    return bcrypt.compare(password, this.password_hash);
  }
  static associate(models) {
    this.hasMany(models.Cliente, { foreignKey: "usuario_id", as: "clientes" });
    // Adicione a linha abaixo
    this.hasMany(models.ContratoCertificado, {
      foreignKey: "usuario_id",
      as: "contratos",
    });
  }
}

export default Usuario;
