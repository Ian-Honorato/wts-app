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

// Valor base recebido por cada cliente/contrato para o cálculo da comissão
const VALOR_BASE_POR_CLIENTE = 100.0;

class PagamentoParceiroController {
  /**
   * Registra um novo pagamento para um parceiro, calculando o valor final.
   */
  async store(req, res) {
    try {
      const {
        parceiro_id,
        data_pagamento,
        quantidade_clientes,
        percentual_pagamento, // Ex: 7 para 7%
      } = req.body;

      // Validação dos dados de entrada
      if (
        !parceiro_id ||
        !data_pagamento ||
        !quantidade_clientes ||
        !percentual_pagamento
      ) {
        return res
          .status(400)
          .json({
            error:
              "Todos os campos são obrigatórios para registrar o pagamento.",
          });
      }

      // --- LÓGICA DE CÁLCULO ---
      const valorTotalBruto = quantidade_clientes * VALOR_BASE_POR_CLIENTE;
      const valorPagoCalculado = valorTotalBruto * (percentual_pagamento / 100);

      const novoPagamento = await PagamentoParceiro.create({
        parceiro_id,
        data_pagamento,
        valor_pago: valorPagoCalculado, // Usa o valor calculado
        quantidade_clientes,
        percentual_pagamento,
      });

      return res.status(201).json(novoPagamento);
    } catch (e) {
      return this._handleError(e, res);
    }
  }

  /**
   * Exibe um registro de pagamento específico.
   */
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
      return this._handleError(e, res);
    }
  }

  /**
   * Calcula a quantidade de contratos de um parceiro com base em filtros.
   * Útil para determinar o valor a ser pago.
   */
  async findByParceiro(req, res) {
    try {
      const { parceiroId } = req.params;
      const { data_inicio, data_final, status } = req.query;

      if (!data_inicio || !data_final) {
        return res
          .status(400)
          .json({
            error: "As datas de início e fim são obrigatórias para o filtro.",
          });
      }

      // 1. Encontrar todos os IDs dos clientes associados ao parceiro
      const clientesDoParceiro = await Cliente.findAll({
        where: { referencia_parceiro: parceiroId },
        attributes: ["id"], // Pega apenas os IDs para otimizar a consulta
      });

      if (clientesDoParceiro.length === 0) {
        return res.json({
          message: "Este parceiro não possui clientes.",
          quantidade_contratos: 0,
        });
      }

      // Extrai apenas os IDs para usar na próxima consulta
      const clienteIds = clientesDoParceiro.map((cliente) => cliente.id);

      // 2. Construir a cláusula de busca para os contratos
      const whereClause = {
        cliente_id: {
          [Op.in]: clienteIds,
        },
        // Filtra os contratos criados dentro do intervalo de datas
        created_at: {
          [Op.between]: [new Date(data_inicio), new Date(data_final)],
        },
      };

      // Adiciona o filtro de status apenas se ele for fornecido na query
      if (status) {
        // Permite múltiplos status separados por vírgula (ex: ?status=Ativo,Renovado)
        whereClause.status = {
          [Op.in]: status.split(","),
        };
      }

      // 3. Contar a quantidade de contratos que correspondem aos filtros
      const quantidadeContratos = await ContratoCertificado.count({
        where: whereClause,
      });

      return res.json({
        parceiro_id: parceiroId,
        filtros: { data_inicio, data_final, status: status || "Todos" },
        quantidade_contratos: quantidadeContratos,
      });
    } catch (e) {
      return this._handleError(e, res);
    }
  }

  //----------------------------------------------------------------------------
  // MÉTODO PRIVADO PARA CENTRALIZAR O TRATAMENTO DE ERROS
  //----------------------------------------------------------------------------

  _handleError(e, res) {
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
      return res.status(409).json({ error: "Erro de duplicidade." });
    }
    if (e instanceof ForeignKeyConstraintError) {
      return res.status(409).json({
        error: "Operação não permitida.",
        details: "O parceiro referenciado não existe.",
      });
    }
    console.error("Erro Inesperado no Servidor:", e);
    return res.status(500).json({
      error: "Ocorreu um erro inesperado no servidor.",
      details: process.env.NODE_ENV === "development" ? e.message : undefined,
    });
  }
}

export default new PagamentoParceiroController();
