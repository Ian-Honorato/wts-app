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
import { errorHandler } from "../Util/errorHandler.js";

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

  // --- Validação de campos obrigatórios (apenas na criação) ---
  if (!isUpdate) {
    const camposObrigatorios = {
      nome_cliente: "O nome do cliente é obrigatório.",
      cpf_cnpj: "O CPF/CNPJ é obrigatório.",
      status: "O status é obrigatório.",
      nome_parceiro: "O nome do parceiro é obrigatório.",
      nome_certificado: "O nome do certificado é obrigatório.",
      numero_contrato: "O número do contrato é obrigatório.",
      telefone: "O campo telefone é obrigatório.",
    };

    for (const [campo, mensagem] of Object.entries(camposObrigatorios)) {
      if (!sanitizedData[campo] || String(sanitizedData[campo]).trim() === "") {
        errors.push({ field: campo, message: mensagem });
      }
    }
  }

  // --- Validação e Sanitização do Telefone ---
  if (sanitizedData.telefone) {
    const cleanedTelefone = String(sanitizedData.telefone).replace(/\D/g, "");
    if (cleanedTelefone.length < 12 || cleanedTelefone.length > 13) {
      errors.push({
        field: "telefone",
        message:
          "O formato do telefone enviado é inválido (deve ter 12 ou 13 dígitos).",
      });
    } else {
      sanitizedData.telefone = cleanedTelefone;
    }
  }

  // --- 3. Validação e Sanitização do CPF/CNPJ ---
  if (sanitizedData.cpf_cnpj) {
    const cleanedCpfCnpj = String(sanitizedData.cpf_cnpj).replace(/\D/g, "");
    if (cleanedCpfCnpj.length === 11) {
      sanitizedData.tipo_cliente = "Pessoa Física";
    } else if (cleanedCpfCnpj.length === 14) {
      sanitizedData.tipo_cliente = "Pessoa Jurídica";
    } else if (cleanedCpfCnpj.length > 0) {
      errors.push({
        field: "cpf_cnpj",
        message: "O CPF/CNPJ deve conter 11 ou 14 dígitos.",
      });
    }
    sanitizedData.cpf_cnpj = cleanedCpfCnpj;
  }

  // --- 4. Validação de Datas ---
  const validateDate = (dateStr, fieldName) => {
    // Só valida se for uma string não vazia. Permite campos nulos.
    if (dateStr && typeof dateStr === "string") {
      // Checa o formato AAAA-MM-DD
      if (!/^\d{4}-\d{2}-\d{2}$/.test(dateStr)) {
        errors.push({
          field: fieldName,
          message: `Formato de data inválido. Use AAAA-MM-DD.`,
        });
        return dateStr;
      }
      const [year, month, day] = dateStr.split("-").map(Number);
      const dateObj = new Date(Date.UTC(year, month - 1, day));
      // Checa se a data é válida (ex: não é 31 de Fev)
      if (
        dateObj &&
        dateObj.getUTCFullYear() === year &&
        dateObj.getUTCMonth() === month - 1 &&
        dateObj.getUTCDate() === day
      ) {
        return dateObj; // Retorna o objeto Date se for válido
      }
      errors.push({
        field: fieldName,
        message: `A data de ${fieldName.replace("data_", "")} é inválida.`,
      });
    }
    return dateStr; // Retorna o valor original (null, undefined ou já um objeto Date)
  };
  sanitizedData.data_renovacao = validateDate(
    sanitizedData.data_renovacao,
    "data_renovacao"
  );
  sanitizedData.data_vencimento = validateDate(
    sanitizedData.data_vencimento,
    "data_vencimento"
  );

  // --- 5. Validação do Status ---
  if (
    sanitizedData.status &&
    !statusEnumValidos.includes(sanitizedData.status)
  ) {
    errors.push({ field: "status", message: "O status fornecido é inválido." });
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
      const activeStatuses = ["Ativo", "Renovado"];
      if (activeStatuses.includes(status)) {
        const contratoAtivoExistente = await ContratoCertificado.findOne({
          where: {
            cliente_id: novoCliente.id,
            status: {
              [Op.in]: activeStatuses,
            },
          },
          transaction: t,
        });

        if (contratoAtivoExistente) {
          throw new Error(
            `O cliente já possui um contrato com o status "${contratoAtivoExistente.status}". Não é possível criar outro contrato ativo/renovado.`
          );
        }
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
      if (
        e.message.includes("já existe na base de dados") ||
        e.message.includes("já possui um contrato com o status")
      ) {
        return res.status(409).json({ error: e.message });
      }
      return errorHandler(e, res);
    }
  }

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
      representante,
      email_cliente,
      telefone,
    } = sanitizedData;

    const t = await sequelize.transaction();
    try {
      const cliente = await Cliente.findByPk(id, { transaction: t });

      if (!cliente) {
        throw new Error("Cliente não encontrado.");
      }
      if (cpf_cnpj && cpf_cnpj !== cliente.cpf_cnpj) {
        const clienteExistente = await Cliente.findOne({
          where: {
            cpf_cnpj,
            id: { [Op.ne]: id },
          },
          transaction: t,
        });
        if (clienteExistente) {
          throw new Error(
            "O CPF/CNPJ informado já está em uso por outro cliente."
          );
        }
      }
      let parceiroId = cliente.referencia_parceiro;
      if (nome_parceiro) {
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
        parceiroId = parceiro.id;
      }

      const clienteAtualizado = await cliente.update(
        {
          nome: nome_cliente,
          cpf_cnpj,
          representante,
          email: email_cliente,
          telefone,
          referencia_parceiro: parceiroId,
        },
        { transaction: t }
      );

      await t.commit();

      return res.status(200).json({
        message: "Dados do cliente atualizados com sucesso!",
        cliente: clienteAtualizado,
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
      const { status } = req.query;

      // 2. A sua validação de status já está ótima e deve ser mantida.
      const statusValidos = [
        "Agendado",
        "Em contato",
        "Renovado",
        "Não identificado",
        "Não vai renovar",
        "Cancelado",
        "Ativo",
      ];
      if (status && !statusValidos.includes(status)) {
        return res.status(400).json({ error: "Status inválido fornecido." });
      }

      const queryOptions = {
        order: [["nome", "ASC"]],
      };

      if (status) {
        queryOptions.include = [
          {
            model: ContratoCertificado,
            as: "contratos",
            where: {
              status: status,
            },
            required: true,
            attributes: [],
          },
        ];
      }

      const clientes = await Cliente.findAll(queryOptions);

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
            order: [["data_vencimento", "DESC"]],
            attributes: [
              "id",
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

      const dataLimite = new Date(hoje);
      dataLimite.setDate(hoje.getDate() + periodInDays);
      dataLimite.setHours(23, 59, 59, 999);
      const status_NaoIncluir = [
        "Cancelado",
        "Renovado",
        "Não vai renovar",
        "Agendado",
        "Em contato",
        "Ativo",
      ];
      const contratos = await ContratoCertificado.findAll({
        where: {
          data_vencimento: {
            [Op.between]: [hoje, dataLimite],
          },
          status: {
            [Op.notIn]: status_NaoIncluir,
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

        let diasRestantes;

        if (diasCalculados < 0) {
          diasRestantes = `Vencido há ${Math.abs(diasCalculados)} dias`;
        } else if (diasCalculados === 0) {
          diasRestantes = "Vence hoje";
        } else {
          diasRestantes = diasCalculados;
        }

        return {
          cliente: contrato.cliente,
          contrato_id: contrato.id,
          data_vencimento: contrato.data_vencimento,
          dias_restantes: diasRestantes,
        };
      });

      return res.json({ Contratos_criticos: contratosCriticos });
    } catch (e) {
      return errorHandler(e, res);
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
