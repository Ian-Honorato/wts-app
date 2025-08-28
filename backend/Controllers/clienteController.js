// Importa a conexão e os modelos a partir do inicializador central
import {
  sequelize,
  Cliente,
  Parceiro,
  Certificado,
  ContratoCertificado,
} from "../Models/index.js";

import { Op } from "sequelize";

// Importando os tipos de erro específicos do Sequelize
import {
  ValidationError,
  UniqueConstraintError,
  ForeignKeyConstraintError,
} from "sequelize";

// ----------------------------------------------------------------------------
// FUNÇÕES AUXILIARES (Futuramente em uma pasta /Utils)
// ----------------------------------------------------------------------------

/**
 * Função auxiliar para centralizar o tratamento de erros do Sequelize.
 */
function handleError(e, res) {
  if (e instanceof ValidationError) {
    const errors = e.errors.map((err) => ({
      field: err.path,
      message: err.message,
    }));
    return res
      .status(400)
      .json({ error: "Dados inválidos fornecidos.", details: errors });
  }
  if (e instanceof UniqueConstraintError) {
    const errors = e.errors.map((err) => ({
      field: err.path,
      message: `O campo '${err.path}' já está em uso.`,
    }));
    return res
      .status(409)
      .json({ error: "Conflito de dados.", details: errors });
  }
  if (e instanceof ForeignKeyConstraintError) {
    return res.status(409).json({
      error: "Operação não permitida.",
      details:
        "Este registro não pode ser excluído pois está associado a outros no sistema.",
    });
  }
  console.error("Erro Inesperado no Servidor:", e);
  return res.status(500).json({
    error: "Ocorreu um erro inesperado no servidor.",
    details: process.env.NODE_ENV === "development" ? e.message : undefined,
  });
}

/**
 * Valida, sanitiza e formata os dados de entrada para um cliente.
 */
function sanitizarCliente(data, isUpdate = false) {
  const statusEnumValidos = [
    "Agendado",
    "Em contato",
    "ESC Agendado",
    "Não vai renovar",
    "Sem dados CNTT",
    "Vence em outro mês",
    "Tickets",
    "Ativo",
    "Não identificado",
    "Renovado",
    "Cancelado",
  ];
  const errors = [];
  const sanitizedData = { ...data };

  if (!isUpdate) {
    if (!sanitizedData.nome_cliente)
      errors.push("O nome do cliente é obrigatório.");
    if (!sanitizedData.cpf_cnpj) errors.push("O CPF/CNPJ é obrigatório.");
    if (!sanitizedData.telefone) errors.push("O telefone é obrigatório.");
    if (!sanitizedData.status) errors.push("O status é obrigatório.");
    if (!sanitizedData.nome_parceiro)
      errors.push("O nome do parceiro é obrigatório.");
    if (!sanitizedData.nome_certificado)
      errors.push("O nome do certificado é obrigatório.");
    if (!sanitizedData.numero_contrato)
      errors.push("O número do contrato é obrigatório.");
  }

  if (sanitizedData.cpf_cnpj) {
    const cleanedCpfCnpj = String(sanitizedData.cpf_cnpj).replace(/\D/g, "");
    if (cleanedCpfCnpj.length === 11) {
      sanitizedData.tipo_cliente = "Pessoa Física";
    } else if (cleanedCpfCnpj.length === 14) {
      sanitizedData.tipo_cliente = "Pessoa Jurídica";
    } else {
      errors.push("O CPF/CNPJ deve conter 11 ou 14 dígitos numéricos.");
    }
    sanitizedData.cpf_cnpj = cleanedCpfCnpj;
  }

  if (
    sanitizedData.data_vencimento &&
    typeof sanitizedData.data_vencimento === "string"
  ) {
    const parts = sanitizedData.data_vencimento.split("/");
    if (parts.length === 3) {
      const [day, month, year] = parts.map(Number);
      const dateObj = new Date(year, month - 1, day);
      if (!isNaN(dateObj.getTime()) && dateObj.getDate() === day) {
        sanitizedData.data_vencimento = dateObj;
      } else {
        errors.push(
          "A data de vencimento é inválida. Use o formato DD/MM/AAAA."
        );
      }
    } else {
      errors.push(
        "A data de vencimento está em um formato inválido. Use o formato DD/MM/AAAA."
      );
    }
  }

  if (
    sanitizedData.status &&
    !statusEnumValidos.includes(sanitizedData.status)
  ) {
    errors.push(
      `O status deve ser um dos seguintes: ${statusEnumValidos.join(", ")}`
    );
  }

  if (errors.length > 0) {
    return { sanitizedData: null, errors };
  }
  return { sanitizedData, errors: null };
}

// ----------------------------------------------------------------------------
// CLASSE DO CONTROLLER
// ----------------------------------------------------------------------------

class ClienteController {
  /**
   * Cria um novo cliente e seu contrato inicial de forma transacional.
   */
  async store(req, res) {
    const { sanitizedData, errors } = sanitizarCliente(req.body);
    if (errors) {
      return res
        .status(400)
        .json({ error: "Dados inválidos fornecidos.", details: errors });
    }

    const {
      nome_parceiro,
      nome_cliente,
      cpf_cnpj,
      tipo_cliente,
      representante,
      email_cliente,
      telefone,
      nome_certificado,
      numero_contrato,
      data_vencimento,
      status,
    } = sanitizedData;

    const t = await sequelize.transaction();
    try {
      let parceiro = await Parceiro.findOne({
        where: { nome_escritorio: nome_parceiro },
        transaction: t,
      });
      if (!parceiro) {
        parceiro = await Parceiro.create(
          { nome_escritorio: nome_parceiro, cadastrado_por_id: req.userId },
          { transaction: t }
        );
      }

      const clienteExistente = await Cliente.findOne({ where: { cpf_cnpj } });
      if (clienteExistente) {
        throw new Error(
          "Cliente com este CPF/CNPJ já existe na base de dados."
        );
      }

      const novoCliente = await Cliente.create(
        {
          nome: nome_cliente,
          cpf_cnpj,
          tipo_cliente,
          representante,
          email: email_cliente,
          telefone,
          id_usuario: req.userId,
          referencia_parceiro: parceiro.id,
        },
        { transaction: t }
      );

      let certificado = await Certificado.findOne({
        where: { nome_certificado },
        transaction: t,
      });
      if (!certificado) {
        certificado = await Certificado.create(
          { nome_certificado },
          { transaction: t }
        );
      }

      const novoContrato = await ContratoCertificado.create(
        {
          numero_contrato,
          data_vencimento,
          status,
          cliente_id: novoCliente.id,
          usuario_id: req.userId,
          referencia_certificado: certificado.id,
        },
        { transaction: t }
      );

      await t.commit();
      return res.status(201).json({
        message: "Cliente e contrato criados com sucesso!",
        cliente: novoCliente,
        contrato: novoContrato,
      });
    } catch (e) {
      await t.rollback();
      if (e.message.includes("já existe")) {
        return res.status(409).json({ error: e.message });
      }
      return handleError(e, res);
    }
  }

  /**
   * Atualiza os dados de um cliente e seu contrato associado de forma transacional.
   */
  async update(req, res) {
    const { sanitizedData, errors } = sanitizarCliente(req.body, true);
    if (errors) {
      return res
        .status(400)
        .json({ error: "Dados inválidos fornecidos.", details: errors });
    }

    const { id } = req.params;
    const {
      nome_parceiro,
      nome_cliente,
      cpf_cnpj,
      tipo_cliente,
      representante,
      email_cliente,
      telefone,
      nome_certificado,
      numero_contrato,
      data_vencimento,
      status,
    } = sanitizedData;

    const t = await sequelize.transaction();
    try {
      const cliente = await Cliente.findByPk(id, {
        include: [{ model: ContratoCertificado, as: "contratos", limit: 1 }],
        transaction: t,
      });
      if (!cliente) throw new Error("Cliente não encontrado.");

      const contrato = cliente.contratos[0];
      if (!contrato)
        throw new Error(
          "Nenhum contrato associado foi encontrado para atualização."
        );

      let parceiro;
      if (nome_parceiro) {
        parceiro = await Parceiro.findOne({
          where: { nome_escritorio: nome_parceiro },
          transaction: t,
        });
        if (!parceiro) {
          parceiro = await Parceiro.create(
            { nome_escritorio: nome_parceiro, cadastrado_por_id: req.userId },
            { transaction: t }
          );
        }
      }

      let certificado;
      if (nome_certificado) {
        certificado = await Certificado.findOne({
          where: { nome_certificado },
          transaction: t,
        });
        if (!certificado) {
          certificado = await Certificado.create(
            { nome_certificado },
            { transaction: t }
          );
        }
      }

      const clienteAtualizado = await cliente.update(
        {
          nome: nome_cliente,
          cpf_cnpj,
          tipo_cliente,
          representante,
          email: email_cliente,
          telefone,
          referencia_parceiro: parceiro
            ? parceiro.id
            : cliente.referencia_parceiro,
        },
        { transaction: t }
      );

      const contratoAtualizado = await contrato.update(
        {
          numero_contrato,
          data_vencimento,
          status,
          referencia_certificado: certificado
            ? certificado.id
            : contrato.referencia_certificado,
        },
        { transaction: t }
      );

      await t.commit();
      return res.json({
        message: "Cliente e contrato atualizados com sucesso!",
        cliente: clienteAtualizado,
        contrato: contratoAtualizado,
      });
    } catch (e) {
      await t.rollback();
      if (e.message.includes("não encontrado")) {
        return res.status(404).json({ error: e.message });
      }
      return handleError(e, res);
    }
  }

  /**
   * Exclui um cliente e retorna uma mensagem de sucesso.
   */
  async destroy(req, res) {
    try {
      const { id } = req.params;
      const cliente = await Cliente.findByPk(id);

      if (!cliente) {
        return res.status(404).json({ error: "Cliente não encontrado." });
      }

      await cliente.destroy();
      return res.json({ message: "Cliente excluído com sucesso." });
    } catch (e) {
      return handleError(e, res);
    }
  }

  /**
   * Lista todos os clientes (versão simplificada).
   */
  async index(req, res) {
    try {
      const clientes = await Cliente.findAll({
        order: [["nome", "ASC"]],
      });
      return res.json(clientes);
    } catch (e) {
      return handleError(e, res);
    }
  }

  /**
   * Exibe os dados completos de um cliente específico.
   */
  async show(req, res) {
    try {
      const { id } = req.params;
      const cliente = await Cliente.findByPk(id, {
        include: [
          {
            model: ContratoCertificado,
            as: "contratos",
            attributes: ["numero_contrato", "data_vencimento", "status"],
            include: [
              {
                model: Certificado,
                as: "certificado",
                attributes: ["nome_certificado"],
              },
            ],
          },
          {
            model: Parceiro,
            as: "parceiro_indicador",
            attributes: ["nome_escritorio"],
          },
        ],
      });

      if (!cliente) {
        return res.status(404).json({ error: "Cliente não encontrado." });
      }

      return res.json(cliente);
    } catch (e) {
      return handleError(e, res);
    }
  }

  /**
   * Encontra contratos com data de vencimento nos próximos 30 dias.
   */
  async findByContract(req, res) {
    try {
      const hoje = new Date();
      const dataFutura = new Date();
      dataFutura.setDate(hoje.getDate() + 30);

      const contratos = await ContratoCertificado.findAll({
        where: { data_vencimento: { [Op.between]: [hoje, dataFutura] } },
        include: {
          model: Cliente,
          as: "cliente",
          attributes: ["cpf_cnpj", "telefone", "representante"],
        },
        order: [["data_vencimento", "ASC"]],
      });

      const contratosCriticos = contratos.map((contrato) => {
        const diffTime = Math.abs(new Date(contrato.data_vencimento) - hoje);
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        return {
          id: contrato.id,
          Registro: contrato.cliente.cpf_cnpj,
          Data_vencimento: contrato.data_vencimento,
          Representante: contrato.cliente.representante,
          telefone: contrato.cliente.telefone,
          dias_restantes: diffDays,
        };
      });

      return res.json({ Contratos_criticos: contratosCriticos });
    } catch (e) {
      return handleError(e, res);
    }
  }

  /**
   * Retorna uma lista de clientes com seus dados de contrato, certificado e parceiro.
   */
  async findBasic(req, res) {
    try {
      const clientes = await Cliente.findAll({
        attributes: ["id", "nome", "cpf_cnpj", "representante", "telefone"],
        include: [
          {
            model: ContratoCertificado,
            as: "contratos",
            attributes: ["numero_contrato", "data_vencimento", "status"],
            include: [
              {
                model: Certificado,
                as: "certificado",
                attributes: ["nome_certificado"],
              },
            ],
          },
          {
            model: Parceiro,
            as: "parceiro_indicador",
            attributes: ["nome_escritorio"],
          },
        ],
        order: [["nome", "ASC"]],
      });
      return res.json(clientes);
    } catch (e) {
      return handleError(e, res);
    }
  }
}

export default new ClienteController();
