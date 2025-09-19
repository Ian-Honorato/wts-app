// Importa a conexão e os modelos a partir do inicializador central
import {
  sequelize,
  Cliente,
  Parceiro,
  Certificado,
  ContratoCertificado,
  PagamentoCertificado,
  PagamentoParceiro,
} from "../Models/index.js";

import { Op } from "sequelize";

// Importando os tipos de erro específicos do Sequelize
import {
  ValidationError,
  UniqueConstraintError,
  ForeignKeyConstraintError,
} from "sequelize";

// ----------------------------------------------------------------------------
// FUNÇÕES AUXILIARES
// ----------------------------------------------------------------------------
import { errorHandler, handleError } from "../Util/errorHandler.js";

class PagamentoController {
  async index(req, res) {
    try {
      const { data_inicio, data_fim } = req.query;

      if (!data_inicio || !data_fim) {
        return res.json([]);
      }

      const parceiros = await Parceiro.findAll({
        attributes: ["id", "nome_escritorio"], // Seleciona apenas os campos que precisamos do parceiro
        include: {
          model: Cliente,
          as: "clientes_indicados",
          attributes: [], // Não precisamos dos dados do cliente na resposta final
          required: true, // Garante que só parceiros com clientes venham (INNER JOIN)
          include: {
            model: ContratoCertificado,
            as: "contratos",
            attributes: [], // Não precisamos dos dados do contrato na resposta final
            required: true, // Garante que só clientes com contratos venham (INNER JOIN)
            where: {
              // ANÁLISE: A data relevante aqui é a de RENOVAÇÃO, não de pagamento.
              // CORREÇÃO: Alterado para 'data_renovacao' e status 'Renovado'.
              status: "Renovado",
              data_renovacao: {
                [Op.between]: [new Date(data_inicio), new Date(data_fim)],
              },
            },
          },
        },
        // Agrupa pelo ID do parceiro para garantir que cada parceiro apareça apenas uma vez.
        group: ["Parceiro.id"],
      });

      return res.json(parceiros);
    } catch (err) {
      return errorHandler(err, res);
    }
  }

  async buscarPendentes(req, res) {
    try {
      const { parceiro_id, mes_referencia } = req.query;

      if (!parceiro_id || !mes_referencia) {
        return res
          .status(400)
          .json({ errors: ["Parceiro e mês de referência são obrigatórios."] });
      }

      const [ano, mes] = mes_referencia.split("-").map(Number);
      const inicioMes = new Date(ano, mes - 1, 1);
      const fimMes = new Date(ano, mes, 0, 23, 59, 59);

      console.log(
        "Buscando entre:",
        inicioMes.toISOString(),
        "e",
        fimMes.toISOString()
      );

      const contratosRenovados = await ContratoCertificado.findAll({
        where: {
          status: "Renovado",
          data_renovacao: { [Op.between]: [inicioMes, fimMes] },
        },
        // Correção: Um único array de 'include'
        include: [
          {
            model: Cliente,
            as: "cliente",
            required: true,
            include: [
              {
                model: Parceiro,
                as: "parceiro_indicador",
                required: true,
                where: { id: parceiro_id },
              },
            ],
          },
          {
            model: Certificado,
            as: "certificado",
            required: true,
          },
        ],
        order: [["data_renovacao", "ASC"]],
      });

      const detalheClientes = [];

      for (const contrato of contratosRenovados) {
        detalheClientes.push({
          cliente_nome: contrato.cliente.nome,
          numero_contrato: contrato.numero_contrato,
          data_renovacao: contrato.data_renovacao,
          certificado_nome: contrato.certificado.nome_certificado,
        });
      }

      return res.status(200).json(detalheClientes);
    } catch (err) {
      return errorHandler(err, res);
    }
  }

  async ConfirmarPagamento(req, res) {}

  async atualizarPagamento(req, res) {}

  async listarHistorico(req, res) {}
}

export default new PagamentoController();
