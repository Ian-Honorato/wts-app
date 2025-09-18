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

      const mes = new Date(mes_referencia);
      const inicioMes = new Date(mes.getFullYear(), mes.getMonth(), 1);
      const fimMes = new Date(
        mes.getFullYear(),
        mes.getMonth() + 1,
        0,
        23,
        59,
        59
      );

      // --- PASSO 1: BUSCAR TUDO QUE FOI RENOVADO ---
      const contratosRenovados = await ContratoCertificado.findAll({
        attributes: [
          "referencia_certificado", // O ID do tipo de certificado
          // Conta quantas vezes cada tipo de certificado foi renovado
          [
            sequelize.fn("COUNT", sequelize.col("ContratoCertificado.id")),
            "total_renovado",
          ],
        ],
        include: [
          {
            model: Cliente,
            as: "cliente",
            attributes: [],
            where: { referencia_parceiro: parceiro_id },
          },
        ],
        where: {
          status: "Renovado",
          data_renovacao: { [Op.between]: [inicioMes, fimMes] },
        },
        group: ["referencia_certificado"],
        raw: true, // Retorna dados puros, mais fáceis de manipular
      });

      const renovacoesMap = new Map(
        contratosRenovados.map((item) => [
          item.referencia_certificado,
          parseInt(item.total_renovado, 10),
        ])
      );

      // --- PASSO 2: BUSCAR TUDO QUE JÁ FOI PAGO PARA ESSE MÊS ---
      const pagamentosFeitos = await PagamentoCertificado.findAll({
        attributes: [
          "tipo_certificado_id",
          [sequelize.fn("SUM", sequelize.col("quantidade")), "quantidade_paga"],
        ],
        include: [
          {
            model: PagamentoParceiro,
            as: "pagamento",
            attributes: [],
            where: {
              parceiro_id: parceiro_id,
              mes_referencia: inicioMes,
            },
          },
        ],
        group: ["tipo_certificado_id"],
        raw: true,
      });

      const pagosMap = new Map(
        pagamentosFeitos.map((item) => [
          item.tipo_certificado_id,
          parseInt(item.quantidade_paga, 10),
        ])
      );

      // --- PASSO 3: CALCULAR AS PENDÊNCIAS ---
      const pendencias = [];
      for (const [certId, totalRenovado] of renovacoesMap.entries()) {
        const quantidadePaga = pagosMap.get(certId) || 0;
        const quantidadePendente = totalRenovado - quantidadePaga;

        if (quantidadePendente > 0) {
          // Busca o nome do certificado para enriquecer a resposta
          const certificado = await Certificado.findByPk(certId);
          pendencias.push({
            tipo_certificado_id: certId,
            nome_certificado: certificado.nome_certificado,
            quantidade_pendente: quantidadePendente,
            // Valores que o frontend usará para preencher o formulário
            valor_un_sugerido: 150.0, // Lógica para buscar esse valor viria aqui
            percentual_sugerido: 0.07, // Lógica para buscar esse valor viria aqui
          });
        }
      }

      return res.json(pendencias);
    } catch (err) {
      return errorHandler(err, res);
    }
  }

  async ConfirmarPagamento(req, res) {}

  async atualizarPagamento(req, res) {}

  async listarHistorico(req, res) {}
}

export default new PagamentoController();
