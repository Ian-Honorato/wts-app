import { Model, DataTypes } from "sequelize";

class Cliente extends Model {
  static init(sequelize) {
    super.init(
      {
        nome: {
          type: DataTypes.STRING,
          validate: {
            notEmpty: {
              msg: "O campo nome não pode estar vazio.",
            },
          },
        },
        cpf_cnpj: {
          type: DataTypes.STRING,
          unique: {
            msg: "Este CPF/CNPJ já está cadastrado.",
          },
          validate: {
            notEmpty: {
              msg: "O campo CPF/CNPJ não pode estar vazio.",
            },
          },
        },
        tipo_cliente: {
          type: DataTypes.STRING,
          validate: {
            notEmpty: {
              msg: "O campo Tipo de Cliente não pode estar vazio.",
            },
          },
        },
        representante: {
          type: DataTypes.STRING,
          validate: {
            notEmpty: {
              msg: "O campo Representante não pode estar vazio.",
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
      },
      {
        sequelize,
        tableName: "clientes",
        timestamps: true,
        underscored: true,
        paranoid: true,
        deletedAt: "deleted_at",
        hooks: {
          beforeDestroy: async (cliente, options) => {
            console.log(
              `Hook beforeDestroy acionado para o cliente ID: ${cliente.id}`
            );

            const contratos =
              await sequelize.models.ContratoCertificado.findAll({
                where: { cliente_id: cliente.id },
                transaction: options.transaction,
              });

            console.log(
              `Encontrados ${contratos.length} contratos para soft-delete.`
            );

            const promises = contratos.map((contrato) =>
              contrato.destroy({ transaction: options.transaction })
            );

            await Promise.all(promises);
            console.log(
              `Soft delete concluído para os contratos do cliente ID: ${cliente.id}`
            );
          },
        },
      }
    );
    return this;
  }

  static associate(models) {
    this.belongsTo(models.Usuario, {
      foreignKey: "id_usuario",
      as: "cadastrado_por",
    });
    this.hasMany(models.ContratoCertificado, {
      foreignKey: "cliente_id",
      as: "contratos",
    });
    this.hasMany(models.MensagensEnviadas, {
      foreignKey: "cliente_id",
      as: "mensagens_enviadas",
    });
    this.belongsTo(models.Parceiro, {
      foreignKey: "referencia_parceiro",
      as: "parceiro_indicador",
    });
  }
}

export default Cliente;
