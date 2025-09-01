import { Op } from "sequelize";
import PagamentoParceiro from "../Models/PagamentoParceiro.js";
import Cliente from "../Models/Cliente.js";
import ContratoCertificado from "../Models/ContratoCertificado.js";
import Parceiro from "../Models/Parceiro.js";

// Importando os tipos de erro específicos do Sequelize
import {
  ValidationError,
  UniqueConstraintError,
  ForeignKeyConstraintError,
} from "sequelize";

import { errorHandler } from "../Util/errorHandler.js";
// Valor base recebido por cada cliente/contrato para o cálculo da comissão
const VALOR_BASE_POR_CLIENTE = 100.0;

class PagamentoParceiroController {
  async store(req, res) {
    try {
      const {
        parceiro_id,
        data_pagamento,
        quantidade_clientes,
        percentual_pagamento,
      } = req.body;

      if (
        !parceiro_id ||
        !data_pagamento ||
        !quantidade_clientes ||
        !percentual_pagamento
      ) {
        return res.status(400).json({
          error: "Todos os campos são obrigatórios para registrar o pagamento.",
        });
      }

      // --- LÓGICA DE CÁLCULO ---
      const valorTotalBruto = quantidade_clientes * VALOR_BASE_POR_CLIENTE;
      const valorPagoCalculado = valorTotalBruto * (percentual_pagamento / 100);

      const novoPagamento = await PagamentoParceiro.create({
        parceiro_id,
        data_pagamento,
        valor_pago: valorPagoCalculado,
        quantidade_clientes,
        percentual_pagamento,
      });

      return res.status(201).json(novoPagamento);
    } catch (e) {
      return errorHandler(e, res);
    }
  }

  async show(req, res) {
    try {
      const { id } = req.params;
      const pagamento = await PagamentoParceiro.findByPk(id, {
        include: {
          model: Parceiro,
          as: "parceiro",
          attributes: ["nome_escritorio"],
        },
      });

      if (!pagamento) {
        return res
          .status(404)
          .json({ error: "Registro de pagamento não encontrado." });
      }

      return res.json(pagamento);
    } catch (e) {
      return errorHandler(e, res);
    }
  }

  async findByParceiro(req, res) {
    try {
      const { parceiroId } = req.params;
      const { data_inicio, data_final, status } = req.query;

      if (!data_inicio || !data_final) {
        return res.status(400).json({
          error: "As datas de início e fim são obrigatórias para o filtro.",
        });
      }

      const clientesDoParceiro = await Cliente.findAll({
        where: { referencia_parceiro: parceiroId },
        attributes: ["id"],
      });

      if (clientesDoParceiro.length === 0) {
        return res.json({
          message: "Este parceiro não possui clientes.",
          quantidade_contratos: 0,
        });
      }

      const clienteIds = clientesDoParceiro.map((cliente) => cliente.id);

      const whereClause = {
        cliente_id: {
          [Op.in]: clienteIds,
        },

        created_at: {
          [Op.between]: [new Date(data_inicio), new Date(data_final)],
        },
      };

      if (status) {
        whereClause.status = {
          [Op.in]: status.split(","),
        };
      }

      const quantidadeContratos = await ContratoCertificado.count({
        where: whereClause,
      });

      return res.json({
        parceiro_id: parceiroId,
        filtros: { data_inicio, data_final, status: status || "Todos" },
        quantidade_contratos: quantidadeContratos,
      });
    } catch (e) {
      return errorHandler(e, res);
    }
  }
}

export default new PagamentoParceiroController();
