import {
  sequelize,
  Cliente,
  Parceiro,
  Certificado,
  ContratoCertificado,
} from "../Models/index.js";

import { Op } from "sequelize";

import {
  ValidationError,
  UniqueConstraintError,
  ForeignKeyConstraintError,
} from "sequelize";

// ----------------------------------------------------------------------------
// FUNÇÕES AUXILIARES
// ----------------------------------------------------------------------------
import { errorHandler, handleError } from "../Util/errorHandler.js";

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
    if (!sanitizedData.status) errors.push("O status é obrigatório.");
    if (!sanitizedData.nome_parceiro)
      errors.push("O nome do parceiro é obrigatório.");
    if (!sanitizedData.nome_certificado)
      errors.push("O nome do certificado é obrigatório.");
    if (!sanitizedData.numero_contrato)
      errors.push("O número do contrato é obrigatório.");
  }

  if (sanitizedData.telefone) {
    const cleanedTelefone = String(sanitizedData.telefone).replace(/\D/g, "");
    if (isUpdate) {
      if (cleanedTelefone.length < 10 || cleanedTelefone.length > 15) {
        errors.push("O número de telefone fornecido é inválido.");
      } else {
        sanitizedData.telefone = cleanedTelefone;
      }
    } else {
      if (cleanedTelefone.length === 10 || cleanedTelefone.length === 11) {
        sanitizedData.telefone = "55" + cleanedTelefone;
      } else if (cleanedTelefone.length >= 12 && cleanedTelefone.length <= 15) {
        sanitizedData.telefone = cleanedTelefone;
      } else {
        errors.push(
          "O telefone deve conter um DDD e 8 ou 9 dígitos, ou ser um número internacional válido."
        );
      }
    }
  } else if (!isUpdate) {
    errors.push("O telefone é obrigatório.");
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

  // Validação e conversão da data de renovação
  if (
    sanitizedData.data_renovacao &&
    typeof sanitizedData.data_renovacao === "string"
  ) {
    const parts = sanitizedData.data_renovacao.split("-");
    if (parts.length === 3) {
      const [year, month, day] = parts.map(Number);
      const dateObj = new Date(Date.UTC(year, month - 1, day));
      if (!isNaN(dateObj.getTime())) {
        sanitizedData.data_renovacao = dateObj;
      } else {
        errors.push(
          "A data de Renovação é inválida. Use o formato AAAA-MM-DD."
        );
      }
    } else {
      errors.push(
        "A data de Renovação está em um formato inválido. Use o formato AAAA-MM-DD."
      );
    }
  }

  // Validação e conversão da data de vencimento
  if (
    sanitizedData.data_vencimento &&
    typeof sanitizedData.data_vencimento === "string"
  ) {
    const parts = sanitizedData.data_vencimento.split("-");
    if (parts.length === 3) {
      const [year, month, day] = parts.map(Number);
      // <-- MELHORIA: Use Date.UTC para consistência e evitar problemas de fuso horário
      const dateObj = new Date(Date.UTC(year, month - 1, day));
      if (!isNaN(dateObj.getTime())) {
        sanitizedData.data_vencimento = dateObj;
      } else {
        errors.push(
          "A data de vencimento é inválida. Use o formato AAAA-MM-DD."
        );
      }
    } else {
      errors.push(
        "A data de vencimento está em um formato inválido. Use o formato AAAA-MM-DD."
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
      data_renovacao,
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
          data_renovacao,
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
      return errorHandler(e, res);
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
      data_renovacao,
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
          data_renovacao,
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
      return errorHandler(e, res);
    }
  }

  /**
   * Exclui um cliente e retorna uma mensagem de sucesso.
   */
  async destroy(req, res) {
    // 1. Inicia a transação
    const t = await sequelize.transaction();

    try {
      const { id } = req.params;

      const cliente = await Cliente.findByPk(id, { transaction: t });

      if (!cliente) {
        await t.rollback();
        return res.status(404).json({ error: "Cliente não encontrado." });
      }
      await cliente.destroy({ transaction: t });

      await t.commit();

      return res.json({
        message: "Cliente e seus contratos foram desativados com sucesso.",
      });
    } catch (e) {
      await t.rollback();

      return errorHandler(e, res);
    }
  }

  async index(req, res) {
    try {
      const clientes = await Cliente.findAll({
        order: [["nome", "ASC"]],
      });
      return res.json(clientes);
    } catch (e) {
      return errorHandler(e, res);
    }
  }

  async show(req, res) {
    try {
      const { id } = req.params;
      const cliente = await Cliente.findByPk(id, {
        include: [
          {
            model: ContratoCertificado,
            as: "contratos",
            attributes: [
              "numero_contrato",
              "data_vencimento",
              "status",
              "data_renovacao",
            ],
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
      return errorHandler(e, res);
    }
  }

  async search(req, res) {
    try {
      const { searchTerm = "" } = req.query;

      if (!searchTerm) {
        return res.json({ msg: "Nenhum cliente encontrado." });
      }
      const whereOptions = {
        [Op.or]: [
          { nome: { [Op.like]: `%${searchTerm}%` } },
          { cpf_cnpj: { [Op.like]: `%${searchTerm}%` } },
        ],
      };
      const clientes = await Cliente.findAll({
        where: whereOptions,
        order: [["nome", "ASC"]],
        limit: 10,
      });

      return res.json(clientes);
    } catch (error) {
      console.error("searchTerm Error:", error);
      return res.status(500).json({ error: "Erro ao buscar clientes." });
    }
  }
  async findByContract(req, res) {
    try {
      const { days } = req.body;
      const periodInDays = parseInt(days) || 30;

      const hoje = new Date();
      hoje.setHours(0, 0, 0, 0);

      const dataLimite = new Date();
      dataLimite.setDate(hoje.getDate() + periodInDays);

      const contratos = await ContratoCertificado.findAll({
        where: {
          data_vencimento: {
            [Op.between]: [hoje, dataLimite],
          },

          status: {
            [Op.notIn]: [
              "Cancelado",
              "Renovado",
              "Não vai renovar",
              "Agendado",
              "Em contato",
            ],
          },
        },
        include: [
          {
            model: Cliente,
            as: "cliente",
            attributes: ["id", "nome", "representante", "telefone"],
          },
        ],
        order: [["data_vencimento", "ASC"]],
      });

      const contratosCriticos = contratos.map((contrato) => {
        const msPorDia = 1000 * 60 * 60 * 24;
        const dataVencimento = new Date(contrato.data_vencimento);
        dataVencimento.setHours(0, 0, 0, 0);

        const diffTime = dataVencimento - hoje;
        const diasCalculados = Math.ceil(diffTime / msPorDia);

        const diasRestantes =
          diasCalculados <= 0 ? "Vencido hoje" : diasCalculados;

        return {
          cliente: contrato.cliente,
          contrato_id: contrato.id,
          data_vencimento: contrato.data_vencimento,
          dias_restantes: diasRestantes,
        };
      });

      return res.json({ Contratos_criticos: contratosCriticos });
    } catch (e) {
      return handleError(e, res);
    }
  }
  async findBasic(req, res) {
    try {
      const clientes = await Cliente.findAll({
        attributes: ["id", "nome", "cpf_cnpj", "representante", "telefone"],
        include: [
          {
            model: ContratoCertificado,
            as: "contratos",
            attributes: [
              "numero_contrato",
              "data_vencimento",
              "status",
              "data_renovacao",
            ],
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
      return errorHandler(e, res);
    }
  }
}

export default new ClienteController();
